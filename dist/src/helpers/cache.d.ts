import NodeCache from "node-cache";
export default class CacheService {
    cache: NodeCache;
    constructor(ttlSeconds: number);
    get(key: any, storeFunction: any, ttl: number): Promise<any>;
    del(keys: any): void;
    delStartWith(startStr?: string): void;
    flush(): void;
}
