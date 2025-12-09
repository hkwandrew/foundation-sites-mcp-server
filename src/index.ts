/**
 * Entry point for Foundation MCP Server
 */

import { getConfig, validateConfig } from './config.js';
import { FoundationMCPServer } from './server.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    // Load and validate configuration
    const config = getConfig();
    validateConfig(config);

    // Create and start server
    const server = new FoundationMCPServer(config);
    await server.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await server.stop();
      process.exit(0);
    });

    // Keep the server running - don't exit the process
    // The stdio transport will handle communication with the client
    process.stdin.on('close', async () => {
      logger.info('stdin closed, shutting down...');
      await server.stop();
      process.exit(0);
    });

    process.stdin.on('error', (error) => {
      logger.error('stdin error', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server
main();
