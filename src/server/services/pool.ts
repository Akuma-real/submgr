import { db } from '../db'
import type { PoolInput, PoolUpdateInput, PoolMemberInput } from '@/src/shared/zod/pool'

export async function createPool(data: PoolInput) {
  return db.pool.create({
    data: {
      subscriptionId: data.subscriptionId,
      title: data.title,
      splitType: data.splitType,
      seatTotal: data.seatTotal,
      roundingMode: data.roundingMode,
      remainderTo: data.remainderTo,
    },
    include: { subscription: true, members: true },
  })
}

export async function listPools(subscriptionId?: string) {
  return db.pool.findMany({
    where: subscriptionId ? { subscriptionId } : undefined,
    include: {
      subscription: { select: { id: true, name: true, amount: true, currency: true } },
      members: { where: { active: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPool(id: string) {
  return db.pool.findUnique({
    where: { id },
    include: {
      subscription: true,
      members: { orderBy: { id: 'asc' } },
      periods: {
        include: { lines: { include: { poolMember: true } } },
        orderBy: { generatedAt: 'desc' },
        take: 10,
      },
    },
  })
}

export async function updatePool(id: string, data: PoolUpdateInput) {
  return db.pool.update({
    where: { id },
    data,
    include: { subscription: true, members: true },
  })
}

export async function deletePool(id: string) {
  return db.pool.delete({ where: { id } })
}

export async function addPoolMember(poolId: string, data: PoolMemberInput) {
  return db.poolMember.create({
    data: { poolId, ...data },
  })
}

export async function updatePoolMember(id: string, data: Partial<PoolMemberInput>) {
  return db.poolMember.update({
    where: { id },
    data,
  })
}

export async function removePoolMember(id: string) {
  return db.poolMember.update({
    where: { id },
    data: { active: false },
  })
}
