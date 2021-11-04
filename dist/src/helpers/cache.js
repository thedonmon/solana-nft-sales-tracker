"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cache_1 = __importDefault(require("node-cache"));
class CacheService {
    cache;
    constructor(ttlSeconds) {
        this.cache = new node_cache_1.default({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
    }
    async get(key, storeFunction, ttl) {
        const value = this.cache.get(key);
        if (value) {
            return Promise.resolve(value);
        }
        return storeFunction().then((result) => {
            this.cache.set(key, result, ttl);
            return result;
        });
    }
    del(keys) {
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
exports.default = CacheService;
//# sourceMappingURL=cache.js.map