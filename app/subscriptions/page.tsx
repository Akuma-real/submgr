'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SubscriptionTable } from '@/components/subscriptions/subscription-table'
import { SubscriptionFilters } from '@/components/subscriptions/subscription-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, CreditCard } from 'lucide-react'

interface Category {
  id: string
  name: string
  color?: string | null
}

interface Subscription {
  id: string
  name: string
  provider?: string | null
  amount: number
  currency: string
  billingInterval: string
  billingEvery: number
  nextChargeDate: string
  archived: boolean
  createdAt: string
  category?: Category | null
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [sortBy, setSortBy] = useState('nextCharge')

  useEffect(() => {
    Promise.all([
      fetch('/api/subscriptions').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ]).then(([subs, cats]) => {
      setSubscriptions(subs)
      setCategories(cats)
      setLoading(false)
    })
  }, [])

  const filteredSubscriptions = useMemo(() => {
    let result = subscriptions

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchLower) ||
          (sub.provider && sub.provider.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (categoryId === 'none') {
      result = result.filter((sub) => !sub.category)
    } else if (categoryId !== 'all') {
      result = result.filter((sub) => sub.category?.id === categoryId)
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN')
        case 'amount':
          return b.amount - a.amount
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'nextCharge':
        default:
          return new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime()
      }
    })

    return result
  }, [subscriptions, search, categoryId, sortBy])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[130px]" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">订阅管理</h1>
            <p className="text-sm text-muted-foreground">
              共 {subscriptions.length} 个订阅
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/subscriptions/new">
            <Plus className="mr-2 h-4 w-4" />
            添加订阅
          </Link>
        </Button>
      </div>

      <SubscriptionFilters
        categories={categories}
        search={search}
        categoryId={categoryId}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onCategoryChange={setCategoryId}
        onSortChange={setSortBy}
      />

      {filteredSubscriptions.length === 0 && (search || categoryId !== 'all') ? (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>没有找到匹配的订阅</p>
          <Button
            variant="link"
            onClick={() => {
              setSearch('')
              setCategoryId('all')
            }}
          >
            清除筛选条件
          </Button>
        </div>
      ) : (
        <SubscriptionTable subscriptions={filteredSubscriptions} />
      )}
    </div>
  )
}
