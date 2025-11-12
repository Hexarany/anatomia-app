import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from '../models/Category'
import Topic from '../models/Topic'
import Quiz from '../models/Quiz'

dotenv.config()

const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Category.deleteMany({})
    await Topic.deleteMany({})
    await Quiz.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Seed Categories
    const categories = await Category.insertMany([
      {
        name: { ru: 'Остеология', ro: 'Osteologie' },
        description: { ru: 'Изучение костной системы человека', ro: 'Studiul sistemului osos uman' },
        slug: 'osteology',
        order: 1,
      },
      {
        name: { ru: 'Миология', ro: 'Miologie' },
        description: { ru: 'Изучение мышечной системы', ro: 'Studiul sistemului muscular' },
        slug: 'myology',
        order: 2,
      },
      {
        name: { ru: 'Артрология', ro: 'Artrologie' },
        description: { ru: 'Изучение суставов и связок', ro: 'Studiul articulațiilor și ligamentelor' },
        slug: 'arthrology',
        order: 3,
      },
      {
        name: { ru: 'Нервная система', ro: 'Sistemul nervos' },
        description: { ru: 'Изучение центральной и периферической нервной системы', ro: 'Studiul sistemului nervos central și periferic' },
        slug: 'nervous',
        order: 4,
      },
      {
        name: { ru: 'Сердечно-сосудистая система', ro: 'Sistemul cardiovascular' },
        description: { ru: 'Изучение сердца и кровеносных сосудов', ro: 'Studiul inimii și vaselor de sânge' },
        slug: 'cardiovascular',
        order: 5,
      },
    ])
    console.log('✅ Created categories')

    const osteologyCategory = categories.find((c) => c.slug === 'osteology')!
    const myologyCategory = categories.find((c) => c.slug === 'myology')!
    const arthrologyCategory = categories.find((c) => c.slug === 'arthrology')!
    const nervousCategory = categories.find((c) => c.slug === 'nervous')!
    const cardiovascularCategory = categories.find((c) => c.slug === 'cardiovascular')!

    // ============ ОСТЕОЛОГИЯ ============
    const osteologyTopics = await Topic.insertMany([
      {
        categoryId: osteologyCategory._id,
        name: { ru: 'Череп', ro: 'Craniul' },
        description: { ru: 'Костная структура головы', ro: 'Structura osoasă a capului' },
        content: {
          ru: `# Череп человека

Череп состоит из 23 костей и делится на две части:

## 1. Мозговой череп (8 костей)
- **Лобная кость** - формирует лоб и верхнюю часть глазниц
- **Теменные кости (2)** - формируют верхнюю часть черепа
- **Височные кости (2)** - расположены в боковых отделах
- **Затылочная кость** - формирует заднюю часть черепа
- **Клиновидная кость** - в основании черепа
- **Решетчатая кость** - между глазницами

## 2. Лицевой череп (15 костей)
- **Нижняя челюсть** - единственная подвижная кость черепа
- **Верхнечелюстные кости (2)** - образуют верхнюю челюсть
- **Скуловые кости (2)** - формируют скулы
- **Носовые кости (2)** - образуют спинку носа
- **Слёзные кости (2)** - в медиальных стенках глазниц
- **Нёбные кости (2)** - образуют твёрдое нёбо
- **Сошник** - образует носовую перегородку
- **Нижние носовые раковины (2)**
- **Подъязычная кость** - не соединена с другими костями

## Функции черепа
- Защита головного мозга
- Защита органов чувств
- Основа для мимических и жевательных мышц
- Формирование внешнего вида лица`,
          ro: `# Craniul uman

Craniul constă din 23 de oase și este împărțit în două părți:

## 1. Craniul cerebral (8 oase)
- **Osul frontal** - formează fruntea și partea superioară a orbitelor
- **Oasele parietale (2)** - formează partea superioară a craniului
- **Oasele temporale (2)** - situate în părțile laterale
- **Osul occipital** - formează partea posterioară a craniului
- **Osul sfenoid** - la baza craniului
- **Osul etmoid** - între orbite

## 2. Craniul facial (15 oase)
- **Mandibula** - singurul os mobil al craniului
- **Oasele maxilare (2)** - formează maxilarul superior
- **Oasele zigomatice (2)** - formează pomii
- **Oasele nazale (2)** - formează dosul nasului
- **Oasele lacrimale (2)** - în pereții mediali ai orbitelor
- **Oasele palatine (2)** - formează palatul dur
- **Vomer** - formează septul nazal
- **Cornetele nazale inferioare (2)**
- **Osul hioid** - neconectat cu alte oase

## Funcțiile craniului
- Protecția creierului
- Protecția organelor senzoriale
- Bază pentru mușchii mimici și masticatori
- Formarea aspectului facial`
        },
        images: [],
        videos: [],
        slug: 'skull',
        order: 1,
      },
      {
        categoryId: osteologyCategory._id,
        name: { ru: 'Позвоночник', ro: 'Coloana vertebrală' },
        description: { ru: 'Осевой скелет из позвонков', ro: 'Scheletul axial din vertebre' },
        content: {
          ru: `# Позвоночный столб

Состоит из 33-34 позвонков, разделённых на 5 отделов:

## Отделы позвоночника

### 1. Шейный отдел (C1-C7)
- Самые подвижные позвонки
- C1 (Атлант) - не имеет тела
- C2 (Аксис) - имеет зубовидный отросток
- C7 - выступающий позвонок

### 2. Грудной отдел (T1-T12)
- К ним крепятся рёбра
- Наименее подвижные позвонки
- Формируют заднюю стенку грудной клетки

### 3. Поясничный отдел (L1-L5)
- Самые массивные позвонки
- Несут наибольшую нагрузку
- Высокоподвижные

### 4. Крестцовый отдел
- 5 сросшихся позвонков
- Образуют крестец
- Соединяет позвоночник с тазом

### 5. Копчиковый отдел
- 3-5 сросшихся позвонков
- Рудиментарный хвост

## Изгибы позвоночника
- **Лордозы** (изгибы вперёд): шейный и поясничный
- **Кифозы** (изгибы назад): грудной и крестцовый

## Функции
- Опора тела
- Защита спинного мозга
- Амортизация при движении
- Участие в движениях туловища`,
          ro: `# Coloana vertebrală

Constă din 33-34 vertebre, împărțite în 5 regiuni:

## Regiunile coloanei vertebrale

### 1. Regiunea cervicală (C1-C7)
- Vertebrele cele mai mobile
- C1 (Atlas) - nu are corp
- C2 (Axis) - are procesul odonotoid
- C7 - vertebra proeminentă

### 2. Regiunea toracică (T1-T12)
- La ele se atașează coastele
- Vertebrele cele mai puțin mobile
- Formează peretele posterior al cutiei toracice

### 3. Regiunea lombară (L1-L5)
- Vertebrele cele mai masive
- Suportă cea mai mare sarcină
- Foarte mobile

### 4. Regiunea sacrală
- 5 vertebre fuzionate
- Formează sacrul
- Conectează coloana vertebrală cu bazinul

### 5. Regiunea coccidiană
- 3-5 vertebre fuzionate
- Coadă rudimentară

## Curburile coloanei vertebrale
- **Lordoze** (curbe anterioare): cervicală și lombară
- **Cifoze** (curbe posterioare): toracică și sacrală

## Funcții
- Suport pentru corp
- Protecția măduvei spinării
- Amortizare la mișcare
- Participare la mișcările trunchiului`
        },
        images: [],
        videos: [],
        slug: 'spine',
        order: 2,
      },
      {
        categoryId: osteologyCategory._id,
        name: { ru: 'Грудная клетка', ro: 'Cutia toracică' },
        description: { ru: 'Рёбра и грудина', ro: 'Coastele și sternul' },
        content: {
          ru: `# Грудная клетка

Образована грудными позвонками, рёбрами и грудиной.

## Рёбра (12 пар)

### Истинные рёбра (1-7 пары)
- Присоединяются непосредственно к грудине
- Самые длинные и прочные

### Ложные рёбра (8-10 пары)
- Соединяются с хрящом вышележащих рёбер
- Не достигают грудины напрямую

### Колеблющиеся рёбра (11-12 пары)
- Не соединены с грудиной
- Самые короткие и подвижные

## Грудина
Состоит из трёх частей:
1. **Рукоятка** - верхняя часть
2. **Тело** - средняя часть
3. **Мечевидный отросток** - нижняя часть

## Функции грудной клетки
- Защита сердца и лёгких
- Участие в дыхании
- Опора для мышц
- Защита крупных сосудов

## Практическое значение для массажа
- Межрёберные мышцы
- Точки прикрепления дыхательных мышц
- Важная область для работы с дыханием`,
          ro: `# Cutia toracică

Formată din vertebrele toracice, coaste și stern.

## Coastele (12 perechi)

### Coastele adevărate (perechile 1-7)
- Atașate direct de stern
- Cele mai lungi și rezistente

### Coastele false (perechile 8-10)
- Conectate la cartilajul coastelor superioare
- Nu ajung direct la stern

### Coastele flotante (perechile 11-12)
- Neconectate la stern
- Cele mai scurte și mobile

## Sternul
Constă din trei părți:
1. **Manubriul** - partea superioară
2. **Corpul** - partea mijlocie
3. **Procesul xifoid** - partea inferioară

## Funcțiile cutiei toracice
- Protecția inimii și plămânilor
- Participare la respirație
- Suport pentru mușchi
- Protecția vaselor mari

## Importanță practică pentru masaj
- Mușchii intercostali
- Puncte de atașare ale mușchilor respiratori
- Zonă importantă pentru lucrul cu respirația`
        },
        images: [],
        videos: [],
        slug: 'thorax',
        order: 3,
      },
      {
        categoryId: osteologyCategory._id,
        name: { ru: 'Верхняя конечность', ro: 'Membrul superior' },
        description: { ru: 'Кости руки от плеча до пальцев', ro: 'Oasele brațului de la umăr la degete' },
        content: {
          ru: `# Верхняя конечность

## Пояс верхней конечности
- **Ключица** - соединяет руку с грудиной
- **Лопатка** - треугольная кость на спине

## Свободная верхняя конечность

### Плечо
- **Плечевая кость** - самая длинная кость руки

### Предплечье
- **Лучевая кость** - со стороны большого пальца
- **Локтевая кость** - со стороны мизинца

### Кисть

#### Запястье (8 костей)
Проксимальный ряд:
- Ладьевидная
- Полулунная
- Трёхгранная
- Гороховидная

Дистальный ряд:
- Трапеция
- Трапециевидная
- Головчатая
- Крючковидная

#### Пястье (5 костей)
- Основание кисти

#### Фаланги пальцев
- 14 костей (по 3 на каждый палец, кроме большого - у него 2)

## Важно для массажа
- Знание костных ориентиров
- Места прикрепления мышц
- Суставы и их подвижность`,
          ro: `# Membrul superior

## Centura scapulară
- **Clavicula** - conectează brațul cu sternul
- **Scapula** - os triunghiular pe spate

## Membrul superior liber

### Brațul
- **Humerusul** - cel mai lung os al brațului

### Antebra țul
- **Radiusul** - pe partea degetului mare
- **Ulna** - pe partea degetului mic

### Mâna

#### Carpul (8 oase)
Rândul proximal:
- Scafoid
- Semilunar
- Triquetrum
- Pisiform

Rândul distal:
- Trapez
- Trapezoid
- Capitat
- Hamat

#### Metacarpul (5 oase)
- Baza mâinii

#### Falangele degetelor
- 14 oase (câte 3 pentru fiecare deget, cu excepția policelui - 2)

## Important pentru masaj
- Cunoașterea reperelor osoase
- Locurile de inserție ale mușchilor
- Articulațiile și mobilitatea lor`
        },
        images: [],
        videos: [],
        slug: 'upper-limb',
        order: 4,
      },
      {
        categoryId: osteologyCategory._id,
        name: { ru: 'Нижняя конечность', ro: 'Membrul inferior' },
        description: { ru: 'Кости ноги от таза до пальцев', ro: 'Oasele piciorului de la bazin la degete' },
        content: {
          ru: `# Нижняя конечность

## Пояс нижней конечности (Таз)
Образован тремя сросшимися костями:
- **Подвздошная кость** - самая крупная
- **Лонная кость** - передняя часть
- **Седалищная кость** - задне-нижняя часть

## Свободная нижняя конечность

### Бедро
- **Бедренная кость** - самая длинная и прочная кость тела
- Головка образует тазобедренный сустав
- **Надколенник (коленная чашечка)** - сесамовидная кость

### Голень
- **Большеберцовая кость** - медиально, несёт основную нагрузку
- **Малоберцовая кость** - латерально, более тонкая

### Стопа

#### Предплюсна (7 костей)
- **Таранная кость** - образует голеностопный сустав
- **Пяточная кость** - самая крупная кость стопы
- Ладьевидная
- Кубовидная
- 3 клиновидные кости

#### Плюсна (5 костей)
- Формируют середину стопы

#### Фаланги пальцев (14 костей)
- По 3 на каждый палец, кроме большого (2 фаланги)

## Своды стопы
- **Продольный свод** - предотвращает плоскостопие
- **Поперечный свод** - распределяет нагрузку

## Важно для массажа ног
- Работа со сводами стопы
- Точки напряжения в области таза
- Мышечные прикрепления на бедре и голени`,
          ro: `# Membrul inferior

## Centura pelviană (Bazinul)
Format din trei oase fuzionate:
- **Osul iliac** - cel mai mare
- **Osul pubian** - partea anterioară
- **Osul ischion** - partea postero-inferioară

## Membrul inferior liber

### Coapsa
- **Femorul** - cel mai lung și rezistent os al corpului
- Capul formează articulația coxofemurală
- **Patella (rotula)** - os sesamoid

### Gambа
- **Tibia** - medial, suportă sarcina principală
- **Fibula (peroneu)** - lateral, mai subțire

### Piciorul

#### Tarsul (7 oase)
- **Talus** - formează articulația gleznei
- **Calcaneu** - cel mai mare os al piciorului
- Navicular
- Cuboid
- 3 oase cuneiforme

#### Metatarsul (5 oase)
- Formează mijlocul piciorului

#### Falangele degetelor (14 oase)
- Câte 3 pentru fiecare deget, cu excepția halucelui (2 falange)

## Boltirile piciorului
- **Bolta longitudinală** - previne piciorul plat
- **Bolta transversală** - distribuie sarcina

## Important pentru masajul picioarelor
- Lucrul cu boltirile piciorului
- Punctele de tensiune în zona bazinului
- Inserțiile musculare pe coapsă și gambă`
        },
        images: [],
        videos: [],
        slug: 'lower-limb',
        order: 5,
      },
    ])

    // ============ МИОЛОГИЯ ============
    const myologyTopics = await Topic.insertMany([
      {
        categoryId: myologyCategory._id,
        name: { ru: 'Мышцы спины', ro: 'Mușchii spatelui' },
        description: { ru: 'Глубокие и поверхностные мышцы спины', ro: 'Mușchii profunzi și superficiali ai spatelui' },
        content: {
          ru: `# Мышцы спины

## Поверхностные мышцы

### Трапециевидная мышца
- **Функция**: поднимает, опускает и сводит лопатки
- **Важность**: часто перенапряжена при работе за компьютером
- **Массаж**: основная зона для снятия напряжения

### Широчайшая мышца спины
- **Функция**: приводит и разгибает плечо
- **Важность**: создаёт V-образную форму спины
- **Массаж**: работа с боковыми отделами спины

### Ромбовидные мышцы
- **Функция**: приводят лопатку к позвоночнику
- **Важность**: поддерживают правильную осанку

## Глубокие мышцы

### Мышца, выпрямляющая позвоночник
- **Функция**: разгибание позвоночника
- **Важность**: основная постуральная мышца
- **Массаж**: глубокая работа вдоль позвоночника

### Многораздельные мышцы
- **Функция**: стабилизация позвоночника
- **Важность**: профилактика болей в спине

## Техники массажа спины
1. Поглаживание вдоль позвоночника
2. Разминание трапециевидной мышцы
3. Работа с триггерными точками
4. Растяжение широчайшей мышцы
5. Глубокое разминание околопозвоночных мышц`,
          ro: `# Mușchii spatelui

## Mușchii superficiali

### Trapezul
- **Funcție**: ridică, coboară și apropie scapulele
- **Importanță**: adesea suprasolicitat la lucrul la computer
- **Masaj**: zona principală pentru reducerea tensiunii

### Marele dorsal
- **Funcție**: aduce și extinde umărul
- **Importanță**: creează forma în V a spatelui
- **Masaj**: lucru cu părțile laterale ale spatelui

### Mușchii romboidali
- **Funcție**: aduc scapula spre coloana vertebrală
- **Importanță**: mențin postura corectă

## Mușchii profunzi

### Erectorul spinal
- **Funcție**: extensia coloanei vertebrale
- **Importanță**: principal mușchi postural
- **Masaj**: lucru profund de-a lungul coloanei

### Mușchii multifizi
- **Funcție**: stabilizarea coloanei vertebrale
- **Importanță**: prevenirea durerilor de spate

## Tehnici de masaj ale spatelui
1. Efluraj de-a lungul coloanei
2. Frământare a trapezului
3. Lucru cu punctele trigger
4. Întindere a marelui dorsal
5. Frământare profundă a mușchilor paravertebrali`
        },
        images: [],
        videos: [],
        slug: 'back-muscles',
        order: 1,
      },
      {
        categoryId: myologyCategory._id,
        name: { ru: 'Мышцы шеи', ro: 'Mușchii gâtului' },
        description: { ru: 'Мышцы передней и задней поверхности шеи', ro: 'Mușchii părții anterioare și posterioare a gâtului' },
        content: {
          ru: `# Мышцы шеи

## Передние мышцы шеи

### Грудино-ключично-сосцевидная мышца
- **Функция**: наклон и поворот головы
- **Важность**: часто напряжена при стрессе
- **Массаж**: осторожная работа, избегать сосудов

### Лестничные мышцы
- **Функция**: подъём рёбер при дыхании
- **Важность**: участвуют в глубоком дыхании
- **Массаж**: точечная работа, осторожно

## Задние мышцы шеи

### Трапециевидная мышца (шейная часть)
- **Функция**: разгибание головы и шеи
- **Важность**: зона частых болей

### Подзатылочные мышцы
- **Функция**: тонкие движения головы
- **Важность**: источник головных болей напряжения
- **Массаж**: работа с основанием черепа

## Техники массажа шеи
1. Лёгкое поглаживание
2. Осторожное разминание грудино-ключично-сосцевидной мышцы
3. Точечная работа с подзатылочными мышцами
4. Растяжение шейных мышц
5. Работа с триггерными точками

## Предостережения
- Избегать давления на сонные артерии
- Не применять резкие движения
- Учитывать наличие остеохондроза`,
          ro: `# Mușchii gâtului

## Mușchii anteriori ai gâtului

### Mușchiul sternocl eidomastoidian
- **Funcție**: înclinarea și rotația capului
- **Importanță**: adesea tensionat în stres
- **Masaj**: lucru prudent, evitarea vaselor

### Mușchii scaleni
- **Funcție**: ridicarea coastelor la respirație
- **Importanță**: participă la respirația profundă
- **Masaj**: lucru punctual, cu precauție

## Mușchii posteriori ai gâtului

### Trapezul (porțiunea cervicală)
- **Funcție**: extensia capului și gâtului
- **Importanță**: zonă de dureri frecvente

### Mușchii suboccipitali
- **Funcție**: mișcări fine ale capului
- **Importanță**: sursă de dureri de cap tensionale
- **Masaj**: lucru cu baza craniului

## Tehnici de masaj al gâtului
1. Efluraj ușor
2. Frământare prudentă a mușchiului sternocleidomastoidian
3. Lucru punctual cu mușchii suboccipitali
4. Întindere a mușchilor cervicali
5. Lucru cu punctele trigger

## Precauții
- Evitarea presiunii pe arterele carotide
- Fără mișcări bruște
- Considerarea prezenței osteocondrozei`
        },
        images: [],
        videos: [],
        slug: 'neck-muscles',
        order: 2,
      },
      {
        categoryId: myologyCategory._id,
        name: { ru: 'Мышцы груди', ro: 'Mușchii toracelui' },
        description: { ru: 'Грудные мышцы и их функции', ro: 'Mușchii pectorali și funcțiile lor' },
        content: {
          ru: `# Мышцы груди

## Большая грудная мышца
- **Начало**: ключица, грудина, рёбра
- **Прикрепление**: плечевая кость
- **Функция**: приведение и сгибание плеча
- **Важность**: основная мышца передней поверхности грудной клетки
- **Массаж**: разминание и растяжение

## Малая грудная мышца
- **Расположение**: под большой грудной
- **Функция**: опускает плечевой пояс
- **Важность**: часто укорочена, нарушает осанку
- **Массаж**: глубокая работа под большой грудной

## Передняя зубчатая мышца
- **Функция**: отводит лопатку от позвоночника
- **Важность**: стабилизирует лопатку при движениях руки
- **Массаж**: работа в подмышечной области

## Межрёберные мышцы
- **Наружные**: поднимают рёбра (вдох)
- **Внутренние**: опускают рёбра (выдох)
- **Важность**: участвуют в дыхании
- **Массаж**: работа между рёбрами

## Техники массажа грудной области
1. Поглаживание от центра к плечам
2. Разминание большой грудной мышцы
3. Растяжение грудных мышц
4. Работа с межрёберными промежутками
5. Дыхательные техники

## Особенности массажа
- Учитывать гендерные различия
- Работать с осанкой
- Сочетать с растяжкой`,
          ro: `# Mușchii toracelui

## Marele pectoral
- **Origine**: clavicula, sternul, coastele
- **Inserție**: humerus
- **Funcție**: aducția și flexia umărului
- **Importanță**: principalul mușchi al suprafeței anterioare toracice
- **Masaj**: frământare și întindere

## Micul pectoral
- **Localizare**: sub marele pectoral
- **Funcție**: coboară centura scapulară
- **Importanță**: adesea scurtat, perturbă postura
- **Masaj**: lucru profund sub marele pectoral

## Mușchiul serrat anterior
- **Funcție**: îndepărtează scapula de coloana vertebrală
- **Importanță**: stabilizează scapula la mișcările brațului
- **Masaj**: lucru în zona axilară

## Mușchii intercostali
- **Externi**: ridică coastele (inspirație)
- **Interni**: coboară coastele (expirație)
- **Importanță**: participă la respirație
- **Masaj**: lucru între coaste

## Tehnici de masaj al regiunii toracice
1. Efluraj de la centru spre umeri
2. Frământare a marelui pectoral
3. Întindere a mușchilor pectorali
4. Lucru cu spațiile intercostale
5. Tehnici respiratorii

## Particularități ale masajului
- Considerarea diferențelor de gen
- Lucru cu postura
- Combinare cu stretching`
        },
        images: [],
        videos: [],
        slug: 'chest-muscles',
        order: 3,
      },
    ])

    // ============ АРТРОЛОГИЯ ============
    const arthrologyTopics = await Topic.insertMany([
      {
        categoryId: arthrologyCategory._id,
        name: { ru: 'Плечевой сустав', ro: 'Articulația umărului' },
        description: { ru: 'Самый подвижный сустав тела', ro: 'Cea mai mobilă articulație a corpului' },
        content: {
          ru: `# Плечевой сустав

## Строение
- **Тип**: шаровидный сустав
- **Образован**: головкой плечевой кости и суставной впадиной лопатки
- **Особенность**: самый подвижный сустав в теле

## Движения в плечевом суставе
1. **Сгибание** - до 180°
2. **Разгибание** - до 40°
3. **Отведение** - до 180°
4. **Приведение** - до 40°
5. **Вращение** внутреннее и наружное
6. **Круговые движения**

## Связки
- **Клювовидно-плечевая** - укрепляет сустав сверху
- **Суставно-плечевые связки** - укрепляют капсулу

## Вращательная манжета плеча
Состоит из 4 мышц:
1. Надостная
2. Подостная
3. Малая круглая
4. Подлопаточная

## Частые проблемы
- **Импинджмент-синдром** - защемление сухожилий
- **Разрыв вращательной манжеты**
- **Замороженное плечо** - ограничение подвижности
- **Вывихи** - из-за большой подвижности

## Массаж плечевого сустава
1. Разогрев окружающих мышц
2. Работа с дельтовидной мышцей
3. Мобилизация сустава (осторожно!)
4. Растяжение капсулы
5. Работа с вращательной манжетой

## Предостережения
- Избегать резких движений
- Учитывать историю травм
- Не работать при острой боли`,
          ro: `# Articulația umărului

## Structura
- **Tip**: articulație sferică
- **Formată**: de capul humerusului și cavitatea glenoidă a scapulei
- **Particularitate**: cea mai mobilă articulație din corp

## Mișcările articulației umărului
1. **Flexie** - până la 180°
2. **Extensie** - până la 40°
3. **Abducție** - până la 180°
4. **Aducție** - până la 40°
5. **Rotație** internă și externă
6. **Circumducție**

## Ligamente
- **Ligamentul coracohumeralм** - întărește articulația superior
- **Ligamentele glenohumerale** - întăresc capsula

## Manșeta rotatorilor
Constă din 4 mușchi:
1. Supraspinos
2. Infraspinos
3. Teres minor
4. Subscapular

## Probleme frecvente
- **Sindromul de impact** - comprimarea tendoanelor
- **Ruptura manșetei rotatorilor**
- **Umărul înghețat** - limitarea mobilității
- **Luxații** - datorită mobilității mari

## Masajul articulației umărului
1. Încălzirea mușchilor din jur
2. Lucru cu deltoidul
3. Mobilizarea articulației (prudent!)
4. Întinderea capsulei
5. Lucru cu manșeta rotatorilor

## Precauții
- Evitarea mișcărilor bruște
- Considerarea istoricului traumatic
- Fără lucru la durere acută`
        },
        images: [],
        videos: [],
        slug: 'shoulder-joint',
        order: 1,
      },
      {
        categoryId: arthrologyCategory._id,
        name: { ru: 'Коленный сустав', ro: 'Articulația genunchiului' },
        description: { ru: 'Самый большой сустав тела', ro: 'Cea mai mare articulație a corpului' },
        content: {
          ru: `# Коленный сустав

## Строение
- **Тип**: мыщелковый сустав (разновидность блоковидного)
- **Образован**: бедренной, большеберцовой костями и надколенником
- **Особенность**: самый большой и сложный сустав

## Мениски
- **Медиальный** - С-образный
- **Латеральный** - О-образный
- **Функция**: амортизация, стабилизация
- **Важность**: часто травмируются

## Связки

### Внутрисуставные
- **Передняя крестообразная** (ПКС) - предотвращает смещение голени вперёд
- **Задняя крестообразная** (ЗКС) - предотвращает смещение назад

### Внесуставные
- **Медиальная коллатеральная** - стабилизирует изнутри
- **Латеральная коллатеральная** - стабилизирует снаружи
- **Связка надколенника** - продолжение сухожилия четырёхглавой мышцы

## Движения
1. **Сгибание** - до 140°
2. **Разгибание** - до 0° (полное выпрямление)
3. **Небольшая ротация** при согнутом колене

## Частые проблемы
- **Повреждение менисков**
- **Разрыв крестообразных связок**
- **Пателлофеморальный синдром** - боль под надколенником
- **Артроз** - износ хряща

## Массаж коленного сустава
1. Лимфодренаж окружающих тканей
2. Работа с четырёхглавой мышцей бедра
3. Мобилизация надколенника
4. Работа с подколенной ямкой (осторожно!)
5. Укрепляющие упражнения после массажа

## Противопоказания
- Острое воспаление
- Свежие травмы
- Гемартроз (кровь в суставе)`,
          ro: `# Articulația genunchiului

## Structura
- **Tip**: articulație bicondiliană (varietate de articulație ginglim)
- **Formată**: de femur, tibie și patella
- **Particularitate**: cea mai mare și complexă articulație

## Meniscurile
- **Medial** - în formă de C
- **Lateral** - în formă de O
- **Funcție**: amortizare, stabilizare
- **Importanță**: adesea traumatizate

## Ligamente

### Intraarticulare
- **Ligamentul cruciat anterior** (LCA) - previne deplasarea tibiei anterior
- **Ligamentul cruciat posterior** (LCP) - previne deplasarea posterior

### Extraarticulare
- **Ligamentul colateral medial** - stabilizează medial
- **Ligamentul colateral lateral** - stabilizează lateral
- **Ligamentul patelar** - continuarea tendonului cvadricepsului

## Mișcări
1. **Flexie** - până la 140°
2. **Extensie** - până la 0° (întindere completă)
3. **Rotație ușoară** la genunchi îndoit

## Probleme frecvente
- **Leziuni meniscale**
- **Rupturi de ligamente cruciate**
- **Sindrom patelo-femoral** - durere sub patella
- **Artroză** - uzura cartilajului

## Masajul articulației genunchiului
1. Drenaj limfatic al țesuturilor înconjurătoare
2. Lucru cu cvadricepsul
3. Mobilizarea patelei
4. Lucru cu fosa poplitee (prudent!)
5. Exerciții de întărire după masaj

## Contraindicații
- Inflamație acută
- Traumatisme recente
- Hemartroza (sânge în articulație)`
        },
        images: [],
        videos: [],
        slug: 'knee-joint',
        order: 2,
      },
    ])

    // ============ НЕРВНАЯ СИСТЕМА ============
    const nervousTopics = await Topic.insertMany([
      {
        categoryId: nervousCategory._id,
        name: { ru: 'Центральная нервная система', ro: 'Sistemul nervos central' },
        description: { ru: 'Головной и спинной мозг', ro: 'Creierul și măduva spinării' },
        content: {
          ru: `# Центральная нервная система (ЦНС)

## Головной мозг

### Большие полушария
- **Лобные доли**: мышление, планирование, движение
- **Теменные доли**: осязание, восприятие тела
- **Височные доли**: слух, память, речь
- **Затылочные доли**: зрение

### Мозжечок
- **Функция**: координация движений, равновесие
- **Важность для массажа**: связь с мышечным тонусом

### Ствол мозга
- **Средний мозг**
- **Мост**
- **Продолговатый мозг**
- **Функции**: жизненно важные центры (дыхание, сердцебиение)

## Спинной мозг

### Строение
- Расположен в позвоночном канале
- 31 сегмент
- Белое и серое вещество

### Функции
1. **Проводниковая** - передача импульсов
2. **Рефлекторная** - простые рефлексы

## Оболочки ЦНС
1. **Твёрдая** - наружная, защитная
2. **Паутинная** - средняя, с ликвором
3. **Мягкая** - внутренняя, сосудистая

## Значение для массажа
- Понимание иннервации мышц
- Рефлекторные зоны
- Сегментарный массаж
- Влияние на вегетативную нервную систему

## Предостережения
- Избегать области шейных позвонков при патологии
- Не применять сильное давление на позвоночник
- Учитывать неврологические заболевания`,
          ro: `# Sistemul nervos central (SNC)

## Creierul

### Emisfere cerebrale
- **Lobii frontali**: gândire, planificare, mișcare
- **Lobii parietali**: tactil, percepția corpului
- **Lobii temporali**: auz, memorie, vorbire
- **Lobii occipitali**: vedere

### Cerebel
- **Funcție**: coordonarea mișcărilor, echilibrul
- **Importanță pentru masaj**: legătura cu tonusul muscular

### Trunchiul cerebral
- **Mezencefal**
- **Pons**
- **Bulb rahidian**
- **Funcții**: centre vitale (respirație, bătăile inimii)

## Măduva spinării

### Structura
- Localizată în canalul vertebral
- 31 segmente
- Substanță albă și cenușie

### Funcții
1. **Conductoare** - transmiterea impulsurilor
2. **Reflexă** - reflexe simple

## Meningele SNC
1. **Dura mater** - externă, protectoare
2. **Arahnoida** - mijlocie, cu lichid cefalorahidian
3. **Pia mater** - internă, vasculară

## Importanță pentru masaj
- Înțelegerea inervației musculare
- Zone reflexe
- Masaj segmentar
- Influență asupra sistemului nervos vegetativ

## Precauții
- Evitarea zonei vertebrelor cervicale la patologie
- Fără presiune puternică pe coloană
- Considerarea bolilor neurologice`
        },
        images: [],
        videos: [],
        slug: 'central-nervous-system',
        order: 1,
      },
    ])

    // ============ CARDIOVASCULAR ============
    const cardiovascularTopics = await Topic.insertMany([
      {
        categoryId: cardiovascularCategory._id,
        name: { ru: 'Сердце', ro: 'Inima' },
        description: { ru: 'Строение и функции сердца', ro: 'Structura și funcțiile inimii' },
        content: {
          ru: `# Сердце

## Строение

### Камеры сердца
1. **Правое предсердие** - принимает венозную кровь
2. **Правый желудочек** - выталкивает кровь в лёгкие
3. **Левое предсердие** - принимает артериальную кровь из лёгких
4. **Левый желудочек** - выталкивает кровь в аорту

### Клапаны
- **Трёхстворчатый** - между правыми камерами
- **Двухстворчатый (митральный)** - между левыми камерами
- **Лёгочный** - между правым желудочком и лёгочной артерией
- **Аортальный** - между левым желудочком и аортой

## Кровоснабжение сердца
- **Коронарные артерии** - питают сердечную мышцу
- **Левая коронарная артерия**
- **Правая коронарная артерия**

## Проводящая система
1. Синусовый узел (водитель ритма)
2. Атриовентрикулярный узел
3. Пучок Гиса
4. Волокна Пуркинье

## Сердечный цикл
1. **Систола** - сокращение (0.3 сек)
2. **Диастола** - расслабление (0.5 сек)

## Значение для массажа
- Влияние массажа на сердечно-сосудистую систему
- Улучшение кровообращения
- Снижение нагрузки на сердце
- Противопоказания при сердечных заболеваниях

## Противопоказания
- Острый инфаркт миокарда
- Тяжёлая сердечная недостаточность
- Аритмии в стадии декомпенсации
- Аневризма аорты`,
          ro: `# Inima

## Structura

### Camerele inimii
1. **Atriul drept** - primește sângele venos
2. **Ventriculul drept** - pompează sângele în plămâni
3. **Atriul stâng** - primește sângele arterial din plămâni
4. **Ventriculul stâng** - pompează sângele în aortă

### Valve
- **Tricuspidă** - între camerele drepte
- **Bicuspidă (mitrală)** - între camerele stângi
- **Pulmonară** - între ventriculul drept și artera pulmonară
- **Aortică** - între ventriculul stâng și aortă

## Vascularizația inimii
- **Arterele coronare** - alimentează mușchiul cardiac
- **Artera coronară stângă**
- **Artera coronară dreaptă**

## Sistemul de conducere
1. Nodul sinusal (pacemaker)
2. Nodul atrioventricular
3. Fasciculul His
4. Fibrele Purkinje

## Ciclul cardiac
1. **Sistola** - contracție (0.3 sec)
2. **Diastola** - relaxare (0.5 sec)

## Importanță pentru masaj
- Influența masajului asupra sistemului cardiovascular
- Îmbunătățirea circulației
- Reducerea sarcinii asupra inimii
- Contraindicații la boli cardiace

## Contraindicații
- Infarct miocardic acut
- Insuficiență cardiacă severă
- Aritmii în stadiu de decompensare
- Anevrism de aortă`
        },
        images: [],
        videos: [],
        slug: 'heart',
        order: 1,
      },
    ])

    console.log('✅ Created all topics')

    // ============ СОЗДАНИЕ ТЕСТОВ ============
    const allTopics = [...osteologyTopics, ...myologyTopics, ...arthrologyTopics, ...nervousTopics, ...cardiovascularTopics]

    const quizzes = []

    // Тест по черепу
    quizzes.push({
      topicId: osteologyTopics.find(t => t.slug === 'skull')!._id,
      categoryId: osteologyCategory._id,
      title: { ru: 'Тест: Череп', ro: 'Test: Craniul' },
      description: { ru: 'Проверка знаний о строении черепа', ro: 'Verificarea cunoștințelor despre structura craniului' },
      questions: [
        {
          question: { ru: 'Сколько костей в черепе человека?', ro: 'Câte oase sunt în craniul uman?' },
          options: [
            { ru: '20', ro: '20' },
            { ru: '23', ro: '23' },
            { ru: '26', ro: '26' },
            { ru: '29', ro: '29' },
          ],
          correctAnswer: 1,
          explanation: { ru: 'Череп состоит из 23 костей', ro: 'Craniul constă din 23 de oase' },
        },
        {
          question: { ru: 'Какая кость черепа подвижна?', ro: 'Care os al craniului este mobil?' },
          options: [
            { ru: 'Лобная', ro: 'Frontal' },
            { ru: 'Нижняя челюсть', ro: 'Mandibula' },
            { ru: 'Затылочная', ro: 'Occipital' },
            { ru: 'Височная', ro: 'Temporal' },
          ],
          correctAnswer: 1,
        },
      ],
      slug: 'skull-quiz',
    })

    // Тест по позвоночнику
    quizzes.push({
      topicId: osteologyTopics.find(t => t.slug === 'spine')!._id,
      categoryId: osteologyCategory._id,
      title: { ru: 'Тест: Позвоночник', ro: 'Test: Coloana vertebrală' },
      description: { ru: 'Проверка знаний о позвоночнике', ro: 'Verificarea cunoștințelor despre coloana vertebrală' },
      questions: [
        {
          question: { ru: 'Сколько шейных позвонков у человека?', ro: 'Câte vertebre cervicale are omul?' },
          options: [
            { ru: '5', ro: '5' },
            { ru: '7', ro: '7' },
            { ru: '12', ro: '12' },
            { ru: '5', ro: '5' },
          ],
          correctAnswer: 1,
        },
        {
          question: { ru: 'Как называется первый шейный позвонок?', ro: 'Cum se numește prima vertebră cervicală?' },
          options: [
            { ru: 'Аксис', ro: 'Axis' },
            { ru: 'Атлант', ro: 'Atlas' },
            { ru: 'Промонториум', ro: 'Promontoriu' },
            { ru: 'Эпистрофей', ro: 'Epistrofeul' },
          ],
          correctAnswer: 1,
        },
      ],
      slug: 'spine-quiz',
    })

    // Тест по мышцам спины
    quizzes.push({
      topicId: myologyTopics.find(t => t.slug === 'back-muscles')!._id,
      categoryId: myologyCategory._id,
      title: { ru: 'Тест: Мышцы спины', ro: 'Test: Mușchii spatelui' },
      description: { ru: 'Проверка знаний о мышцах спины', ro: 'Verificarea cunoștințelor despre mușchii spatelui' },
      questions: [
        {
          question: { ru: 'Какая мышца создаёт V-образную форму спины?', ro: 'Care mușchi creează forma în V a spatelui?' },
          options: [
            { ru: 'Трапециевидная', ro: 'Trapez' },
            { ru: 'Широчайшая', ro: 'Marele dorsal' },
            { ru: 'Ромбовидная', ro: 'Romboid' },
            { ru: 'Выпрямляющая позвоночник', ro: 'Erectorul spinal' },
          ],
          correctAnswer: 1,
        },
      ],
      slug: 'back-muscles-quiz',
    })

    await Quiz.insertMany(quizzes)
    console.log('✅ Created quizzes')

    console.log('\n✅ Database seeded successfully!')
    console.log('\nSummary:')
    console.log(`- Categories: ${categories.length}`)
    console.log(`- Topics: ${allTopics.length}`)
    console.log(`  • Остеология: ${osteologyTopics.length}`)
    console.log(`  • Миология: ${myologyTopics.length}`)
    console.log(`  • Артрология: ${arthrologyTopics.length}`)
    console.log(`  • Нервная система: ${nervousTopics.length}`)
    console.log(`  • Сердечно-сосудистая: ${cardiovascularTopics.length}`)
    console.log(`- Quizzes: ${quizzes.length}`)

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
