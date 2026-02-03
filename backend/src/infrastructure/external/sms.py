# backend/src/infrastructure/external/sms.py
import sys
from backend.src.domain.interfaces import ISmsService

class ConsoleSmsService(ISmsService):
    """
    مخصوص محیط توسعه:
    پیامک را به جای ارسال واقعی، در کنسول چاپ می‌کند.
    """
    async def send_otp(self, mobile: str, code: str) -> bool:
        # چاپ بنر واضح برای دیده شدن راحت در لاگ‌های شلوغ
        print("\n" + "="*50, file=sys.stdout)
        print(f"📱 [SMS MOCK] To:   {mobile}", file=sys.stdout)
        print(f"🔑 [OTP CODE] Code: {code}", file=sys.stdout)
        print("="*50 + "\n", file=sys.stdout, flush=True) # ✅ flush=True خیلی مهم است
        return True

class RemoteSmsService(ISmsService):
    def __init__(self, api_key: str, sender_number: str = ""):
        self.api_key = api_key
        self.sender_number = sender_number

    async def send_otp(self, mobile: str, code: str) -> bool:
        try:
            # TODO: Implement real provider
            print(f"🚀 [REAL SMS] Sending code {code} to {mobile}...", flush=True)
            return True
        except Exception as e:
            print(f"❌ SMS Failed: {e}", flush=True)
            return False