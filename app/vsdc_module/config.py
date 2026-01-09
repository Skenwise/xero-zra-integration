"""
ZRA VSDC module - Configuration manager and loader
==================================================
Purpose: Load setting from Yaml file and .env file
Author: Skenwise
"""

import os
import yaml
from dotenv import load_dotenv
from typing import Any, Dict, List

class configuration:
    def __init__(self, yaml_file: str = "default.yaml", env_file: str = ".env"):
        self.config: Dict[Any, str] = {}
        self.yaml_file = yaml_file
        self.env_file = yaml_file

    def load_config(self) -> Dict[Any, str]:
        # load configuration from yaml file and .env file.
        # Environment varialbles override YAML values.
        # return: Dictionnary containing merge configuration

        #load yaml configuration first as basic configuration
        self._load_yaml()

        # load .env configuration file and override with .env configuration
        self._load_env()

        return self.config
    
    def _load_yaml(self) -> None:
        # load Yaml file configuration
        yaml_path = os.path.join(os.path.dirname(__file__), self.yaml_file)

        try:
            with open(yaml_path, "r") as f:
                yaml_config = yaml.safe_load(f)
                if yaml_config:
                    self.config.update(yaml_config)
                    print(f"Yaml configuration loaded successfully from {self.yaml_file}")
        except FileNotFoundError:
            print(f"Warning: {self.yaml_file} not found.")
        except yaml.YAMLError as e:
            print(f"X error parsing yaml file: {e}")
            raise

    def _load_env(self) -> None:
        # load env file configuration

        env_path = os.path.join(os.path.dirname(__file__), self.env_file)

        load_dotenv(dotenv_path=env_path)

        env_config = {}
        
        #declare specific env variables
        env_vars = [
            "TPIN",
            "BHFLD",
            "VSDC_BASE_URL",
            "VSDC_API_KEY",
            "DvcSrlNo"
        ]

        # load the specific var
        for var in env_vars:
            value = os.getenv(var)
            if value is not None:
                env_config[var] = value
        
        # add env variable to the config dictionnary
        self.config.update(env_config)
        print(f"Loaded {len(env_config)} environment variable from {self.env_file}")

    def get(self, key: str, default: Any = None) -> Any:
        #Get configuration value by key
        # Args
        #   key: Configuration Key
        #   default: Default value return when configuration key is not found
        # return: Value from the configuration Key

        #support nested keys e.g: database.host
        keys: List[str]= key.split('.')
        value: Any = self.config

        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default

    def get_all(self) -> Dict[str, Any]:
    # return all the configuration
        return self.config.copy()
    
    def __getItem__(self, key: str) -> Any:
    # get value with a dictionnary style access
     return self.config[key]





    