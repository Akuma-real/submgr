export interface NotifyPayload {
  title: string
  body: string
  data?: Record<string, unknown>
}

export async function sendWebhook(payload: NotifyPayload): Promise<boolean> {
  const webhookUrl = process.env.NOTIFY_WEBHOOK_URL
  if (!webhookUrl) return false

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function notifyUpcomingCharges(subscriptions: { name: string; nextChargeDate: Date; amount: number }[]) {
  if (subscriptions.length === 0) return

  const lines = subscriptions.map((s) => `- ${s.name}: ${s.nextChargeDate.toLocaleDateString()}`).join('\n')

  await sendWebhook({
    title: '即将到期的订阅',
    body: `以下订阅即将扣费:\n${lines}`,
    data: { count: subscriptions.length },
  })
}
