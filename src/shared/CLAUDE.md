[根目录](../../CLAUDE.md) > **src/shared**

# src/shared - 共享业务逻辑

## 模块职责

纯业务逻辑层，包含：
- 金额计算与格式化
- 日期处理与周期计算
- 拼车分摊算法
- Zod 校验 schema

**设计原则**: 不依赖 `next/*`、不依赖数据库、不做 IO，保持可复用/可测试。

## 入口与启动

无启动入口，作为纯函数库被其他模块导入使用。

## 对外接口

### 金额处理 (`money.ts`)

```typescript
formatMoney(amount: number, currency: string): string
toMinorUnits(amount: number, currency: string): number
fromMinorUnits(amount: number, currency: string): number
```

支持货币: CNY, JPY, USD, EUR

### 汇率转换 (`currency.ts`)

```typescript
convertToBase(amount: number, currency: string): number
convertFromBase(amount: number, targetCurrency: string): number
getSupportedCurrencies(): string[]
```

基准货币: CNY

### 日期计算 (`dates.ts`)

```typescript
calcNextChargeDate(params: CalcNextChargeParams): Date
getUpcomingCharges<T>(subscriptions: T[], days?: number): T[]
getDaysUntil(date: Date): number
```

支持周期: week, month, year, custom (天数)

### 分摊算法 (`split.ts`)

```typescript
calculateSplit(
  members: SplitMember[],
  totalAmount: number,
  splitType: SplitType,
  options?: SplitOptions
): SplitResult[]
```

分摊类型:
- `equal` - 均摊
- `fixed` - 固定金额
- `ratio` - 按比例
- `seat` - 按席位

选项:
- `seatTotal` - 总席位数（seat 模式）
- `roundingMode` - 取整模式 (minor/floor/ceil)
- `remainderTo` - 余数归属 (owner/first/last)

### Zod Schema (`zod/`)

| 文件 | 导出 |
|-----|-----|
| `subscription.ts` | `subscriptionSchema`, `subscriptionApiSchema`, `subscriptionUpdateSchema` |
| `category.ts` | `categorySchema` |
| `pool.ts` | `poolSchema`, `poolMemberSchema`, `splitTypeEnum`, `roundingModeEnum`, `remainderToEnum` |

## 关键依赖与配置

- `zod` - 运行时类型校验
- `date-fns` - 日期处理

## 常见问题 (FAQ)

**Q: 为什么金额用整数存储？**

A: 避免浮点精度问题。金额以最小单位（分）存储，显示时通过 `fromMinorUnits` 转换。

**Q: 分摊算法如何处理余数？**

A: 通过 `roundingMode` 和 `remainderTo` 控制：
- `minor` 模式按余数大小分配
- `floor` 模式余数全部给 `remainderTo` 指定的成员
- `ceil` 模式向上取整

**Q: 如何添加新的 Zod schema？**

A: 在 `zod/` 目录下创建文件，导出 schema 和类型：

```typescript
import { z } from 'zod'

export const mySchema = z.object({ ... })
export type MyInput = z.infer<typeof mySchema>
```

## 相关文件清单

```
src/shared/
├── money.ts          # 金额格式化与转换
├── currency.ts       # 汇率转换
├── dates.ts          # 日期计算
├── split.ts          # 分摊算法
└── zod/
    ├── subscription.ts  # 订阅 schema
    ├── category.ts      # 分类 schema
    └── pool.ts          # 拼车组 schema
```

## 变更记录 (Changelog)

- **2026-01-13**: 初始化模块文档
