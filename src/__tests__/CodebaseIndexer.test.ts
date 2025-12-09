/**
 * Tests for CodebaseIndexer
 */

import { CodebaseIndexer } from '../engines/CodebaseIndexer.js';
import { ServerConfig } from '../types.js';
import { MemoryCache } from '../utils/cache.js';
import path from 'path';

describe('CodebaseIndexer', () => {
  let indexer: CodebaseIndexer;
  let config: ServerConfig;
  let cache: MemoryCache;

  beforeEach(() => {
    config = {
      port: 8000,
      logLevel: 'error', // Reduce noise in tests
      foundationRepoPath: path.resolve(__dirname, '../../../'),
      cache: {
        ttl: 3600,
        backend: 'memory',
        maxSize: 1000,
      },
      performance: {
        maxConcurrentOperations: 10,
      },
      security: {
        enableRateLimiting: false,
        rateLimitPerMinute: 60,
      },
    };
    cache = new MemoryCache(1000, 3600);
    indexer = new CodebaseIndexer(config, cache);
  });

  describe('buildIndex', () => {
    it('should build an index with plugins and components', async () => {
      const index = await indexer.buildIndex();

      expect(index).toBeDefined();
      expect(index.plugins).toBeInstanceOf(Array);
      expect(index.components).toBeInstanceOf(Array);
      expect(index.utilities).toBeInstanceOf(Array);
      expect(index.grids).toBeInstanceOf(Array);
    });

    it('should cache the index', async () => {
      const index1 = await indexer.buildIndex();
      const index2 = await indexer.buildIndex();

      // Second call should be from cache
      expect(index2).toEqual(index1);
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate the cached index', async () => {
      await indexer.buildIndex();
      await indexer.invalidateCache();

      const hasCache = await cache.has('foundation:plugins:index');
      expect(hasCache).toBe(false);
    });
  });
});
