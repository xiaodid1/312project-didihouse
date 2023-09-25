FROM node:16 AS react-build

WORKDIR /frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./

RUN npm run build

FROM python:3.9

WORKDIR /app

COPY backend/ ./

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY --from=react-build /frontend/build /app/static

CMD ["python", "app.py"]