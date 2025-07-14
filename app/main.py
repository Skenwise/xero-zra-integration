from fastapi import FastAPI
from app.api import xero_routes

app = FastAPI()
app.include_router(xero_routes.router)