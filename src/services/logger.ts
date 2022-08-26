export enum Severity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug',
  NOTICE = 'notice'
}

interface Logger {
  log(severity: string, source:string, message:string): void
}

class LogService {
  logger:Logger

  constructor () {
    this.logger = new DefaultLogger()
  }

  _log (severity:string, source:string, message = '') {
    this.logger.log(severity, source, message)
  }

  /**
   * @public
   * @param logger - custom object conforming to the logger interface
   */
  setLogger (logger:Logger) {
    if (logger && typeof logger === 'object' && typeof logger['log'] === 'function') {
      throw new Error('provided logger has no log method')
    }
    this.logger = logger || new DefaultLogger()
  }

  /**
   * @public
   * @param {string} source - a string indicating the source of the logging information
   * @param {string} message - the message to log
   */
  info (source:string, message:string) {
    this._log(Severity.INFO, source, message)
  }

  /**
   * @public
   * @param {string} source - a string indicating the source of the logging information
   * @param {string} message - the message to log
   */
  warn (source:string, message:string) {
    this._log(Severity.WARNING, source, message)
  }

  /**
   * @public
   * @param {string} source - a string indicating the source of the logging information
   * @param {string} message - the message to log
   */
  error (source:string, message:string) {
    this._log(Severity.ERROR, source, message)
  }

  /**
   * @public
   * @param {string} source - a string indicating the source of the logging information
   * @param {string} message - the message to log
   */
  debug (source:string, message:string) {
    this._log(Severity.DEBUG, source, message)
  }

  /**
   * @public
   * @param {string} source - a string indicating the source of the logging information
   * @param {string} message - the message to log
   */
  notice (source:string, message:string) {
    this._log(Severity.NOTICE, source, message)
  }
}

class DefaultLogger implements Logger {
  /**
   * @param {string} severity
   * @param {string} source - a string indicating the source of the logging information
   * @param {string} message - the message to log
   * @public
   */
  log (severity: string, source: string, message: string) {
    var prefix = '[' + this.getTimeStamp() + '] [' + source + ']'
    switch (severity) {
      case Severity.INFO:
        console.info(prefix, message)
        break
      case Severity.WARNING:
        console.warn(prefix, message)
        break
      case Severity.ERROR:
        console.error(prefix, message)
        break
      case Severity.DEBUG:
        console.debug(prefix, message)
        break
      default:
        console.log(prefix, message)
        break
    }
  }

  /**
   * @private
   */
  getTimeStamp () {
    var date = new Date()
    var dateStr = date.toTimeString() + '.'
    var millis = date.getMilliseconds()
    return dateStr + (millis < 10 ? '00' + millis : millis < 100 ? '0' + millis : '' + millis)
  }
}

var log = new LogService()

export default log
