import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LinewidthSelector from './index';
import settingsSlice from '../../../../reducers/settings/settingsSlice';
import { LINEWIDTH, LINEWIDTH_PRESETS } from '../../constants';

// Mock rc-tooltip
jest.mock('rc-tooltip', () => {
  return function MockTooltip({ children, overlay }) {
    return (
      <div data-testid="tooltip-wrapper" title={overlay}>
        {children}
      </div>
    );
  };
});

// Mock LinewidthSlider component
jest.mock('../LinewidthSlider', () => {
  return function MockLinewidthSlider({ value, disabled, onChange, onChangeComplete }) {
    return (
      <div data-testid="linewidth-slider">
        <input
          type="range"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          onMouseUp={(e) => onChangeComplete && onChangeComplete(Number(e.target.value))}
          data-testid="mock-slider"
        />
        <span data-testid="slider-value">{value}px</span>
      </div>
    );
  };
});

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      settings: settingsSlice,
    },
    preloadedState: {
      settings: {
        linewidthSliderMode: false,
        canvasPreferredLinewidth: LINEWIDTH.SMALL,
        ...initialState.settings,
      },
    },
  });
};

const renderWithProvider = (component, store) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('LinewidthSelector', () => {
  const defaultProps = {
    linewidth: LINEWIDTH.SMALL,
    isDrawMode: true,
    onLinewidthChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders preset buttons', () => {
      const store = createMockStore();
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      LINEWIDTH_PRESETS.forEach((preset) => {
        const button = screen.getByLabelText(new RegExp(preset.label, 'i'));
        expect(button).toBeInTheDocument();
      });
    });

    test('renders mode toggle button', () => {
      const store = createMockStore();
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      expect(toggleButton).toBeInTheDocument();
    });

    test('does not render slider in preset mode', () => {
      const store = createMockStore();
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const slider = screen.queryByTestId('linewidth-slider');
      expect(slider).not.toBeInTheDocument();
    });

    test('renders slider in slider mode', () => {
      const store = createMockStore({
        settings: { linewidthSliderMode: true }
      });
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const slider = screen.getByTestId('linewidth-slider');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Preset Button Interactions', () => {
    test('calls onLinewidthChange when preset button is clicked', () => {
      const onLinewidthChange = jest.fn();
      const store = createMockStore();
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} onLinewidthChange={onLinewidthChange} />,
        store
      );
      
      const mediumButton = screen.getByLabelText(/medium/i);
      fireEvent.click(mediumButton);
      
      expect(onLinewidthChange).toHaveBeenCalledWith(LINEWIDTH.MEDIUM);
    });

    test('shows active state for current linewidth', () => {
      const store = createMockStore();
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} linewidth={LINEWIDTH.MEDIUM} />,
        store
      );
      
      const mediumButton = screen.getByLabelText(/medium/i);
      expect(mediumButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('disables preset buttons when not in draw mode', () => {
      const store = createMockStore();
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} isDrawMode={false} />,
        store
      );
      
      LINEWIDTH_PRESETS.forEach((preset) => {
        const button = screen.getByLabelText(new RegExp(preset.label, 'i'));
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Mode Toggle Functionality', () => {
    test('toggles to slider mode when toggle button is clicked', () => {
      const store = createMockStore();
      
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      fireEvent.click(toggleButton);
      
      // Check if slider appears
      waitFor(() => {
        const slider = screen.getByTestId('linewidth-slider');
        expect(slider).toBeInTheDocument();
      });
    });

    test('toggles back to preset mode', () => {
      const store = createMockStore({
        settings: { linewidthSliderMode: true }
      });
      
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const toggleButton = screen.getByLabelText(/switch to preset mode/i);
      fireEvent.click(toggleButton);
      
      // Check if slider disappears
      waitFor(() => {
        const slider = screen.queryByTestId('linewidth-slider');
        expect(slider).not.toBeInTheDocument();
      });
    });

    test('shows correct toggle button state in slider mode', () => {
      const store = createMockStore({
        settings: { linewidthSliderMode: true }
      });
      
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const toggleButton = screen.getByLabelText(/switch to preset mode/i);
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('disables toggle button when not in draw mode', () => {
      const store = createMockStore();
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} isDrawMode={false} />,
        store
      );
      
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Slider Integration', () => {
    test('passes correct props to slider component', () => {
      const store = createMockStore({
        settings: { linewidthSliderMode: true }
      });
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} linewidth={10} isDrawMode={true} />,
        store
      );
      
      const mockSlider = screen.getByTestId('mock-slider');
      expect(mockSlider).toHaveValue('10');
      expect(mockSlider).not.toBeDisabled();
    });

    test('disables slider when not in draw mode', () => {
      const store = createMockStore({
        settings: { linewidthSliderMode: true }
      });
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} isDrawMode={false} />,
        store
      );
      
      const mockSlider = screen.getByTestId('mock-slider');
      expect(mockSlider).toBeDisabled();
    });

    test('handles slider value changes', () => {
      const onLinewidthChange = jest.fn();
      const store = createMockStore({
        settings: { linewidthSliderMode: true }
      });
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} onLinewidthChange={onLinewidthChange} />,
        store
      );
      
      const mockSlider = screen.getByTestId('mock-slider');
      fireEvent.change(mockSlider, { target: { value: '15' } });
      
      expect(onLinewidthChange).toHaveBeenCalledWith(15);
    });
  });

  describe('State Synchronization', () => {
    test('syncs slider value with prop changes', () => {
      const store = createMockStore({
        settings: { linewidthSliderMode: true }
      });
      
      const { rerender } = renderWithProvider(
        <LinewidthSelector {...defaultProps} linewidth={5} />,
        store
      );
      
      // Change linewidth prop
      rerender(
        <Provider store={store}>
          <LinewidthSelector {...defaultProps} linewidth={12} />
        </Provider>
      );
      
      const mockSlider = screen.getByTestId('mock-slider');
      expect(mockSlider).toHaveValue('12');
    });
  });

  describe('Custom Value Handling', () => {
    test('switches to closest preset when toggling from slider to preset mode with custom value', () => {
      const onLinewidthChange = jest.fn();
      const store = createMockStore({
        settings: { linewidthSliderMode: true }
      });
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} linewidth={7} onLinewidthChange={onLinewidthChange} />,
        store
      );
      
      const toggleButton = screen.getByLabelText(/switch to preset mode/i);
      fireEvent.click(toggleButton);
      
      // Should switch to closest preset (8px - LARGE)
      expect(onLinewidthChange).toHaveBeenCalledWith(LINEWIDTH.LARGE);
    });

    test('keeps preset value when toggling from preset to slider mode', () => {
      const onLinewidthChange = jest.fn();
      const store = createMockStore();
      
      renderWithProvider(
        <LinewidthSelector {...defaultProps} linewidth={LINEWIDTH.MEDIUM} onLinewidthChange={onLinewidthChange} />,
        store
      );
      
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      fireEvent.click(toggleButton);
      
      // Should not call onLinewidthChange for preset values
      expect(onLinewidthChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for container', () => {
      const store = createMockStore();
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Line width selection controls');
      
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Line width preset and mode controls');
    });

    test('preset buttons have descriptive aria-labels', () => {
      const store = createMockStore();
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const smallButton = screen.getByLabelText(/Set line width to 2 pixels \(small size\)/i);
      expect(smallButton).toBeInTheDocument();
    });

    test('toggle button has descriptive aria-label', () => {
      const store = createMockStore();
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const toggleButton = screen.getByLabelText(/Switch to slider mode/i);
      expect(toggleButton).toBeInTheDocument();
    });

    test('buttons have correct tabIndex when disabled', () => {
      const store = createMockStore();
      renderWithProvider(
        <LinewidthSelector {...defaultProps} isDrawMode={false} />,
        store
      );
      
      LINEWIDTH_PRESETS.forEach((preset) => {
        const button = screen.getByLabelText(new RegExp(preset.label, 'i'));
        expect(button).toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles preset click errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onLinewidthChange = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const store = createMockStore();
      renderWithProvider(
        <LinewidthSelector {...defaultProps} onLinewidthChange={onLinewidthChange} />,
        store
      );
      
      const smallButton = screen.getByLabelText(/small/i);
      fireEvent.click(smallButton);
      
      expect(consoleError).toHaveBeenCalledWith('Error in handlePresetClick:', expect.any(Error));
      
      consoleError.mockRestore();
    });

    test('handles toggle mode errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock dispatch to throw error
      const store = createMockStore();
      const originalDispatch = store.dispatch;
      store.dispatch = jest.fn().mockImplementation(() => {
        throw new Error('Redux error');
      });
      
      renderWithProvider(<LinewidthSelector {...defaultProps} />, store);
      
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      fireEvent.click(toggleButton);
      
      expect(consoleError).toHaveBeenCalledWith('Error in handleModeToggle:', expect.any(Error));
      
      // Restore
      store.dispatch = originalDispatch;
      consoleError.mockRestore();
    });
  });
});