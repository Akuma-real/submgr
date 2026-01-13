import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatMoney } from '@/src/shared/money'
import { getDaysUntil } from '@/src/shared/dates'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Charge {
  id: string
  name: string
  amount: number
  currency: string
  nextChargeDate: Date
  category?: { name: string; color?: string | null } | null
}

interface UpcomingChargesProps {
  charges: Charge[]
}

export function UpcomingCharges({ charges }: UpcomingChargesProps) {
  if (charges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>即将扣费</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">未来 30 天内没有扣费计划</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>即将扣费</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {charges.map((charge) => {
            const daysUntil = getDaysUntil(charge.nextChargeDate)
            return (
              <div
                key={charge.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{charge.name}</span>
                    {charge.category && (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: charge.category.color || undefined,
                          color: charge.category.color || undefined,
                        }}
                      >
                        {charge.category.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(charge.nextChargeDate, 'M月d日 EEEE', { locale: zhCN })}
                    {daysUntil === 0 && ' (今天)'}
                    {daysUntil === 1 && ' (明天)'}
                    {daysUntil > 1 && ` (${daysUntil}天后)`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold">
                    {formatMoney(charge.amount, charge.currency)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
