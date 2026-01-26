from typing import Any, Optional

class ServiceResult:
    def __init__(self, success: bool, data: Any = None, status_code: int = 200, message: str = ""):
        self.success = success
        self.data = data
        self.status_code = status_code
        self.message = message