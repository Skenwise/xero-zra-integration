# app/services/tax_mapping.py
"""
Tax Type Mapping: Xero TaxType → ZRA Tax Code
Based on ZRA VSDC API Documentation Section 4.1
"""

from decimal import Decimal

# Mapping of Xero TaxType to ZRA tax code and rate
TAX_MAPPING = {
    # Standard VAT
    "OUTPUT": {"code": "B", "rate": Decimal("16")},      # 16% VAT on sales
    "INPUT": {"code": "B", "rate": Decimal("16")},       # 16% VAT on purchases
    "OUTPUT2": {"code": "B", "rate": Decimal("16")},     # 16% VAT (alternate)
    
    # Zero-rated
    "ZERORATEDOUTPUT": {"code": "C1", "rate": Decimal("0")},   # Zero-rated exports
    "ZERORATEDINPUT": {"code": "C1", "rate": Decimal("0")},
    
    # Exempt
    "EXEMPTOUTPUT": {"code": "D", "rate": Decimal("0")},       # Exempt from tax
    "EXEMPTINPUT": {"code": "D", "rate": Decimal("0")},
    
    # No tax
    "NONE": {"code": "D", "rate": Decimal("0")},
    
    # Default fallback
    "DEFAULT": {"code": "B", "rate": Decimal("16")},
}

# ZRA tax codes for aggregation buckets
ZRA_TAX_CODES = ["A", "B", "C1", "C2", "C3", "D"]

# Default ZRA configuration (will be overridden by actual config)
DEFAULT_ZRA_CONFIG = {
    "tpin": "",
    "bhfId": "000",
    "dvcSrlNo": "",
}