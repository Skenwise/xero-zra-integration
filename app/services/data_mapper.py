"""
Xero to ZRA Data Mapper
Pure transformation layer: Xero Invoice → ZRA Sales Transaction
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple, Any
import logging
import re
from datetime import datetime

from app.integrations.zra.schemas.zra_sales import ZraSalesRequestSchema, ZraSalesItemSchema
from app.services.tax_mapping import TAX_MAPPING, ZRA_TAX_CODES, DEFAULT_ZRA_CONFIG

logger = logging.getLogger(__name__)


class MappingNotFoundError(Exception):
    """Raised when a Xero line item code is not found in item mapping"""
    def __init__(self, invoice_number: str, item_code: str, description: str):
        self.invoice_number = invoice_number
        self.item_code = item_code
        self.description = description
        super().__init__(f"Item mapping not found for '{item_code}' in invoice {invoice_number}: {description}")


class InvalidXeroDataError(Exception):
    """Raised when Xero invoice data is invalid or missing required fields"""
    def __init__(self, invoice_number: str, field: str, detail: str):
        self.invoice_number = invoice_number
        self.field = field
        super().__init__(f"Invalid Xero data in invoice {invoice_number}: {field} - {detail}")


def _parse_xero_date(date_value: Optional[str]) -> Optional[str]:
    """Convert Xero date format (/Date(1744502400000+0000)/) to YYYYMMDD"""
    if not date_value:
        return None
    try:
        match = re.search(r'/Date\((\d+)(?:[+-]\d+)?\)/', date_value)
        if match:
            timestamp = int(match.group(1))
            dt = datetime.fromtimestamp(timestamp / 1000)
            return dt.strftime("%Y%m%d")
        return None
    except Exception as e:
        logger.warning(f"Failed to parse date {date_value}: {e}")
        return None


def _parse_xero_datetime(date_value: Optional[str]) -> Optional[str]:
    """Convert Xero date format to YYYYMMDDHHMMSS"""
    if not date_value:
        return None
    try:
        match = re.search(r'/Date\((\d+)(?:[+-]\d+)?\)/', date_value)
        if match:
            timestamp = int(match.group(1))
            dt = datetime.fromtimestamp(timestamp / 1000)
            return dt.strftime("%Y%m%d%H%M%S")
        return None
    except Exception as e:
        logger.warning(f"Failed to parse datetime {date_value}: {e}")
        return None


def _to_decimal(value: Any, default: Decimal = Decimal("0")) -> Decimal:
    """Safely convert any value to Decimal with 2 decimal places"""
    if value is None:
        return default
    try:
        return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    except (ValueError, TypeError):
        return default


def _to_int(value: Any, default: int = 0) -> int:
    """Safely convert any value to int, extracting numbers from strings like INV-0027"""
    if value is None:
        return default
    try:
        # If it's a string, try to extract numbers
        if isinstance(value, str):
            numbers = re.findall(r'\d+', value)
            if numbers:
                return int(numbers[-1])  # Return the last number found
        return int(float(str(value)))
    except (ValueError, TypeError):
        return default


def _get_tax_mapping(tax_type: str) -> Dict:
    """Get ZRA tax mapping for a Xero TaxType"""
    return TAX_MAPPING.get(tax_type, TAX_MAPPING["DEFAULT"])


def _is_valid_tpin(tpin: Optional[str]) -> bool:
    """Check if TPIN is valid (10 digits)"""
    if not tpin:
        return False
    s = str(tpin).strip()
    return s.isdigit() and len(s) == 10


def validate_invoice_for_submission(xero_invoice: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Quick validation before full mapping
    
    Returns:
        (is_valid, error_message)
    """
    invoice_number = xero_invoice.get("InvoiceNumber", "UNKNOWN")
    
    if xero_invoice.get("Status") != "AUTHORISED":
        return False, f"Invoice {invoice_number} is not AUTHORISED (status: {xero_invoice.get('Status')})"
    
    line_items = xero_invoice.get("LineItems", [])
    if not line_items:
        return False, f"Invoice {invoice_number} has no line items"
    
    total = _to_decimal(xero_invoice.get("Total", 0))
    if total <= 0:
        return False, f"Invoice {invoice_number} total is zero or negative"
    
    return True, None


def get_item_mapping_from_xero_items(xero_items: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Build item mapping dictionary from Xero Items endpoint
    
    Args:
        xero_items: List of items from Xero /Items endpoint
    
    Returns:
        Dict mapping Xero ItemCode → ZRA item metadata
    """
    mapping: Dict[str, Dict[str, Any]] = {}
    for item in xero_items:
        item_code = item.get("Code")
        if item_code:
            mapping[item_code] = {
                "itemCd": item_code,
                "itemClsCd": (item.get("PurchaseDescription", "") or "")[:10],
                "itemNm": item.get("Name", ""),
                "pkgUnitCd": "NT",
                "qtyUnitCd": "U",
                "pkg": Decimal("1"),
            }
    return mapping


def map_xero_to_zra_sales(
    xero_invoice: Dict[str, Any],
    zra_config: Optional[Dict[str, Any]] = None,
    item_mapping: Optional[Dict[str, Dict[str, Any]]] = None
) -> ZraSalesRequestSchema:
    """
    Transform Xero Invoice to ZRA Sales Transaction
    
    Args:
        xero_invoice: Raw Xero invoice from /invoices endpoint
        zra_config: Static org settings {tpin, bhfId, dvcSrlNo}
        item_mapping: Lookup table Xero ItemCode -> ZRA item metadata
    
    Returns:
        ZraSalesRequestSchema: Validated ZRA sales transaction
    
    Raises:
        MappingNotFoundError: When line item code not found in mapping
        InvalidXeroDataError: When required Xero fields are missing/invalid
    """
    
    if zra_config is None:
        zra_config = DEFAULT_ZRA_CONFIG
    if item_mapping is None:
        item_mapping = {}
    
    invoice_number = str(xero_invoice.get("InvoiceNumber", "UNKNOWN"))
    
    # 1. Validate Xero Invoice Status
    status = xero_invoice.get("Status")
    if status != "AUTHORISED":
        raise InvalidXeroDataError(
            invoice_number, "Status",
            f"Only AUTHORISED invoices can be submitted, got '{status}'"
        )
    
    # 2. Extract Header Data
    contact = xero_invoice.get("Contact", {})
    cust_tpin = contact.get("TaxNumber")
    cust_name = contact.get("Name")
    
    if cust_tpin and not _is_valid_tpin(cust_tpin):
        logger.warning(f"Invoice {invoice_number}: Customer TPIN '{cust_tpin}' is not valid 10-digit number")
        cust_tpin = None
    
    # 3. Process Line Items
    line_items = xero_invoice.get("LineItems", [])
    if not line_items:
        raise InvalidXeroDataError(invoice_number, "LineItems", "Invoice has no line items")
    
    # Initialize tax buckets
    tax_buckets: Dict[str, Dict[str, Decimal]] = {
        "A": {"taxblAmt": Decimal("0"), "taxAmt": Decimal("0"), "taxRt": Decimal("0")},
        "B": {"taxblAmt": Decimal("0"), "taxAmt": Decimal("0"), "taxRt": Decimal("0")},
        "C1": {"taxblAmt": Decimal("0"), "taxAmt": Decimal("0"), "taxRt": Decimal("0")},
        "C2": {"taxblAmt": Decimal("0"), "taxAmt": Decimal("0"), "taxRt": Decimal("0")},
        "C3": {"taxblAmt": Decimal("0"), "taxAmt": Decimal("0"), "taxRt": Decimal("0")},
        "D": {"taxblAmt": Decimal("0"), "taxAmt": Decimal("0"), "taxRt": Decimal("0")},
    }
    
    processed_items: List[ZraSalesItemSchema] = []
    total_taxable_amount = Decimal("0")
    total_tax_amount = Decimal("0")
    
    for idx, line in enumerate(line_items, start=1):
        xero_item_code = line.get("ItemCode", "") or ""
        xero_description = line.get("Description", "") or ""
        
        if not xero_item_code:
            xero_item_code = f"item_{idx}"
        
        zra_item = item_mapping.get(xero_item_code)
        if not zra_item:
            raise MappingNotFoundError(
                invoice_number,
                xero_item_code,
                xero_description
            )
        
        quantity = _to_decimal(line.get("Quantity", 1))
        unit_price = _to_decimal(line.get("UnitAmount", 0))
        line_amount = _to_decimal(line.get("LineAmount", 0))
        
        supply_amount = quantity * unit_price
        if supply_amount != line_amount:
            logger.debug(f"Supply amount {supply_amount} differs from LineAmount {line_amount}, using LineAmount")
            supply_amount = line_amount
        
        xero_tax_type = line.get("TaxType", "DEFAULT")
        tax_mapping = _get_tax_mapping(xero_tax_type)
        zra_tax_code = tax_mapping["code"]
        tax_rate = tax_mapping["rate"]
        
        tax_amount = (supply_amount * tax_rate / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total_amount = supply_amount + tax_amount
        
        if zra_tax_code in tax_buckets:
            tax_buckets[zra_tax_code]["taxblAmt"] += supply_amount
            tax_buckets[zra_tax_code]["taxAmt"] += tax_amount
            if tax_buckets[zra_tax_code]["taxRt"] == Decimal("0"):
                tax_buckets[zra_tax_code]["taxRt"] = tax_rate
        
        total_taxable_amount += supply_amount
        total_tax_amount += tax_amount
        
        processed_items.append(
            ZraSalesItemSchema(
                itemSeq=idx,
                itemCd=zra_item.get("itemCd", ""),
                itemClsCd=zra_item.get("itemClsCd"),
                itemNm=(xero_description[:200] if xero_description else zra_item.get("itemNm", "Unknown")),
                bcd=line.get("Barcode"),
                pkgUnitCd=zra_item.get("pkgUnitCd"),
                pkg=zra_item.get("pkg"),
                qtyUnitCd=zra_item.get("qtyUnitCd"),
                qty=quantity,
                prc=unit_price,
                splyAmt=supply_amount,
                dcRt=Decimal("0"),
                dcAmt=Decimal("0"),
                isrcCd=None,
                isrcNm=None,
                isrcRt=None,
                isrcAmt=None,
                taxTyCd=zra_tax_code,
                taxblAmt=supply_amount,
                taxAmt=tax_amount,
                totAmt=total_amount,
            )
        )
    
    # 4. Assemble Final ZRA Payload
    now = datetime.now()
    current_datetime = now.strftime("%Y%m%d%H%M%S")
    sales_date = _parse_xero_date(xero_invoice.get("Date")) or now.strftime("%Y%m%d")
    
    # Extract invoice number properly
    invc_no = _to_int(xero_invoice.get("InvoiceNumber"), 0)
    
    zra_request = ZraSalesRequestSchema(
        # Header
        tpin=zra_config.get("tpin", ""),
        bhfId=zra_config.get("bhfId", "000"),
        invcNo=invc_no,
        orgInvcNo=0,
        
        # Customer
        custTpin=cust_tpin,
        custNm=cust_name[:60] if cust_name else None,
        prcOrdCd=None,
        
        # Transaction
        salesTyCd="N",
        rcptTyCd="S",
        pmtTyCd=None,
        salesSttsCd="02",
        
        # Dates
        cfmDt=current_datetime,
        salesDt=sales_date,
        stockRlsDt=current_datetime,
        
        # Cancellation fields (all None)
        cnclReqDt=None,
        cnclDt=None,
        rfdDt=None,
        rfdRsnCd=None,
        
        # Item count
        totItemCnt=len(processed_items),
        
        # Tax buckets
        taxblAmtA=tax_buckets["A"]["taxblAmt"],
        taxblAmtB=tax_buckets["B"]["taxblAmt"],
        taxblAmtC1=tax_buckets["C1"]["taxblAmt"],
        taxblAmtC2=tax_buckets["C2"]["taxblAmt"],
        taxblAmtC3=tax_buckets["C3"]["taxblAmt"],
        taxblAmtD=tax_buckets["D"]["taxblAmt"],
        
        taxRtA=tax_buckets["A"]["taxRt"],
        taxRtB=tax_buckets["B"]["taxRt"],
        taxRtC1=tax_buckets["C1"]["taxRt"],
        taxRtC2=tax_buckets["C2"]["taxRt"],
        taxRtC3=tax_buckets["C3"]["taxRt"],
        taxRtD=tax_buckets["D"]["taxRt"],
        
        taxAmtA=tax_buckets["A"]["taxAmt"],
        taxAmtB=tax_buckets["B"]["taxAmt"],
        taxAmtC1=tax_buckets["C1"]["taxAmt"],
        taxAmtC2=tax_buckets["C2"]["taxAmt"],
        taxAmtC3=tax_buckets["C3"]["taxAmt"],
        taxAmtD=tax_buckets["D"]["taxAmt"],
        
        # Totals
        totTaxblAmt=total_taxable_amount,
        totTaxAmt=total_tax_amount,
        totAmt=total_taxable_amount + total_tax_amount,
        
        # Optional flags
        prchrAcptcYn="N",
        remark=None,
        
        # Registrant
        regrNm="System",
        regrId="SYSTEM",
        modrNm="System",
        modrId="SYSTEM",
        
        # Line items
        itemList=processed_items,
    )
    
    return zra_request