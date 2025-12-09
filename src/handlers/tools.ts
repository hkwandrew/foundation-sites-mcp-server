/**
 * Tool handlers for Foundation MCP Server
 */

import {
  ServerConfig,
  CacheInterface,
  GeneratePluginInputSchema,
  GenerateComponentInputSchema,
  AnalyzePatternInputSchema,
  FindSimilarPatternInputSchema,
  QueryArchitectureInputSchema,
  RefactorToFoundationInputSchema,
  ValidatePluginInputSchema,
  GeneratePluginSchema,
  GenerateComponentSchema,
  AnalyzePatternSchema,
  FindSimilarPatternSchema,
  QueryArchitectureSchema,
  RefactorToFoundationSchema,
  ValidatePluginSchema,
} from '../types.js';
import { CodebaseIndexer } from '../engines/CodebaseIndexer.js';
import { PluginAnalyzer } from '../engines/PluginAnalyzer.js';
import { RefactoringAnalyzer } from '../engines/RefactoringAnalyzer.js';
import { PluginGenerator } from '../generators/PluginGenerator.js';
import { ComponentGenerator } from '../generators/ComponentGenerator.js';
import { logger } from '../utils/logger.js';

export class ToolHandler {
  private indexer: CodebaseIndexer;
  private pluginAnalyzer: PluginAnalyzer;
  private refactoringAnalyzer: RefactoringAnalyzer;
  private pluginGenerator: PluginGenerator;
  private componentGenerator: ComponentGenerator;

  constructor(
    _config: ServerConfig,
    _cache: CacheInterface,
    indexer: CodebaseIndexer,
    pluginAnalyzer: PluginAnalyzer,
    refactoringAnalyzer: RefactoringAnalyzer,
    pluginGenerator: PluginGenerator,
    componentGenerator: ComponentGenerator
  ) {
    // _config and _cache reserved for future use
    this.indexer = indexer;
    this.pluginAnalyzer = pluginAnalyzer;
    this.refactoringAnalyzer = refactoringAnalyzer;
    this.pluginGenerator = pluginGenerator;
    this.componentGenerator = componentGenerator;
  }

  /**
   * List all available tools
   */
  async listTools() {
    return {
      tools: [
        {
          name: 'generate_plugin',
          description: 'Generate a new Foundation plugin with boilerplate code',
          inputSchema: GeneratePluginInputSchema,
        },
        {
          name: 'generate_component',
          description: 'Generate a new Foundation Sass component',
          inputSchema: GenerateComponentInputSchema,
        },
        {
          name: 'analyze_pattern',
          description: 'Analyze code against Foundation patterns',
          inputSchema: AnalyzePatternInputSchema,
        },
        {
          name: 'find_similar_pattern',
          description: 'Find similar code patterns in the codebase',
          inputSchema: FindSimilarPatternInputSchema,
        },
        {
          name: 'query_architecture',
          description: 'Query Foundation architecture and patterns',
          inputSchema: QueryArchitectureInputSchema,
        },
        {
          name: 'refactor_to_foundation',
          description: 'Analyze code and suggest Foundation refactoring strategy',
          inputSchema: RefactorToFoundationInputSchema,
        },
        {
          name: 'validate_plugin',
          description: 'Validate plugin code against Foundation standards',
          inputSchema: ValidatePluginInputSchema,
        },
        {
          name: 'get_plugin_reference',
          description: 'Get API reference for a specific plugin',
          inputSchema: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                description: 'Plugin slug (e.g., accordion)',
              },
            },
            required: ['slug'],
          },
        },
        {
          name: 'get_component_reference',
          description: 'Get API reference for a specific component',
          inputSchema: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                description: 'Component slug (e.g., button)',
              },
            },
            required: ['slug'],
          },
        },
      ],
    };
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: any) {
    logger.debug('Calling tool', { name, args });

    try {
      switch (name) {
        case 'generate_plugin':
          return await this.handleGeneratePlugin(args);

        case 'generate_component':
          return await this.handleGenerateComponent(args);

        case 'analyze_pattern':
          return await this.handleAnalyzePattern(args);

        case 'find_similar_pattern':
          return await this.handleFindSimilarPattern(args);

        case 'query_architecture':
          return await this.handleQueryArchitecture(args);

        case 'refactor_to_foundation':
          return await this.handleRefactorToFoundation(args);

        case 'validate_plugin':
          return await this.handleValidatePlugin(args);

        case 'get_plugin_reference':
          return await this.handleGetPluginReference(args);

        case 'get_component_reference':
          return await this.handleGetComponentReference(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error('Tool execution failed', error, { name, args });
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle generate_plugin tool
   */
  private async handleGeneratePlugin(args: any) {
    const params = GeneratePluginSchema.parse(args);
    const result = await this.pluginGenerator.generate(params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle generate_component tool
   */
  private async handleGenerateComponent(args: any) {
    const params = GenerateComponentSchema.parse(args);
    const result = await this.componentGenerator.generate(params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle analyze_pattern tool
   */
  private async handleAnalyzePattern(args: any) {
    const params = AnalyzePatternSchema.parse(args);
    const result = await this.pluginAnalyzer.analyzePattern(params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle find_similar_pattern tool
   */
  private async handleFindSimilarPattern(args: any) {
    const params = FindSimilarPatternSchema.parse(args);
    const index = await this.indexer.buildIndex();

    // Simple implementation: search by type and return top matches
    let items: any[] = [];

    if (!params.type || params.type === 'plugin') {
      items = [...items, ...index.plugins];
    }
    if (!params.type || params.type === 'component') {
      items = [...items, ...index.components];
    }

    // Filter by query (basic text matching)
    const query = params.query.toLowerCase();
    const matches = items
      .filter(item => {
        const searchText = `${item.name} ${item.description}`.toLowerCase();
        return searchText.includes(query);
      })
      .slice(0, params.limit)
      .map(item => ({
        name: item.name,
        path: item.path || item.scssPath,
        similarity: 75, // Placeholder
        relevantSnippets: [item.description],
        documentation: item.docs,
      }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ results: matches }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle query_architecture tool
   */
  private async handleQueryArchitecture(args: any) {
    const params = QueryArchitectureSchema.parse(args);

    // Simple implementation: return architecture guide
    const answer = this.getArchitectureAnswer(params.question);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(answer, null, 2),
        },
      ],
    };
  }

  /**
   * Get architecture answer
   */
  private getArchitectureAnswer(question: string) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('keyboard')) {
      return {
        answer: 'Foundation plugins handle keyboard events using the Keyboard utility. Import it and register key handlers.',
        examples: [
          {
            file: 'js/foundation.accordion.js',
            snippet: "Keyboard.register('Accordion', { 'ENTER': 'toggle' });",
          },
        ],
        relatedTopics: ['Accessibility', 'Event Handling'],
      };
    }

    if (lowerQuestion.includes('event')) {
      return {
        answer: 'Foundation plugins use namespaced events with .zf.pluginname format.',
        examples: [
          {
            file: 'js/foundation.reveal.js',
            snippet: "this.$element.trigger('open.zf.reveal');",
          },
        ],
        relatedTopics: ['jQuery Events', 'Plugin Lifecycle'],
      };
    }

    return {
      answer: 'Please refer to the Foundation documentation for detailed architecture guidance.',
      examples: [],
      relatedTopics: ['Plugin Development', 'Component Styling'],
    };
  }

  /**
   * Handle refactor_to_foundation tool
   */
  private async handleRefactorToFoundation(args: any) {
    const params = RefactorToFoundationSchema.parse(args);
    const result = await this.refactoringAnalyzer.analyzeForRefactoring(
      params.sourceCode,
      params.sourceType,
      params.foundationTarget
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle validate_plugin tool
   */
  private async handleValidatePlugin(args: any) {
    const params = ValidatePluginSchema.parse(args);
    const result = await this.pluginAnalyzer.analyzePattern({
      code: params.code,
      patternType: 'plugin',
    });

    const validation = {
      valid: result.matches === 'matches',
      errors: result.issues.filter(i => i.severity === 'error').map(i => i.message),
      warnings: result.issues.filter(i => i.severity === 'warning').map(i => i.message),
      coverage: {
        required_methods: result.conformance.architecture,
        event_handling: result.conformance.conventions,
        accessibility: result.conformance.accessibility,
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(validation, null, 2),
        },
      ],
    };
  }

  /**
   * Handle get_plugin_reference tool
   */
  private async handleGetPluginReference(args: any) {
    const { slug } = args;
    const index = await this.indexer.buildIndex();
    const plugin = index.plugins.find((p: any) => p.slug === slug);
    if (!plugin) {
      throw new Error(`Plugin not found: ${slug}`);
    }

    const reference = {
      name: plugin.name,
      slug: plugin.slug,
      description: plugin.description,
      selector: plugin.selector,
      className: plugin.className,
      documentation: plugin.docs,
      path: plugin.path,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reference, null, 2),
        },
      ],
    };
  }

  /**
   * Handle get_component_reference tool
   */
  private async handleGetComponentReference(args: any) {
    const { slug } = args;
    const index = await this.indexer.buildIndex();
    const component = index.components.find((c: any) => c.slug === slug);

    if (!component) {
      throw new Error(`Component not found: ${slug}`);
    }

    const reference = {
      name: component.name,
      slug: component.slug,
      description: component.description,
      mixins: component.mixins,
      cssClasses: component.cssClasses,
      documentation: component.docs,
      scssPath: component.scssPath,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reference, null, 2),
        },
      ],
    };
  }
}
