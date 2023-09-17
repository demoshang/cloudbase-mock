import { MongoAccessor } from "database-proxy";
declare const getAccessor: () => Promise<{
    accessor: MongoAccessor;
    delayClose: (ms?: number) => void;
}>;
declare function execute(body: any): Promise<import("database-proxy").ReadResult | import("database-proxy").UpdateResult | import("database-proxy").AddResult | import("database-proxy").RemoveResult | import("database-proxy").CountResult>;
export { execute, getAccessor };
