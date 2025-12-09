/**
 * TypeScript type definitions for Foundation MCP Server
 */

import { z } from 'zod';

// ============================================================================
// Plugin Types
// ============================================================================

export interface FoundationPlugin {
  name: string;
  slug: string;
  type: 'plugin';
  path: string;
  description: string;
  className: string;
  selector: string;
  supportsNesting: boolean;
  deprecatedInVersion: string | null;
  docs: string;
}

export interface FoundationComponent {
  name: string;
  slug: string;
  type: 'component';
  scssPath: string;
  description: string;
  mixins: string[];
  cssClasses: string[];
  docs: string;
}

export interface FoundationUtility {
  name: string;
  slug: string;
  path: string;
  description: string;
  exports: string[];
}

export interface FoundationGrid {
  name: string;
  slug: string;
  type: 'grid-system';
  scssPath: string;
  description: string;
}

// ============================================================================
// Index Types
// ============================================================================

export interface FoundationIndex {
  plugins: FoundationPlugin[];
  components: FoundationComponent[];
  utilities: FoundationUtility[];
  grids: FoundationGrid[];
}

// ============================================================================
// Tool Parameter Types
// ============================================================================

export const GeneratePluginSchema = z.object({
  name: z.string().min(1).describe('Plugin name (e.g., MyAccordion)'),
  slug: z.string().min(1).describe('Kebab-case slug (e.g., my-accordion)'),
  description: z.string().describe('Plugin description'),
  selector: z.string().optional().describe('CSS selector (default: [data-{slug}])'),
  features: z.object({
    keyboard: z.boolean().default(false).describe('Support keyboard navigation'),
    nesting: z.boolean().default(false).describe('Support nested items'),
    events: z.array(z.string()).default([]).describe('Custom events to fire'),
    stateManagement: z.boolean().default(false).describe('Track active state'),
  }).optional(),
  includeTests: z.boolean().default(true).describe('Generate test file'),
  includeDocs: z.boolean().default(true).describe('Generate documentation'),
});

export type GeneratePluginParams = z.infer<typeof GeneratePluginSchema>;

export const GenerateComponentSchema = z.object({
  name: z.string().min(1).describe('Component name (e.g., Alert)'),
  slug: z.string().min(1).describe('Kebab-case slug'),
  description: z.string().describe('Component description'),
  cssClasses: z.array(z.string()).default([]).describe('CSS classes'),
  variables: z.record(z.object({
    description: z.string(),
    type: z.string().describe('Color, Number, String, etc'),
    defaultValue: z.any(),
  })).optional().describe('Sass variables'),
  includeTests: z.boolean().default(true),
  includeDocs: z.boolean().default(true),
  grid: z.enum(['xy-grid', 'float-grid', 'both']).default('xy-grid'),
});

export type GenerateComponentParams = z.infer<typeof GenerateComponentSchema>;

export const GenerateTestSuiteSchema = z.object({
  type: z.enum(['plugin', 'component', 'utility']).describe('Test target type'),
  target: z.string().describe('Plugin/component slug or utility name'),
  testFramework: z.enum(['jasmine', 'mocha']).default('mocha'),
  coverage: z.object({
    initialization: z.boolean().default(true),
    events: z.boolean().default(true),
    accessibility: z.boolean().default(true),
    destruction: z.boolean().default(true),
    edgeCases: z.boolean().default(true),
  }).optional(),
});

export type GenerateTestSuiteParams = z.infer<typeof GenerateTestSuiteSchema>;

export const AnalyzePatternSchema = z.object({
  code: z.string().describe('Code snippet or file path'),
  patternType: z.enum(['plugin', 'component', 'utility', 'test']),
});

export type AnalyzePatternParams = z.infer<typeof AnalyzePatternSchema>;

export const FindSimilarPatternSchema = z.object({
  query: z.string().describe('Description of pattern to find'),
  type: z.enum(['plugin', 'component', 'utility', 'test']).optional(),
  limit: z.number().min(1).max(20).default(5),
});

export type FindSimilarPatternParams = z.infer<typeof FindSimilarPatternSchema>;

export const QueryArchitectureSchema = z.object({
  question: z.string().describe('Architecture question'),
  context: z.enum(['plugin', 'component', 'build', 'testing']).optional(),
});

export type QueryArchitectureParams = z.infer<typeof QueryArchitectureSchema>;

export const RefactorToFoundationSchema = z.object({
  sourceCode: z.string().describe('Code to refactor'),
  sourceType: z.enum(['custom-plugin', 'custom-component']).describe('Type of code'),
  foundationTarget: z.string().optional().describe('Specific Foundation component to migrate to'),
});

export type RefactorToFoundationParams = z.infer<typeof RefactorToFoundationSchema>;

export const GetDependencyMapSchema = z.object({
  target: z.string().describe('Plugin/component slug or file path'),
  direction: z.enum(['incoming', 'outgoing', 'both']).default('both'),
});

export type GetDependencyMapParams = z.infer<typeof GetDependencyMapSchema>;

export const ValidatePluginSchema = z.object({
  code: z.string().describe('Code or file path'),
  strict: z.boolean().default(false).describe('Enforce all best practices'),
});

export type ValidatePluginParams = z.infer<typeof ValidatePluginSchema>;

export const ValidateComponentScssSchema = z.object({
  code: z.string().describe('SCSS code or file path'),
});

export type ValidateComponentScssParams = z.infer<typeof ValidateComponentScssSchema>;

export const CheckAccessibilitySchema = z.object({
  code: z.string().describe('HTML, CSS, or JS code'),
  standard: z.enum(['wcag21', 'wcag2aa', 'wcag2aaa']).default('wcag2aa'),
});

export type CheckAccessibilityParams = z.infer<typeof CheckAccessibilitySchema>;

// ============================================================================
// JSON Schemas for MCP (Tool Input Schemas)
// ============================================================================
// These are plain JSON objects (not Zod validators) used for MCP tool definitions

export const GeneratePluginInputSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Plugin name (e.g., MyAccordion)' },
    slug: { type: 'string', description: 'Kebab-case slug (e.g., my-accordion)' },
    description: { type: 'string', description: 'Plugin description' },
    selector: { type: 'string', description: 'CSS selector (optional)' },
    features: {
      type: 'object',
      properties: {
        keyboard: { type: 'boolean', description: 'Support keyboard navigation' },
        nesting: { type: 'boolean', description: 'Support nested items' },
        events: { type: 'array', items: { type: 'string' }, description: 'Custom events' },
        stateManagement: { type: 'boolean', description: 'Track active state' },
      },
    },
    includeTests: { type: 'boolean', description: 'Generate test file' },
    includeDocs: { type: 'boolean', description: 'Generate documentation' },
  },
  required: ['name', 'slug', 'description'],
} as const;

export const GenerateComponentInputSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Component name (e.g., Alert)' },
    slug: { type: 'string', description: 'Kebab-case slug' },
    description: { type: 'string', description: 'Component description' },
    cssClasses: { type: 'array', items: { type: 'string' }, description: 'CSS classes' },
    includeTests: { type: 'boolean', description: 'Generate test file' },
    includeDocs: { type: 'boolean', description: 'Generate documentation' },
    grid: { type: 'string', enum: ['xy-grid', 'float-grid', 'both'], description: 'Grid system' },
  },
  required: ['name', 'slug', 'description'],
} as const;

export const AnalyzePatternInputSchema = {
  type: 'object',
  properties: {
    code: { type: 'string', description: 'JavaScript or SCSS code to analyze' },
    patternType: { type: 'string', enum: ['plugin', 'component', 'utility'], description: 'Type of code' },
  },
  required: ['code', 'patternType'],
} as const;

export const FindSimilarPatternInputSchema = {
  type: 'object',
  properties: {
    query: { type: 'string', description: 'Description of pattern to find' },
    type: { type: 'string', enum: ['plugin', 'component', 'utility', 'test'], description: 'Pattern type' },
    limit: { type: 'number', minimum: 1, maximum: 20, description: 'Maximum results' },
  },
  required: ['query'],
} as const;

export const QueryArchitectureInputSchema = {
  type: 'object',
  properties: {
    question: { type: 'string', description: 'Architecture question' },
    context: { type: 'string', enum: ['plugin', 'component', 'build', 'testing'], description: 'Query context' },
  },
  required: ['question'],
} as const;

export const RefactorToFoundationInputSchema = {
  type: 'object',
  properties: {
    sourceCode: { type: 'string', description: 'Code to refactor' },
    sourceType: { type: 'string', enum: ['custom-plugin', 'custom-component'], description: 'Type of code' },
    foundationTarget: { type: 'string', description: 'Specific Foundation component (optional)' },
  },
  required: ['sourceCode', 'sourceType'],
} as const;

export const ValidatePluginInputSchema = {
  type: 'object',
  properties: {
    code: { type: 'string', description: 'Code or file path' },
    strict: { type: 'boolean', description: 'Enforce all best practices' },
  },
  required: ['code'],
} as const;

// ============================================================================
// Result Types
// ============================================================================

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GeneratePluginResult {
  status: 'success' | 'error';
  files: {
    plugin?: GeneratedFile;
    test?: GeneratedFile;
    docs?: GeneratedFile;
  };
  integrationSteps: string[];
  error?: string;
}

export interface GenerateComponentResult {
  status: 'success' | 'error';
  files: {
    component?: GeneratedFile;
    test?: GeneratedFile;
    docs?: GeneratedFile;
  };
  integrationSteps: string[];
  error?: string;
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  suggestion?: string;
}

export interface AnalyzePatternResult {
  matches: 'matches' | 'partial-match' | 'no-match';
  issues: ValidationIssue[];
  conformance: {
    architecture: number;
    conventions: number;
    accessibility: number;
  };
  suggestions: string[];
}

export interface SimilarPatternMatch {
  name: string;
  path: string;
  similarity: number;
  relevantSnippets: string[];
  documentation: string;
}

export interface FindSimilarPatternResult {
  results: SimilarPatternMatch[];
}

export interface ArchitectureExample {
  file: string;
  snippet: string;
}

export interface QueryArchitectureResult {
  answer: string;
  examples: ArchitectureExample[];
  relatedTopics: string[];
}

export interface Dependency {
  type: 'imports' | 'extends' | 'requires' | 'uses';
  target: string;
  path: string;
  critical: boolean;
}

export interface GetDependencyMapResult {
  target: string;
  dependencies: Dependency[];
  dependents: Dependency[];
}

export interface ValidatePluginResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  coverage: {
    required_methods: number;
    event_handling: number;
    accessibility: number;
  };
}

export interface ValidateComponentScssResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface CheckAccessibilityResult {
  valid: boolean;
  issues: ValidationIssue[];
  score: number;
  suggestions: string[];
}

export interface RefactoringAnalysisResult {
  sourceType: 'custom-plugin' | 'custom-component';
  suggestedFoundationComponents: Array<{
    name: string;
    slug: string;
    similarity: number;
    reasoning: string;
  }>;
  migrationSteps: string[];
  codeAdaptation: {
    before: string;
    after: string;
    changes: string[];
  };
  breakingChanges: string[];
  recommendedApproach: string;
  integrationGuide: string[];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface ServerConfig {
  port: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  foundationRepoPath: string;
  cache: {
    ttl: number;
    backend: 'memory' | 'redis';
    maxSize?: number;
    redisUrl?: string;
  };
  performance: {
    maxConcurrentOperations: number;
  };
  security: {
    enableRateLimiting: boolean;
    rateLimitPerMinute: number;
  };
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheInterface {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

// ============================================================================
// Parser Types
// ============================================================================

export interface ParsedPlugin {
  className: string;
  methods: string[];
  properties: string[];
  events: string[];
  extendsClass: string | null;
  imports: string[];
  exports: string[];
}

export interface ParsedComponent {
  variables: Array<{
    name: string;
    defaultValue: string;
    description?: string;
  }>;
  mixins: Array<{
    name: string;
    parameters: string[];
    description?: string;
  }>;
  classes: string[];
}

// ============================================================================
// Build System Types
// ============================================================================

export interface BuildConfig {
  bundler: string;
  transpiler: string;
  cssProcessor: string;
  scriptEntryPoints: Record<string, string>;
  outputFormats: Record<string, string>;
  scssVariablePath: string;
  plugins: string[];
  utilities: string[];
  taskRunners: Record<string, string>;
}

// ============================================================================
// Architecture Types
// ============================================================================

export interface PluginArchitecture {
  baseClass: string;
  baseClassPath: string;
  lifecycle: Record<string, {
    description: string;
    parameters?: string[];
    hooks?: string[];
    responsibilities?: string[];
  }>;
  patterns: Record<string, {
    description: string;
    example: string;
  }>;
  registrationProcess: Record<string, string>;
  requiredMethods: string[];
  optionalPatterns: string[];
}

// ============================================================================
// Resource Types
// ============================================================================

export interface ResourceContent {
  uri: string;
  mimeType: string;
  content: string | object;
}

// ============================================================================
// Error Types
// ============================================================================

export class MCPServerError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MCPServerError';
  }
}

export class ValidationError extends MCPServerError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends MCPServerError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

export class ParseError extends MCPServerError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'PARSE_ERROR', details);
    this.name = 'ParseError';
  }
}
