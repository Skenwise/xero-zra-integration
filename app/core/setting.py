import os
from pathlib import Path
from dotenv import load_dotenv
import subprocess

project_root = Path(__file__).parent.parent.parent

branch = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"]).decode().strip()

if branch == 'main':
    load_dotenv(project_root / '.env')
else:
    load_dotenv(project_root / '.env.local')

print(branch)

REDIS_URL=os.getenv("REDIS_URL")
CLIENT_ID=os.getenv("XERO_CLIENT_ID")
CLIENT_SECRET=os.getenv("XERO_CLIENT_SECRET")
FRONTEND_URL=os.getenv("FRONTEND_URL")
REDIRECT_URI=os.getenv("REDIRECT_URI")

print(REDIS_URL)
print(CLIENT_ID)
print(CLIENT_SECRET)
print(FRONTEND_URL)
print(REDIRECT_URI)