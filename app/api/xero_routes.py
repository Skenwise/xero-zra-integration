# necessary import 
import uuid, json
from urllib3.response import HTTPResponse

# core fastAPI import
from fastapi import HTTPException, Query, Response, Depends, APIRouter, Request
from fastapi.responses import RedirectResponse

# xero python SDK
from xero_python.api_client.oauth2 import OAuth2Token
from xero_python.api_client import ApiClient 
from xero_python.api_client.configuration import Configuration

# api calls
from xero_python.accounting import AccountingApi
from xero_python.identity import IdentityApi
from xero_python.exceptions import OAuth2InvalidGrantError

# import session
from app.core.session import get_session, SessionContext
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

# xero Oauth scope to define what is allowed
SCOPES = [
    "openid", "profile", "email",
    "accounting.transactions", "accounting.contacts", "offline_access",
]

# declaring our environment variable
CLIENT_ID = settings.XERO_CLIENT_ID
CLIENT_SECRET = settings.XERO_CLIENT_SECRET
REDIRECT_URI = settings.XERO_REDIRECT_URI

# helper function to initiate oauth2
def get_xero_api_client():
    if not CLIENT_ID or not CLIENT_SECRET or not REDIRECT_URI:
        raise HTTPException(
            status_code =  500,
                detail = "Xero API credentials (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI) must be set as environment variables."
        )
    oauth2_token_instance = OAuth2Token(
        client_id = CLIENT_ID,
        client_secret = CLIENT_SECRET
    )

    config = Configuration(
        oauth2_token = oauth2_token_instance,
    )

    return ApiClient(config)
# Login endpoint
@router.get("/login")
async def login(request: Request, session: SessionContext = Depends(get_session)):
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
    response.set_cookie(key="session_id", value=session.session_id, httponly=True)

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
    stored_state = await session.manager.get(session.session_id, "oauth_state")
    print(f"DEBUG: current session state: {stored_state}")

    # security check the state parameter
    print(f"DEBUG: This is the actual real state to compared to stored_state {state}")
    if stored_state is None or stored_state != state:
        raise HTTPException(
            status_code = 400,
            detail = "Invalid state parameter, Possible CSRF attack or session mismatch"
        )
    print(f"DEBUG: state check passed")
    
    # prepare the data for token exchange 
    token_exchange_data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    xero_api_client = get_xero_api_client()

    # Exchange authorization code with access and refresh token
    # Raw POST request using api_client.call_api
    # The URL is xero's Token endpoint

    try:
        token_response: HTTPResponse
        token_response, status_code, headers = xero_api_client.call_api( # type: ignore
            "https://identity.xero.com/connect/token",
            "POST",
            header_params= {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            post_params = token_exchange_data,
            auth_settings=None,
            _preload_content=False
        )

        if status_code != 200:
            error_detail = token_response.data.decode("utf-8")
            error_json = json.loads(error_detail)
            raise HTTPException (
                status_code = int(status_code),
                detail = f"Xero token exchange failed {error_json.get('error_description', error_json.get('error', 'Unknown error'))}"
            )
        
        print(f"DEBUG: Token exchange set successflly (status 200)")

        # decode and parse the JSON response from Xero
        token_data = json.loads(token_response.data.decode("utf-8"))
        print(f"DEBUG: token parsed data (keys only): {token_data.keys()}")

        # store the token in our session manager
        print("Your code didn't go to except")
        await session.manager.update_session(session.session_id, "token_set", token_data)

        # Update the ApiClient's OAuth2Token instance with access token and refresh token
        xero_api_client.configuration.oauth2_token.update_token(**token_data) # type: ignore
        print("DEBUG: ApiClient's OAuth2Token updated")

        # redirect to a success page Dashboard or Home page
        print(f"DEBUG: redirect to dashoard")
        response = RedirectResponse(url="/dashboard", status_code=307)
        response.set_cookie("session_id", value=session.session_id, httponly=True)
        return response
    
    except OAuth2InvalidGrantError as e:
        # Catch specific Xero OAuth erros
        print(f"DEBUG: OAuth2InvalidGrantError caught: {e.reason}")
        raise HTTPException(
            status_code=400,
            detail = f"Xero OAuth Error: Invalid Grant. Please try again. Detail: {e.reason}"
        )
    
    except Exception as e:
        # catch any unexpected error during the process
        print(f"DEBUG: Generic exception Exception caught in callback: {type(e).__name__}: {e}")
        raise HTTPException (
            status_code = 500,
            detail = f"An unexpected errors occured during Xero callback: {e}"
        )
    
# Dashboard endpoint
@router.get("/dashboard")
async def dashboard(session: SessionContext = Depends(get_session)):
    session_data = await session.manager.get_session(session.session_id)
    if session_data is not None:
        token_set = session_data.get("token_set")
    else:
        token_set = None
    if token_set:
        print("TOken set found in session")
        return {"message": "Successfully connected to Xero!", "token_status": "Tokens present", "access_token_start": token_set['access_token'][:10]+ '...'}
    else:
        print("TOken set not found in session")
        return {"message": "Not connected to Xero. Please visit/login."}    
