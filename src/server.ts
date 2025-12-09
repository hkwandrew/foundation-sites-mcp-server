/**
 * MCP Server for Foundation Sites
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { ServerConfig, CacheInterface } from './types.js';
import { createCache } from './utils/cache.js';
import { logger } from './utils/logger.js';
import { CodebaseIndexer } from './engines/CodebaseIndexer.js';
import { PluginAnalyzer } from './engines/PluginAnalyzer.js';
import { RefactoringAnalyzer } from './engines/RefactoringAnalyzer.js';
import { PluginGenerator } from './generators/PluginGenerator.js';
import { ComponentGenerator } from './generators/ComponentGenerator.js';
import { ResourceHandler } from './handlers/resources.js';
import { ToolHandler } from './handlers/tools.js';

export class FoundationMCPServer {
  private server: Server;
  private config: ServerConfig;
  private cache: CacheInterface;
  private indexer: CodebaseIndexer;
  private pluginAnalyzer: PluginAnalyzer;
  private refactoringAnalyzer: RefactoringAnalyzer;
  private pluginGenerator: PluginGenerator;
  private componentGenerator: ComponentGenerator;
  private resourceHandler: ResourceHandler;
  private toolHandler: ToolHandler;

  constructor(config: ServerConfig) {
    this.config = config;
    this.cache = createCache(config);

    // Initialize engines and generators
    this.indexer = new CodebaseIndexer(config, this.cache);
    this.pluginAnalyzer = new PluginAnalyzer();
    this.refactoringAnalyzer = new RefactoringAnalyzer(config, this.cache, this.indexer);
    this.pluginGenerator = new PluginGenerator();
    this.componentGenerator = new ComponentGenerator();

    // Initialize handlers
    this.resourceHandler = new ResourceHandler(this.indexer);
    this.toolHandler = new ToolHandler(
      config,
      this.cache,
      this.indexer,
      this.pluginAnalyzer,
      this.refactoringAnalyzer,
      this.pluginGenerator,
      this.componentGenerator
    );

    // Initialize MCP Server
    this.server = new Server(
      {
        name: 'foundation-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.debug('Handling ListResources request');
      return this.resourceHandler.listResources();
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      logger.debug('Handling ReadResource request', { uri: request.params.uri });
      return this.resourceHandler.readResource(request.params.uri);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Handling ListTools request');
      return this.toolHandler.listTools();
    });

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      logger.debug('Handling CallTool request', { name: request.params.name });
      return this.toolHandler.callTool(
        request.params.name,
        request.params.arguments || {}
      );
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    logger.info('Starting Foundation MCP Server...', {
      repoPath: this.config.foundationRepoPath,
      cacheBackend: this.config.cache.backend,
    });

    // Build initial index
    try {
      await this.indexer.buildIndex();
      logger.info('Initial index built successfully');
    } catch (error) {
      logger.error('Failed to build initial index', error);
      throw error;
    }

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('Foundation MCP Server started successfully');
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    logger.info('Stopping Foundation MCP Server...');
    await this.server.close();
    logger.info('Foundation MCP Server stopped');
  }
}
