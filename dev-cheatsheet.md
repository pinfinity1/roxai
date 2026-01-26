# دستورات پرکاربرد پروژه

## ۱. گرفتن ساختار فایل‌ها (برای Context Engineer)

tree -I "node_modules|venv|.git|.next|**pycache**|.DS_Store|dist|build"

## ۲. اجرای داکر

docker compose up -d

## ۳. اجرای فرانت

cd frontend && npm run dev

## ۴. دستور tree

tree -I "node_modules|venv|**pycache**|.git|.next|.mypy_cache|dist|build|postgres_data|minio_data|.DS_Store" --dirsfirst
