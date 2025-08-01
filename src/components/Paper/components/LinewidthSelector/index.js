import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import Tooltip from 'rc-tooltip';
import styles from './styles.module.css';
import LinewidthSlider from '../LinewidthSlider';
import { LINEWIDTH, LINEWIDTH_PRESETS } from '../../constants';
import { setLinewidthSliderMode } from '../../../../reducers/settings/settingsSlice';
import { 
  validateLinewidth, 
  isPresetLinewidth, 
  getClosestPresetLinewidth, 
  handleSliderDisabled 
} from './validation';

// Icon for toggle button (we'll use a simple SVG)
function SliderToggleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="6" width="12" height="4" rx="2" />
      <circle cx="6" cy="8" r="3" fill="var(--color-bg-primary)" />
    </svg>
  );
}

function LinewidthSelector({ linewidth, isDrawMode, onLinewidthChange }) {
  const dispatch = useDispatch();
  const linewidthSliderMode = useSelector((state) => state.settings.linewidthSliderMode);
  const [sliderValue, setSliderValue] = useState(validateLinewidth(linewidth));
  const [lastValidValue, setLastValidValue] = useState(validateLinewidth(linewidth));

  // Sync slider value with prop changes
  useEffect(() => {
    const validatedLinewidth = validateLinewidth(linewidth);
    setSliderValue(validatedLinewidth);
    setLastValidValue(validatedLinewidth);
  }, [linewidth]);

  // Handle preset button click
  const handlePresetClick = (presetValue) => {
    try {
      const validatedValue = validateLinewidth(presetValue);
      setSliderValue(validatedValue);
      setLastValidValue(validatedValue);
      onLinewidthChange(validatedValue);
    } catch (error) {
      console.error('Error in handlePresetClick:', error);
      // Fallback to last valid value
      onLinewidthChange(lastValidValue);
    }
  };

  // Handle slider change (real-time)
  const handleSliderChange = (value) => {
    try {
      const validatedValue = validateLinewidth(value);
      setSliderValue(validatedValue);
      onLinewidthChange(validatedValue);
    } catch (error) {
      console.error('Error in handleSliderChange:', error);
      // Fallback to last valid value
      setSliderValue(lastValidValue);
      onLinewidthChange(lastValidValue);
    }
  };

  // Handle slider change complete (for performance)
  const handleSliderChangeComplete = (value) => {
    try {
      const validatedValue = validateLinewidth(value);
      setLastValidValue(validatedValue);
      onLinewidthChange(validatedValue);
    } catch (error) {
      console.error('Error in handleSliderChangeComplete:', error);
      // Fallback to last valid value
      onLinewidthChange(lastValidValue);
    }
  };

  // Toggle between preset and slider mode
  const handleModeToggle = () => {
    try {
      const newMode = !linewidthSliderMode;
      dispatch(setLinewidthSliderMode(newMode));
      
      // If switching to preset mode and current value is not a preset,
      // find the closest preset
      if (!newMode && !isPresetLinewidth(linewidth)) {
        const closest = getClosestPresetLinewidth(linewidth);
        handlePresetClick(closest);
      }
    } catch (error) {
      console.error('Error in handleModeToggle:', error);
      // Fallback: keep current mode but ensure valid value
      const validatedValue = validateLinewidth(linewidth);
      if (validatedValue !== linewidth) {
        onLinewidthChange(validatedValue);
      }
    }
  };

  // Render preset buttons
  const renderPresetButtons = () => {
    return LINEWIDTH_PRESETS.map((preset) => (
      <Tooltip key={preset.key} placement="top" overlay={preset.label}>
        <button
          type="button"
          onClick={() => handlePresetClick(preset.value)}
          disabled={!isDrawMode}
          className={classNames(
            styles.presetButton,
            styles[`presetButton${preset.key.toLowerCase()}`],
            {
              [styles.presetButtonDisabled]: !isDrawMode,
              [styles.presetButtonActive]: 
                linewidth === preset.value && (!linewidthSliderMode || isPresetLinewidth(linewidth)),
            }
          )}
          aria-label={`Set line width to ${preset.value} pixels (${preset.key.toLowerCase()} size)`}
          aria-pressed={linewidth === preset.value && (!linewidthSliderMode || isPresetLinewidth(linewidth))}
          tabIndex={!isDrawMode ? -1 : 0}
        />
      </Tooltip>
    ));
  };

  // Render mode toggle button
  const renderModeToggle = () => (
    <Tooltip
      placement="top"
      overlay={linewidthSliderMode ? "Switch to preset mode" : "Switch to slider mode"}
    >
      <button
        type="button"
        onClick={handleModeToggle}
        disabled={!isDrawMode}
        className={classNames(styles.toggleButton, {
          [styles.toggleButtonActive]: linewidthSliderMode,
          [styles.toggleButtonDisabled]: !isDrawMode,
        })}
        aria-label={linewidthSliderMode ? "Switch to preset mode" : "Switch to slider mode"}
        aria-pressed={linewidthSliderMode}
        tabIndex={!isDrawMode ? -1 : 0}
      >
        <SliderToggleIcon />
      </button>
    </Tooltip>
  );

  // Render slider component
  const renderSlider = () => {
    if (!linewidthSliderMode) return null;
    
    return (
      <div className={styles.sliderWrapper}>
        <LinewidthSlider
          value={sliderValue}
          disabled={!isDrawMode}
          onChange={handleSliderChange}
          onChangeComplete={handleSliderChangeComplete}
        />
      </div>
    );
  };

  return (
    <div 
      className={styles.linewidthSelector}
      role="group"
      aria-label="Line width selection controls"
    >
      <div className={styles.presetContainer} role="toolbar" aria-label="Line width preset and mode controls">
        {renderPresetButtons()}
        {renderModeToggle()}
      </div>
      {renderSlider()}
    </div>
  );
}

export default LinewidthSelector;