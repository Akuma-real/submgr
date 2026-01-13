'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import type { SubscriptionInput } from '@/src/shared/zod/subscription'

interface Category {
  id: string
  name: string
  color?: string | null
}

export default function NewSubscriptionPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
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

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>添加订阅</CardTitle>
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
