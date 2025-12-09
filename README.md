# Foundation Sites MCP Server

A custom Model Context Protocol (MCP) server that provides AI assistants with structured access to the Foundation for Sites framework.

## Features

- 🔌 **Plugin Generation**: Create Foundation-compliant JavaScript plugins
- 🎨 **Component Generation**: Generate Sass components with mixins and variables
- 🧪 **Test Generation**: Auto-generate test suites for plugins and components
- 📖 **Documentation Access**: Query Foundation's architecture and patterns
- 🔍 **Code Analysis**: Validate code against Foundation conventions
- 🏗️ **Architecture Queries**: Get guidance on plugin and component patterns

## Installation

```bash
cd mcp-server
npm install
# or
yarn install
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure your Foundation repository path:
   ```bash
   FOUNDATION_REPO_PATH=/path/to/foundation-sites
   ```

3. (Optional) Configure Redis for distributed caching:
   ```bash
   CACHE_BACKEND=redis
   REDIS_URL=redis://localhost:6379
   ```

## Usage

### Development Mode

```bash
npm run start:dev
```

### Production Build

```bash
npm run build
npm start
```

### Running Tests

```bash
npm test
npm run test:watch
```

## Integration with AI Assistants

### GitHub Copilot

Add to your `.copilot-instructions.md`:

```markdown
Use the Foundation MCP server at foundation:// for:
- Generating Foundation plugins and components
- Validating code against Foundation patterns
- Querying architectural guidance
```

### Configure in LM Studio `mcp.json`:

```json
{
  "mcp.servers": {
    "foundation": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "FOUNDATION_REPO_PATH": "/path/to/foundation-sites"
      }
    }
  }
}
```

## Available Resources

- `foundation://plugins/index` - List all Foundation plugins
- `foundation://plugins/{slug}/template` - Get plugin template
- `foundation://plugins/{slug}/docs` - Get plugin documentation
- `foundation://components/{slug}/template` - Get component template
- `foundation://components/{slug}/docs` - Get component documentation
- `foundation://build/config` - Build system configuration
- `foundation://architecture/plugins` - Plugin architecture guide
- `foundation://patterns/tests/{type}` - Test patterns

## Available Tools

### Code Generation
- `generate_plugin` - Generate a new Foundation plugin
- `generate_component` - Generate a new Sass component

### Analysis & Refactoring
- `analyze_pattern` - Analyze code against Foundation patterns
- `find_similar_pattern` - Find similar code patterns
- `query_architecture` - Query architectural guidance
- **`refactor_to_foundation`** - Analyze non-Foundation code and generate comprehensive migration guidance

### Documentation & Reference
- `get_component_reference` - Get component API reference
- `get_plugin_reference` - Get plugin API reference

### Validation
- `validate_plugin` - Validate plugin code

## Architecture

```
src/
├── index.ts              # Entry point
├── server.ts             # MCP server setup
├── config.ts             # Configuration management
├── handlers/
│   ├── resources.ts      # Resource handlers
│   └── tools.ts          # Tool handlers
├── engines/
│   ├── CodebaseIndexer.ts       # Indexes Foundation codebase
│   ├── PluginAnalyzer.ts        # Analyzes plugin patterns
│   ├── RefactoringAnalyzer.ts   # Migration analysis engine
│   ├── ComponentResolver.ts
│   ├── DocsParser.ts
│   └── ArchitectureMap.ts
├── generators/
│   ├── PluginGenerator.ts
│   ├── ComponentGenerator.ts
│   ├── TestGenerator.ts
│   └── DocGenerator.ts
├── validators/
│   ├── PluginValidator.ts
│   ├── ComponentValidator.ts
│   └── AccessibilityValidator.ts
├── types.ts              # TypeScript interfaces
└── utils/
    ├── cache.ts
    ├── fileSystem.ts
    └── parser.ts
```

## Development

See [DEVELOPMENT.md](../DEVELOPMENT.md) for dev guidelines.

### Lint Code

```bash
npm run lint
npm run lint:fix
```

### Build

```bash
npm run build
```

### Clean Build Artifacts

```bash
npm run clean
```

## Refactoring Tool

### Overview
The `refactor_to_foundation` tool analyzes non-Foundation code and provides comprehensive refactoring guidance to migrate to Foundation equivalents.

### Features
- **Feature Detection** - Identifies patterns like dropdowns, accordions, modals, carousels, tooltips, forms
- **Component Matching** - Maps detected features to Foundation plugins/components with similarity scoring
- **Migration Planning** - Generates step-by-step migration guides
- **Code Adaptation** - Provides before/after code examples with specific change lists
- **Breaking Change Analysis** - Identifies jQuery vs vanilla JS differences, unit conversions (px→rem), architecture changes
- **Integration Guidance** - Creates detailed step-by-step implementation guides

### Usage

```typescript
// Input
{
  sourceCode: string,           // Code to analyze
  sourceType: 'custom-plugin' | 'custom-component',
  foundationTarget?: string     // Optional: target version (default: latest)
}

// Output
{
  sourceType: 'custom-plugin' | 'custom-component',
  suggestedFoundationComponents: [{
    name: string,
    slug: string,
    similarity: number,
    description: string
  }],
  migrationSteps: string[],
  codeAdaptation: {
    before: string,
    after: string,
    changes: [{description, reason, foundationAPI}]
  },
  breakingChanges: [{change, impact, solution}],
  recommendedApproach: string,
  integrationGuide: [{step, description, code}]
}
```

### Example

```bash
# Analyze custom dropdown code
{
  "name": "refactor_to_foundation",
  "arguments": {
    "sourceCode": "// your custom dropdown implementation...",
    "sourceType": "custom-plugin",
    "foundationTarget": "6.9"
  }
}
```

The tool will return:
- Best matching Foundation component (e.g., Dropdown plugin with 85% similarity)
- 8-step migration guide
- Before/after code examples
- List of breaking changes and solutions
- Recommended migration strategy
- Step-by-step integration instructions

## License

MIT - See [LICENSE](../LICENSE) for details.
