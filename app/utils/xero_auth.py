import json
import httpx

from app.core.session import get_session, SessionContext
from app.core.setting import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, FRONTEND_URL, REDIS_URL
# core fastAPI import
from fastapi import HTTPException, Query, Response, Depends, APIRouter, Request, Header
from fastapi.responses import RedirectResponse

# xero python SDK
from xero_python.api_client.oauth2 import OAuth2Token
from xero_python.api_client import ApiClient 
from xero_python.api_client.configuration import Configuration

from typing import Optional, List, Dict, Any

XERO_CONNECTIONS_URL = "https://api.xero.com/connections"

# xero Oauth scope to define what is allowed
SCOPES = [
    "openid", "profile", "email",
    "accounting.transactions", "accounting.contacts", "offline_access",
]

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

async def get_connections(access_token: str) -> List[Dict[str, Any]]:
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(XERO_CONNECTIONS_URL, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error fetching connections: {response.text}")

async def get_access_token(session: SessionContext):
    session_data = await session.manager.get_session(session.session_id)
    if not session_data:
        raise HTTPException(status_code=401, detail="No active session")
    
    token_set = session_data.get("token_set")
    if not token_set:
        raise HTTPException(status_code=401, detail="No token found. Please login again")
    
    access_token = token_set.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Invalid token data")
    
    return access_token

async def fetch_connections(session: SessionContext):
    access_token = await get_access_token(session)

    try:
        connections = await get_connections(access_token)
        return {"connections": connections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_tenant_id_data(session: SessionContext) -> Dict[str, Any]:
    connections = await fetch_connections(session)

    if not connections:
        raise HTTPException(status_code=401, detail="No Xero connection found")

    tenant = connections["connections"][0]

    # tenant_data
    tenant_data = {
        "tenant_id": tenant.get("tenantId"),
        "tenant_type": tenant.get("tenantType"),
        "tenant_name": tenant.get("tenantName")
    }

    return tenant_data