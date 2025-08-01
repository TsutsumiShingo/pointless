# 全体アーキテクチャ設計書

## 概要

Pointlessアプリケーションの全体的なソフトウェアアーキテクチャを定義します。React + Tauri構成によるデスクトップアプリケーションとして、フロントエンド、バックエンド、ローカルストレージの3層構造で設計されています。

## システム全体構成

```mermaid
graph TB
    subgraph "フロントエンド層 (React/TypeScript)"
        A[App Component]
        B[Library Component]
        C[Paper Component]
        D[Modal Components]
        E[Redux Store]
        F[UI Components]
    end
    
    subgraph "アプリケーション層 (Redux)"
        G[Library Slice]
        H[Paper Slice]
        I[Router Slice]
        J[Settings Slice]
        K[Middleware]
    end
    
    subgraph "バックエンド層 (Tauri/Rust)"
        L[Main Process]
        M[Commands Module]
        N[File I/O Module]
        O[Config Module]
        P[Compression Module]
    end
    
    subgraph "ストレージ層"
        Q[library.json]
        R[settings.json]
        S["papers/*.br"]
    end
    
    A --> E
    B --> E
    C --> E
    E --> G
    E --> H
    E --> I
    E --> J
    G --> M
    H --> M
    J --> M
    M --> N
    M --> O
    N --> P
    P --> Q
    P --> R
    P --> S
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style M fill:#fff3e0
    style Q fill:#e8f5e8
```

## レイヤー別アーキテクチャ

### プレゼンテーション層（React Components）

```mermaid
graph TB
    subgraph "プレゼンテーション層"
        A[App Component]
        B[React Router]
        C[React Components]
        D[CSS Modules]
        E[SVG Canvas]
        F[Event Handlers]
    end
    
    subgraph "状態管理層"
        G[Redux Store]
        H[React-Redux]
        I[Redux Toolkit]
    end
    
    A --> B
    A --> C
    C --> D
    C --> E
    C --> F
    C --> H
    H --> G
    H --> I
```

#### 責務
- **UI表示**: コンポーネントベースのユーザーインターフェース
- **ユーザー操作**: イベントハンドリングとユーザーアクション
- **状態購読**: Redux storeからの状態変更の購読
- **レンダリング**: 効率的なDOM更新とSVG描画

### アプリケーション層（Redux State Management）

```mermaid
graph LR
    subgraph "Redux Store"
        A[Library Slice]
        B[Paper Slice]
        C[Router Slice]
        D[Settings Slice]
    end
    
    subgraph "Middleware"
        E[Thunk Middleware]
        F[Logger Middleware]
        G[Persistence Middleware]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    E --> F
    F --> G
```

#### 責務
- **状態管理**: アプリケーション全体の状態の一元管理
- **ビジネスロジック**: データ変換とビジネスルール
- **非同期処理**: API呼び出しと副作用の管理
- **永続化**: 状態の保存と復元

### ドメイン層（Business Logic）

```mermaid
graph TB
    subgraph "ドメイン層"
        A[Drawing Logic]
        B[File Management]
        C[Shape Operations]
        D[Canvas Transformations]
        E[Data Validation]
    end
    
    A --> C
    A --> D
    B --> E
    C --> E
```

#### 責務
- **描画ロジック**: SVGベースの描画処理
- **ファイル管理**: フォルダ・ペーパーの操作
- **データ変換**: モデル間の変換処理
- **バリデーション**: データ整合性の検証

### インフラストラクチャ層（Tauri Backend）

```mermaid
graph TB
    subgraph "Tauri Core"
        A[Main Process]
        B[Window Management]
        C[Menu System]
        D[OS Integration]
    end
    
    subgraph "Custom Modules"
        E[Commands Module]
        F[File I/O Module]
        G[Config Module]
        H[Compression Module]
    end
    
    subgraph "External Services"
        I[File System]
        J[OS APIs]
        K[Native Dialogs]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    E --> F
    E --> G
    F --> H
    F --> I
    D --> J
    D --> K
```

#### 責務
- **システム統合**: OS固有の機能へのアクセス
- **ファイルI/O**: ローカルファイルシステムとの連携
- **セキュリティ**: サンドボックス環境での安全な操作
- **パフォーマンス**: ネイティブレベルの処理性能

## アーキテクチャパターン

### 1. MVC（Model-View-Controller）パターン

```mermaid
graph LR
    V[View<br/>React Components] --> C[Controller<br/>Redux Actions]
    C --> M[Model<br/>Redux State]
    M --> V
    
    C --> T[Tauri Backend]
    T --> S[Storage]
```

### 2. レイヤードアーキテクチャ

| レイヤー | 技術 | 責務 |
|---------|------|------|
| プレゼンテーション | React/TypeScript | UI表示、ユーザー操作 |
| アプリケーション | Redux Toolkit | 状態管理、ビジネスロジック |
| ドメイン | TypeScript | コアロジック、データモデル |
| インフラストラクチャ | Tauri/Rust | システム統合、永続化 |

### 3. イベント駆動アーキテクチャ

```mermaid
sequenceDiagram
    participant UI as UI Components
    participant Store as Redux Store
    participant MW as Middleware
    participant API as Tauri API
    participant FS as File System
    
    UI->>Store: Dispatch Action
    Store->>MW: Process Action
    MW->>API: Invoke Command
    API->>FS: File Operation
    FS-->>API: Result
    API-->>MW: Response
    MW->>Store: Update State
    Store-->>UI: State Change
```

## コンポーネント間通信

### 1. フロントエンド内通信

```mermaid
graph TD
    A[Parent Component] --> B[Redux Store]
    B --> C[Child Component]
    C --> D[Event Handler]
    D --> B
    B --> E[Another Component]
```

- **Redux**: 状態の一元管理による間接通信
- **Props**: 親子コンポーネント間の直接通信
- **Context**: 深いコンポーネント階層での状態共有

### 2. フロントエンド ↔ バックエンド通信

```mermaid
sequenceDiagram
    participant React as React Frontend
    participant Tauri as Tauri Core
    participant Rust as Rust Backend
    
    React->>Tauri: invoke('command_name', params)
    Tauri->>Rust: route to handler
    Rust->>Rust: process command
    Rust-->>Tauri: return result
    Tauri-->>React: Promise resolution
```

### 3. データフロー

```mermaid
graph TB
    A[User Action] --> B[Event Handler]
    B --> C[Redux Action]
    C --> D[Thunk Middleware]
    D --> E[Tauri Command]
    E --> F[File Operation]
    F --> G[Redux State Update]
    G --> H[Component Re-render]
```

## セキュリティアーキテクチャ

### 1. サンドボックス環境

```mermaid
graph TB
    subgraph "Tauri Sandbox"
        A[WebView<br/>React App]
        B[IPC Bridge]
        C[Command Handlers]
    end
    
    subgraph "System Resources"
        D[File System]
        E[Network]
        F[OS APIs]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    
    style A fill:#e3f2fd
    style C fill:#fff3e0
    style D fill:#f1f8e9
```

### 2. 権限モデル

| リソース | アクセス権 | 制約 |
|---------|-----------|------|
| ローカルファイル | 読み書き | アプリデータディレクトリのみ |
| ネットワーク | なし | オフラインアプリ |
| システムAPI | 制限付き | ダイアログ、ウィンドウ管理のみ |

## パフォーマンスアーキテクチャ

### 1. レンダリング最適化

```mermaid
graph TD
    A[State Change] --> B{Affected Components}
    B --> C[React.memo]
    B --> D[useMemo/useCallback]
    C --> E[Selective Re-render]
    D --> E
    E --> F[Virtual DOM Diff]
    F --> G[DOM Update]
```

### 2. データ最適化

```mermaid
graph TD
    A[Data Request] --> B{Cache Check}
    B -->|Hit| C[Return Cached]
    B -->|Miss| D[Load from Storage]
    D --> E[Decompress]
    E --> F[Parse JSON]
    F --> G[Update Cache]
    G --> C
```

### 3. 非同期処理

```mermaid
graph TD
    A[User Action] --> B[Immediate UI Update]
    A --> C[Background Task]
    C --> D[File I/O]
    D --> E[Compression]
    E --> F[Write to Disk]
    F --> G[Update UI State]
```

## 拡張性設計

### 1. プラグインアーキテクチャ

```mermaid
graph TB
    subgraph "Core System"
        A[Plugin Manager]
        B[Event Bus]
        C[Extension Points]
    end
    
    subgraph "Plugins"
        D[Drawing Tools]
        E[Export Formats]
        F[Import Sources]
    end
    
    A --> D
    A --> E
    A --> F
    B --> C
    C --> D
    C --> E
    C --> F
```

### 2. モジュラー設計

```typescript
// モジュール定義例
interface DrawingTool {
  name: string;
  icon: string;
  onStart: (point: Point) => void;
  onDrag: (point: Point) => void;
  onEnd: (point: Point) => Shape;
}

interface ExportFormat {
  name: string;
  extension: string;
  export: (shapes: Shape[]) => Promise<Blob>;
}
```

## 障害対応アーキテクチャ

### 1. エラーハンドリング階層

```mermaid
graph TD
    A[Component Error] --> B[Error Boundary]
    B --> C[Fallback UI]
    
    D[Redux Error] --> E[Error Middleware]
    E --> F[Error State]
    
    G[Tauri Error] --> H[Error Response]
    H --> I[Redux Error Action]
```

### 2. データ復旧メカニズム

```mermaid
graph TD
    A[Data Corruption] --> B{Backup Available?}
    B -->|Yes| C[Restore from Backup]
    B -->|No| D[Initialize Default]
    C --> E[Validate Data]
    D --> E
    E --> F[Continue Operation]
```

このアーキテクチャにより、Pointlessアプリケーションは拡張性、保守性、パフォーマンスを兼ね備えた堅牢なシステムとして設計されています。