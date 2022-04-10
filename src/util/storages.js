import * as constant from '@/util/constants'
import {backgroundType, quoteType, settingKey} from '@/util/constants'
import {isUtools} from '@/util/platforms'
import FileSaver from 'file-saver'

export default {
  getObject(key) {
    if (isUtools()) utools.dbStorage.getItem(key)
    return JSON.parse(localStorage.getItem(key))
  },
  setObject(key, value) {
    if (isUtools()) utools.dbStorage.setItem(key, value)
    return localStorage.setItem(key, JSON.stringify(value))
  },
  getString(key) {
    if (isUtools()) utools.dbStorage.getItem(key)
    return localStorage.getItem(key)
  },
  getInteger(key) {
    if (isUtools()) utools.dbStorage.getItem(key)
    return parseInt(this.getString(key))
  },
  setString(key, value) {
    if (isUtools()) utools.dbStorage.setItem(key, value)
    return localStorage.setItem(key, value)
  },
  remove(key) {
    if (isUtools()) utools.dbStorage.removeItem(key)
    localStorage.removeItem(key)
  },
  removeSetting() {
    this.remove(settingKey.BackgroundSelected)
    this.remove(settingKey.Backgrounds)
    this.remove(settingKey.QuoteSelected)
    this.remove(settingKey.Quotes)
    this.remove(settingKey.Notification)
    this.remove(settingKey.WorkingTime)
    this.remove(settingKey.RestingTime)
  },
  setBulk(setting) {
    this.setString(settingKey.BackgroundSelected, setting[settingKey.BackgroundSelected])
    this.setObject(settingKey.Backgrounds, setting[settingKey.Backgrounds])
    this.setString(settingKey.QuoteSelected, setting[settingKey.QuoteSelected])
    this.setObject(settingKey.Quotes, setting[settingKey.Quotes])
    this.setObject(settingKey.Notification, setting[settingKey.Notification])
    this.setString(settingKey.WorkingTime, setting[settingKey.WorkingTime])
    this.setString(settingKey.RestingTime, setting[settingKey.RestingTime])
  },
  initData() {
    this.setBulk(constant.defaultSetting)
  },
  exportSettingToJSON(data) {
    return this.exportJSON(data, 'data.json')
  },
  importJSONToSetting(file) {
    return new Promise((resolve, reject) => {
      this.importJSON(file)
        .then(res => {
          try {
            if (res) {
              if (res.backgroundSelected === backgroundType.SHANBAY)
                res.backgroundSelected = backgroundType.UNSPLASH
              if (res.quoteSelected === quoteType.SHANBAY)
                res.quoteSelected = quoteType.HITOKOTO
            }
            this.setBulk(res)
            resolve({msg: 'success', data: res})
          } catch (err) {
            reject(err)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  exportJSON(data, filename) {
    return new Promise((resolve, reject) => {
      try {
        let dataStr = JSON.stringify(data, null, 2)
        let blob = new Blob([dataStr], {type: 'application/json'})
        FileSaver.saveAs(blob, filename)
        resolve({msg: 'success'})
      } catch (err) {
        reject(err)
      }
    })
  },
  importJSON(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => resolve(JSON.parse(reader.result))
      } catch (err) {
        reject(err)
      }
    })
  }
}
