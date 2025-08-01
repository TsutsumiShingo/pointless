# 外部ライブラリ連携仕様書

## 概要

Pointlessアプリケーションで使用される外部ライブラリとの連携インタフェースを定義します。各ライブラリの使用方法、設定、統合パターンを詳細に記載します。

## 使用ライブラリ一覧

### UI・レンダリング関連

| ライブラリ | バージョン | 用途 | 重要度 |
|-----------|----------|------|-------|
| React | ^18.2.0 | UIフレームワーク | 必須 |
| React DOM | ^18.2.0 | DOM レンダリング | 必須 |
| React Color | ^2.19.3 | カラーピッカー | 高 |
| React Draggable | ^4.4.6 | ドラッグ可能要素 | 中 |
| React Move | ^6.5.0 | アニメーション | 中 |
| classnames | ^2.3.2 | CSS クラス結合 | 高 |

### 状態管理

| ライブラリ | バージョン | 用途 | 重要度 |
|-----------|----------|------|-------|
| Redux Toolkit | ^1.9.5 | 状態管理 | 必須 |
| React Redux | ^8.0.5 | React-Redux 接続 | 必須 |

### データ処理・ユーティリティ

| ライブラリ | バージョン | 用途 | 重要度 |
|-----------|----------|------|-------|
| D3 Ease | ^3.0.1 | イージング関数 | 中 |
| D3 Shape | ^3.2.0 | 図形・パス生成 | 高 |
| Day.js | ^1.11.7 | 日時処理 | 高 |
| UUID | ^9.0.0 | 一意ID生成 | 必須 |

### UI補助

| ライブラリ | バージョン | 用途 | 重要度 |
|-----------|----------|------|-------|
| RC Tooltip | ^6.0.1 | ツールチップ | 中 |
| PropTypes | ^15.8.1 | 型チェック | 中 |

### システム連携

| ライブラリ | バージョン | 用途 | 重要度 |
|-----------|----------|------|-------|
| Tauri API | ^1.2.0 | デスクトップ統合 | 必須 |

## 詳細統合仕様

### 1. React Color（カラーピッカー）

#### 使用コンポーネント
```typescript
import { SketchPicker, ColorResult } from 'react-color';
```

#### 統合パターン
```typescript
// Palette Component での使用例
function Palette({ selectedColor, onSelectColor }) {
  const [paletteColor, setPaletteColor] = useState('#000000');
  
  const handlePaletteChange = (color: ColorResult) => {
    setPaletteColor(color.hex);
  };
  
  const handleChangeComplete = (color: ColorResult) => {
    setPaletteColor(color.hex);
    onSelectColor(color.hex);
  };
  
  return (
    <SketchPicker
      color={paletteColor}
      onChange={handlePaletteChange}
      onChangeComplete={handleChangeComplete}
    />
  );
}
```

#### 設定・カスタマイズ
```typescript
// カラーピッカーの設定
const pickerSettings = {
  disableAlpha: true,        // アルファチャンネル無効
  presetColors: [            // プリセットカラー
    '#FF6900', '#FCB900', '#7BDCB5', 
    '#00D084', '#8ED1FC', '#0693E3'
  ],
  width: 200,               // 幅設定
};
```

### 2. D3 Shape（パス生成）

#### インポート
```typescript
import { line, curveCatmullRom } from 'd3-shape';
```

#### SVGパス生成
```typescript
// helpers.js での使用例
export const getSmoothPath = (points, smoothingFactor = 0.3) => {
  if (points.length < 2) return '';
  
  const lineGenerator = line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(curveCatmullRom.alpha(smoothingFactor));
  
  return lineGenerator(points) || '';
};
```

#### カスタム曲線
```typescript
import { curveBasis, curveCardinal, curveCatmullRom } from 'd3-shape';

// 異なる曲線タイプの設定
const curveTypes = {
  smooth: curveCatmullRom.alpha(0.5),
  gentle: curveBasis,
  sharp: curveCardinal.tension(0.8),
};
```

### 3. D3 Ease（アニメーション）

#### インポート・使用
```typescript
import { easePolyOut } from 'd3-ease';
import { Animate } from 'react-move';
```

#### アニメーション設定
```typescript
// Paper Component でのフェードアニメーション
<Animate
  show={this.state.isVisible}
  start={{ opacity: 0 }}
  enter={{ opacity: [1], timing: { duration: 300, ease: easePolyOut } }}
  leave={{ opacity: [0], timing: { duration: 200, ease: easePolyOut } }}
>
  {(state) => (
    <div style={{ opacity: state.opacity }}>
      {/* コンテンツ */}
    </div>
  )}
</Animate>
```

### 4. React Draggable（ドラッグ機能）

#### 基本使用法
```typescript
import Draggable from 'react-draggable';

// カラーピッカーのドラッグ機能
<Draggable handle={`.${styles['custom-color-container__handle']}`}>
  <div className={styles['color-palette__selector']}>
    <div className={styles['custom-color-container__handle']}>
      {/* ドラッグハンドル */}
    </div>
    <SketchPicker />
  </div>
</Draggable>
```

#### 制約設定
```typescript
// 特定範囲内でのドラッグ制限
<Draggable
  bounds="parent"                    // 親要素内に制限
  handle=".drag-handle"             // ドラッグハンドル指定
  grid={[10, 10]}                   // グリッドスナップ
  onStart={this.handleDragStart}
  onDrag={this.handleDrag}
  onStop={this.handleDragStop}
>
  <div>ドラッグ可能要素</div>
</Draggable>
```

### 5. Day.js（日時処理）

#### 使用パターン
```typescript
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// プラグイン登録
dayjs.extend(relativeTime);
```

#### 日時フォーマット
```typescript
// helpers.js での日時処理
export const formatDate = (dateString, options = { relative: true }) => {
  const date = dayjs(dateString);
  
  if (options.relative) {
    return date.fromNow();           // "2 hours ago"
  }
  
  return date.format('YYYY-MM-DD HH:mm:ss');
};

// 使用例
const lastModified = formatDate(paper.updatedAt);          // "3 minutes ago"
const createdDate = formatDate(paper.createdAt, { relative: false }); // "2025-08-01 10:30:00"
```

### 6. UUID（ID生成）

#### 使用パターン
```typescript
import { v4 as uuidv4 } from 'uuid';

// 新規フォルダ・ペーパー作成時の ID 生成
const createNewFolder = () => ({
  id: uuidv4(),                     // "550e8400-e29b-41d4-a716-446655440000"
  name: 'Untitled',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### 7. RC Tooltip（ツールチップ）

#### 基本使用法
```typescript
import Tooltip from 'rc-tooltip';

// ツールバーボタンのツールチップ
<Tooltip 
  placement="top" 
  overlay="フリーハンド描画"
  mouseEnterDelay={0.5}
  mouseLeaveDelay={0.1}
>
  <button onClick={onClickFreehandTool}>
    <FreehandIcon />
  </button>
</Tooltip>
```

#### キーボードショートカット表示
```typescript
<Tooltip
  placement="top"
  overlay={
    <>
      フリーハンド描画
      <div className="kbd-shortcut">
        <kbd>F</kbd>
      </div>
    </>
  }
>
  <ToolButton />
</Tooltip>
```

### 8. classnames（CSS クラス管理）

#### 条件付きクラス
```typescript
import classNames from 'classnames';

// 状態に応じたクラス名の動的生成
const buttonClasses = classNames(
  styles['toolbar__item'],
  {
    [styles['toolbar__item-active']]: isActive,
    [styles['toolbar__item-disabled']]: isDisabled,
    [styles['toolbar__item--dark']]: isDarkMode,
  }
);

return <button className={buttonClasses} />;
```

### 9. Tauri API（システム統合）

#### ファイルシステムアクセス
```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { confirm } from '@tauri-apps/api/dialog';
import { downloadDir } from '@tauri-apps/api/path';

// Rust バックエンドとの通信
const saveLibrary = async (libraryState) => {
  try {
    await invoke('save_library', { 
      libraryState: JSON.stringify(libraryState) 
    });
  } catch (error) {
    console.error('Save failed:', error);
  }
};

// ネイティブダイアログ表示
const deleteFolder = async (folderName) => {
  const shouldDelete = await confirm(
    `フォルダ "${folderName}" を削除してもよろしいですか？`
  );
  
  if (shouldDelete) {
    // 削除処理
  }
};
```

## ライブラリ固有の設定

### Webpack設定（隠蔽）
```javascript
// React Scripts により自動設定
// Buffer polyfill は package.json の dependencies で管理
```

### TypeScript設定
```json
{
  "compilerOptions": {
    "types": ["react", "react-dom", "uuid"]
  }
}
```

## パフォーマンス考慮事項

### 1. Code Splitting
```typescript
// 大きなライブラリの遅延読み込み
const SketchPicker = React.lazy(() => 
  import('react-color').then(module => ({ 
    default: module.SketchPicker 
  }))
);
```

### 2. Tree Shaking
```typescript
// 必要な機能のみインポート
import { line } from 'd3-shape';           // Good
// import * as d3 from 'd3';               // Bad - 全体インポート
```

### 3. Bundle Size Management
```bash
# バンドルサイズ分析
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## エラーハンドリング

### ライブラリエラーの処理
```typescript
// D3 パス生成エラー
const generatePath = (points) => {
  try {
    return getSmoothPath(points) || 'M 0 0';
  } catch (error) {
    console.warn('Path generation failed:', error);
    return `M ${points[0]?.x || 0} ${points[0]?.y || 0}`;
  }
};

// カラーピッカーエラー
const handleColorChange = (color) => {
  try {
    if (color && color.hex) {
      onSelectColor(color.hex);
    }
  } catch (error) {
    console.error('Color selection failed:', error);
  }
};
```

## アップデート戦略

### セマンティックバージョニング
- **Major更新**: 破壊的変更時のみ実施
- **Minor更新**: 新機能追加時に評価
- **Patch更新**: セキュリティ修正は迅速適用

### 依存関係の管理
```bash
# セキュリティ監査
npm audit
npm audit fix

# 依存関係の更新チェック
npm outdated
```

このライブラリ統合仕様により、外部ライブラリとの安全で効率的な連携が実現されています。