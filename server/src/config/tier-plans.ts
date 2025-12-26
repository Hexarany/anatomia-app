export interface TierPlan {
  id: 'basic-monthly' | 'basic-quarterly' | 'premium-monthly' | 'premium-yearly'
  tierLevel: 'basic' | 'premium' // The actual access level
  name: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  price: number
  duration: number // Duration in days
  currency: string
  features: {
    ru: string[]
    ro: string[]
  }
  upgradeFromBasic?: number
}

export const TIER_PLANS: TierPlan[] = [
  {
    id: 'basic-monthly',
    tierLevel: 'basic',
    name: {
      ru: 'Базовый - Месячный',
      ro: 'De bază - Lunar',
    },
    description: {
      ru: 'Доступ к основным материалам на 1 месяц',
      ro: 'Acces la materiale de bază pentru 1 lună',
    },
    price: 9.99,
    duration: 30,
    currency: 'USD',
    features: {
      ru: [
        'Доступ к темам анатомии',
        'Руководства по гигиене',
        '4 базовых протокола массажа',
        'Сопровождение в Telegram',
      ],
      ro: [
        'Acces la teme de anatomie',
        'Ghiduri de igienă',
        '4 protocoale de masaj de bază',
        'Suport în Telegram',
      ],
    },
  },
  {
    id: 'basic-quarterly',
    tierLevel: 'basic',
    name: {
      ru: 'Базовый - 3 месяца',
      ro: 'De bază - 3 luni',
    },
    description: {
      ru: 'Доступ к основным материалам на 3 месяца (экономия 17%)',
      ro: 'Acces la materiale de bază pentru 3 luni (economie 17%)',
    },
    price: 24.99,
    duration: 90,
    currency: 'USD',
    features: {
      ru: [
        'Всё из месячного Basic',
        'Экономия $5 (17%)',
        '4 протокола массажа',
        'Анатомические разделы',
        'Гигиена',
      ],
      ro: [
        'Tot din Basic lunar',
        'Economie $5 (17%)',
        '4 protocoale de masaj',
        'Secțiuni anatomice',
        'Igienă',
      ],
    },
  },
  {
    id: 'premium-monthly',
    tierLevel: 'premium',
    name: {
      ru: 'Премиум - Месячный',
      ro: 'Premium - Lunar',
    },
    description: {
      ru: 'Полный доступ ко всем материалам на 1 месяц',
      ro: 'Acces complet la toate materialele pentru 1 lună',
    },
    price: 29.99,
    duration: 30,
    currency: 'USD',
    features: {
      ru: [
        'Все протоколы массажа',
        'Триггерные точки',
        'Тесты и викторины',
        '3D модели анатомии',
        'Полный доступ',
        'Приоритетная поддержка',
      ],
      ro: [
        'Toate protocoalele de masaj',
        'Puncte trigger',
        'Teste și chestionare',
        'Modele 3D de anatomie',
        'Acces complet',
        'Suport prioritar',
      ],
    },
  },
  {
    id: 'premium-yearly',
    tierLevel: 'premium',
    name: {
      ru: 'Премиум - Годовой',
      ro: 'Premium - Anual',
    },
    description: {
      ru: 'Полный доступ ко всем материалам на 1 год (экономия 72%)',
      ro: 'Acces complet la toate materialele pentru 1 an (economie 72%)',
    },
    price: 99.99,
    duration: 365,
    currency: 'USD',
    upgradeFromBasic: 75,
    features: {
      ru: [
        'Всё из месячного Premium',
        'Экономия $260 (72%)',
        'Все протоколы массажа',
        'Триггерные точки',
        'Тесты и викторины',
        '3D модели анатомии',
        'Сертификат об окончании',
        'Приоритетная поддержка',
      ],
      ro: [
        'Tot din Premium lunar',
        'Economie $260 (72%)',
        'Toate protocoalele de masaj',
        'Puncte trigger',
        'Teste și chestionare',
        'Modele 3D de anatomie',
        'Certificat de absolvire',
        'Suport prioritar',
      ],
    },
  },
]

export const getTierPlanById = (tierId: string): TierPlan | undefined => {
  return TIER_PLANS.find((plan) => plan.id === tierId)
}

// Define which massage protocols are available in Basic tier
// These slugs must match exactly with the database
export const BASIC_TIER_MASSAGE_PROTOCOLS = [
  'klassicheskiy-massazh-vsego-tela', // Классический массаж всего тела
  'medovyy-massazh', // Медовый массаж
  'banochnyy-vakuumnyy-massazh', // Баночный (вакуумный) массаж
  'antitsellyulitnyy-massazh', // Антицеллюлитный массаж
]
