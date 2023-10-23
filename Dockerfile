FROM node:16 AS react-build

WORKDIR /frontend

COPY frontend/package*.json ./

#RUN npm install antd --save

RUN npm install

COPY frontend/ ./

RUN npm run build

FROM python:3.9

WORKDIR /app

COPY backend/ ./

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY --from=react-build /frontend/build /app/static

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait

RUN chmod +x /wait

CMD /wait && python3 -u app.py