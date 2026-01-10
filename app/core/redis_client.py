import os
from typing import Optional, Dict, Any
import json
from redis.asyncio import Redis

# Lazy Redis client initialization
_redis_client = None

def _get_redis_client():
    global _redis_client
    if _redis_client is None:
        redis_url = os.environ.get("REDIS_URL")
        if redis_url is None:
            print("Redis URL is not set")
            _redis_client = None
        else:
            try:
                _redis_client = Redis.from_url(redis_url, decode_responses=True)
                print("Redis client initialized successfully")
            except Exception as e:
                print(f"Failed to initialize Redis client: {e}")
                _redis_client = None
    return _redis_client

class RedisSessionManager:
    def __init__(self, prefix: str = "Session:"):
        self.prefix = prefix

    def _get_redis(self):
        return _get_redis_client()
    
    def _key(self, session_id: str) -> str:
        return f"{self.prefix}{session_id}"
    
    async def set_session(self, session_id: str, data: Dict[str, Any]):
        redis = self._get_redis()
        if redis is None:
            print("Redis client not available, skipping set_session")
            return
        json_data = json.dumps(data)
        await redis.set(self._key(session_id), json_data)

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        redis = self._get_redis()
        if redis is None:
            return None
        raw_data = await redis.get(self._key(session_id))
        if raw_data is None:
            return None
        
        return json.loads(raw_data)

    async def update_session(self, session_id: str, key: str, value: Any):
        session = await self.get_session(session_id) or {}
        session[key] = value
        await self.set_session(session_id, session)

    async def delete_session(self, session_id: str):
        redis = self._get_redis()
        if redis is None:
            return
        await redis.delete(self._key(session_id))

    async def get(self, session_id: str, key: str) -> Optional[Any]:
        session = await self.get_session(session_id)
        if session is None:
            return None
        return session.get(key)
    
    async def set(self, session_id, key: str, value: Any):
        await self.update_session(session_id, key, value)

# Lazy session manager
def get_session_manager():
    return RedisSessionManager()

