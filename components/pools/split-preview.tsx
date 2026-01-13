'use client'

import { calculateSplit, type SplitMember } from '@/src/shared/split'
import { formatMoney } from '@/src/shared/money'
import type { RemainderTo, RoundingMode, SplitType } from '@/src/shared/zod/pool'

interface SplitPreviewProps {
  members: SplitMember[]
  totalAmount: number
  currency: string
  splitType: SplitType
  seatTotal?: number | null
  roundingMode?: RoundingMode
  remainderTo?: RemainderTo
}

export function SplitPreview({
  members,
  totalAmount,
  currency,
  splitType,
  seatTotal,
  roundingMode,
  remainderTo,
}: SplitPreviewProps) {
  if (members.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4">
        添加成员后可预览分摊
      </p>
    )
  }

  const results = calculateSplit(members, totalAmount, splitType, {
    seatTotal,
    roundingMode,
    remainderTo,
  })

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground mb-2">
        总金额: {formatMoney(totalAmount, currency)}
      </div>
      {results.map((r) => (
        <div
          key={r.memberId}
          className="flex items-center justify-between rounded-md bg-muted/50 p-3"
        >
          <span>{r.displayName}</span>
          <span className="font-medium">{formatMoney(r.amount, currency)}</span>
        </div>
      ))}
    </div>
  )
}
