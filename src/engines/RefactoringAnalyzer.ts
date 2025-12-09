/**
 * Refactoring analyzer for migrating code to Foundation
 */

import {
  ServerConfig,
  CacheInterface,
  ParsedPlugin,
  ParsedComponent,
} from '../types.js';
import { parsePlugin, parseComponent } from '../utils/parser.js';
import { CodebaseIndexer } from './CodebaseIndexer.js';
import { logger } from '../utils/logger.js';

export interface RefactoringAnalysis {
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

export class RefactoringAnalyzer {
  private indexer: CodebaseIndexer;

  constructor(_config: ServerConfig, _cache: CacheInterface, indexer: CodebaseIndexer) {
    // _config and _cache reserved for future use
    this.indexer = indexer;
  }

  /**
   * Analyze code and suggest Foundation refactoring
   */
  async analyzeForRefactoring(
    sourceCode: string,
    sourceType: 'custom-plugin' | 'custom-component',
    foundationTarget?: string
  ): Promise<RefactoringAnalysis> {
    logger.info('Analyzing code for Foundation refactoring', { sourceType });

    if (sourceType === 'custom-plugin') {
      return this.analyzePluginForRefactoring(sourceCode, foundationTarget);
    } else {
      return this.analyzeComponentForRefactoring(sourceCode, foundationTarget);
    }
  }

  /**
   * Analyze plugin for refactoring
   */
  private async analyzePluginForRefactoring(
    sourceCode: string,
    foundationTarget?: string
  ): Promise<RefactoringAnalysis> {
    try {
      const parsed = await parsePlugin(sourceCode);
      const index = await this.indexer.buildIndex();

      // Analyze plugin features
      const hasDropdown = this.hasFeature(sourceCode, ['dropdown', 'menu', 'select']);
      const hasAccordion = this.hasFeature(sourceCode, ['accordion', 'toggle', 'expand']);
      const hasModal = this.hasFeature(sourceCode, ['modal', 'dialog', 'overlay']);
      const hasCarousel = this.hasFeature(sourceCode, ['carousel', 'slider', 'rotation']);
      const hasTooltip = this.hasFeature(sourceCode, ['tooltip', 'popover', 'hint']);
      const hasForm = this.hasFeature(sourceCode, ['form', 'validate', 'validation']);

      // Find matching Foundation components
      const suggestions = this.findSimilarComponents(
        { hasDropdown, hasAccordion, hasModal, hasCarousel, hasTooltip, hasForm },
        index.plugins,
        foundationTarget
      );

      // Generate migration steps
      const migrationSteps = this.generatePluginMigrationSteps(parsed, suggestions);

      // Create code adaptation example
      const codeAdaptation = this.generatePluginCodeAdaptation(parsed, suggestions[0]);

      // Identify breaking changes
      const breakingChanges = this.identifyPluginBreakingChanges(sourceCode, suggestions[0]);

      // Generate recommended approach
      const recommendedApproach = this.generateRecommendedApproach('plugin', suggestions[0]);

      // Generate integration guide
      const integrationGuide = this.generateIntegrationGuide('plugin', suggestions[0]);

      return {
        sourceType: 'custom-plugin',
        suggestedFoundationComponents: suggestions,
        migrationSteps,
        codeAdaptation,
        breakingChanges,
        recommendedApproach,
        integrationGuide,
      };
    } catch (error) {
      logger.error('Failed to analyze plugin for refactoring', error);
      throw error;
    }
  }

  /**
   * Analyze component for refactoring
   */
  private async analyzeComponentForRefactoring(
    sourceCode: string,
    foundationTarget?: string
  ): Promise<RefactoringAnalysis> {
    try {
      const parsed = await parseComponent(sourceCode);
      const index = await this.indexer.buildIndex();

      // Analyze component features
      const hasButton = this.hasFeature(sourceCode, ['button', 'btn']);
      const hasCard = this.hasFeature(sourceCode, ['card', 'panel', 'box']);
      const hasBadge = this.hasFeature(sourceCode, ['badge', 'label', 'tag']);
      const hasAlert = this.hasFeature(sourceCode, ['alert', 'message', 'notification']);
      const hasCallout = this.hasFeature(sourceCode, ['callout', 'notice', 'info']);
      const hasGrid = this.hasFeature(sourceCode, ['grid', 'layout', 'column']);

      // Find matching Foundation components
      const suggestions = this.findSimilarComponents(
        { hasButton, hasCard, hasBadge, hasAlert, hasCallout, hasGrid },
        index.components,
        foundationTarget
      );

      // Generate migration steps
      const migrationSteps = this.generateComponentMigrationSteps(parsed, suggestions);

      // Create code adaptation example
      const codeAdaptation = this.generateComponentCodeAdaptation(parsed, suggestions[0]);

      // Identify breaking changes
      const breakingChanges = this.identifyComponentBreakingChanges(sourceCode, suggestions[0]);

      // Generate recommended approach
      const recommendedApproach = this.generateRecommendedApproach('component', suggestions[0]);

      // Generate integration guide
      const integrationGuide = this.generateIntegrationGuide('component', suggestions[0]);

      return {
        sourceType: 'custom-component',
        suggestedFoundationComponents: suggestions,
        migrationSteps,
        codeAdaptation,
        breakingChanges,
        recommendedApproach,
        integrationGuide,
      };
    } catch (error) {
      logger.error('Failed to analyze component for refactoring', error);
      throw error;
    }
  }

  /**
   * Check if code has specific features
   */
  private hasFeature(code: string, keywords: string[]): boolean {
    const lowerCode = code.toLowerCase();
    return keywords.some(keyword => lowerCode.includes(keyword));
  }

  /**
   * Find similar Foundation components
   */
  private findSimilarComponents(
    features: Record<string, boolean>,
    components: any[],
    foundationTarget?: string
  ): Array<{
    name: string;
    slug: string;
    similarity: number;
    reasoning: string;
  }> {
    if (foundationTarget) {
      const target = components.find(c => c.slug === foundationTarget);
      if (target) {
        return [
          {
            name: target.name,
            slug: target.slug,
            similarity: 100,
            reasoning: `User specified target: ${target.name}`,
          },
        ];
      }
    }

    const featureToComponent: Record<string, { name: string; slug: string }> = {
      hasDropdown: { name: 'Dropdown', slug: 'dropdown' },
      hasAccordion: { name: 'Accordion', slug: 'accordion' },
      hasModal: { name: 'Reveal', slug: 'reveal' },
      hasCarousel: { name: 'Orbit', slug: 'orbit' },
      hasTooltip: { name: 'Tooltip', slug: 'tooltip' },
      hasForm: { name: 'Abide', slug: 'abide' },
      hasButton: { name: 'Button', slug: 'button' },
      hasCard: { name: 'Card', slug: 'card' },
      hasBadge: { name: 'Badge', slug: 'badge' },
      hasAlert: { name: 'Callout', slug: 'callout' },
      hasCallout: { name: 'Callout', slug: 'callout' },
      hasGrid: { name: 'XY Grid', slug: 'xy-grid' },
    };

    const suggestions = Object.entries(features)
      .filter(([, value]) => value)
      .map(([feature]) => {
        const match = featureToComponent[feature];
        if (match) {
          // const comp = components.find(c => c.slug === match.slug);
          return {
            name: match.name,
            slug: match.slug,
            similarity: 85,
            reasoning: `Detected ${feature.replace(/^has/, '').toLowerCase()} functionality`,
          };
        }
        return null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    // Return top 3 suggestions
    return suggestions.slice(0, 3);
  }

  /**
   * Generate plugin migration steps
   */
  private generatePluginMigrationSteps(_parsed: ParsedPlugin, suggestions: any[]): string[] {
    const steps = [
      '1. Review Foundation plugin architecture and lifecycle methods',
      '2. Extend Foundation Plugin base class instead of custom base',
      '3. Implement required methods (_init, _destroy)',
      '4. Use Foundation Keyboard utility for keyboard events',
      '5. Replace custom events with Foundation event namespacing (.zf.pluginname)',
      '6. Use Foundation data attributes for configuration',
      '7. Implement accessibility with ARIA attributes',
      '8. Add unit tests following Foundation test patterns',
    ];

    if (suggestions.length > 0) {
      steps.unshift(`0. Study ${suggestions[0].name} plugin as reference implementation`);
    }

    return steps;
  }

  /**
   * Generate component migration steps
   */
  private generateComponentMigrationSteps(_parsed: ParsedComponent, suggestions: any[]): string[] {
    const steps = [
      '1. Review Foundation component structure and mixins',
      '2. Align variable naming with Foundation conventions ($component-name)',
      '3. Convert to Foundation mixin-based approach',
      '4. Implement foundation-{component} mixin for inclusion',
      '5. Add color and size variations using Foundation palette',
      '6. Use rem-calc() for responsive spacing',
      '7. Ensure accessibility with semantic HTML',
      '8. Add Sass tests using sass-true framework',
    ];

    if (suggestions.length > 0) {
      steps.unshift(`0. Study ${suggestions[0].name} component as reference`);
    }

    return steps;
  }

  /**
   * Generate plugin code adaptation
   */
  private generatePluginCodeAdaptation(
    _parsed: ParsedPlugin,
    _suggestion: any
  ): { before: string; after: string; changes: string[] } {
    // const suggestedName = suggestion?.name || 'CustomPlugin';

    const before = `// Custom plugin
class CustomDropdown {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this.init();
  }

  init() {
    this.element.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.element.classList.toggle('active');
    this.element.dispatchEvent(new Event('toggle'));
  }

  destroy() {
    this.element.removeEventListener('click', null);
  }
}`;

    const after = `// Foundation plugin
import { Plugin } from './foundation.core.plugin';

export class CustomDropdown extends Plugin {
  constructor(element, options = {}) {
    super(element, options);
  }

  _init() {
    this._addEventListeners();
  }

  _addEventListeners() {
    this.$element.on('click.zf.customdropdown', () => this.toggle());
  }

  toggle() {
    this.$element.toggleClass('is-active');
    this.$element.trigger('toggle.zf.customdropdown');
  }

  _destroy() {
    this.$element.off('.zf.customdropdown');
  }
}

CustomDropdown.defaults = {};`;

    return {
      before,
      after,
      changes: [
        'Extends Plugin base class',
        'Constructor calls super()',
        '_init() instead of init()',
        '_destroy() for cleanup',
        'Uses jQuery ($element)',
        'Event namespacing with .zf.*',
        'Bootstrap method naming conventions',
      ],
    };
  }

  /**
   * Generate component code adaptation
   */
  private generateComponentCodeAdaptation(
    _parsed: ParsedComponent,
    _suggestion: any
  ): { before: string; after: string; changes: string[] } {
    const before = `// Custom component
$button-padding: 10px 15px;
$button-background: #007bff;
$button-color: white;

.button {
  padding: $button-padding;
  background-color: $button-background;
  color: $button-color;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: darken($button-background, 10%);
  }

  &.primary {
    background-color: #0056b3;
  }

  &.secondary {
    background-color: #6c757d;
  }
}`;

    const after = `// Foundation component
$button-padding: rem-calc(12 24) !default;
$button-background: $primary-color !default;
$button-color: color-pick-contrast($button-background) !default;
$button-border-radius: $global-radius !default;

/// Mixin to create button base styles
@mixin button-base {
  padding: $button-padding;
  background-color: $button-background;
  color: $button-color;
  border: 1px solid $button-background;
  border-radius: $button-border-radius;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: shade($button-background, 10%);
  }
}

/// Mixin to style button variants
@mixin button-style($bg: $button-background, $color: $button-color) {
  background-color: $bg;
  color: color-pick-contrast($bg);
  border-color: $bg;
}

/// Output button component
@mixin foundation-button {
  .button {
    @include button-base;

    @each $name, $color in $foundation-palette {
      &.\\#{$name} {
        @include button-style($color);
      }
    }
  }
}`;

    return {
      before,
      after,
      changes: [
        'Variables use rem-calc for responsive sizing',
        'Variables marked with !default for overridability',
        'Organized into reusable mixins',
        'Uses Foundation color palette',
        'Foundation naming conventions',
        'Includes mixin documentation',
        'Supports color variations automatically',
      ],
    };
  }

  /**
   * Identify breaking changes for plugins
   */
  private identifyPluginBreakingChanges(code: string, _suggestion: any): string[] {
    const changes = [];

    if (code.includes('addEventListener')) {
      changes.push('Replace addEventListener with jQuery .on() method');
    }

    if (code.includes('classList')) {
      changes.push('Use jQuery addClass/removeClass instead of classList');
    }

    if (code.includes('dispatchEvent')) {
      changes.push('Use jQuery .trigger() for events instead of dispatchEvent');
    }

    if (!code.includes('destroy')) {
      changes.push('Must implement _destroy() for proper cleanup');
    }

    if (!code.includes('ARIA') && !code.includes('aria-')) {
      changes.push('Add ARIA attributes for accessibility compliance');
    }

    changes.push('Data attribute format changes to [data-{slug}]');
    changes.push('Selector changes to use Foundation data attributes');
    changes.push('Event namespace changes to .zf.{pluginname}');

    return changes;
  }

  /**
   * Identify breaking changes for components
   */
  private identifyComponentBreakingChanges(code: string, _suggestion: any): string[] {
    const changes = [];

    if (code.includes('px') && !code.includes('rem')) {
      changes.push('Replace px units with rem-calc() for responsive design');
    }

    if (!code.includes('!default')) {
      changes.push('Add !default flag to all variables for customization');
    }

    if (!code.includes('@mixin')) {
      changes.push('Organize styles into reusable mixins');
    }

    if (!code.includes('@include')) {
      changes.push('Include mixin in main component mixin');
    }

    if (code.includes('hardcoded colors')) {
      changes.push('Use Foundation color palette variables instead of hardcoded colors');
    }

    changes.push('CSS class naming may change to align with Foundation conventions');
    changes.push('Layout assumptions may conflict with Foundation grid system');

    return changes;
  }

  /**
   * Generate recommended approach text
   */
  private generateRecommendedApproach(type: string, suggestion: any): string {
    if (type === 'plugin') {
      return `We recommend migrating to Foundation's ${suggestion?.name || 'equivalent plugin'} which provides:
- Consistent plugin architecture and lifecycle management
- Built-in accessibility features (ARIA, keyboard navigation)
- jQuery integration and event handling
- Comprehensive browser compatibility
- Integration with Foundation utility functions

Start by studying the Foundation plugin, then refactor your code to extend the Plugin base class.
This approach ensures consistency and long-term maintainability.`;
    } else {
      return `We recommend migrating to Foundation's ${suggestion?.name || 'equivalent component'} which provides:
- Responsive design with rem-calc() scaling
- Customizable variables with !default flags
- Pre-built color and size variations
- Accessibility-first styling approach
- Integration with Foundation's design system

Refactor your Sass to use Foundation's mixin structure and variable naming conventions.
This enables theme customization and ensures consistency with the rest of Foundation.`;
    }
  }

  /**
   * Generate integration guide
   */
  private generateIntegrationGuide(type: string, suggestion: any): string[] {
    if (type === 'plugin') {
      return [
        `1. Create new file: js/foundation.${suggestion?.slug || 'myplugin'}.js`,
        'Import Plugin base class: import { Plugin } from "./foundation.core.plugin";',
        'Export class: export { MyPlugin };',
        `2. Register plugin in js/entries/foundation.js:`,
        `   import { MyPlugin } from '../foundation.${suggestion?.slug || 'myplugin'}';`,
        `   Foundation.plugin(MyPlugin, '${suggestion?.name || 'MyPlugin'}');`,
        '3. Create test file: test/javascript/{slug}.spec.js',
        '4. Add documentation: docs/pages/{slug}.md',
        '5. Run tests: yarn test:javascript:units',
        '6. Build and verify: yarn build',
      ];
    } else {
      return [
        `1. Create new file: scss/components/_${suggestion?.slug || 'mycomponent'}.scss`,
        'Define variables with !default flags',
        'Create reusable mixins for styling',
        'Create main @mixin foundation-{slug}',
        '2. Import in scss/foundation.scss:',
        `   @import 'components/${suggestion?.slug || 'mycomponent'}';`,
        '3. Include in foundation-everything mixin',
        '4. Create test file: test/sass/components/_{slug}.scss',
        '5. Add documentation: docs/pages/{slug}.md',
        '6. Run tests: yarn test:sass',
        '7. Build and verify: yarn build',
      ];
    }
  }
}
