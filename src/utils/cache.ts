/**
 * Cache implementation for Foundation MCP Server
 */

import { LRUCache } from 'lru-cache';
import { Redis } from 'ioredis';
import { CacheInterface, ServerConfig } from '../types.js';

/**
 * In-memory cache implementation using LRU
 */
export class MemoryCache implements CacheInterface {
  private cache: LRUCache<string, any>;

  constructor(maxSize: number = 1000, ttl: number = 3600) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: ttl * 1000, // Convert to milliseconds
      updateAgeOnGet: true,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    return value !== undefined ? (value as T) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl) {
      this.cache.set(key, value, { ttl: ttl * 1000 });
    } else {
      this.cache.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}

/**
 * Redis cache implementation
 */
export class RedisCache implements CacheInterface {
  private client: Redis;
  private defaultTTL: number;

  constructor(redisUrl: string, defaultTTL: number = 3600) {
    this.client = new Redis(redisUrl) as Redis;
    this.defaultTTL = defaultTTL;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const expiry = ttl || this.defaultTTL;
    await this.client.setex(key, expiry, serialized);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

/**
 * Create cache instance based on configuration
 */
export function createCache(config: ServerConfig): CacheInterface {
  if (config.cache.backend === 'redis') {
    if (!config.cache.redisUrl) {
      throw new Error('Redis URL is required for redis cache backend');
    }
    return new RedisCache(config.cache.redisUrl, config.cache.ttl);
  }

  return new MemoryCache(config.cache.maxSize, config.cache.ttl);
}

/**
 * Cache key generator helpers
 */
export const CacheKeys = {
  pluginIndex: () => 'foundation:plugins:index',
  plugin: (slug: string) => `foundation:plugin:${slug}`,
  componentIndex: () => 'foundation:components:index',
  component: (slug: string) => `foundation:component:${slug}`,
  buildConfig: () => 'foundation:build:config',
  architecture: (type: string) => `foundation:architecture:${type}`,
  docs: (slug: string) => `foundation:docs:${slug}`,
  fileContent: (path: string) => `foundation:file:${path}`,
  parsedPlugin: (path: string) => `foundation:parsed:plugin:${path}`,
  parsedComponent: (path: string) => `foundation:parsed:component:${path}`,
};
