"""
Xero-ZRA Integration - Main Application
FastAPI backend with Xero and ZRA VSDC integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.integrations.xero import router as xero_router
from app.integrations.zra import router as zra_router

app = FastAPI(
    title="Xero-ZRA Integration",
    description="Bridge between Xero accounting and ZRA Smart Invoice VSDC",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://xero-zra-integration.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(xero_router)
app.include_router(zra_router)

@app.get("/")
async def root():
    return {
        "message": "Xero-ZRA Integration API",
        "version": "2.0.0",
        "endpoints": {
            "xero": "/xero/*",
            "zra": "/zra/*"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}