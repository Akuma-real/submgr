'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatMoney } from '@/src/shared/money'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ArrowLeft, Check, X } from 'lucide-react'
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

  if (!charge) return <div className="text-center py-10">加载中...</div>

  const chargeStatus = charge.status === 'paid' ? '已付款' : '待付款'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/billing')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{charge.subscription.name}</h1>
        <Badge variant={charge.status === 'paid' ? 'default' : 'secondary'}>
          {chargeStatus}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>扣费信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">扣费日期</span>
            <span>{format(new Date(charge.chargeDate), 'yyyy年M月d日', { locale: zhCN })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">金额</span>
            <span className="font-medium">{formatMoney(charge.amount, charge.currency)}</span>
          </div>
          {charge.status !== 'paid' && (
            <Button onClick={handleMarkPaid} className="w-full mt-4">
              标记为已付款
            </Button>
          )}
        </CardContent>
      </Card>

      {charge.poolPeriods.map((period) => (
        <Card key={period.id}>
          <CardHeader>
            <CardTitle>{period.pool.title} - {period.periodKey}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {period.lines.map((line) => {
                const status = LINE_STATUS[line.status] || LINE_STATUS.pending
                return (
                  <div key={line.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center gap-3">
                      <span>{line.poolMember.displayName}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatMoney(line.amountDue, charge.currency)}
                      </span>
                      {line.status === 'pending' && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleLinePaid(line.id)}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleLineWaived(line.id)}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
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
