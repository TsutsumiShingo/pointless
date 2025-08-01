import settingsSlice, {
  setPreferredLinewidth,
  setLinewidthSliderMode,
  loadSettings,
  saveSettings,
} from './settingsSlice';
import { LINEWIDTH, LINEWIDTH_SLIDER } from '../../components/Paper/constants';
import { SORT_BY, VIEW_MODE } from '../../constants';

// Mock Tauri API
jest.mock('@tauri-apps/api', () => ({
  invoke: jest.fn(),
}));

const { invoke } = require('@tauri-apps/api');

describe('settingsSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      isDarkMode: false,
      platform: null,
      appVersion: null,
      libararysortPapersBy: SORT_BY.NAME_AZ,
      viewMode: VIEW_MODE.GRID,
      canvasPreferredLinewidth: LINEWIDTH.SMALL,
      linewidthSliderMode: false,
    };
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    test('has correct initial values', () => {
      const state = settingsSlice(undefined, { type: '@@INIT' });
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.SMALL);
      expect(state.linewidthSliderMode).toBe(false);
    });
  });

  describe('setPreferredLinewidth', () => {
    test('sets valid linewidth value', () => {
      const action = setPreferredLinewidth(10);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(10);
    });

    test('clamps values below minimum', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const action = setPreferredLinewidth(0);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.MIN);
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('was clamped to')
      );
      
      consoleWarn.mockRestore();
    });

    test('clamps values above maximum', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const action = setPreferredLinewidth(25);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.MAX);
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('was clamped to')
      );
      
      consoleWarn.mockRestore();
    });

    test('handles invalid values', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const action = setPreferredLinewidth('invalid');
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid linewidth value')
      );
      
      consoleWarn.mockRestore();
    });

    test('rounds decimal values', () => {
      const action = setPreferredLinewidth(7.8);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(8);
    });

    test('handles NaN values', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const action = setPreferredLinewidth(NaN);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.DEFAULT);
      
      consoleWarn.mockRestore();
    });

    test('handles Infinity values', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const action = setPreferredLinewidth(Infinity);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.DEFAULT);
      
      consoleWarn.mockRestore();
    });
  });

  describe('setLinewidthSliderMode', () => {
    test('sets slider mode to true', () => {
      const action = setLinewidthSliderMode(true);
      const state = settingsSlice(initialState, action);
      
      expect(state.linewidthSliderMode).toBe(true);
    });

    test('sets slider mode to false', () => {
      const modifiedState = { ...initialState, linewidthSliderMode: true };
      const action = setLinewidthSliderMode(false);
      const state = settingsSlice(modifiedState, action);
      
      expect(state.linewidthSliderMode).toBe(false);
    });

    test('handles non-boolean values', () => {
      const action = setLinewidthSliderMode('true');
      const state = settingsSlice(initialState, action);
      
      // Should accept truthy values
      expect(state.linewidthSliderMode).toBe('true');
    });
  });

  describe('loadSettings', () => {
    test('loads valid settings', () => {
      const settingsData = {
        sortPapersBy: SORT_BY.DATE_CREATED,
        viewMode: VIEW_MODE.LIST,
        canvasPreferredLinewidth: 10,
        linewidthSliderMode: true,
      };

      const action = loadSettings(settingsData);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(10);
      expect(state.linewidthSliderMode).toBe(true);
    });

    test('validates linewidth range during load', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const settingsData = {
        canvasPreferredLinewidth: 100,
        linewidthSliderMode: false,
      };

      const action = loadSettings(settingsData);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.DEFAULT);
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('is out of range')
      );
      
      consoleWarn.mockRestore();
    });

    test('handles negative linewidth during load', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const settingsData = {
        canvasPreferredLinewidth: -5,
      };

      const action = loadSettings(settingsData);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH_SLIDER.DEFAULT);
      
      consoleWarn.mockRestore();
    });

    test('rounds decimal linewidth during load', () => {
      const settingsData = {
        canvasPreferredLinewidth: 7.3,
      };

      const action = loadSettings(settingsData);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(7);
    });

    test('maintains backward compatibility with old preset values', () => {
      const settingsData = {
        canvasPreferredLinewidth: LINEWIDTH.MEDIUM,
        linewidthSliderMode: false,
      };

      const action = loadSettings(settingsData);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.MEDIUM);
    });

    test('handles invalid linewidth type during load', () => {
      const settingsData = {
        canvasPreferredLinewidth: 'invalid',
        linewidthSliderMode: true,
      };

      const action = loadSettings(settingsData);
      const state = settingsSlice(initialState, action);
      
      // Should not change the linewidth if it's invalid
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.SMALL);
      expect(state.linewidthSliderMode).toBe(true);
    });

    test('validates slider mode type during load', () => {
      const settingsData = {
        canvasPreferredLinewidth: 5,
        linewidthSliderMode: 'invalid',
      };

      const action = loadSettings(settingsData);
      const state = settingsSlice(initialState, action);
      
      expect(state.canvasPreferredLinewidth).toBe(5);
      // Should not change slider mode if it's not boolean
      expect(state.linewidthSliderMode).toBe(false);
    });

    test('handles null settings data', () => {
      const action = loadSettings(null);
      const state = settingsSlice(initialState, action);
      
      // Should not change any values
      expect(state).toEqual(initialState);
    });

    test('handles empty settings object', () => {
      const action = loadSettings({});
      const state = settingsSlice(initialState, action);
      
      // Should not change any values
      expect(state).toEqual(initialState);
    });
  });

  describe('saveSettings thunk', () => {
    test('calls Tauri invoke with correct settings', async () => {
      invoke.mockResolvedValue();
      
      const mockState = {
        settings: {
          sortPapersBy: SORT_BY.NAME_AZ,
          viewMode: VIEW_MODE.GRID,
          canvasPreferredLinewidth: 10,
          linewidthSliderMode: true,
        },
      };

      const mockDispatch = jest.fn();
      const mockGetState = jest.fn(() => mockState);

      await saveSettings()(mockDispatch, mockGetState);

      expect(invoke).toHaveBeenCalledWith('save_settings', {
        settings: JSON.stringify({
          sortPapersBy: SORT_BY.NAME_AZ,
          viewMode: VIEW_MODE.GRID,
          canvasPreferredLinewidth: 10,
          linewidthSliderMode: true,
        }),
      });
    });

    test('handles save errors gracefully', async () => {
      invoke.mockRejectedValue(new Error('Save failed'));
      
      const mockState = {
        settings: {
          sortPapersBy: SORT_BY.NAME_AZ,
          viewMode: VIEW_MODE.GRID,
          canvasPreferredLinewidth: 5,
          linewidthSliderMode: false,
        },
      };

      const mockDispatch = jest.fn();
      const mockGetState = jest.fn(() => mockState);

      // Should not throw
      await expect(saveSettings()(mockDispatch, mockGetState)).rejects.toThrow('Save failed');
    });
  });

  describe('Redux integration', () => {
    test('action creators return correct actions', () => {
      expect(setPreferredLinewidth(10)).toEqual({
        type: 'settings/setPreferredLinewidth',
        payload: 10,
      });

      expect(setLinewidthSliderMode(true)).toEqual({
        type: 'settings/setLinewidthSliderMode',
        payload: true,
      });
    });

    test('reducer handles unknown actions without error', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const state = settingsSlice(initialState, unknownAction);
      
      expect(state).toEqual(initialState);
    });
  });
});