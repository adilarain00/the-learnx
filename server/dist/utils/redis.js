"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
require("colors");
const ioredis_1 = __importDefault(require("ioredis"));
const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log("Redis URL found, initializing Redis client...".white.bold);
        return process.env.REDIS_URL;
    }
    else {
        console.error("Redis URL not found in environment variables.".red.bold);
        throw new Error("Redis URL is required to connect to Redis.");
    }
};
exports.redis = new ioredis_1.default(redisClient());
//# sourceMappingURL=redis.js.map