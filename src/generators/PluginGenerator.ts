/**
 * Plugin generator for Foundation plugins
 */

import {
  GeneratePluginParams,
  GeneratePluginResult,

} from '../types.js';
import { logger } from '../utils/logger.js';

export class PluginGenerator {


  constructor() {

  }

  /**
   * Generate a new Foundation plugin
   */
  async generate(params: GeneratePluginParams): Promise<GeneratePluginResult> {
    logger.info('Generating plugin', { name: params.name });

    try {
      const files: GeneratePluginResult['files'] = {};

      // Generate plugin file
      files.plugin = {
        path: `js/foundation.${params.slug}.js`,
        content: this.generatePluginCode(params),
      };

      // Generate test file if requested
      if (params.includeTests) {
        files.test = {
          path: `test/javascript/${params.slug}.spec.js`,
          content: this.generateTestCode(params),
        };
      }

      // Generate documentation if requested
      if (params.includeDocs) {
        files.docs = {
          path: `docs/pages/${params.slug}.md`,
          content: this.generateDocsMarkdown(params),
        };
      }

      const integrationSteps = this.getIntegrationSteps(params);

      return {
        status: 'success',
        files,
        integrationSteps,
      };
    } catch (error) {
      logger.error('Failed to generate plugin', error);
      return {
        status: 'error',
        files: {},
        integrationSteps: [],
        error: (error as Error).message,
      };
    }
  }

  /**
   * Generate plugin JavaScript code
   */
  private generatePluginCode(params: GeneratePluginParams): string {
    const { name, slug, description, selector, features } = params;
    const dataAttr = selector || `[data-${slug}]`;
    const hasKeyboard = features?.keyboard ?? false;
    const hasNesting = features?.nesting ?? false;
    const hasStateManagement = features?.stateManagement ?? false;
    const customEvents = features?.events ?? [];

    return `/**
 * ${name} plugin.
 * ${description}
 * @module foundation.${slug}
 */

import { Plugin } from './foundation.core.plugin';
${hasKeyboard ? "import { Keyboard } from './foundation.util.keyboard';" : ''}
${hasNesting ? "import { Nest } from './foundation.util.nest';" : ''}

/**
 * ${name} plugin.
 * @class
 * @name ${name}
 * @fires ${name}#init
${customEvents.map(e => ` * @fires ${name}#${e}`).join('\n')}
 * @fires ${name}#destroyed
 */
class ${name} extends Plugin {
  /**
   * Creates a new instance of ${name}.
   * @class
   * @name ${name}
   * @param {jQuery} element - jQuery object to make into a ${name}.
   *        Object should be of the ${dataAttr} attribute.
   * @param {Object} options - Overrides to the default plugin settings.
   */
  constructor(element, options = {}) {
    super(element, options);

    this._init();
    ${hasKeyboard ? 'this._setupKeyboard();' : ''}

    /**
     * Fires when the plugin has been successfully initialized.
     * @event ${name}#init
     */
    this.$element.trigger(\`init.zf.${slug}\`);
  }

  /**
   * Initializes the ${name} plugin.
   * @function
   * @private
   */
  _init() {
${hasStateManagement ? `    this.isActive = false;\n` : ''}${hasNesting ? `    Nest.Feather(this.$element, '${slug}');\n` : ''}    this._events();
  }

  /**
   * Adds event handlers for the ${name}.
   * @function
   * @private
   */
  _events() {
    this.$element.on({
      'click.zf.${slug}': this.toggle.bind(this)
    });
  }
${hasKeyboard ? `
  /**
   * Sets up keyboard event handlers.
   * @function
   * @private
   */
  _setupKeyboard() {
    Keyboard.register('${name}', {
      'ENTER': 'open',
      'SPACE': 'open',
      'ESCAPE': 'close'
    });

    this.$element.on('keydown.zf.${slug}', Keyboard.handleKey.bind(this));
  }
` : ''}
  /**
   * Toggles the ${name}.
   * @function
   */
  toggle() {
${hasStateManagement ? `    if (this.isActive) {
      this.close();
    } else {
      this.open();
    }` : `    // TODO: Implement toggle logic
    console.log('Toggle ${name}');`}
  }
${hasStateManagement ? `
  /**
   * Opens the ${name}.
   * @function
   * @fires ${name}#open
   */
  open() {
    if (this.isActive) return;

    this.isActive = true;
    this.$element.addClass('is-active');

    /**
     * Fires when the ${name} is opened.
     * @event ${name}#open
     */
    this.$element.trigger(\`open.zf.${slug}\`);
  }

  /**
   * Closes the ${name}.
   * @function
   * @fires ${name}#close
   */
  close() {
    if (!this.isActive) return;

    this.isActive = false;
    this.$element.removeClass('is-active');

    /**
     * Fires when the ${name} is closed.
     * @event ${name}#close
     */
    this.$element.trigger(\`close.zf.${slug}\`);
  }
` : ''}
  /**
   * Destroys an instance of ${name}.
   * @function
   */
  _destroy() {
    this.$element.off('.zf.${slug}');
${hasNesting ? `    Nest.Burn(this.$element, '${slug}');\n` : ''}  }
}

${name}.defaults = {
  // Add default options here
};

export { ${name} };
`;
  }

  /**
   * Generate test code
   */
  private generateTestCode(params: GeneratePluginParams): string {
    const { name, slug } = params;

    return `describe('${name}', function() {
  var plugin;
  var $html;

  afterEach(function() {
    plugin.destroy();
    $html.remove();
  });

  describe('constructor()', function() {
    it('stores the element and plugin options', function() {
      $html = $('<div data-${slug}></div>').appendTo('body');
      plugin = new Foundation.${name}($html, {});

      $html.data('zf${name}').should.be.an.instanceof(Foundation.${name});
    });
  });

  describe('init()', function() {
    it('initializes the plugin correctly', function() {
      $html = $('<div data-${slug}></div>').appendTo('body');
      plugin = new Foundation.${name}($html, {});

      $html.should.have.class('${slug}');
    });
  });

  describe('toggle()', function() {
    it('toggles the ${slug}', function() {
      $html = $('<div data-${slug}></div>').appendTo('body');
      plugin = new Foundation.${name}($html, {});

      plugin.toggle();
      // Add assertions here
    });
  });

  describe('destroy()', function() {
    it('cleans up event listeners', function() {
      $html = $('<div data-${slug}></div>').appendTo('body');
      plugin = new Foundation.${name}($html, {});

      plugin.destroy();

      should.not.exist($html.data('zf${name}'));
    });
  });
});
`;
  }

  /**
   * Generate documentation markdown
   */
  private generateDocsMarkdown(params: GeneratePluginParams): string {
    const { name, slug, description } = params;

    return `---
title: ${name}
description: ${description}
sass: scss/components/_${slug}.scss
js: js/foundation.${slug}.js
tags:
  - ${slug}
flex: true
---

## ${name}

${description}

---

## Basic Usage

Add the \`data-${slug}\` attribute to your HTML element:

\`\`\`html
<div data-${slug}>
  <!-- Your content here -->
</div>
\`\`\`

---

## JavaScript Reference

### Initialization

Initialize the plugin with JavaScript:

\`\`\`js
var elem = new Foundation.${name}(element, options);
\`\`\`

### Options

\`\`\`js
${name}.defaults = {
  // Add options documentation here
};
\`\`\`

### Methods

#### \`.toggle()\`

Toggles the ${slug}.

\`\`\`js
$('#element').foundation('toggle');
\`\`\`

#### \`.destroy()\`

Destroys the plugin instance.

\`\`\`js
$('#element').foundation('destroy');
\`\`\`

### Events

These events will fire from the element with the \`data-${slug}\` attribute:

- \`init.zf.${slug}\` - Fires when the plugin has finished initializing.
- \`destroyed.zf.${slug}\` - Fires when the plugin has been destroyed.

---

## Accessibility

The ${name} plugin follows these accessibility best practices:

- Keyboard navigation support
- ARIA attributes for screen readers
- Focus management

---

## Examples

### Basic Example

\`\`\`html
<div data-${slug}>
  <p>Example content</p>
</div>
\`\`\`

---
`;
  }

  /**
   * Get integration steps
   */
  private getIntegrationSteps(params: GeneratePluginParams): string[] {
    const { name, slug } = params;

    return [
      `Import ${name} in js/entries/foundation.js: import { ${name} } from '../foundation.${slug}';`,
      `Register plugin: Foundation.plugin(${name}, '${name}');`,
      `Add to exports in js/entries/foundation.js: export { ${name} };`,
      `Include in build configuration if needed`,
      `Run tests: yarn test:javascript:units`,
      `Update documentation index if necessary`,
    ];
  }
}
