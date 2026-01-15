import { db } from '@/src/server/db'
import { getUpcomingCharges } from '@/src/shared/dates'
import { formatMoney, fromMinorUnits } from '@/src/shared/money'
import { convertToBase, BASE_CURRENCY } from '@/src/shared/currency'
import { getMonthlySpending, getYearlyStats } from '@/src/server/services/charge'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { UpcomingCharges } from '@/components/dashboard/upcoming-charges'
import { SpendingChart } from '@/components/dashboard/spending-chart'
import { YearlyStats } from '@/components/dashboard/yearly-stats'
import { ensureDefaultUser } from '@/src/server/services/user'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const userId = await ensureDefaultUser()

  const [subscriptions, monthlySpending, yearlyStats] = await Promise.all([
    db.subscription.findMany({
      where: { userId, archived: false },
      include: { category: true },
    }),
    getMonthlySpending(6),
    getYearlyStats(),
  ])

  const upcoming = getUpcomingCharges(
    subscriptions.map((s) => ({
      ...s,
      nextChargeDate: new Date(s.nextChargeDate),
    })),
    30
  )

  const totalMonthlyBase = subscriptions
    .filter((s) => s.billingInterval === 'month' && s.billingEvery === 1)
    .reduce((sum, s) => {
      const amountInMajor = fromMinorUnits(s.amount, s.currency)
      return sum + convertToBase(amountInMajor, s.currency)
    }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-sm text-muted-foreground">
          欢迎回来，这里是你的订阅概览
        </p>
      </div>

      <StatsCards
        totalSubscriptions={subscriptions.length}
        totalMonthly={formatMoney(Math.round(totalMonthlyBase * 100), BASE_CURRENCY)}
        upcomingCount={upcoming.length}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart data={monthlySpending} />
        <YearlyStats
          totalSpent={yearlyStats.totalSpent}
          totalCharges={yearlyStats.totalCharges}
          avgMonthly={yearlyStats.avgMonthly}
          currency={yearlyStats.currency}
        />
      </div>

      <UpcomingCharges charges={upcoming} />
    </div>
  )
}
