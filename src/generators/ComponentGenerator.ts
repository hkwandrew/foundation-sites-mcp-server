/**
 * Component generator for Foundation Sass components
 */

import {
  GenerateComponentParams,
  GenerateComponentResult,

} from '../types.js';
import { logger } from '../utils/logger.js';

export class ComponentGenerator {

  constructor() {

  }

  /**
   * Generate a new Foundation component
   */
  async generate(params: GenerateComponentParams): Promise<GenerateComponentResult> {
    logger.info('Generating component', { name: params.name });

    try {
      const files: GenerateComponentResult['files'] = {};

      // Generate component SCSS file
      files.component = {
        path: `scss/components/_${params.slug}.scss`,
        content: this.generateComponentScss(params),
      };

      // Generate test file if requested
      if (params.includeTests) {
        files.test = {
          path: `test/sass/components/_${params.slug}.scss`,
          content: this.generateTestScss(params),
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
      logger.error('Failed to generate component', error);
      return {
        status: 'error',
        files: {},
        integrationSteps: [],
        error: (error as Error).message,
      };
    }
  }

  /**
   * Generate component SCSS code
   */
  private generateComponentScss(params: GenerateComponentParams): string {
    const { name, slug, variables } = params;

    // Generate variable declarations
    const varDecls = variables
      ? Object.entries(variables)
          .map(([varName, varDef]) => {
            return `/// ${varDef.description}
/// @type ${varDef.type}
$${slug}-${varName}: ${this.formatValue(varDef.defaultValue)} !default;`;
          })
          .join('\n\n')
      : `/// Padding for ${name}.
/// @type Number
$${slug}-padding: 1rem !default;

/// Background color for ${name}.
/// @type Color
$${slug}-background: $white !default;

/// Border color for ${name}.
/// @type Color
$${slug}-border: $medium-gray !default;`;

    // Generate mixins
    const mixinContent = `/// Adds the base styles for a ${name}.
/// @param {Boolean} $base [true] - Include base styles
@mixin ${slug}-base($base: true) {
  @if $base {
    padding: $${slug}-padding;
    background-color: $${slug}-background;
    border: 1px solid $${slug}-border;
  }
}

/// Adds style variations for a ${name}.
/// @param {Color} $background [$${slug}-background] - Background color
/// @param {Color} $color [color-pick-contrast($background)] - Text color
@mixin ${slug}-style(
  $background: $${slug}-background,
  $color: color-pick-contrast($background)
) {
  background-color: $background;
  color: $color;
}

/// Adds size variations for a ${name}.
/// @param {Number} $padding [$${slug}-padding] - Padding amount
@mixin ${slug}-size($padding: $${slug}-padding) {
  padding: $padding;
}`;


    return `// Foundation for Sites
// https://get.foundation
// Licensed under MIT Open Source

////
/// @group ${slug}
////

${varDecls}

${mixinContent}

/// Generates the ${name} component styles.
@mixin foundation-${slug} {
  .${slug} {
    @include ${slug}-base;

    // Add modifier classes
    &.is-active {
      // Active state styles
    }

    &.is-disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  // Color variations
  @each $name, $color in $foundation-palette {
    .${slug}.\\#{$name} {
      @include ${slug}-style($color);
    }
  }

  // Size variations
  .${slug}.small {
    @include ${slug}-size(0.5rem);
  }

  .${slug}.large {
    @include ${slug}-size(2rem);
  }
}
`;
  }

  /**
   * Generate test SCSS
   */
  private generateTestScss(params: GenerateComponentParams): string {
    const { name, slug } = params;

    return `@import 'true';
@import '../../../scss/components/${slug}';

@include test-module('${name} [component]') {
  @include test('${slug}-base mixin') {
    @include assert {
      @include output {
        @include ${slug}-base;
      }

      @include expect {
        padding: 1rem;
        background-color: #fefefe;
        border: 1px solid #cacaca;
      }
    }
  }

  @include test('${slug}-style mixin') {
    @include assert {
      @include output {
        @include ${slug}-style($primary-color);
      }

      @include contains {
        background-color: #1779ba;
      }
    }
  }

  @include test('${slug}-size mixin') {
    @include assert {
      @include output {
        @include ${slug}-size(2rem);
      }

      @include expect {
        padding: 2rem;
      }
    }
  }
}
`;
  }

  /**
   * Generate documentation markdown
   */
  private generateDocsMarkdown(params: GenerateComponentParams): string {
    const { name, slug, description } = params;


    return `---
title: ${name}
description: ${description}
sass: scss/components/_${slug}.scss
tags:
  - ${slug}
---

## ${name}

${description}

---

## Basics

Add the \`.${slug}\` class to create a ${name}:

\`\`\`html
<div class="${slug}">
  Your content here
</div>
\`\`\`

<div class="${slug}">
  Your content here
</div>

---

## Coloring

Use Foundation's color palette to style the ${name}:

\`\`\`html
<div class="${slug} primary">Primary ${name}</div>
<div class="${slug} secondary">Secondary ${name}</div>
<div class="${slug} success">Success ${name}</div>
<div class="${slug} warning">Warning ${name}</div>
<div class="${slug} alert">Alert ${name}</div>
\`\`\`

---

## Sizing

Use size classes to adjust the ${name}:

\`\`\`html
<div class="${slug} small">Small ${name}</div>
<div class="${slug}">Default ${name}</div>
<div class="${slug} large">Large ${name}</div>
\`\`\`

---

## Sass Reference

### Variables

The default styles of this component can be customized using these Sass variables:

| Name | Type | Default Value | Description |
| --- | --- | --- | --- |
| \`$${slug}-padding\` | Number | \`1rem\` | Padding for ${name} |
| \`$${slug}-background\` | Color | \`$white\` | Background color |
| \`$${slug}-border\` | Color | \`$medium-gray\` | Border color |

### Mixins

Use these mixins to customize the ${name}:

#### \`${slug}-base\`

Creates base styles for ${name}.

\`\`\`scss
@include ${slug}-base;
\`\`\`

#### \`${slug}-style\`

Adds style variations.

\`\`\`scss
@include ${slug}-style($background, $color);
\`\`\`

#### \`${slug}-size\`

Adjusts the size.

\`\`\`scss
@include ${slug}-size($padding);
\`\`\`

---
`;
  }

  /**
   * Format variable value
   */
  private formatValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'number') {
      return value.toString();
    } else if (typeof value === 'boolean') {
      return value.toString();
    }
    return String(value);
  }

  /**
   * Get integration steps
   */
  private getIntegrationSteps(params: GenerateComponentParams): string[] {
    const { slug } = params;

    return [
      `Import component in scss/foundation.scss: @import 'components/${slug}';`,
      `Include component mixin: @include foundation-${slug};`,
      `Add to foundation-everything mixin in scss/foundation.scss`,
      `Run Sass tests: yarn test:sass`,
      `Build and verify output: yarn build`,
    ];
  }
}
