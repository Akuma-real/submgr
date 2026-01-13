'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { toast } from 'sonner'
import { useEffect, useState, use } from 'react'
import { fromMinorUnits } from '@/src/shared/money'
import type { SubscriptionInput } from '@/src/shared/zod/subscription'

interface Category {
  id: string
  name: string
  color?: string | null
}

interface Subscription {
  id: string
  name: string
  provider?: string | null
  categoryId?: string | null
  amount: number
  currency: string
  billingInterval: string
  billingEvery: number
  anchorDate: string
  isShareable: boolean
  notes?: string | null
}

export default function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch(`/api/subscriptions/${id}`).then((res) => res.json()),
    ]).then(([cats, sub]) => {
      setCategories(cats)
      setSubscription(sub)
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (data: SubscriptionInput) => {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      toast.success('订阅已更新')
      router.push('/subscriptions')
      router.refresh()
    } else {
      const err = await res.json()
      toast.error(err.error?.formErrors?.[0] || '更新失败')
    }
  }

  if (loading) {
    return <div>加载中...</div>
  }

  if (!subscription) {
    return <div>订阅不存在</div>
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>编辑订阅</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm
            categories={categories}
            defaultValues={{
              name: subscription.name,
              provider: subscription.provider || '',
              categoryId: subscription.categoryId,
              amount: fromMinorUnits(subscription.amount, subscription.currency),
              currency: subscription.currency,
              billingInterval: subscription.billingInterval as 'week' | 'month' | 'year' | 'custom',
              billingEvery: subscription.billingEvery,
              anchorDate: new Date(subscription.anchorDate),
              isShareable: subscription.isShareable,
              notes: subscription.notes || '',
            }}
            onSubmit={handleSubmit}
            submitLabel="保存修改"
          />
        </CardContent>
      </Card>
    </div>
  )
}
