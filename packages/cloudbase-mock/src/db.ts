import { ActionType, getAction, MongoAccessor, Params } from "database-proxy";
import { DB_NAME, DB_URL } from "./config";

async function init() {
  const accessor = new MongoAccessor(DB_NAME, DB_URL, {
    directConnection: true,
  });

  await accessor.init();

  return accessor;
}

const getAccessor = (() => {
  let timer = null;
  let accessorPromise: Promise<MongoAccessor> | undefined = undefined;

  function delayClose(ms = 1 * 1000) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      if (!accessorPromise) {
        return;
      }

      let tmp = accessorPromise;
      accessorPromise = undefined;

      tmp
        .then((accessor) => {
          return accessor.close();
        })
        .catch((e) => {
          console.warn(e);
        });
    }, ms);
  }

  return async () => {
    if (!accessorPromise) {
      accessorPromise = init();
    }

    const accessor = await accessorPromise;
    return {
      accessor,
      delayClose,
    };
  };
})();

function parseParams(reqParams: any): Params {
  const { action: actionType, collectionName: collection } = reqParams;

  let params: Params = { action: actionType, collection };
  let action = getAction(actionType);
  if (!action) {
    throw new Error(`unknown action: ${actionType}`);
  }

  // copy the params
  action.fields.forEach((field) => {
    if (reqParams[field]) {
      params[field] = reqParams[field];
    }
  });

  // 批量添加
  if (actionType === ActionType.ADD && Array.isArray(params.data)) {
    params.multi = true;
  }

  return params;
}

async function execute(body: any) {
  // 去除 undefined
  const inputData = JSON.parse(JSON.stringify(body));
  const params = parseParams(inputData);

  const { accessor, delayClose } = await getAccessor();

  const data = await accessor.execute(params);

  delayClose();

  return data;
}

export { execute };
