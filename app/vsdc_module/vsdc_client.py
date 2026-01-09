import httpx
import os 
from typing import Dict, Any
from config import configuration
import asyncio
import logging

config = configuration()
config.load_config()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    filename=config.get("logging.file", "vsdc.log"),
    filemode = "a"
) 
logger = logging.getLogger("VSDCClient")

class VSDCClient:
    # Async client to communicate with VSDC middleware
    def __init__(self, base_url: str | None = None, security_key: str | None =None):
        self.base_url = base_url or config.get("app.baseUrl")
        self.security_key = security_key or config.get("VSDC_API_KEY")
        self.retry_attempts = config.get("defaults.retry_attemps", 3)
        
        self.headers = {
            "content-type": "application/json",
        }

        if self.security_key:
            self.headers["Authorization"] = f"Bearer {self.security_key}"

    async def _post(self, endpoint: str, data: Dict[str, Any]) -> dict: 
        url = f"{self.base_url}{endpoint}"
        attempt = 0
        while attempt < self.retry_attempts:
            try:
                logger.info(f"POST {url} | Payload: {data}")
                async with httpx.AsyncClient(timeout=config.get("api.timeout", 30)) as client:
                    response = await client.post(url, json=data, headers=self.headers)
                    response.raise_for_status()
                    logger.info(f"Response: {response.json()}")
                    return response.json()
            except httpx.HTTPError as e:
                logger.error(f"HTTPError on attempt {attempt + 1}: {e}")
                attempt += 1
                await asyncio.sleep(1)
            
        return {"Error": f"Failed to POST to {url} after {self.retry_attempts} attempts"}
