# Примеры данных для импорта / Date exemplu pentru import

Этот каталог содержит готовые CSV файлы с образовательным контентом по анатомии и массажу для быстрого наполнения платформы.

This directory contains ready-made CSV files with educational content on anatomy and massage for quick platform population.

---

## 📋 Содержимое / Contents

1. **trigger_points_sample.csv** - 15 триггерных точек с описаниями / 15 trigger points with descriptions
2. **protocols_sample.csv** - 12 протоколов массажа / 12 massage protocols
3. **quizzes_sample.csv** - 3 теста с 15 вопросами / 3 quizzes with 15 questions
4. **topics_sample.csv** - 6 образовательных тем / 6 educational topics

---

## 🚀 Как использовать / How to Use

### 1. Перейдите в админ-панель / Go to Admin Panel
```
http://localhost:5173/admin
или / or
https://anatomia-app.onrender.com/admin
```

### 2. Откройте вкладку "Импорт данных" / Open "Import Data" Tab

### 3. Выберите тип данных и загрузите файл / Select Data Type and Upload File

---

## ⚠️ ВАЖНО: Topics требуют Category ID / IMPORTANT: Topics Require Category ID

Перед импортом тем (topics) вам нужно получить ID существующих категорий из базы данных.

Before importing topics, you need to get the IDs of existing categories from the database.

### Как получить Category IDs:

#### Способ 1: Через MongoDB Compass или CLI
```javascript
// Подключитесь к вашей базе данных MongoDB
use anatomia

// Получите список всех категорий с их ID
db.categories.find({}, { _id: 1, slug: 1, title: 1 })

// Результат будет примерно таким:
// { "_id": "507f1f77bcf86cd799439011", "slug": "anatomy", "title": { "ru": "Анатомия" } }
// { "_id": "507f191e810c19729de860ea", "slug": "massage", "title": { "ru": "Массаж" } }
```

#### Способ 2: Через API
```bash
# Получите токен админа
TOKEN="ваш_токен_здесь"

# Запросите список категорий
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer $TOKEN"
```

#### Способ 3: Через браузер
1. Откройте http://localhost:5173/admin
2. Перейдите на вкладку "Категории"
3. В инструментах разработчика (F12) выполните:
```javascript
// В консоли браузера на странице категорий
fetch('/api/categories')
  .then(r => r.json())
  .then(data => console.table(data.map(c => ({ id: c._id, slug: c.slug, title: c.title.ru }))))
```

### Замените Category IDs в topics_sample.csv

Откройте `topics_sample.csv` в текстовом редакторе и замените все `CATEGORY_ID_HERE` на реальные ID категорий:

```csv
categoryId,slug,title_ru,title_ro,...
507f1f77bcf86cd799439011,skeletal-system-intro,Введение в скелетную систему,...
507f1f77bcf86cd799439011,spine-anatomy,Анатомия позвоночника,...
```

---

## 📝 Порядок импорта / Import Order

Рекомендуемый порядок импорта:

Recommended import order:

1. **Trigger Points** (триггерные точки) - независимы, можно импортировать первыми
2. **Massage Protocols** (протоколы массажа) - независимы
3. **Quizzes** (тесты) - независимы
4. **Topics** (темы) - ТРЕБУЮТ существующие категории!

---

## 🔧 Формат файлов / File Format

Все файлы должны быть в формате:
- **Encoding**: UTF-8 (обязательно!)
- **Format**: CSV
- **Delimiter**: запятая (comma)
- **Line endings**: LF или CRLF

### Если возникают проблемы с кодировкой в Excel:

**Windows:**
1. Откройте CSV в Notepad++
2. Encoding → Convert to UTF-8
3. Сохраните

**Mac:**
1. Откройте CSV в TextEdit
2. Format → Make Plain Text
3. File → Save → Encoding: UTF-8

---

## 📊 Структура файлов / File Structure

### trigger_points_sample.csv
```
slug,name_ru,name_ro,muscle_ru,muscle_ro,location_ru,location_ro,symptoms_ru,symptoms_ro,treatment_ru,treatment_ro
```

### protocols_sample.csv
```
slug,title_ru,title_ro,description_ru,description_ro,duration,difficulty,category
```
- `duration`: в минутах (in minutes)
- `difficulty`: beginner, intermediate, advanced
- `category`: therapeutic, relaxation, sports, aesthetic, traditional

### quizzes_sample.csv
```
quiz_slug,quiz_title_ru,quiz_title_ro,quiz_description_ru,quiz_description_ro,question_ru,question_ro,option1_ru,option1_ro,option2_ru,option2_ro,option3_ru,option3_ro,option4_ru,option4_ro,correct_answer
```
- `correct_answer`: 0, 1, 2, или 3 (индекс правильного ответа)

### topics_sample.csv
```
categoryId,slug,title_ru,title_ro,description_ru,description_ro,content_ru,content_ro
```
- `categoryId`: MongoDB ObjectId существующей категории (24 символа)
- `content_ru/ro`: поддерживает Markdown

---

## ✅ После импорта / After Import

Система покажет результаты:
- ✅ **Успешно импортировано** / Successfully imported
- ❌ **Ошибок** / Errors (если есть)

При ошибках система покажет:
- Номер строки с ошибкой
- Описание проблемы

---

## 🎯 Расширение данных / Extending Data

Вы можете добавить больше строк в любой CSV файл, следуя тому же формату.

You can add more rows to any CSV file following the same format.

### Советы по созданию контента:

1. **Slugs** должны быть уникальными и использовать формат: `lowercase-with-dashes`
2. **Markdown** в content поддерживает: заголовки, списки, жирный/курсив текст
3. **Длина descriptions**: 100-200 символов оптимально
4. **Длина content**: минимум 500 символов для качественного материала

---

## 🐛 Проблемы и решения / Troubleshooting

### "No file uploaded"
- Убедитесь, что файл выбран перед нажатием "Начать импорт"

### "Invalid file type"
- Проверьте, что файл имеет расширение .csv
- Пересохраните в UTF-8

### "Validation failed"
- Проверьте обязательные поля
- Для topics: убедитесь что categoryId существует в базе

### "Duplicate slug"
- Slug должен быть уникальным
- Измените slug на уникальный

### Кириллица отображается как �����
- Файл не в UTF-8 кодировке
- Пересохраните файл в UTF-8

---

## 📚 Дополнительные ресурсы / Additional Resources

- [Документация Markdown](https://www.markdownguide.org/basic-syntax/)
- [MongoDB ObjectId](https://docs.mongodb.com/manual/reference/method/ObjectId/)
- [CSV Format Specification](https://tools.ietf.org/html/rfc4180)

---

## 💡 Пример полного цикла импорта / Complete Import Cycle Example

```bash
# 1. Получите Category ID
curl http://localhost:3000/api/categories -H "Authorization: Bearer YOUR_TOKEN"

# 2. Обновите topics_sample.csv с реальными ID
# Откройте файл и замените CATEGORY_ID_HERE

# 3. Импортируйте через админ-панель:
#    - Trigger Points ✅
#    - Massage Protocols ✅
#    - Quizzes ✅
#    - Topics ✅

# 4. Проверьте результат на сайте
```

---

**Успехов в наполнении платформы контентом! / Good luck populating the platform with content!** 🎉
