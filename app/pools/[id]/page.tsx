'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { PoolMembers } from '@/components/pools/pool-members'
import { SplitPreview } from '@/components/pools/split-preview'
import { formatMoney } from '@/src/shared/money'
import { ArrowLeft, Trash2, Users, CreditCard, Pencil, Settings } from 'lucide-react'
import { toast } from 'sonner'
import type { RemainderTo, RoundingMode, SplitType } from '@/src/shared/zod/pool'
import useSWR from 'swr'

interface PoolMember {
  id: string
  displayName: string
  contact?: string | null
  value?: number | null
  active: boolean
}

interface Pool {
  id: string
  title: string
  splitType: string
  seatTotal?: number | null
  roundingMode: RoundingMode
  remainderTo: RemainderTo
  subscription: {
    id: string
    name: string
    amount: number
    currency: string
  }
  members: PoolMember[]
}

const SPLIT_TYPE_LABELS: Record<string, string> = {
  equal: '平均分摊',
  fixed: '固定金额',
  ratio: '按比例',
  seat: '按席位',
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: pool, mutate } = useSWR<Pool>(`/api/pools/${id}`, fetcher)
  
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editSplitType, setEditSplitType] = useState<SplitType>('equal')
  const [editSeatTotal, setEditSeatTotal] = useState<string>('')
  const [editRoundingMode, setEditRoundingMode] = useState<RoundingMode>('minor')
  const [editRemainderTo, setEditRemainderTo] = useState<RemainderTo>('owner')
  const [saving, setSaving] = useState(false)

  const handleDelete = async () => {
    if (!confirm('确定要删除这个拼车组吗？')) return
    await fetch(`/api/pools/${id}`, { method: 'DELETE' })
    toast.success('拼车组已删除')
    router.push('/pools')
  }

  const openEditDialog = () => {
    if (pool) {
      setEditTitle(pool.title)
      setEditSplitType(pool.splitType as SplitType)
      setEditSeatTotal(pool.seatTotal?.toString() || '')
      setEditRoundingMode(pool.roundingMode)
      setEditRemainderTo(pool.remainderTo)
      setEditOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/pools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          splitType: editSplitType,
          seatTotal: editSeatTotal ? parseInt(editSeatTotal) : null,
          roundingMode: editRoundingMode,
          remainderTo: editRemainderTo,
        }),
      })

      if (res.ok) {
        toast.success('拼车组已更新')
        setEditOpen(false)
        mutate()
      } else {
        toast.error('更新失败')
      }
    } catch {
      toast.error('更新失败')
    } finally {
      setSaving(false)
    }
  }

  if (!pool) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  const activeMembers = pool.members.filter((m) => m.active)
  const splitMembers = activeMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    value: m.value,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/pools')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{pool.title}</h1>
              <Badge variant="secondary" className="mt-1">
                {SPLIT_TYPE_LABELS[pool.splitType] || pool.splitType}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={openEditDialog}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑设置
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  编辑拼车组设置
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">拼车组名称</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Netflix 家庭组"
                  />
                </div>

                <div className="space-y-2">
                  <Label>分摊方式</Label>
                  <Select
                    value={editSplitType}
                    onValueChange={(v) => setEditSplitType(v as SplitType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal">平均分摊</SelectItem>
                      <SelectItem value="fixed">固定金额</SelectItem>
                      <SelectItem value="ratio">按比例</SelectItem>
                      <SelectItem value="seat">按席位</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editSplitType === 'seat' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-seatTotal">总席位数</Label>
                    <Input
                      id="edit-seatTotal"
                      type="number"
                      min="1"
                      value={editSeatTotal}
                      onChange={(e) => setEditSeatTotal(e.target.value)}
                      placeholder="留空则按实际成员数"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>舍入方式</Label>
                    <Select
                      value={editRoundingMode}
                      onValueChange={(v) => setEditRoundingMode(v as RoundingMode)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">按最小单位分配</SelectItem>
                        <SelectItem value="floor">向下取整</SelectItem>
                        <SelectItem value="ceil">向上取整</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>余数归属</Label>
                    <Select
                      value={editRemainderTo}
                      onValueChange={(v) => setEditRemainderTo(v as RemainderTo)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">主账号</SelectItem>
                        <SelectItem value="first">第一位成员</SelectItem>
                        <SelectItem value="last">最后一位成员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveEdit}
                    disabled={saving || !editTitle.trim()}
                  >
                    {saving ? '保存中...' : '保存修改'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              订阅信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{pool.subscription.name}</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {formatMoney(pool.subscription.amount, pool.subscription.currency)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">分摊预览</CardTitle>
          </CardHeader>
          <CardContent>
            <SplitPreview
              members={splitMembers}
              totalAmount={pool.subscription.amount}
              currency={pool.subscription.currency}
              splitType={pool.splitType as SplitType}
              seatTotal={pool.seatTotal}
              roundingMode={pool.roundingMode}
              remainderTo={pool.remainderTo}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            成员管理
            <Badge variant="secondary" className="ml-2">
              {activeMembers.length} 人
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PoolMembers
            poolId={pool.id}
            members={pool.members}
            splitType={pool.splitType}
            currency={pool.subscription.currency}
            onUpdate={mutate}
          />
        </CardContent>
      </Card>
    </div>
  )
}
