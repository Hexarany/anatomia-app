import mongoose from 'mongoose'
import dotenv from 'dotenv'
import HygieneGuideline from '../models/HygieneGuideline'
import { connectDB } from '../config/database'

dotenv.config()

const hygieneGuidelines = [
  // Методы стерилизации (Sterilization)
  {
    title: {
      ru: 'Автоклавирование',
      ro: 'Sterilizarea cu autoclavă',
    },
    category: 'sterilization',
    content: {
      ru: `# Автоклавирование - основной метод стерилизации

## Описание метода
Автоклавирование — это процесс стерилизации инструментов с использованием насыщенного водяного пара под давлением при температуре 121-134°C.

## Параметры стерилизации
- **Температура**: 121°C в течение 20 минут или 134°C в течение 3 минут
- **Давление**: 1-2 атмосферы
- **Время выдержки**: зависит от температуры и типа загрузки

## Преимущества
- Наиболее эффективный метод стерилизации
- Уничтожает все формы микроорганизмов, включая споры
- Экологически безопасен
- Не оставляет токсичных остатков

## Применение в массажной практике
Используется для стерилизации:
- Металлических инструментов
- Многоразовых банок
- Текстильных материалов (простыни, полотенца в крафт-пакетах)
- Стеклянных изделий

## Контроль качества
- Использование химических индикаторов
- Биологический контроль (споровые тесты) раз в неделю
- Регулярная проверка приборов`,
      ro: `# Sterilizarea cu autoclavă - metoda principală de sterilizare

## Descrierea metodei
Sterilizarea cu autoclavă este un proces de sterilizare a instrumentelor folosind abur saturat sub presiune la temperatura de 121-134°C.

## Parametrii de sterilizare
- **Temperatura**: 121°C timp de 20 minute sau 134°C timp de 3 minute
- **Presiunea**: 1-2 atmosfere
- **Timpul de expunere**: depinde de temperatură și tipul de încărcare

## Avantaje
- Cea mai eficientă metodă de sterilizare
- Distruge toate formele de microorganisme, inclusiv sporele
- Ecologic
- Nu lasă reziduuri toxice

## Aplicare în practica de masaj
Se utilizează pentru sterilizarea:
- Instrumentelor metalice
- Ventuzelor reutilizabile
- Materialelor textile (cearșafuri, prosoape în pungi kraft)
- Articolelor din sticlă

## Controlul calității
- Utilizarea indicatorilor chimici
- Control biologic (teste cu spori) o dată pe săptămână
- Verificarea regulată a aparatelor`,
    },
    images: [],
    order: 1,
    isPublished: true,
  },
  {
    title: {
      ru: 'Сухожаровая стерилизация',
      ro: 'Sterilizarea cu aer uscat',
    },
    category: 'sterilization',
    content: {
      ru: `# Сухожаровая стерилизация

## Описание метода
Стерилизация сухим горячим воздухом в специальном шкафу при высокой температуре.

## Параметры
- **Температура**: 160-180°C
- **Время**: 60-150 минут в зависимости от температуры
- **Оборудование**: сухожаровой шкаф

## Особенности
- Подходит для материалов, чувствительных к влаге
- Более длительный цикл по сравнению с автоклавированием
- Не подходит для текстиля и резины

## Применение
Используется для стерилизации:
- Металлических инструментов
- Стеклянной посуды
- Порошкообразных веществ

## Важно
Не допускается перегрузка шкафа, так как это нарушает циркуляцию воздуха и эффективность стерилизации.`,
      ro: `# Sterilizarea cu aer uscat

## Descrierea metodei
Sterilizarea cu aer cald uscat într-o etuvă specială la temperatură înaltă.

## Parametrii
- **Temperatura**: 160-180°C
- **Timpul**: 60-150 minute în funcție de temperatură
- **Echipamentul**: etuvă cu aer uscat

## Particularități
- Potrivit pentru materiale sensibile la umiditate
- Ciclu mai lung comparativ cu sterilizarea cu autoclavă
- Nu este potrivit pentru textile și cauciuc

## Aplicare
Se utilizează pentru sterilizarea:
- Instrumentelor metalice
- Veselei din sticlă
- Substanțelor pulverulente

## Important
Nu se permite supraîncărcarea etuvei, deoarece acest lucru perturbă circulația aerului și eficiența sterilizării.`,
    },
    images: [],
    order: 2,
    isPublished: true,
  },

  // Методы дезинфекции (Disinfection)
  {
    title: {
      ru: 'Химическая дезинфекция поверхностей',
      ro: 'Dezinfecția chimică a suprafețelor',
    },
    category: 'disinfection',
    content: {
      ru: `# Химическая дезинфекция поверхностей

## Основные дезинфектанты

### 1. Спиртовые растворы (70-90%)
- **Применение**: быстрая обработка малых поверхностей
- **Время воздействия**: 1-2 минуты
- **Преимущества**: быстрое действие, испарение без следов

### 2. Хлорсодержащие препараты
- **Применение**: дезинфекция больших поверхностей
- **Концентрация**: 0,1-0,5% активного хлора
- **Время воздействия**: 30-60 минут

### 3. Четвертичные аммониевые соединения (ЧАС)
- **Применение**: регулярная уборка кабинета
- **Преимущества**: не вызывают коррозию, приятный запах
- **Эффективность**: против большинства бактерий и вирусов

## Правила дезинфекции
1. Предварительная механическая очистка
2. Нанесение дезинфектанта на всю поверхность
3. Соблюдение времени экспозиции
4. Смывание/удаление остатков (при необходимости)

## График обработки
- **Массажный стол**: после каждого клиента
- **Дверные ручки, выключатели**: 2 раза в день
- **Пол**: ежедневно
- **Генеральная уборка**: еженедельно`,
      ro: `# Dezinfecția chimică a suprafețelor

## Dezinfectanții principali

### 1. Soluții alcoolice (70-90%)
- **Aplicare**: tratarea rapidă a suprafețelor mici
- **Timpul de acțiune**: 1-2 minute
- **Avantaje**: acțiune rapidă, evaporare fără urme

### 2. Preparate cu clor
- **Aplicare**: dezinfecția suprafețelor mari
- **Concentrație**: 0,1-0,5% clor activ
- **Timpul de acțiune**: 30-60 minute

### 3. Compuși de amoniu cuaternar (CAC)
- **Aplicare**: curățarea regulată a cabinetului
- **Avantaje**: nu cauzează coroziune, miros plăcut
- **Eficiență**: împotriva majorității bacteriilor și virusurilor

## Regulile de dezinfecție
1. Curățarea mecanică preliminară
2. Aplicarea dezinfectantului pe toată suprafața
3. Respectarea timpului de expunere
4. Clătirea/îndepărtarea resturilor (dacă este necesar)

## Graficul de tratare
- **Masa de masaj**: după fiecare client
- **Mânerele ușilor, întrerupătoarele**: de 2 ori pe zi
- **Podeaua**: zilnic
- **Curățarea generală**: săptămânal`,
    },
    images: [],
    order: 1,
    isPublished: true,
  },
  {
    title: {
      ru: 'Обработка рук массажиста',
      ro: 'Tratarea mâinilor terapeutului',
    },
    category: 'disinfection',
    content: {
      ru: `# Гигиеническая обработка рук

## Два уровня обработки

### 1. Гигиеническое мытье рук
**Когда**: перед работой, после туалета, перед едой

**Алгоритм**:
1. Смочить руки водой
2. Нанести мыло и вспенить
3. Тщательно намылить:
   - Ладони
   - Тыльную сторону кистей
   - Межпальцевые промежутки
   - Большие пальцы
   - Кончики пальцев и ногти
4. Мыть не менее 20-30 секунд
5. Смыть теплой водой
6. Высушить одноразовым полотенцем

### 2. Гигиеническая дезинфекция рук
**Когда**: перед каждым клиентом, после контакта с потенциально инфицированными поверхностями

**Алгоритм**:
1. Нанести 3 мл антисептика на сухие руки
2. Втирать в кожу рук, включая:
   - Ладони и тыльную сторону
   - Межпальцевые промежутки
   - Запястья
3. Втирать до полного высыхания (30-60 секунд)
4. Не вытирать полотенцем

## Требования к антисептикам
- Содержание спирта 60-90%
- Наличие смягчающих компонентов (глицерин, алоэ)
- Соответствие медицинским стандартам

## Уход за кожей рук
- Использование увлажняющих кремов
- Избегание чрезмерного мытья горячей водой
- Своевременное лечение трещин и повреждений`,
      ro: `# Tratarea igienică a mâinilor

## Două niveluri de tratare

### 1. Spălarea igienică a mâinilor
**Când**: înainte de lucru, după toaletă, înainte de masă

**Algoritmul**:
1. Udați mâinile cu apă
2. Aplicați săpun și faceți spumă
3. Săpuniți temeinic:
   - Palmele
   - Dosul mâinilor
   - Spațiile interdigitale
   - Degetele mari
   - Vârfurile degetelor și unghiile
4. Spălați cel puțin 20-30 secunde
5. Clătiți cu apă caldă
6. Uscați cu prosop de unică folosință

### 2. Dezinfecția igienică a mâinilor
**Când**: înainte de fiecare client, după contactul cu suprafețe potențial infectate

**Algoritmul**:
1. Aplicați 3 ml de antiseptic pe mâinile uscate
2. Frecați în pielea mâinilor, incluzând:
   - Palmele și dosul mâinilor
   - Spațiile interdigitale
   - Încheieturile
3. Frecați până la uscare completă (30-60 secunde)
4. Nu ștergeți cu prosop

## Cerințe pentru antiseptice
- Conținutul de alcool 60-90%
- Prezența componentelor emoliente (glicerină, aloe)
- Conformitatea cu standardele medicale

## Îngrijirea pielii mâinilor
- Utilizarea cremelor hidratante
- Evitarea spălării excesive cu apă fierbinte
- Tratarea la timp a crăpăturilor și leziunilor`,
    },
    images: [],
    order: 2,
    isPublished: true,
  },

  // Эргономика (Ergonomics)
  {
    title: {
      ru: 'Правильная поза массажиста',
      ro: 'Postura corectă a terapeutului',
    },
    category: 'ergonomics',
    content: {
      ru: `# Биомеханика работы массажиста

## Основные принципы

### 1. Положение тела
- **Спина**: прямая, естественные изгибы позвоночника сохранены
- **Плечи**: расслаблены, опущены вниз
- **Колени**: слегка согнуты для амортизации
- **Стопы**: на ширине плеч, устойчивое положение

### 2. Использование веса тела
- Работать весом тела, а не силой мышц рук
- Переносить вес с одной ноги на другую
- Использовать движение от бедра
- Сохранять центр тяжести над точкой приложения силы

### 3. Высота массажного стола
**Правило**: при опущенных руках костяшки пальцев должны касаться поверхности стола

**Корректировка**:
- Для глубокого массажа: на 5-10 см ниже
- Для поверхностных техник: на уровне костяшек

## Профилактика профессиональных травм

### Упражнения между сеансами
1. Вращения плечами (10 раз)
2. Растяжка запястий
3. Наклоны корпуса в стороны
4. Встряхивание рук

### Режим работы
- Перерыв 10-15 минут после каждого часа работы
- Не более 6-7 массажей в день
- Один выходной в неделю обязательно

## Признаки неправильной техники
- Боль в спине, плечах, запястьях
- Усталость после нескольких сеансов
- Напряжение в шее
- Онемение пальцев`,
      ro: `# Biomecanica muncii terapeutului

## Principiile de bază

### 1. Poziția corpului
- **Spatele**: drept, curburile naturale ale coloanei vertebrale sunt păstrate
- **Umerii**: relaxați, coborâți în jos
- **Genunchii**: ușor îndoiți pentru amortizare
- **Picioarele**: la lățimea umerilor, poziție stabilă

### 2. Utilizarea greutății corpului
- Lucrați cu greutatea corpului, nu cu forța mușchilor brațelor
- Transferați greutatea de pe un picior pe altul
- Utilizați mișcarea de la șold
- Mențineți centrul de greutate deasupra punctului de aplicare a forței

### 3. Înălțimea mesei de masaj
**Regula**: la brațe coborâte, osișoarele degetelor trebuie să atingă suprafața mesei

**Ajustare**:
- Pentru masaj profund: cu 5-10 cm mai jos
- Pentru tehnici superficiale: la nivelul osișoarelor

## Prevenirea traumelor profesionale

### Exerciții între sesiuni
1. Rotații ale umerilor (10 ori)
2. Întinderea încheieturilor
3. Înclinări ale corpului lateral
4. Scuturarea brațelor

### Regimul de lucru
- Pauză de 10-15 minute după fiecare oră de lucru
- Nu mai mult de 6-7 masaje pe zi
- O zi liberă pe săptămână obligatoriu

## Semne ale tehnicii incorecte
- Durere în spate, umeri, încheieturi
- Oboseală după câteva sesiuni
- Tensiune în gât
- Amorțeala degetelor`,
    },
    images: [],
    order: 1,
    isPublished: true,
  },

  // Требования к кабинету (Office Requirements)
  {
    title: {
      ru: 'Оборудование массажного кабинета',
      ro: 'Echiparea cabinetului de masaj',
    },
    category: 'office_requirements',
    content: {
      ru: `# Требования к оснащению массажного кабинета

## Обязательное оборудование

### 1. Массажный стол
**Требования**:
- Устойчивость и прочность (до 200-250 кг)
- Регулировка высоты
- Ширина: 60-80 см
- Длина: не менее 190 см
- Мягкая, но упругая поверхность
- Легко моющееся покрытие

### 2. Мебель и текстиль
- Табурет на колесиках для массажиста
- Стул для клиента
- Шкаф для хранения чистого белья
- Шкаф для инструментов
- Комплекты чистого белья (простыни, наволочки, полотенца)

### 3. Освещение
- Общее освещение: 300-500 люкс
- Направленное освещение для рабочей зоны
- Возможность регулировки яркости
- Теплый свет (2700-3000K)

### 4. Климат-контроль
- Температура: 22-25°C
- Влажность: 40-60%
- Вентиляция или кондиционер
- Обогреватель (при необходимости)

### 5. Санитарная зона
- Раковина с горячей и холодной водой
- Дозатор жидкого мыла
- Дозатор антисептика для рук
- Одноразовые полотенца
- Контейнер для использованного белья

## Дополнительное оборудование
- Валики и подушки разных размеров
- Ширма или занавеска
- Вешалка для одежды клиента
- Музыкальная система
- Аромалампа или диффузор`,
      ro: `# Cerințe pentru dotarea cabinetului de masaj

## Echipament obligatoriu

### 1. Masa de masaj
**Cerințe**:
- Stabilitate și rezistență (până la 200-250 kg)
- Reglarea înălțimii
- Lățimea: 60-80 cm
- Lungimea: cel puțin 190 cm
- Suprafață moale, dar elastică
- Acoperire ușor de spălat

### 2. Mobilier și textile
- Scaun pe rotile pentru terapeut
- Scaun pentru client
- Dulap pentru depozitarea lenjeriei curate
- Dulap pentru instrumente
- Seturi de lenjerie curată (cearșafuri, fețe de pernă, prosoape)

### 3. Iluminarea
- Iluminare generală: 300-500 lux
- Iluminare direcționată pentru zona de lucru
- Posibilitatea reglării luminozității
- Lumină caldă (2700-3000K)

### 4. Controlul climatului
- Temperatura: 22-25°C
- Umiditatea: 40-60%
- Ventilație sau aer condiționat
- Încălzitor (dacă este necesar)

### 5. Zona sanitară
- Chiuvetă cu apă caldă și rece
- Dozator de săpun lichid
- Dozator de antiseptic pentru mâini
- Prosoape de unică folosință
- Container pentru lenjeria folosită

## Echipament suplimentar
- Role și perne de diferite dimensiuni
- Paravan sau perdea
- Cuier pentru hainele clientului
- Sistem muzical
- Lampă aromatică sau difuzor`,
    },
    images: [],
    order: 1,
    isPublished: true,
  },

  // Требования к массажисту (Therapist Requirements)
  {
    title: {
      ru: 'Личная гигиена массажиста',
      ro: 'Igiena personală a terapeutului',
    },
    category: 'therapist_requirements',
    content: {
      ru: `# Требования к личной гигиене

## Руки массажиста

### Ногти
- Короткоострижены
- Без лака
- Чистые, ухоженные
- Без искусственного наращивания

### Кожа рук
- Без повреждений, трещин, дерматитов
- Регулярное увлажнение
- Обработка антисептиком перед каждым клиентом

### Украшения
❌ **Запрещено**:
- Кольца
- Браслеты
- Часы на руках

✅ **Допускается**:
- Гладкие обручальные кольца (желательно снимать)

## Волосы
- Чистые, ухоженные
- Длинные волосы собраны
- Без перхоти
- Челка не падает на лицо во время работы

## Запахи
❌ **Избегать**:
- Сильные парфюмы
- Запах табака
- Запах пищи

✅ **Разрешается**:
- Легкий дезодорант
- Нейтральные запахи

## Здоровье

### Обязательные медосмотры
- При трудоустройстве
- Ежегодно
- Медицинская книжка

### Противопоказания к работе
- Инфекционные заболевания
- Кожные заболевания рук
- ОРВИ, грипп
- Открытые раны

## Личные качества
- Пунктуальность
- Вежливость
- Профессионализм
- Внимательность к клиенту
- Конфиденциальность`,
      ro: `# Cerințe pentru igiena personală

## Mâinile terapeutului

### Unghiile
- Tăiate scurt
- Fără lac
- Curate, îngrijite
- Fără prelungire artificială

### Pielea mâinilor
- Fără leziuni, crăpături, dermatite
- Hidratare regulată
- Tratare cu antiseptic înainte de fiecare client

### Bijuterii
❌ **Interzis**:
- Inele
- Brățări
- Ceasuri pe mâini

✅ **Permis**:
- Verighete netede (de preferat să fie scoase)

## Părul
- Curat, îngrijit
- Părul lung adunat
- Fără mătreață
- Breton nu cade pe față în timpul lucrului

## Mirosuri
❌ **A evita**:
- Parfumuri puternice
- Miros de tutun
- Miros de mâncare

✅ **Permis**:
- Deodorant ușor
- Mirosuri neutre

## Sănătatea

### Controale medicale obligatorii
- La angajare
- Anual
- Carnet de sănătate

### Contraindicații la lucru
- Boli infecțioase
- Boli de piele ale mâinilor
- IACRS, gripă
- Răni deschise

## Calități personale
- Punctualitate
- Politeță
- Profesionalism
- Atenție la client
- Confidențialitate`,
    },
    images: [],
    order: 1,
    isPublished: true,
  },

  // Форма одежды (Dress Code)
  {
    title: {
      ru: 'Рабочая одежда массажиста',
      ro: 'Îmbrăcămintea de lucru a terapeutului',
    },
    category: 'dress_code',
    content: {
      ru: `# Требования к рабочей одежде

## Основные принципы

### 1. Чистота и опрятность
- Чистая, выглаженная форма
- Смена одежды ежедневно
- Стирка при высокой температуре (60°C)
- Использование специальных комплектов для работы

### 2. Материалы
**Рекомендуется**:
- Натуральные ткани (хлопок, лен)
- Дышащие материалы
- Легко стирающиеся ткани

**Избегать**:
- Синтетика, вызывающая потливость
- Шерсть (может вызвать аллергию)

## Варианты формы

### Для женщин
**Вариант 1**: Медицинский костюм
- Брюки или юбка (длина до колена)
- Блуза или туника
- Белый или пастельные тона

**Вариант 2**: Спортивная форма
- Удобные брюки
- Футболка или поло
- Темные спокойные цвета

### Для мужчин
- Медицинские брюки
- Рубашка поло или футболка
- Белый или темные тона

## Обувь

### Требования
- Закрытая
- На низком каблуке или без каблука
- Не скользящая подошва
- Легко моющаяся
- Удобная для длительного стояния

### Рекомендации
- Медицинские клоги
- Кроссовки (чистые, для работы)
- Специальная ортопедическая обувь

## Что НЕ допускается

❌ **Одежда**:
- Джинсы
- Короткие юбки
- Декольте
- Прозрачные ткани
- Одежда с надписями

❌ **Обувь**:
- Шлепанцы
- Сандалии
- Высокие каблуки
- Открытая обувь

## Дополнительные аксессуары

✅ **Разрешено**:
- Медицинская шапочка (для длинных волос)
- Фартук (при необходимости)

❌ **Не рекомендуется**:
- Шарфы
- Крупные украшения
- Значки, броши`,
      ro: `# Cerințe pentru îmbrăcămintea de lucru

## Principiile de bază

### 1. Curățenia și aspectul îngrijit
- Formă curată, călcată
- Schimbarea hainelor zilnic
- Spălare la temperatură înaltă (60°C)
- Utilizarea seturilor speciale pentru lucru

### 2. Materiale
**Recomandat**:
- Țesături naturale (bumbac, in)
- Materiale respirante
- Țesături ușor de spălat

**A evita**:
- Sintetice care provoacă transpirație
- Lână (poate provoca alergii)

## Variante de formă

### Pentru femei
**Varianta 1**: Costum medical
- Pantaloni sau fustă (lungime până la genunchi)
- Bluză sau tunică
- Alb sau tonuri pastel

**Varianta 2**: Formă sportivă
- Pantaloni comozi
- Tricou sau polo
- Culori închise liniștite

### Pentru bărbați
- Pantaloni medicali
- Cămașă polo sau tricou
- Alb sau tonuri închise

## Încălțăminte

### Cerințe
- Închisă
- Pe toc jos sau fără toc
- Talpă antiderapantă
- Ușor de spălat
- Comodă pentru stat în picioare prelungit

### Recomandări
- Papuci medicali
- Adidași (curați, pentru lucru)
- Încălțăminte ortopedică specială

## Ce NU este permis

❌ **Îmbrăcăminte**:
- Blugi
- Fuste scurte
- Decolteu
- Țesături transparente
- Haine cu inscripții

❌ **Încălțăminte**:
- Papuci de plajă
- Sandale
- Tocuri înalte
- Încălțăminte deschisă

## Accesorii suplimentare

✅ **Permis**:
- Bonetă medicală (pentru păr lung)
- Sort (dacă este necesar)

❌ **Nu se recomandă**:
- Eșarfe
- Bijuterii mari
- Insigne, broșe`,
    },
    images: [],
    order: 1,
    isPublished: true,
  },
]

const seedHygieneGuidelines = async () => {
  try {
    console.log('🌱 Starting to seed hygiene guidelines...')

    await connectDB()

    // Clear existing guidelines
    console.log('🗑️  Clearing existing hygiene guidelines...')
    await HygieneGuideline.deleteMany({})

    // Insert new guidelines
    console.log('📝 Inserting new hygiene guidelines...')
    const inserted = await HygieneGuideline.insertMany(hygieneGuidelines)

    console.log(`✅ Successfully seeded ${inserted.length} hygiene guidelines!`)

    // Display summary
    const categories = await HygieneGuideline.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ])

    console.log('\n📊 Guidelines by category:')
    categories.forEach((cat) => {
      console.log(`  - ${cat._id}: ${cat.count} guidelines`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding hygiene guidelines:', error)
    process.exit(1)
  }
}

// Run the seed function
seedHygieneGuidelines()
