export const BASE_CURRENCY = 'CNY'

export const EXCHANGE_RATES: Record<string, number> = {
  CNY: 1,
  JPY: 0.052,
  USD: 7.25,
  EUR: 7.85,
}

export function convertToBase(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency] ?? 1
  return amount * rate
}

export function convertFromBase(amount: number, targetCurrency: string): number {
  const rate = EXCHANGE_RATES[targetCurrency] ?? 1
  return amount / rate
}

export function getSupportedCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES)
}
