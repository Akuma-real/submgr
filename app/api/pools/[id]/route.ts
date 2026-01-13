import type { NextRequest } from 'next/server'
import { poolUpdateSchema } from '@/src/shared/zod/pool'
import { getPool, updatePool, deletePool } from '@/src/server/services/pool'
import { apiHandler, jsonError, jsonOk, readJsonWithSchema } from '@/src/server/http'

export const GET = apiHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  const { id } = await params
  const pool = await getPool(id)
  if (!pool) {
    return jsonError(404, 'Pool not found')
  }
  return jsonOk(pool)
})

export const PATCH = apiHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  const { id } = await params
  const parsed = await readJsonWithSchema(req, poolUpdateSchema)
  if (!parsed.ok) return parsed.response

  const pool = await updatePool(id, parsed.data)
  return jsonOk(pool)
})

export const DELETE = apiHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  const { id } = await params
  await deletePool(id)
  return jsonOk({ success: true })
})
