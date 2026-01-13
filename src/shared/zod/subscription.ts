import { z } from 'zod'

export const subscriptionSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100),
  provider: z.string().max(100).optional(),
  categoryId: z.string().optional().nullable(),
  amount: z.number().positive('金额必须大于0'),
  currency: z.string(),
  billingInterval: z.enum(['week', 'month', 'year', 'custom']),
  billingEvery: z.number().int().positive(),
  anchorDate: z.date(),
  isShareable: z.boolean(),
  notes: z.string().max(1000).optional(),
})

export type SubscriptionInput = z.infer<typeof subscriptionSchema>

export const subscriptionUpdateSchema = subscriptionSchema.partial().extend({
  archived: z.boolean().optional(),
})

export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>

// API 用的 schema，支持字符串日期
export const subscriptionApiSchema = subscriptionSchema.extend({
  anchorDate: z.coerce.date(),
})
