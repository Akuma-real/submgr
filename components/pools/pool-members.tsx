'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatMoney, toMinorUnits } from '@/src/shared/money'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface PoolMember {
  id: string
  displayName: string
  contact?: string | null
  value?: number | null
  active: boolean
}

interface PoolMembersProps {
  poolId: string
  members: PoolMember[]
  splitType: string
  currency: string
  onUpdate: () => Promise<unknown> | void
}

export function PoolMembers({ poolId, members, splitType, currency, onUpdate }: PoolMembersProps) {
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [loading, setLoading] = useState(false)

  const activeMembers = members.filter((m) => m.active)

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    try {
      const value = (() => {
        if (!newValue) return undefined

        if (splitType === 'fixed') {
          const major = parseFloat(newValue)
          if (!Number.isFinite(major)) return undefined
          return toMinorUnits(major, currency)
        }

        const int = parseInt(newValue)
        if (!Number.isFinite(int)) return undefined
        return int
      })()

      await fetch(`/api/pools/${poolId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: newName.trim(),
          value,
        }),
      })
      setNewName('')
      setNewValue('')
      onUpdate()
      toast.success('成员已添加')
    } catch {
      toast.error('添加失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    try {
      await fetch(`/api/pools/${poolId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      onUpdate()
      toast.success('成员已移除')
    } catch {
      toast.error('移除失败')
    }
  }

  const showValue = splitType !== 'equal'
  const valueLabel = splitType === 'fixed' ? '金额' : splitType === 'ratio' ? '比例' : '席位数'

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="成员名称"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        {showValue && (
          <Input
            type="number"
            placeholder={valueLabel}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-24"
            step={splitType === 'fixed' ? '0.01' : undefined}
            min={splitType === 'fixed' ? '0' : '0'}
          />
        )}
        <Button onClick={handleAdd} disabled={loading || !newName.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {activeMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div className="flex items-center gap-2">
              <span>{member.displayName}</span>
              {showValue && member.value != null && (
                <Badge variant="secondary">
                  {valueLabel}:{' '}
                  {splitType === 'fixed'
                    ? formatMoney(member.value, currency)
                    : member.value}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(member.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {activeMembers.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            暂无成员，请添加
          </p>
        )}
      </div>
    </div>
  )
}
