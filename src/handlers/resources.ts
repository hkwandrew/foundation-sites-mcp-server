/**
 * Resource handlers for Foundation MCP Server
 */

import {
} from '../types.js';
import { CodebaseIndexer } from '../engines/CodebaseIndexer.js';
import { logger } from '../utils/logger.js';

export class ResourceHandler {

  private indexer: CodebaseIndexer;

  constructor(indexer: CodebaseIndexer) {
    this.indexer = indexer;
  }

  /**
   * List all available resources
   */
  async listResources() {
    return {
      resources: [
        {
          uri: 'foundation://plugins/index',
          name: 'Foundation Plugins Index',
          description: 'Complete index of all Foundation plugins',
          mimeType: 'application/json',
        },
        {
          uri: 'foundation://components/index',
          name: 'Foundation Components Index',
          description: 'Complete index of all Foundation components',
          mimeType: 'application/json',
        },
        {
          uri: 'foundation://build/config',
          name: 'Build Configuration',
          description: 'Foundation build system configuration',
          mimeType: 'application/json',
        },
        {
          uri: 'foundation://architecture/plugins',
          name: 'Plugin Architecture Guide',
          description: 'Detailed guide on Foundation plugin architecture',
          mimeType: 'application/json',
        },
        {
          uri: 'foundation://patterns/tests/javascript',
          name: 'JavaScript Test Patterns',
          description: 'Test patterns for JavaScript plugins',
          mimeType: 'text/plain',
        },
        {
          uri: 'foundation://patterns/tests/sass',
          name: 'Sass Test Patterns',
          description: 'Test patterns for Sass components',
          mimeType: 'text/plain',
        },
        {
          uri: 'foundation://integrations/wordpress',
          name: 'WordPress Integration Guide',
          description: 'How to use Foundation within WordPress themes or plugins',
          mimeType: 'text/markdown',
        },
      ],
    };
  }

  /**
   * Read resource content
   */
  async readResource(uri: string) {
    logger.debug('Reading resource', { uri });

    if (uri === 'foundation://plugins/index') {
      return this.getPluginsIndex();
    }

    if (uri === 'foundation://components/index') {
      return this.getComponentsIndex();
    }

    if (uri === 'foundation://build/config') {
      return this.getBuildConfig();
    }

    if (uri === 'foundation://architecture/plugins') {
      return this.getPluginArchitecture();
    }

    if (uri === 'foundation://patterns/tests/javascript') {
      return this.getJavaScriptTestPattern();
    }

    if (uri === 'foundation://patterns/tests/sass') {
      return this.getSassTestPattern();
    }

    if (uri === 'foundation://integrations/wordpress') {
      return this.getWordPressIntegration();
    }

    // Handle dynamic resources (plugin/component specific)
    const pluginMatch = uri.match(/^foundation:\/\/plugins\/([^\/]+)\/(template|docs)$/);
    if (pluginMatch) {
      const [, slug, type] = pluginMatch;
      return type === 'template'
        ? this.getPluginTemplate(slug)
        : this.getPluginDocs(slug);
    }

    const componentMatch = uri.match(/^foundation:\/\/components\/([^\/]+)\/(template|docs)$/);
    if (componentMatch) {
      const [, slug, type] = componentMatch;
      return type === 'template'
        ? this.getComponentTemplate(slug)
        : this.getComponentDocs(slug);
    }

    throw new Error(`Resource not found: ${uri}`);
  }

  /**
   * Get plugins index
   */
  private async getPluginsIndex() {
    const index = await this.indexer.buildIndex();
    return {
      contents: [
        {
          uri: 'foundation://plugins/index',
          mimeType: 'application/json',
          text: JSON.stringify(index.plugins, null, 2),
        },
      ],
    };
  }

  /**
   * Get components index
   */
  private async getComponentsIndex() {
    const index = await this.indexer.buildIndex();
    return {
      contents: [
        {
          uri: 'foundation://components/index',
          mimeType: 'application/json',
          text: JSON.stringify(index.components, null, 2),
        },
      ],
    };
  }

  /**
   * Get build configuration
   */
  private async getBuildConfig() {
    const config = {
      bundler: 'rollup',
      transpiler: 'babel',
      cssProcessor: 'sass-embedded',
      scriptEntryPoints: {
        foundation: 'js/entries/foundation.js',
      },
      outputFormats: {
        umd: 'dist/js/foundation.js',
        esm: 'dist/js/foundation.esm.js',
        es6: 'dist/js/foundation.es6.js',
      },
      scssVariablePath: 'scss/settings/_settings.scss',
      taskRunners: {
        dev: 'yarn start',
        build: 'yarn build',
        test: 'yarn test',
        'test:sass': 'yarn test:sass',
        'test:javascript': 'yarn test:javascript:units',
      },
    };

    return {
      contents: [
        {
          uri: 'foundation://build/config',
          mimeType: 'application/json',
          text: JSON.stringify(config, null, 2),
        },
      ],
    };
  }

  /**
   * Get plugin architecture guide
   */
  private async getPluginArchitecture() {
    const architecture = {
      baseClass: 'Plugin',
      baseClassPath: 'js/foundation.core.plugin.js',
      lifecycle: {
        constructor: {
          description: 'Called when plugin instance is created',
          parameters: ['element', 'options'],
        },
        _init: {
          description: 'Initialize the plugin',
          hooks: ['_addEventListeners', '_bindEvents'],
        },
        _destroy: {
          description: 'Clean up when plugin is destroyed',
          responsibilities: ['Remove event listeners', 'Clean up DOM', 'Reset state'],
        },
      },
      patterns: {
        eventHandling: {
          description: 'How to add event handlers',
          example: "this.$element.on('click.zf.plugin', handler);",
        },
        dataAttributes: {
          description: 'Using data attributes for configuration',
          example: '[data-plugin][data-options="option: value;"]',
        },
      },
      requiredMethods: ['_init', '_destroy'],
      optionalPatterns: ['_addEventListeners', '_setupKeyboard'],
    };

    return {
      contents: [
        {
          uri: 'foundation://architecture/plugins',
          mimeType: 'application/json',
          text: JSON.stringify(architecture, null, 2),
        },
      ],
    };
  }

  /**
   * Get JavaScript test pattern
   */
  private async getJavaScriptTestPattern() {
    const pattern = `describe('PluginName', function() {
  var plugin;
  var $html;

  afterEach(function() {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function() {
    it('stores the element and plugin options', function() {
      $html = $('<div data-plugin></div>').appendTo('body');
      plugin = new Foundation.PluginName($html, {});

      $html.data('zfPluginName').should.be.an.instanceof(Foundation.PluginName);
    });
  });

  describe('_init()', function() {
    it('initializes correctly', function() {
      $html = $('<div data-plugin></div>').appendTo('body');
      plugin = new Foundation.PluginName($html, {});

      // Add assertions
    });
  });

  describe('_destroy()', function() {
    it('cleans up', function() {
      $html = $('<div data-plugin></div>').appendTo('body');
      plugin = new Foundation.PluginName($html, {});

      plugin.destroy();

      should.not.exist($html.data('zfPluginName'));
    });
  });
});`;

    return {
      contents: [
        {
          uri: 'foundation://patterns/tests/javascript',
          mimeType: 'text/plain',
          text: pattern,
        },
      ],
    };
  }

  /**
   * Get Sass test pattern
   */
  private async getSassTestPattern() {
    const pattern = `@import 'true';
@import '../../../scss/components/component';

@include test-module('Component [component]') {
  @include test('component-base mixin') {
    @include assert {
      @include output {
        @include component-base;
      }

      @include expect {
        // Expected output
      }
    }
  }
}`;

    return {
      contents: [
        {
          uri: 'foundation://patterns/tests/sass',
          mimeType: 'text/plain',
          text: pattern,
        },
      ],
    };
  }

  /**
   * Get plugin template (stub)
   */
  private async getPluginTemplate(slug: string) {
    return {
      contents: [
        {
          uri: `foundation://plugins/${slug}/template`,
          mimeType: 'text/plain',
          text: `// Use generate_plugin tool to create plugin template`,
        },
      ],
    };
  }

  /**
   * Get plugin docs (stub)
   */
  private async getPluginDocs(slug: string) {
    const index = await this.indexer.buildIndex();
    const plugin = index.plugins.find((p: any) => p.slug === slug);

    if (!plugin) {
      throw new Error(`Plugin not found: ${slug}`);
    }

    return {
      contents: [
        {
          uri: `foundation://plugins/${slug}/docs`,
          mimeType: 'text/markdown',
          text: `# ${plugin.name}\n\n${plugin.description}\n\nDocs: ${plugin.docs}`,
        },
      ],
    };
  }

  /**
   * Get component template (stub)
   */
  private async getComponentTemplate(slug: string) {
    return {
      contents: [
        {
          uri: `foundation://components/${slug}/template`,
          mimeType: 'text/plain',
          text: `// Use generate_component tool to create component template`,
        },
      ],
    };
  }

  /**
   * Get component docs (stub)
   */
  private async getComponentDocs(slug: string) {
    const index = await this.indexer.buildIndex();
    const component = index.components.find((c: any) => c.slug === slug);

    if (!component) {
      throw new Error(`Component not found: ${slug}`);
    }

    return {
      contents: [
        {
          uri: `foundation://components/${slug}/docs`,
          mimeType: 'text/markdown',
          text: `# ${component.name}\n\n${component.description}\n\nDocs: ${component.docs}`,
        },
      ],
    };
  }

  /**
   * Get WordPress integration guidance
   */
  private async getWordPressIntegration() {
    const markdown = [
      '# Foundation + WordPress Integration',
      '',
      'Use this guide to embed Foundation Sites inside a WordPress **theme** or **plugin** without fighting the WP asset pipeline.',
      '',
      '## 1) Build or copy assets',
      '- Compile Foundation (Node 18+, yarn build) or copy prebuilt `dist/css/foundation.css` and `dist/js/foundation.js`.',
      '- Keep assets in `dist/css` and `dist/js` (or similar) inside your theme/plugin.',
      '- If you use Motion UI, include its CSS output too.',
      '',
      '## 2) Enqueue in WordPress',
      '```php',
      'function foundation_enqueue_assets() {',
      "  $version = '6.9.x';",
      '  $theme_dir = get_template_directory_uri();',
      '',
      "  wp_enqueue_style(",
      "    'foundation-styles',",
      "    $theme_dir . '/dist/css/theme.css',",
      "    [],",
      "    $version",
      "  );",
      '',
      "  wp_enqueue_script(",
      "    'foundation-scripts',",
      "    $theme_dir . '/dist/js/theme.js',",
      "    ['jquery'],",
      "    $version,",
      "    true",
      "  );",
      '',
      "  wp_add_inline_script('foundation-scripts', 'jQuery(document).foundation();');",
      '}',
      "add_action('wp_enqueue_scripts', 'foundation_enqueue_assets');",
      '```',
      '',
      '## 3) Use data- attributes in PHP templates',
      '- Add `data-accordion`, `data-dropdown`, `data-tabs`, etc. to markup generated in PHP or block templates.',
      '- Pass options safely with `data-options="deep_link: true;"` wrapped by `esc_attr`.',
      '',
      '## 4) Block editor notes',
      '- If needed, enqueue a light editor stylesheet via `enqueue_block_editor_assets` to avoid heavy resets.',
      '- Avoid running JS plugins in the editor unless required; if you must, gate initialization with `is_admin()` and block-specific selectors.',
      '',
      '## 5) RTL and accessibility',
      '- Generate RTL CSS (rtlcss or foundation-rtl.scss) and enqueue conditionally when `is_rtl()` is true.',
      '- Foundation plugins rely on ARIA; keep semantic markup intact.',
      '',
      '## 6) Troubleshooting',
      '- Missing JS? Ensure jQuery is enqueued before Foundation and noConflict is not stripping `$` (use `window.jQuery`).',
      '- Layout clashes? Load Foundation first, then your overrides; inspect theme styles with higher specificity.',
      '- AJAX/fragment loads? Call `Foundation.reInit($fragment)` after injecting markup.',
    ].join('\n');

    return {
      contents: [
        {
          uri: 'foundation://integrations/wordpress',
          mimeType: 'text/markdown',
          text: markdown,
        },
      ],
    };
  }
}
