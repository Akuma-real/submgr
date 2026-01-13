'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { poolSchema, type PoolInput } from '@/src/shared/zod/pool'

interface Subscription {
  id: string
  name: string
}

interface PoolFormProps {
  subscriptions: Subscription[]
  defaultValues?: Partial<PoolInput>
  onSubmit: (data: PoolInput) => Promise<void>
  submitLabel?: string
}

export function PoolForm({
  subscriptions,
  defaultValues,
  onSubmit,
  submitLabel = '保存',
}: PoolFormProps) {
  const form = useForm<PoolInput>({
    resolver: zodResolver(poolSchema),
    defaultValues: {
      subscriptionId: '',
      title: '',
      splitType: 'equal',
      roundingMode: 'minor',
      remainderTo: 'owner',
      ...defaultValues,
    },
  })

  const splitType = useWatch({ control: form.control, name: 'splitType' })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subscriptionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>关联订阅</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择订阅" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subscriptions.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>拼车组名称</FormLabel>
              <FormControl>
                <Input placeholder="Netflix 家庭组" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="splitType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>分摊方式</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="equal">平均分摊</SelectItem>
                  <SelectItem value="fixed">固定金额</SelectItem>
                  <SelectItem value="ratio">按比例</SelectItem>
                  <SelectItem value="seat">按席位</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {splitType === 'seat' && (
          <FormField
            control={form.control}
            name="seatTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>总席位数</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="roundingMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>舍入方式</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="minor">按最小单位分配</SelectItem>
                    <SelectItem value="floor">向下取整</SelectItem>
                    <SelectItem value="ceil">向上取整</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remainderTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>余数归属</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="owner">主账号（暂同第一位）</SelectItem>
                    <SelectItem value="first">第一位成员</SelectItem>
                    <SelectItem value="last">最后一位成员</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Form>
  )
}
