import { z } from 'zod'

export const splitTypeEnum = z.enum(['equal', 'fixed', 'ratio', 'seat'])
export type SplitType = z.infer<typeof splitTypeEnum>

export const roundingModeEnum = z.enum(['minor', 'floor', 'ceil'])
export type RoundingMode = z.infer<typeof roundingModeEnum>

export const remainderToEnum = z.enum(['owner', 'first', 'last'])
export type RemainderTo = z.infer<typeof remainderToEnum>

export const poolMemberSchema = z.object({
  displayName: z.string().min(1, '成员名称不能为空').max(50),
  contact: z.string().max(100).optional(),
  value: z.number().int().nonnegative().optional(),
  active: z.boolean().default(true),
})

export type PoolMemberInput = z.infer<typeof poolMemberSchema>

export const poolSchema = z.object({
  subscriptionId: z.string().min(1),
  title: z.string().min(1, '拼车组名称不能为空').max(100),
  splitType: splitTypeEnum,
  seatTotal: z.number().int().positive().optional(),
  roundingMode: roundingModeEnum,
  remainderTo: remainderToEnum,
})

export type PoolInput = z.infer<typeof poolSchema>

export const poolUpdateSchema = poolSchema.partial().omit({ subscriptionId: true }).extend({
  active: z.boolean().optional(),
})

export type PoolUpdateInput = z.infer<typeof poolUpdateSchema>
