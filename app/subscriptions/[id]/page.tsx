'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { toast } from 'sonner'
import { useEffect, useState, use } from 'react'
import { fromMinorUnits } from '@/src/shared/money'
import { ArrowLeft, CreditCard } from 'lucide-react'
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
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">订阅不存在</p>
        <Button variant="link" onClick={() => router.push('/subscriptions')}>
          返回订阅列表
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/subscriptions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">编辑订阅</h1>
            <p className="text-sm text-muted-foreground">{subscription.name}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">订阅信息</CardTitle>
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
