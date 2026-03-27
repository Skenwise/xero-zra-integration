# core fastAPI import
from fastapi import HTTPException, Query, Response, Depends, APIRouter, Request, Header
from fastapi.responses import RedirectResponse, JSONResponse
from app.integrations.zra.utils.helpers import init_device
from app.clients.zra_client import VSDCClient
import httpx
from typing import Optional, List, Any, Dict

router = APIRouter()
client = VSDCClient()

@router.post("/initializer/selectInitInfo")
async def deviceInitialization(tpin: str, bhfId: str, DvcSrlNo):
    try:
        response = await init_device(tpin, bhfId, DvcSrlNo)
        return response
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

router.post("/code/selectCodes")
async def getCodeData(tpin: str, bhfId: str, lastReqDt: str):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "lastReqDt": lastReqDt
    }

    return await client._post("/code/selectCodes", payload)

router.post("/itemClass/selectItemClass")
async def getItemClassificationCode(tpin: str, bhfId: str, lastReqDt: str):
    payload = {
        "tpin": tpin,
        "bhfID": bhfId,
        "lastReqDt": lastReqDt
    }

    return await client._post("/itemClass/selectItemClass", payload)

router.post("/notices/selectNotices")
async def getNoticeList(tpin: str, bhfId: str, lastReqDt: str):
    payload = {
       "tpin": tpin,
       "bhfId": bhfId,
       "lastReqDt": lastReqDt
    }
    return await client._post("/notices/selectNotices", payload)

router.post("/customers/selectCounter")
async def getCustomer(tpin: str, bhfId: str, custmTin: str):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "custmTin": custmTin
    }
    return await client._post("/customers/selectCounter", payload)

router.post("/branches/selectBranches")
async def getBranches(tpin: str, bhfId: str, lastReqDt: str):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "lastReqDt": lastReqDt
    }
    return await client._post("/branches/selectBranches", payload)

router.post("/branches/saveBrancheCustomers")
async def addCutomerToBranch(tpin: str, bhfId: str, custNo: str, custTpin: str, custNm: str, useYn: str, regrNm: str, regrId: str, modrNm: str, modrId: str,adrs: Optional[str]=None, telNo: Optional[str]=None, email: Optional[str]=None, faxNo: Optional[str]=None, remark: Optional[str]=None):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "custNo": custNo,
        "custTpin": custTpin,
        "custNm": custNm,
        "useYn": useYn,
        "adrs": adrs,
        "telNo": telNo,
        "email": email,
        "faxNo": faxNo,
        "remark": remark,
        "regrNm": regrNm,
        "regrId": regrId,
        "modrNm": modrNm,
        "modrId": modrId
    }

    return await client._post("/branches/selectBranhces", payload)

router.post("/branches/saveBrancheUsers")
async def createBranchUserAccount(tpin: str, bhfId: str, userId: str, userNm: str, pwd: str, useYn: str, regrNm: str, regrId: str, modrNm: str, modrId: str, adrs: Optional[str]=None, cntc: Optional[str]=None, authCd: Optional[str]=None, remark: Optional[str]=None):
    payload= {
        "tpin": tpin,
        "bhfId": bhfId,
        "userId": userId,
        "userNm": userNm,
        "pwd": pwd,
        "useYn": useYn,
        "regrNm": regrNm,
        "adrs": adrs,
        "cntc": cntc,
        "authCd": authCd,
        "remark": remark,
        "regrId": regrId,
        "modrNm": modrNm,
        "modrId": modrId
    }
    return await client._post("/branches/saveBrancheUsers", payload)

router.post("/items/saveItems")
async def AddItems(tpin: str, bhfId: str, itemClsCd: str, itemCd: str, itemTyCd: str, itemNm: str, pkgUnitCd: str, orgnNatCd: str, qtyUnitCd: str, taxTyCd: str, dftPrc: float, isrcAplcbYn: str, useYn: str, regrNm: str, regrId: str, modrNm: str, modrId: str, itemStdNm: Optional[str]=None, btchNo: Optional[str]=None, bcd: Optional[str]=None, grpPrcL1: Optional[float]=None, grpPrcL2: Optional[float]=None, grpPrcL3: Optional[float]=None, grpPrcL4: Optional[float]=None, grpPrcL5: Optional[float]=None, addInfo: Optional[str]=None, sftyQty: Optional[float]=None):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "itemClsCd": itemClsCd,
        "itemCd": itemCd,
        "itemTyCd": itemTyCd,
        "itemNm": itemNm,
        "itemStdNm": itemStdNm,
        "orgnNatCd": orgnNatCd,
        "pkgUnitCd": pkgUnitCd,
        "qtyUnitCd": qtyUnitCd,
        "taxTyCd": taxTyCd,
        "btchNo": btchNo,
        "bcd": bcd,
        "dftPrc": dftPrc,
        "grpPrcL1": grpPrcL1,
        "grpPrcL2": grpPrcL2,
        "grpPrcL3": grpPrcL3,
        "grpPrcL4": grpPrcL4,
        "grpPrcL5": grpPrcL5,
        "addInfo": addInfo,
        "sftyQty": sftyQty,
        "isrcAplcbYn": isrcAplcbYn,
        "useYn": useYn,
        "regrNm": regrNm,
        "regrId": regrId,
        "modrNm": modrNm,
        "modrId": modrId
    }
    return await client._post("/items/saveItems", payload)

router.post("/items/selectItems")
async def getItems(tpin: str, bhfId: str, lastReqDt: str):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "lastReqDt": lastReqDt
    }
    return await client._post("/items/selectItems", payload)


router.post("/imports/selectImportItems")
async def getImportItem(tpin: str, bhfId: str, lastReqDt: str):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "lastReqDt": lastReqDt
    }
    return await client._post("/imports/selectImportItems", payload)

router.post("/imports/updateImportItems")
async def updateImportItem(tpin: str, bhfId: str, taskCd: str, dclDe: str, itemSeq: int, hsCd: int, itemClCd: str, itemCd: str, imptItemsttsCd: str, modrNm: str, modrId: str, remark: Optional[str]=None):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "taskCd": taskCd,
        "dclDe": dclDe,
        "itemSeq": itemSeq,
        "hsCd": hsCd,
        "itemClCd": itemClCd,
        "itemCd": itemCd,
        "imptItemsttsCd": imptItemsttsCd,
        "remark": remark,
        "modrNm": modrNm,
        "modrId": modrId
    }
    return await client._post("/imports/updateImportItems", payload)

router.post("/trnsSales/saveSales")
async def addSaleTransaction(tpin: str, bhfId: str, invcNo: int, orgInvcNo: int, prcOrdCd: str, salesTyCd: str, rcptTyCd: str, salesSttsCd: str, cfmDt: str, salesDt: str, totItemCnt: int, taxblAmtA: float, taxblAmtB: float, taxblAmtC: float, taxblAmtD: float, taxRtA: float, taxRtB: float, taxRtC: float, taxRtD: float, taxAmtA: float, taxAmtB: float, taxAmtC: float, taxAmtD: float, totTaxblAmt: float, totTaxAmt: float, totAmt: float, regrNm: str, regrId: str, modrNm: str, modrId: str, rptNo: str, prchrAcptcYn: str, itemSeq: int, itemCd: str, itemNm: str, pkgUnitCd: str, pkg: int, qtyUnitCd: str, qty: int, prc: float, splyAmt: int, dcRt: float, dcAmt: float, taxTyCd: str, taxblAmt: float, custTpin: Optional[str]=None, custNm: Optional[str]=None, pmtTyCd: Optional[str]=None, stockRlsDt: Optional[str]=None, cnclReqDt: Optional[str]=None, cnclDt: Optional[str]=None, rfdDt: Optional[str]=None, rfdRsnCd: Optional[str]=None, remark: Optional[str]=None, custMblNo: Optional[str]=None, trdeNm: Optional[str]=None, adrs: Optional[str]=None, topMsg: Optional[str]=None, btmMsg: Optional[str]=None, itemClsCd: Optional[str]=None, bcd: Optional[str]=None, isrccCd: Optional[str]=None, isrccNm: Optional[str]=None, isrcRt: Optional[float]=None, isrcAmt: Optional[float]=None):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "invcNo": invcNo,
        "orgInvcNo": orgInvcNo,
        "custTpin": custTpin,
        "prcOrdCd": prcOrdCd,
        "custNm": custNm,
        "salesTyCd": salesTyCd,
        "rcptTyCd": rcptTyCd,
        "pmtTyCd": pmtTyCd,
        "salesSttsCd": salesSttsCd,
        "cfmDt": cfmDt,
        "salesDt": salesDt,
        "stockRlsDt": stockRlsDt,
        "cnclReqDt": cnclReqDt,
        "cnclDt": cnclDt,
        "rfdDt": rfdDt,
        "rfdRsnCd": rfdRsnCd,
        "totItemCnt": totItemCnt,
        "taxblAmtA": taxblAmtA,
        "taxblAmtB": taxblAmtB,
        "taxblAmtC": taxblAmtC,
        "taxblAmtD": taxblAmtD,
        "taxRtA": taxRtA,
        "taxRtB": taxRtB,
        "taxRtC": taxRtC,
        "taxRtD": taxRtD,
        "taxAmtA": taxAmtA,
        "taxAmtB": taxAmtB,
        "taxAmtC": taxAmtC,
        "taxAmtD": taxAmtD,
        "totTaxblAmt": totTaxblAmt,
        "totTaxAmt": totTaxAmt,
        "totAmt": totAmt,
        "prchrAcptcYn": prchrAcptcYn,
        "remark": remark,
        "regrNm": regrNm,
        "regrId": regrId,
        "modrNm": modrNm,
        "modrId": modrId,
        "custMblNo": custMblNo,
        "rptNo": rptNo,
        "trdeNm": trdeNm,
        "adrs": adrs,
        "topMsg": topMsg,
        "btmMsg": btmMsg,
        "itemSeq": itemSeq,
        "itemClsCd": itemClsCd,
        "itemCd": itemCd,
        "itemNm": itemNm,
        "bcd": bcd,
        "pkgUnitCd": pkgUnitCd,
        "pkg": pkg,
        "qtyUnitCd": qtyUnitCd,
        "qty": qty,
        "prc": prc,
        "splyAmt": splyAmt,
        "dcRt": dcRt,
        "dcAmt": dcAmt,
        "isrccCd": isrccCd,
        "isrccNm": isrccNm,
        "isrcRt": isrcRt,
        "isrcAmt": isrcAmt,
        "taxTyCd": taxTyCd,
        "taxblAmt": taxblAmt
    }
    return await client._post("/trnsSales/saveSales", payload)

router.post("/trnsPurchase/selectTrnsPurchaseSales")
async def getPurchase(tpin: str, bhfId: str, lastReqDt: str):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "lastReqDt": lastReqDt
    }
    return await client._post("/trnsPurchase/selectTrnsPurchaseSales", payload)

router.post("/trnsPurchase/savePurchases")
async def addPurchase(tpin: str, bhfId: str, invcNo: int, orgInvcNo: int, regTyCd: str, pchsTyCd: str, rcptTyCd: str, pmtTyCd: str, pchsSttsCd: str, pchsDt: str, totItemCnt: int, taxblAmtA: float, taxblAmtB: float, taxblAmtC: float, taxblAmtD: float, taxRtA: float, taxRtB: float, taxRtC: float, taxRtD: float, taxAmtA: float, taxAmtB: float, taxAmtC: float, taxAmtD: float, totTaxblAmt: float, totTaxAmt: float, totAmt: float, regrNm: str, regrId: str, modrNm: str, modrId: str, itemSeq: int, itemClsCd: str, itemNm: str, pkg: float, qtyUnitCd: str, qty: int, prc: float, splyAmt: float, dcRt: float, dcAmt: float, taxblAmt: float, taxTyCd: int, taxAmt: float, spplrTin: Optional[str]=None, spplrBhfId: Optional[str]=None, spplrNm: Optional[str]=None, spplrInvcNo: Optional[str]=None, spplrSdcId: Optional[str]=None, cfmDt: Optional[str]=None, wrhsDt: Optional[str]=None, cnclReqDt: Optional[str]=None, cnclDt: Optional[str]=None, rfdDt: Optional[str]=None, remark: Optional[str]=None, itemCd: Optional[str]=None, spplrItemClsCd: Optional[str]=None, bcd: Optional[str]=None, spplrItemCd: Optional[str]=None, spplrItemNm: Optional[str]=None, pkgUnitCd: Optional[str]=None, itemExprDt: Optional[str]=None):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "spplrTin": spplrTin,
        "invcNo": invcNo,
        "orgInvcNo": orgInvcNo,
        "spplrBhfId": spplrBhfId,
        "spplrNm": spplrNm,
        "spplrInvcNo": spplrInvcNo,
        "spplrSdcId": spplrSdcId,
        "regTyCd": regTyCd,
        "pchsTyCd": pchsTyCd,
        "rcptTyCd": rcptTyCd,
        "pmtTyCd": pmtTyCd,
        "pchsSttsCd": pchsSttsCd,
        "cfmDt": cfmDt,
        "pchsDt": pchsDt,
        "wrhsDt": wrhsDt,
        "cnclReqDt": cnclReqDt,
        "cnclDt": cnclDt,
        "rfdDt": rfdDt,
        "totItemCnt": totItemCnt,
        "taxbAmtA": taxblAmtA,
        "taxblAmtB": taxblAmtB,
        "taxblAmtC": taxblAmtC,
        "taxblAmtD": taxblAmtD,
        "taxRtA": taxRtA,
        "taxRtB": taxRtB,
        "taxRtC": taxRtC,
        "taxRtD": taxRtD,
        "taxAmtA": taxAmtA,
        "taxAmtB": taxAmtB,
        "taxAmtC": taxAmtC,
        "taxAmtD": taxAmtD,
        "totTaxblAmt": totTaxblAmt,
        "totTaxAmt": totTaxAmt,
        "totAmt": totAmt,
        "remark": remark,
        "regrNm": regrNm,
        "regrId": regrId,
        "modrNm": modrNm,
        "modrId": modrId,
        "itemSeq": itemSeq,
        "itemCd": itemCd,
        "itemClsCd": itemClsCd,
        "itemNm": itemNm,
        "bcd": bcd,
        "spplrItemClsCd": spplrItemClsCd,
        "spplrItemCd": spplrItemCd,
        "spplrItemNm": spplrItemNm,
        "pkgUnitCd": pkgUnitCd,
        "pkg": pkg,
        "qtyUnitCd": qtyUnitCd,
        "qty": qty,
        "prc": prc,
        "splyAmt": splyAmt,
        "dcRt": dcRt,
        "dcAmt": dcAmt,
        "taxblAmt": taxblAmt,
        "taxTyCd": taxTyCd,
        "taxAmt": taxAmt,
        "totAmt": totAmt,
        "itemExprDt": itemExprDt
    }
    return await client._post("/trnsPurchase/savePurchases", payload)

router.post("/stock/selectStockItems")
async def getStockItem(tpin: str, bhfId: str, lastReqDt: str):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "lastReqDt": lastReqDt
    }
    return await client._post("/stock/selectStockItems", payload)

router.post("/stock/saveStockItems")
async def addStockItem(tpin: str, bhfId: str, sarNo: int, orgSarNo: int, regTyCd: str, sarTyCd: str, ocrnDt: str, totItemCnt: int, totTaxblAmt: float, totTaxAmt: float, totAmt: float, regrNm: str, regrId: str, modrNm: str, modrId: str, itemSeq: int, itemClsCd: str, itemNm: str, pkgUnitCd: str, pkg: float, qtyUnitCd: str, qty: int, prc: float, splyAmt: float, totDcAmt: float, taxblAmt: float, taxTyCd: float, taxAmt: float, custTpin: Optional[str]=None, custNm: Optional[str]=None, custBhfId: Optional[str]=None, remark: Optional[str]=None, itemCd: Optional[str]=None, bcd: Optional[str]=None, itemExprDt: Optional[str]=None):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "sarNo": sarNo,
        "orgSarNo": orgSarNo,
        "regTyCd": regTyCd,
        "custTpin": custTpin,
        "custNm": custNm,
        "custBhfId": custBhfId,
        "sarTyCd": sarTyCd,
        "ocrnDt": ocrnDt,
        "totItemCnt": totItemCnt,
        "totTaxblAmt": totTaxblAmt,
        "totTaxAmt": totTaxAmt,
        "totAmt": totAmt,
        "remark": remark,
        "regrNm": regrNm,
        "regrId": regrId,
        "modrNm": modrNm,
        "modrId": modrId,
        "itemSeq": itemSeq,
        "itemCd": itemCd,
        "itemClsCd": itemClsCd,
        "itemNm": itemNm,
        "bcd": bcd,
        "pkgUnitCd": pkgUnitCd,
        "pkg": pkg,
        "qtyUnitCd": qtyUnitCd,
        "qty": qty,
        "itemExprDt": itemExprDt,
        "prc": prc,
        "splyAmt": splyAmt,
        "totDcAmt": totDcAmt,
        "taxTyCd": taxTyCd,
        "taxblAmt": taxblAmt,
        "taxTyCd": taxTyCd,
        "taxAmt": taxAmt,
        "totAmt": totAmt
    }
    return await client._post("/stock/saveStockItems", payload)

router.post("/stockMaster/saveStockMaster")
async def addMasterStockItem(tpin: str, bhfId: str, itemCd: str, rsdQty: float, regrNm: str, regrId: str, modrNm: str, modrId: str):
    payload = {
        "tpin": tpin,
        "bhfId": bhfId,
        "itemCd": itemCd,
        "rsdQty": rsdQty,
        "regrNm": regrNm,
        "regrId": regrId,
        "modrNm": modrNm,
        "modrId": modrId
    }
    return await client._post("/stockMaster/saveStockMaster", payload)

