'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatMoney } from '@/src/shared/money'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Pencil, Trash2, Archive, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface Subscription {
  id: string
  name: string
  provider?: string | null
  amount: number
  currency: string
  billingInterval: string
  billingEvery: number
  nextChargeDate: string | Date
  archived: boolean
  category?: { id: string; name: string; color?: string | null } | null
}

interface SubscriptionTableProps {
  subscriptions: Subscription[]
}

const intervalLabels: Record<string, string> = {
  week: '周',
  month: '月',
  year: '年',
  custom: '天',
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  const router = useRouter()

  // Compute "now" once on initial render using useState initializer
  const [now] = useState(() => Date.now())

  const handleArchive = async (id: string) => {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    })
    if (res.ok) {
      toast.success('已归档')
      router.refresh()
    } else {
      toast.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个订阅吗？')) return
    const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('已删除')
      router.refresh()
    } else {
      toast.error('删除失败')
    }
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">暂无订阅</p>
          <Button asChild>
            <Link href="/subscriptions/new">添加第一个订阅</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>周期</TableHead>
            <TableHead>下次扣费</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => {
            const nextDate = new Date(sub.nextChargeDate)
            const isUpcoming = nextDate.getTime() - now < SEVEN_DAYS_MS
            
            return (
              <TableRow key={sub.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">{sub.name}</span>
                      {sub.provider && (
                        <span className="text-sm text-muted-foreground block">
                          {sub.provider}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {sub.category ? (
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: sub.category.color || undefined,
                        color: sub.category.color || undefined,
                      }}
                    >
                      {sub.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatMoney(sub.amount, sub.currency)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    每{sub.billingEvery > 1 ? sub.billingEvery : ''}
                    {intervalLabels[sub.billingInterval] || sub.billingInterval}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                    {format(nextDate, 'M月d日', { locale: zhCN })}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/subscriptions/${sub.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    {!sub.archived && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleArchive(sub.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sub.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
