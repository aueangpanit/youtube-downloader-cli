export declare const appRoot: string;
export declare const sleep: (ms: number) => Promise<unknown>;
export declare const retry: (fn: () => void, count?: number, maxCount?: number, sleepInterval?: number) => Promise<void>;
