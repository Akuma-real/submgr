'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/src/shared/money'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Users } from 'lucide-react'

interface Pool {
  id: string
  title: string
  splitType: string
  subscription: {
    id: string
    name: string
    amount: number
    currency: string
  }
  members: Array<{ id: string; active: boolean }>
}

const SPLIT_TYPE_LABELS: Record<string, string> = {
  equal: '平均分摊',
  fixed: '固定金额',
  ratio: '按比例',
  seat: '按席位',
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pools')
      .then((res) => res.json())
      .then((data) => {
        setPools(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">拼车管理</h1>
            <p className="text-sm text-muted-foreground">
              共 {pools.length} 个拼车组
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/pools/new">
            <Plus className="mr-2 h-4 w-4" />
            新建拼车组
          </Link>
        </Button>
      </div>

      {pools.length === 0 ? (
        <EmptyState
          icon={Users}
          title="暂无拼车组"
          description="创建拼车组来和朋友一起分摊订阅费用，支持多种分摊方式"
          actionLabel="创建第一个拼车组"
          actionHref="/pools/new"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <Link key={pool.id} href={`/pools/${pool.id}`}>
              <Card className="hover:bg-muted/50 transition-all duration-200 cursor-pointer card-hover h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pool.title}</CardTitle>
                    <Badge variant="secondary">
                      {SPLIT_TYPE_LABELS[pool.splitType] || pool.splitType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {pool.subscription.name}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {formatMoney(pool.subscription.amount, pool.subscription.currency)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">成员数量</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                          {pool.members.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-muted border-2 border-background"
                            />
                          ))}
                          {pool.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium">
                              +{pool.members.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{pool.members.length} 人</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
