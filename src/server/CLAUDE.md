[根目录](../../CLAUDE.md) > **src/server**

# src/server - 服务层

## 模块职责

服务层负责所有服务端业务逻辑，包括：
- 数据库操作（通过 Prisma）
- API 请求处理工具
- 定时任务

## 入口与启动

- `db.ts` - Prisma 客户端单例，使用 better-sqlite3 适配器
- `http.ts` - API Route 工具函数

## 对外接口

### HTTP 工具 (`http.ts`)

```typescript
// 统一 JSON 解析 + Zod 校验
readJsonWithSchema(req, schema)

// 统一异常处理包装器
apiHandler(handler)

// 响应工具
jsonOk(data, init?)
jsonError(status, error)
```

### 服务函数

| 服务文件 | 主要函数 |
|---------|---------|
| `services/subscription.ts` | `createSubscription`, `listSubscriptions`, `updateSubscription`, `deleteSubscription` |
| `services/category.ts` | `createCategory`, `listCategories`, `updateCategory`, `deleteCategory` |
| `services/pool.ts` | `createPool`, `listPools`, `getPool`, `addPoolMember`, `removePoolMember` |
| `services/charge.ts` | `createCharge`, `listCharges`, `markChargePaid`, `markLinePaid` |
| `services/user.ts` | `ensureDefaultUser` (MVP 阶段默认用户) |
| `services/notify.ts` | `sendWebhook`, `notifyUpcomingCharges` |

### 定时任务

| 任务文件 | 说明 |
|---------|-----|
| `tasks/daily.ts` | 每日扣费任务，检查到期订阅并生成 Charge 记录 |

## 关键依赖与配置

- `@prisma/client` - 数据库 ORM
- `@prisma/adapter-better-sqlite3` - SQLite 适配器
- 数据库文件路径: `./data/submgr.db`

## 数据模型

服务层直接操作 Prisma 模型：

- `User` - 用户
- `Category` - 分类
- `Subscription` - 订阅
- `Pool` / `PoolMember` - 拼车组/成员
- `SubscriptionCharge` - 扣费记录
- `PoolPeriod` / `PoolLine` - 账期/分摊明细

## 常见问题 (FAQ)

**Q: 如何添加新的服务函数？**

A: 在 `services/` 目录下对应文件中添加，导入 `db` 进行数据库操作。

**Q: API 路由如何使用服务层？**

A: 在 API 路由中导入服务函数，使用 `apiHandler` 包装处理器：

```typescript
import { apiHandler, jsonOk } from '@/src/server/http'
import { listSubscriptions } from '@/src/server/services/subscription'

export const GET = apiHandler(async () => {
  const data = await listSubscriptions()
  return jsonOk(data)
})
```

## 相关文件清单

```
src/server/
├── db.ts                    # Prisma 客户端
├── http.ts                  # API 工具函数
├── services/
│   ├── subscription.ts      # 订阅服务
│   ├── category.ts          # 分类服务
│   ├── pool.ts              # 拼车组服务
│   ├── charge.ts            # 扣费服务
│   ├── user.ts              # 用户服务
│   └── notify.ts            # 通知服务
└── tasks/
    └── daily.ts             # 每日定时任务
```

## 变更记录 (Changelog)

- **2026-01-13**: 初始化模块文档
