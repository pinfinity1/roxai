# دستورات پرکاربرد پروژه

## ۰. راه‌اندازی محیط مجازی (فقط بار اول یا در صورت خرابی)

rm -rf venv
python3.13 -m venv venv
source venv/bin/activate

## ۱. گرفتن ساختار فایل‌ها (برای Context Engineer)

tree -I "node_modules|venv|.git|.next|**pycache**|.DS_Store|dist|build"

## ۲. اجرای داکر (دیتابیس و ردیس)

docker compose up -d

## ۳. آماده‌سازی بک‌اند (نصب پکیج‌های جدید)

pip install -r backend/requirements-dev.txt

## ۴. اجرای تست‌ها (Backend Tests)

pytest

## ۵. اجرای سرور بک‌اند (FastAPI)

uvicorn backend.src.main:app --reload --port 8000

## ۶. اجرای فرانت (Frontend)

cd frontend && npm run dev

## ۷. دستور tree کامل (Excluded Directories)

tree -I "node_modules|venv|**pycache**|.git|.next|.mypy_cache|dist|build|postgres_data|minio_data|.DS_Store" --dirsfirst

npx repomix --include "backend/**,docker-compose.yml,pytest.ini,docs/**,\*.md"

npx repomix --include "frontend/**,docs/**,\*.md,docker-compose.yml"
