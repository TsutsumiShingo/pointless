import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Paper from './index';
import { LINEWIDTH, LINEWIDTH_MIN, LINEWIDTH_MAX } from './constants';
import settingsReducer from '../../reducers/settings/settingsSlice';
import libraryReducer from '../../reducers/library/librarySlice';

// モックストアを作成
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
      library: libraryReducer,
    },
    preloadedState: {
      settings: {
        isDarkMode: false,
        platform: 'win32',
        canvasPreferredLinewidth: LINEWIDTH.SMALL,
        ...initialState.settings,
      },
      library: {
        papers: [
          {
            id: 'test-paper-id',
            folderId: 'test-folder-id',
            shapes: [],
          },
        ],
        folders: [],
        ...initialState.library,
      },
    },
  });
};

// デフォルトのprops
const defaultProps = {
  paperId: 'test-paper-id',
  readonly: false,
};

// テスト用のコンポーネントラッパー
const renderWithProvider = (props = {}) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <Paper {...defaultProps} {...props} />
    </Provider>,
  );
};

describe('Paper Component - Linewidth Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('changeLinewidth method', () => {
    test('固定サイズのライン幅を設定できる', () => {
      const { container } = renderWithProvider();

      // コンポーネントのインスタンスを取得
      const paperInstance = container.firstChild;

      // changeLinewidthメソッドを直接テスト
      const mockDispatch = jest.fn();
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;

      // メソッドをモック
      paperComponent.props = { ...paperComponent.props, dispatch: mockDispatch };

      // 固定サイズを設定
      paperComponent.changeLinewidth(LINEWIDTH.MEDIUM);

      // 状態が更新されることを確認
      expect(paperComponent.state.linewidth).toBe(LINEWIDTH.MEDIUM);
    });

    test('カスタムサイズのライン幅を設定できる', () => {
      const { container } = renderWithProvider();

      const paperInstance = container.firstChild;
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;
      const mockDispatch = jest.fn();
      paperComponent.props = { ...paperComponent.props, dispatch: mockDispatch };

      const customSize = 12;
      paperComponent.changeLinewidth(customSize);

      expect(paperComponent.state.linewidth).toBe(customSize);
    });

    test('最小値のライン幅を設定できる', () => {
      const { container } = renderWithProvider();

      const paperInstance = container.firstChild;
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;
      const mockDispatch = jest.fn();
      paperComponent.props = { ...paperComponent.props, dispatch: mockDispatch };

      paperComponent.changeLinewidth(LINEWIDTH_MIN);

      expect(paperComponent.state.linewidth).toBe(LINEWIDTH_MIN);
    });

    test('最大値のライン幅を設定できる', () => {
      const { container } = renderWithProvider();

      const paperInstance = container.firstChild;
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;
      const mockDispatch = jest.fn();
      paperComponent.props = { ...paperComponent.props, dispatch: mockDispatch };

      paperComponent.changeLinewidth(LINEWIDTH_MAX);

      expect(paperComponent.state.linewidth).toBe(LINEWIDTH_MAX);
    });

    test('範囲外の値も設定できる（バリデーションはUI側で行う）', () => {
      const { container } = renderWithProvider();

      const paperInstance = container.firstChild;
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;
      const mockDispatch = jest.fn();
      paperComponent.props = { ...paperComponent.props, dispatch: mockDispatch };

      const outOfRangeSize = 25;
      paperComponent.changeLinewidth(outOfRangeSize);

      expect(paperComponent.state.linewidth).toBe(outOfRangeSize);
    });
  });

  describe('初期状態', () => {
    test('初期状態で正しいライン幅が設定されている', () => {
      const { container } = renderWithProvider();

      const paperInstance = container.firstChild;
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;

      expect(paperComponent.state.linewidth).toBe(LINEWIDTH.SMALL);
    });

    test('設定から初期ライン幅が読み込まれる', () => {
      const customInitialLinewidth = 8;
      const { container } = renderWithProvider({
        settings: {
          canvasPreferredLinewidth: customInitialLinewidth,
        },
      });

      const paperInstance = container.firstChild;
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;

      expect(paperComponent.state.linewidth).toBe(customInitialLinewidth);
    });
  });

  describe('型の検証', () => {
    test('数値型のカスタムサイズが正しく処理される', () => {
      const { container } = renderWithProvider();

      const paperInstance = container.firstChild;
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;
      const mockDispatch = jest.fn();
      paperComponent.props = { ...paperComponent.props, dispatch: mockDispatch };

      const customSizes = [1, 5, 10, 15, 20];
      customSizes.forEach((size) => {
        paperComponent.changeLinewidth(size);
        expect(typeof paperComponent.state.linewidth).toBe('number');
        expect(paperComponent.state.linewidth).toBe(size);
      });
    });

    test('固定サイズの値が正しく処理される', () => {
      const { container } = renderWithProvider();

      const paperInstance = container.firstChild;
      const paperComponent = paperInstance._reactInternalFiber.child.stateNode;
      const mockDispatch = jest.fn();
      paperComponent.props = { ...paperComponent.props, dispatch: mockDispatch };

      const fixedSizes = [LINEWIDTH.SMALL, LINEWIDTH.MEDIUM, LINEWIDTH.LARGE];
      fixedSizes.forEach((size) => {
        paperComponent.changeLinewidth(size);
        expect(typeof paperComponent.state.linewidth).toBe('number');
        expect(paperComponent.state.linewidth).toBe(size);
      });
    });
  });
});
