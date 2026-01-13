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
