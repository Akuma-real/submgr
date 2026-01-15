import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/src/shared/money'
import { getDaysUntil } from '@/src/shared/dates'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { CalendarClock, ChevronRight } from 'lucide-react'

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
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            即将扣费
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-6">
            未来 30 天内没有扣费计划 🎉
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            即将扣费
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/subscriptions">
              查看全部
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {charges.slice(0, 5).map((charge) => {
            const daysUntil = getDaysUntil(charge.nextChargeDate)
            const isUrgent = daysUntil <= 3
            
            return (
              <div
                key={charge.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isUrgent ? 'bg-destructive/10' : 'bg-primary/10'
                }`}>
                  <span className={`text-sm font-bold ${
                    isUrgent ? 'text-destructive' : 'text-primary'
                  }`}>
                    {daysUntil}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{charge.name}</span>
                    {charge.category && (
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0"
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
                    {daysUntil === 0 && <span className="text-destructive ml-1">今天</span>}
                    {daysUntil === 1 && <span className="text-chart-3 ml-1">明天</span>}
                  </p>
                </div>
                
                <div className="text-right shrink-0">
                  <span className="font-bold">
                    {formatMoney(charge.amount, charge.currency)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        
        {charges.length > 5 && (
          <div className="mt-4 pt-3 border-t text-center">
            <Button variant="link" size="sm" asChild>
              <Link href="/subscriptions">
                还有 {charges.length - 5} 个即将到期
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
