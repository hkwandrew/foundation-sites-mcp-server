/**
 * Plugin analyzer for pattern matching and validation
 */

import {
  AnalyzePatternParams,
  AnalyzePatternResult,
  ValidationIssue,

} from '../types.js';
import { parsePlugin } from '../utils/parser.js';
import { readFile, fileExists } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';

export class PluginAnalyzer {

  constructor() {

  }

  /**
   * Analyze code pattern
   */
  async analyzePattern(params: AnalyzePatternParams): Promise<AnalyzePatternResult> {
    logger.debug('Analyzing pattern', { type: params.patternType });

    let code = params.code;

    // If it's a file path, read the file
    if (await fileExists(params.code)) {
      code = await readFile(params.code);
    }

    if (params.patternType === 'plugin') {
      return this.analyzePluginPattern(code);
    }

    // For other types, return basic analysis
    return {
      matches: 'no-match',
      issues: [],
      conformance: {
        architecture: 0,
        conventions: 0,
        accessibility: 0,
      },
      suggestions: ['Analysis for this pattern type is not yet implemented'],
    };
  }

  /**
   * Analyze plugin pattern
   */
  private async analyzePluginPattern(code: string): Promise<AnalyzePatternResult> {
    const issues: ValidationIssue[] = [];
    let architectureScore = 0;
    let conventionsScore = 0;
    let accessibilityScore = 0;

    try {
      const parsed = await parsePlugin(code);

      // Check if extends Plugin class
      if (parsed.extendsClass === 'Plugin') {
        architectureScore += 30;
      } else {
        issues.push({
          severity: 'error',
          message: 'Plugin must extend the Plugin base class',
          suggestion: 'export class YourPlugin extends Plugin { ... }',
        });
      }

      // Check for required methods
      const requiredMethods = ['_init', '_destroy'];
      const missingMethods = requiredMethods.filter(m => !parsed.methods.includes(m));

      if (missingMethods.length === 0) {
        architectureScore += 40;
      } else {
        missingMethods.forEach(method => {
          issues.push({
            severity: 'error',
            message: `Missing required method: ${method}`,
            suggestion: `Add ${method}() method to your plugin class`,
          });
        });
      }

      // Check for constructor
      if (parsed.methods.includes('constructor')) {
        architectureScore += 10;
      } else {
        issues.push({
          severity: 'warning',
          message: 'Plugin should have a constructor',
          suggestion: 'constructor(element, options) { super(element, options); }',
        });
      }

      // Check naming conventions
      if (parsed.className && /^[A-Z][a-zA-Z0-9]*$/.test(parsed.className)) {
        conventionsScore += 30;
      } else {
        issues.push({
          severity: 'warning',
          message: 'Plugin class name should be PascalCase',
          suggestion: 'Use PascalCase for class names (e.g., MyPlugin)',
        });
      }

      // Check for JSDoc comments
      if (code.includes('/**') && code.includes('@class')) {
        conventionsScore += 20;
      } else {
        issues.push({
          severity: 'info',
          message: 'Add JSDoc comments to your plugin',
          suggestion: 'Add /** @class */ comment above your plugin class',
        });
      }

      // Check event naming
      const eventPattern = /\.trigger\(['"]([^'"]+)['"]\)/g;
      const events = [...code.matchAll(eventPattern)].map(m => m[1]);
      const hasNamespacedEvents = events.some(e => e.includes('.zf.'));

      if (hasNamespacedEvents || events.length === 0) {
        conventionsScore += 20;
      } else {
        issues.push({
          severity: 'warning',
          message: 'Events should use .zf.{plugin} namespace',
          suggestion: "Use event names like 'open.zf.accordion'",
        });
      }

      // Check for accessibility
      if (code.includes('aria-') || code.includes('role=')) {
        accessibilityScore += 40;
      } else {
        issues.push({
          severity: 'warning',
          message: 'Plugin should implement ARIA attributes for accessibility',
          suggestion: 'Add ARIA attributes for screen reader support',
        });
      }

      if (code.includes('Keyboard') || code.includes('KEYS')) {
        accessibilityScore += 30;
      } else {
        issues.push({
          severity: 'info',
          message: 'Consider adding keyboard navigation support',
          suggestion: 'Use Foundation.Keyboard utility for keyboard events',
        });
      }

      // Check for focus management
      if (code.includes('focus()') || code.includes('$element.focus')) {
        accessibilityScore += 30;
      }

      // Normalize scores
      architectureScore = Math.min(architectureScore, 100);
      conventionsScore = Math.min(conventionsScore + 30, 100); // Base points
      accessibilityScore = Math.min(accessibilityScore, 100);

      const overallScore = (architectureScore + conventionsScore + accessibilityScore) / 3;
      let matches: 'matches' | 'partial-match' | 'no-match' = 'no-match';

      if (overallScore >= 80) {
        matches = 'matches';
      } else if (overallScore >= 50) {
        matches = 'partial-match';
      }

      const suggestions: string[] = [];
      if (architectureScore < 80) {
        suggestions.push('Review Foundation plugin architecture guide');
      }
      if (conventionsScore < 80) {
        suggestions.push('Follow Foundation naming conventions');
      }
      if (accessibilityScore < 80) {
        suggestions.push('Improve accessibility with ARIA and keyboard support');
      }

      return {
        matches,
        issues,
        conformance: {
          architecture: architectureScore,
          conventions: conventionsScore,
          accessibility: accessibilityScore,
        },
        suggestions,
      };
    } catch (error) {
      logger.error('Failed to analyze plugin pattern', error);
      return {
        matches: 'no-match',
        issues: [
          {
            severity: 'error',
            message: 'Failed to parse code',
            suggestion: 'Ensure code is valid JavaScript',
          },
        ],
        conformance: {
          architecture: 0,
          conventions: 0,
          accessibility: 0,
        },
        suggestions: ['Fix syntax errors before analyzing'],
      };
    }
  }

  /**
   * Calculate similarity score between two code snippets
   */
  calculateSimilarity(code1: string, code2: string): number {
    // Simple similarity based on common tokens
    const tokens1 = new Set(code1.toLowerCase().match(/\w+/g) || []);
    const tokens2 = new Set(code2.toLowerCase().match(/\w+/g) || []);

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return (intersection.size / union.size) * 100;
  }
}
