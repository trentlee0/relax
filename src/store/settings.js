import {isUTools} from '@/util/platforms'
import {
  backgroundType,
  crossDomainBackground,
  crossDomainQuote,
  dataKey,
  defaultSettings
} from '@/config/constants'
import {BrowserStorage, Storage, SuccessMsg, UToolsStorage} from '@/store/storage'
import {exportJSON, importJSON} from '@/util/files'
import {deepCopy} from '@/util/commons'

class Setting {
  /**
   * @type {Storage}
   * @private
   */
  storage

  /**
   * @param {Storage} storage
   * @private
   */
  constructor(storage) {
    this.storage = storage
  }

  /**
   * @type {Setting}
   * @private
   */
  static _instance

  /**
   * @param storage
   * @return {Setting}
   */
  static instance(storage) {
    if (!this._instance) {
      this._instance = new Setting(storage)
    }
    return this._instance
  }

  /**
   * @param {string} key
   * @return {Object}
   */
  getSync(key) {
    return this.storage.getSync(key)
  }

  /**
   * @param {string} key
   * @param {Object} value
   */
  setSync(key, value) {
    this.storage.setSync(key, value)
  }

  /**
   * @param {string} key
   */
  removeSync(key) {
    this.storage.removeSync(key)
  }

  clearSync() {
    this.removeSync(dataKey.Background)
    this.removeSync(dataKey.Quote)
    this.removeSync(dataKey.Notification)
    this.removeSync(dataKey.WorkingTime)
    this.removeSync(dataKey.RestingTime)
    this.removeSync(dataKey.BackgroundMusic)
  }

  /**
   * @param {{background, quote, workingTime, restingTime, notification, statistics}} setting
   */
  setAllSync(setting) {
    this.setSync(dataKey.Background, setting[dataKey.Background])
    this.setSync(dataKey.Quote, setting[dataKey.Quote])
    this.setSync(dataKey.Notification, setting[dataKey.Notification])
    this.setSync(dataKey.WorkingTime, setting[dataKey.WorkingTime])
    this.setSync(dataKey.RestingTime, setting[dataKey.RestingTime])
  }

  /**
   * @param {string} type
   * @param {Object} attachment
   * @return {Promise<SuccessMsg>}
   */
  setTempCache(type, attachment) {
    return this.storage.setTempCache('temps:' + type, attachment)
  }

  /**
   * @param {string} type
   * @return {Promise<SuccessMsg>}
   */
  getTempCache(type) {
    return this.storage.getTempCache('temps:' + type)
  }

  /**
   * @param type
   * @return {Promise<SuccessMsg>}
   */
  removeTempCache(type) {
    return this.storage.removeTempCache('temps:' + type)
  }

  /**
   * @return {Promise<SuccessMsg[]>}
   */
  clearTempCache() {
    return Promise.all([
      this.removeTempCache(backgroundType.UNSPLASH),
      this.removeTempCache(backgroundType.SHANBAY),
      this.removeTempCache(backgroundType.BING),
      this.removeTempCache(backgroundType.XIAOWAI),
      this.removeTempCache(backgroundType.NETWORK),
      this.removeTempCache(backgroundType.IMAGE)
    ])
  }

  /**
   * @param {Object} data
   * @return {Promise<SuccessMsg>}
   */
  exportSettingToJSON(data) {
    const filename = 'relax_conf.json'
    return new Promise((resolve, reject) => {
      // 处理自定义图片导出问题
      if (data.background.type === backgroundType.IMAGE) {
        this.getTempCache(backgroundType.IMAGE).then(res => {
          data.background.val = res.data
          exportJSON(data, filename)
            .then(() => resolve(SuccessMsg.emptyInstance()))
            .catch(err => reject(err))
        })
      } else {
        exportJSON(data, filename)
          .then(() => resolve(SuccessMsg.emptyInstance()))
          .catch(err => reject(err))
      }
    })
  }

  /**
   * @param {File} file
   * @return {Promise<SuccessMsg>}
   */
  importJSONToSetting(file) {
    return new Promise((resolve, reject) => {
      importJSON(file).then(res => {
        const data = res.data
        try {
          if (!data || !data.background
            || !data.quote
            || !data.notification
            || !data.workingTime
            || !data.restingTime) {
            reject(new Error('数据为空或无效文件'))
            return
          }

          // 由于跨域问题需要修改
          if (!isUTools()) {
            if (crossDomainBackground.indexOf(data.background.type) !== -1)
              data.background = deepCopy(defaultSettings.background)
            if (crossDomainQuote.indexOf(data.quote.type) !== -1)
              data.quote = deepCopy(defaultSettings.quote)
          }

          // 处理自定义图片导入问题
          if (data.background.type === backgroundType.IMAGE) {
            this.setTempCache(backgroundType.IMAGE, data.background.val).then(() => {
              data.background.val = ''
              this.setAllSync(data)
              resolve(SuccessMsg.instance(data))
            }).catch(err => reject(err))
          } else {
            this.setAllSync(data)
            resolve(SuccessMsg.instance(data))
          }
        } catch (err) {
          reject(err)
        }
      }).catch(err => reject(err))
    })
  }
}

export default Setting.instance(
  isUTools() ? new UToolsStorage() : new BrowserStorage()
)
