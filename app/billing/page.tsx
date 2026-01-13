import Link from 'next/link'
import { listCharges } from '@/src/server/services/charge'
import { formatMoney } from '@/src/shared/money'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Receipt } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: '待付款', variant: 'secondary' },
  paid: { label: '已付款', variant: 'default' },
}

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const charges = await listCharges()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">账期管理</h1>

      {charges.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">暂无扣费记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {charges.map((charge) => {
            const status = STATUS_MAP[charge.status] || STATUS_MAP.pending
            return (
              <Link key={charge.id} href={`/billing/${charge.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{charge.subscription.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(charge.chargeDate, 'yyyy年M月d日', { locale: zhCN })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {formatMoney(charge.amount, charge.currency)}
                        </span>
                        <Badge variant={status.variant}>{status.label}</Badge>
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
