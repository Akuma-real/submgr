import { db } from '../db'

export const DEFAULT_USER_ID = 'default_user'
export const DEFAULT_USER_EMAIL = 'default@local'

export async function ensureDefaultUser(): Promise<string> {
  const user = await db.user.findUnique({ where: { id: DEFAULT_USER_ID } })
  if (!user) {
    await db.user.create({
      data: { id: DEFAULT_USER_ID, email: DEFAULT_USER_EMAIL },
    })
  }
  return DEFAULT_USER_ID
}

