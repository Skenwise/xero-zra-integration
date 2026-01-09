from typing import List, Optional
from pydantic import BaseModel
from schema import (
    CustomerSchema, BranchSchema, BranchCustomerSchema,
    UserAccountSchema, ItemSchema, ImportItemSchema,
    SalesTransactionSchema, PurchaseTransactionSchema,
    StockSchema, StockMasterSchema
)
from response_schema import ResponseBase

# =============================
# Nested Customer with Branches
# =============================
# Represents a branch and all its associated customers.
class BranchWithCustomers(BaseModel):
    branch: BranchSchema
    customers: List[CustomerSchema]

# =============================
# Nested Branch Customer with User Accounts
# =============================
# Represents a branch customer and all user accounts linked to them.
class BranchCustomerWithUsers(BaseModel):
    branch_customer: BranchCustomerSchema
    user_accounts: List[UserAccountSchema]

# =============================
# Nested Item with Import Items
# =============================
# Represents an item along with all its import-related records.
class ItemWithImports(BaseModel):
    item: ItemSchema
    import_items: Optional[List[ImportItemSchema]] = []

# =============================
# Sales Transaction with Items
# =============================
# Represents a sales transaction along with all items sold in that transaction.
class SalesTransactionWithItems(BaseModel):
    transaction: SalesTransactionSchema
    items: List[ItemSchema]

# =============================
# Purchase Transaction with Items
# =============================
# Represents a purchase transaction along with all items purchased in that transaction.
class PurchaseTransactionWithItems(BaseModel):
    transaction: PurchaseTransactionSchema
    items: List[ItemSchema]

# =============================
# Stock with Stock Master
# =============================
# Represents a stock record along with its stock master details.
class StockWithMaster(BaseModel):
    stock: StockSchema
    stock_master: Optional[StockMasterSchema] = None

# =============================
# Aggregate Responses
# =============================
# Response wrapper for branches with nested customers.
class CustomerBranchResponse(ResponseBase):
    branches: List[BranchWithCustomers]

# Response wrapper for branch customers with nested user accounts.
class BranchCustomerUserResponse(ResponseBase):
    branch_customers: List[BranchCustomerWithUsers]

# Response wrapper for items with nested import items.
class ItemImportResponse(ResponseBase):
    items: List[ItemWithImports]

# Response wrapper for sales transactions with nested items.
class SalesTransactionResponse(ResponseBase):
    transactions: List[SalesTransactionWithItems]

# Response wrapper for purchase transactions with nested items.
class PurchaseTransactionResponse(ResponseBase):
    transactions: List[PurchaseTransactionWithItems]

# Response wrapper for stock records with nested stock master data.
class StockResponse(ResponseBase):
    stocks: List[StockWithMaster]
