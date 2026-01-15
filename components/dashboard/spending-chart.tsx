'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/src/shared/money'

interface MonthlyData {
  month: string
  amount: number
  currency: string
}

interface SpendingChartProps {
  data: MonthlyData[]
  title?: string
}

export function SpendingChart({ data, title = '月度支出趋势' }: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">
            暂无支出数据
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxAmount = Math.max(...data.map(d => d.amount), 1)
  const currency = data[0]?.currency || 'CNY'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.amount / maxAmount) * 100
            return (
              <div key={item.month} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.month}</span>
                  <span className="font-medium">{formatMoney(item.amount, currency)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: `oklch(0.55 0.15 ${180 + index * 15})`,
                      transitionDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
