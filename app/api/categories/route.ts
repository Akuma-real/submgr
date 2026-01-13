import type { NextRequest } from 'next/server'
import { categorySchema } from '@/src/shared/zod/category'
import { createCategory, listCategories } from '@/src/server/services/category'
import { apiHandler, jsonOk, readJsonWithSchema } from '@/src/server/http'

export const GET = apiHandler(async () => {
  const categories = await listCategories()
  return jsonOk(categories)
})

export const POST = apiHandler(async (req: NextRequest) => {
  const parsed = await readJsonWithSchema(req, categorySchema)
  if (!parsed.ok) return parsed.response

  const category = await createCategory(parsed.data)
  return jsonOk(category, { status: 201 })
})
