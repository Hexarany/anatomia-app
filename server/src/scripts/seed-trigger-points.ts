import mongoose from 'mongoose'
import dotenv from 'dotenv'
import TriggerPoint from '../models/TriggerPoint'

dotenv.config()

const triggerPoints = [
  {
    name: {
      ru: 'Трапециевидная мышца - ТТ1 (верхние волокна)',
      ro: 'Mușchiul trapez - TP1 (fibre superioare)'
    },
    muscle: 'Trapezius (верхние волокна / fibre superioare)',
    location: {
      ru: 'Верхние волокна трапециевидной мышцы, медиальная часть, на уровне C7-T1',
      ro: 'Fibrele superioare ale mușchiului trapez, partea medială, la nivelul C7-T1'
    },
    symptoms: {
      ru: 'Напряжение и боль в области шеи, головная боль в височно-затылочной области, чувство тяжести в плече',
      ro: 'Tensiune și durere în zona gâtului, durere de cap în zona temporală-occipitală, senzație de greutate în umăr'
    },
    referralPattern: {
      ru: 'Боль иррадиирует вверх по заднебоковой поверхности шеи к сосцевидному отростку и виску, может распространяться к углу нижней челюсти',
      ro: 'Durerea iradiază în sus pe suprafața posterolaterală a gâtului spre procesul mastoid și tâmplă, poate să se răspândească spre unghiul mandibulei'
    },
    technique: {
      ru: 'Ишемическая компрессия: прямое давление на точку 30-90 секунд. Затем мягкое растяжение мышцы наклоном головы в противоположную сторону. Важно: пациент лежит на спине, голова поддерживается.',
      ro: 'Compresie ischemică: presiune directă pe punct 30-90 secunde. Apoi întindere blândă a mușchiului prin înclinarea capului în partea opusă. Important: pacientul stă pe spate, capul este susținut.'
    },
    contraindications: {
      ru: 'Острое воспаление, травмы шейного отдела позвоночника, нестабильность шейных позвонков, остеопороз',
      ro: 'Inflamație acută, traumatisme ale coloanei cervicale, instabilitate a vertebrelor cervicale, osteoporoză'
    },
    category: 'head_neck',
    difficulty: 'beginner',
    images: [],
    videos: [],
    order: 1,
  },
  {
    name: {
      ru: 'Поднимающая лопатку - ТТ1',
      ro: 'Mușchiul ridicător al scapulei - TP1'
    },
    muscle: 'Levator Scapulae',
    location: {
      ru: 'Верхняя часть мышцы, место прикрепления к поперечным отросткам C1-C4, под верхним углом лопатки',
      ro: 'Partea superioară a mușchiului, locul de atașare la procesele transverse C1-C4, sub unghiul superior al scapulei'
    },
    symptoms: {
      ru: 'Ограничение поворота головы, боль при вращении головы в сторону, скованность шеи, особенно по утрам',
      ro: 'Limitarea rotației capului, durere la rotirea capului lateral, rigiditate a gâtului, în special dimineața'
    },
    referralPattern: {
      ru: 'Боль локализуется вдоль заднебоковой поверхности шеи и угла между шеей и плечом, может отдавать в медиальный край лопатки',
      ro: 'Durerea se localizează de-a lungul suprafeței posterolaterale a gâtului și unghiul dintre gât și umăr, poate iradia spre marginea medială a scapulei'
    },
    technique: {
      ru: 'Компрессия триггерной точки в положении сидя с наклоном головы вперед и в сторону поражения. Давление 45-60 секунд, затем постизометрическая релаксация: пациент пытается поднять плечо против сопротивления 5-7 секунд, затем расслабление и растяжение.',
      ro: 'Compresie a punctului trigger în poziție șezând cu înclinarea capului înainte și lateral spre partea afectată. Presiune 45-60 secunde, apoi relaxare postizometrică: pacientul încearcă să ridice umărul împotriva rezistenței 5-7 secunde, apoi relaxare și întindere.'
    },
    contraindications: {
      ru: 'Грыжи межпозвоночных дисков шейного отдела, головокружение при манипуляциях на шее, гипертония',
      ro: 'Hernii de disc intervertebrale cervicale, amețeli la manipulări pe gât, hipertensiune'
    },
    category: 'head_neck',
    difficulty: 'intermediate',
    images: [],
    videos: [],
    order: 2,
  },
  {
    name: {
      ru: 'Грудино-ключично-сосцевидная мышца - ТТ1 (грудинная головка)',
      ro: 'Mușchiul sternocleidomastoidian - TP1 (capul sternal)'
    },
    muscle: 'Sternocleidomastoid (грудинная головка / capul sternal)',
    location: {
      ru: 'Средняя часть грудинной головки SCM, примерно на уровне щитовидного хряща',
      ro: 'Partea mijlocie a capului sternal SCM, aproximativ la nivelul cartilajului tiroidian'
    },
    symptoms: {
      ru: 'Головокружение, нарушение равновесия, головная боль в лобно-височной области, слезотечение, заложенность носа на стороне поражения',
      ro: 'Amețeală, tulburări de echilibru, durere de cap în zona fronto-temporală, lacrimare, congestie nazală pe partea afectată'
    },
    referralPattern: {
      ru: 'Боль отражается в область лба, над бровью, вокруг глаза, в щеку. Также может вызывать вегетативные симптомы: слезотечение, покраснение глаза',
      ro: 'Durerea se reflectă în zona frunții, deasupra sprâncenei, în jurul ochiului, în obraz. De asemenea poate provoca simptome vegetative: lacrimare, roșeață a ochiului'
    },
    technique: {
      ru: 'Легкая компрессия (мышца очень чувствительна!) 20-30 секунд. Техника "щипка": захват мышцы между большим и указательным пальцем. Растяжение: поворот головы в противоположную сторону с легким наклоном назад. ВНИМАНИЕ: избегать давления на сонную артерию!',
      ro: 'Compresie ușoară (mușchiul este foarte sensibil!) 20-30 secunde. Tehnica "ciupitului": prinderea mușchiului între degetul mare și arătător. Întindere: rotirea capului în partea opusă cu o ușoară înclinare înapoi. ATENȚIE: evitați presiunea pe artera carotidă!'
    },
    contraindications: {
      ru: 'Атеросклероз сонных артерий, гипертония, головокружение неясного генеза, сердечно-сосудистые заболевания. НИКОГДА не применять сильное давление!',
      ro: 'Ateroscleroză a arterelor carotide, hipertensiune, amețeli de origine neclară, boli cardiovasculare. NICIODATĂ nu aplicați presiune puternică!'
    },
    category: 'head_neck',
    difficulty: 'advanced',
    images: [],
    videos: [],
    order: 3,
  },
  {
    name: {
      ru: 'Большая грудная мышца - ТТ1 (ключичная часть)',
      ro: 'Mușchiul pectoral major - TP1 (porțiunea claviculară)'
    },
    muscle: 'Pectoralis Major (ключичная часть / porțiunea claviculară)',
    location: {
      ru: 'Ключичная часть большой грудной мышцы, медиальнее дельтовидно-грудной борозды, под ключицей',
      ro: 'Porțiunea claviculară a mușchiului pectoral major, medial de șanțul deltoid-pectoral, sub claviculă'
    },
    symptoms: {
      ru: 'Боль в передней части плеча, ограничение отведения руки, боль при глубоком вдохе, нарушение осанки (сведенные плечи)',
      ro: 'Durere în partea anterioară a umărului, limitarea abducției brațului, durere la inspirație profundă, tulburări de postură (umeri aduși înainte)'
    },
    referralPattern: {
      ru: 'Боль распространяется по передней поверхности плеча, может отдавать в медиальную сторону руки до локтя, иногда в область грудины',
      ro: 'Durerea se răspândește pe suprafața anterioară a umărului, poate iradia spre partea medială a brațului până la cot, uneori în zona sternului'
    },
    technique: {
      ru: 'Пациент лежит на спине, рука отведена в сторону. Ишемическая компрессия 45-60 секунд. Растяжение: рука отводится и ротируется наружу, можно использовать вес руки для растяжения. Рекомендуется работа в паре с растяжением передней грудной стенки.',
      ro: 'Pacientul stă pe spate, brațul abductionat lateral. Compresie ischemică 45-60 secunde. Întindere: brațul se abductează și se rotează extern, se poate folosi greutatea brațului pentru întindere. Se recomandă lucrul împreună cu întinderea peretelui anterior al toracelui.'
    },
    contraindications: {
      ru: 'Переломы ключицы или ребер в анамнезе, мастопатия, недавние операции на грудной клетке, заболевания молочных желез',
      ro: 'Fracturi de claviculă sau coaste în antecedente, mastopatie, operații recente pe torace, boli ale glandelor mamare'
    },
    category: 'chest',
    difficulty: 'intermediate',
    images: [],
    videos: [],
    order: 4,
  },
  {
    name: {
      ru: 'Подостная мышца - ТТ1',
      ro: 'Mușchiul infraspinos - TP1'
    },
    muscle: 'Infraspinatus',
    location: {
      ru: 'Центральная часть подостной ямки лопатки, медиальнее акромиального угла',
      ro: 'Partea centrală a fosei infraspinale a scapulei, medial de unghiul acromial'
    },
    symptoms: {
      ru: 'Глубокая боль в плече, боль при внутренней ротации руки (заведение руки за спину), нарушение сна на пораженной стороне, слабость при ротации плеча',
      ro: 'Durere profundă în umăr, durere la rotația internă a brațului (ducerea brațului la spate), tulburări de somn pe partea afectată, slăbiciune la rotația umărului'
    },
    referralPattern: {
      ru: 'Боль ощущается глубоко в переднем отделе плечевого сустава, может распространяться вниз по передней и боковой поверхности руки до запястья, иногда отдает в лопатку',
      ro: 'Durerea se simte profund în partea anterioară a articulației umărului, poate să se răspândească în jos pe suprafața anterioară și laterală a brațului până la încheietura mâinii, uneori iradiază în scapulă'
    },
    technique: {
      ru: 'Пациент лежит на здоровом боку или сидит с рукой на коленях. Глубокая компрессия 60-90 секунд (мышца глубокая). Растяжение: горизонтальное приведение руки через грудь с помощью другой руки. Эффективна комбинация с техниками для малой круглой мышцы.',
      ro: 'Pacientul stă pe partea sănătoasă sau șade cu brațul pe genunchi. Compresie profundă 60-90 secunde (mușchiul este profund). Întindere: aducția orizontală a brațului peste torace cu ajutorul celuilalt braț. Este eficientă combinația cu tehnici pentru mușchiul rotund mic.'
    },
    contraindications: {
      ru: 'Разрыв ротаторной манжеты, острый бурсит, недавние травмы плеча, импинджмент-синдром в острой фазе',
      ro: 'Ruptură a manșetei rotatoare, bursită acută, traumatisme recente ale umărului, sindrom de impingement în fază acută'
    },
    category: 'shoulder_arm',
    difficulty: 'intermediate',
    images: [],
    videos: [],
    order: 5,
  },
  {
    name: {
      ru: 'Квадратная мышца поясницы - ТТ1',
      ro: 'Mușchiul pătrat lombar - TP1'
    },
    muscle: 'Quadratus Lumborum',
    location: {
      ru: 'Поверхностный слой, латеральнее разгибателей спины, между гребнем подвздошной кости и 12-м ребром',
      ro: 'Stratul superficial, lateral de mușchii extensori ai spatelui, între creasta iliacă și coasta a 12-a'
    },
    symptoms: {
      ru: 'Острая боль в пояснице при вставании со стула, боль при кашле/чихании, невозможность выпрямиться полностью, боль в положении лежа на спине',
      ro: 'Durere acută în zona lombară la ridicarea de pe scaun, durere la tuse/strănut, imposibilitatea de a se îndrepta complet, durere în poziție culcat pe spate'
    },
    referralPattern: {
      ru: 'Боль локализуется в нижней части спины, в области крестцово-подвздошного сустава, может отдавать в ягодицу и верхнюю часть бедра, иногда в пах',
      ro: 'Durerea se localizează în partea inferioară a spatelui, în zona articulației sacroiliace, poate iradia în fesă și partea superioară a coapsei, uneori în zona inghinală'
    },
    technique: {
      ru: 'Пациент лежит на здоровом боку, верхняя нога согнута. Глубокая компрессия через мышцы спины 60-90 секунд. Важно: работать осторожно, избегая давления на почки. Растяжение: боковой наклон туловища в здоровую сторону. Эффективна постизометрическая релаксация.',
      ro: 'Pacientul stă pe partea sănătoasă, piciorul superior îndoit. Compresie profundă prin mușchii spatelui 60-90 secunde. Important: lucrați cu atenție, evitând presiunea pe rinichi. Întindere: înclinare laterală a trunchiului spre partea sănătoasă. Este eficientă relaxarea postizometrică.'
    },
    contraindications: {
      ru: 'Заболевания почек, грыжи межпозвоночных дисков поясничного отдела, острая фаза люмбаго, беременность',
      ro: 'Boli renale, hernii de disc intervertebrale lombare, fază acută de lumbago, sarcină'
    },
    category: 'back',
    difficulty: 'advanced',
    images: [],
    videos: [],
    order: 6,
  },
]

async function seedTriggerPoints() {
  try {
    console.log('🔌 Подключение к MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('✅ Подключено к MongoDB')

    console.log('🗑️  Очистка существующих триггерных точек...')
    await TriggerPoint.deleteMany({})

    console.log('📝 Добавление триггерных точек...')
    for (const point of triggerPoints) {
      const created = await TriggerPoint.create(point)
      console.log(`✅ Создана: ${created.name.ru}`)
    }

    console.log(`\n🎉 Успешно добавлено ${triggerPoints.length} триггерных точек!`)
    console.log('\nДобавленные точки:')
    triggerPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point.name.ru} (${point.muscle})`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

seedTriggerPoints()
