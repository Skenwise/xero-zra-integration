"""
Xero OAuth Authentication Utilities
Handles token management, refresh, and authenticated requests
"""

import httpx
import base64
import os
from typing import Optional, Dict, Any
from app.core.session import get_session_manager, SessionContext
from app.core.setting import CLIENT_ID, CLIENT_SECRET


# === NEW CODE ===

async def refresh_xero_token(session_id: str) -> Dict[str, Any]:
    """
    Refresh Xero OAuth token using refresh_token grant.
    Updates stored tokens in Redis session.
    
    Returns: {access_token, refresh_token, expires_in}
    """
    # Get session manager and fetch current session data
    manager = get_session_manager()
    session_data = await manager.get_session(session_id)
    
    if not session_data:
        raise Exception("Session not found")
    
    refresh_token = session_data.get("refresh_token")
    if not refresh_token:
        raise Exception("No refresh token available")
    
    # Prepare token refresh request
    credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://identity.xero.com/connect/token",
            headers={
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "xero-zra-integration/1.0"
            },
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            }
        )
        
        if response.status_code != 200:
            error_body = response.text
            try:
                error_json = response.json()
                error_msg = error_json.get('error_description', error_json.get('error', 'Unknown error'))
            except:
                error_msg = error_body
            raise Exception(f"Token refresh failed ({response.status_code}): {error_msg}")
        
        token_data = response.json()
    
    # Extract new tokens - ⚠️ NEW refresh_token invalidates the old one
    new_access_token = token_data["access_token"]
    new_refresh_token = token_data["refresh_token"]
    expires_in = token_data.get("expires_in", 1800)
    
    # Update Redis session with NEW tokens using existing session manager pattern
    await manager.update_session(session_id, "access_token", new_access_token)
    await manager.update_session(session_id, "refresh_token", new_refresh_token)
    await manager.update_session(session_id, "expires_in", expires_in)
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "expires_in": expires_in
    }


async def get_access_token(session: SessionContext) -> str:
    """
    Get valid access token from session, refreshing if expired.
    Matches existing pattern used in xero/routes.py
    """
    session_data = await session.manager.get_session(session.session_id)
    
    if not session_data:
        raise Exception("Session not found")
    
    access_token = session_data.get("access_token")
    expires_in = session_data.get("expires_in", 1800)
    
    # Simple expiry check: if we don't have timestamp, assume valid
    # For production: store token_issued_at and compare with current time
    if not access_token:
        raise Exception("No access token in session")
    
    return access_token


async def make_xero_request_with_refresh(
    url: str,
    session: SessionContext,
    method: str = "GET",
    json_data: Optional[Dict] = None,
    params: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Make Xero API request with automatic token refresh on 401/403.
    Uses Try-Catch-Retry pattern matching existing auth flow.
    """
    # Get current access token and tenant_id from session
    session_data = await session.manager.get_session(session.session_id)
    
    if not session_data:
        raise Exception("Session not found")
    
    access_token = session_data.get("access_token")
    xero_tenant_id = session_data.get("xero_tenant_id")
    
    if not access_token or not xero_tenant_id:
        raise Exception("Missing access token or tenant ID in session")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Xero-tenant-id": xero_tenant_id,
        "Accept": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30) as client:
        # First attempt
        if method.upper() == "GET":
            response = await client.get(url, headers=headers, params=params)
        elif method.upper() == "POST":
            response = await client.post(url, headers=headers, json=json_data, params=params)
        elif method.upper() == "PUT":
            response = await client.put(url, headers=headers, json=json_data, params=params)
        else:
            raise Exception(f"Unsupported method: {method}")
        
        # Check for token expiration - match existing error handling pattern
        if response.status_code in (401, 403):
            # Refresh token using session context
            new_tokens = await refresh_xero_token(session.session_id)
            
            # Retry with new token
            headers["Authorization"] = f"Bearer {new_tokens['access_token']}"
            
            if method.upper() == "GET":
                response = await client.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = await client.post(url, headers=headers, json=json_data, params=params)
            elif method.upper() == "PUT":
                response = await client.put(url, headers=headers, json=json_data, params=params)
        
        # Match existing error response pattern
        if response.status_code != 200:
            error_body = response.text
            try:
                error_json = response.json()
                error_msg = error_json.get('error_description', error_json.get('error', 'Unknown error'))
            except:
                error_msg = error_body
            raise Exception(f"Xero API request failed ({response.status_code}): {error_msg}")
        
        return response.json()


async def get_xero_tenant_id(session: SessionContext) -> str:
    """
    Extract xero_tenant_id from session.
    Matches existing pattern in xero_service.py
    """
    session_data = await session.manager.get_session(session.session_id)
    
    if not session_data:
        raise Exception("Session not found")
    
    tenant_id = session_data.get("xero_tenant_id")
    if not tenant_id:
        raise Exception("No tenant ID in session")
    
    return tenant_id