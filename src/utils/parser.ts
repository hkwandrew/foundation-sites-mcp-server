/**
 * Parser utilities for JavaScript and SCSS files
 */

import { parse as babelParse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import * as t from '@babel/types';

// Handle both CommonJS and ES module exports from @babel/traverse
const traverse = (traverseModule as any).default || traverseModule;
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import { ParsedPlugin, ParsedComponent, ParseError } from '../types.js';

/**
 * Parse JavaScript plugin file
 */
export async function parsePlugin(code: string): Promise<ParsedPlugin> {
  try {
    const ast = babelParse(code, {
      sourceType: 'module',
      plugins: ['classProperties', 'decorators-legacy'],
    });

    let className = '';
    let extendsClass: string | null = null;
    const methods: string[] = [];
    const properties: string[] = [];
    const events: string[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    traverse(ast, {
      ImportDeclaration(path: any) {
        if (path.node.source.value) {
          imports.push(path.node.source.value);
        }
      },

      ExportNamedDeclaration(path: any) {
        if (t.isClassDeclaration(path.node.declaration)) {
          const classDecl = path.node.declaration;
          if (classDecl.id) {
            className = classDecl.id.name;
            exports.push(className);
          }

          if (classDecl.superClass && t.isIdentifier(classDecl.superClass)) {
            extendsClass = classDecl.superClass.name;
          }

          // Extract methods and properties
          classDecl.body.body.forEach((member: any) => {
            if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
              methods.push(member.key.name);
            } else if (t.isClassProperty(member) && t.isIdentifier(member.key)) {
              properties.push(member.key.name);
            }
          });
        }
      },

      ClassDeclaration(path: any) {
        if (!className && path.node.id) {
          className = path.node.id.name;
        }

        if (!extendsClass && path.node.superClass && t.isIdentifier(path.node.superClass)) {
          extendsClass = path.node.superClass.name;
        }

        path.node.body.body.forEach((member: any) => {
          if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
            const methodName = member.key.name;
            if (!methods.includes(methodName)) {
              methods.push(methodName);
            }
          } else if (t.isClassProperty(member) && t.isIdentifier(member.key)) {
            const propName = member.key.name;
            if (!properties.includes(propName)) {
              properties.push(propName);
            }
          }
        });
      },

      // Look for event firing patterns
      CallExpression(path: any) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.property) &&
          (path.node.callee.property.name === 'trigger' ||
            path.node.callee.property.name === 'fire')
        ) {
          const firstArg = path.node.arguments[0];
          if (t.isStringLiteral(firstArg)) {
            events.push(firstArg.value);
          }
        }
      },
    });

    return {
      className,
      methods,
      properties,
      events,
      extendsClass,
      imports,
      exports,
    };
  } catch (error) {
    throw new ParseError(
      `Failed to parse JavaScript plugin: ${(error as Error).message}`,
      { code }
    );
  }
}

/**
 * Parse SCSS component file
 */
export async function parseComponent(code: string): Promise<ParsedComponent> {
  try {
    const result = postcss().process(code, {
      syntax: postcssScss,
      from: undefined,
    });

    const variables: Array<{
      name: string;
      defaultValue: string;
      description?: string;
    }> = [];

    const mixins: Array<{
      name: string;
      parameters: string[];
      description?: string;
    }> = [];

    const classes: string[] = [];

    let currentComment = '';

    result.root.walkComments((comment) => {
      currentComment = comment.text.trim();
    });

    result.root.walkDecls((decl) => {
      // Extract Sass variables
      if (decl.prop.startsWith('$')) {
        variables.push({
          name: decl.prop,
          defaultValue: decl.value,
          description: currentComment || undefined,
        });
        currentComment = '';
      }
    });

    result.root.walkAtRules((rule) => {
      // Extract mixins
      if (rule.name === 'mixin') {
        const params = rule.params.split('(');
        const name = params[0].trim();
        const parameters = params[1]
          ? params[1].replace(')', '').split(',').map(p => p.trim())
          : [];

        mixins.push({
          name,
          parameters,
          description: currentComment || undefined,
        });
        currentComment = '';
      }
    });

    result.root.walkRules((rule) => {
      // Extract class names
      rule.selectors.forEach((selector) => {
        const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/g);
        if (classMatch) {
          classMatch.forEach((cls) => {
            const className = cls.substring(1); // Remove the dot
            if (!classes.includes(className)) {
              classes.push(className);
            }
          });
        }
      });
    });

    return {
      variables,
      mixins,
      classes,
    };
  } catch (error) {
    throw new ParseError(
      `Failed to parse SCSS component: ${(error as Error).message}`,
      { code }
    );
  }
}

/**
 * Extract JSDoc comments from code
 */
export function extractJSDoc(code: string): Record<string, string> {
  const jsdocPattern = /\/\*\*([\s\S]*?)\*\//g;
  const docs: Record<string, string> = {};
  let match;

  while ((match = jsdocPattern.exec(code)) !== null) {
    const comment = match[1];
    
    // Extract @description or first line
    const descMatch = comment.match(/@description\s+(.+)/);
    const nameMatch = comment.match(/@(?:class|function|method)\s+(\w+)/);
    
    if (nameMatch) {
      const name = nameMatch[1];
      const description = descMatch ? descMatch[1] : 
        comment.split('\n')[0].replace(/^\s*\*\s*/, '').trim();
      docs[name] = description;
    }
  }

  return docs;
}

/**
 * Extract Sass doc comments
 */
export function extractSassDoc(code: string): Record<string, string> {
  const docs: Record<string, string> = {};
  let currentDoc = '';
  let currentName = '';

  const lines = code.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('///')) {
      currentDoc += line.replace(/\/\/\/\s*/, '').trim() + ' ';
    } else if (currentDoc && line.includes('@mixin')) {
      const mixinMatch = line.match(/@mixin\s+([a-zA-Z0-9_-]+)/);
      if (mixinMatch) {
        currentName = mixinMatch[1];
        docs[currentName] = currentDoc.trim();
        currentDoc = '';
      }
    } else if (currentDoc && line.includes('$')) {
      const varMatch = line.match(/\$([a-zA-Z0-9_-]+)/);
      if (varMatch) {
        currentName = varMatch[1];
        docs[currentName] = currentDoc.trim();
        currentDoc = '';
      }
    } else if (currentDoc && line.trim() === '') {
      continue;
    } else if (currentDoc) {
      currentDoc = '';
    }
  }

  return docs;
}

/**
 * Detect if code is a valid Foundation plugin
 */
export function isFoundationPlugin(parsed: ParsedPlugin): boolean {
  return (
    parsed.extendsClass === 'Plugin' &&
    parsed.methods.includes('_init') &&
    parsed.methods.includes('_destroy')
  );
}

/**
 * Detect if code is a valid Foundation component
 */
export function isFoundationComponent(parsed: ParsedComponent): boolean {
  return (
    parsed.variables.length > 0 &&
    parsed.mixins.length > 0
  );
}
