"""
ZRA Orchestrator Service
Ties together Xero data, ZRA config, item mappings, and submission logic
Includes Lazy Auto-Registration and Sequential Invoice Number Generation
"""

from typing import Dict, Any, Optional
import traceback
import httpx
import json
from decimal import Decimal

from app.services.data_mapper import map_xero_to_zra_sales, MappingNotFoundError, InvalidXeroDataError
from app.services.item_code_generator import generate_zra_item_code, generate_zra_item_code_from_description, get_tax_type_from_xero
from app.clients.zra_client import VSDCClient
from app.models.zra_models import (
    get_zra_config,
    get_item_mapping_dict,
    save_item_mapping,
    ItemMapping,
)
from app.services.xero_service import get_invoice_by_id
from app.core.session import SessionContext
from app.core.redis_client import _get_redis_client


class ZraSubmissionError(Exception):
    """Raised when ZRA submission fails"""
    pass


def _convert_decimals(obj):
    """Recursively convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        result = {}
        for k, v in obj.items():
            result[k] = _convert_decimals(v)
        return result
    elif isinstance(obj, list):
        return [_convert_decimals(item) for item in obj]
    return obj


async def get_next_zra_invoice_number(xero_tenant_id: str) -> int:
    """
    Get the next sequential invoice number for ZRA submission.
    Uses Redis atomic increment to ensure uniqueness and sequential order.
    
    Args:
        xero_tenant_id: The Xero tenant ID
        
    Returns:
        Next sequential invoice number (starts from 1)
    """
    redis = _get_redis_client()
    if redis is None:
        raise RuntimeError("Redis client not available for invoice sequence")
    
    key = f"zra_invoice_seq:{xero_tenant_id}"
    
    # Atomic increment - this handles first-time setup automatically
    # If key doesn't exist, redis.incr will set it to 1
    next_num = await redis.incr(key)
    
    print(f"📊 ZRA Invoice Sequence: {next_num - 1} -> {next_num}")
    return next_num


async def reset_zra_invoice_sequence(xero_tenant_id: str, start_from: int = 1) -> int:
    """
    Reset the ZRA invoice sequence for a tenant (for testing/admin purposes).
    
    Args:
        xero_tenant_id: The Xero tenant ID
        start_from: The number to start the sequence from (default 1)
        
    Returns:
        The new sequence value
    """
    redis = _get_redis_client()
    if redis is None:
        raise RuntimeError("Redis client not available for invoice sequence")
    
    key = f"zra_invoice_seq:{xero_tenant_id}"
    await redis.set(key, start_from - 1)  # Set to one less so next increment gives start_from
    next_num = await redis.incr(key)
    
    print(f"🔄 ZRA Invoice Sequence Reset to: {next_num}")
    return next_num


async def _ensure_item_registered(
    xero_tenant_id: str,
    xero_item_code: str,
    xero_item_name: str,
    xero_tax_type: str,
    line_description: str = "",
    line_index: int = 0
) -> str:
    """
    Lazy registration: ensures item exists in Redis and ZRA.
    If not registered, auto-generates code and registers with ZRA.
    
    Returns:
        The ZRA item code to use
    """
    if not xero_item_code:
        xero_item_code = f"item_{line_index}"
    
    existing_mapping = await ItemMapping.get(xero_tenant_id, xero_item_code)
    
    if existing_mapping:
        print(f"✅ Item already registered: {xero_item_code} -> {existing_mapping.zra_item_cd}")
        return existing_mapping.zra_item_cd
    
    if xero_item_code and xero_item_code != f"item_{line_index}":
        zra_item_cd = generate_zra_item_code(xero_item_code)
    else:
        zra_item_cd = generate_zra_item_code_from_description(line_description, line_index)
    
    zra_tax_cd = get_tax_type_from_xero(xero_tax_type)
    
    print(f"🆕 Auto-registering item: {xero_item_code} -> {zra_item_cd}")
    
    zra_config = await get_zra_config(xero_tenant_id)
    tpin = zra_config.zra_tpin if zra_config else "9999999999"
    bhf_id = zra_config.zra_bhf_id if zra_config else "000"
    
    register_payload = {
        "tpin": tpin,
        "bhfId": bhf_id,
        "itemCd": zra_item_cd,
        "itemClsCd": "5059690800",
        "itemTyCd": "2",
        "itemNm": xero_item_name or xero_item_code or line_description[:200],
        "orgnNatCd": "ZM",
        "pkgUnitCd": "NT",
        "qtyUnitCd": "U",
        "taxTyCd": zra_tax_cd,
        "dftPrc": 0,
        "useYn": "Y",
        "regrNm": "System",
        "regrId": "SYSTEM",
        "modrNm": "System",
        "modrId": "SYSTEM"
    }
    
    try:
        zra_client = VSDCClient()
        response = await zra_client._post("/items/saveItems", register_payload)
        
        if response.get("resultCd") == "000":
            item_mapping = ItemMapping(
                xero_tenant_id=xero_tenant_id,
                xero_item_code=xero_item_code,
                zra_item_cd=zra_item_cd,
                zra_item_cls_cd="5059690800",
                zra_qty_unit_cd="U",
                zra_pkg_unit_cd="NT",
                zra_tax_ty_cd=zra_tax_cd
            )
            await item_mapping.save()
            print(f"✅ Item registered and saved to Redis: {zra_item_cd}")
            return zra_item_cd
        else:
            print(f"⚠️ ZRA registration returned: {response}")
            return zra_item_cd
    except Exception as e:
        print(f"⚠️ Failed to register item with ZRA: {e}")
        return zra_item_cd


async def submit_xero_invoice_to_zra(
    xero_invoice_id: str,
    session: SessionContext
) -> Dict[str, Any]:
    """
    End-to-end submission with lazy auto-registration and sequential invoice numbers.
    """
    print(f"\n{'='*60}")
    print(f"📋 SUBMITTING INVOICE: {xero_invoice_id}")
    print(f"{'='*60}\n")
    
    try:
        token_set = await session.manager.get(session.session_id, "token_set")
        if not token_set:
            return {
                "success": False,
                "zra_receipt_no": None,
                "zra_integrity_data": None,
                "error": "Xero session not found. Please reconnect Xero."
            }
        
        xero_tenant_id = await session.manager.get(session.session_id, "tenant_id")
        if not xero_tenant_id:
            xero_tenant_id = token_set.get("tenant_id")
            if not xero_tenant_id:
                return {
                    "success": False,
                    "zra_receipt_no": None,
                    "zra_integrity_data": None,
                    "error": "Xero tenant ID not found. Please reconnect Xero."
                }
        
        zra_config = await get_zra_config(xero_tenant_id)
        if not zra_config:
            return {
                "success": False,
                "zra_receipt_no": None,
                "zra_integrity_data": None,
                "error": "ZRA configuration not found. Please configure TPIN and branch ID in settings."
            }
        
        # Fetch Xero invoice - response contains "Invoices" array
        xero_response = await get_invoice_by_id(session, xero_invoice_id)
        
        if not xero_response:
            return {
                "success": False,
                "zra_receipt_no": None,
                "zra_integrity_data": None,
                "error": f"Invoice {xero_invoice_id} not found in Xero"
            }
        
        # Extract invoice from the Invoices array
        invoices_list = xero_response.get("Invoices", [])
        if not invoices_list:
            return {
                "success": False,
                "zra_receipt_no": None,
                "zra_integrity_data": None,
                "error": f"Invoice {xero_invoice_id} not found in Xero"
            }
        
        xero_invoice = invoices_list[0]
        line_items = xero_invoice.get("LineItems", [])
        
        if not line_items:
            error_msg = f"Invoice {xero_invoice.get('InvoiceNumber', 'UNKNOWN')} has no line items. Please add items before submitting."
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "zra_receipt_no": None,
                "zra_integrity_data": None,
                "error": error_msg
            }
        
        print(f"📦 Processing {len(line_items)} line item(s):")
        for idx, line in enumerate(line_items, start=1):
            has_item_code = line.get("ItemCode")
            has_description = line.get("Description")
            if not has_item_code and not has_description:
                error_msg = f"Invoice {xero_invoice.get('InvoiceNumber', 'UNKNOWN')} line item {idx} has no ItemCode or Description."
                print(f"❌ {error_msg}")
                return {
                    "success": False,
                    "zra_receipt_no": None,
                    "zra_integrity_data": None,
                    "error": error_msg
                }
            print(f"   Line {idx}: ItemCode='{has_item_code or 'MISSING'}', Description='{(has_description or 'MISSING')[:50]}'")
        
        print(f"\n🔄 Running lazy registration for items...")
        
        item_mapping_dict = {}
        
        for idx, line in enumerate(line_items, start=1):
            xero_item_code = line.get("ItemCode", "") or ""
            xero_description = line.get("Description", "") or ""
            xero_item_name = line.get("ItemName", "") or xero_description[:100]
            xero_tax_type = line.get("TaxType", "NONE")
            
            item_key = xero_item_code if xero_item_code else f"item_{idx}"
            
            zra_item_cd = await _ensure_item_registered(
                xero_tenant_id=xero_tenant_id,
                xero_item_code=item_key,
                xero_item_name=xero_item_name,
                xero_tax_type=xero_tax_type,
                line_description=xero_description,
                line_index=idx
            )
            
            item_mapping_dict[item_key] = {
                "itemCd": zra_item_cd,
                "itemClsCd": "5059690800",
                "itemNm": xero_item_name,
                "pkgUnitCd": "NT",
                "qtyUnitCd": "U",
                "pkg": 1,
            }
        
        print(f"✅ All items registered and mapped")
        
        # Generate sequential ZRA invoice number (this is the CORRECT way)
        zra_invoice_no = await get_next_zra_invoice_number(xero_tenant_id)
        
        zra_config_dict = {
            "tpin": zra_config.zra_tpin,
            "bhfId": zra_config.zra_bhf_id,
            "dvcSrlNo": zra_config.zra_dvc_srl_no,
        }
        
        zra_payload = map_xero_to_zra_sales(
            xero_invoice=xero_invoice,
            zra_config=zra_config_dict,
            item_mapping=item_mapping_dict
        )
        
        # Override the invoice number with our sequential one
        payload_dict = zra_payload.model_dump()
        payload_dict["invcNo"] = zra_invoice_no
        
        # Convert Decimal to float for JSON serialization
        clean_payload = _convert_decimals(payload_dict)
        
        # Ensure clean_payload is a dict
        if not isinstance(clean_payload, dict):
            print(f"❌ ERROR: clean_payload is not a dict, it's {type(clean_payload)}")
            return {
                "success": False,
                "zra_receipt_no": None,
                "zra_integrity_data": None,
                "error": f"Payload conversion error: expected dict, got {type(clean_payload)}"
            }
        
        print(f"\n🔍 PAYLOAD TO ZRA:")
        print(json.dumps(clean_payload, indent=2, default=str))
        
        zra_client = VSDCClient()
        zra_response = await zra_client._post(
            endpoint="/trnsSales/saveSales",
            data=clean_payload
        )
        
        print(f"\n📥 ZRA RESPONSE: {zra_response}")
        
        result_cd = zra_response.get("resultCd", "")
        result_msg = zra_response.get("resultMsg", "")
        
        print(f"   resultCd: {result_cd}")
        print(f"   resultMsg: {result_msg}")
        
        if result_cd != "000":
            error_msg = zra_response.get("resultMsg", "Unknown ZRA error")
            print(f"❌ ZRA REJECTED: {result_cd} - {error_msg}")
            # If submission failed, we should decrement the sequence counter
            # to avoid gaps in the sequence
            redis = _get_redis_client()
            if redis:
                key = f"zra_invoice_seq:{xero_tenant_id}"
                await redis.decr(key)
                print(f"🔄 Reverted ZRA invoice sequence due to failure")
            return {
                "success": False,
                "zra_receipt_no": None,
                "zra_integrity_data": None,
                "error": f"ZRA submission failed ({result_cd}): {error_msg}"
            }
        
        response_data = zra_response.get("data", {})
        rcpt_no = response_data.get("rcptNo")
        intrl_data = response_data.get("intrlData")
        
        redis = _get_redis_client()
        if redis is not None:
            submission_record = {
                "xero_invoice_id": xero_invoice_id,
                "xero_tenant_id": xero_tenant_id,
                "zra_invoice_no": zra_invoice_no,
                "zra_receipt_no": str(rcpt_no) if rcpt_no else None,
                "zra_integrity_data": intrl_data,
                "submitted_at": response_data.get("vsdcRcptPbctDate", ""),
                "status": "submitted",
                "result_cd": result_cd
            }
            history_key = f"zra_submission:{xero_tenant_id}:{xero_invoice_id}"
            await redis.set(history_key, json.dumps(submission_record))
        
        print(f"\n✅ INVOICE SUBMITTED SUCCESSFULLY!")
        print(f"   ZRA Invoice No: {zra_invoice_no}")
        print(f"   Receipt No: {rcpt_no}")
        print(f"   Integrity Data: {intrl_data}\n")
        
        return {
            "success": True,
            "zra_invoice_no": zra_invoice_no,
            "zra_receipt_no": str(rcpt_no) if rcpt_no else None,
            "zra_integrity_data": intrl_data,
            "error": None
        }
    
    except MappingNotFoundError as e:
        print(f"❌ MappingNotFoundError: {e}")
        return {
            "success": False,
            "zra_receipt_no": None,
            "zra_integrity_data": None,
            "error": f"Item mapping error: {str(e)}"
        }
    
    except InvalidXeroDataError as e:
        print(f"❌ InvalidXeroDataError: {e}")
        return {
            "success": False,
            "zra_receipt_no": None,
            "zra_integrity_data": None,
            "error": f"Invalid Xero data: {str(e)}"
        }
    
    except httpx.HTTPStatusError as e:
        status = e.response.status_code if hasattr(e, 'response') else 500
        print(f"❌ HTTPStatusError: {status} - {e}")
        return {
            "success": False,
            "zra_receipt_no": None,
            "zra_integrity_data": None,
            "error": f"Xero API error ({status}): {str(e)}"
        }
    
    except httpx.RequestError as e:
        print(f"❌ RequestError: {e}")
        return {
            "success": False,
            "zra_receipt_no": None,
            "zra_integrity_data": None,
            "error": f"ZRA connection error: {str(e)}"
        }
    
    except Exception as e:
        traceback.print_exc()
        print(f"\n❌ SUBMISSION FAILED: {type(e).__name__}: {str(e)}\n")
        return {
            "success": False,
            "zra_receipt_no": None,
            "zra_integrity_data": None,
            "error": f"Submission failed: {type(e).__name__}: {str(e)}"
        }


async def get_submission_history(
    xero_tenant_id: str,
    xero_invoice_id: Optional[str] = None
) -> Dict[str, Any]:
    """Retrieve ZRA submission history from Redis."""
    redis = _get_redis_client()
    if redis is None:
        return {"found": False, "data": None, "error": "Redis unavailable"}
    
    if xero_invoice_id:
        key = f"zra_submission:{xero_tenant_id}:{xero_invoice_id}"
        raw = await redis.get(key)
        if raw is None:
            return {"found": False, "data": None}
        
        if isinstance(raw, bytes):
            raw = raw.decode()
        data = json.loads(raw)
        return {"found": True, "data": data}
    
    else:
        submissions = []
        pattern = f"zra_submission:{xero_tenant_id}:*"
        cursor = 0
        
        while True:
            cursor, keys = await redis.scan(cursor, match=pattern, count=100)
            for key in keys:
                if isinstance(key, bytes):
                    key = key.decode()
                raw = await redis.get(key)
                if raw:
                    if isinstance(raw, bytes):
                        raw = raw.decode()
                    data = json.loads(raw)
                    submissions.append(data)
            if cursor == 0:
                break
        
        return {"found": True, "data": submissions, "count": len(submissions)}