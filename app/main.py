from fastapi import FastAPI
from app.api import xero_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(xero_routes.router)

# Enable CORS in fastapi

origins = [
    "https://xero-zra-integration.vercel.app",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"],  # frontend origin
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)
