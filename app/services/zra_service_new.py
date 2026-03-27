from app.clients.zra_client import zra_client
from typing import Dict, Any

async def submit_invoice_to_zra(xero_invoice: Dict[str, Any]) -> Dict:
    zra_payload = map_invoice_to_zra(xero_invoice)
    response = await zra_client.post("/trnsSales/saveSales", zra_payload)
    return {"status": "submitted", "zra_response": response, "invoice_number": xero_invoice.get("InvoiceNumber")}

def map_invoice_to_zra(xero_invoice: Dict) -> Dict:
    return {
        "tpin": "YOUR_TPIN_HERE",
        "bhfId": "000",
        "invcNo": xero_invoice.get("InvoiceNumber"),
        "salesDt": xero_invoice.get("Date", "").replace("-", ""),
        "totItemCnt": len(xero_invoice.get("LineItems", [])),
        "totTaxblAmt": float(xero_invoice.get("Total", 0)),
        "totAmt": float(xero_invoice.get("Total", 0)),
        "itemList": [{"itemSeq": i+1, "itemCd": item.get("ItemCode", "UNKNOWN"), "itemNm": item.get("Description", "")[:200], "qty": item.get("Quantity", 1), "prc": float(item.get("UnitAmount", 0)), "splyAmt": float(item.get("LineAmount", 0))} for i, item in enumerate(xero_invoice.get("LineItems", []))]
    }
