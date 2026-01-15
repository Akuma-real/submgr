'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/src/shared/money'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ArrowLeft, Check, X, Receipt, CalendarDays, CheckCircle2, Users } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'

interface PoolLine {
  id: string
  amountDue: number
  status: string
  poolMember: { displayName: string }
}

interface PoolPeriod {
  id: string
  periodKey: string
  pool: { title: string }
  lines: PoolLine[]
}

interface Charge {
  id: string
  chargeDate: string
  amount: number
  currency: string
  status: string
  subscription: { name: string }
  poolPeriods: PoolPeriod[]
}

const LINE_STATUS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: '待收', variant: 'secondary' },
  paid: { label: '已收', variant: 'default' },
  waived: { label: '免除', variant: 'destructive' },
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ChargeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: charge, mutate } = useSWR<Charge>(`/api/charges/${id}`, fetcher)

  const handleMarkPaid = async () => {
    await fetch(`/api/charges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markPaid' }),
    })
    toast.success('已标记为已付款')
    mutate()
  }

  const handleLinePaid = async (lineId: string) => {
    await fetch(`/api/charges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markLinePaid', lineId }),
    })
    toast.success('已标记为已收款')
    mutate()
  }

  const handleLineWaived = async (lineId: string) => {
    await fetch(`/api/charges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markLineWaived', lineId }),
    })
    toast.success('已免除')
    mutate()
  }

  if (!charge) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  const chargeStatus = charge.status === 'paid' ? '已付款' : '待付款'
  const isPaid = charge.status === 'paid'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/billing')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            isPaid ? 'bg-chart-2/10' : 'bg-chart-3/10'
          }`}>
            {isPaid ? (
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
            ) : (
              <Receipt className="h-5 w-5 text-chart-3" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{charge.subscription.name}</h1>
            <Badge variant={isPaid ? 'default' : 'secondary'} className="mt-1">
              {chargeStatus}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            扣费信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">扣费日期</span>
              <span className="font-medium">
                {format(new Date(charge.chargeDate), 'yyyy年M月d日 EEEE', { locale: zhCN })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">金额</span>
              <span className="text-2xl font-bold text-primary">
                {formatMoney(charge.amount, charge.currency)}
              </span>
            </div>
          </div>
          
          {!isPaid && (
            <Button onClick={handleMarkPaid} className="w-full mt-4">
              <Check className="mr-2 h-4 w-4" />
              标记为已付款
            </Button>
          )}
        </CardContent>
      </Card>

      {charge.poolPeriods.map((period) => (
        <Card key={period.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {period.pool.title}
              <Badge variant="outline" className="ml-2">{period.periodKey}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {period.lines.map((line) => {
                const status = LINE_STATUS[line.status] || LINE_STATUS.pending
                return (
                  <div 
                    key={line.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {line.poolMember.displayName.charAt(0)}
                      </div>
                      <span className="font-medium">{line.poolMember.displayName}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between sm:gap-3">
                      <span className="text-lg font-bold">
                        {formatMoney(line.amountDue, charge.currency)}
                      </span>
                      {line.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-chart-2 hover:text-chart-2 hover:bg-chart-2/10"
                            onClick={() => handleLinePaid(line.id)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">已收</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleLineWaived(line.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">免除</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
