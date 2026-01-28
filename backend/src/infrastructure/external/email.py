import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from backend.src.domain.interfaces import IEmailService

class ConsoleEmailService(IEmailService):
    """مخصوص محیط توسعه: چاپ در کنسول"""
    async def send_otp(self, email: str, code: str) -> bool:
        print(f"📧 [EMAIL DEV] To: {email} | Subject: Roxai Verification | Code: {code}")
        return True

class SmtpEmailService(IEmailService):
    """مخصوص پروداکشن: ارسال واقعی با SMTP"""
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.sender_email = os.getenv("SMTP_SENDER", self.smtp_user)

    async def send_otp(self, email: str, code: str) -> bool:
        try:
            msg = MIMEMultipart()
            msg['From'] = f"Roxai Security <{self.sender_email}>"
            msg['To'] = email
            msg['Subject'] = "کد تایید ورود به روکسی"

            # تمپلیت ساده HTML
            html = f"""
            <div dir="rtl" style="font-family: Tahoma, sans-serif; text-align: center; padding: 20px;">
                <h2>کد تایید شما</h2>
                <p style="font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #3b82f6;">{code}</p>
                <p style="color: #666;">این کد تا ۲ دقیقه معتبر است.</p>
            </div>
            """
            msg.attach(MIMEText(html, 'html'))

            # ارسال (Blocking I/O است ولی برای شروع کافیست. در آینده می‌توان به Celery برد)
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            print(f"🚀 [REAL EMAIL] Sent code to {email}")
            return True
        except Exception as e:
            print(f"❌ Email Failed: {e}")
            return False