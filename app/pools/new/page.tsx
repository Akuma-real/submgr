'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PoolForm } from '@/components/pools/pool-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { PoolInput } from '@/src/shared/zod/pool'

interface Subscription {
  id: string
  name: string
}

export default function NewPoolPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    fetch('/api/subscriptions')
      .then((res) => res.json())
      .then(setSubscriptions)
  }, [])

  const handleSubmit = async (data: PoolInput) => {
    const res = await fetch('/api/pools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      toast.error('创建失败')
      return
    }

    const pool = await res.json()
    toast.success('拼车组已创建')
    router.push(`/pools/${pool.id}`)
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>新建拼车组</CardTitle>
        </CardHeader>
        <CardContent>
          <PoolForm subscriptions={subscriptions} onSubmit={handleSubmit} submitLabel="创建" />
        </CardContent>
      </Card>
    </div>
  )
}
