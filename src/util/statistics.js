import {settingKey} from '@/util/constants'
import dayjs from 'dayjs'
import localforage from 'localforage'
import {isUtools} from '@/util/platforms'
import storages from '@/util/storages'
import {charAt} from 'core-js/internals/string-multibyte'

export default {
  add(name, minuteDuration) {
    if (isUtools()) {
      return new Promise((resolve, reject) => {
        try {
          let res = utools.dbStorage.getItem(settingKey.Statistics) || []
          res.push({
            name: name,
            startTime: dayjs().subtract(minuteDuration, 'm').valueOf(),
            duration: minuteDuration
          })
          utools.dbStorage.setItem(settingKey.Statistics, res)
          resolve('ok')
        } catch (e) {
          reject(e)
        }
      })
    }

    return new Promise((resolve, reject) => {
      localforage.getItem(settingKey.Statistics)
        .then(res => {
          res = res || []
          res.push({
            name: name,
            startTime: dayjs().subtract(minuteDuration, 'm').valueOf(),
            duration: minuteDuration
          })
          localforage.setItem(settingKey.Statistics, res)
            .then(res2 => resolve(res2))
            .catch(err => reject(err))
        })
    })
  },
  list() {
    if (isUtools()) {
      return new Promise((resolve, reject) => {
        try {
          resolve(utools.dbStorage.getItem(settingKey.Statistics))
        } catch (e) {
          reject(e)
        }
      })
    }
    return localforage.getItem(settingKey.Statistics)
  },
  listGroupByDay(dateFormat) {
    return new Promise((resolve, reject) => {
      this.list()
        .then(data => {
          if (!data) return
          let temp = {}
          data.forEach(el => {
            let key = dayjs(el.startTime).format(dateFormat)
            temp[key] = temp[key] || []
            temp[key].push(el)
          })

          let groups = {}
          for (let key in temp) {
            let arr = temp[key]
            groups[key] = {
              data: arr,
              sum: arr.map(e => e.duration).reduce((pre, n) => pre + n)
            }
          }

          resolve(groups)
        })
        .catch(err => reject(err))
    })
  },
  removeStatistic() {
    if (isUtools()) {
      return new Promise((resolve, reject) => {
        try {
          utools.dbStorage.removeItem(settingKey.Statistics)
          resolve('ok')
        } catch (e) {
          reject(e)
        }
      })
    }
    return localforage.removeItem(settingKey.Statistics)
  },
  setAll(data) {
    if (isUtools()) {
      return new Promise((resolve, reject) => {
        try {
          utools.dbStorage.setItem(settingKey.Statistics, data)
          resolve('ok')
        } catch (e) {
          reject(e)
        }
      })
    }
    return new Promise((resolve, reject) => {
      localforage.setItem(settingKey.Statistics, data)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },
  exportStatisticToJSON() {
    return new Promise((resolve, reject) => {
      this.list()
        .then(res => {
          storages.exportJSON({statistics: res || []}, 'statistic.json')
            .then(res2 => resolve(res2))
            .catch(err => reject(err))
        })
        .catch(err => reject(err))
    })
  },
  importJSONToStatistic(file) {
    return new Promise((resolve, reject) => {
      storages.importJSON(file)
        .then(res => {
          try {
            this.setAll(res.statistics)
              .then(res2 => resolve({msg: 'success', data: res}))
              .catch(err => reject(err))
          } catch (err) {
            reject(err)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}
