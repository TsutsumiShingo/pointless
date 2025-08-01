import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LinewidthSlider from './index';
import { LINEWIDTH_SLIDER } from '../../constants';

// Mock rc-tooltip to avoid rendering issues in tests
jest.mock('rc-tooltip', () => {
  return function MockTooltip({ children, overlay, visible }) {
    return (
      <div data-testid="tooltip-wrapper">
        {children}
        {visible && <div data-testid="tooltip-content">{overlay}</div>}
      </div>
    );
  };
});

describe('LinewidthSlider', () => {
  const defaultProps = {
    value: 5,
    onChange: jest.fn(),
    onChangeComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders slider with correct default props', () => {
      render(<LinewidthSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('min', LINEWIDTH_SLIDER.MIN.toString());
      expect(slider).toHaveAttribute('max', LINEWIDTH_SLIDER.MAX.toString());
      expect(slider).toHaveAttribute('step', LINEWIDTH_SLIDER.STEP.toString());
      expect(slider).toHaveValue('5');
    });

    test('displays correct value in value display', () => {
      render(<LinewidthSlider value={10} onChange={jest.fn()} />);
      
      expect(screen.getByText('10px')).toBeInTheDocument();
    });

    test('renders preview circle with correct size', () => {
      render(<LinewidthSlider value={15} onChange={jest.fn()} />);
      
      const previewCircle = screen.getByTestId('preview-circle');
      expect(previewCircle).toHaveStyle({ width: '15px', height: '15px' });
    });

    test('renders minimum preview circle size for small values', () => {
      render(<LinewidthSlider value={1} onChange={jest.fn()} />);
      
      const previewCircle = screen.getByTestId('preview-circle');
      expect(previewCircle).toHaveStyle({ width: '4px', height: '4px' });
    });
  });

  describe('Value Validation', () => {
    test('clamps value within min-max range', () => {
      render(<LinewidthSlider value={25} onChange={jest.fn()} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(LINEWIDTH_SLIDER.MAX.toString());
      expect(screen.getByText(`${LINEWIDTH_SLIDER.MAX}px`)).toBeInTheDocument();
    });

    test('handles negative values by using minimum', () => {
      render(<LinewidthSlider value={-5} onChange={jest.fn()} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(LINEWIDTH_SLIDER.MIN.toString());
    });

    test('handles NaN values by using default', () => {
      render(<LinewidthSlider value={NaN} onChange={jest.fn()} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(LINEWIDTH_SLIDER.DEFAULT.toString());
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when slider value changes', async () => {
      const onChange = jest.fn();
      render(<LinewidthSlider {...defaultProps} onChange={onChange} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '10' } });
      
      expect(onChange).toHaveBeenCalledWith(10);
    });

    test('calls onChangeComplete on mouse up', async () => {
      const onChangeComplete = jest.fn();
      render(<LinewidthSlider {...defaultProps} onChangeComplete={onChangeComplete} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '8' } });
      fireEvent.mouseUp(slider);
      
      expect(onChangeComplete).toHaveBeenCalledWith(8);
    });

    test('calls onChangeComplete on touch end', async () => {
      const onChangeComplete = jest.fn();
      render(<LinewidthSlider {...defaultProps} onChangeComplete={onChangeComplete} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '12' } });
      fireEvent.touchEnd(slider);
      
      expect(onChangeComplete).toHaveBeenCalledWith(12);
    });
  });

  describe('Keyboard Navigation', () => {
    test('increases value with right arrow key', async () => {
      const onChange = jest.fn();
      const onChangeComplete = jest.fn();
      render(<LinewidthSlider value={5} onChange={onChange} onChangeComplete={onChangeComplete} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      
      expect(onChange).toHaveBeenCalledWith(6);
      expect(onChangeComplete).toHaveBeenCalledWith(6);
    });

    test('decreases value with left arrow key', async () => {
      const onChange = jest.fn();
      render(<LinewidthSlider value={5} onChange={onChange} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      
      expect(onChange).toHaveBeenCalledWith(4);
    });

    test('sets to minimum with Home key', async () => {
      const onChange = jest.fn();
      render(<LinewidthSlider value={10} onChange={onChange} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      fireEvent.keyDown(slider, { key: 'Home' });
      
      expect(onChange).toHaveBeenCalledWith(LINEWIDTH_SLIDER.MIN);
    });

    test('sets to maximum with End key', async () => {
      const onChange = jest.fn();
      render(<LinewidthSlider value={10} onChange={onChange} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      fireEvent.keyDown(slider, { key: 'End' });
      
      expect(onChange).toHaveBeenCalledWith(LINEWIDTH_SLIDER.MAX);
    });

    test('changes by 5 with Page Up/Down keys', async () => {
      const onChange = jest.fn();
      render(<LinewidthSlider value={10} onChange={onChange} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      fireEvent.keyDown(slider, { key: 'PageUp' });
      expect(onChange).toHaveBeenCalledWith(15);
      
      fireEvent.keyDown(slider, { key: 'PageDown' });
      expect(onChange).toHaveBeenCalledWith(5);
    });

    test('respects min/max bounds during keyboard navigation', async () => {
      const onChange = jest.fn();
      render(<LinewidthSlider value={1} onChange={onChange} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      
      expect(onChange).toHaveBeenCalledWith(LINEWIDTH_SLIDER.MIN);
    });
  });

  describe('Disabled State', () => {
    test('disables slider when disabled prop is true', () => {
      render(<LinewidthSlider {...defaultProps} disabled={true} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });

    test('does not respond to keyboard events when disabled', async () => {
      const onChange = jest.fn();
      render(<LinewidthSlider value={5} onChange={onChange} disabled={true} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      
      expect(onChange).not.toHaveBeenCalled();
    });

    test('applies disabled styles', () => {
      render(<LinewidthSlider {...defaultProps} disabled={true} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('sliderDisabled');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<LinewidthSlider value={8} onChange={jest.fn()} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Line width slider');
      expect(slider).toHaveAttribute('aria-valuemin', LINEWIDTH_SLIDER.MIN.toString());
      expect(slider).toHaveAttribute('aria-valuemax', LINEWIDTH_SLIDER.MAX.toString());
      expect(slider).toHaveAttribute('aria-valuenow', '8');
      expect(slider).toHaveAttribute('aria-valuetext', '8 pixels');
      expect(slider).toHaveAttribute('aria-describedby', 'linewidth-slider-desc');
    });

    test('has proper tabIndex when enabled', () => {
      render(<LinewidthSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabIndex', '0');
    });

    test('has tabIndex -1 when disabled', () => {
      render(<LinewidthSlider {...defaultProps} disabled={true} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabIndex', '-1');
    });

    test('has screen reader description', () => {
      render(<LinewidthSlider {...defaultProps} />);
      
      const description = screen.getByText(/Use arrow keys to adjust line width/);
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('id', 'linewidth-slider-desc');
    });

    test('announces value changes in live region', async () => {
      render(<LinewidthSlider value={5} onChange={jest.fn()} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.focus(slider);
      
      await waitFor(() => {
        const liveRegion = screen.getByText('Line width 5 pixels');
        expect(liveRegion).toBeInTheDocument();
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Tooltip Behavior', () => {
    test('shows tooltip on hover', async () => {
      render(<LinewidthSlider value={7} onChange={jest.fn()} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.mouseEnter(slider);
      
      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip-content');
        expect(tooltip).toHaveTextContent('7px');
      });
    });

    test('shows tooltip on focus', async () => {
      render(<LinewidthSlider value={9} onChange={jest.fn()} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.focus(slider);
      
      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip-content');
        expect(tooltip).toHaveTextContent('9px');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles onChange errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onChange = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      render(<LinewidthSlider value={5} onChange={onChange} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '10' } });
      
      expect(consoleError).toHaveBeenCalledWith('Error in handleSliderChange:', expect.any(Error));
      
      consoleError.mockRestore();
    });

    test('handles onChangeComplete errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onChangeComplete = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      render(<LinewidthSlider value={5} onChangeComplete={onChangeComplete} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '10' } });
      fireEvent.mouseUp(slider);
      
      expect(consoleError).toHaveBeenCalledWith('Error in handleSliderChangeComplete:', expect.any(Error));
      
      consoleError.mockRestore();
    });
  });
});