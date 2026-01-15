import { db } from '../db'
import { calculateSplit } from '@/src/shared/split'
import type { RemainderTo, RoundingMode, SplitType } from '@/src/shared/zod/pool'
import { format } from 'date-fns'

export async function createCharge(subscriptionId: string, chargeDate: Date) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { pools: { where: { active: true }, include: { members: { where: { active: true } } } } },
  })
  if (!subscription) return null

  const charge = await db.subscriptionCharge.create({
    data: {
      subscriptionId,
      chargeDate,
      amount: subscription.amount,
      currency: subscription.currency,
    },
  })

  // 为每个活跃的 pool 生成 PoolPeriod 和 PoolLine
  for (const pool of subscription.pools) {
    const periodKey = format(chargeDate, 'yyyy-MM')
    const members = pool.members.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      value: m.value,
    }))

    const splits = calculateSplit(members, subscription.amount, pool.splitType as SplitType, {
      seatTotal: pool.seatTotal,
      roundingMode: pool.roundingMode as RoundingMode,
      remainderTo: pool.remainderTo as RemainderTo,
    })

    const period = await db.poolPeriod.create({
      data: {
        poolId: pool.id,
        chargeId: charge.id,
        periodKey,
        totalAmount: subscription.amount,
        currency: subscription.currency,
      },
    })

    await db.poolLine.createMany({
      data: splits.map((s) => ({
        poolPeriodId: period.id,
        poolMemberId: s.memberId,
        amountDue: s.amount,
      })),
    })
  }

  return charge
}

export async function listCharges(subscriptionId?: string) {
  return db.subscriptionCharge.findMany({
    where: subscriptionId ? { subscriptionId } : undefined,
    include: {
      subscription: { select: { id: true, name: true } },
      poolPeriods: { include: { lines: { include: { poolMember: true } } } },
    },
    orderBy: { chargeDate: 'desc' },
  })
}

export async function getCharge(id: string) {
  return db.subscriptionCharge.findUnique({
    where: { id },
    include: {
      subscription: true,
      poolPeriods: {
        include: {
          pool: true,
          lines: { include: { poolMember: true } },
        },
      },
    },
  })
}

export async function markChargePaid(id: string) {
  return db.subscriptionCharge.update({
    where: { id },
    data: { status: 'paid', paidAt: new Date() },
  })
}

export async function markLinePaid(lineId: string) {
  return db.poolLine.update({
    where: { id: lineId },
    data: { status: 'paid', paidAt: new Date() },
  })
}

export async function markLineWaived(lineId: string, note?: string) {
  return db.poolLine.update({
    where: { id: lineId },
    data: { status: 'waived', note },
  })
}

export interface MonthlySpending {
  month: string
  amount: number
  currency: string
}

export async function getMonthlySpending(months: number = 6): Promise<MonthlySpending[]> {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

  const charges = await db.subscriptionCharge.findMany({
    where: {
      chargeDate: { gte: startDate },
    },
    select: {
      chargeDate: true,
      amount: true,
      currency: true,
    },
    orderBy: { chargeDate: 'asc' },
  })

  // Group by month
  const grouped = new Map<string, { amount: number; currency: string }>()
  
  for (const charge of charges) {
    const monthKey = `${charge.chargeDate.getFullYear()}年${charge.chargeDate.getMonth() + 1}月`
    const existing = grouped.get(monthKey)
    if (existing) {
      existing.amount += charge.amount
    } else {
      grouped.set(monthKey, { amount: charge.amount, currency: charge.currency })
    }
  }

  // Convert to array
  const result: MonthlySpending[] = []
  for (const [month, data] of grouped.entries()) {
    result.push({ month, amount: data.amount, currency: data.currency })
  }

  return result
}

export interface YearlyStats {
  totalSpent: number
  totalCharges: number
  avgMonthly: number
  currency: string
}

export async function getYearlyStats(): Promise<YearlyStats> {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const charges = await db.subscriptionCharge.findMany({
    where: {
      chargeDate: { gte: startOfYear },
    },
    select: {
      amount: true,
      currency: true,
    },
  })

  const totalSpent = charges.reduce((sum, c) => sum + c.amount, 0)
  const totalCharges = charges.length
  const monthsElapsed = now.getMonth() + 1
  const avgMonthly = monthsElapsed > 0 ? Math.round(totalSpent / monthsElapsed) : 0

  return {
    totalSpent,
    totalCharges,
    avgMonthly,
    currency: charges[0]?.currency || 'CNY',
  }
}
