import httpx
from typing import Optional, Dict, Any
from fastapi import Depends, Request, HTTPException
from app.core.session import get_session, SessionContext
from app.utils.xero_auth import get_connections, get_access_token, fetch_tenant_id_data


XERO_BASE_URL = "https://api.xero.com/api.xro/2.0"

class Header_data():
    @staticmethod
    async def retrieve_access_token(session):
        access_token = await get_access_token(session)
        return access_token
    
    @staticmethod
    async def retrieve_tenant_id(session):
        tenant_data = await fetch_tenant_id_data(session)
        tenant_id = tenant_data["tenant_id"]
        return tenant_id

async def api_request(session: SessionContext, endpoint: str, http_action: str, filter: Optional[str]=None, data: Optional[dict]=None, params: Optional[dict[str, Any]]=None) -> Dict[str, Any]:
    access_token = await Header_data.retrieve_access_token(session)
    tenant_id = await Header_data.retrieve_tenant_id(session)

    url = f"{XERO_BASE_URL}/{endpoint}"
    if filter:
        url += f"/{filter}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Xero-tenant-id": tenant_id,
        "Accept": "application/json",
        "Content-type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.request(method=http_action.upper(), url=url, headers=headers, json=data, params=params)

    if response.status_code != 200 and response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=f"Xero API Error: {response.text}")
    
    return response.json()

async def api_endpoint_call(func, *args, **kwargs):
   try:
      return await func(*args, **kwargs)

   except Exception as e:
       raise HTTPException(status_code=500, detail=str(e)) 