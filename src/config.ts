/**
 * Configuration management for Foundation MCP Server
 */

import { config as loadEnv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ServerConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
loadEnv();

/**
 * Get configuration from environment variables
 */
export function getConfig(): ServerConfig {
  const foundationRepoPath = process.env.FOUNDATION_REPO_PATH || 
    path.resolve(__dirname, '../../');

  return {
    port: parseInt(process.env.MCP_PORT || '8000', 10),
    logLevel: (process.env.MCP_LOG_LEVEL as any) || 'info',
    foundationRepoPath,
    cache: {
      ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
      backend: (process.env.CACHE_BACKEND as 'memory' | 'redis') || 'memory',
      maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
      redisUrl: process.env.REDIS_URL,
    },
    performance: {
      maxConcurrentOperations: parseInt(
        process.env.MAX_CONCURRENT_OPERATIONS || '10',
        10
      ),
    },
    security: {
      enableRateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
      rateLimitPerMinute: parseInt(
        process.env.RATE_LIMIT_PER_MINUTE || '60',
        10
      ),
    },
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: ServerConfig): void {
  if (!config.foundationRepoPath) {
    throw new Error('FOUNDATION_REPO_PATH is required');
  }

  if (config.cache.backend === 'redis' && !config.cache.redisUrl) {
    throw new Error('REDIS_URL is required when using redis cache backend');
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error('MCP_PORT must be between 1 and 65535');
  }
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: ServerConfig = {
  port: 8000,
  logLevel: 'info',
  foundationRepoPath: path.resolve(__dirname, '../../'),
  cache: {
    ttl: 3600,
    backend: 'memory',
    maxSize: 1000,
  },
  performance: {
    maxConcurrentOperations: 10,
  },
  security: {
    enableRateLimiting: true,
    rateLimitPerMinute: 60,
  },
};
