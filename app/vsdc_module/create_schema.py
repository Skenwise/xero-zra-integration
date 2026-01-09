from typing import Optional, List
from datetime import datetime
from schema import FoundationBase, InformationBase, TransactionDetailsBase

# =============================
# Device Create Schema
# =============================
class DeviceCreateSchema(FoundationBase):
    DvcSrlNo: str

# =============================
# Code Data Request Schema
# =============================
class CodeDataRequestSchema(FoundationBase):
    pass

# =============================
# Item Classification Request Schema
# =============================
class ItemClassificationRequestSchema(FoundationBase):
    pass

# =============================
# Notice Request Schema
# =============================
class NoticeRequestSchema(FoundationBase):
    pass

# =============================
# Customer Request Schema
# ==========================
class CustomerRequestSchema(FoundationBase):
    custmTin: str

# ===========================
# Branch Request Schema
# =========================
class BranchRequestSchema(FoundationBase):
    pass

# =============================
# Branch Customer Create Schema
# =============================
class BranchCustomerCreateSchema(InformationBase):
    custNo: str
    custTpin: str
    custNm: str
    telNo: Optional[str] = None
    email: Optional[str] = None
    faxNo: Optional[str] = None

# =============================
# Branch User Account Create Schema
# =============================
class UserAccountCreateSchema(InformationBase):
    userID: str
    userNm: str
    pwd: str
    cntc: Optional[str] = None
    authCd: Optional[str] = None

# =============================
# Item Create Schema
# =============================
class ItemCreateSchema(InformationBase):
    itemClsCd: str
    itemCd: str
    itemTyCd: str
    itemNm: str
    pkgUnitCd: str
    orgnNatCd: str
    qtyUnitCd: str
    taxTyCd: str
    dftPrc: float
    isrcAplcbYn: str

    # Optional fields
    itemStdNm: Optional[str] = None
    btchNo: Optional[str] = None
    bcd: Optional[str] = None
    grpPrcL1: Optional[float] = None
    grpPrcL2: Optional[float] = None
    grpPrcL3: Optional[float] = None
    grpPrcL4: Optional[float] = None
    grpPrcL5: Optional[float] = None
    addInfo: Optional[str] = None
    sftyQty: Optional[float] = None

# ====================================
# Item Select Schema
# ==================================
class ItemSelectSchema(FoundationBase):
    pass

# =======================================
# Import Item Schema
# =======================================
class ImportItemSchema(FoundationBase):
    pass

# =============================
# Update Import Item Schema
# =============================
class UpdateImportItemSchema(InformationBase):
    taskCd: str
    dclDe: str
    itemSeq: int
    hsCd: int
    itemClCd: str
    itemCd: str
    imptItemsttsCd: str

# =============================
# Create Sales Transaction Schema
# =============================
class SalesTransactionCreateSchema(TransactionDetailsBase):
    invcNo: int
    orgInvcNo: int
    prcOrdCd: str
    salesTyCd: str
    salesSttsCd: str
    salesDt: datetime
    stockRlsDt: Optional[datetime] = None
    rptNo: int
    splyAmt: float
    dcRt: float
    dcAmt: float
    custTpin: Optional[str] = None
    custNm: Optional[str] = None
    custMblNo: Optional[str] = None
    trdeNm: Optional[str] = None
    topMsg: Optional[str] = None
    btmMsg: Optional[str] = None
    isrccCd: Optional[str] = None
    isrccNm: Optional[str] = None
    isrcRt: Optional[float] = None
    isrcAmt: Optional[float] = None

# ========================================
# Purchase Select Schema
# =====================================
class PurchaseSelectSchema(FoundationBase):
    pass

# =============================
# Create Purchase Transaction Schema
# =============================
class PurchaseTransactionCreateSchema(TransactionDetailsBase):
    invcNo: int
    orgInvcNo: int
    regTyCd: str
    pchsTyCd: str
    pchsSttsCd: str
    pchsDt: datetime
    splyAmt: float
    dcRt: float
    dcAmt: float
    taxAmt: float
    spplrTin: Optional[str] = None
    spplrBhfId: Optional[str] = None
    spplrNm: Optional[str] = None
    spplrInvcNo: Optional[int] = None
    spplrSdcId: Optional[str] = None
    wrhsDt: Optional[datetime] = None
    itemCd: Optional[str] = None
    spplrItemClsCd: Optional[str] = None
    spplrItemCd: Optional[str] = None
    spplrItemNm: Optional[str] = None
    pkgUnitCd: Optional[str] = None
    itemExprDt: Optional[datetime] = None

# =============================================
# Select Stock Item Schema
# =============================================
class StockItemSelectSchema(FoundationBase):
    pass

# =============================
# Create Stock Transaction Schema
# =============================
class StockTransactionCreateSchema(TransactionDetailsBase):
    sarNo: int
    orgSarNo: int
    regTyCd: str
    sarTyCd: str
    ocrnDt: datetime
    splyAmt: float
    totDcAmt: float
    taxAmt: float
    custTpin: Optional[str] = None
    custNm: Optional[str] = None
    custBhfId: Optional[str] = None
    itemCd: Optional[str] = None
    itemExprDt: Optional[datetime] = None

# =============================
# Create Stock Master Schema
# =============================
class StockMasterCreateSchema(InformationBase):
    itemCd: str
    rsdQty: float