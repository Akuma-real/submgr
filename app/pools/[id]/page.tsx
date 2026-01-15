'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PoolMembers } from '@/components/pools/pool-members'
import { SplitPreview } from '@/components/pools/split-preview'
import { formatMoney } from '@/src/shared/money'
import { ArrowLeft, Trash2, Users, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import type { RemainderTo, RoundingMode, SplitType } from '@/src/shared/zod/pool'
import useSWR from 'swr'

interface PoolMember {
  id: string
  displayName: string
  contact?: string | null
  value?: number | null
  active: boolean
}

interface Pool {
  id: string
  title: string
  splitType: string
  seatTotal?: number | null
  roundingMode: RoundingMode
  remainderTo: RemainderTo
  subscription: {
    id: string
    name: string
    amount: number
    currency: string
  }
  members: PoolMember[]
}

const SPLIT_TYPE_LABELS: Record<string, string> = {
  equal: '平均分摊',
  fixed: '固定金额',
  ratio: '按比例',
  seat: '按席位',
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: pool, mutate } = useSWR<Pool>(`/api/pools/${id}`, fetcher)

  const handleDelete = async () => {
    if (!confirm('确定要删除这个拼车组吗？')) return
    await fetch(`/api/pools/${id}`, { method: 'DELETE' })
    toast.success('拼车组已删除')
    router.push('/pools')
  }

  if (!pool) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  const activeMembers = pool.members.filter((m) => m.active)
  const splitMembers = activeMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    value: m.value,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/pools')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{pool.title}</h1>
              <Badge variant="secondary" className="mt-1">
                {SPLIT_TYPE_LABELS[pool.splitType] || pool.splitType}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          删除拼车组
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              订阅信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{pool.subscription.name}</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {formatMoney(pool.subscription.amount, pool.subscription.currency)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">分摊预览</CardTitle>
          </CardHeader>
          <CardContent>
            <SplitPreview
              members={splitMembers}
              totalAmount={pool.subscription.amount}
              currency={pool.subscription.currency}
              splitType={pool.splitType as SplitType}
              seatTotal={pool.seatTotal}
              roundingMode={pool.roundingMode}
              remainderTo={pool.remainderTo}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            成员管理
            <Badge variant="secondary" className="ml-2">
              {activeMembers.length} 人
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PoolMembers
            poolId={pool.id}
            members={pool.members}
            splitType={pool.splitType}
            currency={pool.subscription.currency}
            onUpdate={mutate}
          />
        </CardContent>
      </Card>
    </div>
  )
}
