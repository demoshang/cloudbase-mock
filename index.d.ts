import { Database } from "@cloudbase/node-sdk";
import { getCloudApp } from "./cloud-app";
import { getAccessor } from "./db";
declare function getDatabase(): Database.Db;
declare function generateDocId(): any;
export { generateDocId, getAccessor, getCloudApp, getDatabase };
