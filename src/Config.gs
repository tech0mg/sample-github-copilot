/**
 * Configuration Management
 * .env.sampleの設定値を管理するクラス
 */

class Config {
  /**
   * スクリプトプロパティから設定を取得
   * 設定がない場合はデフォルト値を返す
   */
  static get(key, defaultValue = null) {
    const properties = PropertiesService.getScriptProperties();
    const value = properties.getProperty(key);
    return value !== null ? value : defaultValue;
  }
  
  /**
   * スクリプトプロパティに設定を保存
   */
  static set(key, value) {
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty(key, value);
  }
  
  /**
   * 複数の設定を一括で保存
   */
  static setAll(configObject) {
    const properties = PropertiesService.getScriptProperties();
    properties.setProperties(configObject);
  }
  
  /**
   * すべての設定を取得
   */
  static getAll() {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperties();
  }
  
  /**
   * 設定を削除
   */
  static delete(key) {
    const properties = PropertiesService.getScriptProperties();
    properties.deleteProperty(key);
  }
  
  /**
   * すべての設定を削除
   */
  static deleteAll() {
    const properties = PropertiesService.getScriptProperties();
    properties.deleteAllProperties();
  }
  
  // 便利なゲッター関数
  static getSpreadsheetId() {
    return this.get('SPREADSHEET_ID');
  }
  
  static getSheetName() {
    return this.get('SHEET_NAME', 'Database');
  }
  
  static getLogSheetName() {
    return this.get('LOG_SHEET_NAME', 'Logs');
  }
  
  static getPrimaryKeyColumn() {
    return this.get('PRIMARY_KEY_COLUMN', 'ID');
  }
  
  static getCreatedAtColumn() {
    return this.get('CREATED_AT_COLUMN', 'CreatedAt');
  }
  
  static getUpdatedAtColumn() {
    return this.get('UPDATED_AT_COLUMN', 'UpdatedAt');
  }
  
  static getTimezone() {
    return this.get('TIMEZONE', 'Asia/Tokyo');
  }
  
  static getDateFormat() {
    return this.get('DATE_FORMAT', 'yyyy-MM-dd HH:mm:ss');
  }
}
