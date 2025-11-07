/**
 * Logger Utility
 * ログをスプレッドシートに記録するクラス
 */

class Logger {
  /**
   * ログを記録
   */
  static log(level, message, data = null) {
    const logSheetName = Config.getLogSheetName();
    const spreadsheetId = Config.getSpreadsheetId();
    
    if (!spreadsheetId) {
      console.log(`[${level}] ${message}`);
      return;
    }
    
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      let logSheet = spreadsheet.getSheetByName(logSheetName);
      
      // ログシートが存在しない場合は作成
      if (!logSheet) {
        logSheet = spreadsheet.insertSheet(logSheetName);
        logSheet.appendRow(['Timestamp', 'Level', 'Message', 'Data']);
        logSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      }
      
      const timestamp = Utilities.formatDate(
        new Date(),
        Config.getTimezone(),
        Config.getDateFormat()
      );
      
      const dataStr = data ? JSON.stringify(data) : '';
      logSheet.appendRow([timestamp, level, message, dataStr]);
      
    } catch (error) {
      console.error('Failed to write log to spreadsheet:', error);
      console.log(`[${level}] ${message}`, data);
    }
  }
  
  static info(message, data = null) {
    this.log('INFO', message, data);
  }
  
  static warning(message, data = null) {
    this.log('WARNING', message, data);
  }
  
  static error(message, data = null) {
    this.log('ERROR', message, data);
  }
  
  static debug(message, data = null) {
    this.log('DEBUG', message, data);
  }
}
