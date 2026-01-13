import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createCharge, listCharges } from '@/src/server/services/charge'
import { apiHandler, jsonError, jsonOk, readJsonWithSchema } from '@/src/server/http'

const createChargeSchema = z.object({
  subscriptionId: z.string().min(1),
  chargeDate: z.coerce.date(),
})

export const GET = apiHandler(async (req: NextRequest) => {
  const subscriptionId = req.nextUrl.searchParams.get('subscriptionId') || undefined
  const charges = await listCharges(subscriptionId)
  return jsonOk(charges)
})

export const POST = apiHandler(async (req: NextRequest) => {
  const parsed = await readJsonWithSchema(req, createChargeSchema)
  if (!parsed.ok) return parsed.response

  const charge = await createCharge(parsed.data.subscriptionId, parsed.data.chargeDate)
  if (!charge) {
    return jsonError(404, 'Subscription not found')
  }

  return jsonOk(charge, { status: 201 })
})
