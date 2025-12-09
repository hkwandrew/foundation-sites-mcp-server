/**
 * Tests for PluginGenerator
 */

import { PluginGenerator } from '../generators/PluginGenerator.js';

describe('PluginGenerator', () => {
  let generator: PluginGenerator;

  beforeEach(() => {
    generator = new PluginGenerator();
  });

  describe('generate', () => {
    it('should generate a plugin with basic features', async () => {
      const result = await generator.generate({
        name: 'TestPlugin',
        slug: 'test-plugin',
        description: 'A test plugin',
        includeTests: false,
        includeDocs: false,
      });

      expect(result.status).toBe('success');
      expect(result.files.plugin).toBeDefined();
      expect(result.files.plugin?.path).toBe('js/foundation.test-plugin.js');
      expect(result.files.plugin?.content).toContain('class TestPlugin extends Plugin');
    });

    it('should generate a plugin with keyboard support', async () => {
      const result = await generator.generate({
        name: 'TestPlugin',
        slug: 'test-plugin',
        description: 'A test plugin',
        includeTests: false,
        includeDocs: false,
        features: {
          keyboard: true,
          nesting: false,
          events: [],
          stateManagement: false,
        },
      });

      expect(result.files.plugin?.content).toContain('Keyboard');
      expect(result.files.plugin?.content).toContain('_setupKeyboard');
    });

    it('should generate a plugin with state management', async () => {
      const result = await generator.generate({
        name: 'TestPlugin',
        slug: 'test-plugin',
        description: 'A test plugin',
        includeTests: false,
        includeDocs: false,
        features: {
          keyboard: false,
          nesting: false,
          events: [],
          stateManagement: true,
        },
      });

      expect(result.files.plugin?.content).toContain('this.isActive');
      expect(result.files.plugin?.content).toContain('open()');
      expect(result.files.plugin?.content).toContain('close()');
    });

    it('should generate test file when requested', async () => {
      const result = await generator.generate({
        name: 'TestPlugin',
        slug: 'test-plugin',
        description: 'A test plugin',
        includeTests: true,
        includeDocs: false,
      });

      expect(result.files.test).toBeDefined();
      expect(result.files.test?.path).toBe('test/javascript/test-plugin.spec.js');
      expect(result.files.test?.content).toContain("describe('TestPlugin'");
    });

    it('should generate documentation when requested', async () => {
      const result = await generator.generate({
        name: 'TestPlugin',
        slug: 'test-plugin',
        description: 'A test plugin',
        includeTests: false,
        includeDocs: true,
      });

      expect(result.files.docs).toBeDefined();
      expect(result.files.docs?.path).toBe('docs/pages/test-plugin.md');
      expect(result.files.docs?.content).toContain('# TestPlugin');
    });

    it('should provide integration steps', async () => {
      const result = await generator.generate({
        name: 'TestPlugin',
        slug: 'test-plugin',
        description: 'A test plugin',
        includeTests: false,
        includeDocs: false,
      });

      expect(result.integrationSteps).toBeDefined();
      expect(result.integrationSteps.length).toBeGreaterThan(0);
      expect(result.integrationSteps[0]).toContain('Import TestPlugin');
    });
  });
});
