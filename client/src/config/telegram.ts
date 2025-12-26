const DEFAULT_TELEGRAM_BOT_USERNAME = 'mateevmassage_bot'

const TELEGRAM_BOT_USERNAME =
  (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined) ||
  DEFAULT_TELEGRAM_BOT_USERNAME

const TELEGRAM_BOT_LINK =
  (import.meta.env.VITE_TELEGRAM_BOT_URL as string | undefined) ||
  `https://t.me/${TELEGRAM_BOT_USERNAME}`

const TELEGRAM_BOT_QR = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
  TELEGRAM_BOT_LINK
)}`

export { TELEGRAM_BOT_USERNAME, TELEGRAM_BOT_LINK, TELEGRAM_BOT_QR }
