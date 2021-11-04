import NodeCache from "node-cache";

export default class CacheService {
    cache: NodeCache; 
    constructor(ttlSeconds: number) {
      this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
    }
  
    async get(key: any, storeFunction: any, ttl: number): Promise<any> {
  
      const value: any = this.cache.get(key);
      if (value) {
        return Promise.resolve(value);
      }
  
      return storeFunction().then((result: any) => {
        this.cache.set(key, result, ttl);
        return result;
      });
    }
  
    del(keys: any) {
      this.cache.del(keys);
    }
  
    delStartWith(startStr = '') {
      if (!startStr) {
        return;
      }
  
      const keys = this.cache.keys();
      for (const key of keys) {
        if (key.indexOf(startStr) === 0) {
          this.del(key);
        }
      }
    }
  
    flush() {
      this.cache.flushAll();
    }
  }