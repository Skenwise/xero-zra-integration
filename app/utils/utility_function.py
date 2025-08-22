import httpx
import traceback
from typing import Optional, Dict, Any
from fastapi import Depends, Request, HTTPException
from app.core.session import get_session, SessionContext
from app.utils.xero_auth import get_connections, get_access_token, fetch_tenant_id_data


XERO_BASE_URL = "https://api.xero.com/api.xro/2.0"
XERO_IDENTITY_URL = "https://api.xero.com/connections"

class Header_data():
    @staticmethod
    async def retrieve_access_token(session):
        access_token = await get_access_token(session)
        print(access_token)
        return access_token
    
    @staticmethod
    async def retrieve_tenant_id(session):
        tenant_data = await fetch_tenant_id_data(session)
        tenant_id = tenant_data["tenant_id"]
        return tenant_id

async def api_request(session: SessionContext, endpoint: str, http_action: str, filter: Optional[str]=None, data: Optional[dict]=None, params: Optional[dict[str, Any]]=None, base_url: Optional[str]=XERO_BASE_URL) -> Dict[str, Any]:
    access_token = await Header_data.retrieve_access_token(session)
    print(access_token)
    tenant_id = await Header_data.retrieve_tenant_id(session)

    url = f"{base_url}/{endpoint}"
    if filter:
        url += f"/{filter}"

    if base_url != XERO_BASE_URL:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-type": "application/json"
            }

    else:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Xero-tenant-id": tenant_id,
            "Accept": "application/json",
            "Content-type": "application/json"
        }

    async with httpx.AsyncClient() as client:
        response = await client.request(method=http_action.upper(), url=url, headers=headers, json=data, params=params)

    if response.status_code != 200 and response.status_code != 201:
        traceback.print_exc()
        raise HTTPException(status_code=response.status_code, detail=f"Xero API Error: {response.text}")
    return response.json()

async def api_endpoint_call(func, *args, **kwargs):
   try:
      return await func(*args, **kwargs)

   except Exception as e:
       raise HTTPException(status_code=500, detail=str(e)) 