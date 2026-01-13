import { addDays, addMonths, addYears, addWeeks, isAfter, isBefore } from 'date-fns'

type BillingInterval = 'week' | 'month' | 'year' | 'custom'

interface CalcNextChargeParams {
  billingInterval: BillingInterval
  billingEvery: number
  anchorDate: Date
  fromDate?: Date
}

export function calcNextChargeDate(params: CalcNextChargeParams): Date {
  const { billingInterval, billingEvery, anchorDate, fromDate = new Date() } = params
  let next = new Date(anchorDate)

  while (!isAfter(next, fromDate)) {
    switch (billingInterval) {
      case 'week':
        next = addWeeks(next, billingEvery)
        break
      case 'month':
        next = addMonths(next, billingEvery)
        break
      case 'year':
        next = addYears(next, billingEvery)
        break
      case 'custom':
        next = addDays(next, billingEvery)
        break
    }
  }

  return next
}

interface UpcomingCharge {
  id: string
  name: string
  amount: number
  currency: string
  nextChargeDate: Date
}

export function getUpcomingCharges<T extends UpcomingCharge>(
  subscriptions: T[],
  days: number = 30
): T[] {
  const now = new Date()
  const cutoff = addDays(now, days)

  return subscriptions
    .filter((s) => !isAfter(s.nextChargeDate, cutoff) && !isBefore(s.nextChargeDate, now))
    .sort((a, b) => a.nextChargeDate.getTime() - b.nextChargeDate.getTime())
}

export function getDaysUntil(date: Date): number {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
