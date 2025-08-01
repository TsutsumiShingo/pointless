import { LINEWIDTH, LINEWIDTH_MIN, LINEWIDTH_MAX, LINEWIDTH_DEFAULT, MODE } from './constants';

describe('Paper Constants', () => {
  describe('LINEWIDTH', () => {
    test('固定サイズの値が正しく定義されている', () => {
      expect(LINEWIDTH.SMALL).toBe(2);
      expect(LINEWIDTH.MEDIUM).toBe(5);
      expect(LINEWIDTH.LARGE).toBe(8);
    });

    test('CUSTOMオプションが定義されている', () => {
      expect(LINEWIDTH.CUSTOM).toBe('custom');
    });

    test('すべての固定サイズが数値である', () => {
      expect(typeof LINEWIDTH.SMALL).toBe('number');
      expect(typeof LINEWIDTH.MEDIUM).toBe('number');
      expect(typeof LINEWIDTH.LARGE).toBe('number');
    });
  });

  describe('LINEWIDTH_MIN', () => {
    test('最小値が正しく定義されている', () => {
      expect(LINEWIDTH_MIN).toBe(1);
      expect(typeof LINEWIDTH_MIN).toBe('number');
    });

    test('最小値が固定サイズの最小値より小さい', () => {
      expect(LINEWIDTH_MIN).toBeLessThan(LINEWIDTH.SMALL);
    });
  });

  describe('LINEWIDTH_MAX', () => {
    test('最大値が正しく定義されている', () => {
      expect(LINEWIDTH_MAX).toBe(20);
      expect(typeof LINEWIDTH_MAX).toBe('number');
    });

    test('最大値が固定サイズの最大値より大きい', () => {
      expect(LINEWIDTH_MAX).toBeGreaterThan(LINEWIDTH.LARGE);
    });
  });

  describe('LINEWIDTH_DEFAULT', () => {
    test('デフォルト値が正しく定義されている', () => {
      expect(LINEWIDTH_DEFAULT).toBe(5);
      expect(typeof LINEWIDTH_DEFAULT).toBe('number');
    });

    test('デフォルト値が中サイズと同じ', () => {
      expect(LINEWIDTH_DEFAULT).toBe(LINEWIDTH.MEDIUM);
    });
  });

  describe('値の範囲', () => {
    test('最小値と最大値の関係が正しい', () => {
      expect(LINEWIDTH_MIN).toBeLessThan(LINEWIDTH_MAX);
    });

    test('固定サイズが範囲内にある', () => {
      expect(LINEWIDTH.SMALL).toBeGreaterThanOrEqual(LINEWIDTH_MIN);
      expect(LINEWIDTH.SMALL).toBeLessThanOrEqual(LINEWIDTH_MAX);
      expect(LINEWIDTH.MEDIUM).toBeGreaterThanOrEqual(LINEWIDTH_MIN);
      expect(LINEWIDTH.MEDIUM).toBeLessThanOrEqual(LINEWIDTH_MAX);
      expect(LINEWIDTH.LARGE).toBeGreaterThanOrEqual(LINEWIDTH_MIN);
      expect(LINEWIDTH.LARGE).toBeLessThanOrEqual(LINEWIDTH_MAX);
    });

    test('デフォルト値が範囲内にある', () => {
      expect(LINEWIDTH_DEFAULT).toBeGreaterThanOrEqual(LINEWIDTH_MIN);
      expect(LINEWIDTH_DEFAULT).toBeLessThanOrEqual(LINEWIDTH_MAX);
    });
  });

  describe('MODE', () => {
    test('すべてのモードが定義されている', () => {
      expect(MODE.FREEHAND).toBe('freehand');
      expect(MODE.ELLIPSE).toBe('ellipse');
      expect(MODE.RECTANGLE).toBe('rectangle');
      expect(MODE.ARROW).toBe('arrow');
      expect(MODE.PAN).toBe('pan');
      expect(MODE.ERASE).toBe('erase');
      expect(MODE.SELECT).toBe('select');
    });

    test('すべてのモードが文字列である', () => {
      Object.values(MODE).forEach((mode) => {
        expect(typeof mode).toBe('string');
      });
    });
  });
});
