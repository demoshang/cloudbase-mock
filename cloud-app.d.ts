/// <reference types="node" />
declare function callFunction({ name, data, }: {
    name: string;
    data?: {
        body?: string;
        path?: string;
        httpMethod?: "GET" | "POST" | "PUT" | "DELETE";
        headers?: object;
    };
}): Promise<{
    result: any;
}>;
declare function uploadFile({ cloudPath, fileContent, }: {
    cloudPath: string;
    fileContent: Buffer;
}): Promise<{
    fileID: string;
}>;
declare function getCloudApp(): {
    callFunction: typeof callFunction;
    uploadFile: typeof uploadFile;
};
export { callFunction, getCloudApp, uploadFile };
