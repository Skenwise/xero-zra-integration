"""
ZRA Item Code Generator
Generates deterministic 15-character ZRA item codes from Xero item codes
Format: ZM + ProductType(1) + PkgUnit(2) + QtyUnit(2) + Sequence(8)
Example: ZM2NTEA00000001
"""

import hashlib


def generate_zra_item_code(xero_item_code: str) -> str:
    """
    Generates a deterministic 15-char ZRA item code.
    Same Xero item code always produces the same ZRA code.
    
    Args:
        xero_item_code: The Xero item code (e.g., "CHAIR-01", "SVC001")
    
    Returns:
        15-character ZRA item code
        Format: ZM + ProductType + PkgUnit + QtyUnit + Sequence
        
    Example:
        >>> generate_zra_item_code("CHAIR-01")
        'ZM2NTEAa3f5d8c1b'
    """
    # Default values for V1
    product_type = "2"      # 2 = Finished Product
    pkg_unit = "NT"         # NT = Net (packaging unit)
    qty_unit = "EA"         # EA = Each (exactly 2 chars to satisfy 15-char limit!)
    
    # Generate deterministic 8-character sequence from xero_item_code
    # Using MD5 hash to ensure same input always gives same output
    hash_val = int(hashlib.md5(xero_item_code.encode()).hexdigest(), 16)
    sequence = str(hash_val % 100000000).zfill(8)
    
    # Combine into STRICT 15-character code: 2 + 1 + 2 + 2 + 8 = 15
    zra_item_cd = f"ZM{product_type}{pkg_unit}{qty_unit}{sequence}"
    
    return zra_item_cd


def generate_zra_item_code_from_description(description: str, index: int) -> str:
    """
    Fallback generator when Xero item has no ItemCode.
    Uses description + index to generate deterministic code.
    
    Args:
        description: The line item description
        index: The line item sequence number
    
    Returns:
        15-character ZRA item code
    """
    fallback_key = f"{description}_{index}"
    return generate_zra_item_code(fallback_key)


def get_tax_type_from_xero(xero_tax_type: str) -> str:
    """
    Map Xero TaxType to ZRA tax code.
    
    Args:
        xero_tax_type: Xero tax type (e.g., "OUTPUT", "INPUT", "NONE")
    
    Returns:
        ZRA tax code: "A", "B", "C1", or "D"
    """
    tax_mapping = {
        "OUTPUT": "B",      # Standard 16% VAT on sales
        "OUTPUT2": "B",     # Standard 16% VAT
        "INPUT": "B",       # Standard 16% VAT on purchases
        "INPUT2": "B",      # Standard 16% VAT
        "ZERORATEDOUTPUT": "C1",  # Zero-rated
        "ZERORATEDINPUT": "C1",   # Zero-rated
        "EXEMPTOUTPUT": "D",      # Exempt
        "EXEMPTINPUT": "D",       # Exempt
        "NONE": "D",              # No tax
    }
    return tax_mapping.get(xero_tax_type, "B")  # Default to "B" (16%)