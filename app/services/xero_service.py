from typing import Optional, Dict, Any
from app.core.session import SessionContext
from app.utils.utility_function import api_request, XERO_IDENTITY_URL

#invoice helper function
async def get_invoices(session: SessionContext, status: Optional[str] = None):
    params = {"statuses": status} if status else None
    return await api_request(session, "invoices", "get", None, None, params)

async def create_invoice(session: SessionContext, invoice_data: dict):
  return await api_request(session, "invoices", "post", None, invoice_data)
 
async def get_invoice_by_id(session: SessionContext, invoice_id: str):
    return await api_request(session, "invoices", "get", invoice_id)

async def update_invoice(session: SessionContext, invoice_id: str, update_data: dict):
    return await api_request(session, "invoices", "put", invoice_id, update_data)

async def delete_invoice(session: SessionContext, invoice_id: str):
    payload = {
        "Invoices": [
            {
                "InvoiceID": invoice_id,
                "status": "VOIDED"
            }
        ]
    }

    return await api_request(session, "invoices", "post", None, payload)

# contact helper function
async def create_contact(session: SessionContext, contact_data: dict):
    return await api_request(session, "contacts", "post", None, contact_data)

async def get_all_contacts(session: SessionContext, name: Optional[str]=None):
    params = {"where": f'Name=="{name}"'} if name else None
    return await api_request(session, "contacts", "get", params=params)

async def get_contact_by_id(session: SessionContext, contact_id: str):
    return await api_request(session, "contact", "get", contact_id)

async def update_contact(session: SessionContext, contact_id: str, update_data: dict):
    return await api_request(session, "contacts", "put", contact_id, update_data)

async def delete_contact(session: SessionContext, contact_id: str):
    payload = {
        "Contacts": [
            {
            "ContactID": contact_id,
            "ContactStatus": "ARCHIVED"
            }
        ]
    }

    return await api_request(session, "contacts", "post", contact_id, payload)

# payment helper function
async def create_payment(session: SessionContext, payment_data: dict):
    return await api_request(session, "payments", "post", data=payment_data)

async def get_all_payments(session: SessionContext, invoice_id: Optional[str]=None):
    params = {"where": f"Invoice.InvoiceID==Guid(\"{invoice_id}\")"} if invoice_id else None
    return await api_request(session, "payments", "get", params=params)

async def get_payment_by_id(session: SessionContext, payment_id: str):
    return await api_request(session, "payments", "get", payment_id)

async def delete_payment(session: SessionContext, payment_id: str):
    payload = {
        "Payments": [
            {
                "PaymentID": payment_id,
                "Status": "DELETED"
            }
        ]
    }

    return await api_request(session, "payments", "post", payment_id, payload)

# credits notes helper function
async def create_credit_note(session: SessionContext, credit_note_data: dict):
    return await api_request(session, "creditnotes", "post", data=credit_note_data)

async def get_all_credit_notes(session: SessionContext, status: Optional[str]=None):
    params = {"Statuses": status} if status else None
    return await api_request(session, "creditnotes", "get", params=params)

async def get_credit_note_by_id(session: SessionContext, credit_note_id: str):
    return await api_request(session, "creditnotes", "get", credit_note_id)

async def update_credit_note(session: SessionContext, credit_note_id: str, update_data: dict):
    return await api_request(session, "creditnotes", "put", credit_note_id, update_data)

async def delete_credit_note(session: SessionContext, credit_note_id: str):
    payload = {
        "CreditNotes": [
            {
                "CreditNoteID": credit_note_id,
                "Status": "VOIDED"
            }
        ]
    }

    return await api_request(session, "creditnotes", "post", credit_note_id, payload)

# bank transaction helper function
async def create_bank_transaction(session: SessionContext, bank_transaction_data: dict):
    return await api_request(session, "banktransactions", "post", data=bank_transaction_data)

async def get_all_bank_transactions(session: SessionContext, status: Optional[str]=None):
    params = {"Status": status} if status else None
    return await api_request(session, "banktransactions", "get", params=params)

async def get_bank_transaction_by_id(session: SessionContext, bank_transaction_id: str):
    return await api_request(session, "banktransactions", "get", bank_transaction_id)

async def update_bank_transaction(session: SessionContext, bank_transaction_id: str, update_data: dict):
    return await api_request(session, "banktransactions", "put", bank_transaction_id, update_data)

async def delete_bank_transaction(session: SessionContext, bank_transaction_id: str):
    payload = {
        "BankTransactions": [
            {
                "BankTransactionID": bank_transaction_id,
                "Status": "DELETED"
            }
        ]
    }

    return await api_request(session, "banktransactions", "post", bank_transaction_id, payload)

# account helper function
async def get_accounts(session: SessionContext, status: Optional[str]=None):
    params = {"Statuses": status} if status else None
    return await api_request(session, "accounts", "get", params=params)

# journal helper function
async def get_journal(session: SessionContext, offset: int=0) -> dict:
    params = {"offset": offset}
    return await api_request(session, "journals", "get", params=params)

async def get_journal_by_id(session: SessionContext, journal_id: str):
    return await api_request(session, 'journals', "get", journal_id)

# report helper function
async def get_report(session: SessionContext, report_type: str, from_date: Optional[str]=None, to_date: Optional[str]=None):
    params = {}
    if from_date:
        params["fromDate"] = from_date
    if to_date:
        params["toDate"] = to_date 

    return await api_request(session, "reports", "get", report_type, params=params)   

# identityAPI function
async def get_identity(session: SessionContext) -> dict:
    return await api_request(session, "Connections", "get", base_url=XERO_IDENTITY_URL)

# items helper function
async def get_items(session: SessionContext) -> dict:
    """
    Fetch all items from Xero API
    Returns cleaned items list with Code, Name, Description, TaxType
    """
    return await api_request(session, "items", "get")