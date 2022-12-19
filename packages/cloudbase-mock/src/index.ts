import { CloudBase, Database } from "@cloudbase/node-sdk";
import { Db, RequestInterface } from "database-ql";
import { execute } from "./db";

type RequestParams = Parameters<RequestInterface["send"]>;
type ActionType = RequestParams[0];
type QueryParam = RequestParams[1];

function getDatabase() {
  const db = new Db({
    request: {
      async send(action: ActionType, data: QueryParam) {
        const result = await execute({
          action,
          ...data,
        });

        return { code: 0, error: "", requestId: "requestId", data: result };
      },
    },
  });

  return db as unknown as Database.Db;
}

function getCloudApp(): CloudBase {
  throw new Error("not support mock");
}

export { getDatabase, getCloudApp };
