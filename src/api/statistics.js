import {ClockStatus, DataKey, FocusEfficiency} from '@/common/constant'
import dayjs from 'dayjs'
import storage, {Msg} from '@/util/storage'
import collect from 'collect.js'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {exportJSON, importJSON} from '@/util/file'
import * as string from '@/util/string'
import {createArray} from '@/util/common'

dayjs.extend(customParseFormat)


/**
 * @param {Array<{name: string, startTime: number, duration: number, status: 'work' | 'rest'}>} arr
 * @return {number}
 */
function getWorkTimeSum(arr) {
  return arr.filter(item => item.status === ClockStatus.WORK)
    .map(item => item.duration)
    .reduce((pre, cur) => pre + cur, 0)
}

/**
 * @param {Array<{name: string, startTime: number, duration: number, status: 'work' | 'rest'}>} arr
 * @return {number}
 */
function getRestTimeSum(arr) {
  return arr.filter(item => item.status === ClockStatus.REST)
    .map(item => item.duration)
    .reduce((pre, cur) => pre + cur, 0)
}

/**
 * @param {number} beginStamp
 * @param {number} endStamp
 * @return {string}
 */
function getBetweenKey(beginStamp, endStamp) {
  let key = DataKey.Statistics + '/'
  if (beginStamp && endStamp) {
    let b = dayjs(beginStamp)
    let e = dayjs(endStamp)
    if (b.year() === e.year()) {
      key += b.year() + '/' + (b.month() === e.month() ? string.format('%02d', b.month() + 1) : '')
    }
  }
  return key
}

class StatisticStore {
  /**
   * @param {string} name
   * @param {number} duration minutes
   * @param {number} startTime timestamp
   * @param {number} endTime timestamp
   * @param {'work' | 'rest'} status
   * @param {string} efficiency
   * @param {boolean} isAppendEfficiency
   * @return {Promise<Msg>}
   */
  add(name, duration, status, startTime, endTime = Date.now(), isAppendEfficiency = true, efficiency = FocusEfficiency.ORDINARY) {
    const key = string.format('%s/%s', DataKey.Statistics, dayjs().format('YYYY/MM'))
    return new Promise((resolve, reject) => {
      storage.get(key).then(res => {
        let data = res.data || []
        const item = {name, startTime, endTime, duration, status}
        if (status === ClockStatus.WORK && isAppendEfficiency) {
          item.efficiency = efficiency
        }
        data.push(item)

        storage.set(key, data)
          .then(res => resolve(res))
          .catch(err => reject(err))
      })
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @return {Promise<Msg>}
   */
  getTimeSumByMonth(year, month) {
    const key = string.format('%s/%d/%02d', DataKey.Statistics, year, month)
    return new Promise((resolve, reject) => {
      storage.get(key).then(res => {
        let data = res.data || []
        let monthWorkTime = getWorkTimeSum(data)
        let monthRestTime = getRestTimeSum(data)
        resolve(Msg.instance({monthWorkTime, monthRestTime}))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @param {number} dayOfMonth
   * @return {Promise<Msg>}
   */
  getTimeSumByDay(year, month, dayOfMonth) {
    return new Promise((resolve, reject) => {
      this.getDay(year, month, dayOfMonth)
        .then(res => {
          let data = res.data || []
          let dayWorkTime = getWorkTimeSum(data)
          let dayRestTime = getRestTimeSum(data)
          resolve(Msg.instance({dayWorkTime, dayRestTime}))
        })
        .catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @param {number} dayOfMonth
   * @return {Promise<Msg>}
   */
  getItemsByDay(year, month, dayOfMonth) {
    return new Promise((resolve, reject) => {
      this.getDay(year, month, dayOfMonth).then(res => {
        let data = res.data.filter(item => item.status === ClockStatus.WORK)

        const dayRange = createArray(24, 0)
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
        resolve(Msg.instance({
          timeRange: dayRange,
          details: [
            '0:00', '1:00', '2:00', '3:00', '4:00', '5:00',
            '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
            '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
            '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
          ],
          date: string.format('%d年%02d月%02d日', year, month, dayOfMonth),
          sum: dayRange.reduce((p, v) => p + v, 0)
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} offset
   * @return {Promise<Msg>}
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
        for (let i = n; i < 7; i++) {
          weekWorkItems.push(0)
        }
        console.log(weekWorkItems)
        resolve(Msg.instance({
          timeRange: weekWorkItems,
          details: [
            '周一', '周二', '周三', '周四', '周五', '周六', '周日'
          ],
          monday,
          sum: weekWorkItems.reduce((p, c) => p + c, 0)
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @return {Promise<Msg>}
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
        for (let i = n + 1; i <= maxDate; i++) {
          monthWorkItems.push(0)
        }

        const details = []
        for (let i = 1; i <= maxDate; i++) details.push(string.format('%02d/%02d', month, i))

        resolve(Msg.instance({
          timeRange: monthWorkItems,
          details,
          date: string.format('%d年%02d月', year, month),
          sum: monthWorkItems.reduce((p, c) => p + c, 0)
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @return {Promise<Msg>}
   */
  getItemsByYear(year) {
    const ps = []
    for (let i = 1; i <= 12; i++) {
      ps.push(this.getTimeSumByMonth(year, i))
    }
    return new Promise((resolve, reject) => {
      Promise.all(ps).then(res => {
        const yearWorkItems = res.map(item => item.data.monthWorkTime)
        resolve(Msg.instance({
          timeRange: yearWorkItems,
          details: [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
          ],
          date: string.format('%d年', year),
          sum: yearWorkItems.reduce((p, c) => p + c, 0)
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {number} year
   * @param {number} month
   * @param {number} dayOfMonth
   * @return {Promise<Msg>}
   */
  getDay(year, month, dayOfMonth) {
    const yearMonth = string.format('%d/%02d', year, month)
    const key = string.format('%s/%s', DataKey.Statistics, yearMonth)
    return new Promise((resolve, reject) => {
      storage.get(key).then(res => {
        let data = res.data || []
        const target = string.format('%s/%02d', yearMonth, dayOfMonth)
        const arr = data.filter(item => dayjs(item.startTime).format('YYYY/MM/DD') === target)
        resolve(Msg.instance(arr))
      }).catch(err => reject(err))
    })
  }

  /**
   * @return {Promise<Msg>}
   */
  getToday() {
    return new Promise((resolve, reject) => {
      const date = new Date()
      this.getTimeSumByDay(date.getFullYear(), date.getMonth() + 1, date.getDate())
        .then(res => {
          const data = res.data
          resolve(Msg.instance({todayWorkTime: data.dayWorkTime, todayRestTime: data.dayRestTime}))
        })
        .catch(err => reject(err))
    })
  }

  /**
   * @param {number} beginStamp
   * @param {number} endStamp
   * @return {Promise<unknown>}
   */
  getItemsBetween(beginStamp, endStamp) {
    return new Promise((resolve, reject) => {
      storage.queryLikeAsArray(getBetweenKey(beginStamp, endStamp)).then(res => {
        res.data = res.data.filter(item => item.status === ClockStatus.WORK)

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
        resolve(Msg.instance({
          tasksTime: arr,
          sum: arr.map(item => item.value).reduce((p, c) => p + c, 0)
        }))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {string} dayFormat
   * @param {number} beginStamp
   * @param {number} endStamp
   * @return {Promise<Msg>}
   */
  getDailyItems(dayFormat, beginStamp = undefined, endStamp = undefined) {
    return new Promise((resolve, reject) => {
      storage.queryLikeAsArray(getBetweenKey(beginStamp, endStamp)).then(({data}) => {
        data = beginStamp && endStamp ? data.filter(item => beginStamp <= item.startTime && item.startTime <= endStamp) : data
        const dayGroups = collect(data)
          .groupBy(item => dayjs(item.startTime).format(dayFormat))
          .each((currentItem, key, collection) => {
            collection[key] = {
              workSum: currentItem
                .filter(item => item.status === ClockStatus.WORK)
                .map(item => item.duration).reduce((pre, cur) => pre + cur),
              restSum: currentItem
                .filter(item => item.status === ClockStatus.REST)
                .map(item => item.duration).reduce((pre, cur) => pre + cur),
              items: currentItem.sortByDesc('startTime').all()
            }
          })
          .sortKeysDesc()
          .all()

        resolve(Msg.instance({data: dayGroups, isEmpty: Object.keys(dayGroups).length === 0}))
      }).catch(err => reject(err))
    })
  }

  /**
   * @return {Promise<Msg>}
   */
  getLast7WorkTime() {
    return new Promise((resolve, reject) => {
      const dateFormat = 'YYYY/MM/DD'
      const today = dayjs()
      const before7day = today.subtract(6, 'd').startOf('day')
      this.getDailyItems(dateFormat, before7day.valueOf(), today.valueOf()).then(({data}) => {
        const dailyMinutes = createArray(7, 0)
        const dailyEfficiencyMinutes = {
          [FocusEfficiency.TERRIBLE]: createArray(7, 0),
          [FocusEfficiency.ORDINARY]: createArray(7, 0),
          [FocusEfficiency.GOOD]: createArray(7, 0),
          [FocusEfficiency.WONDERFUL]: createArray(7, 0)
        }

        const arr = Object.entries(data.data)
        arr.forEach((value, index) => {
          const i = dayjs(value[0], dateFormat).diff(before7day, 'day')

          if (i >= 0 && i < 7) {
            collect(value[1].items)
              .filter(item => item.status === ClockStatus.WORK)
              .groupBy(item => item.efficiency || FocusEfficiency.ORDINARY)
              .each((currentItem, key) => {
                dailyEfficiencyMinutes[key][i] = currentItem.all()
                  .map(item => item.duration)
                  .reduce((p, c) => p + c, 0)
              })
            dailyMinutes[i] = value[1].workSum || 0
          }
        })

        const dailyMinuteLabels = []
        for (let i = 6; i >= 2; i--) {
          dailyMinuteLabels.push(today.subtract(i, 'd').format('MM/DD'))
        }
        dailyMinuteLabels.push('昨天', '今天')
        resolve(Msg.instance({dailyMinutes, dailyEfficiencyMinutes, dailyMinuteLabels}))
      }).catch(err => reject(err))
    })
  }

  /**
   * @return {Promise<Msg>}
   */
  removeStatistic() {
    return storage.removeLike(DataKey.Statistics)
  }

  /**
   * @return {Promise<Msg>}
   */
  exportStatisticToJSON(filename = 'relax_statistics.json') {
    return new Promise((resolve, reject) => {
      storage.queryLikeAsObject(DataKey.Statistics).then(res => {
        const data = res.data
        const temp = {}
        for (let key in data) {
          temp[key] = data[key]['items']
        }
        exportJSON(temp, filename)
          .then(() => resolve(Msg.instance()))
          .catch(err => reject(err))
      }).catch(err => reject(err))
    })
  }

  /**
   * @param {File} file
   * @return {Promise<Msg>}
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
          ps.push(storage.set(key, item ? item : []))
        }
        Promise.all(ps)
          .then(() => resolve(Msg.instance()))
          .catch(err => reject(err))
      }).catch(err => reject(err))
    })
  }
}

export default new StatisticStore()
