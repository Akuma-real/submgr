import Link from 'next/link'
import { listPools } from '@/src/server/services/pool'
import { formatMoney } from '@/src/shared/money'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users } from 'lucide-react'

const SPLIT_TYPE_LABELS: Record<string, string> = {
  equal: '平均分摊',
  fixed: '固定金额',
  ratio: '按比例',
  seat: '按席位',
}

export const dynamic = 'force-dynamic'

export default async function PoolsPage() {
  const pools = await listPools()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">拼车管理</h1>
        <Button asChild>
          <Link href="/pools/new">
            <Plus className="mr-2 h-4 w-4" />
            新建拼车组
          </Link>
        </Button>
      </div>

      {pools.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">暂无拼车组</p>
            <Button asChild className="mt-4">
              <Link href="/pools/new">创建第一个拼车组</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <Link key={pool.id} href={`/pools/${pool.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">订阅</span>
                      <span>{pool.subscription.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">金额</span>
                      <span>
                        {formatMoney(pool.subscription.amount, pool.subscription.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">分摊方式</span>
                      <Badge variant="secondary">
                        {SPLIT_TYPE_LABELS[pool.splitType] || pool.splitType}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">成员</span>
                      <span>{pool.members.length} 人</span>
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
