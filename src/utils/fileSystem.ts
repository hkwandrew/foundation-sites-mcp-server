/**
 * File system utilities for Foundation MCP Server
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * Write file content
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * List files in directory
 */
export async function listFiles(
  directory: string,
  recursive: boolean = false
): Promise<string[]> {
  const pattern = recursive ? '**/*' : '*';
  const files = await glob(pattern, {
    cwd: directory,
    nodir: true,
    absolute: true,
  });
  return files;
}

/**
 * Find files by pattern
 */
export async function findFiles(
  baseDir: string,
  pattern: string
): Promise<string[]> {
  return glob(pattern, {
    cwd: baseDir,
    nodir: true,
    absolute: true,
  });
}

/**
 * Get file stats
 */
export async function getFileStats(filePath: string) {
  return fs.stat(filePath);
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Get relative path from base
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * Join paths
 */
export function joinPath(...paths: string[]): string {
  return path.join(...paths);
}

/**
 * Get file extension
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath);
}

/**
 * Get filename without extension
 */
export function getBasename(filePath: string, ext?: string): string {
  return path.basename(filePath, ext);
}

/**
 * Get directory name
 */
export function getDirname(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Resolve path
 */
export function resolvePath(...paths: string[]): string {
  return path.resolve(...paths);
}

/**
 * Read directory contents
 */
export async function readDir(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile())
    .map(entry => path.join(dirPath, entry.name));
}

/**
 * Copy file
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  const dir = path.dirname(dest);
  await fs.mkdir(dir, { recursive: true });
  await fs.copyFile(src, dest);
}
