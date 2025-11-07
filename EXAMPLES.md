# 使用例とチュートリアル

このドキュメントでは、GASスプレッドシートデータベースの具体的な使用例を紹介します。

## 📚 基本的な使い方

### 例1: タスク管理システム

```javascript
/**
 * タスク管理システムのセットアップ
 */
function setupTaskManager() {
  const db = new SpreadsheetDB();
  
  // タスク管理用のヘッダーを設定
  db.setHeaders([
    'ID',
    'TaskName',
    'Description',
    'AssignedTo',
    'Status',
    'Priority',
    'DueDate',
    'CreatedAt',
    'UpdatedAt'
  ]);
  
  Logger.info('Task manager setup completed');
}

/**
 * タスクを追加
 */
function addTask(taskName, description, assignedTo, priority, dueDate) {
  const db = new SpreadsheetDB();
  
  const task = db.insert({
    TaskName: taskName,
    Description: description,
    AssignedTo: assignedTo,
    Status: 'New',
    Priority: priority,
    DueDate: dueDate
  });
  
  Logger.info('Task added', { task });
  return task;
}

/**
 * タスクのステータスを更新
 */
function updateTaskStatus(taskId, newStatus) {
  const db = new SpreadsheetDB();
  const count = db.updateById(taskId, { Status: newStatus });
  Logger.info('Task status updated', { taskId, newStatus, count });
}

/**
 * 担当者別のタスクを取得
 */
function getTasksByAssignee(assignee) {
  const db = new SpreadsheetDB();
  const tasks = db.find({ AssignedTo: assignee });
  return tasks;
}

/**
 * 優先度の高いタスクを取得
 */
function getHighPriorityTasks() {
  const db = new SpreadsheetDB();
  const allTasks = db.findAll();
  
  // 優先度が「High」のタスクをフィルタ
  const highPriorityTasks = allTasks.filter(task => task.Priority === 'High');
  
  return highPriorityTasks;
}

/**
 * 完了したタスクを削除
 */
function removeCompletedTasks() {
  const db = new SpreadsheetDB();
  const count = db.delete({ Status: 'Completed' });
  Logger.info('Removed completed tasks', { count });
}
```

### 例2: 顧客管理システム (CRM)

```javascript
/**
 * 顧客管理システムのセットアップ
 */
function setupCRM() {
  const db = new SpreadsheetDB();
  
  db.setHeaders([
    'ID',
    'CompanyName',
    'ContactPerson',
    'Email',
    'Phone',
    'Address',
    'Industry',
    'Status',
    'LastContactDate',
    'Notes',
    'CreatedAt',
    'UpdatedAt'
  ]);
  
  Logger.info('CRM setup completed');
}

/**
 * 顧客を追加
 */
function addCustomer(customerData) {
  const db = new SpreadsheetDB();
  
  const customer = db.insert({
    CompanyName: customerData.companyName,
    ContactPerson: customerData.contactPerson,
    Email: customerData.email,
    Phone: customerData.phone,
    Address: customerData.address,
    Industry: customerData.industry,
    Status: 'Active',
    LastContactDate: new Date().toLocaleDateString(),
    Notes: customerData.notes || ''
  });
  
  Logger.info('Customer added', { customer });
  return customer;
}

/**
 * 業種別の顧客を取得
 */
function getCustomersByIndustry(industry) {
  const db = new SpreadsheetDB();
  return db.find({ Industry: industry, Status: 'Active' });
}

/**
 * 顧客情報を更新
 */
function updateCustomer(customerId, updateData) {
  const db = new SpreadsheetDB();
  
  // 最終連絡日を更新
  updateData.LastContactDate = new Date().toLocaleDateString();
  
  const count = db.updateById(customerId, updateData);
  Logger.info('Customer updated', { customerId, count });
}

/**
 * 非アクティブな顧客を検索
 */
function findInactiveCustomers() {
  const db = new SpreadsheetDB();
  return db.find({ Status: 'Inactive' });
}
```

### 例3: 在庫管理システム

```javascript
/**
 * 在庫管理システムのセットアップ
 */
function setupInventory() {
  const db = new SpreadsheetDB();
  
  db.setHeaders([
    'ID',
    'ProductName',
    'SKU',
    'Category',
    'Quantity',
    'MinQuantity',
    'UnitPrice',
    'Supplier',
    'Location',
    'CreatedAt',
    'UpdatedAt'
  ]);
  
  Logger.info('Inventory setup completed');
}

/**
 * 商品を追加
 */
function addProduct(productData) {
  const db = new SpreadsheetDB();
  
  const product = db.insert({
    ProductName: productData.name,
    SKU: productData.sku,
    Category: productData.category,
    Quantity: productData.quantity,
    MinQuantity: productData.minQuantity,
    UnitPrice: productData.unitPrice,
    Supplier: productData.supplier,
    Location: productData.location
  });
  
  // 在庫が最小値以下の場合は警告
  if (product.Quantity <= product.MinQuantity) {
    Logger.warning('Low stock alert', { product: product.ProductName, quantity: product.Quantity });
  }
  
  return product;
}

/**
 * 在庫数を更新
 */
function updateStock(sku, quantityChange) {
  const db = new SpreadsheetDB();
  
  // 現在の在庫を取得
  const products = db.find({ SKU: sku });
  if (products.length === 0) {
    Logger.error('Product not found', { sku });
    return null;
  }
  
  const product = products[0];
  const newQuantity = product.Quantity + quantityChange;
  
  // 在庫を更新
  db.updateById(product.ID, { Quantity: newQuantity });
  
  // 在庫が最小値以下になった場合は警告
  if (newQuantity <= product.MinQuantity) {
    Logger.warning('Low stock alert', { 
      product: product.ProductName, 
      currentQuantity: newQuantity,
      minQuantity: product.MinQuantity
    });
  }
  
  return newQuantity;
}

/**
 * 在庫切れ商品を取得
 */
function getOutOfStockProducts() {
  const db = new SpreadsheetDB();
  const allProducts = db.findAll();
  
  return allProducts.filter(product => product.Quantity <= product.MinQuantity);
}

/**
 * カテゴリ別の在庫一覧
 */
function getInventoryByCategory(category) {
  const db = new SpreadsheetDB();
  return db.find({ Category: category });
}

/**
 * 在庫価値を計算
 */
function calculateInventoryValue() {
  const db = new SpreadsheetDB();
  const allProducts = db.findAll();
  
  let totalValue = 0;
  allProducts.forEach(product => {
    totalValue += product.Quantity * product.UnitPrice;
  });
  
  Logger.info('Inventory value calculated', { totalValue });
  return totalValue;
}
```

### 例4: イベント参加者管理

```javascript
/**
 * イベント参加者管理システムのセットアップ
 */
function setupEventRegistration() {
  const db = new SpreadsheetDB();
  
  db.setHeaders([
    'ID',
    'EventName',
    'ParticipantName',
    'Email',
    'Phone',
    'Company',
    'RegistrationDate',
    'Status',
    'PaymentStatus',
    'SpecialRequests',
    'CreatedAt',
    'UpdatedAt'
  ]);
  
  Logger.info('Event registration setup completed');
}

/**
 * 参加者を登録
 */
function registerParticipant(eventName, participantData) {
  const db = new SpreadsheetDB();
  
  const registration = db.insert({
    EventName: eventName,
    ParticipantName: participantData.name,
    Email: participantData.email,
    Phone: participantData.phone,
    Company: participantData.company,
    RegistrationDate: new Date().toLocaleDateString(),
    Status: 'Registered',
    PaymentStatus: 'Pending',
    SpecialRequests: participantData.specialRequests || ''
  });
  
  // 確認メールを送信（別途実装）
  sendConfirmationEmail(registration.Email, registration);
  
  return registration;
}

/**
 * イベント別の参加者数を取得
 */
function getParticipantCount(eventName) {
  const db = new SpreadsheetDB();
  const participants = db.find({ EventName: eventName, Status: 'Registered' });
  return participants.length;
}

/**
 * 支払い済みの参加者一覧
 */
function getPaidParticipants(eventName) {
  const db = new SpreadsheetDB();
  const allParticipants = db.findAll();
  
  return allParticipants.filter(p => 
    p.EventName === eventName && 
    p.PaymentStatus === 'Paid'
  );
}

/**
 * 参加ステータスを更新
 */
function updateParticipantStatus(participantId, status, paymentStatus) {
  const db = new SpreadsheetDB();
  
  const updateData = { Status: status };
  if (paymentStatus) {
    updateData.PaymentStatus = paymentStatus;
  }
  
  db.updateById(participantId, updateData);
}

/**
 * 確認メールを送信（ダミー関数）
 */
function sendConfirmationEmail(email, registrationData) {
  Logger.info('Confirmation email sent', { email, registrationData });
  // 実際のメール送信ロジックはGmailApp等を使用して実装
}
```

## 🔧 高度な使い方

### カスタムバリデーション

```javascript
/**
 * データ挿入前のバリデーション
 */
function insertWithValidation(data, validationRules) {
  // バリデーションチェック
  for (const field in validationRules) {
    const rule = validationRules[field];
    const value = data[field];
    
    // 必須チェック
    if (rule.required && !value) {
      throw new Error(`${field} is required`);
    }
    
    // 型チェック
    if (rule.type && typeof value !== rule.type) {
      throw new Error(`${field} must be ${rule.type}`);
    }
    
    // カスタムバリデーション
    if (rule.validator && !rule.validator(value)) {
      throw new Error(`${field} validation failed`);
    }
  }
  
  // バリデーション通過後にデータを挿入
  const db = new SpreadsheetDB();
  return db.insert(data);
}

// 使用例
function addValidatedUser() {
  const validationRules = {
    Name: { required: true, type: 'string' },
    Email: { 
      required: true, 
      type: 'string',
      validator: (val) => val.includes('@')
    },
    Age: { 
      required: false, 
      type: 'number',
      validator: (val) => val >= 0 && val <= 150
    }
  };
  
  const userData = {
    Name: '山田太郎',
    Email: 'yamada@example.com',
    Age: 30
  };
  
  insertWithValidation(userData, validationRules);
}
```

### トリガーを使用した自動処理

```javascript
/**
 * 時間ベースのトリガーで毎日実行
 */
function setupDailyTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // 毎日午前9時に実行するトリガーを作成
  ScriptApp.newTrigger('dailyTask')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();
}

/**
 * 毎日実行されるタスク
 */
function dailyTask() {
  const db = new SpreadsheetDB();
  
  // 期限切れのタスクをチェック
  const allTasks = db.findAll();
  const today = new Date();
  
  allTasks.forEach(task => {
    if (task.DueDate && new Date(task.DueDate) < today && task.Status !== 'Completed') {
      // 期限切れタスクを更新
      db.updateById(task.ID, { Status: 'Overdue' });
      
      // 通知を送信（別途実装）
      Logger.warning('Task overdue', { task });
    }
  });
}
```

### データのエクスポート

```javascript
/**
 * データをJSON形式でエクスポート
 */
function exportToJSON() {
  const db = new SpreadsheetDB();
  const allData = db.findAll();
  
  const jsonString = JSON.stringify(allData, null, 2);
  
  // ドライブに保存
  const fileName = `export_${new Date().toISOString()}.json`;
  const file = DriveApp.createFile(fileName, jsonString, MimeType.PLAIN_TEXT);
  
  Logger.info('Data exported to Drive', { fileId: file.getId() });
  return file.getUrl();
}

/**
 * CSVデータをインポート
 */
function importFromCSV(csvText) {
  const db = new SpreadsheetDB();
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  // ヘッダー行をスキップしてデータを挿入
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const data = {};
    
    headers.forEach((header, index) => {
      data[header.trim()] = values[index] ? values[index].trim() : '';
    });
    
    db.insert(data);
  }
  
  Logger.info('Data imported from CSV', { rowCount: lines.length - 1 });
}
```

## 📊 レポート生成

```javascript
/**
 * 月次レポートを生成
 */
function generateMonthlyReport() {
  const db = new SpreadsheetDB();
  const allData = db.findAll();
  
  // 今月のデータをフィルタ
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const monthlyData = allData.filter(row => {
    const createdDate = new Date(row.CreatedAt);
    return createdDate >= firstDayOfMonth && createdDate <= lastDayOfMonth;
  });
  
  // レポートシートを作成
  const spreadsheet = SpreadsheetApp.openById(Config.getSpreadsheetId());
  const reportSheet = spreadsheet.insertSheet(`Report_${now.getFullYear()}_${now.getMonth() + 1}`);
  
  // ヘッダー
  reportSheet.appendRow(['Summary', 'Count']);
  reportSheet.appendRow(['Total Records', monthlyData.length]);
  
  // カテゴリ別集計など
  Logger.info('Monthly report generated', { count: monthlyData.length });
}
```

これらの例を参考に、独自のアプリケーションを構築してください！
