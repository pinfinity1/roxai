# backend/tests/conftest.py
import pytest
import pytest_asyncio  
from unittest.mock import AsyncMock
from httpx import AsyncClient, ASGITransport
from backend.src.main import app
from backend.src.application.services.auth_service import AuthService
from backend.src.presentation.api.v1.auth import get_auth_service
from backend.src.domain.entities.user import User, UserRole

@pytest.fixture
def mock_redis():
    redis = AsyncMock()
    redis.check_rate_limit.return_value = True
    redis.get_otp.return_value = "123456"
    redis.get_identifier_by_token.return_value = "09121111111"
    return redis

@pytest.fixture
def mock_user_repo():
    repo = AsyncMock()
    repo.get_by_email.return_value = None
    repo.get_by_mobile.return_value = None
    repo.create.return_value = User(
        id="test-uuid",
        mobile="09121111111",
        role=UserRole.FREE,
        is_verified=True
    )
    return repo

@pytest.fixture
def override_dependency(mock_user_repo, mock_redis):
    auth_service = AuthService(user_repo=mock_user_repo, redis_client=mock_redis)
    app.dependency_overrides[get_auth_service] = lambda: auth_service
    yield
    app.dependency_overrides = {}


@pytest_asyncio.fixture
async def async_client(override_dependency):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client