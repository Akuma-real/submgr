'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

interface Category {
  id: string
  name: string
  color?: string | null
}

interface SubscriptionFiltersProps {
  categories: Category[]
  search: string
  categoryId: string
  sortBy: string
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortChange: (value: string) => void
}

export function SubscriptionFilters({
  categories,
  search,
  categoryId,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: SubscriptionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索订阅名称或服务商..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            <SelectItem value="none">未分类</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  {cat.color && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nextCharge">按扣费日期</SelectItem>
            <SelectItem value="name">按名称</SelectItem>
            <SelectItem value="amount">按金额</SelectItem>
            <SelectItem value="created">按创建时间</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
