# Руководство по развертыванию приложения Anatomia

Это руководство поможет вам развернуть полнофункциональное приложение Anatomia на бесплатных хостингах.

## Архитектура развертывания

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render.com (Node.js + Express)
- **Database**: MongoDB Atlas (уже настроено)

## Предварительные требования

1. Аккаунты на следующих сервисах:
   - [GitHub](https://github.com) - для хранения кода
   - [Vercel](https://vercel.com) - для frontend
   - [Render.com](https://render.com) - для backend
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - база данных (уже настроено)

2. Установленные инструменты:
   - Git
   - Node.js (v18 или выше)

## Шаг 1: Подготовка репозитория GitHub

### 1.1 Инициализация Git репозитория

```bash
cd C:\Users\User\Desktop\Anatomia
git init
git add .
git commit -m "Initial commit: Anatomia application"
```

### 1.2 Создание .gitignore

Убедитесь, что в корне проекта есть файл `.gitignore`:

```
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.*.local
server/.env
client/.env

# Build outputs
dist/
build/
*/dist/
*/build/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Uploads
uploads/
```

### 1.3 Создание GitHub репозитория

1. Перейдите на [GitHub](https://github.com/new)
2. Создайте новый репозиторий (например, `anatomia-app`)
3. **НЕ** инициализируйте с README, .gitignore или лицензией
4. Выполните команды:

```bash
git remote add origin https://github.com/ВАШ_USERNAME/anatomia-app.git
git branch -M main
git push -u origin main
```

## Шаг 2: Развертывание Backend на Render.com

### 2.1 Создание Web Service

1. Перейдите на [Render Dashboard](https://dashboard.render.com)
2. Нажмите **"New +"** → **"Web Service"**
3. Подключите ваш GitHub репозиторий
4. Настройте сервис:

**Основные настройки:**
- **Name**: `anatomia-api` (или любое другое имя)
- **Region**: `Frankfurt` (ближайший регион)
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 2.2 Настройка переменных окружения

В разделе **"Environment Variables"** добавьте:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://hardyty:1973852046@anatomiacluster.a6x1lrz.mongodb.net/anatomia?retryWrites=true&w=majority&appName=AnatomiaCluster` |
| `JWT_SECRET` | `ваш-секретный-ключ-минимум-32-символа` (сгенерируйте надежный) |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `3000` |
| `CLIENT_URL` | (оставьте пустым, добавим после развертывания frontend) |

**Важно:** Сгенерируйте надежный JWT_SECRET. Можно использовать:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Развертывание

1. Нажмите **"Create Web Service"**
2. Дождитесь завершения сборки (5-10 минут)
3. Скопируйте URL вашего API (например, `https://anatomia-api.onrender.com`)

### 2.4 Проверка работоспособности

Откройте в браузере:
```
https://anatomia-api.onrender.com/health
```

Должен вернуться JSON:
```json
{"status": "OK", "message": "Server is running"}
```

## Шаг 3: Развертывание Frontend на Vercel

### 3.1 Создание проекта

1. Перейдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите **"Add New Project"**
3. Импортируйте ваш GitHub репозиторий

### 3.2 Настройка проекта

**Framework Preset**: Vite
**Root Directory**: `client`

**Build Settings:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Настройка переменных окружения

В разделе **"Environment Variables"** добавьте:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://anatomia-api.onrender.com/api` (URL вашего backend) |

### 3.4 Развертывание

1. Нажмите **"Deploy"**
2. Дождитесь завершения сборки (2-5 минут)
3. Скопируйте URL вашего приложения (например, `https://anatomia-app.vercel.app`)

## Шаг 4: Обновление CORS на Backend

### 4.1 Добавление CLIENT_URL

1. Вернитесь в [Render Dashboard](https://dashboard.render.com)
2. Откройте ваш Web Service (`anatomia-api`)
3. Перейдите в раздел **"Environment"**
4. Найдите или добавьте переменную `CLIENT_URL`
5. Установите значение: URL вашего Vercel приложения (например, `https://anatomia-app.vercel.app`)
6. Нажмите **"Save Changes"**

Backend автоматически перезапустится с новыми настройками.

## Шаг 5: Проверка работы приложения

1. Откройте ваш Vercel URL в браузере
2. Проверьте, что главная страница загружается
3. Попробуйте зарегистрироваться и войти
4. Проверьте навигацию по категориям и темам
5. Проверьте переключение языков (Русский/Română)

## Важные замечания

### Ограничения бесплатных тарифов

**Render.com (Free Tier):**
- Сервис засыпает после 15 минут бездействия
- Первый запрос после сна может занять 30-60 секунд (cold start)
- 750 часов в месяц бесплатно
- 100 GB трафика в месяц

**Vercel (Hobby Tier):**
- Неограниченное количество сайтов
- 100 GB трафика в месяц
- Автоматическое HTTPS
- Глобальный CDN

**MongoDB Atlas (Free Tier M0):**
- 512 MB хранилища
- Shared RAM
- Базовая производительность

### Рекомендации по производительности

1. **Кэширование**: Render сервисы засыпают. Рассмотрите использование cron-job для пинга:
   ```bash
   # Настройте бесплатный сервис типа cron-job.org для пинга
   GET https://anatomia-api.onrender.com/health каждые 14 минут
   ```

2. **Оптимизация изображений**: Используйте CDN для статических ресурсов

3. **Мониторинг**: Настройте логирование ошибок (например, Sentry бесплатный тариф)

## Обновление приложения

### Автоматическое развертывание

После настройки, оба сервиса (Vercel и Render) автоматически развернут новые версии при push в GitHub:

```bash
git add .
git commit -m "Update: описание изменений"
git push origin main
```

### Ручное развертывание

**Render:**
1. Откройте Dashboard → Ваш сервис
2. Нажмите **"Manual Deploy"** → **"Deploy latest commit"**

**Vercel:**
1. Откройте Dashboard → Ваш проект
2. Нажмите **"Redeploy"**

## Настройка пользовательского домена (опционально)

### Для Frontend (Vercel)

1. Откройте проект в Vercel Dashboard
2. Перейдите в **Settings** → **Domains**
3. Добавьте ваш домен
4. Следуйте инструкциям для настройки DNS

### Для Backend (Render)

1. Откройте сервис в Render Dashboard
2. Перейдите в **Settings** → **Custom Domains**
3. Добавьте ваш поддомен (например, `api.yourdomain.com`)
4. Обновите `CLIENT_URL` и `VITE_API_URL` после настройки

## Безопасность

### Обязательные действия:

1. **Измените JWT_SECRET** на надежный случайный ключ
2. **Не публикуйте** файлы `.env` в Git
3. **Используйте HTTPS** (автоматически на Vercel и Render)
4. **Регулярно обновляйте** зависимости: `npm audit fix`

### Рекомендуемые действия:

1. Настройте rate limiting для API
2. Добавьте мониторинг ошибок (Sentry)
3. Настройте резервное копирование MongoDB
4. Используйте переменные окружения для всех секретов

## Устранение неполадок

### Frontend не подключается к Backend

1. Проверьте переменную `VITE_API_URL` в Vercel
2. Проверьте переменную `CLIENT_URL` на Render
3. Откройте консоль браузера для ошибок CORS
4. Проверьте логи на Render Dashboard

### Backend возвращает 500 ошибки

1. Проверьте логи в Render Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к MongoDB Atlas
4. Убедитесь, что IP Render добавлен в whitelist MongoDB

### Cold Start занимает слишком много времени

Это нормально для бесплатного тарифа Render. Решения:
1. Настройте ping каждые 14 минут (например, через cron-job.org)
2. Обновитесь до платного тарифа для постоянной работы

## Полезные ссылки

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## Поддержка

При возникновении проблем:
1. Проверьте логи в Dashboard сервисов
2. Убедитесь, что все переменные окружения настроены
3. Проверьте статус сервисов на status.render.com и vercel-status.com
