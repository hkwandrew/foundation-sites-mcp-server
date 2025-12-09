/**
 * Codebase indexer for Foundation repository
 */

import path from 'path';
import {
  FoundationIndex,
  FoundationPlugin,
  FoundationComponent,
  FoundationUtility,
  FoundationGrid,
  ServerConfig,
  CacheInterface,
} from '../types.js';
import { findFiles, readFile, joinPath } from '../utils/fileSystem.js';
import { parsePlugin, parseComponent, extractJSDoc, extractSassDoc } from '../utils/parser.js';
import { CacheKeys } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

export class CodebaseIndexer {
  private config: ServerConfig;
  private cache: CacheInterface;

  constructor(config: ServerConfig, cache: CacheInterface) {
    this.config = config;
    this.cache = cache;
  }

  /**
   * Build complete index of Foundation codebase
   */
  async buildIndex(): Promise<FoundationIndex> {
    logger.info('Building Foundation codebase index...');

    const cached = await this.cache.get<FoundationIndex>(CacheKeys.pluginIndex());
    if (cached) {
      logger.debug('Returning cached index');
      return cached;
    }

    const [plugins, components, utilities, grids] = await Promise.all([
      this.indexPlugins(),
      this.indexComponents(),
      this.indexUtilities(),
      this.indexGrids(),
    ]);

    const index: FoundationIndex = {
      plugins,
      components,
      utilities,
      grids,
    };

    await this.cache.set(CacheKeys.pluginIndex(), index);
    logger.info(`Index built: ${plugins.length} plugins, ${components.length} components`);

    return index;
  }

  /**
   * Index all plugins
   */
  private async indexPlugins(): Promise<FoundationPlugin[]> {
    const jsDir = joinPath(this.config.foundationRepoPath, 'js');
    const pluginFiles = await findFiles(jsDir, 'foundation.*.js');

    const plugins: FoundationPlugin[] = [];

    for (const file of pluginFiles) {
      // Skip utility files and core files
      if (
        file.includes('foundation.util.') ||
        file.includes('foundation.core.') ||
        file.includes('foundation.js')
      ) {
        continue;
      }

      try {
        const plugin = await this.parsePluginFile(file);
        if (plugin) {
          plugins.push(plugin);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to parse plugin file: ${file}`, { error: errorMessage });
      }
    }

    return plugins;
  }

  /**
   * Parse individual plugin file
   */
  private async parsePluginFile(filePath: string): Promise<FoundationPlugin | null> {
    const content = await readFile(filePath);
    const parsed = await parsePlugin(content);

    if (!parsed.className) {
      return null;
    }

    const filename = path.basename(filePath, '.js');
    const slug = filename.replace('foundation.', '');
    const docs = extractJSDoc(content);

    // Extract selector from code
    const selectorMatch = content.match(/\[data-([a-z-]+)\]/);
    const selector = selectorMatch ? `[data-${selectorMatch[1]}]` : `[data-${slug}]`;

    // Check if supports nesting
    const supportsNesting = content.includes('nested') || content.includes('Nest');

    return {
      name: parsed.className,
      slug,
      type: 'plugin',
      path: path.relative(this.config.foundationRepoPath, filePath),
      description: docs[parsed.className] || `${parsed.className} plugin`,
      className: parsed.className,
      selector,
      supportsNesting,
      deprecatedInVersion: null,
      docs: `https://get.foundation/sites/docs/${slug}.html`,
    };
  }

  /**
   * Index all components
   */
  private async indexComponents(): Promise<FoundationComponent[]> {
    const scssDir = joinPath(this.config.foundationRepoPath, 'scss/components');
    const componentFiles = await findFiles(scssDir, '*.scss');

    const components: FoundationComponent[] = [];

    for (const file of componentFiles) {
      try {
        const component = await this.parseComponentFile(file);
        if (component) {
          components.push(component);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to parse component file: ${file}`, { error: errorMessage });
      }
    }

    return components;
  }

  /**
   * Parse individual component file
   */
  private async parseComponentFile(filePath: string): Promise<FoundationComponent | null> {
    const content = await readFile(filePath);
    const parsed = await parseComponent(content);

    const filename = path.basename(filePath, '.scss');
    // Remove leading underscore for slug
    const slug = filename.startsWith('_') ? filename.slice(1) : filename;
    const docs = extractSassDoc(content);

    const name = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      name,
      slug,
      type: 'component',
      scssPath: path.relative(this.config.foundationRepoPath, filePath),
      description: docs[slug] || `${name} component`,
      mixins: parsed.mixins.map((m: any) => m.name),
      cssClasses: parsed.classes,
      docs: `https://get.foundation/sites/docs/${slug}.html`,
    };
  }

  /**
   * Index all utilities
   */
  private async indexUtilities(): Promise<FoundationUtility[]> {
    const jsDir = joinPath(this.config.foundationRepoPath, 'js');
    const utilityFiles = await findFiles(jsDir, 'foundation.util.*.js');

    const utilities: FoundationUtility[] = [];

    for (const file of utilityFiles) {
      try {
        const utility = await this.parseUtilityFile(file);
        if (utility) {
          utilities.push(utility);
        }
      } catch (error) {
        logger.warn(`Failed to parse utility file: ${file}`, error);
      }
    }

    return utilities;
  }

  /**
   * Parse individual utility file
   */
  private async parseUtilityFile(filePath: string): Promise<FoundationUtility | null> {
    const content = await readFile(filePath);
    const parsed = await parsePlugin(content);

    const filename = path.basename(filePath, '.js');
    const slug = filename.replace('foundation.util.', '');
    const docs = extractJSDoc(content);

    const name = slug
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, c => c.toUpperCase());

    return {
      name,
      slug,
      path: path.relative(this.config.foundationRepoPath, filePath),
      description: docs[parsed.className] || `${name} utility`,
      exports: parsed.exports,
    };
  }

  /**
   * Index grid systems
   */
  private async indexGrids(): Promise<FoundationGrid[]> {
    const grids: FoundationGrid[] = [
      {
        name: 'XY Grid',
        slug: 'xy-grid',
        type: 'grid-system',
        scssPath: 'scss/xy-grid/',
        description: 'Modern CSS Grid and Flexbox-based layout system',
      },
      {
        name: 'Float Grid',
        slug: 'float-grid',
        type: 'grid-system',
        scssPath: 'scss/grid/',
        description: 'Classic float-based grid system',
      },
    ];

    return grids;
  }

  /**
   * Invalidate cache
   */
  async invalidateCache(): Promise<void> {
    await this.cache.delete(CacheKeys.pluginIndex());
    await this.cache.delete(CacheKeys.componentIndex());
    logger.info('Index cache invalidated');
  }
}
