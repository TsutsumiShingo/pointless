import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Toolbar from './index';
import { LINEWIDTH, LINEWIDTH_MIN, LINEWIDTH_MAX } from './../../constants';
import settingsReducer from '../../../../reducers/settings/settingsSlice';

// モックストアを作成
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        platform: 'win32',
        ...initialState,
      },
    },
  });
};

// デフォルトのprops
const defaultProps = {
  mode: 'freehand',
  linewidth: LINEWIDTH.SMALL,
  isDrawMode: true,
  isPanMode: false,
  isEraseMode: false,
  isSelectMode: false,
  onLinewidthChange: jest.fn(),
  onClickFreehandTool: jest.fn(),
  onClickEllipseTool: jest.fn(),
  onClickRectangleTool: jest.fn(),
  onClickArrowTool: jest.fn(),
  onClickEraseTool: jest.fn(),
  onClickSelectTool: jest.fn(),
  onClickPanTool: jest.fn(),
  onClickZoomToFit: jest.fn(),
  onClickUndoTool: jest.fn(),
  onClickRedoTool: jest.fn(),
  onClearCanvas: jest.fn(),
  onClickResetZoom: jest.fn(),
  onZoomIn: jest.fn(),
  onZoomOut: jest.fn(),
  canUndo: false,
  canRedo: false,
  canResetZoom: false,
  canvasIsEmpty: false,
};

// テスト用のコンポーネントラッパー
const renderWithProvider = (props = {}) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <Toolbar {...defaultProps} {...props} />
    </Provider>,
  );
};

describe('Toolbar Component - Linewidth Slider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('スライダーの表示', () => {
    test('描画モード時にスライダーが表示される', () => {
      renderWithProvider({ isDrawMode: true });

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    test('描画モードでない時はスライダーが表示されない', () => {
      renderWithProvider({ isDrawMode: false });

      const slider = screen.queryByRole('slider');
      expect(slider).not.toBeInTheDocument();
    });
  });

  describe('スライダーの属性', () => {
    test('スライダーが正しい最小値と最大値を持つ', () => {
      renderWithProvider();

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', LINEWIDTH_MIN.toString());
      expect(slider).toHaveAttribute('max', LINEWIDTH_MAX.toString());
    });

    test('スライダーが描画モードでない時は無効化される', () => {
      renderWithProvider({ isDrawMode: false });

      // 描画モードでない時はスライダーが表示されないので、このテストは削除
      const slider = screen.queryByRole('slider');
      expect(slider).not.toBeInTheDocument();
    });
  });

  describe('スライダーの値', () => {
    test('小サイズが選択されている時、スライダーの値が正しい', () => {
      renderWithProvider({ linewidth: LINEWIDTH.SMALL });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(LINEWIDTH.SMALL.toString());
    });

    test('中サイズが選択されている時、スライダーの値が正しい', () => {
      renderWithProvider({ linewidth: LINEWIDTH.MEDIUM });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(LINEWIDTH.MEDIUM.toString());
    });

    test('大サイズが選択されている時、スライダーの値が正しい', () => {
      renderWithProvider({ linewidth: LINEWIDTH.LARGE });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(LINEWIDTH.LARGE.toString());
    });

    test('カスタム値が選択されている時、スライダーの値が正しい', () => {
      const customValue = 12;
      renderWithProvider({ linewidth: customValue });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(customValue.toString());
    });
  });

  describe('スライダーの操作', () => {
    test('スライダーを変更するとonLinewidthChangeが呼ばれる', () => {
      const mockOnLinewidthChange = jest.fn();
      renderWithProvider({ onLinewidthChange: mockOnLinewidthChange });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '10' } });

      expect(mockOnLinewidthChange).toHaveBeenCalledWith(10);
    });

    test('スライダーを最小値に変更', () => {
      const mockOnLinewidthChange = jest.fn();
      renderWithProvider({ onLinewidthChange: mockOnLinewidthChange });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: LINEWIDTH_MIN.toString() } });

      expect(mockOnLinewidthChange).toHaveBeenCalledWith(LINEWIDTH_MIN);
    });

    test('スライダーを最大値に変更', () => {
      const mockOnLinewidthChange = jest.fn();
      renderWithProvider({ onLinewidthChange: mockOnLinewidthChange });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: LINEWIDTH_MAX.toString() } });

      expect(mockOnLinewidthChange).toHaveBeenCalledWith(LINEWIDTH_MAX);
    });
  });

  describe('カスタム値の表示', () => {
    test('カスタム値が選択されている時、値が表示される', () => {
      const customValue = 15;
      renderWithProvider({ linewidth: customValue });

      const valueDisplay = screen.getByText(`${customValue}px`);
      expect(valueDisplay).toBeInTheDocument();
    });

    test('固定サイズが選択されている時、値は表示されない', () => {
      renderWithProvider({ linewidth: LINEWIDTH.MEDIUM });

      const valueDisplay = screen.queryByText(/px/);
      expect(valueDisplay).not.toBeInTheDocument();
    });
  });

  describe('固定サイズボタンとの連携', () => {
    test('小サイズボタンをクリックするとonLinewidthChangeが呼ばれる', () => {
      const mockOnLinewidthChange = jest.fn();
      renderWithProvider({ onLinewidthChange: mockOnLinewidthChange });

      // 小サイズボタンはdiv要素なので、クラス名で特定
      const smallButton = screen.getByTestId('linewidth-small');
      fireEvent.click(smallButton);

      expect(mockOnLinewidthChange).toHaveBeenCalledWith(LINEWIDTH.SMALL);
    });

    test('中サイズボタンをクリックするとonLinewidthChangeが呼ばれる', () => {
      const mockOnLinewidthChange = jest.fn();
      renderWithProvider({ onLinewidthChange: mockOnLinewidthChange });

      // 中サイズボタンはdiv要素なので、クラス名で特定
      const mediumButton = screen.getByTestId('linewidth-medium');
      fireEvent.click(mediumButton);

      expect(mockOnLinewidthChange).toHaveBeenCalledWith(LINEWIDTH.MEDIUM);
    });

    test('大サイズボタンをクリックするとonLinewidthChangeが呼ばれる', () => {
      const mockOnLinewidthChange = jest.fn();
      renderWithProvider({ onLinewidthChange: mockOnLinewidthChange });

      // 大サイズボタンはdiv要素なので、クラス名で特定
      const largeButton = screen.getByTestId('linewidth-large');
      fireEvent.click(largeButton);

      expect(mockOnLinewidthChange).toHaveBeenCalledWith(LINEWIDTH.LARGE);
    });
  });
});
