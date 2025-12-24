export type TelegramLang = 'ru' | 'ro'

type MessageDict = Record<string, string | MessageDict>

const messages: Record<TelegramLang, MessageDict> = {
  ru: {
    common: {
      appName: 'MateevMassage',
      notLinked: 'Аккаунт не привязан. Используйте /start и код из профиля.',
      serverError: 'Ошибка сервера. Попробуйте позже.',
      accessDenied: 'Недостаточно прав для этой команды.',
      onlyGroupChat: 'Команда работает только в групповых чатах.',
      cancelled: 'Отменено.',
      actionExpired: 'Время ожидания истекло. Повторите действие.',
      mainMenuTitle: 'Главное меню',
      chooseAction: 'Выберите действие:',
      helpTitle: 'Список команд',
      helpTeacherTitle: 'Команды преподавателя',
      backToMenu: 'Главное меню',
      back: 'Назад',
      yes: 'Да',
      no: 'Нет',
      unknownCommand: 'Неизвестная команда.',
    },
    labels: {
      group: 'Группа',
      deadline: 'Дедлайн',
      daysLeft: 'Осталось',
      score: 'Баллы',
      status: 'Статус',
      submittedAt: 'Сдано',
      duration: 'Длительность',
      location: 'Локация',
      topic: 'Тема',
      assignment: 'Задание',
      lesson: 'Урок',
      student: 'Студент',
      students: 'Студентов',
      file: 'Файл',
      size: 'Размер',
      id: 'ID',
      answer: 'Ответ',
      questions: 'Вопросов',
      maxScore: 'Макс. баллы',
      hoursLeft: 'Часов осталось',
      feedback: 'Комментарий',
    },
    buttons: {
      homework: 'Домашние задания',
      grades: 'Оценки',
      schedule: 'Расписание',
      quiz: 'Викторина',
      anatomy: 'Поиск по анатомии',
      help: 'Помощь',
      mySubmissions: 'Сдачи студентов',
      submit: 'Сдать',
      resubmit: 'Пересдать',
      view: 'Посмотреть',
      settings: 'Настройки',
      openApp: 'Открыть MateevMassage',
      mainMenu: 'Главное меню',
      backToList: 'Назад к списку',
      toggleNotifications: 'Уведомления: {{state}}',
      toggleQuietHours: 'Тихие часы: {{state}}',
      languageRu: 'Русский',
      languageRo: 'Romana',
      cancel: 'Отмена',
    },
    help: {
      general:
        '/start - привязать Telegram к аккаунту\n' +
        '/menu - главное меню\n' +
        '/schedule - расписание занятий\n' +
        '/homework - домашние задания\n' +
        '/submit <ID> <ответ> - сдать работу\n' +
        '/resubmit <ID> <ответ> - пересдать работу\n' +
        '/grades - оценки\n' +
        '/quiz - тесты\n' +
        '/anatomy <тема> - поиск по анатомии\n' +
        '/settings - настройки\n' +
        '/help - помощь',
      teacher:
        '/mysubmissions - работы студентов на проверку\n' +
        '/mystudents - список студентов',
    },
    start: {
      linkedSuccess: 'Аккаунт привязан! Привет, {{name}}.',
      linkedHint: 'Откройте /menu для команд.',
      linkedAlready: 'С возвращением, {{name}}! Ваш Telegram уже привязан.',
      linkedInvalid: 'Код недействителен или истек. Проверьте код в профиле.',
      welcome:
        'Привет! Чтобы подключить Telegram:\n' +
        '1) Откройте профиль на сайте\n' +
        '2) Перейдите в "Профиль > Настройки"\n' +
        '3) Нажмите "Подключить Telegram"\n' +
        '4) Введите код командой: /start <код>\n\n' +
        'Открыть {{appName}}:',
    },
    homework: {
      title: 'Домашние задания',
      noAssignments: 'Пока нет активных заданий.',
      activeHeader: 'Активные',
      completedHeader: 'Проверенные (последние 5)',
      submitHint: 'Чтобы сдать работу: /submit <ID> <ответ>',
      submitWithFileHint: 'Файл отправляйте с подписью: /submit <ID>',
    },
    submit: {
      usageText: 'Использование: /submit <ID> <ответ>',
      fileUsageText: 'Файл отправляйте с подписью: /submit <ID>',
      prompt: 'Отправьте ответ текстом или файлом. Для отмены используйте /cancel.',
      resubmitPrompt: 'Отправьте обновленный ответ текстом или файлом. Для отмены используйте /cancel.',
      missingContent: 'Пришлите текст или файл.',
      invalidId: 'Неверный ID задания.',
      invalidIdWithHint: 'Неверный ID задания. Используйте /homework для списка.',
      assignmentNotFound: 'Задание не найдено.',
      deadlinePassed: 'Дедлайн истек.',
      alreadySubmitted: 'Вы уже сдавали это задание. Используйте /resubmit.',
      success: 'Работа отправлена.',
      successLate: 'Работа отправлена с опозданием.',
      resubmitSuccess: 'Работа пересдана.',
      missingSubmission: 'Сначала отправьте работу командой /submit.',
      fileError: 'Ошибка при обработке файла.',
    },
    grades: {
      title: 'Оценки (последние 10)',
      noGrades: 'Оценок пока нет.',
      average: 'Средний процент',
    },
    schedule: {
      title: 'Расписание занятий',
      noGroups: 'У вас пока нет активных групп.',
      none: 'Пока нет ближайших занятий.',
      footer: 'Обновления доступны в приложении.',
    },
    quiz: {
      title: 'Тест',
      noQuizzes: 'Пока нет тестов.',
      question: 'Вопрос {{current}}/{{total}}',
      notFound: 'Тест не найден.',
      questionNotFound: 'Вопрос не найден.',
      correct: 'Правильно!',
      incorrect: 'Неправильно.',
      answerLabel: 'Ваш ответ',
      correctAnswerLabel: 'Правильный ответ',
      finishedTitle: 'Тест завершен!',
      finishedHint: 'Спасибо за участие! Используйте /quiz для нового теста.',
    },
    anatomy: {
      usage: 'Использование: /anatomy <тема>\nПример: /anatomy мышцы',
      results: 'Найденные темы',
      notFound: 'Ничего не найдено по запросу "{{query}}"',
    },
    teacher: {
      noGroups: 'Нет активных групп.',
      noAssignments: 'Вы еще не создавали заданий.',
      noSubmissions: 'Нет новых сдач.',
      submissionsTitle: 'Новые сдачи (последние 10)',
      reviewTitle: 'Работы на проверку (последние 10)',
      reviewEmpty: 'Нет работ ожидающих проверки.',
      reviewHint: 'Для проверки используйте веб-интерфейс или кнопки выше.',
      viewTitle: 'Просмотр работы',
      viewNotFound: 'Сдача не найдена.',
      viewAnswer: 'Ответ',
      viewFiles: 'Файлы',
      viewHint: 'Для выставления оценки используйте веб-интерфейс.',
      submissionLate: 'С опозданием',
      submissionOnTime: 'Вовремя',
      studentsTitle: 'Мои студенты',
      studentsCount: 'Студентов: {{count}}',
      telegramLinkedCount: 'Привязано Telegram: {{linked}}/{{total}}',
    },
    linkgroup: {
      privateOnly:
        'Команда работает только в групповых чатах.\n\n' +
        'Чтобы связать Telegram группу:\n' +
        '1) Создайте Telegram группу\n' +
        '2) Добавьте бота в группу\n' +
        '3) Сделайте бота администратором\n' +
        '4) Введите /linkgroup в группе',
      onlyTeacher: 'Только преподаватели могут связывать Telegram группы.',
      botNotAdmin:
        'Бот должен быть администратором группы. Назначьте права и повторите команду.',
      noGroups:
        'У вас нет активных групп.\nСоздайте группу в админ-панели и попробуйте снова.',
      alreadyLinked:
        'Эта Telegram группа уже связана с группой обучения: {{groupName}}.\nДля отвязки используйте /unlinkgroup.',
      groupNotFound: 'Группа не найдена.',
      alreadyLinkedOther: 'Эта группа уже привязана к другому Telegram чату.',
      selectGroup:
        'Выберите группу обучения для привязки.\n' +
        'После привязки файлы из платформы будут дублироваться в Telegram.',
      unlinkSuccess: 'Telegram группа отвязана от группы "{{groupName}}".',
      unlinkOnlyTeacher: 'Только преподаватель группы может отвязать Telegram группу.',
      notLinkedGroup: 'Эта Telegram группа не привязана ни к одной группе обучения.',
      linkSuccess:
        'Группа связана!\n' +
        'Группа обучения: {{groupName}}\n\n' +
        'Файлы и уведомления будут дублироваться в этот чат.',
      linkedShort: 'Группа привязана.',
      linkError: 'Ошибка при привязке группы.',
    },
    settings: {
      title: 'Настройки',
      notifications: 'Уведомления',
      quietHours: 'Тихие часы',
      language: 'Язык',
      notificationsEnabled: 'Уведомления включены',
      notificationsDisabled: 'Уведомления выключены',
      quietHoursEnabled: 'Тихие часы включены: {{start}}-{{end}}',
      quietHoursDisabled: 'Тихие часы выключены',
      languageCurrent: 'Текущий язык: {{lang}}',
      updated: 'Настройки обновлены.',
    },
    notifications: {
      newContent: 'Новый {{contentType}}!\n\n{{title}}\n\nОткройте приложение, чтобы посмотреть.',
      newQuiz: 'Новый тест!',
      newAssignment: 'Новое домашнее задание!',
      deadlineReminder: 'Скоро дедлайн!',
      graded: 'Работа проверена!',
      newSchedule: 'Новое занятие!',
      quizHint: 'Пройти тест: /quiz',
      homeworkHint: 'Подробности: /homework',
      deadlineHint: 'Сдать: /submit {{id}} <ответ>',
      gradesHint: 'Оценки: /grades',
      scheduleHint: 'Открыть приложение: {{url}}',
    },
    daily: {
      anatomyTitle: 'Анатомия дня',
      quizTitle: 'Вечерний тест',
      anatomyHint: 'Изучить подробнее: {{url}}',
      quizHint: 'Пройдите тест: /quiz',
    },
  },
  ro: {
    common: {
      appName: 'MateevMassage',
      notLinked: 'Contul nu este conectat. Folositi /start si codul din profil.',
      serverError: 'Eroare de server. Incercati mai tarziu.',
      accessDenied: 'Nu aveti drepturi pentru aceasta comanda.',
      onlyGroupChat: 'Comanda functioneaza doar in grupuri.',
      cancelled: 'Anulat.',
      actionExpired: 'Timpul de asteptare a expirat. Reincercati.',
      mainMenuTitle: 'Meniu principal',
      chooseAction: 'Alegeti actiunea:',
      helpTitle: 'Lista de comenzi',
      helpTeacherTitle: 'Comenzi pentru profesori',
      backToMenu: 'Meniu principal',
      back: 'Inapoi',
      yes: 'Da',
      no: 'Nu',
      unknownCommand: 'Comanda necunoscuta.',
    },
    labels: {
      group: 'Grup',
      deadline: 'Termen',
      daysLeft: 'Ramas',
      score: 'Puncte',
      status: 'Status',
      submittedAt: 'Predat',
      duration: 'Durata',
      location: 'Locatie',
      topic: 'Tema',
      assignment: 'Tema',
      lesson: 'Lectia',
      student: 'Student',
      students: 'Studenti',
      file: 'Fisier',
      size: 'Dimensiune',
      id: 'ID',
      answer: 'Raspuns',
      questions: 'Intrebari',
      maxScore: 'Punctaj max',
      hoursLeft: 'Ore ramase',
      feedback: 'Feedback',
    },
    buttons: {
      homework: 'Teme',
      grades: 'Note',
      schedule: 'Orar',
      quiz: 'Quiz',
      anatomy: 'Cauta anatomie',
      help: 'Ajutor',
      mySubmissions: 'Lucrari studenti',
      submit: 'Trimite',
      resubmit: 'Retrimite',
      view: 'Vezi',
      settings: 'Setari',
      openApp: 'Deschide MateevMassage',
      mainMenu: 'Meniu principal',
      backToList: 'Inapoi la lista',
      toggleNotifications: 'Notificari: {{state}}',
      toggleQuietHours: 'Ore linistite: {{state}}',
      languageRu: 'Rusa',
      languageRo: 'Romana',
      cancel: 'Anuleaza',
    },
    help: {
      general:
        '/start - conecteaza Telegram la cont\n' +
        '/menu - meniul principal\n' +
        '/schedule - orar\n' +
        '/homework - teme\n' +
        '/submit <ID> <raspuns> - trimite tema\n' +
        '/resubmit <ID> <raspuns> - retrimite tema\n' +
        '/grades - note\n' +
        '/quiz - teste\n' +
        '/anatomy <tema> - cauta anatomie\n' +
        '/settings - setari\n' +
        '/help - ajutor',
      teacher:
        '/mysubmissions - lucrari de verificat\n' +
        '/mystudents - lista studentilor',
    },
    start: {
      linkedSuccess: 'Contul a fost conectat! Salut, {{name}}.',
      linkedHint: 'Deschide /menu pentru comenzi.',
      linkedAlready: 'Bine ai revenit, {{name}}! Telegram este deja conectat.',
      linkedInvalid: 'Cod invalid sau expirat. Verificati codul din profil.',
      welcome:
        'Salut! Pentru conectare Telegram:\n' +
        '1) Deschide profilul pe site\n' +
        '2) Mergi la "Profil > Setari"\n' +
        '3) Apasa "Conecteaza Telegram"\n' +
        '4) Introdu codul: /start <cod>\n\n' +
        'Deschide {{appName}}:',
    },
    homework: {
      title: 'Teme',
      noAssignments: 'Nu exista sarcini active.',
      activeHeader: 'Active',
      completedHeader: 'Verificate (ultimele 5)',
      submitHint: 'Pentru trimitere: /submit <ID> <raspuns>',
      submitWithFileHint: 'Trimite fisier cu textul: /submit <ID>',
    },
    submit: {
      usageText: 'Utilizare: /submit <ID> <raspuns>',
      fileUsageText: 'Trimite fisier cu textul: /submit <ID>',
      prompt: 'Trimite raspunsul ca text sau fisier. Pentru anulare foloseste /cancel.',
      resubmitPrompt: 'Trimite raspunsul actualizat ca text sau fisier. Pentru anulare foloseste /cancel.',
      missingContent: 'Trimite text sau fisier.',
      invalidId: 'ID tema invalid.',
      invalidIdWithHint: 'ID tema invalid. Folositi /homework pentru lista.',
      assignmentNotFound: 'Tema nu a fost gasita.',
      deadlinePassed: 'Termenul a expirat.',
      alreadySubmitted: 'Ai trimis deja. Foloseste /resubmit.',
      success: 'Lucrarea a fost trimisa.',
      successLate: 'Lucrarea a fost trimisa cu intarziere.',
      resubmitSuccess: 'Lucrarea a fost retrimisa.',
      missingSubmission: 'Trimite mai intai cu /submit.',
      fileError: 'Eroare la procesarea fisierului.',
    },
    grades: {
      title: 'Note (ultimele 10)',
      noGrades: 'Inca nu sunt note.',
      average: 'Procent mediu',
    },
    schedule: {
      title: 'Orar',
      noGroups: 'Nu aveti grupe active.',
      none: 'Nu sunt lectii in viitorul apropiat.',
      footer: 'Actualizari in aplicatie.',
    },
    quiz: {
      title: 'Test',
      noQuizzes: 'Nu exista teste.',
      question: 'Intrebare {{current}}/{{total}}',
      notFound: 'Testul nu a fost gasit.',
      questionNotFound: 'Intrebarea nu a fost gasita.',
      correct: 'Corect!',
      incorrect: 'Gresit.',
      answerLabel: 'Raspunsul tau',
      correctAnswerLabel: 'Raspuns corect',
      finishedTitle: 'Test terminat!',
      finishedHint: 'Multumim! Folositi /quiz pentru un test nou.',
    },
    anatomy: {
      usage: 'Utilizare: /anatomy <tema>\nExemplu: /anatomy muschi',
      results: 'Teme gasite',
      notFound: 'Nu s-a gasit nimic pentru "{{query}}"',
    },
    teacher: {
      noGroups: 'Nu sunt grupe active.',
      noAssignments: 'Nu ati creat inca teme.',
      noSubmissions: 'Nu sunt lucrari noi.',
      submissionsTitle: 'Lucrari noi (ultimele 10)',
      reviewTitle: 'Lucrari la verificare (ultimele 10)',
      reviewEmpty: 'Nu sunt lucrari de verificat.',
      reviewHint: 'Pentru verificare folositi interfata web sau butoanele de mai sus.',
      viewTitle: 'Vizualizare lucrare',
      viewNotFound: 'Lucrarea nu a fost gasita.',
      viewAnswer: 'Raspuns',
      viewFiles: 'Fisiere',
      viewHint: 'Pentru notare folositi interfata web.',
      submissionLate: 'Cu intarziere',
      submissionOnTime: 'La timp',
      studentsTitle: 'Studentii mei',
      studentsCount: 'Studenti: {{count}}',
      telegramLinkedCount: 'Telegram conectat: {{linked}}/{{total}}',
    },
    linkgroup: {
      privateOnly:
        'Comanda functioneaza doar in grupuri.\n\n' +
        'Pentru a conecta un grup:\n' +
        '1) Creati un grup Telegram\n' +
        '2) Adaugati botul in grup\n' +
        '3) Faceti botul administrator\n' +
        '4) Rulati /linkgroup in grup',
      onlyTeacher: 'Doar profesorii pot conecta grupuri Telegram.',
      botNotAdmin:
        'Botul trebuie sa fie administrator. Acordati drepturi si incercati din nou.',
      noGroups:
        'Nu aveti grupe active.\nCreati o grupa in admin si incercati din nou.',
      alreadyLinked:
        'Acest grup Telegram este deja legat de grupa: {{groupName}}.\nFolositi /unlinkgroup pentru a dezlega.',
      groupNotFound: 'Grupa nu a fost gasita.',
      alreadyLinkedOther: 'Aceasta grupa este deja conectata la alt chat Telegram.',
      selectGroup:
        'Selectati grupa pentru conectare.\nDupa conectare, fisierele vor fi trimise si in Telegram.',
      unlinkSuccess: 'Grupul Telegram a fost deconectat de la grupa "{{groupName}}".',
      unlinkOnlyTeacher: 'Doar profesorul grupei poate deconecta grupul Telegram.',
      notLinkedGroup: 'Acest grup Telegram nu este conectat la nicio grupa.',
      linkSuccess:
        'Grupa a fost conectata!\n' +
        'Grupa de studiu: {{groupName}}\n\n' +
        'Fisierele si notificarile vor fi trimise in acest chat.',
      linkedShort: 'Grupa conectata.',
      linkError: 'Eroare la conectarea grupei.',
    },
    settings: {
      title: 'Setari',
      notifications: 'Notificari',
      quietHours: 'Ore linistite',
      language: 'Limba',
      notificationsEnabled: 'Notificarile sunt active',
      notificationsDisabled: 'Notificarile sunt oprite',
      quietHoursEnabled: 'Ore linistite active: {{start}}-{{end}}',
      quietHoursDisabled: 'Ore linistite dezactivate',
      languageCurrent: 'Limba curenta: {{lang}}',
      updated: 'Setarile au fost actualizate.',
    },
    notifications: {
      newContent: 'Continut nou: {{contentType}}!\n\n{{title}}\n\nDeschide aplicatia pentru detalii.',
      newQuiz: 'Test nou!',
      newAssignment: 'Tema noua!',
      deadlineReminder: 'Se apropie termenul!',
      graded: 'Lucrarea a fost verificata!',
      newSchedule: 'Lectie noua!',
      quizHint: 'Fa testul: /quiz',
      homeworkHint: 'Detalii: /homework',
      deadlineHint: 'Trimite: /submit {{id}} <raspuns>',
      gradesHint: 'Note: /grades',
      scheduleHint: 'Deschide aplicatia: {{url}}',
    },
    daily: {
      anatomyTitle: 'Anatomia zilei',
      quizTitle: 'Test de seara',
      anatomyHint: 'Vezi detalii: {{url}}',
      quizHint: 'Fa testul: /quiz',
    },
  },
}

export const resolveTelegramLang = (userLang?: string, telegramLangCode?: string): TelegramLang => {
  if (userLang === 'ru' || userLang === 'ro') return userLang
  const code = (telegramLangCode || '').toLowerCase()
  if (code.startsWith('ro')) return 'ro'
  if (code.startsWith('ru')) return 'ru'
  return 'ru'
}

const getNestedValue = (obj: MessageDict, key: string): string | null => {
  const parts = key.split('.')
  let current: MessageDict | string | undefined = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return null
    current = (current as MessageDict)[part]
  }
  return typeof current === 'string' ? current : null
}

export const escapeMarkdown = (value: string) => {
  return value.replace(/[\\_*\\[\\]()`]/g, '\\\\$&')
}

export const t = (
  lang: TelegramLang,
  key: string,
  vars: Record<string, string | number> = {},
  options: { escape?: boolean } = {}
) => {
  const message =
    getNestedValue(messages[lang], key) || getNestedValue(messages.ru, key) || key

  const shouldEscape = options.escape !== false
  return Object.entries(vars).reduce((result, [name, rawValue]) => {
    const value = shouldEscape ? escapeMarkdown(String(rawValue)) : String(rawValue)
    return result.replace(new RegExp(`{{\\s*${name}\\s*}}`, 'g'), value)
  }, message)
}
