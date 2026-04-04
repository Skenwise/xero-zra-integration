"""
ZRA VSDC Mock Server - Industry Grade Validation Server
Run: uvicorn main:app --reload --port 8081
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator, ValidationError
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

app = FastAPI(title="ZRA VSDC Mock Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# IN-MEMORY STATE
# ============================================

saved_items: Dict[str, Dict] = {}
tenant_invoice_trackers: Dict[str, int] = {}


def get_tracker_key(tpin: str, bhfId: str) -> str:
    return f"{tpin}_{bhfId}"


def zra_error_response(code: str, message: str) -> Dict:
    return {
        "resultCd": code,
        "resultMsg": message,
        "resultDt": datetime.now().strftime("%Y%m%d%H%M%S"),
        "data": None
    }


# ============================================
# MIDDLEWARE TO LOG REQUESTS
# ============================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for debugging"""
    body = await request.body()
    print(f"\n{'='*60}")
    print(f"📥 REQUEST: {request.method} {request.url.path}")
    if body:
        try:
            body_str = body.decode()
            if len(body_str) > 500:
                body_str = body_str[:500] + "..."
            print(f"   Body: {body_str}")
        except:
            print(f"   Body: (binary)")
    response = await call_next(request)
    print(f"   Response Status: {response.status_code}")
    print(f"{'='*60}\n")
    return response


# ============================================
# PYDANTIC SCHEMAS
# ============================================

class InitInfoReq(BaseModel):
    tpin: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    bhfId: str = Field(..., min_length=3, max_length=3, pattern=r"^\d{3}$")
    dvcSrlNo: str = Field(..., max_length=100)


class CodeReq(BaseModel):
    tpin: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    bhfId: str = Field(..., min_length=3, max_length=3, pattern=r"^\d{3}$")
    lastReqDt: str = Field(..., pattern=r"^\d{14}$")


class SelectItemReq(BaseModel):
    tpin: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    bhfId: str = Field(..., min_length=3, max_length=3, pattern=r"^\d{3}$")
    lastReqDt: str = Field(..., pattern=r"^\d{14}$")


class SaveItemReq(BaseModel):
    tpin: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    bhfId: str = Field(..., min_length=3, max_length=3, pattern=r"^\d{3}$")
    itemCd: str = Field(..., min_length=15, max_length=20)
    itemClsCd: str = Field(..., max_length=10)
    itemTyCd: str = Field(..., max_length=5)
    itemNm: str = Field(..., max_length=200)
    orgnNatCd: str = Field(..., max_length=5)
    pkgUnitCd: str = Field(..., max_length=5)
    qtyUnitCd: str = Field(..., max_length=5)
    taxTyCd: str = Field(..., max_length=5)
    dftPrc: float = Field(..., ge=0)
    useYn: str = Field(..., pattern=r"^[YN]$")
    regrNm: str = Field(..., max_length=60)
    regrId: str = Field(..., max_length=20)
    modrNm: str = Field(..., max_length=60)
    modrId: str = Field(..., max_length=20)


class SalesItem(BaseModel):
    itemSeq: int = Field(..., ge=1)
    itemCd: str = Field(..., max_length=20)
    itemClsCd: Optional[str] = Field(None, max_length=10)
    itemNm: str = Field(..., max_length=200)
    bcd: Optional[str] = Field(None, max_length=20)
    pkgUnitCd: Optional[str] = Field(None, max_length=5)
    pkg: Optional[float] = Field(None, ge=0)
    qtyUnitCd: Optional[str] = Field(None, max_length=5)
    qty: float = Field(..., ge=0)
    prc: float = Field(..., ge=0)
    splyAmt: float = Field(..., ge=0)
    dcRt: Optional[float] = Field(0, ge=0, le=100)
    dcAmt: Optional[float] = Field(0, ge=0)
    isrcCd: Optional[str] = Field(None, max_length=10)
    isrcNm: Optional[str] = Field(None, max_length=100)
    isrcRt: Optional[float] = Field(None, ge=0, le=100)
    isrcAmt: Optional[float] = Field(None, ge=0)
    taxTyCd: str = Field(..., pattern=r"^(A|B|C1|C2|C3|D)$")
    taxblAmt: float = Field(..., ge=0)
    taxAmt: float = Field(..., ge=0)
    totAmt: float = Field(..., ge=0)


class SaveSalesReq(BaseModel):
    tpin: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    bhfId: str = Field(..., min_length=3, max_length=3, pattern=r"^\d{3}$")
    invcNo: int = Field(..., ge=1)
    orgInvcNo: int = Field(0, ge=0)
    custTpin: Optional[str] = Field(None, max_length=10)
    custNm: Optional[str] = Field(None, max_length=60)
    salesTyCd: str = Field("N", pattern=r"^(N|C|P|T)$")
    rcptTyCd: str = Field("S", pattern=r"^(S|R)$")
    pmtTyCd: Optional[str] = Field(None, max_length=5)
    salesSttsCd: str = Field("02", pattern=r"^(01|02)$")
    cfmDt: str = Field(..., pattern=r"^\d{14}$")
    salesDt: str = Field(..., pattern=r"^\d{8}$")
    stockRlsDt: Optional[str] = Field(None, pattern=r"^\d{14}$")
    totItemCnt: int = Field(..., ge=1)
    taxblAmtA: float = Field(0, ge=0)
    taxblAmtB: float = Field(0, ge=0)
    taxblAmtC1: float = Field(0, ge=0)
    taxblAmtC2: float = Field(0, ge=0)
    taxblAmtC3: float = Field(0, ge=0)
    taxblAmtD: float = Field(0, ge=0)
    taxRtA: float = Field(0, ge=0)
    taxRtB: float = Field(0, ge=0)
    taxRtC1: float = Field(0, ge=0)
    taxRtC2: float = Field(0, ge=0)
    taxRtC3: float = Field(0, ge=0)
    taxRtD: float = Field(0, ge=0)
    taxAmtA: float = Field(0, ge=0)
    taxAmtB: float = Field(0, ge=0)
    taxAmtC1: float = Field(0, ge=0)
    taxAmtC2: float = Field(0, ge=0)
    taxAmtC3: float = Field(0, ge=0)
    taxAmtD: float = Field(0, ge=0)
    totTaxblAmt: float = Field(..., ge=0)
    totTaxAmt: float = Field(..., ge=0)
    totAmt: float = Field(..., ge=0)
    itemList: List[SalesItem]


# ============================================
# EXCEPTION HANDLERS
# ============================================

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    errors = exc.errors()
    error_details = []
    for error in errors:
        field = " -> ".join(str(loc) for loc in error["loc"])
        error_details.append(f"{field}: {error['msg']}")
    
    print(f"❌ VALIDATION ERROR: {'; '.join(error_details)}")
    
    return JSONResponse(
        status_code=400,
        content=zra_error_response("910", f"Validation failed: {'; '.join(error_details)}")
    )


# ============================================
# API ENDPOINTS
# ============================================

@app.post("/zraVsdc_v1TestLatest/initializer/selectInitInfo")
async def device_initialization(req: InitInfoReq):
    tracker_key = get_tracker_key(req.tpin, req.bhfId)
    if tracker_key not in tenant_invoice_trackers:
        tenant_invoice_trackers[tracker_key] = 0
    
    return {
        "resultCd": "000",
        "resultMsg": "It is succeeded",
        "resultDt": datetime.now().strftime("%Y%m%d%H%M%S"),
        "data": {
            "tpin": req.tpin,
            "bhfId": req.bhfId,
            "intrlKey": f"INTRL_{uuid.uuid4().hex[:16]}",
            "signKey": f"SIGN_{uuid.uuid4().hex[:16]}",
            "cmcKey": f"CMC_{uuid.uuid4().hex[:16]}",
            "lastSaleInvcNo": tenant_invoice_trackers[tracker_key],
            "dvcId": f"DVC_{uuid.uuid4().hex[:8]}",
            "sdicId": f"SDIC_{uuid.uuid4().hex[:8]}",
            "mrcNo": f"MRC_{uuid.uuid4().hex[:8]}"
        }
    }


@app.post("/zraVsdc_v1TestLatest/code/selectCodes")
async def get_codes(req: CodeReq):
    return {
        "resultCd": "000",
        "resultMsg": "It is succeeded",
        "resultDt": datetime.now().strftime("%Y%m%d%H%M%S"),
        "data": {
            "clsList": [
                {
                    "cdCls": "04",
                    "cdClsNm": "Tax Type",
                    "useYn": "Y",
                    "dtlList": [
                        {"cd": "A", "cdNm": "A-EX", "useYn": "Y", "userDfnCd1": "0"},
                        {"cd": "B", "cdNm": "B-16%", "useYn": "Y", "userDfnCd1": "16"},
                        {"cd": "C1", "cdNm": "C1-0%", "useYn": "Y", "userDfnCd1": "0"},
                        {"cd": "D", "cdNm": "D-0%", "useYn": "Y", "userDfnCd1": "0"}
                    ]
                },
                {
                    "cdCls": "02",
                    "cdClsNm": "Product Type",
                    "useYn": "Y",
                    "dtlList": [
                        {"cd": "1", "cdNm": "Raw Material", "useYn": "Y"},
                        {"cd": "2", "cdNm": "Finished Product", "useYn": "Y"},
                        {"cd": "3", "cdNm": "Service", "useYn": "Y"}
                    ]
                },
                {
                    "cdCls": "06",
                    "cdClsNm": "Unit of Quantity",
                    "useYn": "Y",
                    "dtlList": [
                        {"cd": "U", "cdNm": "Piece/Item", "useYn": "Y"},
                        {"cd": "KGM", "cdNm": "Kilogram", "useYn": "Y"},
                        {"cd": "LTR", "cdNm": "Litre", "useYn": "Y"}
                    ]
                },
                {
                    "cdCls": "05",
                    "cdClsNm": "Packaging Unit",
                    "useYn": "Y",
                    "dtlList": [
                        {"cd": "NT", "cdNm": "Net", "useYn": "Y"},
                        {"cd": "BG", "cdNm": "Bag", "useYn": "Y"},
                        {"cd": "BX", "cdNm": "Box", "useYn": "Y"}
                    ]
                }
            ]
        }
    }


@app.post("/zraVsdc_v1TestLatest/items/saveItems")
async def save_item(req: SaveItemReq):
    saved_items[req.itemCd] = req.model_dump()
    print(f"✅ ITEM REGISTERED: {req.itemCd} - {req.itemNm}")
    return {
        "resultCd": "000",
        "resultMsg": "It is succeeded",
        "resultDt": datetime.now().strftime("%Y%m%d%H%M%S"),
        "data": None
    }


@app.post("/zraVsdc_v1TestLatest/items/selectItems")
async def select_items(req: SelectItemReq):
    items_list = []
    for item_cd, item_data in saved_items.items():
        items_list.append({
            "itemCd": item_cd,
            "itemNm": item_data.get("itemNm", ""),
            "itemClsCd": item_data.get("itemClsCd", ""),
            "taxTyCd": item_data.get("taxTyCd", "B")
        })
    
    return {
        "resultCd": "000",
        "resultMsg": "It is succeeded",
        "resultDt": datetime.now().strftime("%Y%m%d%H%M%S"),
        "data": {"itemList": items_list}
    }


@app.post("/zraVsdc_v1TestLatest/customers/selectCustomer")
async def get_customer(req: Dict):
    return {
        "resultCd": "000",
        "resultMsg": "It is succeeded",
        "resultDt": datetime.now().strftime("%Y%m%d%H%M%S"),
        "data": {
            "custList": [
                {"tpin": "100600570", "taxprNm": "Test Customer", "custTyCd": "01"}
            ]
        }
    }


@app.post("/zraVsdc_v1TestLatest/trnsSales/saveSales")
async def save_sales(req: SaveSalesReq):
    print(f"\n📥 SALE REQUEST RECEIVED:")
    print(f"   TPIN: {req.tpin}")
    print(f"   Branch: {req.bhfId}")
    print(f"   Invoice No: {req.invcNo}")
    print(f"   Total Items: {req.totItemCnt}")
    print(f"   Item Codes: {[item.itemCd for item in req.itemList]}")
    
    tracker_key = get_tracker_key(req.tpin, req.bhfId)
    
    # For testing: accept any invoice number, just update tracker
    # In production with real ZRA, you would use sequential numbers
    tenant_invoice_trackers[tracker_key] = req.invcNo
    
    # Validation: Item Registration
    for item in req.itemList:
        if item.itemCd not in saved_items:
            print(f"❌ ITEM NOT REGISTERED: {item.itemCd}")
            return zra_error_response("E06", f"Item not registered: {item.itemCd}")
    
    print(f"✅ ALL VALIDATIONS PASSED")
    
    # Generate receipt number
    rcpt_no = int(str(req.invcNo) + datetime.now().strftime("%d%H%M%S")) % 1000000000
    
    print(f"✅ SALE ACCEPTED - Receipt: {rcpt_no}")
    
    return {
        "resultCd": "000",
        "resultMsg": "It is succeeded",
        "resultDt": datetime.now().strftime("%Y%m%d%H%M%S"),
        "data": {
            "rcptNo": rcpt_no,
            "intrlData": f"INTEGRITY_{uuid.uuid4().hex[:20]}",
            "vsdcRcptPbctDate": datetime.now().strftime("%Y%m%d%H%M%S"),
            "sdcId": f"SDC_{uuid.uuid4().hex[:8]}",
            "mrcNo": f"MRC_{uuid.uuid4().hex[:8]}"
        }
    }

@app.get("/zraVsdc_v1TestLatest/debug/state")
async def debug_state():
    return {
        "saved_items_count": len(saved_items),
        "saved_items": list(saved_items.keys()),
        "invoice_trackers": tenant_invoice_trackers
    }


@app.get("/zraVsdc_v1TestLatest/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081, reload=True)