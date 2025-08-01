# インタフェース仕様書／API定義書

## 1. 概要

Pointlessアプリケーションのインタフェース仕様とAPI定義を定義します。フロントエンド（React）とバックエンド（Tauri/Rust）間の通信インタフェース、コンポーネント間のインタフェース、および外部APIとの連携を定義します。

## 2. Tauri Commands API

### 2.1 ライブラリ管理API

#### 2.1.1 フォルダ読み込み

```rust
#[tauri::command]
async fn load_library_folders(handle: AppHandle) -> Option<Vec<serde_json::Value>>
```

**説明**: ライブラリ内のすべてのフォルダを読み込みます。

**パラメータ**:

- `handle: AppHandle` - Tauriアプリケーションハンドル

**戻り値**:

- `Option<Vec<serde_json::Value>>` - フォルダ情報の配列、またはNone

**レスポンス例**:

```json
[
  {
    "id": "uuid-string",
    "name": "フォルダ名",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 2.1.2 フォルダ内ペーパー読み込み

```rust
#[tauri::command]
async fn load_library_folder_papers(handle: AppHandle, folder_id: String) -> Option<Vec<serde_json::Value>>
```

**説明**: 指定されたフォルダ内のすべてのペーパーを読み込みます。

**パラメータ**:

- `handle: AppHandle` - Tauriアプリケーションハンドル
- `folder_id: String` - フォルダID

**戻り値**:

- `Option<Vec<serde_json::Value>>` - ペーパー情報の配列、またはNone

**レスポンス例**:

```json
[
  {
    "id": "uuid-string",
    "folderId": "folder-uuid",
    "name": "ペーパー名",
    "shapes": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 2.1.3 ライブラリ保存

```rust
#[tauri::command]
async fn save_library(handle: AppHandle, library_state: String)
```

**説明**: ライブラリの状態をファイルシステムに保存します。

**パラメータ**:

- `handle: AppHandle` - Tauriアプリケーションハンドル
- `library_state: String` - JSON形式のライブラリ状態

**戻り値**: なし

#### 2.1.4 フォルダ削除

```rust
#[tauri::command]
async fn delete_library_folder(handle: AppHandle, folder_id: String)
```

**説明**: 指定されたフォルダとその中のすべてのペーパーを削除します。

**パラメータ**:

- `handle: AppHandle` - Tauriアプリケーションハンドル
- `folder_id: String` - 削除するフォルダのID

**戻り値**: なし

#### 2.1.5 ペーパー削除

```rust
#[tauri::command]
async fn delete_library_paper(handle: AppHandle, folder_id: String, paper_id: String)
```

**説明**: 指定されたペーパーを削除します。

**パラメータ**:

- `handle: AppHandle` - Tauriアプリケーションハンドル
- `folder_id: String` - フォルダID
- `paper_id: String` - 削除するペーパーのID

**戻り値**: なし

### 2.2 設定管理API

#### 2.2.1 設定保存

```rust
#[tauri::command]
async fn save_settings(handle: AppHandle, settings: String)
```

**説明**: アプリケーション設定をファイルシステムに保存します。

**パラメータ**:

- `handle: AppHandle` - Tauriアプリケーションハンドル
- `settings: String` - JSON形式の設定データ

**戻り値**: なし

#### 2.2.2 設定読み込み

```rust
#[tauri::command]
async fn load_settings(handle: AppHandle) -> Option<serde_json::Value>
```

**説明**: アプリケーション設定をファイルシステムから読み込みます。

**パラメータ**:

- `handle: AppHandle` - Tauriアプリケーションハンドル

**戻り値**:

- `Option<serde_json::Value>` - 設定データ、またはNone

**レスポンス例**:

```json
{
  "isDarkMode": false,
  "platform": "windows",
  "appVersion": "1.11.0",
  "sortPapersBy": "name_az",
  "viewMode": 0,
  "canvasPreferredLinewidth": 2
}
```

## 3. Redux Actions API

### 3.1 ルーティングActions

#### 3.1.1 画面遷移

```typescript
const to = (payload: { name: string; args: object }) => ({
  type: 'router/to',
  payload
});
```

**説明**: 指定された画面に遷移します。

**パラメータ**:

- `name: string` - 遷移先画面名（'library' | 'paper'）
- `args: object` - 遷移時の引数

**使用例**:

```typescript
dispatch(to({ name: 'paper', args: { paperId: 'uuid' } }));
dispatch(to({ name: 'library', args: {} }));
```

### 3.2 ライブラリActions

#### 3.2.1 フォルダ作成

```typescript
const newFolder = () => ({
  type: 'library/newFolder'
});
```

**説明**: 新しいフォルダを作成します。

#### 3.2.2 ペーパー作成

```typescript
const newPaperInFolder = (folderId: string) => ({
  type: 'library/newPaperInFolder',
  payload: folderId
});
```

**説明**: 指定されたフォルダ内に新しいペーパーを作成します。

**パラメータ**:

- `folderId: string` - フォルダID

#### 3.2.3 フォルダ名更新

```typescript
const updateFolderName = (payload: { id: string; name: string }) => ({
  type: 'library/updateFolderName',
  payload
});
```

**説明**: フォルダ名を更新します。

**パラメータ**:

- `id: string` - フォルダID
- `name: string` - 新しいフォルダ名

#### 3.2.4 ペーパー名更新

```typescript
const updatePaperName = (payload: { id: string; name: string }) => ({
  type: 'library/updatePaperName',
  payload
});
```

**説明**: ペーパー名を更新します。

**パラメータ**:

- `id: string` - ペーパーID
- `name: string` - 新しいペーパー名

#### 3.2.5 ペーパー図形更新

```typescript
const setPaperShapes = (payload: { id: string; shapes: Shape[] }) => ({
  type: 'library/setPaperShapes',
  payload
});
```

**説明**: ペーパーの図形データを更新します。

**パラメータ**:

- `id: string` - ペーパーID
- `shapes: Shape[]` - 図形データの配列

#### 3.2.6 ライブラリ保存

```typescript
const saveLibrary = () => ({
  type: 'library/saveLibrary'
});
```

**説明**: ライブラリの状態をファイルシステムに保存します。

### 3.3 設定Actions

#### 3.3.1 ダークモード設定

```typescript
const setDarkMode = (isDarkMode: boolean) => ({
  type: 'settings/setDarkMode',
  payload: isDarkMode
});
```

**説明**: ダークモードの設定を更新します。

**パラメータ**:

- `isDarkMode: boolean` - ダークモード有効/無効

#### 3.3.2 プラットフォーム設定

```typescript
const setPlatform = (platform: string) => ({
  type: 'settings/setPlatform',
  payload: platform
});
```

**説明**: プラットフォーム情報を設定します。

**パラメータ**:

- `platform: string` - プラットフォーム名

#### 3.3.3 ソート設定

```typescript
const setSortPapersBy = (sortBy: string) => ({
  type: 'settings/setSortPapersBy',
  payload: sortBy
});
```

**説明**: ペーパーのソート方法を設定します。

**パラメータ**:

- `sortBy: string` - ソート方法

#### 3.3.4 表示モード設定

```typescript
const setViewMode = (viewMode: number) => ({
  type: 'settings/setViewMode',
  payload: viewMode
});
```

**説明**: 表示モードを設定します。

**パラメータ**:

- `viewMode: number` - 表示モード（0: グリッド, 1: リスト）

## 4. コンポーネントインタフェース

### 4.1 Library Component

#### 4.1.1 Props

```typescript
interface LibraryProps {
  library: {
    folders: Folder[];
    papers: Paper[];
  };
  settings: {
    sortPapersBy: string;
    viewMode: number;
    isDarkMode: boolean;
  };
  dispatch: Dispatch;
}
```

#### 4.1.2 State

```typescript
interface LibraryState {
  currentFolderId: string | null;
  sortBy: string;
  viewMode: number;
}
```

### 4.2 Paper Component

#### 4.2.1 Props

```typescript
interface PaperProps {
  paperId: string;
  library: {
    papers: Paper[];
  };
  settings: {
    canvasPreferredLinewidth: number;
    isDarkMode: boolean;
  };
  dispatch: Dispatch;
}
```

#### 4.2.2 State

```typescript
interface PaperState {
  userLastActiveAt: string;
  librarySynced: boolean;
  selectedColor: string;
  linewidth: number;
  mode: string;
  eraserSize: number;
  clipboard: Shape[];
  prevMode: string | null;
  cursorX: number;
  cursorY: number;
  prevCursorX: number;
  prevCursorY: number;
  fixedCursorX: number | null;
  fixedCursorY: number | null;
  prevPinchDist: number;
  isDrawing: boolean;
  isPanning: boolean;
  isErasing: boolean;
  isSelecting: boolean;
  isMovingSelection: boolean;
  selectedShapeIndexes: number[];
  translateX: number;
  translateY: number;
  forceUpdate: boolean;
  scale: number;
  canvasElements: any[];
  masks: any[];
  history: Shape[];
  undoHistory: Shape[];
  shapes: Shape[];
  currentShape: Shape;
}
```

### 4.3 Toolbar Component

#### 4.3.1 Props

```typescript
interface ToolbarProps {
  mode: string;
  onToolChange: (mode: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

### 4.4 Palette Component

#### 4.4.1 Props

```typescript
interface PaletteProps {
  selectedColor: string;
  linewidth: number;
  onColorChange: (color: string) => void;
  onLinewidthChange: (linewidth: number) => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
}
```

## 5. イベントハンドラー

### 5.1 マウスイベント

#### 5.1.1 マウスダウン

```typescript
const handleMouseDown = (event: MouseEvent) => {
  // 描画開始処理
};
```

#### 5.1.2 マウス移動

```typescript
const handleMouseMove = (event: MouseEvent) => {
  // 描画継続処理
};
```

#### 5.1.3 マウスアップ

```typescript
const handleMouseUp = (event: MouseEvent) => {
  // 描画終了処理
};
```

### 5.2 タッチイベント

#### 5.2.1 タッチ開始

```typescript
const handleTouchStart = (event: TouchEvent) => {
  // タッチ開始処理
};
```

#### 5.2.2 タッチ移動

```typescript
const handleTouchMove = (event: TouchEvent) => {
  // タッチ移動処理
};
```

#### 5.2.3 タッチ終了

```typescript
const handleTouchEnd = (event: TouchEvent) => {
  // タッチ終了処理
};
```

### 5.3 キーボードイベント

#### 5.3.1 キーダウン

```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  // キーボードショートカット処理
};
```

## 6. エラーハンドリング

### 6.1 API エラー

#### 6.1.1 ファイル操作エラー

```typescript
interface FileOperationError {
  type: 'FILE_OPERATION_ERROR';
  message: string;
  code: string;
  path?: string;
}
```

#### 6.1.2 ネットワークエラー

```typescript
interface NetworkError {
  type: 'NETWORK_ERROR';
  message: string;
  status?: number;
}
```

### 6.2 エラーレスポンス

#### 6.2.1 エラーレスポンス形式

```typescript
interface ErrorResponse {
  error: {
    type: string;
    message: string;
    code?: string;
    details?: any;
  };
}
```

## 7. データ型定義

### 7.1 基本データ型

```typescript
// 座標点
interface Point {
  x: number;
  y: number;
}

// 図形
interface Shape {
  color: string;
  linewidth: number;
  points: Point[];
  type?: string;
}

// フォルダ
interface Folder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ペーパー
interface Paper {
  id: string;
  folderId: string;
  name: string;
  shapes: Shape[];
  createdAt: string;
  updatedAt: string;
}

// 設定
interface Settings {
  isDarkMode: boolean;
  platform: string | null;
  appVersion: string | null;
  sortPapersBy: string;
  viewMode: number;
  canvasPreferredLinewidth: number;
}
```

### 7.2 定数定義

```typescript
// 描画モード
const MODE = {
  FREEHAND: 'freehand',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  ARROW: 'arrow',
  SELECT: 'select',
  PAN: 'pan',
  ERASE: 'erase'
} as const;

// 線の太さ
const LINEWIDTH = {
  SMALL: 2,
  MEDIUM: 4,
  LARGE: 6
} as const;

// ソート方法
const SORT_BY = {
  NAME_AZ: 'name_az',
  NAME_ZA: 'name_za',
  CREATED_DESC: 'created_desc',
  CREATED_ASC: 'created_asc',
  LAST_MODIFIED_DESC: 'last_modified_desc',
  LAST_MODIFIED_ASC: 'last_modified_asc'
} as const;

// 表示モード
const VIEW_MODE = {
  GRID: 0,
  LIST: 1
} as const;
```

## 8. パフォーマンス最適化

### 8.1 メモ化

```typescript
// React.memo を使用したコンポーネント最適化
const OptimizedComponent = React.memo(({ data, onAction }) => {
  // コンポーネント実装
});

// useMemo を使用した計算結果のメモ化
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// useCallback を使用した関数のメモ化
const memoizedCallback = useCallback((param) => {
  doSomething(param);
}, [dependency]);
```

### 8.2 遅延読み込み

```typescript
// 動的インポートによる遅延読み込み
const LazyComponent = lazy(() => import('./LazyComponent'));

// Suspense を使用した遅延読み込み
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```
