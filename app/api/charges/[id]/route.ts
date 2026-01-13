import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getCharge, markChargePaid, markLinePaid, markLineWaived } from '@/src/server/services/charge'
import { apiHandler, jsonError, jsonOk, readJsonWithSchema } from '@/src/server/http'

const updateChargeSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('markPaid') }),
  z.object({ action: z.literal('markLinePaid'), lineId: z.string().min(1) }),
  z.object({
    action: z.literal('markLineWaived'),
    lineId: z.string().min(1),
    note: z.string().optional(),
  }),
])

export const GET = apiHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  const { id } = await params
  const charge = await getCharge(id)
  if (!charge) {
    return jsonError(404, 'Charge not found')
  }
  return jsonOk(charge)
})

export const PATCH = apiHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  const { id } = await params
  const parsed = await readJsonWithSchema(req, updateChargeSchema)
  if (!parsed.ok) return parsed.response

  if (parsed.data.action === 'markPaid') {
    const charge = await markChargePaid(id)
    return jsonOk(charge)
  }

  if (parsed.data.action === 'markLinePaid') {
    const line = await markLinePaid(parsed.data.lineId)
    return jsonOk(line)
  }

  if (parsed.data.action === 'markLineWaived') {
    const line = await markLineWaived(parsed.data.lineId, parsed.data.note)
    return jsonOk(line)
  }

  return jsonError(400, 'Invalid action')
})
