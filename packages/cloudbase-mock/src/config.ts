const parser = require("mongo-url-parser");

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  throw new Error("env DB_URL not found");
}

const parsed = parser(DB_URL);

const { dbName: DB_NAME } = parsed;

export { DB_NAME, DB_URL };
