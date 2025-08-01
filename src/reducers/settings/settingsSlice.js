import { createSlice } from '@reduxjs/toolkit';
import { LINEWIDTH, LINEWIDTH_SLIDER } from '../../components/Paper/constants';
import { SORT_BY, VIEW_MODE } from '../../constants';
import { invoke } from '@tauri-apps/api';

const initialState = {
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)'),
  platform: null,
  appVersion: null,
  libararysortPapersBy: SORT_BY.NAME_AZ,
  viewMode: VIEW_MODE.GRID,
  canvasPreferredLinewidth: LINEWIDTH.SMALL,
  linewidthSliderMode: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setPlatform: (state, action) => {
      state.platform = action.payload;
    },
    setAppVersion: (state, action) => {
      state.appVersion = action.payload;
    },
    setPreferredLinewidth: (state, action) => {
      const value = Number(action.payload);
      
      // Validate the linewidth value
      if (isNaN(value) || !isFinite(value)) {
        console.warn(`Invalid linewidth value: ${action.payload}. Using default: ${LINEWIDTH_SLIDER.DEFAULT}`);
        state.canvasPreferredLinewidth = LINEWIDTH_SLIDER.DEFAULT;
        return;
      }
      
      // Clamp to acceptable range
      const clampedValue = Math.max(
        LINEWIDTH_SLIDER.MIN,
        Math.min(LINEWIDTH_SLIDER.MAX, Math.round(value))
      );
      
      if (clampedValue !== value) {
        console.warn(`Linewidth value ${value} was clamped to ${clampedValue}`);
      }
      
      state.canvasPreferredLinewidth = clampedValue;
    },
    setLinewidthSliderMode: (state, action) => {
      state.linewidthSliderMode = action.payload;
    },
    setSortPapersBy: (state, action) => {
      state.sortPapersBy = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    loadSettings: (state, action) => {
      if (action.payload && typeof action.payload === 'object') {
        if (Object.values(SORT_BY).includes(action.payload.sortPapersBy)) {
          state.sortPapersBy = action.payload.sortPapersBy;
        }

        if (Object.values(VIEW_MODE).includes(action.payload.viewMode)) {
          state.viewMode = action.payload.viewMode;
        }

        // Validate and set linewidth with expanded range support
        if (typeof action.payload.canvasPreferredLinewidth === 'number') {
          const linewidth = action.payload.canvasPreferredLinewidth;
          
          if (linewidth >= LINEWIDTH_SLIDER.MIN && linewidth <= LINEWIDTH_SLIDER.MAX) {
            state.canvasPreferredLinewidth = Math.round(linewidth);
          } else {
            console.warn(`Loaded linewidth ${linewidth} is out of range. Using default: ${LINEWIDTH_SLIDER.DEFAULT}`);
            state.canvasPreferredLinewidth = LINEWIDTH_SLIDER.DEFAULT;
          }
        } else if (Object.values(LINEWIDTH).includes(action.payload.canvasPreferredLinewidth)) {
          // Backward compatibility for old preset values
          state.canvasPreferredLinewidth = action.payload.canvasPreferredLinewidth;
        }

        if (typeof action.payload.linewidthSliderMode === 'boolean') {
          state.linewidthSliderMode = action.payload.linewidthSliderMode;
        }
      }
    },
  },
});

export const saveSettings = () => async (dispatch, getState) => {
  const { sortPapersBy, viewMode, canvasPreferredLinewidth, linewidthSliderMode } = getState().settings;
  const settings = {
    sortPapersBy,
    viewMode,
    canvasPreferredLinewidth,
    linewidthSliderMode,
  };

  await invoke('save_settings', { settings: JSON.stringify(settings) });
};

export const {
  setDarkMode,
  setPlatform,
  setAppVersion,
  loadSettings,
  setSortPapersBy,
  setViewMode,
  setPreferredLinewidth,
  setLinewidthSliderMode,
} = settingsSlice.actions;

export default settingsSlice.reducer;
