import type { NextRequest } from 'next/server'
import { subscriptionApiSchema } from '@/src/shared/zod/subscription'
import { createSubscription, listSubscriptions } from '@/src/server/services/subscription'
import { apiHandler, jsonOk, readJsonWithSchema } from '@/src/server/http'

export const GET = apiHandler(async (req: NextRequest) => {
  const includeArchived = req.nextUrl.searchParams.get('archived') === 'true'
  const subscriptions = await listSubscriptions(undefined, includeArchived)
  return jsonOk(subscriptions)
})

export const POST = apiHandler(async (req: NextRequest) => {
  const parsed = await readJsonWithSchema(req, subscriptionApiSchema)
  if (!parsed.ok) return parsed.response

  const subscription = await createSubscription(parsed.data)
  return jsonOk(subscription, { status: 201 })
})
