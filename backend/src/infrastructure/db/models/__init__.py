# اکسپورت کردن Base برای دسترسی راحت‌تر
from .base import Base

# (اختیاری) بعداً مدل‌های دیگر را هم اینجا ایمپورت می‌کنیم تا Alembic آنها را ببیند
from .user import UserModel