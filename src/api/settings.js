import {isUTools} from '@/util/common'
import {
  BackgroundType,
  crossDomainBackground,
  crossDomainQuote,
  Settings
} from '@/common/constant'
import storage, {Msg} from '@/util/storage'
import {exportJSON, importJSON} from '@/util/file'
import {deepCopy} from '@/util/common'

class SettingStore {
  /**
   * @param {string} key
   * @return {Object}
   */
  getSync(key) {
    return storage.getSync(key)
  }

  /**
   * @param {string} key
   * @param {Object} value
   */
  setSync(key, value) {
    storage.setSync(key, value)
  }

  /**
   * @param {string} key
   */
  removeSync(key) {
    storage.removeSync(key)
  }

  /**
   * @param {string} type
   * @param {Object} attachment
   * @return {Promise<Msg>}
   */
  setTempCache(type, attachment) {
    return storage.setTempCache('temps:' + type, attachment)
  }

  /**
   * @param {string} type
   * @return {Promise<Msg>}
   */
  getTempCache(type) {
    return storage.getTempCache('temps:' + type)
  }

  /**
   * @param type
   * @return {Promise<Msg>}
   */
  removeTempCache(type) {
    return storage.removeTempCache('temps:' + type)
  }

  /**
   * @return {Promise<Msg[]>}
   */
  clearTempCache() {
    return Promise.all([
      this.removeTempCache(BackgroundType.UNSPLASH),
      this.removeTempCache(BackgroundType.SHANBAY),
      this.removeTempCache(BackgroundType.BING),
      this.removeTempCache(BackgroundType.XIAOWAI),
      this.removeTempCache(BackgroundType.NETWORK),
      this.removeTempCache(BackgroundType.IMAGE)
    ])
  }

  /**
   * @param {Object} data
   * @param {string} filename
   * @return {Promise<Msg>}
   */
  exportSettingToJSON(data, filename = 'relax_conf.json') {
    return new Promise((resolve, reject) => {
      // 处理自定义图片导出问题
      if (data.background.type === BackgroundType.IMAGE) {
        exportJSON(data, filename)
          .then(() => resolve(Msg.instance()))
          .catch(err => reject(err))
      } else {
        exportJSON(data, filename)
          .then(() => resolve(Msg.instance()))
          .catch(err => reject(err))
      }
    })
  }

  /**
   * @param {File} file
   * @return {Promise<Msg>}
   */
  importJSONToSetting(file) {
    return new Promise((resolve, reject) => {
      importJSON(file).then(res => {
        const data = res.data
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
          if (crossDomainBackground.includes(data.background.type))
            data.background = deepCopy(Settings.DEFAULT.background)
          if (crossDomainQuote.includes(data.quote.type))
            data.quote = deepCopy(Settings.DEFAULT.quote)
        }

        resolve(Msg.instance(data))
      }).catch(err => reject(err))
    })
  }
}

export default new SettingStore()
