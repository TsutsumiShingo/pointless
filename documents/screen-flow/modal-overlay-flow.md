# モーダル・オーバーレイ遷移フロー

## 概要

Pointlessアプリケーションにおけるモーダルダイアログ、オーバーレイ、ツールチップの表示フローを定義します。これらのUI要素は画面遷移を伴わず、現在の画面上にレイヤーとして表示されます。

## モーダル表示フロー

### 基本的なモーダル表示パターン

```mermaid
graph TD
    BaseScreen[ベース画面] --> UserAction{ユーザーアクション}
    UserAction -->|トリガー| ShowModal[モーダル表示]
    ShowModal --> ModalInteraction{モーダル内操作}
    
    ModalInteraction -->|確定| ProcessAction[アクション実行]
    ModalInteraction -->|キャンセル| CloseModal[モーダルを閉じる]
    ModalInteraction -->|ESCキー| CloseModal
    ModalInteraction -->|×ボタン| CloseModal
    
    ProcessAction --> CloseModal
    CloseModal --> BaseScreen
    
    ShowModal -.->|背景クリック無効| ShowModal
```

## 各モーダルの詳細フロー

### 1. エクスポートダイアログ

```mermaid
graph TD
    Paper[描画画面] --> ClickExport{エクスポートボタンクリック}
    ClickExport -->|キャンバスが空| Disabled[無効状態]
    ClickExport -->|コンテンツあり| OpenExport[エクスポートダイアログ表示]
    
    OpenExport --> ConfigExport[エクスポート設定]
    ConfigExport --> SelectFormat{形式選択}
    
    SelectFormat -->|PNG| ShowPNGOptions[PNG固有オプション表示]
    SelectFormat -->|JPG/SVG| HidePNGOptions[PNG固有オプション非表示]
    
    ShowPNGOptions --> ExportButton{エクスポートボタン}
    HidePNGOptions --> ExportButton
    
    ExportButton -->|クリック| ExecuteExport[エクスポート実行]
    ExecuteExport --> SaveFile[ファイル保存]
    SaveFile --> CloseExport[ダイアログを閉じる]
    
    OpenExport -->|ESC/×| CloseExport
    CloseExport --> Paper
```

### 2. ヘルプダイアログ

```mermaid
graph TD
    Paper[描画画面] --> ClickHelp[ヘルプボタンクリック]
    ClickHelp --> ShowHelp[ヘルプダイアログ表示]
    
    ShowHelp --> ViewShortcuts[ショートカット一覧閲覧]
    ViewShortcuts -->|ESC/×| CloseHelp[ダイアログを閉じる]
    
    CloseHelp --> Paper
```

### 3. ペーパー情報ダイアログ

```mermaid
graph TD
    Paper[描画画面] --> ClickInfo[情報ボタンクリック]
    ClickInfo --> ShowInfo[情報ダイアログ表示]
    
    ShowInfo --> EditInfo{編集操作}
    EditInfo -->|ペーパー名編集| UpdatePaperName[ペーパー名更新]
    EditInfo -->|フォルダ名編集| UpdateFolderName[フォルダ名更新]
    
    UpdatePaperName --> AutoSave1[自動保存]
    UpdateFolderName --> AutoSave2[自動保存]
    
    ShowInfo -->|ESC/×| CloseInfo[ダイアログを閉じる]
    AutoSave1 --> ShowInfo
    AutoSave2 --> ShowInfo
    
    CloseInfo --> Paper
```

### 4. 確認ダイアログ（Tauri Native Dialog）

```mermaid
graph TD
    Action[削除アクション] --> ShowConfirm[確認ダイアログ表示]
    
    ShowConfirm --> UserChoice{ユーザー選択}
    UserChoice -->|OK| ExecuteDelete[削除実行]
    UserChoice -->|キャンセル| CancelDelete[削除キャンセル]
    
    ExecuteDelete --> UpdateUI[UI更新]
    CancelDelete --> NoChange[変更なし]
    
    UpdateUI --> Continue[操作継続]
    NoChange --> Continue
```

## オーバーレイ表示パターン

### 1. カラーピッカーオーバーレイ

```mermaid
graph TD
    Palette[パレット] --> DoubleClick[カスタムカラーダブルクリック]
    DoubleClick --> ShowPicker[カラーピッカー表示]
    
    ShowPicker --> PickColor{色選択}
    PickColor -->|色変更| PreviewColor[プレビュー更新]
    PickColor -->|確定| ApplyColor[色を適用]
    
    PreviewColor --> PickColor
    ApplyColor --> ClosePicker[ピッカーを閉じる]
    
    ShowPicker -->|外側クリック| ClosePicker
    ShowPicker -->|×ボタン| ClosePicker
    
    ClosePicker --> Palette
```

### 2. ツールチップ表示

```mermaid
graph TD
    UIElement[UI要素] --> Hover[マウスホバー]
    Hover --> Delay[遅延タイマー]
    Delay -->|500ms経過| ShowTooltip[ツールチップ表示]
    
    ShowTooltip --> MouseLeave{マウス離脱}
    MouseLeave --> HideTooltip[ツールチップ非表示]
    
    Hover -->|即座に離脱| CancelTimer[タイマーキャンセル]
    CancelTimer --> UIElement
    HideTooltip --> UIElement
```

## インライン編集フロー

```mermaid
graph TD
    DisplayMode[表示モード] --> Click[テキストクリック]
    Click --> EditMode[編集モード開始]
    
    EditMode --> UserEdit{ユーザー編集}
    UserEdit -->|Enter| SaveEdit[編集を保存]
    UserEdit -->|ESC| CancelEdit[編集をキャンセル]
    UserEdit -->|フォーカスアウト| SaveEdit
    
    SaveEdit --> Validate{バリデーション}
    Validate -->|成功| UpdateData[データ更新]
    Validate -->|失敗| ShowError[エラー表示]
    
    UpdateData --> DisplayMode
    CancelEdit --> DisplayMode
    ShowError --> EditMode
```

## モーダル間の相互作用

```mermaid
graph TD
    Modal1[モーダル1表示中] --> Action{アクション}
    Action -->|別モーダルを開く| CloseFirst[現在のモーダルを閉じる]
    CloseFirst --> OpenSecond[新しいモーダルを開く]
    
    Action -->|同じモーダルを開く| PreventDuplicate[重複表示を防止]
    PreventDuplicate --> Modal1
```

## エラー処理フロー

```mermaid
graph TD
    ModalAction[モーダル内アクション] --> Process{処理実行}
    Process -->|成功| Success[成功処理]
    Process -->|エラー| Error[エラー処理]
    
    Success --> CloseModal[モーダルを閉じる]
    Error --> ShowError[エラーメッセージ表示]
    
    ShowError --> StayOpen[モーダルは開いたまま]
    StayOpen --> UserCorrection[ユーザー修正待ち]
```

## アクセシビリティ考慮

### フォーカス管理

```mermaid
graph TD
    OpenModal[モーダルを開く] --> TrapFocus[フォーカストラップ有効化]
    TrapFocus --> FirstElement[最初の要素にフォーカス]
    
    FirstElement --> TabNavigation{Tabキー操作}
    TabNavigation -->|Tab| NextElement[次の要素]
    TabNavigation -->|Shift+Tab| PrevElement[前の要素]
    
    NextElement -->|最後の要素| FirstElement
    PrevElement -->|最初の要素| LastElement[最後の要素]
    
    CloseModal[モーダルを閉じる] --> RestoreFocus[元の要素にフォーカス復元]
```

## パフォーマンス最適化

1. **遅延表示**
   - ツールチップは500ms後に表示
   - 頻繁な表示/非表示を防止

2. **アニメーション**
   - モーダル: 200msのフェードイン/アウト
   - オーバーレイ: 150msのトランジション

3. **メモリ管理**
   - 非表示時はDOMから削除
   - 大きなモーダルは遅延読み込み