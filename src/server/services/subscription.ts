import { db } from '../db'
import { calcNextChargeDate } from '@/src/shared/dates'
import { toMinorUnits } from '@/src/shared/money'
import type { SubscriptionInput, SubscriptionUpdateInput } from '@/src/shared/zod/subscription'
import { DEFAULT_USER_ID, ensureDefaultUser } from './user'

export async function createSubscription(data: SubscriptionInput, userId?: string) {
  const uid = userId || (await ensureDefaultUser())

  const nextChargeDate = calcNextChargeDate({
    billingInterval: data.billingInterval,
    billingEvery: data.billingEvery,
    anchorDate: data.anchorDate,
  })

  return db.subscription.create({
    data: {
      userId: uid,
      name: data.name,
      provider: data.provider,
      categoryId: data.categoryId,
      amount: toMinorUnits(data.amount, data.currency),
      currency: data.currency,
      billingInterval: data.billingInterval,
      billingEvery: data.billingEvery,
      anchorDate: data.anchorDate,
      nextChargeDate,
      isShareable: data.isShareable,
      notes: data.notes,
    },
    include: { category: true },
  })
}

export async function listSubscriptions(userId?: string, includeArchived = false) {
  const uid = userId || (await ensureDefaultUser())

  return db.subscription.findMany({
    where: {
      userId: uid,
      archived: includeArchived ? undefined : false,
    },
    include: { category: true },
    orderBy: { nextChargeDate: 'asc' },
  })
}

export async function getSubscription(id: string, userId?: string) {
  const uid = userId || DEFAULT_USER_ID

  return db.subscription.findFirst({
    where: { id, userId: uid },
    include: { category: true },
  })
}

export async function updateSubscription(
  id: string,
  data: SubscriptionUpdateInput,
  userId?: string
) {
  const uid = userId || DEFAULT_USER_ID

  const updateData: Record<string, unknown> = { ...data }

  if (data.amount !== undefined && data.currency) {
    updateData.amount = toMinorUnits(data.amount, data.currency)
  }

  if (data.billingInterval || data.billingEvery || data.anchorDate) {
    const existing = await db.subscription.findFirst({ where: { id, userId: uid } })
    if (existing) {
      updateData.nextChargeDate = calcNextChargeDate({
        billingInterval: (data.billingInterval || existing.billingInterval) as 'week' | 'month' | 'year' | 'custom',
        billingEvery: data.billingEvery || existing.billingEvery,
        anchorDate: data.anchorDate || existing.anchorDate,
      })
    }
  }

  return db.subscription.update({
    where: { id },
    data: updateData,
    include: { category: true },
  })
}

export async function deleteSubscription(id: string, userId?: string) {
  const uid = userId || DEFAULT_USER_ID

  const sub = await db.subscription.findFirst({ where: { id, userId: uid } })
  if (!sub) return null

  return db.subscription.delete({ where: { id } })
}

export async function archiveSubscription(id: string, userId?: string) {
  return updateSubscription(id, { archived: true }, userId)
}
