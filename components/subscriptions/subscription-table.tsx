'use client'

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
import { formatMoney } from '@/src/shared/money'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Pencil, Trash2, Archive } from 'lucide-react'
import { toast } from 'sonner'

interface Subscription {
  id: string
  name: string
  provider?: string | null
  amount: number
  currency: string
  billingInterval: string
  billingEvery: number
  nextChargeDate: Date
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

export function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  const router = useRouter()

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
      <div className="text-center py-8 text-muted-foreground">
        暂无订阅，
        <Link href="/subscriptions/new" className="text-primary underline">
          添加一个
        </Link>
      </div>
    )
  }

  return (
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
        {subscriptions.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell>
              <div>
                <span className="font-medium">{sub.name}</span>
                {sub.provider && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({sub.provider})
                  </span>
                )}
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
            <TableCell>{formatMoney(sub.amount, sub.currency)}</TableCell>
            <TableCell>
              每{sub.billingEvery > 1 ? sub.billingEvery : ''}
              {intervalLabels[sub.billingInterval] || sub.billingInterval}
            </TableCell>
            <TableCell>
              {format(new Date(sub.nextChargeDate), 'M月d日', { locale: zhCN })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
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
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
