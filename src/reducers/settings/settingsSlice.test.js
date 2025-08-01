import settingsReducer, {
  setPreferredLinewidth,
  loadSettings,
  saveSettings,
} from './settingsSlice';
import { LINEWIDTH } from '../../components/Paper/constants';

describe('Settings Slice', () => {
  const initialState = {
    isDarkMode: false,
    platform: null,
    appVersion: null,
    libararysortPapersBy: 'name-az',
    viewMode: 'grid',
    canvasPreferredLinewidth: LINEWIDTH.SMALL,
  };

  describe('初期状態', () => {
    test('初期状態が正しく設定されている', () => {
      const state = settingsReducer(undefined, { type: 'unknown' });
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.SMALL);
    });
  });

  describe('setPreferredLinewidth', () => {
    test('固定サイズのライン幅を設定できる', () => {
      const state = settingsReducer(initialState, setPreferredLinewidth(LINEWIDTH.MEDIUM));
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.MEDIUM);
    });

    test('カスタムサイズのライン幅を設定できる', () => {
      const customSize = 12;
      const state = settingsReducer(initialState, setPreferredLinewidth(customSize));
      expect(state.canvasPreferredLinewidth).toBe(customSize);
    });

    test('最小値のライン幅を設定できる', () => {
      const minSize = 1;
      const state = settingsReducer(initialState, setPreferredLinewidth(minSize));
      expect(state.canvasPreferredLinewidth).toBe(minSize);
    });

    test('最大値のライン幅を設定できる', () => {
      const maxSize = 20;
      const state = settingsReducer(initialState, setPreferredLinewidth(maxSize));
      expect(state.canvasPreferredLinewidth).toBe(maxSize);
    });

    test('範囲外の値も設定できる（バリデーションはUI側で行う）', () => {
      const outOfRangeSize = 25;
      const state = settingsReducer(initialState, setPreferredLinewidth(outOfRangeSize));
      expect(state.canvasPreferredLinewidth).toBe(outOfRangeSize);
    });
  });

  describe('loadSettings', () => {
    test('固定サイズの設定を読み込める', () => {
      const settings = {
        canvasPreferredLinewidth: LINEWIDTH.LARGE,
      };
      const state = settingsReducer(initialState, loadSettings(settings));
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.LARGE);
    });

    test('カスタムサイズの設定を読み込める', () => {
      const customSize = 15;
      const settings = {
        canvasPreferredLinewidth: customSize,
      };
      const state = settingsReducer(initialState, loadSettings(settings));
      expect(state.canvasPreferredLinewidth).toBe(customSize);
    });

    test('無効な設定は読み込まれない', () => {
      const settings = {
        canvasPreferredLinewidth: 'invalid',
      };
      const state = settingsReducer(initialState, loadSettings(settings));
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.SMALL); // 初期値のまま
    });

    test('設定が空の場合は初期値が維持される', () => {
      const state = settingsReducer(initialState, loadSettings({}));
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.SMALL);
    });

    test('設定がnullの場合は初期値が維持される', () => {
      const state = settingsReducer(initialState, loadSettings(null));
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.SMALL);
    });
  });

  describe('複数のアクションの組み合わせ', () => {
    test('複数のライン幅変更が正しく適用される', () => {
      let state = settingsReducer(initialState, setPreferredLinewidth(LINEWIDTH.MEDIUM));
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.MEDIUM);

      state = settingsReducer(state, setPreferredLinewidth(10));
      expect(state.canvasPreferredLinewidth).toBe(10);

      state = settingsReducer(state, setPreferredLinewidth(LINEWIDTH.LARGE));
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.LARGE);
    });

    test('設定の読み込みと変更が正しく動作する', () => {
      // まず設定を読み込む
      let state = settingsReducer(
        initialState,
        loadSettings({
          canvasPreferredLinewidth: 12,
        }),
      );
      expect(state.canvasPreferredLinewidth).toBe(12);

      // その後変更する
      state = settingsReducer(state, setPreferredLinewidth(LINEWIDTH.SMALL));
      expect(state.canvasPreferredLinewidth).toBe(LINEWIDTH.SMALL);
    });
  });

  describe('型の検証', () => {
    test('数値型のカスタムサイズが正しく処理される', () => {
      const customSizes = [1, 5, 10, 15, 20];
      customSizes.forEach((size) => {
        const state = settingsReducer(initialState, setPreferredLinewidth(size));
        expect(typeof state.canvasPreferredLinewidth).toBe('number');
        expect(state.canvasPreferredLinewidth).toBe(size);
      });
    });

    test('固定サイズの値が正しく処理される', () => {
      const fixedSizes = [LINEWIDTH.SMALL, LINEWIDTH.MEDIUM, LINEWIDTH.LARGE];
      fixedSizes.forEach((size) => {
        const state = settingsReducer(initialState, setPreferredLinewidth(size));
        expect(typeof state.canvasPreferredLinewidth).toBe('number');
        expect(state.canvasPreferredLinewidth).toBe(size);
      });
    });
  });
});
