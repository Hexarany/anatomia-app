# Настройка Resend для отправки email

Эта инструкция подходит для VPS с Docker.

## Что нужно
- Аккаунт в Resend
- API ключ Resend
- Доступ к файлу `/opt/Mateev/.env` на сервере

## Шаги
1) Получите API ключ в Resend (Dashboard → API Keys).
2) Выберите адрес отправителя:
   - тестовый: `onboarding@resend.dev`
   - свой домен: верифицируйте домен в Resend и используйте `noreply@ваш-домен`.
3) Добавьте переменные окружения в `/opt/Mateev/.env`:
```
EMAIL_SERVICE=resend
RESEND_API_KEY=re_... 
RESEND_FROM_EMAIL=onboarding@resend.dev
```
4) Пересоздайте контейнер, чтобы env применились:
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
Должно быть: `Email service initialized (Resend)`.

## Troubleshooting
- Проверьте правильность `RESEND_API_KEY` и `RESEND_FROM_EMAIL`.
- Если используете свой домен, убедитесь, что он верифицирован в Resend.
- Проверьте папку Spam у получателя.
