import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, TrendingUp, Calendar } from 'lucide-react'

interface StatsCardsProps {
  totalSubscriptions: number
  totalMonthly: string
  upcomingCount: number
}

export function StatsCards({ totalSubscriptions, totalMonthly, upcomingCount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="card-hover overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium">活跃订阅</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold">{totalSubscriptions}</div>
          <p className="text-xs text-muted-foreground mt-1">个订阅服务正在追踪</p>
        </CardContent>
      </Card>

      <Card className="card-hover overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-transparent" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium">月度支出</CardTitle>
          <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold">{totalMonthly}</div>
          <p className="text-xs text-muted-foreground mt-1">按当前汇率折算</p>
        </CardContent>
      </Card>

      <Card className="card-hover overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium">即将扣费</CardTitle>
          <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-chart-3" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold">{upcomingCount}</div>
          <p className="text-xs text-muted-foreground mt-1">未来 30 天内到期</p>
        </CardContent>
      </Card>
    </div>
  )
}
