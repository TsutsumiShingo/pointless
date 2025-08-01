import { LINEWIDTH, LINEWIDTH_SLIDER } from '../../constants';

/**
 * Validates and clamps linewidth value to acceptable range
 * @param {number|string} value - The value to validate
 * @returns {number} - Valid linewidth value within acceptable range
 */
export const validateLinewidth = (value) => {
  const numValue = Number(value);
  
  // Return default if not a valid number
  if (isNaN(numValue) || !isFinite(numValue)) {
    return LINEWIDTH_SLIDER.DEFAULT;
  }
  
  // Clamp to acceptable range and round to integer
  return Math.max(
    LINEWIDTH_SLIDER.MIN,
    Math.min(LINEWIDTH_SLIDER.MAX, Math.round(numValue))
  );
};

/**
 * Checks if a linewidth value matches one of the preset values
 * @param {number} value - The linewidth value to check
 * @returns {boolean} - True if value matches a preset
 */
export const isPresetLinewidth = (value) => {
  return Object.values(LINEWIDTH).includes(value);
};

/**
 * Finds the closest preset value to a given linewidth
 * @param {number} currentLinewidth - The current linewidth value
 * @returns {number} - The closest preset linewidth value
 */
export const getClosestPresetLinewidth = (currentLinewidth) => {
  const presetValues = Object.values(LINEWIDTH);
  
  return presetValues.reduce((closest, preset) => 
    Math.abs(preset - currentLinewidth) < Math.abs(closest - currentLinewidth) 
      ? preset : closest
  );
};

/**
 * Validates and processes settings data for linewidth restoration
 * @param {Object} savedSettings - The saved settings object
 * @returns {Object} - Processed settings with validated linewidth values
 */
export const loadLinewidthSettings = (savedSettings) => {
  if (!savedSettings || typeof savedSettings !== 'object') {
    return {
      canvasPreferredLinewidth: LINEWIDTH_SLIDER.DEFAULT,
      linewidthSliderMode: false,
    };
  }
  
  const result = {
    linewidthSliderMode: typeof savedSettings.linewidthSliderMode === 'boolean' 
      ? savedSettings.linewidthSliderMode 
      : false,
  };
  
  // Validate linewidth value
  if (typeof savedSettings.canvasPreferredLinewidth === 'number') {
    const linewidth = savedSettings.canvasPreferredLinewidth;
    
    // Check if value is within acceptable range
    if (linewidth >= LINEWIDTH_SLIDER.MIN && linewidth <= LINEWIDTH_SLIDER.MAX) {
      result.canvasPreferredLinewidth = Math.round(linewidth);
    } else {
      // Use default for out-of-range values
      result.canvasPreferredLinewidth = LINEWIDTH_SLIDER.DEFAULT;
      console.warn(`Linewidth value ${linewidth} is out of range. Using default: ${LINEWIDTH_SLIDER.DEFAULT}`);
    }
  } else {
    result.canvasPreferredLinewidth = LINEWIDTH_SLIDER.DEFAULT;
  }
  
  return result;
};

/**
 * Handles slider disabled state by providing appropriate fallback value
 * @param {number} currentLinewidth - Current linewidth value
 * @param {boolean} wasSliderMode - Whether slider mode was previously active
 * @returns {number} - Appropriate linewidth value for disabled state
 */
export const handleSliderDisabled = (currentLinewidth, wasSliderMode = false) => {
  // If switching from slider mode to disabled and value isn't a preset,
  // find the closest preset
  if (wasSliderMode && !isPresetLinewidth(currentLinewidth)) {
    return getClosestPresetLinewidth(currentLinewidth);
  }
  
  // Otherwise, keep current value if it's valid
  return validateLinewidth(currentLinewidth);
};

/**
 * Safely parses a value from user input (like from slider events)
 * @param {Event|any} eventOrValue - Event object or direct value
 * @returns {number} - Validated linewidth value
 */
export const parseInputValue = (eventOrValue) => {
  let value;
  
  if (eventOrValue && typeof eventOrValue === 'object' && eventOrValue.target) {
    // Handle event object
    value = eventOrValue.target.value;
  } else {
    // Handle direct value
    value = eventOrValue;
  }
  
  return validateLinewidth(value);
};

/**
 * Creates error boundary handler for linewidth components
 * @param {string} componentName - Name of the component for logging
 * @returns {Function} - Error handler function
 */
export const createLinewidthErrorHandler = (componentName) => {
  return (error, errorInfo) => {
    console.error(`Error in ${componentName}:`, error);
    console.error('Error info:', errorInfo);
    
    // In development, you might want to show more detailed error information
    if (process.env.NODE_ENV === 'development') {
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    // Could send error to monitoring service here
    // Example: sendErrorToMonitoring(error, componentName, errorInfo);
  };
};