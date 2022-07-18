import {clockStatus, dataKey} from '@/config/constants'
import dayjs from 'dayjs'
import {BrowserStorage, Storage, SuccessMsg, UToolsStorage} from '@/store/storage'
import {isUTools} from '@/util/platforms'
import collect from 'collect.js'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {exportJSON, importJSON} from '@/util/files'
import * as strings from '@/util/strings'

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
    const key = strings.format('%s/%s', dataKey.Statistics, dayjs().format('YYYY/MM'))
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
   * @param {number} month
   * @return {Promise<SuccessMsg>}
   */
  getTimeSumByMonth(year, month) {
    const key = strings.format('%s/%d/%02d', dataKey.Statistics, year, month)
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
  getTimeSumByDay(year, month, dayOfMonth) {
    return new Promise((resolve, reject) => {
      this.getDay(year, month, dayOfMonth)
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
  getItemsByDay(year, month, dayOfMonth) {
    return new Promise((resolve, reject) => {
      this.getDay(year, month, dayOfMonth).then(res => {
        let data = res.data.filter(item => item.status === clockStatus.WORK)

        const dayRange = new Array(24)
        dayRange.fill(0)
        data.forEach(item => {
          let startTime = dayjs(item.startTime)
          let endTime = dayjs(item.startTime).add(item.duration, 'm')
          let sindex = startTime.get('h')
          let eindex = endTime.get('h')

          if (sindex === eindex) {
            dayRange[sindex] += item.duration
          } else {
            dayRange[sindex] += 60 - startTime.get('m')
            dayRange[eindex] += endTime.get('m')
            let i = (sindex + 1) % 24

            if (i > eindex) {
              while (i < 24) {
                dayRange[i++] += 60
              }
              i = 0
            }

            while (i < eindex) {
              dayRange[i++] += 60
            }
          }
        })
        resolve(SuccessMsg.instance({
          timeRange: dayRange,
          details: [
            '0:00', '1:00', '2:00', '3:00', '4:00', '5:00',
            '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
            '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
            '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
          ],
          date: strings.format('%d年%02d月%02d日', year, month, dayOfMonth)
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} offset
   * @return {Promise<SuccessMsg>}
   */
  getItemsByWeek(offset = 0) {
    offset = -offset
    let d = new Date()
    let week = d.getDay() === 0 ? 7 : d.getDay()
    const n = offset ? 7 : week
    // 设置为某周星期一
    d.setDate(d.getDate() + 1 - week - 7 * offset)
    const monday = new Date(d.valueOf())
    const ps = []
    for (let i = 0; i < n; i++) {
      ps.push(this.getTimeSumByDay(d.getFullYear(), d.getMonth() + 1, d.getDate()))
      d.setDate(d.getDate() + 1)
    }
    return new Promise((resolve, reject) => {
      Promise.all(ps).then(res => {
        const weekWorkItems = res.map(item => item.data.dayWorkTime)
        resolve(SuccessMsg.instance({
          timeRange: weekWorkItems,
          details: [
            '周一', '周二', '周三', '周四', '周五', '周六', '周日'
          ],
          monday
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @return {Promise<SuccessMsg>}
   */
  getItemsByMonth(year, month) {
    const maxDate = new Date(year, month, 0).getDate()

    const now = new Date()
    const n = now.getMonth() + 1 === month ? now.getDate() : maxDate

    const ps = []
    for (let i = 1; i <= n; i++) {
      ps.push(this.getTimeSumByDay(year, month, i))
    }
    return new Promise((resolve, reject) => {
      Promise.all(ps).then(res => {
        const monthWorkItems = res.map(item => item.data.dayWorkTime)

        const details = []
        for (let i = 1; i <= maxDate; i++) details.push(strings.format('%02d/%02d', month, i))

        resolve(SuccessMsg.instance({
          timeRange: monthWorkItems,
          details,
          date: strings.format('%d年%02d月', year, month)
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @return {Promise<SuccessMsg>}
   */
  getItemsByYear(year) {
    const ps = []
    for (let i = 1; i <= 12; i++) {
      ps.push(this.getTimeSumByMonth(year, i))
    }
    return new Promise((resolve, reject) => {
      Promise.all(ps).then(res => {
        const yearWorkItems = res.map(item => item.data.monthWorkTime)
        resolve(SuccessMsg.instance({
          timeRange: yearWorkItems,
          details: [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
          ],
          date: strings.format('%d年', year)
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @param {number} dayOfMonth
   * @return {Promise<SuccessMsg>}
   */
  getDay(year, month, dayOfMonth) {
    const yearMonth = strings.format('%d/%02d', year, month)
    const key = strings.format('%s/%s', dataKey.Statistics, yearMonth)
    return new Promise((resolve, reject) => {
      this.storage.get(key).then(res => {
        let data = res.data || []
        const target = strings.format('%s/%02d', yearMonth, dayOfMonth)
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
      this.getTimeSumByDay(date.getFullYear(), date.getMonth() + 1, date.getDate())
        .then(res => {
          const data = res.data
          resolve(SuccessMsg.instance({todayWorkTime: data.dayWorkTime, todayRestTime: data.dayRestTime}))
        })
        .catch(err => reject(err))
    })
  }

  /**
   * @param {number} beginStamp
   * @param {number} endStamp
   * @return {Promise<unknown>}
   */
  getBetween({beginStamp, endStamp}) {
    return new Promise((resolve, reject) => {
      this.storage.queryLikeAsArray(dataKey.Statistics + '/').then(res => {
        res.data = res.data.filter(item => item.status === clockStatus.WORK)

        const data = beginStamp && endStamp ? res.data.filter(item => beginStamp <= item.startTime && item.startTime <= endStamp) : res.data
        const arr = []
        collect(data)
          .groupBy(item => item.name)
          .each((currentItem, key, collection) => {
            arr.push({
              name: collection[key].all()[0].name,
              value: collection[key].all().map(item => item.duration).reduce((pre, cur) => pre + cur)
            })
          })
        resolve(SuccessMsg.instance(arr))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {string} dateFormat
   * @return {Promise<SuccessMsg>}
   */
  getEveryday(dateFormat = 'YYYY年MM月DD日') {
    return new Promise((resolve, reject) => {
      this.storage.queryLikeAsArray(dataKey.Statistics + '/').then(res => {
        const data = res.data
        if (!data) {
          resolve(SuccessMsg.emptyInstance())
          return
        }
        const dayGroups = collect(data)
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
          })
          .sortKeysDesc()
          .all()

        const allDayGroups = Object.keys(dayGroups).length ? dayGroups : null
        resolve(SuccessMsg.instance({allDayGroups}))
      }).catch(err => reject(err))
    })
  }

  /**
   * @return {Promise<SuccessMsg>}
   */
  getLast7Day() {
    return new Promise((resolve, reject) => {
      const dateFormat = 'YYYY年MM月DD日'
      this.getEveryday(dateFormat).then(res => {
        const before7day = dayjs().subtract(7, 'd')
        const before7dayFormat = before7day.format(dateFormat)
        const durations = new Array(7).fill(0, 0, 7)
        const arr = Object.entries(res.data.allDayGroups)

        arr.forEach((value, index) => {
          const i = dayjs(value[0], dateFormat).diff(before7day, 'day')
          if (i >= 0 && i < 7 && before7dayFormat !== value[0]) {
            durations[i] = value[1].workSum || 0
          }
        })
        const dailyMinuteLabels = []
        for (let i = 6; i >= 0; i--) {
          dailyMinuteLabels.push(dayjs().subtract(i, 'd').format('MM/DD'))
        }
        resolve(SuccessMsg.instance({
          dailyMinutes: durations,
          dailyMinuteLabels
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
      }).catch(err => reject(err))
    })
  }
}

export default Statistic.instance(
  isUTools() ? new UToolsStorage() : new BrowserStorage()
)
