# メイン画面遷移フロー

## 概要

Pointlessアプリケーションの主要な画面間の遷移フローを定義します。アプリケーションは主に「ライブラリ画面」と「描画画面」の2つの主要画面で構成されています。

## 画面遷移図

```mermaid
graph TB
    %% メイン画面
    Library[ライブラリ画面]
    Paper[描画画面]
    
    %% 画面遷移
    Library -->|ペーパー選択/新規作成| Paper
    Paper -->|戻るボタン| Library
    
    %% 起動時
    Start([アプリ起動]) --> Library
    
    %% 状態
    Library -.->|フォルダ選択| Library
    Paper -.->|自動保存| Paper
    
    style Library fill:#e1f5e1
    style Paper fill:#e1f5fe
    style Start fill:#fff3e0
```

## 詳細な画面遷移フロー

### 1. アプリケーション起動フロー

```mermaid
graph TD
    Start([アプリ起動]) --> LoadSettings[設定の読み込み]
    LoadSettings --> LoadLibrary[ライブラリデータ読み込み]
    LoadLibrary --> ShowLibrary[ライブラリ画面表示]
    
    LoadSettings -->|エラー| DefaultSettings[デフォルト設定適用]
    DefaultSettings --> LoadLibrary
    
    LoadLibrary -->|エラー| EmptyLibrary[空のライブラリ表示]
```

### 2. ライブラリ画面での操作フロー

```mermaid
graph TD
    Library[ライブラリ画面] --> SelectFolder{フォルダ選択}
    SelectFolder -->|選択| ShowPapers[ペーパー一覧表示]
    SelectFolder -->|新規作成| CreateFolder[フォルダ作成]
    CreateFolder --> ShowPapers
    
    ShowPapers --> SelectPaper{ペーパー選択}
    SelectPaper -->|選択| OpenPaper[描画画面へ遷移]
    SelectPaper -->|新規作成| CreatePaper[ペーパー作成]
    CreatePaper --> OpenPaper
    
    Library --> ViewMode{表示モード切替}
    ViewMode -->|グリッド| GridView[グリッドビュー]
    ViewMode -->|リスト| ListView[リストビュー]
```

### 3. 描画画面での操作フロー

```mermaid
graph TD
    Paper[描画画面] --> Draw{描画操作}
    Draw -->|変更あり| AutoSave[自動保存]
    AutoSave --> Paper
    
    Paper --> BackButton{戻るボタン}
    BackButton -->|変更あり| SaveAndReturn[保存して戻る]
    BackButton -->|変更なし| Return[ライブラリへ戻る]
    
    SaveAndReturn --> Library[ライブラリ画面]
    Return --> Library
```

## トリガーとアクション

### ライブラリ画面 → 描画画面

| トリガー | アクション | 備考 |
|---------|-----------|------|
| ペーパーサムネイルクリック | 選択されたペーパーを開く | グリッドビューの場合 |
| テーブル行クリック | 選択されたペーパーを開く | リストビューの場合 |
| 「new paper」ボタンクリック | 新規ペーパーを作成して開く | 選択中のフォルダに作成 |

### 描画画面 → ライブラリ画面

| トリガー | アクション | 備考 |
|---------|-----------|------|
| 左上の戻るボタンクリック | 自動保存してライブラリへ戻る | 変更がある場合のみ保存 |
| Escキー | 自動保存してライブラリへ戻る | キーボードショートカット |

### ライブラリ画面内での遷移

| トリガー | アクション | 備考 |
|---------|-----------|------|
| フォルダクリック | フォルダ内容を表示 | 画面遷移なし、内容更新のみ |
| 「new folder」ボタンクリック | 新規フォルダ作成 | 自動的に選択状態に |
| 表示モード切替 | ビューモード変更 | グリッド⇔リスト |
| ソート条件変更 | ペーパーの並び順変更 | 画面遷移なし |

## 状態管理

### Redux Routerの状態

```javascript
{
  router: {
    current: 'library' | 'paper',
    args: {
      paperId?: string  // 描画画面の場合のみ
    }
  }
}
```

### 画面遷移時の処理

1. **ライブラリ → 描画画面**
   - 選択されたペーパーIDをRedux stateに保存
   - ペーパーデータを読み込み
   - 描画画面コンポーネントをマウント

2. **描画画面 → ライブラリ**
   - 変更があれば自動保存
   - Redux stateのペーパーIDをクリア
   - ライブラリ画面を再表示

## エラーハンドリング

```mermaid
graph TD
    Action[画面遷移アクション] --> Check{エラーチェック}
    Check -->|成功| Transition[画面遷移実行]
    Check -->|ファイル読み込みエラー| ShowError[エラーメッセージ表示]
    Check -->|権限エラー| ShowPermissionError[権限エラー表示]
    
    ShowError --> StayOnScreen[現在の画面に留まる]
    ShowPermissionError --> StayOnScreen
```

## パフォーマンス最適化

1. **遅延読み込み**
   - 描画画面コンポーネントは必要時のみ読み込み
   - ペーパーデータは選択時に読み込み

2. **状態の永続化**
   - 最後に開いていた画面を記憶
   - フォルダ選択状態の保持

3. **プリロード**
   - ホバー時に次の画面データを先読み
   - 画面遷移の高速化