import {dataKey} from '@/store/constants'
import dayjs from 'dayjs'
import {BrowserStorage, Storage, SuccessMsg, UToolsStorage} from '@/store/storage'
import {isUTools} from '@/util/platforms'

class Statistic {
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
      this._instance = new Statistic(storage)
    }
    return this._instance
  }

  add(name, minuteDuration) {
    return new Promise((resolve, reject) => {
      this.storage.getLargeDoc(dataKey.Statistics).then(res => {
        let data = res.data || []
        data.push({
          name: name,
          startTime: dayjs().subtract(minuteDuration, 'm').valueOf(),
          duration: minuteDuration
        })

        this.storage.setLargeDoc(dataKey.Statistics, data)
          .then(res => resolve(res))
          .catch(err => reject(err))
      })
    })
  }

  list() {
    return this.storage.getLargeDoc(dataKey.Statistics)
  }

  listGroupByDay(dateFormat) {
    return new Promise((resolve, reject) => {
      this.list().then(res => {
        const data = res.data
        if (!data) return

        let temp = {}
        data.forEach(el => {
          let key = dayjs(el.startTime).format(dateFormat)
          temp[key] = temp[key] || []
          temp[key].push(el)
        })
        let groups = {}
        for (let key in temp) {
          let arr = temp[key].sort().reverse()
          groups[key] = {
            data: arr,
            sum: arr.map(e => e.duration).reduce((pre, n) => pre + n)
          }
        }
        resolve(SuccessMsg.instance(groups))
      }).catch(err => reject(err))
    })
  }

  removeStatistic() {
    return this.storage.removeLargeDoc(dataKey.Statistics)
  }

  exportStatisticToJSON() {
    const filename = 'statistic.json'
    return new Promise((resolve, reject) => {
      this.list().then(res => {
        const data = res.data
        Storage.exportJSON({[dataKey.Statistics]: data || []}, filename)
          .then(res => resolve(res))
          .catch(err => reject(err))
      }).catch(err => reject(err))
    })
  }

  importJSONToStatistic(file) {
    return new Promise((resolve, reject) => {
      Storage.importJSON(file).then(res => {
        try {
          const data = res.data
          if (!data || !data[dataKey.Statistics]) {
            reject(new Error('数据为空或无效文件'))
            return
          }

          this.storage.setLargeDoc(dataKey.Statistics, data[dataKey.Statistics])
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
