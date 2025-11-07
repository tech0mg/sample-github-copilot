/**
 * Spreadsheet Database Class
 * スプレッドシートをデータベースとして扱うためのクラス
 */

class SpreadsheetDB {
  constructor(spreadsheetId = null, sheetName = null) {
    this.spreadsheetId = spreadsheetId || Config.getSpreadsheetId();
    this.sheetName = sheetName || Config.getSheetName();
    this.spreadsheet = null;
    this.sheet = null;
    this.headers = [];
    
    this._initialize();
  }
  
  /**
   * 初期化
   */
  _initialize() {
    try {
      if (!this.spreadsheetId) {
        throw new Error('Spreadsheet ID is not configured');
      }
      
      this.spreadsheet = SpreadsheetApp.openById(this.spreadsheetId);
      this.sheet = this.spreadsheet.getSheetByName(this.sheetName);
      
      // シートが存在しない場合は作成
      if (!this.sheet) {
        this.sheet = this.spreadsheet.insertSheet(this.sheetName);
        Logger.info(`Created new sheet: ${this.sheetName}`);
      }
      
      // ヘッダー行を取得
      if (this.sheet.getLastRow() > 0) {
        this.headers = this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn()).getValues()[0];
      }
      
    } catch (error) {
      Logger.error('Failed to initialize SpreadsheetDB', { error: error.toString() });
      throw error;
    }
  }
  
  /**
   * ヘッダー（カラム名）を設定
   */
  setHeaders(headers) {
    if (this.sheet.getLastRow() === 0) {
      this.sheet.appendRow(headers);
      this.sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      this.headers = headers;
      Logger.info('Set headers', { headers });
    } else {
      Logger.warning('Headers already exist. Skipping setHeaders.');
    }
  }
  
  /**
   * ヘッダーを取得
   */
  getHeaders() {
    return this.headers;
  }
  
  /**
   * 行データをオブジェクトに変換
   */
  _rowToObject(rowData) {
    const obj = {};
    this.headers.forEach((header, index) => {
      obj[header] = rowData[index] !== undefined ? rowData[index] : '';
    });
    return obj;
  }
  
  /**
   * オブジェクトを行データに変換
   */
  _objectToRow(obj) {
    return this.headers.map(header => obj[header] !== undefined ? obj[header] : '');
  }
  
  /**
   * 全データを取得
   */
  findAll() {
    try {
      const lastRow = this.sheet.getLastRow();
      if (lastRow <= 1) {
        return [];
      }
      
      const dataRange = this.sheet.getRange(2, 1, lastRow - 1, this.headers.length);
      const data = dataRange.getValues();
      
      return data.map(row => this._rowToObject(row));
      
    } catch (error) {
      Logger.error('Failed to findAll', { error: error.toString() });
      throw error;
    }
  }
  
  /**
   * 条件に一致するデータを検索
   */
  find(condition) {
    const allData = this.findAll();
    return allData.filter(row => {
      return Object.keys(condition).every(key => row[key] === condition[key]);
    });
  }
  
  /**
   * IDでデータを検索
   */
  findById(id) {
    const primaryKey = Config.getPrimaryKeyColumn();
    const results = this.find({ [primaryKey]: id });
    return results.length > 0 ? results[0] : null;
  }
  
  /**
   * データを追加
   */
  insert(data) {
    try {
      const now = Utilities.formatDate(
        new Date(),
        Config.getTimezone(),
        Config.getDateFormat()
      );
      
      // タイムスタンプを追加
      const createdAtCol = Config.getCreatedAtColumn();
      const updatedAtCol = Config.getUpdatedAtColumn();
      
      if (this.headers.includes(createdAtCol)) {
        data[createdAtCol] = now;
      }
      if (this.headers.includes(updatedAtCol)) {
        data[updatedAtCol] = now;
      }
      
      // 主キーが自動採番の場合
      const primaryKey = Config.getPrimaryKeyColumn();
      if (this.headers.includes(primaryKey) && !data[primaryKey]) {
        data[primaryKey] = this._generateId();
      }
      
      const rowData = this._objectToRow(data);
      this.sheet.appendRow(rowData);
      
      Logger.info('Inserted data', { data });
      return data;
      
    } catch (error) {
      Logger.error('Failed to insert', { error: error.toString(), data });
      throw error;
    }
  }
  
  /**
   * 複数データを一括追加
   */
  insertMany(dataArray) {
    try {
      const results = dataArray.map(data => this.insert(data));
      Logger.info(`Inserted ${results.length} rows`);
      return results;
    } catch (error) {
      Logger.error('Failed to insertMany', { error: error.toString() });
      throw error;
    }
  }
  
  /**
   * データを更新
   */
  update(condition, updateData) {
    try {
      const lastRow = this.sheet.getLastRow();
      if (lastRow <= 1) {
        return 0;
      }
      
      const dataRange = this.sheet.getRange(2, 1, lastRow - 1, this.headers.length);
      const data = dataRange.getValues();
      let updateCount = 0;
      
      const now = Utilities.formatDate(
        new Date(),
        Config.getTimezone(),
        Config.getDateFormat()
      );
      
      const updatedAtCol = Config.getUpdatedAtColumn();
      if (this.headers.includes(updatedAtCol)) {
        updateData[updatedAtCol] = now;
      }
      
      data.forEach((row, rowIndex) => {
        const rowObj = this._rowToObject(row);
        const matches = Object.keys(condition).every(key => rowObj[key] === condition[key]);
        
        if (matches) {
          // データを更新
          Object.keys(updateData).forEach(key => {
            if (this.headers.includes(key)) {
              rowObj[key] = updateData[key];
            }
          });
          
          const updatedRow = this._objectToRow(rowObj);
          const targetRange = this.sheet.getRange(rowIndex + 2, 1, 1, this.headers.length);
          targetRange.setValues([updatedRow]);
          updateCount++;
        }
      });
      
      Logger.info(`Updated ${updateCount} rows`, { condition, updateData });
      return updateCount;
      
    } catch (error) {
      Logger.error('Failed to update', { error: error.toString(), condition, updateData });
      throw error;
    }
  }
  
  /**
   * IDでデータを更新
   */
  updateById(id, updateData) {
    const primaryKey = Config.getPrimaryKeyColumn();
    return this.update({ [primaryKey]: id }, updateData);
  }
  
  /**
   * データを削除
   */
  delete(condition) {
    try {
      const lastRow = this.sheet.getLastRow();
      if (lastRow <= 1) {
        return 0;
      }
      
      const dataRange = this.sheet.getRange(2, 1, lastRow - 1, this.headers.length);
      const data = dataRange.getValues();
      let deleteCount = 0;
      
      // 削除する行を後ろから削除（インデックスのズレを防ぐため）
      for (let i = data.length - 1; i >= 0; i--) {
        const rowObj = this._rowToObject(data[i]);
        const matches = Object.keys(condition).every(key => rowObj[key] === condition[key]);
        
        if (matches) {
          this.sheet.deleteRow(i + 2); // +2 because: +1 for header, +1 for 0-based index
          deleteCount++;
        }
      }
      
      Logger.info(`Deleted ${deleteCount} rows`, { condition });
      return deleteCount;
      
    } catch (error) {
      Logger.error('Failed to delete', { error: error.toString(), condition });
      throw error;
    }
  }
  
  /**
   * IDでデータを削除
   */
  deleteById(id) {
    const primaryKey = Config.getPrimaryKeyColumn();
    return this.delete({ [primaryKey]: id });
  }
  
  /**
   * 全データを削除（ヘッダーは残す）
   */
  truncate() {
    try {
      const lastRow = this.sheet.getLastRow();
      if (lastRow > 1) {
        this.sheet.deleteRows(2, lastRow - 1);
        Logger.info('Truncated all data');
      }
    } catch (error) {
      Logger.error('Failed to truncate', { error: error.toString() });
      throw error;
    }
  }
  
  /**
   * データ件数を取得
   */
  count() {
    const lastRow = this.sheet.getLastRow();
    return lastRow > 1 ? lastRow - 1 : 0;
  }
  
  /**
   * IDを生成（UUIDライク）
   */
  _generateId() {
    return Utilities.getUuid();
  }
}
