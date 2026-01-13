import { NextRequest, NextResponse } from 'next/server'
import { subscriptionApiSchema } from '@/src/shared/zod/subscription'
import { createSubscription, listSubscriptions } from '@/src/server/services/subscription'

export async function GET(req: NextRequest) {
  const includeArchived = req.nextUrl.searchParams.get('archived') === 'true'
  const subscriptions = await listSubscriptions(undefined, includeArchived)
  return NextResponse.json(subscriptions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = subscriptionApiSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const subscription = await createSubscription(parsed.data)
  return NextResponse.json(subscription, { status: 201 })
}
