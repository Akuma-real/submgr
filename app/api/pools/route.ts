import type { NextRequest } from 'next/server'
import { poolSchema } from '@/src/shared/zod/pool'
import { createPool, listPools } from '@/src/server/services/pool'
import { apiHandler, jsonOk, readJsonWithSchema } from '@/src/server/http'

export const GET = apiHandler(async (req: NextRequest) => {
  const subscriptionId = req.nextUrl.searchParams.get('subscriptionId') || undefined
  const pools = await listPools(subscriptionId)
  return jsonOk(pools)
})

export const POST = apiHandler(async (req: NextRequest) => {
  const parsed = await readJsonWithSchema(req, poolSchema)
  if (!parsed.ok) return parsed.response

  const pool = await createPool(parsed.data)
  return jsonOk(pool, { status: 201 })
})
