import { db } from '../db'
import type { CategoryInput } from '@/src/shared/zod/category'

const DEFAULT_USER_ID = 'default_user'

export async function createCategory(data: CategoryInput, userId?: string) {
  const uid = userId || DEFAULT_USER_ID

  return db.category.create({
    data: {
      userId: uid,
      name: data.name,
      color: data.color,
      sortOrder: data.sortOrder,
    },
  })
}

export async function listCategories(userId?: string) {
  const uid = userId || DEFAULT_USER_ID

  return db.category.findMany({
    where: { userId: uid },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getCategory(id: string, userId?: string) {
  const uid = userId || DEFAULT_USER_ID

  return db.category.findFirst({
    where: { id, userId: uid },
  })
}

export async function updateCategory(id: string, data: Partial<CategoryInput>, userId?: string) {
  const uid = userId || DEFAULT_USER_ID

  const cat = await db.category.findFirst({ where: { id, userId: uid } })
  if (!cat) return null

  return db.category.update({
    where: { id },
    data,
  })
}

export async function deleteCategory(id: string, userId?: string) {
  const uid = userId || DEFAULT_USER_ID

  const cat = await db.category.findFirst({ where: { id, userId: uid } })
  if (!cat) return null

  await db.subscription.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  })

  return db.category.delete({ where: { id } })
}
