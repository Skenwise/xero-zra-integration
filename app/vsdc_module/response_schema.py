from typing import Optional, List
from datetime import datetime
from schema import FoundationBase, InformationBase, TransactionDetailsBase
from pydantic import BaseModel, validator

# =============================
# Device Initialization Response
# =============================

class ResponseBase(BaseModel):
    resultCd: str
    resultMsg: str
    resultDt: str

class InitTaxpayerResponse(BaseModel):
    tpin: str
    taxprNm: str
    bsnsActv: str

class InitBranchResponse(BaseModel):
    bhfId: str
    bhfNm: str
    bhfOpenDt: str
    prvncNm: str
    dstrtNm: str
    sctrNm: str
    locDesc: str
    hqYn: str
    mgrNm: str
    mgrTelNo: str
    mgrEmail: str

class InitDeviceResponse(BaseModel):
    dvcId: str
    sdicId: str
    mrcNo: str
    intrlKey: str
    signKey: str
    cmcKey: str
    lastSaleInvcNo: int
    lastPchsInvcNo: int
    lastSaleRcptNo: int
    lastInvcNo: int
    lastTrainInvcNo: int
    lastProfrmInvcNo: int
    lastCopyInvcNo: int

class DeviceInitResponse(ResponseBase):
    InitTaxpayer: InitTaxpayerResponse
    InitBranch: InitBranchResponse
    InitDevice: InitDeviceResponse

# =============================
# Standard Codes Response
# =============================

class CodeDetailResponse(BaseModel):
    cd: str
    cdNm: str
    cdDesc: Optional[str] = None
    useYn: str
    srtOrd: int
    userDfnCd1: Optional[str] = None
    userDfnCd2: Optional[str] = None
    userDfnCd3: Optional[str] = None

class CodeClassResponse(BaseModel):
    cdCls: str
    cdClsNm: str
    cdClsDesc: Optional[str] = None
    useYn: str
    userDfnNm1: Optional[str] = None
    userDfnNm2: Optional[str] = None
    userDfnNm3: Optional[str] = None
    dtlList: List[CodeDetailResponse]

class CodeDataResponse(BaseModel):
    clsList: List[CodeClassResponse]

class CodeResponse(ResponseBase):
    data: CodeDataResponse

# =============================
# Item Classification Codes Response
# =============================

class ItemClassResponse(BaseModel):
    itemClsCd: str
    itemClsNm: str
    itemClsLvl: int
    taxTyCd: Optional[str] = None
    mjrTgYn: Optional[str] = None
    useYn: str

class ItemClassDataResponse(BaseModel):
    itemClsList: List[ItemClassResponse]

class ItemClassCodesResponse(ResponseBase):
    data: ItemClassDataResponse

# =============================
# Notice List Response
# =============================

class NoticeResponse(BaseModel):
    noticeNo: int
    title: str
    cont: str
    dtlUrl: Optional[str] = None
    regrNm: str
    regDt: str

class NoticeDataResponse(BaseModel):
    noticeList: List[NoticeResponse]

class NoticeListResponse(ResponseBase):
    data: NoticeDataResponse

# =============================
# Get Customers Response
# =============================

class CustomerResponse(BaseModel):
    tpin: str
    taxprNm: str
    taxprSttsCd: str
    prvncNm: str
    dstrtNm: str
    sctrNm: str
    locDesc: Optional[str] = None

class CustomerDataResponse(BaseModel):
    custList: List[CustomerResponse]

class GetCustomerResponse(ResponseBase):
    data: CustomerDataResponse

# =============================
# Get Branches Response
# =============================

class BranchResponse(BaseModel):
    tpin: str
    bhfId: str
    bhfNm: str
    bhfSttsCd: str
    prvncNm: str
    dstrtNm: str
    sctrNm: str
    locDesc: Optional[str] = None
    mgrNm: str
    mgrTelNo: str
    mgrEmail: str
    hqYn: str

class BranchDataResponse(BaseModel):
    bhfList: List[BranchResponse]

class GetBranchResponse(ResponseBase):
    data: BranchDataResponse


# =============================
# Add Customer to Branch Response
# =============================

class AddBranchCustomerResponse(ResponseBase):
    data: Optional[dict] = None

# =============================
# Create Branch User Accounts Response
# =============================

class CreateBranchUserResponse(ResponseBase):
    data: Optional[dict] = None


# =============================
# Add Item Response
# =============================

class AddItemResponse(ResponseBase):
    data: Optional[dict] = None

# =============================
# Get Items Response
# =============================

class ItemInfo(BaseModel):
    tpin: str
    itemClsCd: str
    itemCd: str
    itemTyCd: str
    itemNm: str
    itemStdNm: Optional[str] = None
    orgnNatCd: str
    pkgUnitCd: str
    qtyUnitCd: str
    taxTyCd: Optional[str] = None
    btchNo: Optional[str] = None
    regBhfId: str
    bcd: Optional[str] = None
    dftPrc: float
    grpPrcL1: Optional[float] = None
    grpPrcL2: Optional[float] = None
    grpPrcL3: Optional[float] = None
    grpPrcL4: Optional[float] = None
    grpPrcL5: Optional[float] = None
    addInfo: Optional[str] = None
    sftyQty: Optional[float] = None
    isrcAplcbYn: str
    ZRAModYn: str
    useYn: str

class GetItemsResponse(ResponseBase):
    data: Optional[dict[str, list[ItemInfo]]] = None

# =============================
# Get Import Items Response
# =============================

class ImportItemInfo(BaseModel):
    taskCd: str
    dclDe: str
    itemSeq: int
    dclNo: str
    hsCd: str
    itemNm: str
    imptItemsttsCd: Optional[str] = None
    orgnNatCd: str
    exptNatCd: str
    pkg: float
    pkgUnitCd: Optional[str] = None
    qty: float
    qtyUnitCd: str
    totWt: float
    netWt: float
    spplrNm: str
    agntNm: str
    invcFcurAmt: float
    invcFcurCd: str
    invcFcurExcrt: float

class GetImportItemsResponse(ResponseBase):
    data: Optional[dict[str, list[ImportItemInfo]]] = None

# =============================
# Update Import Items Response
# =============================

class UpdateImportItemResponse(ResponseBase):
    data: Optional[dict] = None

# =============================
# Save Sales Transaction Response
# =============================

class SaveSalesResponse(ResponseBase):
    data: Optional[dict] = None

# =============================
# Purchase Item Class
# =============================
class PurchaseItem(TransactionDetailsBase):
    pass  # extend if you need item-specific fields later

# =============================
# Purchase Transaction Class
# =============================
class PurchaseTransaction(InformationBase):
    spplrTin: str
    spplrNm: str
    spplrBhfId: str
    spplrInvcNo: int
    prcOrdCd: Optional[str] = None
    salesDt: datetime
    stockRlsDt: Optional[datetime] = None
    itemList: List[PurchaseItem]

# =============================
# Full Response Class
# =============================
class GetPurchaseResponse(ResponseBase):
    data: Optional[dict] = None

# ================================
# Add Purchase Response 
# ================================

class TrnsPurchaseSaveRes(ResponseBase):
    data: Optional[dict] = None

# =============================
# Stock Item Class
# =============================
class StockItem(TransactionDetailsBase):
    pass  # all item-level fields come from TransactionDetailsBase

# =============================
# Stock Movement Class
# =============================
class StockMovement(InformationBase):
    custTpin: str
    custBhfId: str
    sarNo: int
    ocrnDt: datetime
    totItemCnt: int
    totTaxblAmt: float
    totTaxAmt: float
    totAmt: float
    remark: Optional[str] = None
    itemList: List[StockItem]

# =============================
# Full Stock Response Class
# =============================
class GetStockResponse(ResponseBase):
    stockList: List[StockMovement]

# =============================
# Full Stock In/Out Response Class
# =============================
class SaveStockIOResponse(ResponseBase):
    data: Optional[dict] = None

# =============================
# Full Stock Master Save Response Class
# =============================
class SaveStockMasterResponse(ResponseBase):
    data: Optional[dict] = None