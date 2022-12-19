import * as parser from "mongo-url-parser";

// 获取腾讯云 TCB_ENV_ID
const envId =
  process.env.TCB_ENVID ||
  process.env.TCB_ENV ||
  process.env.APP_PUBLIC_TCB_ENVID;

// 根据 TCB_ENV_ID 转换成本地数据库
const ENV_DB_URL_MAPPING = {
};

// 优先环境变量的 DB_URL, 再 TCB_ENV_ID 转换成本地数据库
const DB_URL = process.env.DB_URL || ENV_DB_URL_MAPPING[envId];

if (!DB_URL) {
  throw new Error("env DB_URL not found");
}

const parsed = parser(DB_URL);

const { dbName: DB_NAME } = parsed;

console.log("\n\n\n");
console.info(`连接本地数据库: ${DB_NAME}`);
console.log("\n\n\n");

export { DB_NAME, DB_URL };
