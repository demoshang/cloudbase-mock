import { pathExists, readFile } from "fs-extra";
import * as json5 from "json5";
import { homedir } from "os";
import { resolve } from "path";
import { parse } from "url";

const CONFIG_NAME = "config";
const CONFIG_EXT = ".json5";
const CONFIG_HOME_DIR = resolve(homedir(), ".config/.tcb-mock");

const DEFAULT_DB_URL_ENV_KEY = "DB_URL";

interface Config {
  // db url keys
  urlKeys?: string[];
  // tcb env id keys
  tcbIdKeys?: string[];

  // tcb env id mapping to db url
  mapping?: Record<string, string>;
}

async function getConfigPath() {
  const path = resolve(CONFIG_HOME_DIR, `${CONFIG_NAME}${CONFIG_EXT}`);
  const isExists = await pathExists(path);

  return {
    path,
    isExists,
  };
}

async function getConfig() {
  const { path, isExists } = await getConfigPath();

  if (!isExists) {
    return {
      isExists: false,
      path,
      config: undefined,
    };
  }

  try {
    const content = await readFile(path, { encoding: "utf8" });
    const config = json5.parse<Config>(content);

    return {
      path,
      isExists,
      config,
    };
  } catch (e) {
    console.warn(e);
    return {
      isExists: true,
      path,
      config: undefined,
    };
  }
}

function logUrlNotFound({ urlKeys = [], tcbIdKeys = [] }: Config = {}) {
  const keys = [...urlKeys, ...tcbIdKeys, DEFAULT_DB_URL_ENV_KEY];

  console.log(
    Object.fromEntries(
      keys.map((k) => {
        return [k, process.env[k]];
      })
    )
  );
  console.log();
}

function getValueFromEnv(keys?: string[]): string | undefined {
  if (!keys?.length) {
    return undefined;
  }

  for (const k of keys) {
    if (process.env[k]) {
      return process.env[k];
    }
  }

  return undefined;
}

async function getDBUrl() {
  const { path, config, isExists } = await getConfig();
  console.log("\n\n\n");
  console.info(isExists ? "使用配置文件" : "不存在配置文件", path);
  console.log("");

  const {
    urlKeys = [],
    tcbIdKeys = [],
    mapping = {},
  } = {
    urlKeys: [],
    tcbIdKeys: [],
    mapping: {},
    ...config,
  };

  const url = getValueFromEnv(
    config?.urlKeys?.length ? urlKeys : [DEFAULT_DB_URL_ENV_KEY]
  );
  if (url) {
    return url;
  }

  const tcbId = getValueFromEnv(tcbIdKeys);

  if (tcbId && mapping[tcbId]) {
    return mapping[tcbId] as string;
  }

  logUrlNotFound(config);
  throw new Error("env DB_URL not found");
}

async function getDBConfig() {
  const url = await getDBUrl();
  const { pathname } = parse(url, true);

  const dbName = pathname.split("/").pop();

  console.info(`连接本地数据库: ${dbName}`);
  console.info(url);
  console.log("\n\n\n");

  return {
    url,
    name: dbName as string,
  };
}

const promise = getDBConfig();

async function main() {
  return promise;
}

export { main as getDBConfig };
