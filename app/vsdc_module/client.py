# Shared VSDC client singleton for the vsdc_module
from .vsdc_client import VSDCClient

# Singleton instance to be used across the module
client = VSDCClient()

