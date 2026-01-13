import type { NextRequest } from 'next/server'
import { subscriptionUpdateSchema } from '@/src/shared/zod/subscription'
import {
  getSubscription,
  updateSubscription,
  deleteSubscription,
} from '@/src/server/services/subscription'
import { apiHandler, jsonError, jsonOk, readJsonWithSchema } from '@/src/server/http'

type Params = { params: Promise<{ id: string }> }

export const GET = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const { id } = await params
  const subscription = await getSubscription(id)

  if (!subscription) {
    return jsonError(404, 'Not found')
  }

  return jsonOk(subscription)
})

export const PUT = apiHandler(async (req: NextRequest, { params }: Params) => {
  const { id } = await params
  const parsed = await readJsonWithSchema(req, subscriptionUpdateSchema)
  if (!parsed.ok) return parsed.response

  const subscription = await updateSubscription(id, parsed.data)

  if (!subscription) {
    return jsonError(404, 'Not found')
  }

  return jsonOk(subscription)
})

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const { id } = await params
  const result = await deleteSubscription(id)

  if (!result) {
    return jsonError(404, 'Not found')
  }

  return jsonOk({ success: true })
})
