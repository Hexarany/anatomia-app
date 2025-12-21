# Настройка SendGrid для отправки Email

## Почему Gmail SMTP не работает на Render?

### Проблема: Connection Timeout

При попытке отправить email через Gmail SMTP (smtp.gmail.com) с сервера Render возникает ошибка:

```
Error: Connection timeout
code: 'ETIMEDOUT',
command: 'CONN'
```

### Причины:

1. **Блокировка SMTP портов облачными провайдерами**
   - Render, как и многие облачные платформы (AWS, Google Cloud, Heroku), **блокирует исходящие подключения** на стандартные SMTP порты (25, 465, 587)
   - Это мера безопасности для предотвращения спама и злоупотреблений
   - Даже если изменить порт на 465 с SSL, проблема остается

2. **Ограничения Gmail**
   - Gmail имеет строгие лимиты на отправку (500 emails/день для бесплатных аккаунтов)
   - Gmail может блокировать подключения с незнакомых IP адресов облачных серверов
   - Требуется "App Password", который может не работать стабильно на серверах

3. **Нестабильность соединения**
   - Даже если подключение работает, Gmail может случайно разрывать соединение
   - Это приводит к потере emails и плохому пользовательскому опыту

### Решение: SendGrid

**SendGrid** - это профессиональный email-сервис, специально разработанный для облачных приложений:

✅ **Работает без блокировок** - использует API вместо SMTP портов
✅ **Надежная доставка** - 99.9% uptime
✅ **Бесплатный план** - 100 emails в день (достаточно для тестирования)
✅ **Детальная статистика** - отслеживание открытий, кликов, доставки
✅ **Простая интеграция** - один API ключ вместо настройки SMTP
✅ **Масштабируемость** - легко увеличить до тысяч emails при необходимости

### Альтернативы SendGrid:

Если по какой-то причине SendGrid не подходит, можно использовать:

- **Mailgun** - бесплатно 5,000 emails/месяц
- **Amazon SES** - $0.10 за 1000 emails
- **Postmark** - $15/месяц за 10,000 emails (но очень надежный)
- **Brevo (Sendinblue)** - бесплатно 300 emails/день

Все эти сервисы работают через API и не используют SMTP порты.

---

## Шаг 1: Регистрация в SendGrid

1. Перейдите на https://signup.sendgrid.com/
2. Заполните форму регистрации:
   - **Email**: hexarany@gmail.com
   - **Password**: создайте надежный пароль
   - **Company Name**: Anatomia (или любое название)
   - Выберите галочку "I'm not a robot"
3. Нажмите **Create Account**
4. Подтвердите email (проверьте почту hexarany@gmail.com)

## Шаг 2: Настройка аккаунта

После входа вас могут попросить:

1. **Tell us about yourself**:
   - Role: Developer
   - Company Size: Just me
   - Will you be sending email on behalf of: Just me

2. **What do you plan to do first?**:
   - Выберите "Integrate using our Web API or SMTP Relay"

3. Нажмите **Get Started**

## Шаг 3: Создание API Key

### Вариант A: Через Setup Guide (если показывается)

1. Выберите **Web API** (рекомендуется)
2. Выберите язык: **Node.js**
3. Введите имя для ключа: `Anatomia App`
4. Нажмите **Create Key**
5. **ВАЖНО**: Скопируйте ключ и сохраните в безопасном месте!
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Ключ показывается только один раз!

### Вариант B: Через Settings (если Setup Guide не показывается)

1. В левом меню нажмите **Settings** ⚙️
2. Выберите **API Keys**
3. Нажмите синюю кнопку **Create API Key** (справа вверху)
4. Введите:
   - **API Key Name**: `Anatomia App`
   - **API Key Permissions**: выберите **Full Access**
5. Нажмите **Create & View**
6. **ВАЖНО**: Скопируйте ключ и сохраните!
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Шаг 4: Верификация отправителя (Sender)

SendGrid требует верификацию email отправителя:

1. В левом меню: **Settings** → **Sender Authentication**
2. Нажмите **Verify a Single Sender**
3. Нажмите **Create New Sender**
4. Заполните форму:
   - **From Name**: Anatomia App
   - **From Email Address**: hexarany@gmail.com
   - **Reply To**: hexarany@gmail.com
   - **Company Address**: ваш адрес
   - **City**: ваш город
   - **Country**: Moldova (или ваша страна)
5. Нажмите **Create**
6. Проверьте почту hexarany@gmail.com
7. Кликните на ссылку верификации в письме от SendGrid

## Шаг 5: Настройка Render

1. Зайдите на https://dashboard.render.com
2. Откройте ваш сервис **anatomia-app-docker**
3. Перейдите во вкладку **Environment**
4. Добавьте новые переменные (нажмите **Add Environment Variable**):

   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.ваш_скопированный_ключ
   SENDGRID_FROM_EMAIL=hexarany@gmail.com
   SENDGRID_FROM_NAME=Anatomia App
   ```

5. **Удалите старые переменные** (если есть):
   - EMAIL_HOST
   - EMAIL_PORT
   - EMAIL_SECURE
   - EMAIL_USER
   - EMAIL_PASSWORD

6. Нажмите **Save Changes**
7. Render автоматически перезапустит сервер

## Шаг 6: Тестирование

1. Дождитесь завершения deployment на Render (обычно 2-3 минуты)
2. Откройте приложение и попробуйте отправить email
3. Проверьте логи на Render - должно появиться сообщение об успешной отправке

## Лимиты бесплатного плана SendGrid

- **100 emails в день** (достаточно для тестирования и небольшого проекта)
- Если нужно больше, можно перейти на платный план ($19.95/месяц за 50,000 emails)

## Проверка статистики отправки

1. В SendGrid: **Activity** → **Email Activity**
2. Здесь можно увидеть все отправленные emails и их статусы

## Troubleshooting

### Если email не приходит:

1. Проверьте **Email Activity** в SendGrid - там видно статус доставки
2. Проверьте папку Spam
3. Убедитесь, что sender верифицирован (шаг 4)
4. Проверьте логи на Render на наличие ошибок

### Если получаете ошибку "Sender not verified":

- Вернитесь к шагу 4 и завершите верификацию email

### Если ключ не работает:

- Создайте новый API ключ (старый можно удалить)
- Убедитесь, что выбрали **Full Access**
