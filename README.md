# SubMgr

基于 Next.js + Prisma + SQLite 的订阅管理系统，支持拼车/合租分摊、账期记录与定时任务。

更多实现细节与里程碑见：`PLAN.md`。
项目分层约定见：`docs/architecture.md`。

## 开发

```bash
pnpm dev
```

打开 `http://localhost:3000`。

## 构建

```bash
pnpm build
pnpm start
```

说明：`build` 默认使用 `webpack`（`next build --webpack`），便于在受限环境/CI 中稳定构建。

## 数据库

默认 SQLite 路径：`./data/submgr.db`。

## 定时任务

项目提供每日任务 API：`POST /api/tasks/daily`，可用 `cron/systemd timer` 触发：

```bash
curl -X POST http://localhost:3000/api/tasks/daily \
  -H "Authorization: Bearer $TASK_SECRET"
```
