from fastapi import HTTPException
import os
from redis.asyncio import Redis
from starlette.requests import Request

from app.core.redis_client import RedisSessionManager

redis_url= os.getenv("REDIS_URL")

if not redis_url:
    print("redis URL is not set")
    raise RuntimeError("REDIS_URL environment is not set")

 
redis_client = Redis.from_url(redis_url, decode_responses=True)

# setting up redis 
session_manager = RedisSessionManager(redis_client)

# session context
class SessionContext:
    def __init__(self, session_id: str, manager: RedisSessionManager):
        self.session_id = session_id
        self.manager = manager
    
# get_session dependency
async def get_session(request: Request) -> SessionContext:
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="No active session")   
    return SessionContext(session_id, session_manager)
