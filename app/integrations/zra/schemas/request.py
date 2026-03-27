from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

# Base class
class FoundationBase(BaseModel):
    tpin: str
    bhfId: str
    lastReqDt: str

# Information class
class InformationBase(FoundationBase):
    useYn: str
    remark: Optional[str] = None
    adrs: Optional[str] = None
    regrNm: str
    regrId: str
    modrNm: str
    modrId: str

# TransactionDetail class
class TransactionDetailsBase(InformationBase):
    rcptTyCd: str
    pmtTyCd: Optional[str] = None
    cfmDt: datetime
    cnclDt: Optional[datetime] = None
    cnclReqDt: Optional[datetime] = None
    rfdDt: Optional[datetime] = None
    rfdRsnCd: Optional[str] = None
    totItemCnt: int
    taxblAmtA: float
    taxblAmtB: float
    taxblAmtC: float
    taxblAmtD: float
    taxRtA: float
    taxRtB: float
    taxRtC: float
    taxRtD: float
    taxAmtA: float
    taxAmtB: float
    taxAmtC: float
    taxAmtD: float
    totTaxblAmt: float
    totTaxAmt: float
    totAmt: float
    prchrAcptcYn: str
    itemSeq: int
    itemNm: str
    itemCd: str
    itemClsCd: Optional[str] = None
    bcd: Optional[str] = None
    pkgUnitCd: str
    qtyUnitCd: str
    pkg: float
    qty: float
    prc: float
    taxTyCd: str
    taxblAmt: float
    itemExprDt: Optional[datetime] = None

# =============================
# Device Schema
# =============================
class DeviceSchema(FoundationBase):
    DvcSrlNo: str
    lastReqDt: datetime

# =============================
# Code Schema
# =============================
class CodeSchema(FoundationBase):
    lastReqDt: datetime

# =============================
# Item Classification Schema
# =============================
class ItemClassificationSchema(FoundationBase):
    lastReqDt: datetime

# =============================
# Notice Schema
# =============================
class NoticeSchema(FoundationBase):
    lastReqDt: datetime

# =============================
# Customer Schema
# =============================
class CustomerSchema(FoundationBase):
    custmTin: str

# =============================
# Branch Schema
# =============================
class BranchSchema(FoundationBase):
    bhfId: str
    lastReqDt: datetime

# =============================
# Branch Customer Schema
# =============================
class BranchCustomerSchema(InformationBase):
    custNo: str
    custTpin: str
    custNm: str
    telNo: Optional[str] = None
    email: Optional[str] = None
    faxNo: Optional[str] = None

# =============================
# User Account Schema
# =============================
class UserAccountSchema(InformationBase):
    userID: Optional[str] = None
    userNm: Optional[str] = None
    pwd: Optional[str] = None
    cntc: Optional[str] = None
    authCd: Optional[str] = None

# =============================
# Item Schema
# =============================
class ItemSchema(InformationBase):
    itemClsCd: str
    itemCd: str
    itemTyCd: str
    itemNm: str
    itemStdNm: Optional[str] = None
    orgnNatCd: str
    pkgUnitCd: str
    qtyUnitCd: str
    taxTyCd: str
    btchNo: Optional[str] = None
    bcd: Optional[str] = None
    dftPrc: float
    grpPrcL1: Optional[float] = None
    grpPrcL2: Optional[float] = None
    grpPrcL3: Optional[float] = None
    grpPrcL4: Optional[float] = None
    grpPrcL5: Optional[float] = None
    addInfo: Optional[str] = None
    sftyQty: Optional[str] = None
    isrcAplcbYn: Optional[str] = None

# =============================
# Import Item Schema
# =============================
class ImportItemSchema(InformationBase):
    taskCd: str
    dclDe: str
    itemSeq: int
    hsCd: str
    itemClCd: str
    itemCd: str
    imptItemsttsCd: str
    regrNm: Optional[str] = None
    regrId: Optional[str] = None

# =============================
# Sales Transaction Schema
# =============================
class SalesTransactionSchema(TransactionDetailsBase):
    invcNo: int
    orgInvcNo: int
    custTpin: Optional[str] = None
    prcOrdCd: str
    custNm: Optional[str] = None
    SalesTyCd: str
    SalesSttsCd: str
    SalesDt: datetime
    stockRlsDt: datetime
    custTIn: Optional[str] = None
    custMblNo: Optional[str] = None
    rptNo: int
    trdeNm: Optional[str] = None
    topMsg: Optional[str] = None
    btmMsg: Optional[str] = None
    splyAmt: float
    dcRt: float
    dcAmt: float
    isrccCd: Optional[str] = None
    isrccNm: Optional[str] = None
    isrcRt: Optional[float] = None
    isrcAmt: Optional[float] = None

# =============================
# Purchase Transaction Schema
# =============================
class PurchaseTransactionSchema(TransactionDetailsBase):
    spplrTin: Optional[str] = None
    invcNo: int
    orgInvcNo: int
    spplrBhfId: Optional[str] = None
    spplrNm: Optional[str] = None
    spplrInvcNo: Optional[int] = None
    spplrSdcID: Optional[str] = None
    regTyCd: str
    pchsTyCd: str
    pmtTyCd: Optional[str] = None
    pchsSttsCd: str
    pchsDt: datetime
    wrhsDt: Optional[datetime] = None
    spplrItemClsCd: Optional[str] = None
    spplrItemCd: Optional[str] = None
    spplrItemNm: Optional[str] = None
    splyAmt: float
    dcRt: float
    dcAmt: float
    taxAmt: float

# =============================
# Stock Schema
# =============================
class StockSchema(TransactionDetailsBase):
    sarNo: int
    orgSarNo: int
    regTyCd: str
    custTpin: Optional[str] = None
    custNm: Optional[str] = None
    custBhfID: Optional[str] = None
    sarTyCd: str
    ocrnDt: datetime
    splyAmt: float
    totDcAmt: float
    taxAmt: float

# =============================
# Stock Master Schema
# =============================
class StockMasterSchema(InformationBase):
    itemCd: str
    rsdQty: float

# =============================
# Status Schema
# =============================
# Standardized status schema for various API responses.
class StatusSchema(BaseModel):
    status_code: str
    status_message: str
    timestamp: datetime

# =============================
# Validator Helpers
# =============================
# Common validators for shared fields like dates, TPIN, emails, etc.
class Validators:
    @staticmethod
    def validate_tpin(tpin: str) -> str:
        """Validate that TPIN follows a proper format."""
        if len(tpin) != 10 or not tpin.isdigit():
            raise ValueError("TPIN must be a 10-digit number")
        return tpin

    @staticmethod
    def validate_email(email: Optional[str]) -> Optional[str]:
        """Validate email format if provided."""
        if email and "@" not in email:
            raise ValueError("Invalid email address")
        return email

    @staticmethod
    def validate_date(date_str: str) -> datetime:
        """Convert string to datetime, raise error if invalid."""
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Invalid date format, expected YYYY-MM-DD, got {date_str}")

# =============================
# Extra Logic / Helper Functions
# =============================
# Reusable logic for nested or aggregate schema handling
class SchemaHelpers:
    @staticmethod
    def aggregate_totals(items: List[dict], field: str) -> float:
        """Sum a numeric field across a list of dicts/items."""
        return sum(item.get(field, 0) for item in items)

    @staticmethod
    def filter_active_items(items: List[BaseModel], active_field: str = "useYn") -> List[BaseModel]:
        """Return only items marked as active ('Y')"""
        return [item for item in items if getattr(item, active_field, "N") == "Y"]

    @staticmethod
    def find_by_code(items: List[BaseModel], code_field: str, code_value: str) -> Optional[BaseModel]:
        """Find an item by its code field."""
        for item in items:
            if getattr(item, code_field, None) == code_value:
                return item
        return None