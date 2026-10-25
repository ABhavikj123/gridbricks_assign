from threading import RLock
from typing import Any


class CacheManager:
    def __init__(self) -> None:
        self._data: dict[str, Any] = {}
        self._lock = RLock()

    def get(self, key: str) -> Any | None:
        with self._lock:
            return self._data.get(key)

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._data[key] = value


CACHE = CacheManager()
