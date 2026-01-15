'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PoolForm } from '@/components/pools/pool-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { ArrowLeft, Users } from 'lucide-react'
import type { PoolInput } from '@/src/shared/zod/pool'

interface Subscription {
  id: string
  name: string
}

export default function NewPoolPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/subscriptions')
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(data)
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (data: PoolInput) => {
    const res = await fetch('/api/pools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      const pool = await res.json()
      toast.success('拼车组已创建')
      router.push(`/pools/${pool.id}`)
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
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/pools')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">新建拼车组</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">拼车组信息</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>请先创建订阅，然后再创建拼车组</p>
              <Button
                variant="link"
                onClick={() => router.push('/subscriptions/new')}
              >
                创建订阅
              </Button>
            </div>
          ) : (
            <PoolForm
              subscriptions={subscriptions}
              onSubmit={handleSubmit}
              submitLabel="创建拼车组"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
