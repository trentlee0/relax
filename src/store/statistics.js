import {clockStatus, dataKey} from '@/config/constants'
import dayjs from 'dayjs'
import {BrowserStorage, Storage, SuccessMsg, UToolsStorage} from '@/store/storage'
import {isUTools} from '@/util/platforms'
import collect from 'collect.js'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {exportJSON, importJSON} from '@/util/files'
import voca from 'voca'

dayjs.extend(customParseFormat)

class Statistic {
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
   * @type {Statistic}
   * @private
   */
  static _instance

  /**
   * @param {Storage} storage
   * @return {Statistic}
   */
  static instance(storage) {
    if (!this._instance) {
      this._instance = new Statistic(storage)
    }
    return this._instance
  }

  /**
   * @param {string} name
   * @param {number} minuteDuration
   * @param {'work' | 'rest'} status
   * @return {Promise<SuccessMsg>}
   */
  add(name, minuteDuration, status) {
    const key = dataKey.Statistics + '/' + dayjs().format('YYYY/MM')
    return new Promise((resolve, reject) => {
      this.storage.get(key).then(res => {
        let data = res.data || []
        data.push({
          name: name,
          startTime: dayjs().subtract(minuteDuration, 'm').valueOf(),
          duration: minuteDuration,
          status: status
        })

        this.storage.set(key, data)
          .then(res => resolve(res))
          .catch(err => reject(err))
      })
    })
  }

  /**
   * @param {[{name: string, startTime: number, duration: number, status: 'work' | 'rest'}]} arr
   * @return {number}
   */
  static getWorkTimeSum(arr) {
    return arr.filter(item => item.status === clockStatus.WORK)
      .map(item => item.duration)
      .reduce((pre, cur) => pre + cur, 0)
  }

  /**
   * @param {[{name: string, startTime: number, duration: number, status: 'work' | 'rest'}]} arr
   * @return {number}
   */
  static getRestTimeSum(arr) {
    return arr.filter(item => item.status === clockStatus.REST)
      .map(item => item.duration)
      .reduce((pre, cur) => pre + cur, 0)
  }

  /**
   * @param {number} year
   * @return {Promise<SuccessMsg>}
   */
  getStatisticByYear(year) {
    const key = dataKey.Statistics + '/' + year
    return new Promise((resolve, reject) => {
      this.storage.queryLikeAsArray(key)
        .then(res => {
          const data = res.data
          let yearWorkTime = Statistic.getWorkTimeSum(data)
          let yearRestTime = Statistic.getRestTimeSum(data)
          resolve(SuccessMsg.instance({yearWorkTime, yearRestTime}))
        })
        .catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @return {Promise<SuccessMsg>}
   */
  getStatisticByMonth(year, month) {
    const key = dataKey.Statistics + '/' + year + '/' + voca.sprintf('%02d', month)
    return new Promise((resolve, reject) => {
      this.storage.get(key).then(res => {
        let data = res.data || []
        let monthWorkTime = Statistic.getWorkTimeSum(data)
        let monthRestTime = Statistic.getRestTimeSum(data)
        resolve(SuccessMsg.instance({monthWorkTime, monthRestTime}))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @param {number} dayOfMonth
   * @return {Promise<SuccessMsg>}
   */
  getStatisticByDay(year, month, dayOfMonth) {
    return new Promise((resolve, reject) => {
      this.getByDay(year, month, dayOfMonth)
        .then(res => {
          let data = res.data || []
          let dayWorkTime = Statistic.getWorkTimeSum(data)
          let dayRestTime = Statistic.getRestTimeSum(data)
          resolve(SuccessMsg.instance({dayWorkTime, dayRestTime}))
        })
        .catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @param {number} dayOfMonth
   * @return {Promise<SuccessMsg>}
   */
  getByDay(year, month, dayOfMonth) {
    const yearMonth = year + '/' + voca.sprintf('%02d', month)
    const key = dataKey.Statistics + '/' + yearMonth
    return new Promise((resolve, reject) => {
      this.storage.get(key).then(res => {
        let data = res.data || []
        const target = yearMonth + '/' + dayOfMonth
        const arr = data.filter(item => dayjs(item.startTime).format('YYYY/MM/DD') === target)
        resolve(SuccessMsg.instance(arr))
      }).catch(err => reject(err))
    })
  }

  /**
   * @return {Promise<SuccessMsg>}
   */
  getToday() {
    return new Promise((resolve, reject) => {
      const date = new Date()
      this.getStatisticByDay(date.getFullYear(), date.getMonth() + 1, date.getDate())
        .then(res => {
          const data = res.data
          resolve(SuccessMsg.instance({todayWorkTime: data.dayWorkTime, todayRestTime: data.dayRestTime}))
        })
        .catch(err => reject(err))
    })
  }

  /**
   * @param {string} dateFormat
   * @return {Promise<SuccessMsg>}
   */
  getStatisticData(dateFormat) {
    return new Promise((resolve, reject) => {
      this.storage.queryLikeAsArray(dataKey.Statistics + '/').then(res => {
        const data = res.data
        if (!data) {
          resolve(SuccessMsg.emptyInstance())
          return
        }

        const before7day = dayjs().subtract(7, 'd')
        const before7dayFormat = before7day.format(dateFormat)
        const durations = new Array(7).fill(0, 0, 7)
        const groups = collect(data)
          .groupBy(item => dayjs(item.startTime).format(dateFormat))
          .each((currentItem, key, collection) => {
            collection[key] = {
              workSum: currentItem
                .filter(item => item.status === clockStatus.WORK)
                .map(item => item.duration).reduce((pre, cur) => pre + cur),
              restSum: currentItem
                .filter(item => item.status === clockStatus.REST)
                .map(item => item.duration).reduce((pre, cur) => pre + cur),
              items: currentItem.sortByDesc('startTime')
            }

            const i = dayjs(key, dateFormat).diff(before7day, 'day')
            if (i >= 0 && before7dayFormat !== key) {
              durations[i] = collection[key].workSum ? collection[key].workSum : 0
            }
          })
          .sortKeysDesc()

        resolve(SuccessMsg.instance({
          allDayGroups: Object.keys(groups.all()).length ? groups.all() : null,
          last7daysDurations: durations
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @return {Promise<SuccessMsg>}
   */
  removeStatistic() {
    return this.storage.removeLike(dataKey.Statistics)
  }

  /**
   * @return {Promise<SuccessMsg>}
   */
  exportStatisticToJSON() {
    const filename = 'relax_statistics.json'
    return new Promise((resolve, reject) => {
      this.storage.queryLikeAsObject(dataKey.Statistics).then(res => {
        const data = res.data
        const temp = {}
        for (let key in data) {
          temp[key] = data[key]['items']
        }
        exportJSON(temp, filename)
          .then(() => resolve(SuccessMsg.emptyInstance()))
          .catch(err => reject(err))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {File} file
   * @return {Promise<SuccessMsg>}
   */
  importJSONToStatistic(file) {
    return new Promise((resolve, reject) => {
      importJSON(file).then(res => {
        try {
          const data = res.data
          if (!data) {
            reject(new Error('数据为空或无效文件'))
            return
          }
          for (let key in data) {
            if (!/^statistics\/\d{4}\/\d{2}$/.test(key)) {
              reject(new Error('数据为空或无效文件'))
              return
            }
          }

          const ps = []
          for (let key in data) {
            const item = data[key]
            ps.push(this.storage.set(key, item ? item : []))
          }
          Promise.all(ps)
            .then(() => resolve(SuccessMsg.emptyInstance()))
            .catch(err => reject(err))
        } catch (err) {
          reject(err)
        }
      }).catch(err => reject(err))
    })
  }
}

export default Statistic.instance(
  isUTools() ? new UToolsStorage() : new BrowserStorage()
)
