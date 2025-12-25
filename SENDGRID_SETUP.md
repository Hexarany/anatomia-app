# Настройка SendGrid для отправки email

Эта инструкция подходит для VPS с Docker.

## Почему Gmail SMTP может не работать
У некоторых провайдеров исходящие SMTP-порты могут быть ограничены. В таких случаях SendGrid (через API) работает стабильнее, чем прямой SMTP.

## Шаги
1) Зарегистрируйтесь в SendGrid и создайте API ключ (Full Access или Restricted с Mail Send).
2) Верифицируйте отправителя (Single Sender или домен).
3) Добавьте переменные окружения в `/opt/Mateev/.env`:
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@ваш-домен
```
4) Пересоздайте контейнер:
```
docker stop mateev
docker rm mateev
docker run -d --name mateev \
  --restart unless-stopped \
  --env-file /opt/Mateev/.env \
  -p 127.0.0.1:3000:3000 \
  -v /opt/Mateev/uploads:/app/server/uploads \
  mateev:latest
```
5) Проверьте логи:
```
docker logs -n 100 mateev
```
Должно быть: `Email service initialized (SendGrid)`.

## Troubleshooting
- Проверьте `SENDGRID_API_KEY` и `SENDGRID_FROM_EMAIL`.
- Убедитесь, что sender верифицирован.
- Проверьте папку Spam у получателя.
