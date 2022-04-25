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

class Setting {
  /**
   * @type {Storage}
   */
  storage

  constructor(storage) {
    this.storage = storage
  }

  static _instance

  static instance(storage) {
    if (!this._instance) {
      this._instance = new Setting(storage)
    }
    return this._instance
  }

  getSync(key) {
    return this.storage.getSync(key)
  }

  setSync(key, value) {
    this.storage.setSync(key, value)
  }

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

  setAllSync(setting) {
    this.setSync(dataKey.Background, setting[dataKey.Background])
    this.setSync(dataKey.Quote, setting[dataKey.Quote])
    this.setSync(dataKey.Notification, setting[dataKey.Notification])
    this.setSync(dataKey.WorkingTime, setting[dataKey.WorkingTime])
    this.setSync(dataKey.RestingTime, setting[dataKey.RestingTime])
  }

  setTempCache(type, attachment) {
    return this.storage.setTempCache('temps:' + type, attachment)
  }

  getTempCache(type) {
    return this.storage.getTempCache('temps:' + type)
  }

  removeTempCache(type) {
    return this.storage.removeTempCache('temps:' + type)
  }

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
              data.background = defaultSettings.background
            if (crossDomainQuote.indexOf(data.quote.type) !== -1)
              data.quote = defaultSettings.quote
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
