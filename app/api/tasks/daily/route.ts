import type { NextRequest } from 'next/server'
import { runDailyTask } from '@/src/server/tasks/daily'
import { apiHandler, jsonError, jsonOk } from '@/src/server/http'

export const POST = apiHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization')
  const taskSecret = process.env.TASK_SECRET

  if (taskSecret && authHeader !== `Bearer ${taskSecret}`) {
    return jsonError(401, 'Unauthorized')
  }

  const result = await runDailyTask()
  return jsonOk(result)
})
