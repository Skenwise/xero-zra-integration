"""
ZRA Storage Models - Redis JSON Implementation
Stores ZRA org config and item mappings per Xero tenant
Matches existing app/core/session.py patterns: async, JSON strings, proper key prefixes
"""

import json
from typing import Optional, Dict, Any
from app.core.redis_client import _get_redis_client


# Redis key prefixes (matching Session: pattern from session.py)
ZRA_CONFIG_PREFIX = "ZRAConfig:"
ITEM_MAPPING_PREFIX = "ItemMapping:"


class ZraOrgConfig:
    """ZRA Organization Configuration stored in Redis as JSON"""
    
    def __init__(
        self,
        xero_tenant_id: str,
        zra_tpin: str,
        zra_bhf_id: str,
        zra_dvc_srl_no: str,
        environment: str = "sandbox"
    ):
        self.xero_tenant_id = xero_tenant_id
        self.zra_tpin = zra_tpin
        self.zra_bhf_id = zra_bhf_id
        self.zra_dvc_srl_no = zra_dvc_srl_no
        self.environment = environment
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "xero_tenant_id": self.xero_tenant_id,
            "zra_tpin": self.zra_tpin,
            "zra_bhf_id": self.zra_bhf_id,
            "zra_dvc_srl_no": self.zra_dvc_srl_no,
            "environment": self.environment
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ZraOrgConfig":
        return cls(
            xero_tenant_id=data["xero_tenant_id"],
            zra_tpin=data["zra_tpin"],
            zra_bhf_id=data["zra_bhf_id"],
            zra_dvc_srl_no=data["zra_dvc_srl_no"],
            environment=data.get("environment", "sandbox")
        )
    
    @classmethod
    def _get_redis_key(cls, xero_tenant_id: str) -> str:
        return f"{ZRA_CONFIG_PREFIX}{xero_tenant_id}"
    
    async def save(self) -> None:
        """Save config to Redis as JSON string (matches session.py pattern)"""
        redis = _get_redis_client()
        if redis is None:
            raise RuntimeError("Redis client not available")
        json_data = json.dumps(self.to_dict())
        await redis.set(self._get_redis_key(self.xero_tenant_id), json_data)
    
    @classmethod
    async def get(cls, xero_tenant_id: str) -> Optional["ZraOrgConfig"]:
        """Retrieve config from Redis JSON string"""
        redis = _get_redis_client()
        if redis is None:
            return None
        raw_data = await redis.get(cls._get_redis_key(xero_tenant_id))
        if raw_data is None:
            return None
        # Decode bytes if needed, then parse JSON
        if isinstance(raw_data, bytes):
            raw_data = raw_data.decode()
        data = json.loads(raw_data)
        return cls.from_dict(data)


class ItemMapping:
    """Xero Item to ZRA Item mapping stored in Redis as JSON"""
    
    def __init__(
        self,
        xero_tenant_id: str,
        xero_item_code: str,
        zra_item_cd: str,
        zra_item_cls_cd: str,
        zra_qty_unit_cd: str,
        zra_pkg_unit_cd: str,
        zra_tax_ty_cd: str = "B"
    ):
        self.xero_tenant_id = xero_tenant_id
        self.xero_item_code = xero_item_code
        self.zra_item_cd = zra_item_cd
        self.zra_item_cls_cd = zra_item_cls_cd
        self.zra_qty_unit_cd = zra_qty_unit_cd
        self.zra_pkg_unit_cd = zra_pkg_unit_cd
        self.zra_tax_ty_cd = zra_tax_ty_cd
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "xero_tenant_id": self.xero_tenant_id,
            "xero_item_code": self.xero_item_code,
            "zra_item_cd": self.zra_item_cd,
            "zra_item_cls_cd": self.zra_item_cls_cd,
            "zra_qty_unit_cd": self.zra_qty_unit_cd,
            "zra_pkg_unit_cd": self.zra_pkg_unit_cd,
            "zra_tax_ty_cd": self.zra_tax_ty_cd
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ItemMapping":
        return cls(
            xero_tenant_id=data["xero_tenant_id"],
            xero_item_code=data["xero_item_code"],
            zra_item_cd=data["zra_item_cd"],
            zra_item_cls_cd=data["zra_item_cls_cd"],
            zra_qty_unit_cd=data["zra_qty_unit_cd"],
            zra_pkg_unit_cd=data["zra_pkg_unit_cd"],
            zra_tax_ty_cd=data.get("zra_tax_ty_cd", "B")
        )
    
    @classmethod
    def _get_redis_key(cls, xero_tenant_id: str, xero_item_code: str) -> str:
        # Use colon separator like Session:{id} pattern
        return f"{ITEM_MAPPING_PREFIX}{xero_tenant_id}:{xero_item_code}"
    
    async def save(self) -> None:
        """Save mapping to Redis as JSON string"""
        redis = _get_redis_client()
        if redis is None:
            raise RuntimeError("Redis client not available")
        json_data = json.dumps(self.to_dict())
        await redis.set(self._get_redis_key(self.xero_tenant_id, self.xero_item_code), json_data)
    
    @classmethod
    async def get(cls, xero_tenant_id: str, xero_item_code: str) -> Optional["ItemMapping"]:
        """Retrieve single mapping from Redis"""
        redis = _get_redis_client()
        if redis is None:
            return None
        raw_data = await redis.get(cls._get_redis_key(xero_tenant_id, xero_item_code))
        if raw_data is None:
            return None
        if isinstance(raw_data, bytes):
            raw_data = raw_data.decode()
        data = json.loads(raw_data)
        return cls.from_dict(data)
    
    @classmethod
    async def get_all_for_tenant(cls, xero_tenant_id: str) -> Dict[str, "ItemMapping"]:
        """
        Get all item mappings for a tenant as a dictionary.
        Returns: {xero_item_code: ItemMapping}
        Uses SCAN to find all keys matching the tenant pattern.
        """
        mappings = {}
        redis = _get_redis_client()
        if redis is None:
            return mappings
        
        # Pattern matches ItemMapping:{tenant_id}:*
        pattern = f"{ITEM_MAPPING_PREFIX}{xero_tenant_id}:*"
        cursor = 0
        
        while True:
            cursor, keys = await redis.scan(cursor, match=pattern, count=100)
            for key in keys:
                # Handle bytes key
                if isinstance(key, bytes):
                    key = key.decode()
                raw_data = await redis.get(key)
                if raw_data is not None:
                    if isinstance(raw_data, bytes):
                        raw_data = raw_data.decode()
                    data = json.loads(raw_data)
                    mapping = cls.from_dict(data)
                    mappings[mapping.xero_item_code] = mapping
            if cursor == 0:
                break
        return mappings


# === Helper Functions (async to match storage pattern) ===

async def get_zra_config(xero_tenant_id: str) -> Optional[ZraOrgConfig]:
    """Get ZRA config for a tenant"""
    return await ZraOrgConfig.get(xero_tenant_id)


async def get_item_mapping_dict(xero_tenant_id: str) -> Dict[str, ItemMapping]:
    """Get all item mappings for a tenant as a dictionary"""
    return await ItemMapping.get_all_for_tenant(xero_tenant_id)


async def save_zra_config(config: ZraOrgConfig) -> None:
    """Save ZRA config"""
    await config.save()


async def save_item_mapping(mapping: ItemMapping) -> None:
    """Save item mapping"""
    await mapping.save()