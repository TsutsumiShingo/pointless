import {
  validateLinewidth,
  isPresetLinewidth,
  getClosestPresetLinewidth,
  loadLinewidthSettings,
  handleSliderDisabled,
  parseInputValue,
  createLinewidthErrorHandler,
} from './validation';
import { LINEWIDTH, LINEWIDTH_SLIDER } from '../../constants';

describe('Validation Functions', () => {
  describe('validateLinewidth', () => {
    test('returns valid number within range', () => {
      expect(validateLinewidth(10)).toBe(10);
      expect(validateLinewidth(1)).toBe(1);
      expect(validateLinewidth(20)).toBe(20);
    });

    test('clamps values below minimum', () => {
      expect(validateLinewidth(0)).toBe(LINEWIDTH_SLIDER.MIN);
      expect(validateLinewidth(-5)).toBe(LINEWIDTH_SLIDER.MIN);
    });

    test('clamps values above maximum', () => {
      expect(validateLinewidth(25)).toBe(LINEWIDTH_SLIDER.MAX);
      expect(validateLinewidth(100)).toBe(LINEWIDTH_SLIDER.MAX);
    });

    test('returns default for invalid values', () => {
      expect(validateLinewidth(NaN)).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(validateLinewidth(undefined)).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(validateLinewidth(null)).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(validateLinewidth(Infinity)).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(validateLinewidth(-Infinity)).toBe(LINEWIDTH_SLIDER.DEFAULT);
    });

    test('rounds decimal values', () => {
      expect(validateLinewidth(5.3)).toBe(5);
      expect(validateLinewidth(5.7)).toBe(6);
      expect(validateLinewidth(10.5)).toBe(11);
    });

    test('handles string numbers', () => {
      expect(validateLinewidth('10')).toBe(10);
      expect(validateLinewidth('5.5')).toBe(6);
    });

    test('handles non-numeric strings', () => {
      expect(validateLinewidth('abc')).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(validateLinewidth('')).toBe(LINEWIDTH_SLIDER.DEFAULT);
    });
  });

  describe('isPresetLinewidth', () => {
    test('returns true for preset values', () => {
      expect(isPresetLinewidth(LINEWIDTH.SMALL)).toBe(true);
      expect(isPresetLinewidth(LINEWIDTH.MEDIUM)).toBe(true);
      expect(isPresetLinewidth(LINEWIDTH.LARGE)).toBe(true);
    });

    test('returns false for non-preset values', () => {
      expect(isPresetLinewidth(1)).toBe(false);
      expect(isPresetLinewidth(3)).toBe(false);
      expect(isPresetLinewidth(10)).toBe(false);
      expect(isPresetLinewidth(20)).toBe(false);
    });

    test('handles edge cases', () => {
      expect(isPresetLinewidth(null)).toBe(false);
      expect(isPresetLinewidth(undefined)).toBe(false);
      expect(isPresetLinewidth(NaN)).toBe(false);
    });
  });

  describe('getClosestPresetLinewidth', () => {
    test('returns closest preset for values between presets', () => {
      expect(getClosestPresetLinewidth(1)).toBe(LINEWIDTH.SMALL); // 2
      expect(getClosestPresetLinewidth(3)).toBe(LINEWIDTH.SMALL); // 2
      expect(getClosestPresetLinewidth(4)).toBe(LINEWIDTH.MEDIUM); // 5
      expect(getClosestPresetLinewidth(6)).toBe(LINEWIDTH.MEDIUM); // 5
      expect(getClosestPresetLinewidth(7)).toBe(LINEWIDTH.LARGE); // 8
      expect(getClosestPresetLinewidth(10)).toBe(LINEWIDTH.LARGE); // 8
    });

    test('returns exact preset for preset values', () => {
      expect(getClosestPresetLinewidth(LINEWIDTH.SMALL)).toBe(LINEWIDTH.SMALL);
      expect(getClosestPresetLinewidth(LINEWIDTH.MEDIUM)).toBe(LINEWIDTH.MEDIUM);
      expect(getClosestPresetLinewidth(LINEWIDTH.LARGE)).toBe(LINEWIDTH.LARGE);
    });

    test('handles boundary cases', () => {
      expect(getClosestPresetLinewidth(3.5)).toBe(LINEWIDTH.SMALL); // Equal distance, should return first found
      expect(getClosestPresetLinewidth(6.5)).toBe(LINEWIDTH.MEDIUM);
    });
  });

  describe('loadLinewidthSettings', () => {
    test('loads valid settings correctly', () => {
      const settings = {
        canvasPreferredLinewidth: 10,
        linewidthSliderMode: true,
      };

      const result = loadLinewidthSettings(settings);
      
      expect(result.canvasPreferredLinewidth).toBe(10);
      expect(result.linewidthSliderMode).toBe(true);
    });

    test('uses defaults for invalid settings', () => {
      const result = loadLinewidthSettings(null);
      
      expect(result.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(result.linewidthSliderMode).toBe(false);
    });

    test('validates linewidth range', () => {
      const settings = {
        canvasPreferredLinewidth: 100,
        linewidthSliderMode: false,
      };

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = loadLinewidthSettings(settings);
      
      expect(result.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('is out of range')
      );
      
      consoleWarn.mockRestore();
    });

    test('rounds decimal linewidth values', () => {
      const settings = {
        canvasPreferredLinewidth: 7.8,
        linewidthSliderMode: true,
      };

      const result = loadLinewidthSettings(settings);
      expect(result.canvasPreferredLinewidth).toBe(8);
    });

    test('handles invalid linewidth types', () => {
      const settings = {
        canvasPreferredLinewidth: 'invalid',
        linewidthSliderMode: true,
      };

      const result = loadLinewidthSettings(settings);
      expect(result.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.DEFAULT);
    });

    test('handles invalid slider mode types', () => {
      const settings = {
        canvasPreferredLinewidth: 5,
        linewidthSliderMode: 'invalid',
      };

      const result = loadLinewidthSettings(settings);
      expect(result.linewidthSliderMode).toBe(false);
    });
  });

  describe('handleSliderDisabled', () => {
    test('returns closest preset when switching from slider mode with custom value', () => {
      const result = handleSliderDisabled(7, true);
      expect(result).toBe(LINEWIDTH.LARGE);
    });

    test('keeps current value when not switching from slider mode', () => {
      const result = handleSliderDisabled(LINEWIDTH.MEDIUM, false);
      expect(result).toBe(LINEWIDTH.MEDIUM);
    });

    test('keeps preset values when switching from slider mode', () => {
      const result = handleSliderDisabled(LINEWIDTH.SMALL, true);
      expect(result).toBe(LINEWIDTH.SMALL);
    });

    test('validates current value', () => {
      const result = handleSliderDisabled(100, false);
      expect(result).toBe(LINEWIDTH_SLIDER.MAX);
    });
  });

  describe('parseInputValue', () => {
    test('parses event objects correctly', () => {
      const event = {
        target: { value: '10' }
      };
      
      expect(parseInputValue(event)).toBe(10);
    });

    test('parses direct values correctly', () => {
      expect(parseInputValue(15)).toBe(15);
      expect(parseInputValue('8')).toBe(8);
    });

    test('handles invalid event objects', () => {
      const invalidEvent = {
        target: { value: 'invalid' }
      };
      
      expect(parseInputValue(invalidEvent)).toBe(LINEWIDTH_SLIDER.DEFAULT);
    });

    test('handles non-event objects', () => {
      expect(parseInputValue({})).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(parseInputValue({ value: 10 })).toBe(LINEWIDTH_SLIDER.DEFAULT);
    });
  });

  describe('createLinewidthErrorHandler', () => {
    test('creates error handler function', () => {
      const handler = createLinewidthErrorHandler('TestComponent');
      expect(typeof handler).toBe('function');
    });

    test('logs errors correctly', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const handler = createLinewidthErrorHandler('TestComponent');
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'test stack' };
      
      handler(error, errorInfo);
      
      expect(consoleError).toHaveBeenCalledWith('Error in TestComponent:', error);
      expect(consoleError).toHaveBeenCalledWith('Error info:', errorInfo);
      
      consoleError.mockRestore();
    });

    test('logs component stack in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const handler = createLinewidthErrorHandler('TestComponent');
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'test stack' };
      
      handler(error, errorInfo);
      
      expect(consoleError).toHaveBeenCalledWith('Component stack:', 'test stack');
      
      consoleError.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    test('does not log component stack in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const handler = createLinewidthErrorHandler('TestComponent');
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'test stack' };
      
      handler(error, errorInfo);
      
      expect(consoleError).not.toHaveBeenCalledWith('Component stack:', expect.anything());
      
      consoleError.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });
});