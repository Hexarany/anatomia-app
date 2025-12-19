# Homework System API Documentation
# Документация API системы домашних заданий

**Дата:** 20 декабря 2024
**Версия:** 1.0

---

## 📋 Обзор

Система домашних заданий позволяет:
- Преподавателям создавать задания для занятий
- Студентам сдавать работы (текст + файлы)
- Преподавателям проверять и выставлять оценки
- Отслеживать статусы сдачи и дедлайны

---

## 🗄️ Модели данных

### Assignment (Домашнее задание)

```typescript
interface IAssignment {
  _id: ObjectId
  schedule: ObjectId              // Ссылка на Schedule
  group: ObjectId                 // Ссылка на Group
  title: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  deadline: Date                  // Основной дедлайн
  maxScore: number                // Максимальный балл (по умолчанию 10)
  allowLateSubmission: boolean    // Разрешена ли поздняя сдача
  lateSubmissionDeadline?: Date   // Крайний срок поздней сдачи
  attachments: string[]           // URL файлов от преподавателя
  instructions?: {                // Дополнительные инструкции
    ru: string
    ro: string
  }
  requiresFile: boolean           // Требуется ли файл (по умолчанию true)
  createdBy: ObjectId             // Преподаватель
  createdAt: Date
  updatedAt: Date
}
```

**Виртуальные поля:**
- `isOverdue` - просрочено ли задание
- `canSubmitLate` - можно ли ещё сдать с опозданием

### Submission (Сдача работы)

```typescript
interface ISubmission {
  _id: ObjectId
  assignment: ObjectId            // Ссылка на Assignment
  student: ObjectId               // Студент
  submittedAt: Date               // Дата сдачи
  textAnswer?: string             // Текстовый ответ
  files: string[]                 // URL загруженных файлов
  status: 'submitted' | 'graded' | 'revision' | 'late'
  isLate: boolean                 // Сдано ли с опозданием

  // Оценка
  grade?: number                  // Оценка (например, 8 из 10)
  feedback?: string               // Комментарий преподавателя
  gradedAt?: Date
  gradedBy?: ObjectId             // Кто проверил

  // История пересдач
  resubmissions: Array<{
    submittedAt: Date
    textAnswer?: string
    files: string[]
    comment?: string
  }>

  createdAt: Date
  updatedAt: Date
}
```

**Методы модели:**
- `sendForRevision(feedback)` - отправить на доработку
- `setGrade(grade, feedback, gradedBy)` - выставить оценку
- `resubmit(textAnswer, files, comment)` - пересдать работу

**Виртуальное поле:**
- `scorePercentage` - процент от максимального балла

---

## 🔌 API Endpoints

### Базовый URL
```
http://localhost:3000/api/assignments
```

Все endpoint'ы требуют авторизации (JWT token в заголовке `Authorization: Bearer <token>`).

---

## 📝 ASSIGNMENTS (Домашние задания)

### 1. Создать задание

**POST** `/api/assignments`

**Доступ:** Teacher, Admin

**Body:**
```json
{
  "schedule": "6758d3f1e4b0a12345678901",
  "group": "6758d3f1e4b0a12345678902",
  "title": {
    "ru": "Домашнее задание №1",
    "ro": "Tema de casă №1"
  },
  "description": {
    "ru": "Изучите мышцы спины и подготовьте краткий конспект",
    "ro": "Studiați mușchii spatelui și pregătiți un rezumat"
  },
  "deadline": "2024-12-25T23:59:00Z",
  "maxScore": 10,
  "allowLateSubmission": true,
  "lateSubmissionDeadline": "2024-12-27T23:59:00Z",
  "attachments": [
    "https://example.com/materials.pdf"
  ],
  "instructions": {
    "ru": "Минимум 500 слов",
    "ro": "Minimum 500 cuvinte"
  },
  "requiresFile": true
}
```

**Response 201:**
```json
{
  "message": "Assignment created successfully",
  "assignment": { ... }
}
```

---

### 2. Получить конкретное задание

**GET** `/api/assignments/:id`

**Доступ:** Все авторизованные пользователи (с проверкой прав)

**Response 200:**
```json
{
  "_id": "...",
  "schedule": { ... },
  "group": { ... },
  "title": { "ru": "...", "ro": "..." },
  "description": { "ru": "...", "ro": "..." },
  "deadline": "2024-12-25T23:59:00Z",
  "maxScore": 10,
  "allowLateSubmission": true,
  "lateSubmissionDeadline": "2024-12-27T23:59:00Z",
  "attachments": ["..."],
  "instructions": { "ru": "...", "ro": "..." },
  "requiresFile": true,
  "createdBy": {
    "name": "Иван Петров",
    "email": "teacher@example.com"
  },
  "createdAt": "...",
  "updatedAt": "...",
  "mySubmission": { ... }  // Только для студентов - их сдача
}
```

---

### 3. Обновить задание

**PUT** `/api/assignments/:id`

**Доступ:** Teacher (владелец), Admin

**Body:** Любые поля из Assignment (частичное обновление)

**Response 200:**
```json
{
  "message": "Assignment updated successfully",
  "assignment": { ... }
}
```

---

### 4. Удалить задание

**DELETE** `/api/assignments/:id`

**Доступ:** Teacher (владелец), Admin

**Response 200:**
```json
{
  "message": "Assignment and related submissions deleted successfully"
}
```

**Внимание:** Удаляет задание и ВСЕ связанные сдачи!

---

### 5. Получить все задания группы

**GET** `/api/assignments/group/:groupId`

**Доступ:** Студенты группы, преподаватель группы, admin

**Response 200:**
```json
[
  {
    "_id": "...",
    "schedule": { ... },
    "title": { ... },
    "description": { ... },
    "deadline": "...",
    "maxScore": 10,
    "allowLateSubmission": true,
    "createdBy": { ... },
    "mySubmission": { ... }  // Для студентов: их сдача или null
  },
  ...
]
```

**Сортировка:** По дедлайну (ASC)

---

### 6. Получить задание для конкретного занятия

**GET** `/api/assignments/schedule/:scheduleId`

**Доступ:** Студенты группы, преподаватель группы, admin

**Response 200:**
```json
{
  "_id": "...",
  "schedule": "...",
  "group": { ... },
  "title": { ... },
  "description": { ... },
  "deadline": "...",
  "maxScore": 10,
  "createdBy": { ... },
  "mySubmission": { ... }  // Для студентов
}
```

**Response 404:** Если для занятия нет задания

---

### 7. Получить все сдачи задания

**GET** `/api/assignments/:id/submissions`

**Доступ:** Teacher (владелец), Admin

**Response 200:**
```json
[
  {
    "_id": "...",
    "assignment": "...",
    "student": {
      "name": "Мария Иванова",
      "email": "student@example.com"
    },
    "submittedAt": "...",
    "textAnswer": "...",
    "files": ["..."],
    "status": "submitted",
    "isLate": false,
    "grade": 9,
    "feedback": "Отличная работа!",
    "gradedAt": "...",
    "gradedBy": { ... },
    "resubmissions": []
  },
  ...
]
```

**Сортировка:** По дате сдачи (DESC)

---

## 📤 SUBMISSIONS (Сдача работ)

### 8. Сдать задание

**POST** `/api/assignments/:id/submit`

**Доступ:** Student (член группы)

**Body:**
```json
{
  "textAnswer": "Вот мой ответ на задание...",
  "files": [
    "https://cloudinary.com/uploads/homework1.pdf",
    "https://cloudinary.com/uploads/homework2.jpg"
  ]
}
```

**Response 201:**
```json
{
  "message": "Assignment submitted successfully",
  "submission": { ... }
}
```

**Или (если опоздал):**
```json
{
  "message": "Assignment submitted late successfully",
  "submission": { "status": "late", "isLate": true, ... }
}
```

**Errors:**
- `400` - Уже сдавал (используй update endpoint)
- `400` - Дедлайн прошёл и поздняя сдача не разрешена
- `400` - Крайний срок поздней сдачи тоже прошёл
- `403` - Не член группы

---

### 9. Получить все мои сдачи

**GET** `/api/assignments/my/submissions`

**Доступ:** Student

**Response 200:**
```json
[
  {
    "_id": "...",
    "assignment": {
      "title": { ... },
      "deadline": "...",
      "maxScore": 10,
      "schedule": { ... },
      "group": { ... },
      "createdBy": { ... }
    },
    "submittedAt": "...",
    "textAnswer": "...",
    "files": ["..."],
    "status": "graded",
    "isLate": false,
    "grade": 9,
    "feedback": "Отличная работа!",
    "gradedAt": "...",
    "gradedBy": { ... }
  },
  ...
]
```

**Сортировка:** По дате сдачи (DESC)

---

### 10. Обновить/пересдать работу

**PUT** `/api/assignments/submissions/:submissionId`

**Доступ:** Student (владелец сдачи)

**Body:**
```json
{
  "textAnswer": "Исправленный ответ...",
  "files": [
    "https://cloudinary.com/uploads/homework_v2.pdf"
  ],
  "comment": "Исправил ошибки, которые вы указали"
}
```

**Response 200:**
```json
{
  "message": "Assignment resubmitted successfully",
  "submission": {
    ...
    "resubmissions": [
      {
        "submittedAt": "2024-12-20T10:00:00Z",  // Предыдущая версия
        "textAnswer": "Старый ответ...",
        "files": ["..."],
        "comment": null
      }
    ]
  }
}
```

**Errors:**
- `403` - Не твоя работа
- `400` - Дедлайн прошёл, пересдача не разрешена

---

### 11. Выставить оценку

**POST** `/api/assignments/submissions/:submissionId/grade`

**Доступ:** Teacher (владелец группы), Admin

**Body:**
```json
{
  "grade": 9,
  "feedback": "Отличная работа! Обратите внимание на иннервацию трапециевидной мышцы."
}
```

**Response 200:**
```json
{
  "message": "Submission graded successfully",
  "submission": {
    "_id": "...",
    "grade": 9,
    "feedback": "Отличная работа!",
    "status": "graded",
    "gradedAt": "2024-12-20T14:30:00Z",
    "gradedBy": "..."
  }
}
```

**Errors:**
- `403` - Не владелец группы
- `400` - Оценка вне диапазона (0 - maxScore)

---

### 12. Удалить сдачу

**DELETE** `/api/assignments/submissions/:submissionId`

**Доступ:** Student (владелец), Teacher (владелец группы), Admin

**Response 200:**
```json
{
  "message": "Submission deleted successfully"
}
```

---

## 🔐 Права доступа

### Student (Студент):
- ✅ Просмотр заданий своей группы
- ✅ Сдача заданий
- ✅ Пересдача своих работ
- ✅ Просмотр своих сдач
- ✅ Удаление своих сдач
- ❌ Создание/редактирование заданий
- ❌ Проверка работ

### Teacher (Преподаватель):
- ✅ Всё, что может студент
- ✅ Создание заданий для своих групп
- ✅ Редактирование своих заданий
- ✅ Удаление своих заданий
- ✅ Просмотр всех сдач задания
- ✅ Выставление оценок
- ✅ Удаление сдач студентов
- ❌ Работа с чужими группами

### Admin:
- ✅ Полный доступ ко всему

---

## 📊 Статусы сдачи

| Статус      | Описание                                    |
|-------------|---------------------------------------------|
| `submitted` | Сдано в срок, ожидает проверки              |
| `late`      | Сдано с опозданием, ожидает проверки        |
| `graded`    | Проверено, оценка выставлена                |
| `revision`  | Отправлено на доработку                     |

---

## 🚀 Примеры использования

### Создание задания (преподаватель):

```javascript
const response = await fetch('http://localhost:3000/api/assignments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    schedule: scheduleId,
    group: groupId,
    title: {
      ru: 'Домашнее задание №5',
      ro: 'Tema de casă №5'
    },
    description: {
      ru: 'Изучите нервное сплетение руки',
      ro: 'Studiați plexul nervos al brațului'
    },
    deadline: '2024-12-30T23:59:00Z',
    maxScore: 10,
    allowLateSubmission: true,
    lateSubmissionDeadline: '2025-01-02T23:59:00Z',
    attachments: [],
    requiresFile: true
  })
})

const data = await response.json()
console.log(data.assignment)
```

### Сдача задания (студент):

```javascript
// 1. Загрузить файлы через /api/media/upload

const formData = new FormData()
formData.append('file', fileInput.files[0])

const uploadResponse = await fetch('http://localhost:3000/api/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})

const { fileUrl } = await uploadResponse.json()

// 2. Сдать задание

const submitResponse = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/submit`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    textAnswer: 'Вот мой ответ на задание...',
    files: [fileUrl]
  })
})

const data = await submitResponse.json()
console.log(data.submission)
```

### Проверка работы (преподаватель):

```javascript
const response = await fetch(`http://localhost:3000/api/assignments/submissions/${submissionId}/grade`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grade: 9,
    feedback: 'Отличная работа! Небольшие замечания по иннервации.'
  })
})

const data = await response.json()
console.log(data.submission)
```

---

## 🔄 Типичные сценарии

### Сценарий 1: Создание и сдача задания

1. **Преподаватель** создаёт задание для занятия (POST `/api/assignments`)
2. **Студент** видит задание в списке группы (GET `/api/assignments/group/:groupId`)
3. **Студент** загружает файл и сдаёт задание (POST `/api/assignments/:id/submit`)
4. **Преподаватель** видит сдачу (GET `/api/assignments/:id/submissions`)
5. **Преподаватель** выставляет оценку (POST `/api/assignments/submissions/:submissionId/grade`)
6. **Студент** видит оценку в своих сдачах (GET `/api/assignments/my/submissions`)

### Сценарий 2: Пересдача

1. **Студент** видит, что получил низкую оценку или комментарий о доработке
2. **Студент** загружает исправленный файл
3. **Студент** пересдаёт задание (PUT `/api/assignments/submissions/:submissionId`)
4. Предыдущая версия сохраняется в `resubmissions`
5. Статус меняется обратно на `submitted`
6. **Преподаватель** видит обновлённую работу и проверяет заново

### Сценарий 3: Поздняя сдача

1. **Студент** пропустил основной дедлайн (deadline)
2. Система проверяет `allowLateSubmission` и `lateSubmissionDeadline`
3. Если разрешено - студент может сдать с пометкой `isLate: true`, `status: 'late'`
4. **Преподаватель** видит, что работа сдана с опозданием, может учесть при оценке

---

## ⚠️ Ограничения и валидация

- **Уникальность:** Один студент может сдать одно задание только один раз (используй update для пересдачи)
- **Дедлайны:**
  - `lateSubmissionDeadline` должен быть позже `deadline`
  - Сдача после `lateSubmissionDeadline` запрещена
- **Оценки:**
  - `grade` должна быть между 0 и `maxScore`
  - При выставлении оценки обязателен `gradedBy`
- **Права:**
  - Преподаватель может работать только со своими группами
  - Студент может работать только с заданиями своих групп
  - Студент может пересдавать только свои работы

---

## 📁 Созданные файлы

1. `server/src/models/Assignment.ts` - Модель задания
2. `server/src/models/Submission.ts` - Модель сдачи
3. `server/src/routes/assignmentRoutes.ts` - Маршруты
4. `server/src/controllers/assignmentController.ts` - Контроллеры
5. `server/src/index.ts` - Регистрация роутов (обновлён)

---

## 🔜 Следующие шаги

1. **UI для преподавателей** - создание заданий в админ-панели
2. **UI для студентов** - просмотр и сдача заданий
3. **Telegram интеграция** - `/homework`, `/submit` команды
4. **Уведомления** - напоминания о дедлайнах
5. **Тестирование** - полный цикл работы

---

**Готово к использованию!** ✅
