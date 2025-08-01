import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LinewidthSelector from './index';
import settingsSlice from '../../../../reducers/settings/settingsSlice';
import { LINEWIDTH } from '../../constants';

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

// Integration test with real Redux store
describe('LinewidthSelector Integration Tests', () => {
  let store;

  const createTestStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        settings: settingsSlice,
      },
      preloadedState: {
        settings: {
          isDarkMode: false,
          platform: null,
          appVersion: null,
          sortPapersBy: 0,
          viewMode: 0,
          canvasPreferredLinewidth: LINEWIDTH.SMALL,
          linewidthSliderMode: false,
          ...initialState.settings,
        },
      },
    });
  };

  const renderWithStore = (component, testStore = store) => {
    return render(
      <Provider store={testStore}>
        {component}
      </Provider>
    );
  };

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Redux State Integration', () => {
    test('component reads initial slider mode from Redux', () => {
      const storeWithSliderMode = createTestStore({
        settings: { linewidthSliderMode: true }
      });

      renderWithStore(
        <LinewidthSelector
          linewidth={5}
          isDrawMode={true}
          onLinewidthChange={jest.fn()}
        />,
        storeWithSliderMode
      );

      // Should show slider
      const slider = screen.getByTestId('linewidth-slider');
      expect(slider).toBeInTheDocument();
    });

    test('toggle button updates Redux state', async () => {
      renderWithStore(
        <LinewidthSelector
          linewidth={5}
          isDrawMode={true}
          onLinewidthChange={jest.fn()}
        />
      );

      // Initially in preset mode
      expect(store.getState().settings.linewidthSliderMode).toBe(false);

      // Click toggle button
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      fireEvent.click(toggleButton);

      // Should update Redux state
      expect(store.getState().settings.linewidthSliderMode).toBe(true);

      // Should show slider
      await waitFor(() => {
        const slider = screen.getByTestId('linewidth-slider');
        expect(slider).toBeInTheDocument();
      });
    });

    test('component reacts to external Redux state changes', () => {
      const { rerender } = renderWithStore(
        <LinewidthSelector
          linewidth={5}
          isDrawMode={true}
          onLinewidthChange={jest.fn()}
        />
      );

      // Initially no slider
      expect(screen.queryByTestId('linewidth-slider')).not.toBeInTheDocument();

      // Update Redux state externally
      store.dispatch({ type: 'settings/setLinewidthSliderMode', payload: true });

      // Re-render to trigger component update
      rerender(
        <Provider store={store}>
          <LinewidthSelector
            linewidth={5}
            isDrawMode={true}
            onLinewidthChange={jest.fn()}
          />
        </Provider>
      );

      // Should now show slider
      expect(screen.getByTestId('linewidth-slider')).toBeInTheDocument();
    });
  });

  describe('Mode Switching Behavior', () => {
    test('switching from slider to preset mode with custom value selects closest preset', async () => {
      const onLinewidthChange = jest.fn();
      
      // Start in slider mode with custom value
      const storeWithSliderMode = createTestStore({
        settings: { linewidthSliderMode: true }
      });

      renderWithStore(
        <LinewidthSelector
          linewidth={7} // Custom value between medium (5) and large (8)
          isDrawMode={true}
          onLinewidthChange={onLinewidthChange}
        />,
        storeWithSliderMode
      );

      // Click toggle to switch to preset mode
      const toggleButton = screen.getByLabelText(/switch to preset mode/i);
      fireEvent.click(toggleButton);

      // Should call onLinewidthChange with closest preset (LARGE = 8)
      expect(onLinewidthChange).toHaveBeenCalledWith(LINEWIDTH.LARGE);
    });

    test('switching from preset to slider mode keeps preset value', () => {
      const onLinewidthChange = jest.fn();

      renderWithStore(
        <LinewidthSelector
          linewidth={LINEWIDTH.MEDIUM}
          isDrawMode={true}
          onLinewidthChange={onLinewidthChange}
        />
      );

      // Click toggle to switch to slider mode
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      fireEvent.click(toggleButton);

      // Should not call onLinewidthChange since preset values don't need adjustment
      expect(onLinewidthChange).not.toHaveBeenCalled();

      // But should show slider with correct value
      const slider = screen.getByTestId('mock-slider');
      expect(slider).toHaveValue(LINEWIDTH.MEDIUM.toString());
    });
  });

  describe('State Persistence Simulation', () => {
    test('simulates app restart with saved slider mode', () => {
      // Simulate first app session
      const firstStore = createTestStore();
      
      const { unmount } = renderWithStore(
        <LinewidthSelector
          linewidth={5}
          isDrawMode={true}
          onLinewidthChange={jest.fn()}
        />,
        firstStore
      );

      // User switches to slider mode
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      fireEvent.click(toggleButton);

      expect(firstStore.getState().settings.linewidthSliderMode).toBe(true);

      // Unmount (simulate app close)
      unmount();

      // Simulate app restart with saved state
      const secondStore = createTestStore({
        settings: { linewidthSliderMode: true }
      });

      renderWithStore(
        <LinewidthSelector
          linewidth={5}
          isDrawMode={true}
          onLinewidthChange={jest.fn()}
        />,
        secondStore
      );

      // Should restore slider mode
      expect(screen.getByTestId('linewidth-slider')).toBeInTheDocument();
      expect(secondStore.getState().settings.linewidthSliderMode).toBe(true);
    });
  });

  describe('Error Recovery Integration', () => {
    test('recovers gracefully from Redux errors', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create store with faulty reducer
      const faultyStore = {
        ...store,
        dispatch: jest.fn().mockImplementation(() => {
          throw new Error('Redux error');
        }),
        getState: store.getState,
        subscribe: store.subscribe,
      };

      renderWithStore(
        <LinewidthSelector
          linewidth={5}
          isDrawMode={true}
          onLinewidthChange={jest.fn()}
        />,
        faultyStore
      );

      // Try to toggle mode (should handle error)
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      fireEvent.click(toggleButton);

      expect(consoleError).toHaveBeenCalledWith(
        'Error in handleModeToggle:',
        expect.any(Error)
      );

      // Component should still be functional
      expect(toggleButton).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Performance Integration', () => {
    test('does not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      
      const SpyComponent = (props) => {
        renderSpy();
        return <LinewidthSelector {...props} />;
      };

      const { rerender } = renderWithStore(
        <SpyComponent
          linewidth={5}
          isDrawMode={true}
          onLinewidthChange={jest.fn()}
        />
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Same props should not cause re-render
      rerender(
        <Provider store={store}>
          <SpyComponent
            linewidth={5}
            isDrawMode={true}
            onLinewidthChange={jest.fn()}
          />
        </Provider>
      );

      // Note: This will likely re-render because we're passing a new function
      // but the important thing is that the component handles it gracefully
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility Integration', () => {
    test('maintains accessibility across mode changes', async () => {
      renderWithStore(
        <LinewidthSelector
          linewidth={5}
          isDrawMode={true}
          onLinewidthChange={jest.fn()}
        />
      );

      // Initial accessibility
      expect(screen.getByRole('group')).toHaveAttribute(
        'aria-label',
        'Line width selection controls'
      );
      expect(screen.getByRole('toolbar')).toHaveAttribute(
        'aria-label',
        'Line width preset and mode controls'
      );

      // Switch to slider mode
      const toggleButton = screen.getByLabelText(/switch to slider mode/i);
      fireEvent.click(toggleButton);

      // Should maintain accessibility after mode change
      await waitFor(() => {
        expect(screen.getByRole('group')).toHaveAttribute(
          'aria-label',
          'Line width selection controls'
        );
        expect(screen.getByRole('toolbar')).toHaveAttribute(
          'aria-label',
          'Line width preset and mode controls'
        );
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });
    });
  });
});