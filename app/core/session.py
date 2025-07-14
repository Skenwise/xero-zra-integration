import uuid
from redis.asyncio import Redis
from starlette.requests import Request

from app.core.redis_client import RedisSessionManager

# setting up redis 
redis_client: Redis = Redis(host="localhost", port=6379, decode_responses=True)
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
        session_id = str(uuid.uuid4())
        await session_manager.set_session(session_id, {})
        request.state.new_session_id = session_id
    
    request.state.session_id = session_id
    return SessionContext(session_id, session_manager)
