# セットアップガイド

このドキュメントでは、Google Apps Script スプレッドシートデータベースアプリケーションの詳細なセットアップ手順を説明します。

## 📋 前提条件

- Googleアカウント
- Google スプレッドシートへのアクセス権限
- 基本的なJavaScriptの知識（コードをカスタマイズする場合）

## 🚀 ステップバイステップセットアップ

### ステップ1: Google スプレッドシートの作成

1. [Google スプレッドシート](https://sheets.google.com/)にアクセス
2. 「空白」をクリックして新しいスプレッドシートを作成
3. スプレッドシートに名前を付ける（例: 「データベース管理」）

### ステップ2: Apps Scriptエディタを開く

1. メニューから「拡張機能」→「Apps Script」を選択
2. Apps Scriptエディタが新しいタブで開きます
3. デフォルトの `Code.gs` ファイルが表示されます

### ステップ3: プロジェクトファイルの追加

#### 3-1. appsscript.jsonの設定

1. 左側のファイルリストで「プロジェクトの設定」（歯車アイコン）をクリック
2. 「エディタで「appsscript.json」マニフェスト ファイルを表示する」にチェックを入れる
3. ファイルリストに戻り、`appsscript.json` をクリック
4. このリポジトリの `appsscript.json` の内容をコピー＆ペースト

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.container.ui"
  ]
}
```

#### 3-2. スクリプトファイルの追加

以下の手順で各ファイルを追加します：

1. 左側のファイルリストで「+」ボタンをクリック
2. 「スクリプト」を選択
3. ファイル名を入力（拡張子 .gs は自動的に付きます）
4. このリポジトリの対応するファイルの内容をコピー＆ペースト

**追加するファイル:**

- `Code.gs` - デフォルトで存在するファイルを編集
- `Config.gs` - 新規作成
- `Logger.gs` - 新規作成
- `SpreadsheetDB.gs` - 新規作成

各ファイルの内容は、このリポジトリの `src/` ディレクトリ内のファイルをコピーしてください。

#### 3-3. HTMLファイルの追加（Webアプリ用）

Webアプリとして使用する場合は、HTMLファイルも追加します：

1. 左側のファイルリストで「+」ボタンをクリック
2. 「HTML」を選択
3. ファイル名を `Index` と入力（拡張子 .html は自動的に付きます）
4. このリポジトリの `src/Index.html` の内容をコピー＆ペースト

### ステップ4: 権限の承認

1. エディタ上部の「実行」ボタンをクリック（関数は `onOpen` を選択）
2. 「権限を確認」ダイアログが表示される
3. Googleアカウントを選択
4. 「詳細」をクリック
5. 「（プロジェクト名）（安全ではないページ）に移動」をクリック
6. 「許可」をクリック

### ステップ5: 初期設定の実行

#### 方法A: UIメニューから（推奨）

1. スプレッドシートのタブに戻る
2. ページを再読み込み（F5キーまたはブラウザの更新ボタン）
3. メニューバーに「データベース管理」メニューが表示される
4. 「データベース管理」→「セットアップ」をクリック
5. 「セットアップ完了」のメッセージが表示されればOK

#### 方法B: スクリプトエディタから

Apps Scriptエディタで以下の関数を実行：

```javascript
function manualSetup() {
  // 現在のスプレッドシートIDを取得
  const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  
  // 設定を保存
  Config.setAll({
    'SPREADSHEET_ID': spreadsheetId,
    'SHEET_NAME': 'Database',
    'LOG_SHEET_NAME': 'Logs',
    'PRIMARY_KEY_COLUMN': 'ID',
    'CREATED_AT_COLUMN': 'CreatedAt',
    'UPDATED_AT_COLUMN': 'UpdatedAt',
    'TIMEZONE': 'Asia/Tokyo',
    'DATE_FORMAT': 'yyyy-MM-dd HH:mm:ss'
  });
  
  Logger.info('Manual setup completed');
}
```

### ステップ6: 動作確認

1. スプレッドシートで「データベース管理」→「サンプルデータを追加」を実行
2. 「Database」シートにサンプルデータが追加されることを確認
3. 「Logs」シートに操作ログが記録されることを確認

## 🌐 Webアプリとしてデプロイ（オプション）

ブラウザからアクセスできるWebアプリケーションとしてデプロイできます。

### ステップ1: デプロイの準備

1. `src/Index.html` ファイルがApps Scriptプロジェクトに追加されていることを確認
2. すべてのファイルが正しく保存されていることを確認

### ステップ2: Webアプリをデプロイ

1. Apps Scriptエディタの右上にある「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 「種類の選択」で「ウェブアプリ」を選択
4. 以下の設定を行う：
   - **説明**: `Webアプリ版 v1` など、わかりやすい説明を入力
   - **次のユーザーとして実行**: `自分` を選択
   - **アクセスできるユーザー**: 用途に応じて選択
     - `自分のみ`: 自分だけがアクセス可能
     - `<ドメイン名> のユーザー`: 組織内のユーザーがアクセス可能
     - `全員`: インターネット上の誰でもアクセス可能
5. 「デプロイ」ボタンをクリック
6. 表示される「ウェブアプリ」のURLをコピー

### ステップ3: Webアプリにアクセス

1. コピーしたURLをブラウザで開く
2. 初回アクセス時は権限の承認が必要
3. Webアプリのインターフェースが表示される

### ステップ4: Webアプリの機能

Webアプリでは以下の操作が可能です：

- **データ一覧の表示**: すべてのデータを一覧表示
- **データの追加**: フォームから新しいデータを追加
- **データの編集**: 各行の「編集」ボタンから既存データを編集
- **データの削除**: 各行の「削除」ボタンからデータを削除
- **フィルタリング**: 「Active のみ表示」でフィルタリング
- **リアルタイム更新**: 「🔄 更新」ボタンで最新データを取得

### ステップ5: デプロイの更新

コードを変更した後、変更を反映するには：

1. Apps Scriptエディタで「デプロイ」→「デプロイを管理」を選択
2. 既存のデプロイの右側にある鉛筆アイコン（編集）をクリック
3. 「バージョン」で「新バージョン」を選択
4. 「デプロイ」ボタンをクリック
5. URLは変わらないので、ブラウザで再読み込みすれば新しいバージョンが反映される

### セキュリティ上の注意

- **アクセス制限**: 機密情報を扱う場合は「アクセスできるユーザー」を適切に制限してください
- **認証**: Google認証が自動的に適用されるため、選択したユーザーのみがアクセス可能です
- **データの保護**: スプレッドシート自体の共有設定も適切に管理してください

## 🔧 環境変数の設定

`.env.sample` に定義されている環境変数をカスタマイズする場合：

### スクリプトプロパティの直接編集

1. Apps Scriptエディタで「プロジェクトの設定」をクリック
2. 「スクリプト プロパティ」セクションで「スクリプト プロパティを編集」をクリック
3. プロパティを追加・編集

### コードから設定

```javascript
function customSetup() {
  Config.setAll({
    'SPREADSHEET_ID': 'あなたのスプレッドシートID',
    'SHEET_NAME': 'MyDatabase',        // カスタムシート名
    'LOG_SHEET_NAME': 'MyLogs',        // カスタムログシート名
    'PRIMARY_KEY_COLUMN': 'UserId',    // カスタム主キー名
    'CREATED_AT_COLUMN': 'Created',    // カスタム作成日時カラム名
    'UPDATED_AT_COLUMN': 'Modified',   // カスタム更新日時カラム名
    'TIMEZONE': 'Asia/Tokyo',
    'DATE_FORMAT': 'yyyy/MM/dd HH:mm:ss'
  });
}
```

## 📝 環境変数一覧

| 変数名 | 説明 | 必須 | デフォルト値 |
|--------|------|------|------------|
| SPREADSHEET_ID | スプレッドシートID | ✓ | - |
| SHEET_NAME | データベースシート名 | - | Database |
| LOG_SHEET_NAME | ログシート名 | - | Logs |
| PRIMARY_KEY_COLUMN | 主キーカラム名 | - | ID |
| CREATED_AT_COLUMN | 作成日時カラム名 | - | CreatedAt |
| UPDATED_AT_COLUMN | 更新日時カラム名 | - | UpdatedAt |
| TIMEZONE | タイムゾーン | - | Asia/Tokyo |
| DATE_FORMAT | 日時フォーマット | - | yyyy-MM-dd HH:mm:ss |

### スプレッドシートIDの取得方法

スプレッドシートのURLから取得できます：

```
https://docs.google.com/spreadsheets/d/【ここがスプレッドシートID】/edit
```

例：
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                        ↑
                            このIDをコピーして使用
```

## 💡 使用例

### 基本的な使い方

```javascript
function basicUsage() {
  const db = new SpreadsheetDB();
  
  // データを追加
  const newRecord = db.insert({
    Name: '山田太郎',
    Email: 'yamada@example.com',
    Status: 'Active'
  });
  
  console.log('追加されたレコード:', newRecord);
  
  // データを検索
  const allRecords = db.findAll();
  console.log('全レコード数:', allRecords.length);
  
  // データを更新
  const updated = db.update(
    { Name: '山田太郎' },
    { Status: 'Inactive' }
  );
  console.log('更新されたレコード数:', updated);
}
```

### カスタムヘッダーの設定

```javascript
function setupCustomDatabase() {
  const db = new SpreadsheetDB();
  
  // カスタムヘッダーを設定
  db.setHeaders([
    'ID',
    'ProductName',
    'SKU',
    'Quantity',
    'Price',
    'Category',
    'CreatedAt',
    'UpdatedAt'
  ]);
  
  // 商品データを追加
  db.insert({
    ProductName: 'ノートPC',
    SKU: 'PC-001',
    Quantity: 10,
    Price: 100000,
    Category: 'Electronics'
  });
}
```

## 🐛 トラブルシューティング

### 問題1: メニューが表示されない

**原因:** スクリプトが正しく読み込まれていない

**解決方法:**
1. スプレッドシートを再読み込み（F5）
2. Apps Scriptエディタで `onOpen` 関数を手動実行
3. 権限を再度承認

### 問題2: データが保存されない

**原因:** 設定が正しくない、または権限がない

**解決方法:**
1. 「データベース管理」→「設定を表示」で設定を確認
2. SPREADSHEET_IDが正しいか確認
3. 「Logs」シートでエラーメッセージを確認

### 問題3: エラー「スプレッドシートが見つかりません」

**原因:** SPREADSHEET_IDが間違っている

**解決方法:**
1. スプレッドシートのURLからIDを再度コピー
2. `Config.set('SPREADSHEET_ID', '正しいID')` を実行

### 問題4: タイムスタンプが正しくない

**原因:** タイムゾーン設定が間違っている

**解決方法:**
1. `Config.set('TIMEZONE', 'Asia/Tokyo')` を実行
2. または appsscript.json の timeZone を確認

## 📚 さらに学ぶ

### 公式ドキュメント

- [Google Apps Script 公式ガイド](https://developers.google.com/apps-script/guides/sheets)
- [Spreadsheet Service リファレンス](https://developers.google.com/apps-script/reference/spreadsheet)
- [Properties Service](https://developers.google.com/apps-script/reference/properties)

### サンプルプロジェクト

このリポジトリの `src/Code.gs` に以下のサンプル関数があります：

- `exampleFind()` - データ検索の例
- `exampleInsert()` - データ追加の例
- `exampleUpdate()` - データ更新の例
- `exampleDelete()` - データ削除の例
- `exampleCustomQuery()` - カスタムクエリの例

## 🤝 サポート

問題が解決しない場合は、GitHubでIssueを作成してください。
