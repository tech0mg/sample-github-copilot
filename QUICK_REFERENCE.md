# クイックリファレンス

Google Apps Script スプレッドシートデータベースの簡単なリファレンスガイド

## 📦 インストール

1. Google スプレッドシートを開く
2. 「拡張機能」→「Apps Script」を選択
3. `src/` 内の全ファイルをコピー
4. メニューから「データベース管理」→「セットアップ」を実行

## 🚀 基本操作

### データベースの初期化

```javascript
const db = new SpreadsheetDB();
```

### ヘッダーの設定（初回のみ）

```javascript
db.setHeaders(['ID', 'Name', 'Email', 'Status', 'CreatedAt', 'UpdatedAt']);
```

## 📝 CRUD操作

### Create（作成）

```javascript
// 単一データの追加
const user = db.insert({
  Name: '山田太郎',
  Email: 'yamada@example.com',
  Status: 'Active'
});

// 複数データの一括追加
const users = db.insertMany([
  { Name: 'ユーザー1', Email: 'user1@example.com', Status: 'Active' },
  { Name: 'ユーザー2', Email: 'user2@example.com', Status: 'Active' }
]);
```

### Read（読取）

```javascript
// 全データを取得
const allUsers = db.findAll();

// 条件検索
const activeUsers = db.find({ Status: 'Active' });

// IDで検索
const user = db.findById('some-uuid');

// カスタム検索
const filteredUsers = db.findAll().filter(user => 
  user.Email.includes('@example.com')
);

// データ件数を取得
const count = db.count();
```

### Update（更新）

```javascript
// 条件で更新
const updatedCount = db.update(
  { Status: 'Active' },      // 検索条件
  { Status: 'Verified' }     // 更新内容
);

// IDで更新
db.updateById('some-uuid', { 
  Email: 'newemail@example.com',
  Status: 'Inactive'
});
```

### Delete（削除）

```javascript
// 条件で削除
const deletedCount = db.delete({ Status: 'Inactive' });

// IDで削除
db.deleteById('some-uuid');

// 全データ削除（ヘッダーは保持）
db.truncate();
```

## ⚙️ 設定管理

### 設定の取得

```javascript
// 単一設定の取得
const sheetName = Config.get('SHEET_NAME', 'DefaultSheet');

// すべての設定を取得
const allConfig = Config.getAll();

// 便利なゲッター
const spreadsheetId = Config.getSpreadsheetId();
const sheetName = Config.getSheetName();
const timezone = Config.getTimezone();
```

### 設定の保存

```javascript
// 単一設定の保存
Config.set('SHEET_NAME', 'MyDatabase');

// 複数設定の一括保存
Config.setAll({
  'SHEET_NAME': 'MyDatabase',
  'LOG_SHEET_NAME': 'MyLogs',
  'TIMEZONE': 'Asia/Tokyo'
});
```

### 設定の削除

```javascript
// 単一設定の削除
Config.delete('SOME_KEY');

// すべての設定を削除
Config.deleteAll();
```

## 📊 ログ記録

```javascript
// INFOログ
Logger.info('処理が完了しました', { count: 10 });

// WARNINGログ
Logger.warning('在庫が少なくなっています', { product: 'PC-001' });

// ERRORログ
Logger.error('データの保存に失敗しました', { error: error.toString() });

// DEBUGログ
Logger.debug('デバッグ情報', { data: someData });
```

## 🎯 よく使うパターン

### パターン1: 存在確認してから追加

```javascript
const existing = db.find({ Email: 'user@example.com' });
if (existing.length === 0) {
  db.insert({ Name: 'New User', Email: 'user@example.com', Status: 'Active' });
} else {
  Logger.warning('User already exists', { email: 'user@example.com' });
}
```

### パターン2: 検索して更新

```javascript
const users = db.find({ Status: 'Pending' });
users.forEach(user => {
  db.updateById(user.ID, { Status: 'Processed' });
});
```

### パターン3: 集計

```javascript
const allData = db.findAll();
const activeCount = allData.filter(d => d.Status === 'Active').length;
const inactiveCount = allData.filter(d => d.Status === 'Inactive').length;

Logger.info('集計結果', { 
  total: allData.length,
  active: activeCount,
  inactive: inactiveCount 
});
```

### パターン4: ソート

```javascript
const allData = db.findAll();
const sortedData = allData.sort((a, b) => {
  return new Date(b.CreatedAt) - new Date(a.CreatedAt);
});
```

### パターン5: ページネーション

```javascript
const allData = db.findAll();
const pageSize = 10;
const page = 1; // 0始まり

const startIndex = page * pageSize;
const endIndex = startIndex + pageSize;
const pageData = allData.slice(startIndex, endIndex);
```

## 🛠️ トラブルシューティング

### エラー: Spreadsheet not found

```javascript
// スプレッドシートIDを再設定
const currentId = SpreadsheetApp.getActiveSpreadsheet().getId();
Config.set('SPREADSHEET_ID', currentId);
```

### エラー: Headers not set

```javascript
// ヘッダーを設定
const db = new SpreadsheetDB();
db.setHeaders(['ID', 'Name', 'Email', 'CreatedAt', 'UpdatedAt']);
```

### 設定を確認

```javascript
// 現在の設定を表示
Logger.info('Current config', Config.getAll());
```

### ログを確認

```javascript
// Logsシートを開いて確認
const spreadsheet = SpreadsheetApp.openById(Config.getSpreadsheetId());
const logSheet = spreadsheet.getSheetByName(Config.getLogSheetName());
```

## 🔑 環境変数

| 変数名 | 必須 | デフォルト | 説明 |
|--------|------|-----------|------|
| SPREADSHEET_ID | ✓ | - | スプレッドシートID |
| SHEET_NAME | - | Database | データベースシート名 |
| LOG_SHEET_NAME | - | Logs | ログシート名 |
| PRIMARY_KEY_COLUMN | - | ID | 主キーカラム名 |
| CREATED_AT_COLUMN | - | CreatedAt | 作成日時カラム名 |
| UPDATED_AT_COLUMN | - | UpdatedAt | 更新日時カラム名 |
| TIMEZONE | - | Asia/Tokyo | タイムゾーン |
| DATE_FORMAT | - | yyyy-MM-dd HH:mm:ss | 日時フォーマット |

## 📚 さらに詳しく

- **基本**: [README.md](README.md)
- **セットアップ**: [SETUP.md](SETUP.md)
- **使用例**: [EXAMPLES.md](EXAMPLES.md)
- **開発計画**: [DEVELOPMENT.md](DEVELOPMENT.md)
- **プロジェクトサマリー**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## 💡 ヒント

1. **自動保存**: データは自動的にスプレッドシートに保存されます
2. **タイムスタンプ**: CreatedAtとUpdatedAtは自動的に設定されます
3. **UUID**: 主キーは自動的に生成されます
4. **ログ**: すべての操作はLogsシートに記録されます
5. **設定**: 設定はスクリプトプロパティに保存され、永続化されます

## ⚡ パフォーマンスのヒント

1. 大量データの挿入には `insertMany()` を使用
2. 頻繁な検索にはデータをメモリにキャッシュ
3. 不要なログレベルは削除してパフォーマンス向上
4. 定期的に古いログを削除
