import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import Tooltip from 'rc-tooltip';
import styles from './styles.module.css';
import { LINEWIDTH_SLIDER } from '../../constants';
import { validateLinewidth, parseInputValue } from '../LinewidthSelector/validation';

function LinewidthSlider({ 
  value = LINEWIDTH_SLIDER.DEFAULT, 
  min = LINEWIDTH_SLIDER.MIN, 
  max = LINEWIDTH_SLIDER.MAX, 
  step = LINEWIDTH_SLIDER.STEP, 
  disabled = false,
  onChange, 
  onChangeComplete 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [announceValue, setAnnounceValue] = useState('');
  const sliderRef = useRef(null);

  const handleSliderChange = (event) => {
    try {
      const newValue = parseInputValue(event);
      if (onChange) {
        onChange(newValue);
      }
    } catch (error) {
      console.error('Error in handleSliderChange:', error);
      // Fallback to validated current value
      const fallbackValue = validateLinewidth(value);
      if (onChange) {
        onChange(fallbackValue);
      }
    }
  };

  const handleSliderChangeComplete = (event) => {
    try {
      const newValue = parseInputValue(event);
      if (onChangeComplete) {
        onChangeComplete(newValue);
      }
    } catch (error) {
      console.error('Error in handleSliderChangeComplete:', error);
      // Fallback to validated current value
      const fallbackValue = validateLinewidth(value);
      if (onChangeComplete) {
        onChangeComplete(fallbackValue);
      }
    }
    setIsDragging(false);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setAnnounceValue(`Line width ${clampedValue} pixels`);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setAnnounceValue('');
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    let newValue = clampedValue;
    let handled = false;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(min, clampedValue - step);
        handled = true;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(max, clampedValue + step);
        handled = true;
        break;
      case 'Home':
        newValue = min;
        handled = true;
        break;
      case 'End':
        newValue = max;
        handled = true;
        break;
      case 'PageDown':
        newValue = Math.max(min, clampedValue - step * 5);
        handled = true;
        break;
      case 'PageUp':
        newValue = Math.min(max, clampedValue + step * 5);
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      const validatedValue = validateLinewidth(newValue);
      setAnnounceValue(`Line width ${validatedValue} pixels`);
      
      if (onChange) {
        onChange(validatedValue);
      }
      if (onChangeComplete) {
        onChangeComplete(validatedValue);
      }
    }
  };

  // Ensure value is within bounds and valid
  const clampedValue = validateLinewidth(value);
  
  // Calculate preview circle size (minimum 4px for visibility)
  const previewSize = Math.max(clampedValue, 4);

  // Update announce value when clampedValue changes during focus
  useEffect(() => {
    if (isFocused && !isDragging) {
      setAnnounceValue(`Line width ${clampedValue} pixels`);
    }
  }, [clampedValue, isFocused, isDragging]);

  return (
    <div className={styles.sliderContainer}>
      <Tooltip
        placement="top"
        overlay={`${clampedValue}px`}
        visible={isHovered || isDragging || isFocused}
      >
        <div className={styles.sliderWrapper}>
          <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={clampedValue}
            disabled={disabled}
            onChange={handleSliderChange}
            onMouseUp={handleSliderChangeComplete}
            onTouchEnd={handleSliderChangeComplete}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={classNames(styles.slider, {
              [styles.sliderDisabled]: disabled,
              [styles.sliderFocused]: isFocused
            })}
            aria-label="Line width slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={clampedValue}
            aria-valuetext={`${clampedValue} pixels`}
            aria-describedby="linewidth-slider-desc"
            role="slider"
            tabIndex={disabled ? -1 : 0}
          />
        </div>
      </Tooltip>
      
      <div className={styles.valueDisplay} id="linewidth-value-display">
        {clampedValue}px
      </div>
      
      <div className={styles.previewContainer}>
        <div 
          className={classNames(styles.previewCircle, {
            [styles.previewCircleDisabled]: disabled
          })}
          style={{ 
            width: `${previewSize}px`, 
            height: `${previewSize}px` 
          }}
          aria-hidden="true"
          data-testid="preview-circle"
        />
      </div>

      {/* Hidden description for screen readers */}
      <div 
        id="linewidth-slider-desc" 
        className={styles.srOnly}
      >
        Use arrow keys to adjust line width. Home key sets minimum, End key sets maximum. Page Up/Down changes by 5 pixels.
      </div>

      {/* Live region for value announcements */}
      <div 
        className={styles.srOnly}
        aria-live="polite"
        aria-atomic="true"
      >
        {announceValue}
      </div>
    </div>
  );
}

export default LinewidthSlider;