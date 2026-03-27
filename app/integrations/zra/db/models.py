from sqlalchemy import Column, Integer,  String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

#Foundation class
class Foundation(Base):

    tpin = Column(String, primary_key=True, index=True)
    bhfId = Column(String, nullable=False, index=True)
    lastReqDt = Column(DateTime, unique=False, nullable=True, index=True)

# Device Class
class Device(Foundation):
    __tablename__ = "device"

    DvcSrlNo = Column(String, unique=True, nullable=False, index=True)
    lastReqDt = Column(DateTime, unique=False, nullable=False, index=True)

# Code class
class Code(Foundation):
    __tablename__ = "Code"

    lastReqDt = Column(DateTime, unique=False, nullable=False, index=True)

# ItemClass
class ItemClassification(Foundation):
    __tablename__ = "ItemClassification"

    lastReqDt = Column(DateTime, unique=False, nullable=False, index=True)

# Notices class
class Notice(Foundation):
    __tablename__ = "Notice"

    lastReqDt = Column(DateTime, unique=False, nullable=False, index=True)

# Customer class
class Customer(Foundation):
    __tablename__ = "Customer"

    custmTin = Column(String, unique=True, nullable=False, index=True) 

# Branch class
class Branch(Foundation):
    __tablename__ = "Branch"

    bhfId = Column(String, unique=True, nullable=False, index=True)
    lastReqDt = Column(DateTime, unique=False, nullable=False, index=True)

#common information
class Information(Foundation):

    useYn = Column(String, nullable=False)
    remark = Column(String)
    adrs = Column(String)
    regrNm = Column(String, nullable=False)
    regrId  = Column(String, nullable=False)
    modrNm = Column(String, nullable=False)
    modrId = Column(String, nullable=False)


# branhcUser class
class BranchCustomer(Information):
    __tablename__ = "BranchCustomer"

    custNo = Column(String, unique=True, nullable=False, index=True)
    custTpin = Column(String, unique=True, nullable=False, index=True)
    custNm = Column(String, nullable=False, index=True)
    telNo = Column(String)
    email = Column(String)
    faxNo = Column(String)

# Branch User account
class UserAccount(Information):
    __tablename__ = "UserAccount"

    userID = Column(String, unique=True, nullable=True, index=True)
    userNm = Column(String, nullable=True, index=True)
    pwd = Column(String, nullable=True)
    cntc = Column(String)
    authCd = Column(String)
    
# Item class
class Item(Information):
    __tablename__ = "Item"

    itemClsCd = Column(String, nullable=False, index=True)
    itemCd = Column(String, nullable=False, index=True)
    itemTyCd = Column(String, nullable=False)
    itemNm = Column(String, nullable=False)
    itemStdNm = Column(String)
    orgnNatCd = Column(String, nullable=False)
    pkgUnitCd = Column(String, nullable=False)
    qtyUnitCd = Column(String, nullable=False)
    taxTyCd = Column(String, nullable=False)
    btchNo = Column(String)
    bcd = Column(String)
    dftPrc = Column(Float, nullable=False)
    grpPrcL1 = Column(Float)
    grpPrcL2 = Column(Float)
    grpPrcL3 = Column(Float)
    grpPrcL4 = Column(Float)
    grpPrcL5 = Column(Float)
    addInfo = Column(String)
    sftyQty = Column(String)
    isrcAplcbYn = Column(String)

# ImportItem Class
class ImportItem(Information):
    __tablename__ = "ImportItem"

    taskCd = Column(String, nullable=False)
    dclDe = Column(String, nullbale=False)
    itemSeq = Column(Integer, nullable=False)
    hsCd = Column(String, nullable=False)
    itemClCd = Column(String, nullable=False)
    itemCd = Column(String, nullable=False)
    imptItemsttsCd = Column(String, nullable=False)
    regrNm = Column(String)
    regrId  = Column(String)

# SalesTransactionDetails class
class TransactionDetails(Information):

    rcptTyCd = Column(String, nullable=False)
    pmtTyCd = Column(String)
    cfmDt = Column(DateTime, nullable=False)
    cnclDt = Column(DateTime)
    cnclReqDt = Column(DateTime)
    rfdDt = Column(DateTime)
    rfdRsnCd = Column(String)
    totItemCnt = Column(Integer, nullable=False)
    taxblAmtA = Column(Float, nullable=False)
    taxblAmtB = Column(Float, nullable=False)
    taxblAmtC = Column(Float, nullable=False)
    taxblAmtD = Column(Float, nullable=False)
    taxRtA = Column(Float, nullbale=False)
    taxRtB = Column(Float, nullable=False)
    taxRtC = Column(Float, nullable=False)
    taxRtD = Column(Float, nullable=False)
    taxAmtA = Column(Float, nullable=False)
    taxAmtB = Column(Float, nullable=False)
    taxAmtC = Column(Float, nullable=False)
    taxAmtD = Column(Float, nullable=False)
    totTaxblAmt = Column(Float, nullable=False)
    totTaxAmt = Column(Float, nullable=False)
    totAmt = Column(Float, nullable=False)
    prchrAcptcYn = Column(String, nullable=False)
    itemSeq = Column(Integer, nullable=False)
    itemNm = Column(String, nullable=False)
    itemCd = Column(String, nullable=False)
    itemClsCd = Column(String)
    bcd = Column(String)
    pkgUnitCd = Column(String, nullable=False)
    qtyUnitCd = Column(String, nullable=False)
    pkg = Column(Float, nullable=False)
    qty = Column(Float, nullable=False)
    prc = Column(Float, nullable=False)
    taxTyCd = Column(String, nullable=False)
    taxblAmt = Column(Float, nullable=False)
    itemExprDt = Column(DateTime)

# Sales Transaction Class
class SalesTransaction(TransactionDetails):
    __tablename__ = "SalesTransaction"

    invcNo = Column(Integer, nullable=False, unique=True, index=True)
    orgInvcNo = Column(Integer, nullable=False, unique=True)
    custTpin = Column(String)
    prcOrdCd = Column(String, nullable=False)
    custNm = Column(String)
    SalesTyCd = Column(String, nullable=False)
    SalesSttsCd = Column(String, nullable=False)
    SalesDt = Column(DateTime, nullable=False)
    stockRlsDt = Column(DateTime, nullable=False)
    custTIn = Column(String)
    custMblNo = Column(String)
    rptNo = Column(Integer, nullable=False)
    trdeNm = Column(String)
    topMsg = Column(String)
    btmMsg = Column(String)
    splyAmt = Column(Float, nullable=False)
    dcRt = Column(Float, nullable=False)
    dcAmt = Column(Float, nullable=False)
    isrccCd = Column(String)
    isrccNm = Column(String)
    isrcRt = Column(Float)
    isrcAmt = Column(Float)

# PurchaseTransaction class
class PurchaseTransaction(TransactionDetails):
    __tablename__ = "PurchaseTransaction"

    spplrTin = Column(String)
    invcNo = Column(Integer, nullable=False, unique=True, index=True)
    orgInvcNo = Column(Integer, nullable=False, unique=True)
    spplrBhfId = Column(String)
    spplrNm = Column(String)
    spplrInvcNo = Column(Integer)
    spplrSdcID = Column(String)
    regTyCd = Column(String, nullable=False)
    pchsTyCd = Column(String, nullable=False)
    pmtTyCd = Column(String, nullable=False)
    pchsSttsCd = Column(String, nullable=False)
    pchsDt = Column(DateTime, nullable=False)
    wrhsDt = Column(DateTime)
    spplrItemClsCd = Column(String)
    spplrItemCd = Column(String)
    spplrItemNm = Column(String)
    splyAmt = Column(Float, nullable=False)
    dcRt = Column(Float, nullable=False)
    dcAmt = Column(Float, nullable=False)
    taxAmt = Column(Float, nullable=False)

# stock Item 
class Stock(TransactionDetails):
    __tablename__ = "Stock"

    sarNo = Column(Integer, nullable=False, unique=True, index=True)
    orgSarNo = Column(Integer, nullable=False, unique=True)
    regTyCd = Column(String, nullable=False)
    custTpin = Column(String)
    custNm = Column(String)
    custBhfID = Column(String)
    sarTyCd = Column(String, nullable=False)
    ocrnDt = Column(DateTime, nullable=False)
    splyAmt = Column(Float, nullable=False)
    totDcAmt = Column(Float, nullable=False)
    taxAmt = Column(Float, nullable=False)

# Stock Master 
class StockMaster(Information):
    __tablename__ = "StockMaster"

    itemCd = Column(String, nullable=False)
    rsdQty = Column(Float, nullable=False)

# Queue Sales
class QueueSale(Base):
    __tablename__ = "QueueSale"

    id = Column(Integer, primary_key=True, nullable=True, index=True)
    saleType = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    attempts = Column(Integer, default=0)
    lastAttempt = Column(DateTime)
    createdAt = Column(DateTime, default=datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=datetime.now(timezone.utc), onupdate = datetime.now(timezone.utc))
    idempotencyKey = Column(String, nullable=False, index=True)
    paylaoad = Column(Text) 



# ===========================
# RELATIONSHIPS SECTION
# ===========================

# One Branch has many Customers
Branch.customers = relationship("BranchCustomer", backref="branch", cascade="all, delete-orphan")

# One Branch has many User Accounts
Branch.user_accounts = relationship("UserAccount", backref="branch", cascade="all, delete-orphan")

# One Branch has many Items
Branch.items = relationship("Item", backref="branch", cascade="all, delete-orphan")

# One Item Classification can have many Items
ItemClassification.items = relationship("Item", backref="classification", cascade="all, delete-orphan")

# One Item can have many Import Items
Item.import_items = relationship("ImportItem", backref="item", cascade="all, delete-orphan")

# One Customer can have many Sales Transactions
Customer.sales_transactions = relationship("SalesTransaction", backref="customer", cascade="all, delete-orphan")

# One Customer can have many Purchase Transactions
Customer.purchase_transactions = relationship("PurchaseTransaction", backref="customer", cascade="all, delete-orphan")

# One Branch can have many Sales Transactions
Branch.sales_transactions = relationship("SalesTransaction", backref="branch", cascade="all, delete-orphan")

# One Branch can have many Purchase Transactions
Branch.purchase_transactions = relationship("PurchaseTransaction", backref="branch", cascade="all, delete-orphan")

# One Item can have many Sales Transaction Details
Item.sales_transaction_details = relationship("TransactionDetails", backref="item", cascade="all, delete-orphan")

# One Item can have many Stock entries
Item.stocks = relationship("Stock", backref="item", cascade="all, delete-orphan")

# One StockMaster belongs to one Item
StockMaster.item = relationship("Item", backref="stock_master", uselist=False)