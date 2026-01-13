import { NextRequest, NextResponse } from 'next/server'
import { categorySchema } from '@/src/shared/zod/category'
import { createCategory, listCategories } from '@/src/server/services/category'

export async function GET() {
  const categories = await listCategories()
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = categorySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const category = await createCategory(parsed.data)
  return NextResponse.json(category, { status: 201 })
}
