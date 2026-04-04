"""
ZRA VSDC Sales Transaction Schemas
Based on ZRA API Documentation Section 3.6
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from decimal import Decimal, ROUND_HALF_UP


class ZraSalesItemSchema(BaseModel):
    """Line item for ZRA sales transaction"""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    itemSeq: int = Field(..., ge=1)
    itemCd: str = Field(..., max_length=20)
    itemClsCd: Optional[str] = Field(None, max_length=10)
    itemNm: str = Field(..., max_length=200)
    bcd: Optional[str] = Field(None, max_length=20)
    pkgUnitCd: Optional[str] = Field(None, max_length=5)
    pkg: Optional[Decimal] = Field(None)
    qtyUnitCd: Optional[str] = Field(None, max_length=5)
    qty: Decimal = Field(...)
    prc: Decimal = Field(...)
    splyAmt: Decimal = Field(...)
    dcRt: Decimal = Field(Decimal('0'))
    dcAmt: Decimal = Field(Decimal('0'))
    isrcCd: Optional[str] = Field(None, max_length=10)
    isrcNm: Optional[str] = Field(None, max_length=100)
    isrcRt: Optional[Decimal] = Field(None)
    isrcAmt: Optional[Decimal] = Field(None)
    taxTyCd: str = Field(..., max_length=5)
    taxblAmt: Decimal = Field(...)
    taxAmt: Decimal = Field(...)
    totAmt: Decimal = Field(...)
    
    @field_validator('itemNm', mode='before')
    @classmethod
    def truncate_item_name(cls, v):
        if v and len(str(v)) > 200:
            return str(v)[:200]
        return str(v) if v else ""
    
    @field_validator('qty', 'prc', 'splyAmt', 'taxblAmt', 'taxAmt', 'totAmt', 'dcRt', 'dcAmt', mode='before')
    @classmethod
    def to_decimal(cls, v):
        if v is None:
            return Decimal('0')
        try:
            return Decimal(str(v)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except (ValueError, TypeError):
            return Decimal('0')


class ZraSalesRequestSchema(BaseModel):
    """Complete ZRA sales transaction request"""
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={
            Decimal: lambda v: float(v)
        }
    )
    
    # Header information
    tpin: str = Field(..., max_length=10)
    bhfId: str = Field(..., max_length=3)
    invcNo: int = Field(...)
    orgInvcNo: int = Field(0)
    
    # Customer information
    custTpin: Optional[str] = Field(None, max_length=10)
    custNm: Optional[str] = Field(None, max_length=60)
    prcOrdCd: Optional[str] = Field(None, max_length=6)
    
    # Transaction details
    salesTyCd: str = Field("N", max_length=5)
    rcptTyCd: str = Field("S", max_length=5)
    pmtTyCd: Optional[str] = Field(None, max_length=5)
    salesSttsCd: str = Field("02", max_length=5)
    
    # Dates
    cfmDt: str = Field(...)
    salesDt: str = Field(...)
    stockRlsDt: Optional[str] = Field(None)
    
    # Cancellation/refund fields
    cnclReqDt: Optional[str] = Field(None)
    cnclDt: Optional[str] = Field(None)
    rfdDt: Optional[str] = Field(None)
    rfdRsnCd: Optional[str] = Field(None, max_length=5)
    
    # Item counts
    totItemCnt: int = Field(...)
    
    # Tax buckets
    taxblAmtA: Decimal = Field(Decimal('0'))
    taxblAmtB: Decimal = Field(Decimal('0'))
    taxblAmtC1: Decimal = Field(Decimal('0'))
    taxblAmtC2: Decimal = Field(Decimal('0'))
    taxblAmtC3: Decimal = Field(Decimal('0'))
    taxblAmtD: Decimal = Field(Decimal('0'))
    
    taxRtA: Decimal = Field(Decimal('0'))
    taxRtB: Decimal = Field(Decimal('0'))
    taxRtC1: Decimal = Field(Decimal('0'))
    taxRtC2: Decimal = Field(Decimal('0'))
    taxRtC3: Decimal = Field(Decimal('0'))
    taxRtD: Decimal = Field(Decimal('0'))
    
    taxAmtA: Decimal = Field(Decimal('0'))
    taxAmtB: Decimal = Field(Decimal('0'))
    taxAmtC1: Decimal = Field(Decimal('0'))
    taxAmtC2: Decimal = Field(Decimal('0'))
    taxAmtC3: Decimal = Field(Decimal('0'))
    taxAmtD: Decimal = Field(Decimal('0'))
    
    # Totals
    totTaxblAmt: Decimal = Field(...)
    totTaxAmt: Decimal = Field(...)
    totAmt: Decimal = Field(...)
    
    # Optional fields
    prchrAcptcYn: Optional[str] = Field("N", max_length=1)
    remark: Optional[str] = Field(None, max_length=400)
    
    # Registrant info
    regrNm: str = Field(..., max_length=60)
    regrId: str = Field(..., max_length=20)
    modrNm: str = Field(..., max_length=60)
    modrId: str = Field(..., max_length=20)
    
    # Line items
    itemList: List[ZraSalesItemSchema] = Field(...)
    
    @field_validator('invcNo', 'totItemCnt', mode='before')
    @classmethod
    def to_int(cls, v):
        if v is None:
            return 0
        try:
            return int(float(str(v)))
        except (ValueError, TypeError):
            return 0
    
    @field_validator('taxblAmtA', 'taxblAmtB', 'taxblAmtC1', 'taxblAmtC2', 'taxblAmtC3', 'taxblAmtD',
                     'taxRtA', 'taxRtB', 'taxRtC1', 'taxRtC2', 'taxRtC3', 'taxRtD',
                     'taxAmtA', 'taxAmtB', 'taxAmtC1', 'taxAmtC2', 'taxAmtC3', 'taxAmtD',
                     'totTaxblAmt', 'totTaxAmt', 'totAmt', mode='before')
    @classmethod
    def to_decimal(cls, v):
        if v is None:
            return Decimal('0')
        try:
            return Decimal(str(v)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except (ValueError, TypeError):
            return Decimal('0')
    
    @field_validator('custNm', 'regrNm', 'modrNm', mode='before')
    @classmethod
    def truncate_string(cls, v):
        if v is None:
            return None
        s = str(v)
        return s[:60] if len(s) > 60 else s
    
    @field_validator('custTpin', mode='before')
    @classmethod
    def validate_tpin(cls, v):
        if v is None:
            return None
        s = str(v).strip()
        if s.isdigit() and len(s) == 10:
            return s
        return None