'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { ArrowLeft, CreditCard } from 'lucide-react'
import type { SubscriptionInput } from '@/src/shared/zod/subscription'

interface Category {
  id: string
  name: string
  color?: string | null
}

export default function NewSubscriptionPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (data: SubscriptionInput) => {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      toast.success('订阅已创建')
      router.push('/subscriptions')
      router.refresh()
    } else {
      const err = await res.json()
      toast.error(err.error?.formErrors?.[0] || '创建失败')
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
          <h1 className="text-2xl font-bold">添加订阅</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">订阅信息</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm
            categories={categories}
            onSubmit={handleSubmit}
            submitLabel="创建订阅"
          />
        </CardContent>
      </Card>
    </div>
  )
}
