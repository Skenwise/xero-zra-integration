# necessary import
import uuid, json, base64
from urllib3.response import HTTPResponse
from typing import List, Dict, Any, Optional
import traceback
import urllib.parse
import httpx
from starlette.requests import Request


# core fastAPI import
from fastapi import HTTPException, Query, Response, Depends, APIRouter, Request, Header
from fastapi.responses import RedirectResponse, JSONResponse

# xero python SDK
from xero_python.api_client.oauth2 import OAuth2Token
from xero_python.api_client import ApiClient 
from xero_python.api_client.configuration import Configuration

# api calls
from xero_python.accounting import AccountingApi
from xero_python.identity import IdentityApi
from xero_python.exceptions import OAuth2InvalidGrantError

# import session
from app.core.session import get_session, SessionContext, create_session
from app.core.setting import CLIENT_ID, CLIENT_SECRET, REDIS_URL, REDIRECT_URI, FRONTEND_URL
from app.utils.xero_auth import CLIENT_ID, CLIENT_SECRET, SCOPES
from app.utils.xero_auth import get_xero_api_client, get_connections, get_access_token, fetch_tenant_id_data   
from app.services.xero_service import get_invoices, create_invoice, get_invoice_by_id, update_invoice, delete_invoice
from app.services.xero_service import create_contact, get_all_contacts, get_contact_by_id, update_contact, delete_contact
from app.services.xero_service import create_payment, get_all_payments, get_payment_by_id, delete_payment
from app.services.xero_service import create_credit_note, get_all_credit_notes, get_credit_note_by_id, update_credit_note, delete_credit_note
from app.services.xero_service import create_bank_transaction, get_all_bank_transactions, get_bank_transaction_by_id, update_bank_transaction, delete_bank_transaction
from app.services.xero_service import get_accounts, get_journal, get_report, get_identity, get_journal_by_id 
from app.utils.utility_function import api_endpoint_call

router = APIRouter()

# Login endpoint
@router.get("/login")
async def login(request: Request, session: SessionContext = Depends(create_session)):
    state = str(uuid.uuid4()) # generate unique ID for the login attempt

    await session.manager.set(session.session_id, "oauth_state", state)

    scope_string = " ".join(SCOPES)

    # construct the Xero authorization URL
    # URL Xero provides for initiating the OAuth 2.0 Code FLow

    authorization_url = (
        f"https://login.xero.com/identity/connect/authorize?"
        f"response_type=code&"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"scope={scope_string}&"
        f"state={state}"
    )
    print(f"DEBUG: Generated Xero Authorization URL: {authorization_url}")

    response = RedirectResponse(authorization_url)
    response.set_cookie(key="session_id", value=session.session_id, httponly=True, secure=True, samesite="lax")

    return response

@router.get("/")
async def read_root():
    return {"message": "Hello from FastAPI! Visit /login to connect to Xero."}

# Xero OAuth callback Endpoint
@router.get("/callback")
async def oauth_callback(
        request: Request,
        response: Response,
        code: str = Query(..., description="Authorization code from xero"),
        state: str = Query(..., description="state parameter for CSRF protection"),
        session: SessionContext = Depends(get_session)
):
    print(REDIRECT_URI)
    stored_state = await session.manager.get(session.session_id, "oauth_state")

    # security check the state parameter
    if stored_state is None or stored_state != state:
        raise HTTPException(
            status_code = 400,
            detail = "Invalid state parameter, Possible CSRF attack or session mismatch"
        )

    token_url="https://identity.xero.com/connect/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "scope": " ".join(SCOPES)
    }
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "kabert-zra-integration/1.0"
    }

    assert CLIENT_ID is not None and CLIENT_SECRET is not None

    try: 
        async with httpx.AsyncClient(timeout=30) as client:
            body = urllib.parse.urlencode(data)
            token_response = await client.post(
                token_url,
                content=body,
                auth=(CLIENT_ID, CLIENT_SECRET),
                headers = headers 
                )

        if token_response.status_code != 200:
            error_body = token_response.text
            try:
                error_json = token_response.json()
                error_msg = error_json.get('error_description', error_json.get('error', 'Unknown error'))
            except:
                error_msg = error_body

            raise HTTPException(
                status_code = token_response.status_code,
                detail=f"Xero token exchange failed ({token_response.status_code}): {error_msg}"
            )
        
        token_data = token_response.json()

        await session.manager.update_session(session.session_id, "token_set", token_data)
        await session.manager.update_session(session.session_id, "refresh_token", token_data["refresh_token"])

        xero_api_client = get_xero_api_client()
        if xero_api_client.configuration.oauth2_token is None:
            xero_api_client.configuration.oauth2_token = OAuth2Token(**token_data)
        else:
            xero_api_client.configuration.oauth2_token.update_token(**token_data)

        redirect_response = RedirectResponse(url="/dashboard", status_code=307)
        redirect_response.set_cookie("session_id", value=session.session_id, httponly=True,
                                    secure=True, samesite="none", max_age=3600
                                     )
        return redirect_response
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Network error during token exchange: {str(e)}")
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during Xero callback: {str(e)}"
        )

   
# Dashboard endpoint
@router.get("/dashboard")
async def dashboard(session: SessionContext = Depends(get_session)):
    session_data = await session.manager.get_session(session.session_id)
    if session_data is not None:
        token_set = session_data.get("token_set")
    else:
        token_set = None
    if token_set and FRONTEND_URL:
        print("TOken set found in session")
        return RedirectResponse(url=FRONTEND_URL)
    else:
        print("TOken set not found in session or frontend url problem")
        return {"message": "Not connected to Xero. Please visit/login."}    

#Xero API connection
@router.get("/xero/connections")
async def fetch_connections(session: SessionContext = Depends(get_session)):
    access_token = await get_access_token(session)

    try:
        connections = await get_connections(access_token)
        return {"connections": connections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#Xero Invoices API endpoints
@router.get("/xero/invoices")
async def fetch_xero_invoices(request: Request, session: SessionContext = Depends(get_session), status: Optional[str]=None):
    try:
        print("Incoming session_id: ", request.cookies.get("session_id"))
        return await get_invoices(session, status=status)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/xero/invoices")
async def create_invoice_endpoint(request: Request, session: SessionContext = Depends(get_session)):
    try:
        invoice_data = await request.json()
        return await create_invoice(session, invoice_data)
        
    except Exception as e:
        #raise HTTPException(status_code=500, detail=str(e))
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/xero/invoices/{invoice_id}")
async def get_invoice_by_id_endpoint(invoice_id: str, session: SessionContext = Depends(get_session)):
    return await  get_invoice_by_id(session, invoice_id)

@router.put("/xero/invoices/{invoice_id}")
async def update_invoice_endpoint(invoice_id: str, update_data: dict, request: Request, session: SessionContext = Depends(get_session)):
    try:
        update_data = await request.json()
        return await update_invoice(session, invoice_id, update_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/xero/invoices/{invoice_id}")
async def delete_invoice_endpoint(invoice_id: str,  session: SessionContext = Depends(get_session)):
    try:
        result = await delete_invoice(session, invoice_id)
        return result
    except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))

#Xero contact API endpoints   
@router.post("/xero/contacts")
async def create_contact_endpoint(request: Request, session: SessionContext = Depends(get_session)):
    try:
        contact_data = await request.json()
        result = await create_contact(session, contact_data)
        return result
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
    
@router.get("/xero/contacts")
async def get_all_contact_endoind(name: Optional[str]=None, session: SessionContext = Depends(get_session)):
    return await get_all_contacts(session, name)

@router.get("/xero/contacts/{contact_id}")
async def get_contact_by_id_endpoint(contact_id: str, session: SessionContext = Depends(get_session)):
    return await get_contact_by_id(session, contact_id)

@router.put("/xero/contacts/{contact_id}")
async def update_contact_endpoint( contact_id: str, request: Request, session: SessionContext=Depends(get_session)):
    try:
        update_data = await request.json()
        return await update_contact(session, contact_id, update_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/xero/contacts/{contact_id}")
async def delete_contact_endpoint(contact_id: str, session: SessionContext=Depends(get_session)):
    return await api_endpoint_call(delete_contact, session, contact_id)
    
# Xero payement API endppoint
@router.post("/xero/payments")
async def create_payment_endpoint(request: Request, session: SessionContext=Depends(get_session)):
    payment_data = await request.json()
    return await api_endpoint_call(create_payment, session, payment_data)

@router.get("/xero/payments")
async def get_all_payments_endpoints(session: SessionContext=Depends(get_session), invoice_id: Optional[str]=None):
    return await get_all_payments(session, invoice_id)

@router.get("/xero/payments/{payment_id}")
async def get_payment_by_id_endpoint(payment_id: str, session: SessionContext=Depends(get_session)):
    return await get_payment_by_id(session, payment_id)

@router.delete("/xero/payments/{payment_id}")
async def delete_payment_endpoint(payment_id: str, session: SessionContext=Depends(get_session)):
    return await api_endpoint_call(delete_payment, session, payment_id)

#Xero credit note API endpoint
@router.post("/xero/creditnotes")
async def create_credit_note_endpoint(request: Request, session: SessionContext=Depends(get_session)):
    credit_note_data = await request.json()
    return await api_endpoint_call(create_credit_note, session, credit_note_data)

@router.get("/xero/creditnotes")
async def get_all_credit_notes_endpoint(session: SessionContext=Depends(get_session), status: Optional[str]=None):
    return await get_all_credit_notes(session, status)

@router.get("/xero/creditnotes/{credit_note_id}")
async def get_credit_note_by_id_endpoint(credit_note_id: str, session: SessionContext=Depends(get_session)):
    return await get_credit_note_by_id(session, credit_note_id)

@router.put("/xero/creditnotes/{credit_note_id}")
async def update_credit_note_endpoint(credit_note_id: str, request: Request, session: SessionContext=Depends(get_session)):
    update_data = await request.json()
    return await api_endpoint_call(update_credit_note, session, credit_note_id, update_data)

@router.delete("/xero/creditnotes/{credit_note_id}")
async def delete_credit_note_endpoint(credit_note_id: str, session: SessionContext=Depends(get_session)):
    return await api_endpoint_call(delete_credit_note, session, credit_note_id)

# Xero bank transaction API endpoint
@router.post("/xero/banktransactions")
async def create_bank_transaction_endpoint(request: Request, session: SessionContext=Depends(get_session)):
    bank_transaction_data = await request.json()
    return await api_endpoint_call(create_bank_transaction, session, bank_transaction_data)

@router.get("/xero/banktransactions")
async def get_all_bank_transactions_endpoint(session: SessionContext=Depends(get_session), status: Optional[str]=None):
    return await get_all_bank_transactions(session, status)

@router.get("/xero/banktransactions/{bank_transaction_id}")
async def get_bank_transaction_by_id_endpoint(bank_transaction_id: str, session: SessionContext=Depends(get_session)):
    return await get_bank_transaction_by_id(session, bank_transaction_id)

@router.put("/xero/banktransactions/{bank_transaction_id}")
async def update_bank_transaction_endpoint(bank_transaction_id: str, request: Request, session: SessionContext=Depends(get_session)):
    updated_data = await request.json()
    return await api_endpoint_call(update_bank_transaction, session, bank_transaction_id, updated_data)

@router.delete("/xero/banktransactions/{bank_transaction_id}")
async def delete_bank_transaction_endpoint(bank_transaction_id: str, session: SessionContext=Depends(get_session)):
    return await api_endpoint_call(delete_bank_transaction, session, bank_transaction_id)

# Xero Account API Endpoint
@router.get("/xero/accounts")
async def get_account_endpoint(session: SessionContext=Depends(get_session), status: Optional[str]=None):
    return await get_accounts(session, status) 

# Xero journal API Endpoint
@router.get("/xero/journals")
async def get_journal_endpoint(session: SessionContext=Depends(get_session), offset: int = Query(0, description="Offset for paginated journal entries")):
    return await get_journal(session, offset) 

@router.get("/xero/journals/{journal_id}")
async def get_journal_by_id_endpoint(journal_id: str ,session: SessionContext=Depends(get_session)):
    try:
        return await get_journal_by_id(session, journal_id)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={'Error': str(e)})

# Xero report API endpoint
@router.get("/xero/reports/{report_type}")
async def get_report_endpoint(report_type: str, session: SessionContext=Depends(get_session), from_date: Optional[str]=None, to_date: Optional[str]=None):
    return await get_report(session, report_type, from_date, to_date) 

# Xero Identity API endpoint
@router.get("/xero/identity", tags=["Idenitty"])
async def identity_info(session: SessionContext=Depends(get_session)):
    try:
        return await get_identity(session)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
    
Authorization = "Basic <base64(870744B2D93E44E7AD93466EED2AF06C:TGdO5Ums6JVURWXyGL9cOjWilu7gHEe36HUxCBZ7hI0RfYdB)"