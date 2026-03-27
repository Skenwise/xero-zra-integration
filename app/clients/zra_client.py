import httpx
import os
from typing import Dict, Any
import asyncio
import logging

# Lazy configuration loading to avoid circular imports
_config = None
_logger = None

def _get_config():
    global _config
    if _config is None:
        from app.config.zra_config import configuration
        _config = configuration()
        _config.load_config()
    return _config

def _get_logger():
    global _logger
    if _logger is None:
        config = _get_config()
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] %(message)s",
            filename=config.get("logging.file", "vsdc.log"),
            filemode="a"
        )
        _logger = logging.getLogger("VSDCClient")
    return _logger

class VSDCClient:
    # Async client to communicate with VSDC middleware
    def __init__(self, base_url: str | None = None, security_key: str | None = None):
        # prefer explicit args, then YAML `app.base_url`, then env `VSDC_BASE_URL`
        config = _get_config()
        self.base_url = base_url or config.get("app.base_url") or config.get("VSDC_BASE_URL")
        self.security_key = security_key or config.get("VSDC_API_KEY")
        self.retry_attempts = int(config.get("defaults.retry_attemps", 3))

        self.headers = {
            "content-type": "application/json",
        }

        if self.security_key:
            self.headers["Authorization"] = f"Bearer {self.security_key}"

    async def _post(self, endpoint: str, data: Dict[str, Any]) -> dict:
        if not self.base_url:
            raise RuntimeError("VSDC base URL is not configured")

        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        config = _get_config()
        logger = _get_logger()
        attempt = 0
        while attempt < self.retry_attempts:
            try:
                logger.info(f"POST {url} | Payload: {data}")
                async with httpx.AsyncClient(timeout=config.get("api.timeout", 30)) as http_client:
                    response = await http_client.post(url, json=data, headers=self.headers)
                    response.raise_for_status()
                    logger.info(f"Response: {response.json()}")
                    return response.json()
            except httpx.HTTPError as e:
                logger.error(f"HTTPError on attempt {attempt + 1}: {e}")
                attempt += 1
                await asyncio.sleep(1)

        return {"Error": f"Failed to POST to {url} after {self.retry_attempts} attempts"}
