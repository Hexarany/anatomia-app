import mongoose from 'mongoose'
import dotenv from 'dotenv'
import MassageProtocol from '../models/MassageProtocol'
import { connectDB } from '../config/database'

dotenv.config()

const massageProtocols = [
  // 1. КЛАССИЧЕСКИЙ МАССАЖ ВСЕГО ТЕЛА
  {
    name: {
      ru: 'Классический массаж всего тела',
      ro: 'Masajul clasic al întregului corp',
    },
    description: {
      ru: 'Полный комплексный массаж всего тела с проработкой всех основных групп мышц. Включает 47 приёмов классического массажа.',
      ro: 'Masaj complet complex al întregului corp cu lucrul tuturor grupurilor musculare principale. Include 47 de tehnici de masaj clasic.',
    },
    content: {
      ru: `# Классический массаж всего тела

## Полный протокол (47 приёмов)

Продолжительность: **60-90 минут**

---

## СПИНА (положение на животе)

### Начало сеанса
1. **Контакт** - установление первичного контакта с телом клиента
2. **Поглаживание ладонью** - разогрев поверхностных тканей
3. **Поглаживание двумя ладонями** - синхронная работа для релаксации

### Основная работа со спиной
4. **Разминание четырьмя пальцами (две руки)** - проработка паравертебральных мышц
5. **Разминание четырьмя пальцами (одна рука)** - детальная работа с триггерными зонами
6. **Капля** - точечное воздействие на плотные участки
7. **Вертикальное разминание** - работа вдоль мышечных волокон
8. **Две капли** - одновременная работа двумя руками
9. **Горизонтальное разминание** - работа поперёк мышечных волокон

### Глубокая проработка спины
10. **Кулаки (от себя)** - интенсивное воздействие на крупные мышцы
11. **Кулаки (к себе)** - альтернативное направление для разных зон
12. **Локти (снизу вверх)** - глубокая проработка толстых мышечных слоёв
13. **Локоть (только вниз)** - направленное давление
14. **Локоть (только вверх с вращением)** - спиралевидные движения для релаксации фасций
15. **Локти (от шеи к тазу)** - длинные скользящие движения

### Специальные приёмы для спины
16. **Елочка (большая)** - широкие движения для всей спины
17. **Елочка (маленькая)** - детальная работа в локальных зонах
18. **Разминание на шее (вертикальное тремя пальцами)** - работа с шейно-воротниковой зоной

---

## РУКИ (положение на животе или боку)

19. **Разминание ладони и пальцев** - тщательная проработка кистей
20. **Елочка на предплечье (3 линии)** - систематическая проработка предплечья
21. **Вертикальное и горизонтальное разминание (бицепс и трицепс)** - работа с мышцами плеча
22. **Сжатие на ладони, предплечье и плече** (под тремя углами - 45°, 90°, 135°) - комплексное завершение

---

## НОГИ - ЗАДНЯЯ ПОВЕРХНОСТЬ (положение на животе)

### Стопа
23. **Разминание стопы и пальцев** - проработка подошвенной поверхности
24. **Брусничка** - специальная техника для стопы

### Голень
25. **Голень (елочка по 3 линиям)** - медиальная, центральная, латеральная
26. **Вертикальное и горизонтальное разминание (2:1:2)** - икроножная и камбаловидная мышцы

### Бедро и ягодицы
27. **Повторение на бедре** - елочка, вертикальное и горизонтальное разминание
28. **Работа на ягодичной зоне (капля, кулаки)** - глубокая проработка
29. **Сжатие на стопе, голени (локтем), бедре (локтем)** - завершающий дренаж

---

## ПЕРЕВОРОТ НА СПИНУ

---

## НОГИ - ПЕРЕДНЯЯ ПОВЕРХНОСТЬ (положение на спине)

### Стопа
30. **Работа между пальцами (передняя часть стопы)** - межпальцевые промежутки
31. **Брусничка** - повторение техники

### Голень передняя
32. **Голень (под малоберцовой, на большеберцовой, под малоберцовой делаем елочку)** - три зоны проработки

### Коленный сустав
33. **Колено (разминание вертикальное, горизонтальное, затем работа с надколенником, делаем + затем круг)** - специальная техника для колена

### Бедро переднее
34. **Бедро, передняя зона (елочка по 3 линиям, вертикальное и горизонтальное разминание 2:1:2)** - четырёхглавая мышца

---

## ЖИВОТ (положение на спине)

35. **Живот (работаем с правой стороны по часовой стрелке)** - начало висцеральной работы
36. **Елочка (полусфера)** - правая сторона живота
37. **Капля (полусфера)** - точечная работа
38. **Вертикальное разминание середины (полусфера)** - прямые мышцы живота
39. **Переходим на левую сторону и повторяем упражнение** - левая сторона живота
40. **Сжатие живота (полусфера)** - завершение работы с животом

---

## ГРУДНАЯ КЛЕТКА (положение на спине)

### Для мужчин
41. **Елочка на всей грудной зоне (работаем от грудины к плечу)** - полная проработка

### Для женщин
42. **Елочка в зоне T (на грудине и под ключицей)** - деликатная работа

---

## ШЕЯ И ЗАВЕРШЕНИЕ (положение на спине)

### Шейный отдел
43. **Шея (5 точек, удержание 8-10 сек)** - последовательная работа с C1-C7

### Трапециевидная зона
44. **Сжатие четырьмя пальцами** (параллельно позвоночнику, от трапециевидной зоны к голове):
   - 10 раз по одному (поочерёдно)
   - 5 раз вместе (синхронно)

### Финальное краниосакральное воздействие
45. **Фиксируем голову пальцами на затылочной линии, удержание 90 сек** - глубокая релаксация и интеграция всего сеанса

---

## Завершение сеанса

Плавный выход из массажа, позволяя клиенту медленно вернуться в обычное состояние.

---

## Важные примечания

- Все движения выполняются плавно и ритмично
- Давление регулируется в зависимости от зоны и ощущений клиента
- Используется массажное масло или крем
- Поддерживается комфортная температура в помещении
- Клиент должен чувствовать себя расслабленно и безопасно`,
      ro: `# Masajul clasic al întregului corp

## Protocol complet (47 de tehnici)

Durata: **60-90 minute**

---

## SPATELE (poziție pe abdomen)

### Începutul sesiunii
1. **Contact** - stabilirea contactului inițial cu corpul clientului
2. **Mângâiere cu palma** - încălzirea țesuturilor superficiale
3. **Mângâiere cu două palme** - lucru sincron pentru relaxare

### Lucrul principal cu spatele
4. **Frământare cu patru degete (două mâini)** - lucrarea mușchilor paravertebrali
5. **Frământare cu patru degete (o mână)** - lucru detaliat cu zonele trigger
6. **Picătura** - impact punctual pe zone dense
7. **Frământare verticală** - lucru de-a lungul fibrelor musculare
8. **Două picături** - lucru simultan cu două mâini
9. **Frământare orizontală** - lucru perpendicular pe fibrele musculare

### Lucrare profundă a spatelui
10. **Pumnii (de la sine)** - impact intens pe mușchii mari
11. **Pumnii (spre sine)** - direcție alternativă
12. **Coatele (de jos în sus)** - lucrare profundă
13. **Cotul (doar în jos)** - presiune direcționată
14. **Cotul (doar în sus cu rotație)** - mișcări spiralate
15. **Coatele (de la gât la bazin)** - mișcări lungi

### Tehnici speciale pentru spate
16. **Brăduț (mare)** - mișcări largi
17. **Brăduț (mic)** - lucru detaliat
18. **Frământare pe gât (verticală cu trei degete)** - zona cervicală

---

## BRAȚELE (poziție pe abdomen sau lateral)

19. **Frământarea palmei și degetelor** - lucrare atentă a mâinilor
20. **Brăduț pe antebraț (3 linii)** - lucrare sistematică
21. **Frământare verticală și orizontală (biceps și triceps)** - mușchii brațului
22. **Compresie pe palmă, antebraț și umăr** (sub trei unghiuri - 45°, 90°, 135°)

---

## PICIOARELE - SUPRAFAȚA POSTERIOARĂ (poziție pe abdomen)

### Piciorul
23. **Frământarea piciorului și degetelor**
24. **Brușnica** - tehnică specială

### Gamba
25. **Gamba (brăduț pe 3 linii)**
26. **Frământare verticală și orizontală (2:1:2)**

### Coapsa și fesele
27. **Repetare pe coapsă**
28. **Lucrul în zona fesierei (picătura, pumnii)**
29. **Compresie pe picior, gambă (cu cotul), coapsă (cu cotul)**

---

## ÎNTOARCERE PE SPATE

---

## PICIOARELE - SUPRAFAȚA ANTERIOARĂ (poziție pe spate)

### Piciorul
30. **Lucrul între degete (partea anterioară)**
31. **Brușnica**

### Gamba anterioară
32. **Gamba (sub peroné, pe tibial, brăduț)**

### Articulația genunchiului
33. **Genunchi (frământare verticală, orizontală, lucrul cu rotula, + apoi cerc)**

### Coapsa anterioară
34. **Coapsa, zona anterioară (brăduț pe 3 linii, frământare 2:1:2)**

---

## ABDOMENUL (poziție pe spate)

35. **Abdomen (lucrăm partea dreaptă în sensul acelor de ceasornic)**
36. **Brăduț (semisferă)**
37. **Picătura (semisferă)**
38. **Frământare verticală a centrului (semisferă)**
39. **Trecem pe partea stângă și repetăm**
40. **Compresie abdominală (semisferă)**

---

## TORACELE (poziție pe spate)

### Pentru bărbați
41. **Brăduț pe toată zona toracică (de la stern spre umăr)**

### Pentru femei
42. **Brăduț în zona T (pe stern și sub claviculă)**

---

## GÂTUL ȘI FINALIZAREA (poziție pe spate)

### Regiunea cervicală
43. **Gâtul (5 puncte, menținere 8-10 sec)** - C1-C7

### Zona trapezului
44. **Compresie cu patru degete** (paralel cu coloana):
   - 10 ori separat
   - 5 ori împreună

### Impact craniospinal final
45. **Fixăm capul cu degetele pe linia occipitală, menținere 90 sec** - relaxare profundă

---

## Finalizarea sesiunii

Ieșire lină din masaj, permițând clientului să revină încet la starea obișnuită.`,
    },
    type: 'classic',
    duration: 75,
    difficulty: 'intermediate',
    benefits: {
      ru: `- Полная релаксация всего тела
- Снятие мышечного напряжения и спазмов
- Улучшение кровообращения и лимфодренажа
- Уменьшение болей в спине и суставах
- Улучшение подвижности всех суставов
- Снятие стресса и улучшение настроения
- Улучшение качества сна
- Повышение общего тонуса организма
- Укрепление иммунной системы`,
      ro: `- Relaxare completă a întregului corp
- Eliminarea tensiunii musculare și spasmelor
- Îmbunătățirea circulației și drenajului limfatic
- Reducerea durerii în spate și articulații
- Îmbunătățirea mobilității tuturor articulațiilor
- Eliminarea stresului și îmbunătățirea dispoziției
- Îmbunătățirea calității somnului
- Creșterea tonusului general al organismului
- Întărirea sistemului imunitar`,
    },
    contraindications: {
      ru: `- Острые инфекционные заболевания
- Высокая температура тела
- Онкологические заболевания
- Тромбоз и тромбофлебит
- Кровотечения и склонность к ним
- Острые воспалительные процессы
- Кожные заболевания в острой стадии
- Психические расстройства в стадии обострения
- Беременность (первый триместр без консультации врача)
- Недавние операции и травмы`,
      ro: `- Boli infecțioase acute
- Temperatură corporală ridicată
- Boli oncologice
- Tromboză și tromboflebită
- Sângerări și tendință la acestea
- Procese inflamatorii acute
- Boli de piele în stadiu acut
- Tulburări psihice în stadiu acut
- Sarcină (primul trimestru fără consultarea medicului)
- Operații și traumatisme recente`,
    },
    technique: {
      ru: 'Систематическая последовательная проработка всего тела от спины к конечностям с использованием 47 классических приёмов массажа',
      ro: 'Lucrare sistematică secvențială a întregului corp de la spate la extremități folosind 47 de tehnici clasice de masaj',
    },
    images: [],
    videos: [],
    slug: 'klassicheskiy-massazh-vsego-tela',
    order: 1,
  },

  // 2. АНТИЦЕЛЛЮЛИТНЫЙ МАССАЖ
  {
    name: {
      ru: 'Антицеллюлитный массаж',
      ro: 'Masaj anticelulitic',
    },
    description: {
      ru: 'Интенсивный массаж проблемных зон для борьбы с целлюлитом и коррекции фигуры. Включает глубокую проработку подкожно-жировой клетчатки.',
      ro: 'Masaj intens al zonelor problematice pentru combaterea celulitei și corectarea figurii. Include lucrul profund al țesutului adipos subcutanat.',
    },
    content: {
      ru: `# Антицеллюлитный массаж

## Целевые зоны
- Бёдра (внешняя и внутренняя поверхность)
- Ягодицы
- Живот
- Руки (при необходимости)

## Основные техники

### 1. Подготовительный этап (5-7 минут)
- Разогрев кожи поглаживаниями
- Нанесение антицеллюлитного масла или крема
- Подготовка тканей к интенсивному воздействию

### 2. Основная работа (30-40 минут)

**Растирание:**
- Энергичные круговые движения
- Пиление рёбрами ладоней
- Растирание костяшками пальцев

**Разминание:**
- Глубокое захватывающее разминание
- Валяние (перекатывание жировых валиков)
- Надавливание кулаками
- Работа локтями в глубоких слоях

**Вибрация и поколачивание:**
- Рубление рёбрами ладоней
- Поколачивание кулаками
- Похлопывание ладонями
- Щипковый массаж

**Специальные антицеллюлитные приёмы:**
- "Восьмёрки" на бёдрах
- Глубокие выжимания
- Скручивающие движения
- Перекатывание кожной складки

### 3. Завершающий этап (5-7 минут)
- Успокаивающие поглаживания
- Лимфодренажные движения снизу вверх
- Нанесение антицеллюлитного крема

## Рекомендации

**Курс:** 10-15 процедур, 2-3 раза в неделю

**Сочетание:**
- С обёртываниями
- С лимфодренажным массажем
- С физическими упражнениями
- С правильным питанием

**После процедуры:**
- Рекомендуется пить больше воды
- Избегать плотной еды 2 часа
- Можно принять тёплый душ`,
      ro: `# Masaj anticelulitic

## Zone țintă
- Coapsele (suprafața exterioară și interioară)
- Fesele
- Abdomenul
- Brațele (dacă este necesar)

## Tehnici principale

### 1. Etapa pregătitoare (5-7 minute)
- Încălzirea pielii prin mângâieri
- Aplicarea uleiului sau cremei anticelulitice
- Pregătirea țesuturilor pentru impact intens

### 2. Lucrul principal (30-40 minute)

**Frecarea:**
- Mișcări circulare energice
- Ferăstrău cu marginile palmelor
- Frecare cu nodurile degetelor

**Frământarea:**
- Frământare profundă cu prindere
- Rulare (rostogolirea rulelor de grăsime)
- Apăsare cu pumnii
- Lucru cu coatele în straturile profunde

**Vibrație și bătăi:**
- Tăiere cu marginile palmelor
- Bătăi cu pumnii
- Plescăit cu palmele
- Masaj prin ciupire

**Tehnici anticelulitice speciale:**
- "Opt-uri" pe coapse
- Stoarceri profunde
- Mișcări de răsucire
- Rostogolirea pliurilor de piele

### 3. Etapa finală (5-7 minute)
- Mângâieri calmante
- Mișcări de drenaj limfatic de jos în sus
- Aplicarea cremei anticelulitice

## Recomandări

**Curs:** 10-15 proceduri, de 2-3 ori pe săptămână

**Combinație:**
- Cu învelișuri
- Cu masaj de drenaj limfatic
- Cu exerciții fizice
- Cu alimentație corectă

**După procedură:**
- Se recomandă să beți mai multă apă
- Evitați mâncarea abundentă 2 ore
- Puteți face un duș călduț`,
    },
    type: 'corrective',
    duration: 50,
    difficulty: 'intermediate',
    benefits: {
      ru: `- Разглаживание "апельсиновой корки"
- Улучшение тонуса кожи
- Уменьшение объёмов проблемных зон
- Активизация обмена веществ в тканях
- Улучшение микроциркуляции крови
- Выведение лишней жидкости
- Укрепление и подтяжка кожи
- Коррекция фигуры`,
      ro: `- Netezirea "cojii de portocală"
- Îmbunătățirea tonusului pielii
- Reducerea volumelor zonelor problematice
- Activarea metabolismului în țesuturi
- Îmbunătățirea microcirculației sanguine
- Eliminarea excesului de lichid
- Întărirea și lifting-ul pielii
- Corectarea figurii`,
    },
    contraindications: {
      ru: `- Варикозное расширение вен (выраженное)
- Тромбофлебит
- Беременность и лактация
- Гинекологические заболевания
- Новообразования
- Кожные заболевания
- Нарушения свёртываемости крови
- Менструация
- Воспалительные процессы
- Сердечно-сосудистые заболевания в стадии обострения`,
      ro: `- Vene varicoase (pronunțate)
- Tromboflebită
- Sarcină și lactație
- Boli ginecologice
- Neoplasme
- Boli de piele
- Tulburări de coagulare a sângelui
- Menstruație
- Procese inflamatorii
- Boli cardiovasculare în stadiu acut`,
    },
    technique: {
      ru: 'Интенсивное механическое воздействие на подкожно-жировую клетчатку для разрушения жировых отложений и улучшения микроциркуляции',
      ro: 'Impact mecanic intens asupra țesutului adipos subcutanat pentru distrugerea depozitelor de grăsime și îmbunătățirea microcirculației',
    },
    images: [],
    videos: [],
    slug: 'antitsellyulitnyy-massazh',
    order: 2,
  },

  // 3. ТАЙСКИЙ МАССАЖ
  {
    name: {
      ru: 'Тайский традиционный массаж',
      ro: 'Masajul tradițional tailandez',
    },
    description: {
      ru: 'Древняя техника массажа, сочетающая акупрессуру, растяжки и работу с энергетическими линиями тела. Выполняется на полу без масла.',
      ro: 'Tehnică antică de masaj care combină acupresura, întinderile și lucrul cu liniile energetice ale corpului. Se efectuează pe podea fără ulei.',
    },
    content: {
      ru: `# Тайский традиционный массаж

## Особенности

- Выполняется на мате (футоне) на полу
- Клиент одет в свободную одежду
- Массаж выполняется без масла
- Используются руки, локти, колени, стопы массажиста
- Включает элементы йоги и растяжки

## Основные элементы

### 1. Работа со стопами и ногами (20-25 минут)

**Точечные нажатия:**
- Акупрессура стоп
- Работа с рефлекторными точками
- Проработка энергетических линий (сен) на ногах

**Растяжки ног:**
- Вытяжение ног
- Раскрытие тазобедренных суставов
- Скручивания
- "Кобра" для ног

### 2. Спина и ягодицы (15-20 минут)

**Работа со спиной:**
- Ходьба стопами по спине
- Надавливания ладонями вдоль позвоночника
- Работа локтями с паравертебральными мышцами
- Растяжки позвоночника

**Ягодичная зона:**
- Работа коленями
- Глубокие надавливания
- Растяжка грушевидной мышцы

### 3. Руки и плечи (10-15 минут)

**Проработка рук:**
- Акупрессура ладоней
- Растяжка пальцев
- Вытяжение всей руки
- Раскрытие плечевых суставов

**Плечевой пояс:**
- Работа с трапециевидными мышцами
- Раскрытие грудной клетки
- Растяжки плеч

### 4. Переворот на спину

### 5. Работа с передней поверхностью (15-20 минут)

**Живот:**
- Мягкие круговые надавливания
- Работа с пищеварительной системой

**Грудная клетка:**
- Раскрытие грудной клетки
- Работа с дыханием

**Ноги спереди:**
- Растяжки квадрицепсов
- Раскрытие тазобедренных суставов
- "Бабочка", "Лотос"

### 6. Завершающие асаны (10-15 минут)

**Сидячие растяжки:**
- Скручивания позвоночника
- Наклоны вперёд
- Раскрытие плеч

**Финальная релаксация:**
- Работа с головой
- Точечный массаж лица
- Шавасана (глубокая релаксация)

## Энергетические линии (Сен)

В тайском массаже прорабатываются 10 основных энергетических линий:
- Сен Сумана
- Сен Итха и Пингкала
- Сен Каляатари
- И другие

## Дыхание

Важная роль отводится дыханию:
- Массажист работает в ритме собственного дыхания
- Растяжки выполняются на выдохе клиента
- Синхронизация дыхания создаёт медитативное состояние`,
      ro: `# Masajul tradițional tailandez

## Particularități

- Se efectuează pe saltea (futon) pe podea
- Clientul este îmbrăcat în haine largi
- Masajul se face fără ulei
- Se folosesc mâinile, coatele, genunchii, picioarele terapeutului
- Include elemente de yoga și întinderi

## Elemente principale

### 1. Lucrul cu picioarele și gambele (20-25 minute)

**Apăsări punctuale:**
- Acupresură pe picioare
- Lucru cu puncte reflexe
- Lucrarea liniilor energetice (sen) pe picioare

**Întinderi ale picioarelor:**
- Tracțiunea picioarelor
- Deschiderea articulațiilor coxofemurale
- Răsuciri
- "Cobra" pentru picioare

### 2. Spatele și fesele (15-20 minute)

**Lucrul cu spatele:**
- Mersul cu picioarele pe spate
- Apăsări cu palmele de-a lungul coloanei
- Lucru cu coatele pe mușchii paravertebrali
- Întinderi ale coloanei vertebrale

**Zona fesierei:**
- Lucru cu genunchii
- Apăsări profunde
- Întinderea mușchiului piriform

### 3. Brațele și umerii (10-15 minute)

**Lucrarea brațelor:**
- Acupresură pe palme
- Întinderea degetelor
- Tracțiunea întregului braț
- Deschiderea articulațiilor umerale

**Centura scapulară:**
- Lucrul cu mușchii trapezi
- Deschiderea toracelui
- Întinderi ale umerilor

### 4. Întoarcere pe spate

### 5. Lucrul cu suprafața anterioară (15-20 minute)

**Abdomenul:**
- Apăsări circulare blânde
- Lucrul cu sistemul digestiv

**Toracele:**
- Deschiderea toracelui
- Lucrul cu respirația

**Picioarele în față:**
- Întinderi ale cvadricepsilor
- Deschiderea articulațiilor coxofemurale
- "Fluturele", "Lotusul"

### 6. Asane finale (10-15 minute)

**Întinderi în șezut:**
- Răsuciri ale coloanei
- Înclinări înainte
- Deschiderea umerilor

**Relaxare finală:**
- Lucrul cu capul
- Masaj punctual al feței
- Shavasana (relaxare profundă)

## Liniile energetice (Sen)

În masajul tailandez se lucrează 10 linii energetice principale:
- Sen Sumana
- Sen Ittha și Pingkhala
- Sen Kalathari
- Și altele

## Respirația

Rolul important al respirației:
- Terapeutul lucrează în ritmul propriei respirații
- Întinderile se fac la expirația clientului
- Sincronizarea respirației creează stare meditativă`,
    },
    type: 'traditional',
    duration: 90,
    difficulty: 'advanced',
    benefits: {
      ru: `- Глубокое расслабление тела и ума
- Увеличение гибкости и подвижности суставов
- Снятие мышечных зажимов и спазмов
- Балансировка энергетической системы
- Улучшение кровообращения и лимфотока
- Снятие стресса и тревожности
- Улучшение осанки
- Детоксикация организма
- Медитативное состояние и ясность ума`,
      ro: `- Relaxare profundă a corpului și minții
- Creșterea flexibilității și mobilității articulațiilor
- Eliminarea blocajelor musculare și spasmelor
- Echilibrarea sistemului energetic
- Îmbunătățirea circulației sanguine și limfatice
- Eliminarea stresului și anxietății
- Îmbunătățirea posturii
- Detoxifierea organismului
- Stare meditativă și claritate mentală`,
    },
    contraindications: {
      ru: `- Острые травмы и переломы
- Грыжи межпозвоночных дисков (в острой стадии)
- Остеопороз
- Беременность
- Тромбоз
- Онкологические заболевания
- Острые воспалительные процессы
- Гипертония в стадии обострения
- Недавние операции
- Сердечно-сосудистые заболевания в острой стадии`,
      ro: `- Traumatisme acute și fracturi
- Hernii de disc intervertebral (în stadiu acut)
- Osteoporoză
- Sarcină
- Tromboză
- Boli oncologice
- Procese inflamatorii acute
- Hipertensiune în stadiu acut
- Operații recente
- Boli cardiovasculare în stadiu acut`,
    },
    technique: {
      ru: 'Древняя техника, сочетающая акупрессуру, пассивные йога-растяжки и работу с энергетическими линиями тела с использованием всего тела массажиста',
      ro: 'Tehnică antică care combină acupresura, întinderile yoga pasive și lucrul cu liniile energetice ale corpului folosind întregul corp al terapeutului',
    },
    images: [],
    videos: [],
    slug: 'tayskiy-traditsionnyy-massazh',
    order: 3,
  },

  // 4. БАНОЧНЫЙ МАССАЖ
  {
    name: {
      ru: 'Баночный (вакуумный) массаж',
      ro: 'Masaj cu ventuze (vacuum)',
    },
    description: {
      ru: 'Техника массажа с использованием медицинских банок для создания вакуумного эффекта. Применяется для лечения и профилактики различных заболеваний.',
      ro: 'Tehnică de masaj folosind ventuze medicale pentru crearea efectului de vacuum. Se aplică pentru tratarea și prevenirea diferitelor boli.',
    },
    content: {
      ru: `# Баночный (вакуумный) массаж

## Виды банок

**Традиционные стеклянные:**
- Создание вакуума огнём
- Требуют навыка в использовании

**Современные силиконовые:**
- Простые в использовании
- Разная степень вакуума
- Безопасные для домашнего применения

**Банки с насосом:**
- Точная регулировка вакуума
- Профессиональное оборудование

## Техники выполнения

### 1. Подготовительный этап (5 минут)
- Нанесение масла на кожу
- Лёгкий разогревающий массаж
- Подготовка кожи к вакуумному воздействию

### 2. Статичный метод (15-20 минут)

**Постановка банок:**
- Банки устанавливаются на определённые точки
- Время экспозиции: 5-15 минут
- Применяется при:
  - Простудных заболеваниях
  - Бронхитах
  - Мышечных болях

**Зоны постановки:**
- Спина (избегая позвоночник)
- Поясничная область
- Плечевой пояс
- Бёдра (при целлюлите)

### 3. Динамический (массажный) метод (20-30 минут)

**Техника скольжения:**
- Банка плавно перемещается по коже
- Движения вдоль мышечных волокон
- Круговые и зигзагообразные движения

**Спина:**
- Движения снизу вверх вдоль позвоночника (отступая 2-3 см от позвоночного столба)
- Круговые движения в области лопаток
- Работа с поясничной зоной

**Антицеллюлитный баночный массаж:**
- Бёдра: движения снизу вверх
- Ягодицы: круговые движения
- Живот: круговые движения по часовой стрелке
- Руки: от кисти к плечу

**Грудная клетка (при заболеваниях дыхательных путей):**
- Избегать зону сердца
- Движения от центра к периферии
- Работа с межреберными промежутками

### 4. Завершающий этап (5-7 минут)
- Снятие банок
- Успокаивающий массаж
- Укутывание и отдых 15-20 минут

## Важные правила

**Степень вакуума:**
- Кожа должна втягиваться на 1-1,5 см
- Не должно быть сильной боли
- При появлении боли - уменьшить вакуум

**Зоны, где нельзя ставить банки:**
- Непосредственно на позвоночник
- Область сердца
- Молочные железы
- Область почек (с осторожностью)
- Внутренняя поверхность бёдер
- Подмышечные и подколенные ямки
- Зона лимфоузлов

**Направление движений:**
- По ходу лимфотока (снизу вверх)
- Вдоль мышечных волокон
- На животе - по часовой стрелке

## Курс лечения

- **Профилактика:** 5-7 процедур
- **Лечение:** 10-15 процедур
- **Антицеллюлитный курс:** 12-15 процедур
- Периодичность: через день или 2-3 раза в неделю

## После процедуры

- Отдых 20-30 минут
- Тёплое питьё
- Избегать переохлаждения
- Не принимать холодный душ
- Лёгкая пища`,
      ro: `# Masaj cu ventuze (vacuum)

## Tipuri de ventuze

**Tradiționale din sticlă:**
- Crearea vacuumului cu foc
- Necesită abilitate în utilizare

**Moderne din silicon:**
- Simple în utilizare
- Grad diferit de vacuum
- Sigure pentru uz casnic

**Ventuze cu pompă:**
- Reglare precisă a vacuumului
- Echipament profesional

## Tehnici de execuție

### 1. Etapa pregătitoare (5 minute)
- Aplicarea uleiului pe piele
- Masaj ușor de încălzire
- Pregătirea pieliPentru impactul vacuumului

### 2. Metoda statică (15-20 minute)

**Instalarea ventuzelor:**
- Ventuzele se instalează pe puncte specifice
- Timpul de expunere: 5-15 minute
- Se aplică la:
  - Răceli
  - Bronșite
  - Dureri musculare

**Zone de instalare:**
- Spatele (evitând coloana vertebrală)
- Regiunea lombară
- Centura scapulară
- Coapsele (la celulită)

### 3. Metoda dinamică (de masaj) (20-30 minute)

**Tehnica de alunecare:**
- Ventuza se mișcă lin pe piele
- Mișcări de-a lungul fibrelor musculare
- Mișcări circulare și în zigzag

**Spatele:**
- Mișcări de jos în sus de-a lungul coloanei (la 2-3 cm de coloană)
- Mișcări circulare în zona omoplților
- Lucrul cu zona lombară

**Masaj anticelulitic cu ventuze:**
- Coapsele: mișcări de jos în sus
- Fesele: mișcări circulare
- Abdomenul: mișcări circulare în sensul acelor de ceasornic
- Brațele: de la mână spre umăr

**Toracele (la boli respiratorii):**
- Evitați zona cordului
- Mișcări de la centru spre periferie
- Lucrul cu spațiile intercostale

### 4. Etapa finală (5-7 minute)
- Îndepărtarea ventuzelor
- Masaj calmant
- Învelire și odihnă 15-20 minute

## Reguli importante

**Gradul de vacuum:**
- Pielea trebuie absorbită 1-1,5 cm
- Nu trebuie să fie durere puternică
- La apariția durerii - reduceți vacuumul

**Zone unde nu se pot pune ventuze:**
- Direct pe coloana vertebrală
- Zona cordului
- Glandele mamare
- Zona rinichilor (cu precauție)
- Suprafața interioară a coapselor
- Fosele axilare și poplitee
- Zona ganglionilor limfatici

**Direcția mișcărilor:**
- În direcția fluxului limfatic (de jos în sus)
- De-a lungul fibrelor musculare
- Pe abdomen - în sensul acelor de ceasornic

## Cursul de tratament

- **Profilaxie:** 5-7 proceduri
- **Tratament:** 10-15 proceduri
- **Curs anticelulitic:** 12-15 proceduri
- Periodicitate: la o zi sau de 2-3 ori pe săptămână

## După procedură

- Odihnă 20-30 minute
- Băutură caldă
- Evitați răcirea
- Nu faceți duș rece
- Mâncare ușoară`,
    },
    type: 'therapeutic',
    duration: 40,
    difficulty: 'intermediate',
    benefits: {
      ru: `- Улучшение кровообращения и лимфотока
- Разрушение жировых отложений
- Разглаживание целлюлита
- Выведение токсинов
- Снятие мышечных спазмов
- Лечение простудных заболеваний
- Улучшение состояния при бронхитах
- Повышение тонуса кожи
- Уменьшение отёков
- Улучшение обмена веществ`,
      ro: `- Îmbunătățirea circulației sanguine și limfatice
- Distrugerea depozitelor de grăsime
- Netezirea celulitei
- Eliminarea toxinelor
- Eliminarea spasmelor musculare
- Tratarea răcelilor
- Îmbunătățirea stării la bronșite
- Creșterea tonusului pielii
- Reducerea edemelor
- Îmbunătățirea metabolismului`,
    },
    contraindications: {
      ru: `- Заболевания крови и нарушения свёртываемости
- Тромбофлебит и варикоз (выраженный)
- Онкологические заболевания
- Острые инфекционные заболевания
- Высокая температура
- Туберкулёз лёгких в активной форме
- Заболевания кожи
- Беременность
- Камни в почках и желчном пузыре
- Гипертония 3 степени
- Родинки и папилломы в зоне воздействия
- Истощение организма`,
      ro: `- Boli de sânge și tulburări de coagulare
- Tromboflebită și varicoză (pronunțată)
- Boli oncologice
- Boli infecțioase acute
- Temperatură ridicată
- Tuberculoză pulmonară în formă activă
- Boli de piele
- Sarcină
- Pietre la rinichi și vezica biliară
- Hipertensiune grad 3
- Alunițe și papiloame în zona de impact
- Epuizarea organismului`,
    },
    technique: {
      ru: 'Использование вакуумного эффекта для глубокого воздействия на ткани, улучшения кровообращения и лимфодренажа',
      ro: 'Utilizarea efectului de vacuum pentru impact profund asupra țesuturilor, îmbunătățirea circulației sanguine și drenajului limfatic',
    },
    images: [],
    videos: [],
    slug: 'banochnyy-vakuumnyy-massazh',
    order: 4,
  },

  // 5. МЕДОВЫЙ МАССАЖ
  {
    name: {
      ru: 'Медовый массаж',
      ro: 'Masaj cu miere',
    },
    description: {
      ru: 'Уникальная техника массажа с использованием натурального мёда. Обладает мощным детоксикационным и оздоровительным эффектом.',
      ro: 'Tehnică unică de masaj folosind miere naturală. Are efect puternic de detoxifiere și îmbunătățire a sănătății.',
    },
    content: {
      ru: `# Медовый массаж

## Особенности техники

Медовый массаж - это специальная техника, при которой мёд наносится на кожу и затем "отрывается" от неё похлопывающими движениями ладоней.

## Подготовка

### Выбор мёда
- **Натуральный цветочный мёд** (не засахаренный)
- Тёплый (комнатной температуры или слегка подогретый)
- Можно добавить эфирные масла (3-5 капель на 2 ст.л. мёда):
  - Антицеллюлитные: апельсин, грейпфрут, можжевельник
  - Расслабляющие: лаванда, иланг-иланг
  - Тонизирующие: розмарин, мята

### Подготовка кожи
- Тёплый душ
- Лёгкий пилинг (за день до процедуры)
- Сухая чистая кожа

## Техника выполнения

### 1. Нанесение мёда (2-3 минуты)

**Количество мёда:**
- На спину: 1-2 столовые ложки
- На область живота: 1 столовая ложка
- На бёдра и ягодицы: 1,5-2 столовые ложки

**Способ нанесения:**
- Тонким слоем распределить по зоне массажа
- Лёгкими поглаживающими движениями
- Дать мёду слегка впитаться (30-60 секунд)

### 2. Массажная техника (15-25 минут)

**Основной приём - "прилипание-отрывание":**

1. **Начальный этап** (первые 5-7 минут):
   - Прижать ладони к коже с мёдом
   - Плотно прижать
   - Резко оторвать ладони от кожи
   - Движения медленные и мягкие

2. **Интенсивный этап** (10-15 минут):
   - Мёд начинает густеть и белеть
   - Усиливается "прилипание"
   - Движения становятся более интенсивными
   - Ладони отрываются с характерным звуком
   - Могут быть неприятные ощущения (это нормально)

3. **Завершающий этап** (2-3 минуты):
   - Движения становятся мягче
   - Постепенное замедление ритма

**Направления движений:**
- **Спина:**
  - От поясницы к плечам (по сторонам от позвоночника)
  - От позвоночника к бокам
  - Круговые движения в области лопаток

- **Поясница:**
  - Горизонтальные движения
  - От позвоночника к бокам

- **Живот:**
  - Круговые движения по часовой стрелке
  - От пупка к периферии

- **Бёдра и ягодицы:**
  - Снизу вверх
  - Круговые движения на ягодицах

### 3. Удаление мёда (5 минут)

**Способы:**
- Тёплой влажной салфеткой
- Под тёплым душем
- Остатки мёда превращаются в серо-белую массу (выведенные токсины)

### 4. Завершение
- Нанести увлажняющий крем или масло
- Отдых 20-30 минут
- Обильное питьё (вода, травяной чай)

## Зоны воздействия

**Стандартные зоны:**
- Спина (самая популярная зона)
- Поясница
- Область крестца
- Плечевой пояс

**Антицеллюлитный медовый массаж:**
- Бёдра (внешняя и внутренняя поверхность)
- Ягодицы
- Живот
- Руки (внешняя часть)

**Не рекомендуется:**
- Область сердца
- Молочные железы
- Внутренняя поверхность бёдер (нежная кожа)
- Лицо (только специальные техники)

## Ощущения во время процедуры

**Нормальные:**
- Лёгкое жжение
- Покалывание
- Ощущение тепла
- Терпимая болезненность при отрывании ладоней

**Требуют прекращения:**
- Сильная боль
- Жжение
- Головокружение
- Тошнота

## Курс процедур

- **Лечебный курс:** 10-15 процедур
- **Антицеллюлитный курс:** 12-20 процедур
- **Профилактика:** 5-7 процедур
- Периодичность: 2-3 раза в неделю или через день
- Повторный курс: через 2-3 месяца

## После процедуры

**Первые сутки:**
- Обильное питьё (минимум 2 литра воды)
- Лёгкая пища
- Избегать физических нагрузок
- Не посещать баню/сауну

**Эффекты:**
- Лёгкое покраснение кожи (проходит через 2-4 часа)
- Возможны синяки (при чувствительной коже или сосудах)
- Прилив энергии
- Улучшение самочувствия

## Лечебные свойства мёда

- Витамины группы B, C, E
- Минералы и микроэлементы
- Ферменты
- Аминокислоты
- Антибактериальные свойства`,
      ro: `# Masaj cu miere

## Particularitățile tehnicii

Masajul cu miere este o tehnică specială în care mierea se aplică pe piele și apoi se "desprinde" de ea prin mișcări de plescăit ale palmelor.

## Pregătirea

### Alegerea mierii
- **Miere naturală de flori** (necristalizată)
- Caldă (temperatura camerei sau ușor încălzită)
- Se pot adăuga uleiuri esențiale (3-5 picături la 2 linguri de miere):
  - Anticelulitice: portocală, grepfrut, ienupăr
  - Relaxante: lavandă, ylang-ylang
  - Tonifiante: rozmarin, mentă

### Pregătirea pielii
- Duș călduț
- Exfoliere ușoară (cu o zi înainte)
- Piele uscată și curată

## Tehnica de execuție

### 1. Aplicarea mierii (2-3 minute)

**Cantitatea de miere:**
- Pe spate: 1-2 linguri
- Pe abdomen: 1 lingură
- Pe coapse și fese: 1,5-2 linguri

**Metoda de aplicare:**
- Distribuire în strat subțire pe zona de masaj
- Mișcări ușoare de mângâiere
- Lăsați mierea să se absoarbă ușor (30-60 secunde)

### 2. Tehnica de masaj (15-25 minute)

**Tehnica principală - "lipire-desprindere":**

1. **Etapa inițială** (primele 5-7 minute):
   - Apăsați palmele pe pielea cu miere
   - Apăsați ferm
   - Desprinde brusc palmele de piele
   - Mișcări lente și blânde

2. **Etapa intensă** (10-15 minute):
   - Mierea începe să se îngroașe și să se albească
   - Crește "lipirea"
   - Mișcările devin mai intense
   - Palmele se desprind cu sunet caracteristic
   - Pot apărea senzații neplăcute (este normal)

3. **Etapa finală** (2-3 minute):
   - Mișcările devin mai blânde
   - Încetinire treptată a ritmului

**Direcțiile mișcărilor:**
- **Spatele:**
  - De la lombare spre umeri (pe părțile coloanei)
  - De la coloană spre laturi
  - Mișcări circulare în zona omoplților

- **Lombară:**
  - Mișcări orizontale
  - De la coloană spre laturi

- **Abdomenul:**
  - Mișcări circulare în sensul acelor de ceasornic
  - De la buric spre periferie

- **Coapsele și fesele:**
  - De jos în sus
  - Mișcări circulare pe fese

### 3. Îndepărtarea mierii (5 minute)

**Metode:**
- Cu șervet umed călduț
- Sub duș călduț
- Resturile de miere se transformă în masă cenuș-albă (toxinele eliminate)

### 4. Finalizarea
- Aplicați cremă sau ulei hidratant
- Odihnă 20-30 minute
- Băutură abundentă (apă, ceai din plante)

## Zone de impact

**Zone standard:**
- Spatele (cea mai populară zonă)
- Lombară
- Zona sacrală
- Centura scapulară

**Masaj anticelulitic cu miere:**
- Coapsele (suprafața exterioară și interioară)
- Fesele
- Abdomenul
- Brațele (partea exterioară)

**Nu se recomandă:**
- Zona cordului
- Glandele mamare
- Suprafața interioară a coapselor (piele delicată)
- Fața (doar tehnici speciale)

## Senzații în timpul procedurii

**Normale:**
- Ardere ușoară
- Furnicături
- Senzație de căldură
- Durere suportabilă la desprinderea palmelor

**Necesită oprire:**
- Durere puternică
- Arsură
- Amețeală
- Greață

## Cursul de proceduri

- **Curs terapeutic:** 10-15 proceduri
- **Curs anticelulitic:** 12-20 proceduri
- **Profilaxie:** 5-7 proceduri
- Periodicitate: de 2-3 ori pe săptămână sau la o zi
- Curs repetat: după 2-3 luni

## După procedură

**Primele 24 ore:**
- Băutură abundentă (minim 2 litri apă)
- Mâncare ușoară
- Evitați efortul fizic
- Nu vizitați baie/saună

**Efecte:**
- Roșeață ușoară a pielii (trece în 2-4 ore)
- Posibile vânătăi (la piele sensibilă sau vase)
- Val de energie
- Îmbunătățirea stării generale

## Proprietățile terapeutice ale mierii

- Vitamine din grupele B, C, E
- Minerale și oligoelemente
- Enzime
- Aminoacizi
- Proprietăți antibacteriene`,
    },
    type: 'detox',
    duration: 45,
    difficulty: 'intermediate',
    benefits: {
      ru: `- Глубокая детоксикация организма
- Выведение шлаков и токсинов
- Улучшение состояния кожи
- Борьба с целлюлитом
- Насыщение кожи витаминами и минералами
- Улучшение кровообращения
- Лимфодренажный эффект
- Снятие мышечного напряжения
- Лечение простудных заболеваний
- Укрепление иммунитета
- Антицеллюлитный эффект`,
      ro: `- Detoxifiere profundă a organismului
- Eliminarea toxinelor și deșeurilor
- Îmbunătățirea stării pielii
- Combaterea celulitei
- Saturarea pielii cu vitamine și minerale
- Îmbunătățirea circulației sanguine
- Efect de drenaj limfatic
- Eliminarea tensiunii musculare
- Tratarea răcelilor
- Întărirea imunității
- Efect anticelulitic`,
    },
    contraindications: {
      ru: `- Аллергия на продукты пчеловодства (ОБЯЗАТЕЛЬНО ТЕСТ!)
- Варикозное расширение вен (выраженное)
- Тромбофлебит
- Онкологические заболевания
- Сахарный диабет (с осторожностью)
- Беременность и лактация
- Заболевания крови
- Острые воспалительные процессы
- Кожные заболевания
- Повышенная температура тела
- Гипертония 3 степени
- Туберкулёз
- Астма (с осторожностью)
- Обильное оволосение в зоне массажа
- Менструация (для зоны живота)`,
      ro: `- Alergie la produsele apicole (TEST OBLIGATORIU!)
- Vene varicoase (pronunțate)
- Tromboflebită
- Boli oncologice
- Diabet zaharat (cu precauție)
- Sarcină și lactație
- Boli de sânge
- Procese inflamatorii acute
- Boli de piele
- Temperatură corporală ridicată
- Hipertensiune grad 3
- Tuberculoză
- Astm (cu precauție)
- Păr abundent în zona de masaj
- Menstruație (pentru zona abdomenului)`,
    },
    technique: {
      ru: 'Уникальная техника "прилипания-отрывания" ладоней с мёдом для глубокой детоксикации через кожу и мощного лимфодренажного эффекта',
      ro: 'Tehnică unică de "lipire-desprindere" a palmelor cu miere pentru detoxifiere profundă prin piele și efect puternic de drenaj limfatic',
    },
    images: [],
    videos: [],
    slug: 'medovyy-massazh',
    order: 5,
  },
]

const seedMassageProtocols = async () => {
  try {
    console.log('🌱 Starting to seed massage protocols...')

    await connectDB()

    // Clear existing protocols
    console.log('🗑️  Clearing existing massage protocols...')
    await MassageProtocol.deleteMany({})

    // Insert new protocols
    console.log('📝 Inserting new massage protocols...')
    const inserted = await MassageProtocol.insertMany(massageProtocols)

    console.log(`✅ Successfully seeded ${inserted.length} massage protocols!`)

    // Display summary
    console.log('\n📊 Protocols by type:')
    const types = await MassageProtocol.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ])
    types.forEach((type) => {
      console.log(`  - ${type._id}: ${type.count} protocol(s)`)
    })

    console.log('\n📋 List of protocols:')
    inserted.forEach((protocol, index) => {
      console.log(`  ${index + 1}. ${protocol.name.ru} (${protocol.duration} мин, ${protocol.difficulty})`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding massage protocols:', error)
    process.exit(1)
  }
}

// Run the seed function
seedMassageProtocols()
