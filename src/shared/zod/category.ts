import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, '名称不能为空').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式无效').optional(),
  sortOrder: z.number().int().default(0),
})

export type CategoryInput = z.infer<typeof categorySchema>
