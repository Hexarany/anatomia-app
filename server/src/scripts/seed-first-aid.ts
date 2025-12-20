import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from '../models/Category'
import Topic from '../models/Topic'

dotenv.config()

const createFirstAidCategory = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Подключено к MongoDB')

    // Создаем категорию "Оказание первой помощи"
    let category = await Category.findOne({ slug: 'first-aid' })

    if (!category) {
      category = await Category.create({
        name: {
          ru: 'Оказание первой помощи',
          ro: 'Acordarea primului ajutor',
        },
        description: {
          ru: 'Важнейшие навыки оказания первой медицинской помощи в экстренных ситуациях',
          ro: 'Competențe esențiale de acordare a primului ajutor în situații de urgență',
        },
        slug: 'first-aid',
        order: 6,
      })
      console.log('✅ Категория создана:', category.name.ru)
    } else {
      console.log('✅ Категория уже существует:', category.name.ru)
    }

    // Темы по первой помощи
    const topics = [
      {
        name: {
          ru: 'Основы первой помощи',
          ro: 'Bazele primului ajutor',
        },
        description: {
          ru: 'Введение в оказание первой помощи, принципы и правовые аспекты',
          ro: 'Introducere în acordarea primului ajutor, principii și aspecte juridice',
        },
        content: {
          ru: `# Основы первой помощи

## Что такое первая помощь?

**Первая помощь** — это комплекс срочных мероприятий, проводимых при несчастных случаях и внезапных заболеваниях до прибытия медицинского персонала.

## Цели первой помощи

1. **Сохранение жизни** пострадавшего
2. **Предотвращение ухудшения** состояния
3. **Содействие выздоровлению**

## Принципы оказания первой помощи

### 1. Безопасность прежде всего
- Убедитесь, что место происшествия безопасно для вас и пострадавшего
- Не подвергайте себя опасности

### 2. Оценка ситуации
- Быстро оцените обстановку
- Определите количество пострадавших
- Выявите характер травм

### 3. Вызов экстренной помощи
- **103** — скорая медицинская помощь (Молдова)
- **112** — единый номер экстренных служб
- Четко сообщите: где, что произошло, сколько пострадавших

### 4. Последовательность действий
- Следуйте алгоритму ABC (Airways-Breathing-Circulation)
- Не паникуйте, действуйте спокойно и уверенно

## Правовые аспекты

### Долг оказания помощи
В большинстве стран существует моральный (а иногда и юридический) долг оказать помощь пострадавшему.

### Согласие пострадавшего
- Если пострадавший в сознании, спросите разрешения помочь
- При бессознательном состоянии считается подразумеваемое согласие

### Защита оказывающего помощь
Законы многих стран защищают добросовестно оказывающих первую помощь от судебного преследования.

## Алгоритм ABC

### A — Airways (Дыхательные пути)
Проверьте и обеспечьте проходимость дыхательных путей

### B — Breathing (Дыхание)
Проверьте наличие дыхания

### C — Circulation (Кровообращение)
Проверьте пульс и остановите кровотечение

## Универсальные меры предосторожности

1. **Используйте перчатки** при контакте с кровью или биологическими жидкостями
2. **Избегайте прямого контакта** с кровью
3. **Мойте руки** до и после оказания помощи
4. **Используйте маску** для искусственного дыхания

## Что НЕ следует делать

❌ Не перемещайте пострадавшего без необходимости
❌ Не давайте есть или пить при травмах живота
❌ Не применяйте методы, в которых не уверены
❌ Не оставляйте пострадавшего одного без крайней необходимости

## Аптечка первой помощи

### Обязательное содержимое:
- Стерильные бинты (разных размеров)
- Лейкопластырь
- Антисептик (перекись водорода, хлоргексидин)
- Ножницы
- Одноразовые перчатки
- Жгут
- Термометр
- Салфетки стерильные
- Эластичный бинт
- Анальгетики (парацетамол, ибупрофен)

## Психологическая поддержка

Оказание первой помощи включает не только физические действия:
- Успокойте пострадавшего
- Объясните, что вы делаете
- Оставайтесь с ним до прибытия врачей
- Говорите уверенно и спокойно`,
          ro: `# Bazele primului ajutor

## Ce este primul ajutor?

**Primul ajutor** este un complex de măsuri urgente efectuate în caz de accidente și boli subite până la sosirea personalului medical.

## Scopurile primului ajutor

1. **Salvarea vieții** victimei
2. **Prevenirea agravării** stării
3. **Contribuția la recuperare**

## Principiile acordării primului ajutor

### 1. Siguranța mai presus de toate
- Asigurați-vă că locul incidentului este sigur pentru dvs. și victimă
- Nu vă puneți în pericol

### 2. Evaluarea situației
- Evaluați rapid situația
- Determinați numărul de victime
- Identificați natura traumelor

### 3. Apelarea ajutorului de urgență
- **103** — ambulanța (Moldova)
- **112** — număr unic de urgență
- Comunicați clar: unde, ce s-a întâmplat, câte victime

### 4. Succesiunea acțiunilor
- Urmați algoritmul ABC (Airways-Breathing-Circulation)
- Nu intrați în panică, acționați calm și sigur

## Aspecte juridice

### Datoria de a acorda ajutor
În majoritatea țărilor există o datorie morală (uneori și juridică) de a acorda ajutor victimei.

### Consimțământul victimei
- Dacă victima este conștientă, cereți permisiunea de a ajuta
- În stare inconștientă se consideră consimțământ implicit

### Protecția celui care acordă ajutor
Legile multor țări protejează persoanele care acordă primul ajutor cu bună-credință de urmărire judiciară.

## Algoritmul ABC

### A — Airways (Căile respiratorii)
Verificați și asigurați permeabilitatea căilor respiratorii

### B — Breathing (Respirația)
Verificați prezența respirației

### C — Circulation (Circulația)
Verificați pulsul și opriți hemoragia

## Măsuri universale de precauție

1. **Folosiți mănuși** la contactul cu sânge sau fluide biologice
2. **Evitați contactul direct** cu sângele
3. **Spălați-vă mâinile** înainte și după acordarea ajutorului
4. **Folosiți mască** pentru respirație artificială

## Ce NU trebuie să faceți

❌ Nu mutați victima fără necesitate
❌ Nu dați de mâncare sau băutură în caz de traume abdominale
❌ Nu aplicați metode de care nu sunteți sigur
❌ Nu lăsați victima singură fără extremă necesitate

## Trusa de prim ajutor

### Conținut obligatoriu:
- Bandaje sterile (diverse dimensiuni)
- Leucoplast
- Antiseptic (apă oxigenată, clorhexidină)
- Foarfece
- Mănuși de unică folosință
- Garou
- Termometru
- Șervețele sterile
- Bandaj elastic
- Analgezice (paracetamol, ibuprofen)

## Suport psihologic

Acordarea primului ajutor include nu doar acțiuni fizice:
- Liniștire victima
- Explicați ce faceți
- Rămâneți cu ea până la sosirea medicilor
- Vorbiți sigur și calm`,
        },
        slug: 'first-aid-basics',
        order: 1,
        difficulty: 'beginner',
        estimatedTime: 15,
      },
      {
        name: {
          ru: 'Сердечно-легочная реанимация (СЛР)',
          ro: 'Resuscitare cardiopulmonară (RCP)',
        },
        description: {
          ru: 'Техника проведения сердечно-легочной реанимации для спасения жизни',
          ro: 'Tehnica efectuării resuscitării cardiopulmonare pentru salvarea vieții',
        },
        content: {
          ru: `# Сердечно-легочная реанимация (СЛР)

## Что такое СЛР?

**СЛР (Cardiopulmonary Resuscitation, CPR)** — это комплекс мероприятий, направленных на восстановление работы сердца и дыхания при их остановке.

## Когда необходима СЛР?

СЛР проводится при:
- Остановке сердца
- Отсутствии дыхания
- Отсутствии пульса
- Потере сознания

## Признаки остановки сердца

1. **Отсутствие сознания** — человек не реагирует на обращение
2. **Отсутствие дыхания** — грудная клетка не движется
3. **Отсутствие пульса** — не прощупывается на сонной артерии

## Алгоритм СЛР для взрослых

### 1. Проверка безопасности
- Убедитесь, что вам и пострадавшему ничего не угрожает

### 2. Проверка сознания
- Похлопайте по плечам
- Громко спросите: "Вы в порядке?"
- Если нет реакции — вызывайте помощь

### 3. Вызов экстренных служб
- **112 или 103**
- Сообщите о ситуации
- Если вы не один — пусть кто-то вызовет помощь, пока вы начинаете СЛР

### 4. Проверка дыхания
- Запрокиньте голову назад, приподняв подбородок
- Смотрите, слушайте, ощущайте дыхание (не более 10 секунд)
- Если дыхания нет или оно агональное (редкое, хватающее) — начинайте СЛР

### 5. Непрямой массаж сердца

**Положение:**
- Положите пострадавшего на твердую поверхность
- Встаньте на колени сбоку
- Положите основание одной ладони на центр грудной клетки (между сосков)
- Вторую ладонь положите сверху, сцепив пальцы

**Техника:**
- Выпрямите руки в локтях
- Надавливайте строго вертикально
- Глубина нажатий: **5-6 см**
- Частота: **100-120 нажатий в минуту** (в ритме песни "Stayin' Alive")
- Давайте грудной клетке полностью подняться между нажатиями

**Соотношение:** 30 нажатий на грудную клетку

### 6. Искусственное дыхание (если обучены)

- Запрокиньте голову, приподняв подбородок
- Зажмите нос пострадавшего
- Плотно обхватите губами рот пострадавшего
- Сделайте 2 вдоха (каждый 1 секунду)
- Следите, чтобы грудная клетка поднималась

**Соотношение:** 2 вдоха после 30 нажатий

### 7. Продолжение циклов

Повторяйте циклы 30:2 (30 нажатий : 2 вдоха) до:
- Прибытия скорой помощи
- Появления признаков жизни (дыхание, движение)
- Полного физического истощения

## Только руками (Hands-Only CPR)

Если вы не обучены искусственному дыханию или не уверены:
- Делайте **только непрямой массаж сердца**
- Непрерывно, 100-120 нажатий в минуту
- Это эффективнее, чем ничего не делать!

## СЛР для детей (1-8 лет)

- Глубина нажатий: **5 см** (⅓ толщины грудной клетки)
- Можно использовать одну руку
- Соотношение: 30:2 (если один спасатель) или 15:2 (если два)

## СЛР для младенцев (до 1 года)

- Используйте **два пальца** (указательный и средний)
- Точка нажатия: на ширину пальца ниже линии сосков
- Глубина: **4 см** (⅓ толщины грудной клетки)
- Соотношение: 30:2 (один спасатель) или 15:2 (два спасателя)

## Автоматический внешний дефибриллятор (АВД)

Если доступен АВД:
1. Включите его
2. Следуйте голосовым инструкциям
3. Наложите электроды согласно картинкам
4. Отойдите во время анализа ритма
5. Нажмите кнопку разряда, если АВД это рекомендует
6. Продолжайте СЛР после разряда

## Типичные ошибки

❌ **Недостаточная глубина** нажатий
❌ **Неправильное положение** рук
❌ **Слишком медленный** или быстрый темп
❌ **Неполное расправление** грудной клетки
❌ **Длительные паузы** между циклами
❌ **Отказ от СЛР** из-за страха

## Когда прекратить СЛР?

Прекращайте СЛР только если:
✅ Прибыла скорая помощь
✅ Пострадавший начал дышать самостоятельно
✅ Вы полностью истощены физически
✅ Врач констатировал смерть

## Важно помнить

- **Каждая секунда** на счету
- **Быстрое начало** СЛР увеличивает шансы на выживание в 2-3 раза
- **Не бойтесь** — неидеальная СЛР лучше, чем никакой
- **Сломанные ребра** — возможное осложнение, но жизнь важнее

## Цепочка выживания

1. Раннее распознавание и вызов помощи
2. Раннее начало СЛР
3. Ранняя дефибрилляция
4. Расширенная реанимация
5. Постреанимационная помощь`,
          ro: `# Resuscitare cardiopulmonară (RCP)

## Ce este RCP?

**RCP (Resuscitare Cardiopulmonară)** este un complex de măsuri destinate restabilirii funcției cardiace și respiratorii în caz de oprire.

## Când este necesară RCP?

RCP se efectuează în caz de:
- Oprire cardiacă
- Absența respirației
- Absența pulsului
- Pierderea conștiinței

## Semne ale opririi cardiace

1. **Absența conștiinței** — persoana nu reacționează
2. **Absența respirației** — toracele nu se mișcă
3. **Absența pulsului** — nu se simte pe artera carotidă

## Algoritm RCP pentru adulți

### 1. Verificarea siguranței
- Asigurați-vă că nu există pericol pentru dvs. și victimă

### 2. Verificarea conștiinței
- Bateți ușor pe umeri
- Întrebați cu voce tare: "Sunteți bine?"
- Dacă nu există reacție — chemați ajutor

### 3. Apelarea serviciilor de urgență
- **112 sau 103**
- Raportați situația
- Dacă nu sunteți singur — altcineva să sune în timp ce începeți RCP

### 4. Verificarea respirației
- Basculați capul înapoi, ridicând bărbia
- Priviți, ascultați, simțiți respirația (max 10 secunde)
- Dacă nu există respirație sau este agonală — începeți RCP

### 5. Masaj cardiac indirect

**Poziție:**
- Puneți victima pe o suprafață dură
- Îngenuncheați alături
- Puneți baza unei palme în centrul toracelui (între mamelon)
- Puneți a doua palmă deasupra, încleștând degetele

**Tehnică:**
- Întindeți brațele la coate
- Apăsați strict vertical
- Adâncime: **5-6 cm**
- Frecvență: **100-120 apăsări pe minut**
- Lăsați toracele să se ridice complet între apăsări

**Raport:** 30 apăsări pe torace

### 6. Respirație artificială (dacă sunteți instruit)

- Basculați capul, ridicând bărbia
- Astupați nasul victimei
- Acoperiți strâns gura victimei cu buzele
- Faceți 2 inspirații (fiecare 1 secundă)
- Urmăriți ridicarea toracelui

**Raport:** 2 inspirații după 30 apăsări

### 7. Continuarea ciclurilor

Repetați cicluri 30:2 până la:
- Sosirea ambulanței
- Apariția semnelor de viață
- Epuizare fizică completă

## Doar cu mâinile (Hands-Only CPR)

Dacă nu sunteți instruit în respirația artificială:
- Faceți **doar masaj cardiac**
- Continuu, 100-120 apăsări pe minut
- Este mai eficient decât să nu faceți nimic!

## RCP pentru copii (1-8 ani)

- Adâncime: **5 cm**
- Se poate folosi o singură mână
- Raport: 30:2 (un salvator) sau 15:2 (doi)

## RCP pentru sugari (până la 1 an)

- Folosiți **două degete**
- Punct de apăsare: sub linia mamelonilor
- Adâncime: **4 cm**
- Raport: 30:2 (un salvator) sau 15:2 (doi)

## Defibrilator extern automat (DEA)

Dacă există DEA disponibil:
1. Porniți-l
2. Urmați instrucțiunile vocale
3. Aplicați electrozii conform imaginilor
4. Depărtați-vă în timpul analizei ritmului
5. Apăsați butonul de șoc dacă DEA recomandă
6. Continuați RCP după șoc

## Erori tipice

❌ **Adâncime insuficientă** a apăsărilor
❌ **Poziție incorectă** a mâinilor
❌ **Ritm prea lent** sau rapid
❌ **Ridicare incompletă** a toracelui
❌ **Pauze lungi** între cicluri
❌ **Refuzul RCP** din cauza fricii

## Când să opriți RCP?

Opriți RCP doar dacă:
✅ A sosit ambulanța
✅ Victima a început să respire singură
✅ Sunteți complet epuizat fizic
✅ Medicul a constatat decesul

## Important de reținut

- **Fiecare secundă** contează
- **Începerea rapidă** a RCP crește șansele de supraviețuire de 2-3 ori
- **Nu vă fie frică** — RCP imperfect este mai bun decât nimic
- **Coaste rupte** — complicație posibilă, dar viața este mai importantă`,
        },
        slug: 'cpr-resuscitation',
        order: 2,
        difficulty: 'intermediate',
        estimatedTime: 20,
      },
      {
        name: {
          ru: 'Помощь при кровотечениях',
          ro: 'Ajutor în caz de hemoragii',
        },
        description: {
          ru: 'Техники остановки различных видов кровотечений',
          ro: 'Tehnici de oprire a diferitelor tipuri de hemoragii',
        },
        content: {
          ru: `# Помощь при кровотечениях

## Типы кровотечений

### 1. Капиллярное кровотечение
**Признаки:**
- Кровь сочится медленно
- Ярко-красный цвет
- Повреждение поверхностное

**Опасность:** Низкая (при отсутствии нарушений свертываемости)

### 2. Венозное кровотечение
**Признаки:**
- Кровь темно-красная, вишневая
- Течет равномерно, струей
- Может быть обильным

**Опасность:** Средняя до высокой

### 3. Артериальное кровотечение
**Признаки:**
- Кровь ярко-алая
- Бьет пульсирующей струей, фонтаном
- Очень обильное

**Опасность:** Критическая, угроза жизни

### 4. Внутреннее кровотечение
**Признаки:**
- Бледность кожи
- Холодный пот
- Слабый частый пульс
- Падение давления
- Головокружение, обморок
- Боль в области внутренних органов

**Опасность:** Критическая

## Остановка капиллярного кровотечения

### Алгоритм действий:

1. **Промойте рану** чистой водой
2. **Обработайте** антисептиком (перекись водорода, хлоргексидин)
3. **Наложите стерильную повязку**
4. При необходимости **приподнимите** конечность

**Время остановки:** 5-10 минут

## Остановка венозного кровотечения

### Алгоритм действий:

1. **Наденьте перчатки** (защита от инфекций)

2. **Прямое давление:**
   - Наложите стерильную салфетку или чистую ткань
   - Плотно прижмите к ране
   - Держите давление 10-15 минут

3. **Давящая повязка:**
   - Наложите несколько слоев стерильных салфеток
   - Плотно забинтуйте
   - Повязка должна быть тугой, но не нарушать кровообращение

4. **Приподнимите конечность** выше уровня сердца

5. **Проверяйте** пульс ниже повязки

**НЕ снимайте** пропитавшуюся кровью повязку — накладывайте новую поверх!

## Остановка артериального кровотечения

### ⚠️ ЭКСТРЕННАЯ СИТУАЦИЯ!

**Немедленно вызывайте скорую помощь!**

### Алгоритм действий:

1. **Пальцевое прижатие артерии:**

**Места прижатия:**
- **Височная артерия** — выше и впереди уха
- **Сонная артерия** — на шее, сбоку от трахеи
- **Подключичная артерия** — над ключицей к первому ребру
- **Плечевая артерия** — внутренняя поверхность плеча
- **Бедренная артерия** — паховая складка

**Техника:**
- Прижимайте артерию к кости
- Сильное давление
- Удерживайте до наложения жгута

2. **Наложение жгута:**

**Показания:**
- Артериальное кровотечение конечности
- Невозможность остановить давящей повязкой

**Техника наложения:**
- Накладывайте **выше раны** (ближе к сердцу)
- На одежду или подложку (не на голую кожу)
- Затяните до остановки кровотечения
- Запишите **время наложения** (на бумаге, лбу пострадавшего)

**Время:**
- **Летом:** максимум 1 час
- **Зимой:** максимум 30 минут
- Если время истекло — ослабьте на 10-15 секунд, затем наложите снова

**⚠️ Признак правильного наложения:** кровотечение остановлено, пульс ниже жгута не прощупывается

3. **Иммобилизация конечности**

## Помощь при носовом кровотечении

### Алгоритм:

1. **Посадите** пострадавшего, слегка наклонив голову вперед
   - ❌ НЕ запрокидывайте голову назад!

2. **Прижмите крылья носа** к перегородке на 10-15 минут

3. **Приложите холод** на переносицу

4. **Если не остановилось** через 15 минут:
   - Вставьте тампон, смоченный перекисью водорода
   - Обратитесь к врачу

## Внутреннее кровотечение

### Подозрение на внутреннее кровотечение:

**Действия:**
1. **Немедленно вызовите скорую**
2. **Уложите** пострадавшего
3. **Обеспечьте покой**
4. **Приложите холод** на область предполагаемого кровотечения
5. **Не давайте** пить и есть
6. **Контролируйте** состояние

## Что НЕЛЬЗЯ делать

❌ Промывать рану при сильном кровотечении
❌ Извлекать из раны инородные предметы
❌ Давать пострадавшему пить (при внутреннем кровотечении)
❌ Накладывать жгут без крайней необходимости
❌ Накладывать жгут ниже раны
❌ Накладывать жгут на шею, живот, голову
❌ Оставлять жгут дольше допустимого времени

## Признаки опасной кровопотери

⚠️ Немедленная медицинская помощь при:
- Бледность, синюшность кожи
- Холодный липкий пот
- Частый слабый пульс (более 100 уд/мин)
- Частое поверхностное дыхание
- Падение артериального давления
- Головокружение, потеря сознания
- Жажда

## Профилактика инфекции

1. **Используйте перчатки**
2. **Промойте рану** чистой водой
3. **Обработайте края** антисептиком
4. **Наложите стерильную повязку**
5. **Не касайтесь** раны руками
6. **Рекомендуйте** обратиться к врачу для профилактики столбняка`,
          ro: `# Ajutor în caz de hemoragii

## Tipuri de hemoragii

### 1. Hemoragie capilară
**Semne:**
- Sânge curge lent
- Culoare roșie strălucitoare
- Leziune superficială

**Pericol:** Scăzut

### 2. Hemoragie venoasă
**Semne:**
- Sânge roșu închis, vișiniu
- Curge uniform, șuvoi
- Poate fi abundent

**Pericol:** Mediu până la ridicat

### 3. Hemoragie arterială
**Semne:**
- Sânge roșu-stacojiu
- Bate în jet pulsatil
- Foarte abundent

**Pericol:** Critic, pericol de viață

### 4. Hemoragie internă
**Semne:**
- Paloarea pielii
- Transpirație rece
- Puls slab frecvent
- Scădere tensiune
- Amețeli, leșin
- Durere în zona organelor interne

**Pericol:** Critic

## Oprirea hemoragiei capilare

### Algoritm:

1. **Spălați rana** cu apă curată
2. **Tratați** cu antiseptic (apă oxigenată, clorhexidină)
3. **Aplicați bandaj steril**
4. Dacă e necesar **ridicați** membrul

**Timp de oprire:** 5-10 minute

## Oprirea hemoragiei venoase

### Algoritm:

1. **Puneți mănuși**

2. **Presiune directă:**
   - Aplicați șervețel steril sau țesătură curată
   - Apăsați ferm pe rană
   - Mențineți presiunea 10-15 minute

3. **Bandaj compresiv:**
   - Aplicați mai multe straturi de șervețele sterile
   - Bandajați strâns
   - Bandajul trebuie să fie ferm dar să nu oprească circulația

4. **Ridicați membrul** deasupra nivelului inimii

5. **Verificați** pulsul sub bandaj

**NU îndepărtați** bandajul înmuiat în sânge — aplicați altul peste!

## Oprirea hemoragiei arteriale

### ⚠️ SITUAȚIE DE URGENȚĂ!

**Chemați imediat ambulanța!**

### Algoritm:

1. **Comprimarea digitală a arterei:**

**Locuri de comprimare:**
- **Artera temporală** — deasupra și în fața urechii
- **Artera carotidă** — pe gât, lateral de trahee
- **Artera subclaviană** — deasupra claviculei
- **Artera brahială** — suprafața internă a brațului
- **Artera femurală** — pliul inghinal

**Tehnică:**
- Apăsați artera la os
- Presiune puternică
- Mențineți până la aplicarea garoului

2. **Aplicarea garoului:**

**Indicații:**
- Hemoragie arterială a membrului
- Imposibilitatea opririi cu bandaj compresiv

**Tehnică:**
- Aplicați **deasupra rănii**
- Pe haine sau pansament
- Strângeți până la oprirea hemoragiei
- Notați **ora aplicării**

**Timp:**
- **Vara:** maxim 1 oră
- **Iarna:** maxim 30 minute
- La expirare — slăbiți 10-15 secunde, apoi reaplică

3. **Imobilizarea membrului**

## Ajutor la sângerare nazală

### Algoritm:

1. **Așezați** victima, înclinând capul ușor înainte
   - ❌ NU basculați capul înapoi!

2. **Apăsați aripile nasului** timp de 10-15 minute

3. **Aplicați frig** pe nas

4. **Dacă nu se oprește** în 15 minute:
   - Introduceți tampon cu apă oxigenată
   - Consultați medicul

## Hemoragie internă

**Acțiuni:**
1. **Chemați imediat ambulanța**
2. **Culcați** victima
3. **Asigurați repaus**
4. **Aplicați frig**
5. **Nu dați** să bea sau să mănânce
6. **Monitorizați** starea

## Ce NU trebuie făcut

❌ Spălați rana la hemoragie puternică
❌ Scoateți obiecte străine din rană
❌ Dați să bea (la hemoragie internă)
❌ Aplicați garou fără necesitate extremă
❌ Aplicați garou sub rană
❌ Lăsați garoul mai mult decât timpul permis`,
        },
        slug: 'bleeding-hemorrhage',
        order: 3,
        difficulty: 'intermediate',
        estimatedTime: 25,
      },
      {
        name: {
          ru: 'Помощь при переломах и травмах',
          ro: 'Ajutor la fracturi și traumatisme',
        },
        description: {
          ru: 'Иммобилизация и первая помощь при переломах костей',
          ro: 'Imobilizare și prim ajutor la fracturi osoase',
        },
        content: {
          ru: `# Помощь при переломах и травмах

## Типы переломов

### Закрытый перелом
- Кость сломана, но кожа не повреждена
- Нет открытой раны
- Меньший риск инфекции

### Открытый перелом
- Кость проникает через кожу
- Видна рана с костными отломками
- Высокий риск инфекции и кровотечения
- **⚠️ Более опасный!**

## Признаки перелома

### Достоверные признаки:
1. **Деформация конечности** — неестественное положение
2. **Патологическая подвижность** — подвижность в необычном месте
3. **Крепитация** — хруст костных отломков (НЕ проверять специально!)
4. **Видимые костные отломки** (при открытом переломе)

### Вероятные признаки:
- Сильная боль в месте травмы
- Отек, гематома
- Нарушение функции конечности
- Укорочение конечности
- Вынужденное положение

## Первая помощь при переломах

### Общий алгоритм:

1. **Вызовите скорую помощь** (103, 112)

2. **Оцените ситуацию:**
   - Проверьте сознание, дыхание, пульс
   - Есть ли кровотечение
   - Признаки шока

3. **При открытом переломе:**
   - **Остановите кровотечение** (давящая повязка)
   - **Наложите стерильную повязку** на рану
   - ❌ **НЕ вправляйте** костные отломки!
   - ❌ **НЕ промывайте** рану

4. **Обезбольте** (если есть анальгетики)

5. **Иммобилизация:**
   - Зафиксируйте конечность в том положении, в котором она находится
   - Используйте шины или подручные материалы
   - Фиксируйте два сустава — выше и ниже перелома

6. **Приложите холод** (через ткань, 15-20 минут)

7. **Контролируйте состояние** до приезда скорой

## Иммобилизация различных переломов

### Перелом пальца руки
- Прибинтуйте поврежденный палец к соседнему здоровому
- Или наложите шину из карандаша, ручки
- Подвесьте руку на косынке

### Перелом кисти/запястья
- Наложите шину от кончиков пальцев до середины предплечья
- Придайте кисти функциональное положение (как будто держит яблоко)
- Подвесьте на косынке

### Перелом предплечья
- Шина от кончиков пальцев до верхней трети плеча
- Согните руку в локте под прямым углом
- Подвесьте на косынке

### Перелом плеча
- Шина от пальцев до противоположного надплечья
- Между рукой и туловищем — валик
- Прибинтуйте руку к туловищу
- Подвесьте на косынке

### Перелом ключицы
- Положите валик в подмышку
- Подвесьте руку на косынке
- Можно прибинтовать руку к туловищу

### Перелом ребер
- Тугая повязка на грудную клетку на выдохе
- Полусидячее положение
- ❌ **НЕ бинтуйте** слишком туго — может затруднить дыхание

### Перелом позвоночника
**⚠️ ОЧЕНЬ ОПАСНО!**

- **НЕ двигайте** пострадавшего!
- Вызовите скорую
- Фиксируйте голову и шею
- Если необходимо переместить — на жестких носилках, в положении на спине

**Признаки:**
- Боль в позвоночнике
- Невозможность двигать конечностями
- Потеря чувствительности
- Непроизвольное мочеиспускание

### Перелом таза
**⚠️ Опасен внутренним кровотечением!**

- Уложите на спину на твердую поверхность
- Согните ноги в коленях и тазобедренных суставах
- Под колени положите валик (поза "лягушки")
- **НЕ сажайте**, **НЕ ставьте** на ноги
- Вызовите скорую

### Перелом бедра
- Шина от подмышки до стопы (по наружной стороне)
- Дополнительная шина от паха до стопы (по внутренней)
- Фиксируйте 3 сустава: тазобедренный, коленный, голеностопный

### Перелом голени
- Шина от верхней трети бедра до стопы
- Фиксируйте коленный и голеностопный суставы
- Стопа под прямым углом

### Перелом стопы
- Зафиксируйте стопу и голеностопный сустав
- Можно использовать подушку, одеяло
- Приподнимите конечность

## Правила наложения шин

1. **Используйте:**
   - Стандартные шины
   - Подручные материалы (доски, палки, зонты, журналы)

2. **Подготовка:**
   - Обложите шину мягким материалом (вата, ткань)
   - Моделируйте шину по здоровой конечности

3. **Наложение:**
   - Не снимайте одежду и обувь (если не мешает)
   - Фиксируйте 2 сустава (выше и ниже перелома)
   - При переломе плеча и бедра — 3 сустава
   - Не фиксируйте слишком туго

4. **Проверка:**
   - Проверьте пульс, чувствительность, температуру конечности ниже шины
   - Кожа не должна синеть или холодеть

## Помощь при растяжениях и вывихах

### Растяжение связок
**Правило RICE:**
- **R (Rest)** — покой
- **I (Ice)** — лед (15-20 мин каждый час)
- **C (Compression)** — давящая повязка
- **E (Elevation)** — возвышенное положение

### Вывих
**Признаки:**
- Деформация сустава
- Сильная боль
- Невозможность движения
- Вынужденное положение

**Действия:**
- **НЕ вправляйте** вывих самостоятельно!
- Зафиксируйте в том положении, в котором находится
- Приложите холод
- Обезбольте
- Вызовите скорую

## Что НЕЛЬЗЯ делать

❌ Пытаться выпрямить сломанную кость
❌ Вправлять костные отломки при открытом переломе
❌ Давать пострадавшему есть или пить (может потребоваться операция)
❌ Транспортировать без иммобилизации
❌ Снимать одежду через поврежденную конечность (разрежьте)
❌ Накладывать шину на голое тело
❌ Фиксировать конечность в неестественном положении

## Признаки осложнений

⚠️ Немедленно обратитесь к врачу при:
- Усиление боли
- Побледнение или посинение конечности
- Похолодание конечности
- Отсутствие пульса ниже места травмы
- Потеря чувствительности
- Невозможность пошевелить пальцами
- Лихорадка (при открытом переломе)`,
          ro: `# Ajutor la fracturi și traumatisme

## Tipuri de fracturi

### Fractură închisă
- Osul este fracturat, dar pielea intactă
- Nu există rană deschisă
- Risc mai mic de infecție

### Fractură deschisă
- Osul penetrează pielea
- Rană vizibilă cu fragmente osoase
- Risc mare de infecție și hemoragie
- **⚠️ Mai periculos!**

## Semne de fractură

### Semne sigure:
1. **Deformarea membrului**
2. **Mobilitate patologică**
3. **Crepitație** — trosnit de fragmente osoase
4. **Fragmente osoase vizibile**

### Semne probabile:
- Durere intensă
- Edem, hemаtom
- Tulburare funcție
- Scurtarea membrului
- Poziție forțată

## Prim ajutor la fracturi

### Algoritm general:

1. **Chemați ambulanța**

2. **Evaluați situația:**
   - Verificați conștiința, respirația, pulsul
   - Există hemoragie
   - Semne de șoc

3. **La fractură deschisă:**
   - **Opriți hemoragia**
   - **Aplicați bandaj steril**
   - ❌ **NU repoziționați** fragmentele!
   - ❌ **NU spălați** rana

4. **Calmați durerea**

5. **Imobilizare:**
   - Fixați membrul în poziția găsită
   - Folosiți atele sau materiale improvizate
   - Fixați două articulații — deasupra și dedesubt

6. **Aplicați frig**

7. **Monitorizați starea**

## Imobilizarea diferitelor fracturi

### Fractură deget mână
- Bandajați degetul lezat la vecinul sănătos
- Sau aplicați atelă din creion
- Suspendați mâna pe eșarfă

### Fractură mână/încheietură
- Atelă de la vârful degetelor până la mijlocul antebrațului
- Poziție funcțională
- Suspendare pe eșarfă

### Fractură antebraț
- Atelă de la degete până la treimea superioară a brațului
- Îndoiți cotul la unghi drept
- Suspendare pe eșarfă

### Fractură umăr
- Atelă de la degete până la umărul opus
- Rulou între braț și trunchi
- Bandajați brațul la trunchi

### Fractură claviculă
- Rulou la axilă
- Suspendare pe eșarfă
- Bandajare la trunchi

### Fractură coaste
- Bandaj strâns pe torace la expir
- Poziție semișezând
- ❌ **NU bandajați** prea strâns

### Fractură coloană
**⚠️ FOARTE PERICULOS!**

- **NU mișcați** victima!
- Chemați ambulanța
- Fixați capul și gâtul

### Fractură bazin
**⚠️ Pericol hemoragie internă!**

- Culcați pe spate pe suprafață dură
- Îndoiți picioarele (poziția "broască")
- Sub genunchi — rulou
- **NU ridicați**

### Fractură femur
- Atelă de la axilă până la picior (extern)
- Atelă suplimentară intern
- Fixați 3 articulații

### Fractură gambă
- Atelă de la treimea superioară a coapsei până la picior
- Fixați genunchiul și glezna

## Reguli aplicare atele

1. **Folosiți:**
   - Atele standard
   - Materiale improvizate

2. **Pregătire:**
   - Căptușiți atela
   - Modelați pe membrul sănătos

3. **Aplicare:**
   - Nu scoateți hainele
   - Fixați 2 articulații
   - Nu strângeți prea tare

4. **Verificare:**
   - Verificați pulsul, sensibilitatea
   - Pielea nu trebuie să fie albastră

## Ajutor la entorse și luxații

### Entorsă
**Regula RICE:**
- **R** — Repaus
- **I** — Ice (gheață)
- **C** — Compresie
- **E** — Elevare

### Luxație
- **NU repoziționați**!
- Fixați în poziția găsită
- Aplicați frig
- Chemați ambulanța`,
        },
        slug: 'fractures-trauma',
        order: 4,
        difficulty: 'intermediate',
        estimatedTime: 30,
      },
      {
        name: {
          ru: 'Помощь при ожогах',
          ro: 'Ajutor la arsuri',
        },
        description: {
          ru: 'Первая помощь при термических, химических и электрических ожогах',
          ro: 'Prim ajutor la arsuri termice, chimice și electrice',
        },
        content: {
          ru: `# Помощь при ожогах

## Классификация ожогов

### По глубине поражения:

#### I степень (поверхностный)
- Покраснение кожи
- Отек
- Болезненность
- Заживает за 5-7 дней без рубцов

**Пример:** солнечный ожог

#### II степень (дермальный)
- Образование пузырей с прозрачной жидкостью
- Сильная боль
- Покраснение вокруг пузырей
- Заживает за 10-14 дней, возможны рубцы

#### III степень (глубокий)
- Поражение всех слоев кожи
- Кожа белая, коричневая или черная
- Боль может быть слабой (повреждены нервы)
- Требует хирургического лечения

#### IV степень (крайне глубокий)
- Обугливание тканей
- Поражение мышц, костей
- Отсутствие боли в центре ожога
- **⚠️ Критическое состояние!**

### По площади поражения:

**Правило ладони:** площадь ладони = 1% поверхности тела

**Правило девяток:**
- Голова и шея — 9%
- Каждая рука — 9%
- Передняя поверхность туловища — 18%
- Задняя поверхность туловища — 18%
- Каждая нога — 18%
- Промежность — 1%

⚠️ **Опасны ожоги >10% поверхности тела у взрослых!**
⚠️ **У детей опасны ожоги >5%!**

## Виды ожогов

### 1. Термические ожоги
Вызваны воздействием:
- Пламени
- Горячей жидкости
- Пара
- Раскаленных предметов

### 2. Химические ожоги
Вызваны:
- Кислотами
- Щелочами
- Другими химическими веществами

### 3. Электрические ожоги
От поражения электрическим током

### 4. Лучевые ожоги
От:
- Солнечного излучения
- Радиации
- Ультрафиолета

## Первая помощь при термических ожогах

### Алгоритм действий:

1. **Прекратите воздействие:**
   - Удалите от источника тепла
   - Погасите пламя (вода, плотная ткань, перекатывание)
   - ❌ **НЕ бегайте** в горящей одежде!

2. **Охладите ожог:**
   - Под прохладной (15-20°C) проточной водой
   - **Не менее 10-20 минут**
   - ❌ **НЕ используйте** лед! (может усугубить повреждение)
   - ❌ **НЕ прикладывайте** лед напрямую к коже

3. **Снимите:**
   - Украшения, часы (до отека)
   - Не прилипшую одежду
   - ❌ **НЕ снимайте** прилипшую одежду! (обрежьте вокруг)

4. **Наложите повязку:**
   - Чистую, сухую, не тугую повязку
   - Стерильный бинт или чистая ткань
   - ❌ **НЕ используйте** вату!

5. **При обширных ожогах:**
   - Вызовите скорую (103, 112)
   - Накройте чистой простыней
   - Дайте обильное питье (если в сознании)
   - Обезбольте (ибупрофен, парацетамол)

### Местное лечение ожогов I-II степени:

После охлаждения:
- Мазь/спрей с пантенолом (Бепантен, Пантенол)
- Мази с серебром (Сульфаргин, Дермазин)
- Стерильная повязка

## Помощь при химических ожогах

### Общий алгоритм:

1. **Удалите химическое вещество:**
   - Снимите загрязненную одежду
   - Сухой салфеткой удалите остатки вещества
   - ⚠️ **Защитите себя** (перчатки!)

2. **Промывание:**
   - **Обильное промывание** проточной водой
   - **Не менее 15-20 минут**
   - Для кислот и щелочей — только вода!

**Исключения (НЕ промывать водой):**
- **Негашеная известь** — сначала удалить сухой салфеткой, потом масло
- **Органические соединения алюминия** — керосин, бензин
- **Фосфор** — промыть, удалить пинцетом под водой

3. **Нейтрализация** (только если известно вещество):
   - **Кислота** → слабый раствор соды (1 ч.л. на стакан воды)
   - **Щелочь** → слабый раствор уксуса (1 ст.л. на литр воды)

4. **Наложите стерильную повязку**

5. **Обратитесь к врачу**

### Химические ожоги глаз:

⚠️ **НЕМЕДЛЕННО:**
1. Промывайте под проточной водой 15-20 минут
2. Открывайте веки руками
3. Промывайте от носа к виску
4. Срочно к офтальмологу!

## Помощь при электрических ожогах

### Особенности:
- Входное и выходное отверстия
- Внутренние повреждения
- Остановка сердца возможна

### Алгоритм:

1. **Прекратите контакт с током:**
   - Выключите рубильник
   - Отодвиньте пострадавшего сухой палкой, доской
   - ⚠️ **Не касайтесь** голыми руками!

2. **Проверьте сознание, дыхание, пульс**

3. **При остановке сердца** — начните СЛР

4. **Обработайте ожоги** как термические

5. **Вызовите скорую** (даже при небольших ожогах — возможны внутренние повреждения)

## Что НЕЛЬЗЯ делать при ожогах

❌ Смазывать маслом, сметаной, кремом (до охлаждения)
❌ Прокалывать пузыри
❌ Отрывать прилипшую одежду
❌ Прикладывать лед
❌ Использовать вату
❌ Наносить спирт, йод, зеленку на ожог
❌ Мочиться на ожог (народный миф!)
❌ Давать алкоголь

## Когда СРОЧНО к врачу

⚠️ **Вызывайте скорую при:**
- Ожоги III-IV степени любой площади
- Ожоги II степени >5% у детей
- Ожоги II степени >10% у взрослых
- Ожоги лица, шеи, промежности
- Ожоги дыхательных путей (закопченное лицо, ожоги в носу/рту)
- Химические ожоги
- Электрические ожоги
- Признаки шока
- Ожоги у детей до 1 года
- Ожоги у беременных
- Ожоги у пожилых людей

## Ожоги дыхательных путей

### Признаки:
- Закопченное лицо
- Ожоги волос в носу
- Осиплость голоса
- Затрудненное дыхание
- Кашель с черной мокротой

### Действия:
⚠️ **НЕМЕДЛЕННО ВЫЗЫВАЙТЕ СКОРУЮ!**
- Обеспечьте свежий воздух
- Полусидячее положение
- Не давайте пить (может потребоваться интубация)

## Профилактика инфекции

1. Чистая стерильная повязка
2. Не касайтесь ожога руками
3. Меняйте повязку в стерильных условиях
4. При признаках инфекции — к врачу

**Признаки инфекции:**
- Усиление боли через 2-3 дня
- Гной
- Неприятный запах
- Лихорадка
- Покраснение вокруг ожога`,
          ro: `# Ajutor la arsuri

## Clasificarea arsurilor

### După profunzime:

#### Gradul I (superficial)
- Înroșire piele
- Edem
- Durere
- Vindecare 5-7 zile fără cicatrici

#### Gradul II (dermal)
- Băști cu lichid clar
- Durere intensă
- Vindecare 10-14 zile

#### Gradul III (profund)
- Afectarea tuturor straturilor pielii
- Piele albă, maro sau neagră
- Necesită tratament chirurgical

#### Gradul IV (extrem de profund)
- Carbonizare țesuturi
- Afectare mușchi, oase
- **⚠️ Stare critică!**

### După suprafață:

**Regula palmei:** palma = 1% suprafața corpului

**Regula novelor:**
- Cap și gât — 9%
- Fiecare braț — 9%
- Față anterioară trunchi — 18%
- Față posterioară trunchi — 18%
- Fiecare picior — 18%
- Perineu — 1%

⚠️ **Periculoase arsuri >10% la adulți!**
⚠️ **La copii >5%!**

## Tipuri de arsuri

### 1. Arsuri termice
De la:
- Flăcări
- Lichide fierbinți
- Abur
- Obiecte încinse

### 2. Arsuri chimice
De la:
- Acizi
- Baze
- Substanțe chimice

### 3. Arsuri electrice
De la șoc electric

### 4. Arsuri prin radiație
De la:
- Radiație solară
- Radiații
- Ultraviolete

## Prim ajutor la arsuri termice

### Algoritm:

1. **Opriți expunerea:**
   - Îndepărtați de sursa de căldură
   - Stingeți flăcările

2. **Răciți arsura:**
   - Sub apă curentă rece (15-20°C)
   - **Minim 10-20 minute**
   - ❌ **NU folosiți** gheață!

3. **Scoateți:**
   - Bijuterii (înainte de edem)
   - Haine neaderente
   - ❌ **NU scoateți** hainele lipite!

4. **Aplicați bandaj:**
   - Curat, uscat, nu strâns
   - ❌ **NU folosiți** vată!

5. **La arsuri extinse:**
   - Chemați ambulanța
   - Acoperiți cu cearșaf curat
   - Dați lichide (dacă conștient)

### Tratament local grad I-II:

După răcire:
- Cremă/spray cu pantenol
- Creme cu argint
- Bandaj steril

## Ajutor la arsuri chimice

### Algoritm:

1. **Îndepărtați substanța:**
   - Scoateți hainele contaminate
   - Îndepărtați substanța cu șervețel uscat
   - ⚠️ **Protejați-vă!**

2. **Spălare:**
   - **Spălare abundentă** cu apă curentă
   - **Minim 15-20 minute**

**Excepții (NU spălați cu apă):**
- **Var nestins** — îndepărtați uscat, apoi ulei
- **Compuși organici de aluminiu** — kerosen
- **Fosfor** — spălați, îndepărtați sub apă

3. **Neutralizare:**
   - **Acid** → soluție slabă de sodă
   - **Bazăă** → soluție slabă de oțet

4. **Bandaj steril**

5. **Consultați medicul**

### Arsuri chimice ale ochilor:

⚠️ **IMEDIAT:**
1. Spălați sub apă curentă 15-20 min
2. Deschideți pleoapele
3. Spălați de la nas la tâmplă
4. Urgent la oftalmolog!

## Ajutor la arsuri electrice

### Algoritm:

1. **Opriți contactul cu curentul:**
   - Deconectați
   - Îndepărtați victima cu obiect uscat
   - ⚠️ **Nu atingeți** cu mâinile goale!

2. **Verificați conștiința, respirația, pulsul**

3. **La stop cardiac** — RCP

4. **Tratați arsurile**

5. **Chemați ambulanța**

## Ce NU trebuie făcut

❌ Ungeți cu ulei, smântână
❌ Spargeți bășicile
❌ Smulgeți hainele lipite
❌ Aplicați gheață
❌ Folosiți vată
❌ Aplicați alcool, iod

## Când URGENT la doctor

⚠️ **Chemați ambulanța:**
- Arsuri grad III-IV
- Arsuri grad II >5% copii
- Arsuri grad II >10% adulți
- Arsuri față, gât
- Arsuri căi respiratorii
- Arsuri chimice
- Arsuri electrice
- Semne de șoc`,
        },
        slug: 'burns-treatment',
        order: 5,
        difficulty: 'advanced',
        estimatedTime: 25,
      },
    ]

    // Добавляем темы
    for (const topicData of topics) {
      const existingTopic = await Topic.findOne({ slug: topicData.slug })

      if (!existingTopic) {
        await Topic.create({
          ...topicData,
          categoryId: category._id,
        })
        console.log(`✅ Создана тема: ${topicData.name.ru}`)
      } else {
        console.log(`⏭️  Тема уже существует: ${topicData.name.ru}`)
      }
    }

    console.log('\n🎉 Завершено! Категория "Оказание первой помощи" добавлена.')
    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

createFirstAidCategory()
