# Развертывание на VPS (Docker + Nginx)

Это руководство для деплоя на VPS. Dockerfile собирает `client` и `server` в одном образе.

## Требования
- Ubuntu 22.04+
- Docker
- Nginx
- Домен направлен на IP VPS

## Быстрый деплой
1) Клонировать репозиторий на сервере:
```
cd /opt/Mateev
# или другое рабочее место
```

2) Создать `/opt/Mateev/.env` (не коммитить):
```
NODE_ENV=production
PORT=3000
MONGODB_URI=...
JWT_SECRET=...
CLIENT_URL=https://mateevmassage.com,https://www.mateevmassage.com
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_URL=https://mateevmassage.com/api/telegram/webhook
```

3) Собрать образ и запустить контейнер:
```
docker build -t mateev:latest .
docker run -d --name mateev \
  --restart unless-stopped \
  --env-file /opt/Mateev/.env \
  -p 127.0.0.1:3000:3000 \
  -v /opt/Mateev/uploads:/app/server/uploads \
  mateev:latest
```

4) Настроить Nginx (reverse proxy на `localhost:3000`).

5) Получить HTTPS через certbot:
```
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d mateevmassage.com -d www.mateevmassage.com
```

6) Проверка:
```
curl -I https://mateevmassage.com/health
```

## Обновление кода
```
cd /opt/Mateev
git pull origin main
docker build -t mateev:latest .
docker stop mateev
docker rm mateev
docker run -d --name mateev \
  --restart unless-stopped \
  --env-file /opt/Mateev/.env \
  -p 127.0.0.1:3000:3000 \
  -v /opt/Mateev/uploads:/app/server/uploads \
  mateev:latest
```

## Заметки
- Не храните `.env` в Git.
- Для изменения переменных окружения пересоздайте контейнер.
- Проверяйте логи: `docker logs -n 100 mateev`.
