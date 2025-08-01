# コアデータモデル定義書

## 概要

Pointlessアプリケーションで使用される主要なデータモデルの詳細定義です。すべてのデータは TypeScript の型定義に基づいており、ローカルファイルシステムに JSON 形式で保存されます。

## 1. Folder（フォルダ）モデル

### 定義

```typescript
interface Folder {
  id: string;           // UUID v4形式
  name: string;         // フォルダ名
  updatedAt: string;    // ISO 8601形式（例: "2025-08-01T10:30:00.000Z"）
  createdAt: string;    // ISO 8601形式
}
```

### プロパティ詳細

| プロパティ | 型 | 必須 | 説明 | 制約 |
|-----------|---|------|------|------|
| id | string | ✓ | フォルダの一意識別子 | UUID v4形式、変更不可 |
| name | string | ✓ | フォルダの表示名 | 1-255文字、ファイルシステム禁止文字を除く |
| updatedAt | string | ✓ | 最終更新日時 | ISO 8601形式、システム自動更新 |
| createdAt | string | ✓ | 作成日時 | ISO 8601形式、作成時に固定 |

### バリデーションルール

- `name`: 空文字不可、先頭末尾の空白は自動削除
- `name`: 以下の文字は使用不可: `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`
- 同一階層での名前重複は許可（IDで区別）

## 2. Paper（ペーパー）モデル

### 定義

```typescript
interface Paper {
  id: string;           // UUID v4形式
  name: string;         // ペーパー名
  folderId: string;     // 所属フォルダID
  shapes: Shape[];      // 描画シェイプの配列
  updatedAt: string;    // ISO 8601形式
  createdAt: string;    // ISO 8601形式
}
```

### プロパティ詳細

| プロパティ | 型 | 必須 | 説明 | 制約 |
|-----------|---|------|------|------|
| id | string | ✓ | ペーパーの一意識別子 | UUID v4形式、変更不可 |
| name | string | ✓ | ペーパーの表示名 | 1-255文字、ファイルシステム禁止文字を除く |
| folderId | string | ✓ | 所属フォルダのID | 存在するフォルダIDである必要あり |
| shapes | Shape[] | ✓ | 描画要素の配列 | 空配列可、順序は描画順 |
| updatedAt | string | ✓ | 最終更新日時 | ISO 8601形式、システム自動更新 |
| createdAt | string | ✓ | 作成日時 | ISO 8601形式、作成時に固定 |

### バリデーションルール

- `name`: Folderと同じルール適用
- `folderId`: 削除されたフォルダへの参照は無効
- `shapes`: 各要素はShapeモデルに準拠

## 3. Shape（シェイプ）モデル

### 定義

```typescript
interface Shape {
  type: ShapeType;              // 描画タイプ
  color: string;                // 色（Hex形式）
  linewidth: number;            // 線の太さ
  points?: Point[];             // フリーハンド用の点の配列
  x1?: number;                  // 始点X座標（図形用）
  y1?: number;                  // 始点Y座標（図形用）
  x2?: number;                  // 終点X座標（図形用）
  y2?: number;                  // 終点Y座標（図形用）
  preserveAspectRatio?: boolean;// アスペクト比保持フラグ
}

type ShapeType = 'FREEHAND' | 'RECTANGLE' | 'ELLIPSE' | 'ARROW' | 'SELECT';
```

### プロパティ詳細

| プロパティ | 型 | 必須 | 説明 | 制約 |
|-----------|---|------|------|------|
| type | ShapeType | ✓ | シェイプの種類 | 定義された5種類のみ |
| color | string | ✓ | 描画色 | 6桁のHexカラーコード（#RRGGBB） |
| linewidth | number | ✓ | 線の太さ | 1, 2, 4のいずれか |
| points | Point[] | △ | フリーハンドの点列 | type='FREEHAND'時は必須 |
| x1, y1 | number | △ | 始点座標 | 図形タイプ時は必須 |
| x2, y2 | number | △ | 終点座標 | 図形タイプ時は必須 |
| preserveAspectRatio | boolean | × | 比率保持 | デフォルトfalse |

### ShapeType別の必須フィールド

| ShapeType | 必須フィールド | 説明 |
|-----------|---------------|------|
| FREEHAND | points | 自由曲線の座標点配列 |
| RECTANGLE | x1, y1, x2, y2 | 矩形の対角座標 |
| ELLIPSE | x1, y1, x2, y2 | 楕円の外接矩形座標 |
| ARROW | x1, y1, x2, y2 | 矢印の始点と終点 |
| SELECT | x1, y1, x2, y2 | 選択範囲の矩形座標 |

## 4. Point（座標）モデル

### 定義

```typescript
interface Point {
  x: number;    // X座標
  y: number;    // Y座標
}
```

### プロパティ詳細

| プロパティ | 型 | 必須 | 説明 | 制約 |
|-----------|---|------|------|------|
| x | number | ✓ | X座標値 | 実数値、負値可 |
| y | number | ✓ | Y座標値 | 実数値、負値可 |

### 座標系仕様

- 原点（0,0）: キャンバスの中心
- X軸: 右方向が正
- Y軸: 下方向が正
- 単位: ピクセル（ズームレベルで変換）

## 5. Settings（設定）モデル

### 定義

```typescript
interface Settings {
  isDarkMode: boolean;              // ダークモード設定
  platform: string;                 // プラットフォーム
  appVersion: string;               // アプリバージョン
  sortPapersBy: SortBy;            // ペーパーのソート順
  viewMode: ViewMode;              // 表示モード
  canvasPreferredLinewidth: LineWidth; // デフォルト線幅
}

enum SortBy {
  NAME_AZ = 0,              // 名前昇順
  NAME_ZA = 1,              // 名前降順
  LAST_MODIFIED_DESC = 2,   // 更新日時降順
  LAST_MODIFIED_ASC = 3,    // 更新日時昇順
  CREATED_DESC = 4,         // 作成日時降順
  CREATED_ASC = 5           // 作成日時昇順
}

enum ViewMode {
  GRID = 0,    // グリッドビュー
  LIST = 1     // リストビュー
}

enum LineWidth {
  SMALL = 1,   // 細線
  MEDIUM = 2,  // 標準
  LARGE = 4    // 太線
}
```

### プロパティ詳細

| プロパティ | 型 | 必須 | 説明 | デフォルト値 |
|-----------|---|------|------|------------|
| isDarkMode | boolean | ✓ | ダークモードの有効/無効 | false |
| platform | string | ✓ | OS種別 | 自動検出 |
| appVersion | string | ✓ | アプリのバージョン | package.jsonから取得 |
| sortPapersBy | SortBy | ✓ | ペーパーの並び順 | LAST_MODIFIED_DESC |
| viewMode | ViewMode | ✓ | ライブラリの表示形式 | GRID |
| canvasPreferredLinewidth | LineWidth | ✓ | 新規描画時の線幅 | SMALL |

## 6. Library（ライブラリ）モデル

### 定義

```typescript
interface Library {
  folders: Folder[];    // フォルダの配列
  papers: Paper[];      // ペーパーの配列
}
```

### データ整合性ルール

1. **参照整合性**: Paper.folderIdは必ず存在するFolder.idを参照
2. **カスケード削除**: フォルダ削除時は所属する全ペーパーも削除
3. **孤立データ防止**: folderIdが無効なペーパーは起動時に削除

## データ永続化仕様

### ファイル構造

```
AppData/
├── library.json      # フォルダとペーパーのメタデータ
├── settings.json     # アプリケーション設定
└── papers/          # 個別ペーパーデータ
    ├── {paperId}.br  # Brotli圧縮されたペーパーデータ
    └── ...
```

### シリアライゼーション

1. **library.json**: フォルダとペーパーのメタデータ（shapesを除く）
2. **papers/{id}.br**: 個別ペーパーの完全データ（Brotli圧縮）
3. **settings.json**: アプリケーション設定

### 保存タイミング

- **即時保存**: フォルダ/ペーパーの作成・削除・名前変更
- **遅延保存**: 描画操作（最後の操作から3秒後）
- **自動保存**: 画面遷移時

## バージョン管理

### スキーマバージョン

```typescript
interface SchemaVersion {
  version: number;    // 現在: 1
  updatedAt: string;  // ISO 8601形式
}
```

### 移行戦略

- 後方互換性を3バージョンまで維持
- 非互換変更時はマイグレーション処理を実装
- ユーザーデータのバックアップを推奨