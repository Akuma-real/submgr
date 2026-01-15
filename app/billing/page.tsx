'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/src/shared/money'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Receipt, ChevronRight, CheckCircle2 } from 'lucide-react'

interface Charge {
  id: string
  chargeDate: string
  amount: number
  currency: string
  status: string
  subscription: {
    id: string
    name: string
  }
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
  pending: { label: '待付款', variant: 'secondary' },
  paid: { label: '已付款', variant: 'default' },
}

export default function BillingPage() {
  const [charges, setCharges] = useState<Charge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/charges')
      .then((res) => res.json())
      .then((data) => {
        setCharges(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const pendingCount = charges.filter((c) => c.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">账期管理</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0 
              ? `${pendingCount} 笔待付款`
              : `共 ${charges.length} 笔扣费记录`
            }
          </p>
        </div>
      </div>

      {charges.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="暂无扣费记录"
          description="当订阅到期扣费时，记录会自动出现在这里"
        />
      ) : (
        <div className="space-y-3">
          {charges.map((charge) => {
            const status = STATUS_MAP[charge.status] || STATUS_MAP.pending
            const isPaid = charge.status === 'paid'
            
            return (
              <Link key={charge.id} href={`/billing/${charge.id}`}>
                <Card className="hover:bg-muted/50 transition-all duration-200 cursor-pointer card-hover">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isPaid ? 'bg-chart-2/10' : 'bg-chart-3/10'
                      }`}>
                        {isPaid ? (
                          <CheckCircle2 className="h-5 w-5 text-chart-2" />
                        ) : (
                          <Receipt className="h-5 w-5 text-chart-3" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{charge.subscription.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(charge.chargeDate), 'yyyy年M月d日 EEEE', { locale: zhCN })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                          {formatMoney(charge.amount, charge.currency)}
                        </span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
