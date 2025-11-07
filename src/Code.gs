/**
 * Google Apps Script - Spreadsheet Database Application
 * スプレッドシートをデータベースとして扱うアプリケーション
 * 
 * セットアップ手順:
 * 1. .env.sampleを参考に、スクリプトプロパティを設定してください
 * 2. メニューから「セットアップ」を実行してください
 */

// ==========================================
// Web App エンドポイント
// ==========================================

/**
 * Web App のGETリクエストを処理
 * HTMLフロントエンドを提供
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('スプレッドシートデータベース管理')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Web App のPOSTリクエストを処理
 * API エンドポイント
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    let result;
    
    switch (action) {
      case 'findAll':
        result = apiGetAllData();
        break;
      case 'find':
        result = apiFind(params.condition);
        break;
      case 'insert':
        result = apiInsert(params.data);
        break;
      case 'update':
        result = apiUpdate(params.id, params.data);
        break;
      case 'delete':
        result = apiDelete(params.id);
        break;
      case 'getHeaders':
        result = apiGetHeaders();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.error('API Error', { error: error.toString() });
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// API 関数
// ==========================================

function apiGetAllData() {
  const db = new SpreadsheetDB();
  return db.findAll();
}

function apiFind(condition) {
  const db = new SpreadsheetDB();
  return db.find(condition);
}

function apiInsert(data) {
  const db = new SpreadsheetDB();
  return db.insert(data);
}

function apiUpdate(id, data) {
  const db = new SpreadsheetDB();
  db.updateById(id, data);
  return { success: true };
}

function apiDelete(id) {
  const db = new SpreadsheetDB();
  db.deleteById(id);
  return { success: true };
}

function apiGetHeaders() {
  const db = new SpreadsheetDB();
  const headers = db.getHeaders();
  const primaryKey = Config.getPrimaryKeyColumn();
  const createdAt = Config.getCreatedAtColumn();
  const updatedAt = Config.getUpdatedAtColumn();
  
  // 編集可能なフィールドのみを返す（主キーとタイムスタンプを除く）
  const editableHeaders = headers.filter(h => 
    h !== primaryKey && h !== createdAt && h !== updatedAt
  );
  
  return {
    all: headers,
    editable: editableHeaders,
    primaryKey: primaryKey
  };
}

/**
 * スプレッドシートを開いたときに実行されるイベント
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('データベース管理')
    .addItem('セットアップ', 'setupDatabase')
    .addItem('設定を表示', 'showConfig')
    .addItem('サンプルデータを追加', 'insertSampleData')
    .addItem('全データを表示', 'showAllData')
    .addSeparator()
    .addItem('ヘルプ', 'showHelp')
    .addToUi();
}

/**
 * データベースのセットアップ
 */
function setupDatabase() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // 現在のスプレッドシートIDを自動設定
    const currentSpreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    Config.set('SPREADSHEET_ID', currentSpreadsheetId);
    
    // 基本設定を設定
    Config.setAll({
      'SHEET_NAME': 'Database',
      'LOG_SHEET_NAME': 'Logs',
      'PRIMARY_KEY_COLUMN': 'ID',
      'CREATED_AT_COLUMN': 'CreatedAt',
      'UPDATED_AT_COLUMN': 'UpdatedAt',
      'TIMEZONE': 'Asia/Tokyo',
      'DATE_FORMAT': 'yyyy-MM-dd HH:mm:ss'
    });
    
    // データベースを初期化
    const db = new SpreadsheetDB();
    
    // ヘッダーが設定されていない場合はデフォルトヘッダーを設定
    if (db.getHeaders().length === 0) {
      db.setHeaders(['ID', 'Name', 'Email', 'Status', 'CreatedAt', 'UpdatedAt']);
    }
    
    Logger.info('Database setup completed');
    ui.alert('セットアップ完了', 'データベースのセットアップが完了しました。', ui.ButtonSet.OK);
    
  } catch (error) {
    Logger.error('Setup failed', { error: error.toString() });
    SpreadsheetApp.getUi().alert('エラー', 'セットアップに失敗しました: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 現在の設定を表示
 */
function showConfig() {
  const config = Config.getAll();
  const message = Object.keys(config)
    .map(key => `${key}: ${config[key]}`)
    .join('\n');
  
  SpreadsheetApp.getUi().alert('現在の設定', message || '設定が見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * サンプルデータを追加
 */
function insertSampleData() {
  try {
    const db = new SpreadsheetDB();
    
    const sampleData = [
      { Name: '山田太郎', Email: 'yamada@example.com', Status: 'Active' },
      { Name: '佐藤花子', Email: 'sato@example.com', Status: 'Active' },
      { Name: '鈴木一郎', Email: 'suzuki@example.com', Status: 'Inactive' }
    ];
    
    db.insertMany(sampleData);
    
    SpreadsheetApp.getUi().alert('完了', `${sampleData.length}件のサンプルデータを追加しました。`, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    Logger.error('Failed to insert sample data', { error: error.toString() });
    SpreadsheetApp.getUi().alert('エラー', 'サンプルデータの追加に失敗しました: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 全データを表示（ログに出力）
 */
function showAllData() {
  try {
    const db = new SpreadsheetDB();
    const allData = db.findAll();
    
    Logger.info('All data retrieved', { count: allData.length, data: allData });
    
    const message = `総件数: ${allData.length}件\n\n` +
      allData.map((row, index) => 
        `${index + 1}. ${JSON.stringify(row)}`
      ).join('\n');
    
    SpreadsheetApp.getUi().alert('全データ', message || 'データがありません', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    Logger.error('Failed to show all data', { error: error.toString() });
    SpreadsheetApp.getUi().alert('エラー', 'データの取得に失敗しました: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ヘルプを表示
 */
function showHelp() {
  const helpText = `
【Google Apps Script スプレッドシートデータベース】

■ 主な機能:
- スプレッドシートをデータベースとして使用
- CRUD操作（作成・読取・更新・削除）
- 自動タイムスタンプ
- ログ記録

■ 使い方:
1. メニューから「セットアップ」を実行
2. 「サンプルデータを追加」でテストデータを挿入
3. スクリプトエディタから独自の関数を作成して利用

■ コード例:
const db = new SpreadsheetDB();
db.insert({ Name: '田中', Email: 'tanaka@example.com', Status: 'Active' });
const users = db.findAll();
db.updateById(id, { Status: 'Inactive' });
db.deleteById(id);

詳細はスクリプトエディタのコードをご確認ください。
  `.trim();
  
  SpreadsheetApp.getUi().alert('ヘルプ', helpText, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==========================================
// API関数（スクリプトから利用可能）
// ==========================================

/**
 * データを検索する例
 */
function exampleFind() {
  const db = new SpreadsheetDB();
  
  // 全データを取得
  const allData = db.findAll();
  Logger.info('All data', { data: allData });
  
  // 条件で検索
  const activeUsers = db.find({ Status: 'Active' });
  Logger.info('Active users', { data: activeUsers });
  
  // IDで検索
  if (allData.length > 0) {
    const firstId = allData[0][Config.getPrimaryKeyColumn()];
    const user = db.findById(firstId);
    Logger.info('User by ID', { data: user });
  }
}

/**
 * データを追加する例
 */
function exampleInsert() {
  const db = new SpreadsheetDB();
  
  // 単一データを追加
  const newUser = db.insert({
    Name: '新規ユーザー',
    Email: 'newuser@example.com',
    Status: 'Active'
  });
  Logger.info('Inserted user', { data: newUser });
  
  // 複数データを追加
  const newUsers = db.insertMany([
    { Name: 'ユーザー1', Email: 'user1@example.com', Status: 'Active' },
    { Name: 'ユーザー2', Email: 'user2@example.com', Status: 'Inactive' }
  ]);
  Logger.info('Inserted users', { count: newUsers.length });
}

/**
 * データを更新する例
 */
function exampleUpdate() {
  const db = new SpreadsheetDB();
  
  // 条件で更新
  const count = db.update(
    { Status: 'Active' },
    { Status: 'Verified' }
  );
  Logger.info('Updated rows', { count });
  
  // IDで更新
  const allData = db.findAll();
  if (allData.length > 0) {
    const firstId = allData[0][Config.getPrimaryKeyColumn()];
    db.updateById(firstId, { Email: 'updated@example.com' });
    Logger.info('Updated by ID', { id: firstId });
  }
}

/**
 * データを削除する例
 */
function exampleDelete() {
  const db = new SpreadsheetDB();
  
  // 条件で削除
  const count = db.delete({ Status: 'Inactive' });
  Logger.info('Deleted rows', { count });
  
  // IDで削除
  const allData = db.findAll();
  if (allData.length > 0) {
    const firstId = allData[0][Config.getPrimaryKeyColumn()];
    db.deleteById(firstId);
    Logger.info('Deleted by ID', { id: firstId });
  }
}

/**
 * カスタムクエリの例
 */
function exampleCustomQuery() {
  const db = new SpreadsheetDB();
  const allData = db.findAll();
  
  // JavaScriptのfilterを使用した高度な検索
  const filteredData = allData.filter(row => {
    return row.Email && row.Email.includes('@example.com') && row.Status === 'Active';
  });
  
  Logger.info('Custom query results', { count: filteredData.length, data: filteredData });
}
