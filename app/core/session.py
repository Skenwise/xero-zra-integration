from fastapi import HTTPException
import uuid
from typing import Optional
from redis.asyncio import Redis
from starlette.requests import Request
from app.core.redis_client import RedisSessionManager, get_session_manager

# Lazy session manager - get it when needed
_session_manager = None

def _get_session_manager():
    global _session_manager
    if _session_manager is None:
        _session_manager = get_session_manager()
    return _session_manager

# session context
class SessionContext:
    def __init__(self, session_id: str, manager: RedisSessionManager):
        self.session_id = session_id
        self.manager = manager

# get_session dependency
async def get_session(request: Request, login: bool = False) -> SessionContext:
    session_id = request.cookies.get("session_id")
    print(f"the session id is: {session_id}")
    if not session_id:

        if login:
            session_id = str(uuid.uuid4())
        else:
            raise HTTPException(status_code=401, detail="No active session")
    
    return SessionContext(session_id, _get_session_manager())

# create session for login
async def create_session(request: Request) -> SessionContext:
    
    return await get_session(request, login=True)

