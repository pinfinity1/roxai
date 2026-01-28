from backend.src.domain.interfaces import ISmsService
import os

class ConsoleSmsService(ISmsService):
    """
    مخصوص محیط توسعه:
    پیامک را به جای ارسال واقعی، در کنسول چاپ می‌کند.
    """
    async def send_otp(self, mobile: str, code: str) -> bool:
        print(f"📨 [SMS DEV] To: {mobile} | Code: {code}")
        return True

class RemoteSmsService(ISmsService):
    """
    مخصوص محیط پروداکشن:
    این کلاس اسکلت‌بندی اتصال به پنل پیامک واقعی است.
    شما بعداً می‌توانید کد HTTP Request مربوط به هر شرکتی را اینجا بنویسید.
    """
    def __init__(self, api_key: str, sender_number: str = ""):
        self.api_key = api_key
        self.sender_number = sender_number

    async def send_otp(self, mobile: str, code: str) -> bool:
        try:
            # ---------------------------------------------------------
            # TODO: اینجا کد اتصال به API سرویس‌دهنده پیامک خود را بنویسید
            # مثال سودوکد (Pseudo-code):
            # response = httpx.post(url, json={'to': mobile, 'msg': code})
            # ---------------------------------------------------------
            print(f"🚀 [REAL SMS] Sending code {code} to {mobile} via Provider...")
            return True
        except Exception as e:
            print(f"❌ SMS Failed: {e}")
            return False