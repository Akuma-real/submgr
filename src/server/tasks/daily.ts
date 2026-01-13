import { db } from '../db'
import { createCharge } from '../services/charge'
import { calcNextChargeDate } from '@/src/shared/dates'

export interface DailyTaskResult {
  chargesCreated: number
  subscriptionsUpdated: number
  errors: string[]
}

export async function runDailyTask(): Promise<DailyTaskResult> {
  const result: DailyTaskResult = { chargesCreated: 0, subscriptionsUpdated: 0, errors: [] }
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 查找今天或之前需要扣费的订阅
  const subscriptions = await db.subscription.findMany({
    where: {
      archived: false,
      nextChargeDate: { lte: today },
    },
  })

  for (const sub of subscriptions) {
    try {
      // 创建扣费记录
      await createCharge(sub.id, sub.nextChargeDate)
      result.chargesCreated++

      // 更新下次扣费日期
      const nextChargeDate = calcNextChargeDate({
        billingInterval: sub.billingInterval as 'week' | 'month' | 'year' | 'custom',
        billingEvery: sub.billingEvery,
        anchorDate: sub.nextChargeDate,
      })

      await db.subscription.update({
        where: { id: sub.id },
        data: { nextChargeDate },
      })
      result.subscriptionsUpdated++
    } catch (e) {
      result.errors.push(`${sub.name}: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  return result
}
