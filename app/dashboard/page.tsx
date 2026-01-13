import { db } from '@/src/server/db'
import { getUpcomingCharges } from '@/src/shared/dates'
import { formatMoney, fromMinorUnits } from '@/src/shared/money'
import { convertToBase, BASE_CURRENCY } from '@/src/shared/currency'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { UpcomingCharges } from '@/components/dashboard/upcoming-charges'
import { ensureDefaultUser } from '@/src/server/services/subscription'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const userId = await ensureDefaultUser()

  const subscriptions = await db.subscription.findMany({
    where: { userId, archived: false },
    include: { category: true },
  })

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
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <StatsCards
        totalSubscriptions={subscriptions.length}
        totalMonthly={formatMoney(Math.round(totalMonthlyBase * 100), BASE_CURRENCY)}
        upcomingCount={upcoming.length}
      />
      <UpcomingCharges charges={upcoming} />
    </div>
  )
}
