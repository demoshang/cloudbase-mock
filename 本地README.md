# `@cloudbase/node-sdk` 的 `database` 链接本地 mongodb

## 用到的项目

1. `packages/database-ql`
1. `packages/database-proxy`
1. `packages/cloudbase-mock`

### 如何使用

1. `pnpm run build && pnpm run link`
1. 在需要使用的项目中
    1. `yarn link @s4p/database-mock`
    1. 添加环境变量 `DB_URL=mongodb://[username]:[password]@[host]:[port]/[dbName]?authSource=[authName]`