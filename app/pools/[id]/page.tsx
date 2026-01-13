'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PoolMembers } from '@/components/pools/pool-members'
import { SplitPreview } from '@/components/pools/split-preview'
import { formatMoney } from '@/src/shared/money'
import { ArrowLeft, Trash2 } from 'lucide-react'
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
    return <div className="text-center py-10">加载中...</div>
  }

  const activeMembers = pool.members.filter((m) => m.active)
  const splitMembers = activeMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    value: m.value,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/pools')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{pool.title}</h1>
          <Badge variant="secondary">
            {SPLIT_TYPE_LABELS[pool.splitType] || pool.splitType}
          </Badge>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>订阅信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">订阅名称</span>
              <span>{pool.subscription.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">金额</span>
              <span className="font-medium">
                {formatMoney(pool.subscription.amount, pool.subscription.currency)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分摊预览</CardTitle>
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
        <CardHeader>
          <CardTitle>成员管理</CardTitle>
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
