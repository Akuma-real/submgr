import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { poolMemberSchema } from '@/src/shared/zod/pool'
import { addPoolMember, updatePoolMember, removePoolMember } from '@/src/server/services/pool'
import { apiHandler, jsonOk, readJsonWithSchema } from '@/src/server/http'

const memberUpdateSchema = poolMemberSchema.partial().extend({
  memberId: z.string().min(1),
})

const memberDeleteSchema = z.object({
  memberId: z.string().min(1),
})

export const POST = apiHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  const { id: poolId } = await params
  const parsed = await readJsonWithSchema(req, poolMemberSchema)
  if (!parsed.ok) return parsed.response

  const member = await addPoolMember(poolId, parsed.data)
  return jsonOk(member, { status: 201 })
})

export const PATCH = apiHandler(async (req: NextRequest) => {
  const parsed = await readJsonWithSchema(req, memberUpdateSchema)
  if (!parsed.ok) return parsed.response

  const { memberId, ...data } = parsed.data
  const member = await updatePoolMember(memberId, data)
  return jsonOk(member)
})

export const DELETE = apiHandler(async (req: NextRequest) => {
  const parsed = await readJsonWithSchema(req, memberDeleteSchema)
  if (!parsed.ok) return parsed.response

  await removePoolMember(parsed.data.memberId)
  return jsonOk({ success: true })
})
