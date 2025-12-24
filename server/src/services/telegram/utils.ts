import { Context } from 'telegraf'
import { resolveTelegramLang, TelegramLang } from './i18n'

type LocalizedField = { ru?: string; ro?: string } | null | undefined

export const getTelegramLang = (ctx: Context, userLang?: string): TelegramLang => {
  return resolveTelegramLang(userLang, ctx.from?.language_code)
}

export const getLocale = (lang: TelegramLang) => (lang === 'ro' ? 'ro-RO' : 'ru-RU')

export const getLocalizedText = (value: LocalizedField, lang: TelegramLang) => {
  return value?.[lang] || value?.ru || value?.ro || ''
}
