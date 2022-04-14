import {isUTools} from '@/util/platforms'
import {backgroundType, dataKey, defaultSettings, quoteType} from '@/store/constants'
import {BrowserStorage, Storage, SuccessMsg, UToolsStorage} from '@/store/storage'

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

  get(key) {
    return this.storage.getSync(key)
  }

  set(key, value) {
    this.storage.setSync(key, value)
  }

  remove(key) {
    this.storage.removeSync(key)
  }

  setBulk(setting) {
    this.set(dataKey.Background, setting[dataKey.Background])
    this.set(dataKey.Quote, setting[dataKey.Quote])
    this.set(dataKey.Notification, setting[dataKey.Notification])
    this.set(dataKey.WorkingTime, setting[dataKey.WorkingTime])
    this.set(dataKey.RestingTime, setting[dataKey.RestingTime])
  }

  setAttachment(type, attachment) {
    return this.storage.setAttachment(type, attachment)
  }

  getAttachment(type) {
    return this.storage.getAttachment(type)
  }

  removeAttachment(type) {
    return this.storage.removeAttachment(type)
  }

  exportSettingToJSON(data) {
    return new Promise((resolve, reject) => {
      // 处理自定义图片导出问题
      if (data.background.type === backgroundType.IMAGE) {
        this.getAttachment(backgroundType.IMAGE).then(res => {
          data.background.val = res.data
          Storage.exportJSON(data, 'data.json')
            .then(() => resolve(SuccessMsg.emptyInstance()))
            .catch(err => reject(err))
        })
      } else {
        Storage.exportJSON(data, 'data.json')
          .then(() => resolve(SuccessMsg.emptyInstance()))
          .catch(err => reject(err))
      }
    })
  }

  importJSONToSetting(file) {
    return new Promise((resolve, reject) => {
      Storage.importJSON(file).then(res => {
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
            if (data.background.type === backgroundType.SHANBAY)
              data.background = defaultSettings.background
            if (data.quote.type === quoteType.SHANBAY)
              data.quote = defaultSettings.quote
          }

          // 处理自定义图片导入问题
          if (data.background.type === backgroundType.IMAGE) {
            this.setAttachment(backgroundType.IMAGE, data.background.val)
              .then(() => {
                data.background.val = ''
                this.setBulk(data)
                resolve(SuccessMsg.instance(data))
              })
              .catch(err => reject(err))
          } else {
            this.setBulk(data)
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
