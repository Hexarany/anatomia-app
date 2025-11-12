# Руководство разработчика / Ghid pentru Dezvoltatori

## Архитектура приложения

### Frontend (Client)
- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **UI Library**: Material-UI (MUI)
- **3D Graphics**: Three.js + React Three Fiber
- **Routing**: React Router v6
- **State Management**: Zustand
- **i18n**: i18next + react-i18next
- **HTTP Client**: Axios

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express + TypeScript
- **Database**: MongoDB + Mongoose
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Authentication**: JWT (будет добавлено)

## Структура базы данных

### Collections

#### Categories (Категории)
```typescript
{
  _id: ObjectId,
  name: { ru: string, ro: string },
  description: { ru: string, ro: string },
  icon?: string,
  slug: string,
  order: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Topics (Темы)
```typescript
{
  _id: ObjectId,
  categoryId: ObjectId,
  name: { ru: string, ro: string },
  description: { ru: string, ro: string },
  content: { ru: string, ro: string },
  images: MediaFile[],
  videos: MediaFile[],
  model3D?: string,
  slug: string,
  order: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Quizzes (Тесты)
```typescript
{
  _id: ObjectId,
  topicId?: ObjectId,
  categoryId?: ObjectId,
  title: { ru: string, ro: string },
  description: { ru: string, ro: string },
  questions: QuizQuestion[],
  slug: string,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Categories
- `GET /api/categories` - Получить все категории
- `GET /api/categories/:id` - Получить категорию по ID
- `POST /api/categories` - Создать категорию
- `PUT /api/categories/:id` - Обновить категорию
- `DELETE /api/categories/:id` - Удалить категорию

### Topics
- `GET /api/topics` - Получить все темы
- `GET /api/topics/:id` - Получить тему по ID
- `GET /api/topics/category/:categoryId` - Получить темы по категории
- `POST /api/topics` - Создать тему
- `PUT /api/topics/:id` - Обновить тему
- `DELETE /api/topics/:id` - Удалить тему

### Quizzes
- `GET /api/quizzes` - Получить все тесты
- `GET /api/quizzes/:id` - Получить тест по ID
- `GET /api/quizzes/topic/:topicId` - Получить тесты по теме
- `POST /api/quizzes` - Создать тест
- `PUT /api/quizzes/:id` - Обновить тест
- `DELETE /api/quizzes/:id` - Удалить тест

### Media
- `POST /api/media/upload` - Загрузить файл
- `DELETE /api/media/:filename` - Удалить файл

## Работа с мультиязычностью

### Frontend
Используйте хук `useTranslation` из `react-i18next`:

```typescript
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t, i18n } = useTranslation()

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <button onClick={() => i18n.changeLanguage('ro')}>
        Română
      </button>
    </div>
  )
}
```

### Backend
Контент хранится в объектах с полями `ru` и `ro`:

```typescript
const topic = {
  name: {
    ru: 'Череп',
    ro: 'Craniul'
  }
}
```

## Добавление нового контента

### Через API

```javascript
// Создание новой темы
const response = await fetch('http://localhost:3000/api/topics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    categoryId: '...',
    name: {
      ru: 'Название темы',
      ro: 'Numele subiectului'
    },
    description: {
      ru: 'Описание',
      ro: 'Descriere'
    },
    content: {
      ru: 'Полное содержание...',
      ro: 'Conținut complet...'
    },
    slug: 'topic-slug',
    order: 1
  })
})
```

### Загрузка медиа файлов

```javascript
const formData = new FormData()
formData.append('file', file)

const response = await fetch('http://localhost:3000/api/media/upload', {
  method: 'POST',
  body: formData
})

const data = await response.json()
console.log('File URL:', data.file.url)
```

## Работа с 3D моделями

### Поддерживаемые форматы
- OBJ
- GLTF/GLB (рекомендуется)

### Использование компонента Model3DViewer

```typescript
import Model3DViewer from '@/components/Model3DViewer'

<Model3DViewer
  modelUrl="/uploads/model.glb"
  autoRotate={true}
/>
```

### Загрузка собственных 3D моделей
1. Подготовьте модель в формате GLTF/GLB
2. Загрузите через API `/api/media/upload`
3. Сохраните URL в поле `model3D` темы

## Расширение функционала

### Добавление новой категории

1. Добавьте перевод в `client/src/i18n/locales/ru.json` и `ro.json`:
```json
{
  "categories": {
    "newCategory": {
      "name": "Новая категория",
      "description": "Описание категории"
    }
  }
}
```

2. Создайте категорию через API или MongoDB:
```javascript
db.categories.insertOne({
  name: { ru: 'Новая категория', ro: 'Categorie nouă' },
  description: { ru: 'Описание', ro: 'Descriere' },
  slug: 'new-category',
  order: 6
})
```

### Добавление новой страницы

1. Создайте компонент в `client/src/pages/`
2. Добавьте маршрут в `client/src/App.tsx`:
```typescript
<Route path="/new-page" element={<NewPage />} />
```

## Тестирование

### Frontend
```bash
cd client
npm run dev  # Запуск dev-сервера
```

### Backend
```bash
cd server
npm run dev  # Запуск с nodemon
```

### Наполнение базы данных
```bash
cd server
npm run seed
```

## Production Build

### Frontend
```bash
cd client
npm run build
```
Статические файлы будут в `client/dist/`

### Backend
```bash
cd server
npm run build
npm start
```

## Рекомендации по разработке

1. **Мультиязычность**: Всегда добавляйте переводы на оба языка (RU и RO)
2. **TypeScript**: Используйте типизацию для всех компонентов и API
3. **Slug**: Всегда создавайте уникальные slug для категорий, тем и тестов
4. **Изображения**: Оптимизируйте изображения перед загрузкой (WebP формат предпочтителен)
5. **3D модели**: Используйте GLTF/GLB формат для лучшей производительности
6. **Безопасность**: Валидируйте все входящие данные на backend

## Часто задаваемые вопросы

### Как добавить новый язык?
1. Создайте файл перевода в `client/src/i18n/locales/{lang}.json`
2. Зарегистрируйте язык в `client/src/i18n/index.ts`
3. Добавьте поле языка во все модели MongoDB
4. Обновите TypeScript типы в `client/src/types/index.ts`

### Как изменить тему оформления?
Отредактируйте `client/src/theme.ts` для настройки цветов, шрифтов и стилей.

### Где хранятся загруженные файлы?
В директории `server/uploads/`. В production рекомендуется использовать CDN или облачное хранилище.

## Полезные ссылки

- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Three.js](https://threejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [TypeScript](https://www.typescriptlang.org/)
