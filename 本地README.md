# `@cloudbase/node-sdk` 的 `database` 链接本地 mongodb

## 用到的项目

1. `packages/database-ql`
1. `packages/database-proxy`
1. `packages/cloudbase-mock`

### 如何使用

1. 新建配置文件 `~/.config/.tcb-mock/config.json5`

    ```json5
    {
        // 从前往后匹配, 如果存在 process.env[urlKey], 使用该值为 db url
        // 如果 urlKeys 为 undefined, 会赋默认值 DB_URL, 即 urlKeys=['DB_URL']
        urlKeys: [],
        // 从前往后匹配, 如果存在 process.env[tcbIdKey], 使用该值为 tcbId
        tcbIdKeys: ["TCB_ENV_ID", "TCB_ENV"],
        // 使用 mapping[tcbId] 为 db url
        mapping: {
            "tcbId": "mongodb://[username]:[password]@[host]:[port]/[dbName]?authSource=[authName]",
        },
    }
    ```

    > `db url` 依次从 `urlKeys` `tcbIdKeys` 中从前往后匹配

1. 构建并link, `pnpm run build && pnpm run link`
1. 在需要使用的项目中
    1. `yarn link @s4p/database-mock`
    1. 使用 `@s4p/database-mock` 替换原来的 `getDatabase()` `getCloudApp()`
