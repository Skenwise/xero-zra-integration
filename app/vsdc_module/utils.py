from decimal import Decimal
from typing import Any, Dict, Optional
from datetime import datetime
import hashlib, json, uuid, logging, asyncio
from .client import client

async def init_device(tpin: str, bhfId: str, DvcSrlNo: str) -> dict:
    # wrapper for /initializer/selectInfo
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "DvcSrlNo": DvcSrlNo
    }
    return await client._post("/initializer/selectInfo", payload)

# Convert a VSDC date string to a datetime object
def parse_vsdc_date(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    return datetime.strptime(date_str, "%y-%m-%d %H:%M:%S")

# Convert a datetime object into vsdc date format
def format_vsdc_date(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    return dt.strftime("%y-%m-%d %H:%M:%S")

# Generate random UUID string
def generate_uuid(prefix: Optional[str]) -> str:
    uid = str(uuid.uuid4())
    return f"{prefix}_{uid}" if prefix else uid

# Generate a unique idempotency key for VSDC requests
def generate_idempotency_key(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex}"

# Normalize numeric value for vsdc
def normalize_amount(value: float | int | str, decimals: int = 2) -> str:
    try:
        number = float(str(value).replace(",", ""))
        return f"{number:.{decimals}f}"
    except (ValueError, TypeError):
        raise ValueError(f"cannot normalize value: {value}")
    
# Standardized logging for VSDC integration
def log_message(message: str, level: str = "info") -> None:
    logger = logging.getLogger("VSDC")
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", "%Y-%m-%d %H:%M:%S")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)

        level = level.lower()
        if level == "debug":
            logger.debug(message)
        elif level == "warning":
            logger.warning(message)
        elif level == "error":
            logger.error(message)
        else:
            logger.info(message)

# generate SHA256 for VSDC request signing
def generate_signature(payload: dict | str, secret: str) -> str:
    if isinstance(payload, dict):
        payload = json.dumps(payload, sort_keys=True)

    data = (payload + secret).encode("utf-8")
    return hashlib.sha256(data).hexdigest()

# convert python objects into VSDC-safe json
def safe_json(data: dict) -> str:
    def default(o):
        if isinstance(o, datetime):
            return o.strftime("%y-%m-%d %H:%M:%S")
        if isinstance(o, Decimal):
            return float(o)
        if isinstance(o, uuid.UUID):
            return str(o)
        return str(o)
    
    return json.dumps(data, default=default)

async def retry_async(func, attempts=3, delay=1, * args, **kwargs):
    for attempt in range(attempts):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            if attempt ==  attempts - 1:
                raise 
            await asyncio.sleep(delay)

