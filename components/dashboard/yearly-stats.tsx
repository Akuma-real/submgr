import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/src/shared/money'
import { CalendarDays, Wallet, TrendingDown } from 'lucide-react'

interface YearlyStatsProps {
  totalSpent: number
  totalCharges: number
  avgMonthly: number
  currency: string
}

export function YearlyStats({ totalSpent, totalCharges, avgMonthly, currency }: YearlyStatsProps) {
  const currentYear = new Date().getFullYear()

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          {currentYear}年度统计
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">年度总支出</span>
          </div>
          <span className="text-lg font-bold text-primary">
            {formatMoney(totalSpent, currency)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm">月均支出</span>
          </div>
          <span className="font-medium">
            {formatMoney(avgMonthly, currency)}
          </span>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground text-center">
            共 {totalCharges} 笔扣费记录
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
