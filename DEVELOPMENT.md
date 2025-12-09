# Foundation Sites MCP Server - Development Guide

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Yarn or npm
- Foundation Sites repository cloned locally

### Installation

```bash
cd mcp-server
yarn install
```

### Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your Foundation repository path:

```env
FOUNDATION_REPO_PATH=/path/to/foundation-sites
```

### Development

Run in development mode with hot reload:

```bash
yarn start:dev
```

Run in production mode:

```bash
yarn build
yarn start
```

## Project Structure

```
mcp-server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # MCP server implementation
│   ├── config.ts                # Configuration management
│   ├── types.ts                 # TypeScript type definitions
│   ├── handlers/
│   │   ├── resources.ts         # Resource request handlers
│   │   └── tools.ts             # Tool request handlers
│   ├── engines/
│   │   ├── CodebaseIndexer.ts   # Index Foundation codebase
│   │   └── PluginAnalyzer.ts    # Analyze plugin patterns
│   ├── generators/
│   │   ├── PluginGenerator.ts   # Generate plugins
│   │   └── ComponentGenerator.ts # Generate components
│   └── utils/
│       ├── cache.ts             # Caching utilities
│       ├── fileSystem.ts        # File system helpers
│       ├── parser.ts            # Code parsing utilities
│       └── logger.ts            # Logging utility
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Testing

Run all tests:

```bash
yarn test
```

Run tests in watch mode:

```bash
yarn test:watch
```

Run tests with coverage:

```bash
yarn test --coverage
```

## Code Quality

### Linting

```bash
yarn lint
yarn lint:fix
```

### Type Checking

```bash
yarn build --noEmit
```

## Adding New Features

### Adding a New Resource

1. Update `ResourceHandler.listResources()` in `src/handlers/resources.ts`
2. Add handler method in `ResourceHandler` class
3. Update routing in `ResourceHandler.readResource()`

Example:

```typescript
// In listResources()
{
  uri: 'foundation://my-resource',
  name: 'My Resource',
  description: 'Description of my resource',
  mimeType: 'application/json',
}

// Add handler
private async getMyResource() {
  const data = { /* ... */ };
  return {
    contents: [{
      uri: 'foundation://my-resource',
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2),
    }],
  };
}

// In readResource()
if (uri === 'foundation://my-resource') {
  return this.getMyResource();
}
```

### Adding a New Tool

1. Define schema in `src/types.ts`:

```typescript
export const MyToolSchema = z.object({
  param1: z.string(),
  param2: z.number().optional(),
});

export type MyToolParams = z.infer<typeof MyToolSchema>;
```

2. Add to `ToolHandler.listTools()` in `src/handlers/tools.ts`
3. Add handler method in `ToolHandler` class
4. Update switch statement in `ToolHandler.callTool()`

Example:

```typescript
// In listTools()
{
  name: 'my_tool',
  description: 'Description of my tool',
  inputSchema: MyToolSchema,
}

// Add handler
private async handleMyTool(args: any) {
  const params = MyToolSchema.parse(args);
  // Implement tool logic
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2),
    }],
  };
}

// In callTool()
case 'my_tool':
  return await this.handleMyTool(args);
```

### Adding a New Generator

1. Create generator class in `src/generators/`
2. Implement `generate()` method
3. Add to `FoundationMCPServer` constructor
4. Wire up in `ToolHandler`

## Debugging

### Enable Debug Logging

Set `MCP_LOG_LEVEL=debug` in `.env`:

```env
MCP_LOG_LEVEL=debug
```

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug MCP Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/mcp-server/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/mcp-server/dist/**/*.js"],
      "envFile": "${workspaceFolder}/mcp-server/.env"
    }
  ]
}
```

## Performance Optimization

### Caching

The server uses LRU caching by default. For better performance in production:

1. Use Redis cache backend:

```env
CACHE_BACKEND=redis
REDIS_URL=redis://localhost:6379
```

2. Adjust cache TTL and size:

```env
CACHE_TTL=7200
CACHE_MAX_SIZE=5000
```

### Indexing

The codebase index is built on startup. For large repositories:

1. Increase cache TTL to reduce re-indexing
2. Consider implementing incremental indexing with file watchers

## Deployment

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . .
RUN yarn build

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t foundation-mcp .
docker run -p 8000:8000 -e FOUNDATION_REPO_PATH=/data/foundation-sites foundation-mcp
```

### Systemd Service

Create `/etc/systemd/system/foundation-mcp.service`:

```ini
[Unit]
Description=Foundation MCP Server
After=network.target

[Service]
Type=simple
User=mcp
WorkingDirectory=/opt/foundation-mcp
Environment="NODE_ENV=production"
EnvironmentFile=/opt/foundation-mcp/.env
ExecStart=/usr/bin/node /opt/foundation-mcp/dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable foundation-mcp
sudo systemctl start foundation-mcp
```

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run linting and tests
4. Submit a pull request

## Troubleshooting

### Server won't start

- Check `FOUNDATION_REPO_PATH` is correct
- Verify Node.js version is ≥18
- Check logs with `MCP_LOG_LEVEL=debug`

### Cache issues

- Clear cache: `redis-cli FLUSHDB` (if using Redis)
- Restart server to rebuild index

### Parser errors

- Check Foundation repository is up to date
- Verify file permissions on repository

## License

MIT - See [LICENSE](../../LICENSE)
