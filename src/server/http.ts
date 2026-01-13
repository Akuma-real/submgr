import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import type { z } from 'zod'

export function jsonError(status: number, error: unknown) {
  return NextResponse.json({ error }, { status })
}

export function jsonOk(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, init)
}

export async function readJsonBody(req: NextRequest): Promise<
  | { ok: true; data: unknown }
  | { ok: false; response: Response }
> {
  try {
    const data = await req.json()
    return { ok: true, data }
  } catch {
    return { ok: false, response: jsonError(400, 'Invalid JSON') }
  }
}

export async function readJsonWithSchema<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  const body = await readJsonBody(req)
  if (!body.ok) return body

  const parsed = schema.safeParse(body.data)
  if (!parsed.success) {
    return { ok: false, response: jsonError(400, parsed.error.flatten()) }
  }

  return { ok: true, data: parsed.data }
}

export function apiHandler<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response> | Response
) {
  return async (...args: TArgs): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (err) {
      console.error(err)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return jsonError(404, 'Not found')
      }
      const message =
        process.env.NODE_ENV === 'development'
          ? err instanceof Error
            ? err.message
            : String(err)
          : 'Internal Server Error'
      return jsonError(500, message)
    }
  }
}

