#!/bin/bash
set -e

cd frontend
npm install --include=dev
npm run dev -- --port 8080
cd ..

pip install -r requirements.txt

mkdir -p static
cp -r frontend/dist/* static/

uvicorn app:app --host 0.0.0.0 --port $PORT
