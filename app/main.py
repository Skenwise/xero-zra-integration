from fastapi import FastAPI
from app.api import xero_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(xero_routes.router)

# Enable CORS in fastapi
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"],  # frontend origin
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)
