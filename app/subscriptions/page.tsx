import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SubscriptionTable } from '@/components/subscriptions/subscription-table'
import { listSubscriptions } from '@/src/server/services/subscription'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage() {
  const subscriptions = await listSubscriptions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">订阅管理</h1>
        <Button asChild>
          <Link href="/subscriptions/new">
            <Plus className="mr-2 h-4 w-4" />
            添加订阅
          </Link>
        </Button>
      </div>
      <SubscriptionTable subscriptions={subscriptions} />
    </div>
  )
}
