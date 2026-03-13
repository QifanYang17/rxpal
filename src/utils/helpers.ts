import { t, tArray } from './i18n'

export function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h < 12) return { text: t('greeting.morning'), emoji: '🌅' }
  if (h < 18) return { text: t('greeting.afternoon'), emoji: '🌤' }
  return { text: t('greeting.evening'), emoji: '🌙' }
}

export function formatDate(): string {
  const d = new Date()
  const weekdays = tArray('date.weekdays')
  return t('date.format', {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1),
    day: String(d.getDate()),
    weekday: weekdays[d.getDay()] || '',
  })
}

export function formatRecordDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    month: t('date.month', { m: String(d.getMonth() + 1) }),
    day: t('date.day', { d: String(d.getDate()) }),
  }
}
