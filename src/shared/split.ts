import type { RemainderTo, RoundingMode, SplitType } from './zod/pool'

export interface SplitMember {
  id: string
  displayName: string
  value?: number | null
}

export interface SplitResult {
  memberId: string
  displayName: string
  amount: number
}

export interface SplitOptions {
  seatTotal?: number | null
  roundingMode?: RoundingMode
  remainderTo?: RemainderTo
}

export function calculateSplit(
  members: SplitMember[],
  totalAmount: number,
  splitType: SplitType,
  options?: SplitOptions | number | null
): SplitResult[] {
  if (members.length === 0) return []

  const normalizedOptions: SplitOptions =
    typeof options === 'number' ? { seatTotal: options } : (options ?? {})

  const roundingMode: RoundingMode = normalizedOptions.roundingMode ?? 'minor'
  const remainderTo: RemainderTo = normalizedOptions.remainderTo ?? 'owner'

  switch (splitType) {
    case 'equal':
      return toResults(members, splitEqual(members.length, totalAmount, roundingMode, remainderTo))
    case 'fixed':
      return toResults(members, splitFixed(members, totalAmount, remainderTo))
    case 'ratio':
      return toResults(members, splitRatio(members, totalAmount, roundingMode, remainderTo))
    case 'seat':
      return toResults(
        members,
        splitSeat(
          members,
          totalAmount,
          normalizedOptions.seatTotal,
          roundingMode,
          remainderTo
        )
      )
    default:
      return toResults(members, splitEqual(members.length, totalAmount, roundingMode, remainderTo))
  }
}

function toResults(members: SplitMember[], amounts: number[]): SplitResult[] {
  return members.map((m, i) => ({
    memberId: m.id,
    displayName: m.displayName,
    amount: amounts[i] ?? 0,
  }))
}

function splitEqual(
  count: number,
  totalAmount: number,
  roundingMode: RoundingMode,
  remainderTo: RemainderTo
): number[] {
  return apportionByWeights(totalAmount, Array.from({ length: count }, () => 1), roundingMode, remainderTo)
}

function splitFixed(members: SplitMember[], totalAmount: number, remainderTo: RemainderTo): number[] {
  const count = members.length
  const safeTotal = toSafeInt(totalAmount)
  const remainderIndex = getRemainderIndex(count, remainderTo)
  const amounts = members.map((m, i) => {
    if (i === remainderIndex) return 0
    const value = normalizeValue(m.value) ?? 0
    return clampNonNegativeInt(value)
  })

  const remainder = safeTotal - sum(amounts)
  if (remainder >= 0) {
    amounts[remainderIndex] = remainder
    return amounts
  }

  // fixed 总额超出：优先把 remainderTo 承担者降到 0，再从其它成员的固定额里回收
  const reduced = reduceToTotal(amounts, safeTotal, remainderIndex)
  const stillOver = sum(reduced) - safeTotal
  if (stillOver > 0) {
    // 理论上不会发生（因为 reduceToTotal 已经把总和降到了 safeTotal），兜底保护
    reduced[remainderIndex] = Math.max(0, reduced[remainderIndex] - stillOver)
  }

  return reduced
}

function splitRatio(
  members: SplitMember[],
  totalAmount: number,
  roundingMode: RoundingMode,
  remainderTo: RemainderTo
): number[] {
  const weights = members.map((m) => {
    const value = normalizeValue(m.value)
    return clampNonNegativeInt(value ?? 1)
  })

  return apportionByWeights(totalAmount, weights, roundingMode, remainderTo)
}

function splitSeat(
  members: SplitMember[],
  totalAmount: number,
  seatTotal: number | null | undefined,
  roundingMode: RoundingMode,
  remainderTo: RemainderTo
): number[] {
  const seats = members.map((m) => {
    const value = normalizeValue(m.value)
    return clampNonNegativeInt(value ?? 1)
  })

  const seatsSum = sum(seats)
  if (seatsSum === 0) {
    return splitEqual(members.length, totalAmount, roundingMode, remainderTo)
  }

  // seatTotal 允许 > 成员席位之和（表示有空闲席位），空闲部分归 remainderTo 承担者
  const totalSeats = Math.max(seatTotal ?? seatsSum, seatsSum)
  if (totalSeats === seatsSum) {
    return apportionByWeights(totalAmount, seats, roundingMode, remainderTo)
  }

  const remainderSeats = totalSeats - seatsSum
  const weightsWithRemainder = [...seats, remainderSeats]
  const amountsWithRemainder = apportionByWeights(totalAmount, weightsWithRemainder, roundingMode, remainderTo)
  const remainderAmount = amountsWithRemainder[amountsWithRemainder.length - 1] ?? 0
  const amounts = amountsWithRemainder.slice(0, -1)

  const remainderIndex = getRemainderIndex(members.length, remainderTo)
  amounts[remainderIndex] = (amounts[remainderIndex] ?? 0) + remainderAmount
  return amounts
}

function apportionByWeights(
  totalAmount: number,
  weights: number[],
  roundingMode: RoundingMode,
  remainderTo: RemainderTo
): number[] {
  const safeTotal = toSafeInt(totalAmount)
  if (weights.length === 0) return []

  const normalizedWeights = weights.map((w) => clampNonNegativeInt(w))
  const denom = sum(normalizedWeights)
  if (denom === 0) {
    return splitEqual(normalizedWeights.length, safeTotal, roundingMode, remainderTo)
  }

  const quotients = normalizedWeights.map((w) => Math.floor((safeTotal * w) / denom))
  const remainders = normalizedWeights.map((w) => (safeTotal * w) % denom)
  let amounts = quotients.slice()

  if (roundingMode === 'ceil') {
    amounts = amounts.map((a, i) => a + (remainders[i] > 0 ? 1 : 0))
  }

  const current = sum(amounts)
  const diff = safeTotal - current
  if (diff === 0) return amounts

  if (roundingMode === 'floor') {
    const target = getRemainderIndex(amounts.length, remainderTo)
    amounts[target] += diff
    return amounts
  }

  if (diff < 0) {
    return subtractUnits(amounts, -diff, remainders, remainderTo)
  }

  // roundingMode === 'minor'
  const order = indicesByRemainder(remainders, 'desc', remainderTo)
  for (let i = 0; i < diff; i++) {
    const idx = order[i % order.length]
    amounts[idx] = (amounts[idx] ?? 0) + 1
  }
  return amounts
}

function subtractUnits(
  amounts: number[],
  units: number,
  remainders: number[],
  remainderTo: RemainderTo
): number[] {
  const result = amounts.slice()
  let remaining = units

  const target = getRemainderIndex(result.length, remainderTo)
  const takeFromTarget = Math.min(remaining, result[target] ?? 0)
  result[target] = (result[target] ?? 0) - takeFromTarget
  remaining -= takeFromTarget
  if (remaining === 0) return result

  const order = indicesByRemainder(remainders, 'asc', remainderTo).filter((i) => i !== target)
  for (const idx of order) {
    if (remaining === 0) break
    const take = Math.min(remaining, result[idx] ?? 0)
    result[idx] = (result[idx] ?? 0) - take
    remaining -= take
  }

  return result
}

function reduceToTotal(amounts: number[], total: number, remainderIndex: number): number[] {
  const result = amounts.slice()
  const safeTotal = toSafeInt(total)
  let current = sum(result)
  if (current <= safeTotal) return result

  // 先从 remainderIndex 回收（它在 fixed 模式里会被设置为 0），然后按金额从大到小回收
  const order = Array.from({ length: result.length }, (_, i) => i)
    .filter((i) => i !== remainderIndex)
    .sort((a, b) => (result[b] ?? 0) - (result[a] ?? 0) || a - b)

  for (const idx of order) {
    if (current <= safeTotal) break
    const canTake = Math.min(current - safeTotal, result[idx] ?? 0)
    result[idx] = (result[idx] ?? 0) - canTake
    current -= canTake
  }

  return result
}

function indicesByRemainder(
  remainders: number[],
  direction: 'asc' | 'desc',
  remainderTo: RemainderTo
): number[] {
  const preferLast = remainderTo === 'last'

  return remainders
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      if (a.r !== b.r) {
        return direction === 'desc' ? b.r - a.r : a.r - b.r
      }
      // tie-breaker：确保稳定且可预期
      return preferLast ? b.i - a.i : a.i - b.i
    })
    .map((x) => x.i)
}

function getRemainderIndex(count: number, remainderTo: RemainderTo): number {
  if (count <= 0) return 0
  if (remainderTo === 'last') return count - 1
  // 'owner' 暂时等同于 'first'（MVP 阶段 PoolMember 未建模 owner）
  return 0
}

function normalizeValue(value: number | null | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return value
}

function clampNonNegativeInt(value: number): number {
  const int = toSafeInt(value)
  return int < 0 ? 0 : int
}

function toSafeInt(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.trunc(value)
}

function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0)
}
