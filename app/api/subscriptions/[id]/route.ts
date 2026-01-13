import { NextRequest, NextResponse } from 'next/server'
import { subscriptionUpdateSchema } from '@/src/shared/zod/subscription'
import {
  getSubscription,
  updateSubscription,
  deleteSubscription,
} from '@/src/server/services/subscription'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const subscription = await getSubscription(id)

  if (!subscription) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(subscription)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const parsed = subscriptionUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const subscription = await updateSubscription(id, parsed.data)

  if (!subscription) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(subscription)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const result = await deleteSubscription(id)

  if (!result) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
