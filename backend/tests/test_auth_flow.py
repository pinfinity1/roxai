import pytest
from backend.src.domain.entities.user import User
from pwdlib import PasswordHash

pwd_context = PasswordHash.recommended()

@pytest.mark.asyncio
class TestAuthFlow:
    
    async def test_identify_new_user(self, async_client, mock_user_repo):
        """باید تشخیص دهد کاربر جدید است و مرحله بعد ثبت‌نام (register) است"""
        mock_user_repo.get_by_mobile.return_value = None 

        response = await async_client.post("/api/v1/auth/identify", json={
            "identifier": "09121111111"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is False
        assert data["next_step"] == "register" 
        assert data["detected_type"] == "mobile"

    async def test_send_otp(self, async_client, mock_redis):
        response = await async_client.post("/api/v1/auth/otp/send", json={"identifier": "09121111111"})
        assert response.status_code == 200
        mock_redis.set_otp.assert_called_once()

    async def test_verify_otp_success(self, async_client, mock_redis):
        mock_redis.get_otp.return_value = "123456"
        response = await async_client.post("/api/v1/auth/otp/verify", json={"identifier": "09121111111", "code": "123456"})
        assert response.status_code == 200
        assert "verification_token" in response.json()

    async def test_login_wrong_password(self, async_client, mock_user_repo):
        hashed_pw = pwd_context.hash("correct")
        mock_user_repo.get_by_mobile.return_value = User(mobile="09121111111", hashed_password=hashed_pw)
        response = await async_client.post("/api/v1/auth/login", json={"identifier": "09121111111", "password": "wrong"})
        assert response.status_code == 400