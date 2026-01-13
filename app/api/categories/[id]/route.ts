import type { NextRequest } from 'next/server'
import { categorySchema } from '@/src/shared/zod/category'
import { getCategory, updateCategory, deleteCategory } from '@/src/server/services/category'
import { apiHandler, jsonError, jsonOk, readJsonWithSchema } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export const GET = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const { id } = await params
  const category = await getCategory(id)

  if (!category) {
    return jsonError(404, 'Not found')
  }

  return jsonOk(category)
})

export const PUT = apiHandler(async (req: NextRequest, { params }: Params) => {
  const { id } = await params
  const parsed = await readJsonWithSchema(req, categorySchema.partial())
  if (!parsed.ok) return parsed.response

  const category = await updateCategory(id, parsed.data)

  if (!category) {
    return jsonError(404, 'Not found')
  }

  return jsonOk(category)
})

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const { id } = await params
  const result = await deleteCategory(id)

  if (!result) {
    return jsonError(404, 'Not found')
  }

  return jsonOk({ success: true })
})
