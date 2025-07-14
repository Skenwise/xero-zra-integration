from typing import Optional, Dict, Any
import json
from redis.asyncio import Redis

class RedisSessionManager:
    def __init__(self, redis: Redis, prefix: str = "Session:"):
        self.redis = redis
        self.prefix = prefix

    def _key(self, session_id: str) -> str:
        return f"{self.prefix}{session_id}"
    
    async def set_session(self, session_id: str, data: Dict[str, Any]):
        json_data = json.dumps(data)
        await self.redis.set(self._key(session_id), json_data)

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        raw_data = await self.redis.get(self._key(session_id))
        if raw_data is None:
            return None
        
        return json.loads(raw_data)

    async def update_session(self, session_id: str, key: str, value: Any):
        session = await self.get_session(session_id) or {}
        session[key] = value
        await self.set_session(session_id, session)

    async def delete_session(self, session_id: str):
        await self.redis.delete(self._key(session_id))

    async def get(self, session_id: str, key: str) -> Optional[Any]:
        session = await self.get_session(session_id)
        if session is None:
            return None
        return session.get(key)
    
    async def set(self, session_id, key: str, value: Any):
        await self.update_session(session_id, key, value)
