export const CURRENCY_CONFIG: Record<string, { symbol: string; decimals: number }> = {
  CNY: { symbol: '¥', decimals: 2 },
  JPY: { symbol: '¥', decimals: 0 },
  USD: { symbol: '$', decimals: 2 },
  EUR: { symbol: '€', decimals: 2 },
}

export function formatMoney(amount: number, currency: string): string {
  const config = CURRENCY_CONFIG[currency] || { symbol: '', decimals: 2 }
  const value = amount / Math.pow(10, config.decimals)
  return `${config.symbol}${value.toFixed(config.decimals)}`
}

export function toMinorUnits(amount: number, currency: string): number {
  const config = CURRENCY_CONFIG[currency] || { decimals: 2 }
  return Math.round(amount * Math.pow(10, config.decimals))
}

export function fromMinorUnits(amount: number, currency: string): number {
  const config = CURRENCY_CONFIG[currency] || { decimals: 2 }
  return amount / Math.pow(10, config.decimals)
}
