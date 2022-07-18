import localforage from 'localforage'

/**
 * 异步返回成功消息
 */
export class SuccessMsg {
  msg
  data

  constructor(data) {
    this.msg = 'OK'
    this.data = data
  }

  /**
   * 返回包含数据实例
   * @param {Object} data
   * @return {SuccessMsg}
   */
  static instance(data) {
    return new SuccessMsg(data)
  }

  /**
   * 返回空数据实例
   * @return {SuccessMsg}
   */
  static emptyInstance() {
    return new SuccessMsg(null)
  }
}


export class Storage {
  /**
   * 异步获取
   * 注意：浏览器中使用 localforage，与同步方法使用的数据库不同
   * @param {string} key
   * @return {Promise<SuccessMsg>}
   */
  get(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 异步设置值
   * 注意：浏览器中使用 localforage，与同步方法使用的数据库不同
   * @param {string} key
   * @param {Object} value
   * @return {Promise<SuccessMsg>}
   */
  set(key, value) {
    throw new Error('Abstract method!')
  }

  /**
   * 异步删除
   * 注意：浏览器中使用 localforage，与同步方法使用的数据库不同
   * @param {string} key
   * @return {Promise<SuccessMsg>}
   */
  remove(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步获取
   * 注意：浏览器中使用 localStorage，与异步方法使用的数据库不同
   * @param {string} key
   * @return Object
   */
  getSync(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步设置值
   * 注意：浏览器中使用 localStorage，与异步方法使用的数据库不同
   * @param {string} key
   * @param {Object} value
   * @return {void}
   */
  setSync(key, value) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步删除
   * 注意：浏览器中使用 localStorage，与异步方法使用的数据库不同
   * @param {string} key
   * @return {void}
   */
  removeSync(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 获取临时存储数据
   * @param {string} key
   * @return {Promise<SuccessMsg>}
   */
  getTempCache(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 设置临时存储数据
   * @param {string} key
   * @param {Object} attachment
   * @return {Promise<SuccessMsg>}
   */
  setTempCache(key, attachment) {
    throw new Error('Abstract method!')
  }

  /**
   * 删除临时存储数据
   * @param {string} key
   * @return {Promise<SuccessMsg>}
   */
  removeTempCache(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 匹配键前缀获取所有，返回键值对。获取 set() 、setSync() 设置的值
   * @param {string} likeKey
   * @return {Promise<SuccessMsg>}
   */
  queryLikeAsObject(likeKey) {
    throw new Error('Abstract method!')
  }

  /**
   * 匹配键前缀获取所有，返回数组。获取 set() 、setSync() 设置的值
   * @param {string} likeKey
   * @return {Promise<SuccessMsg>}
   */
  queryLikeAsArray(likeKey) {
    throw new Error('Abstract method!')
  }

  /**
   * 匹配键前缀删除所有
   * @param {string} likeKey
   * @return {Promise<SuccessMsg>}
   */
  removeLike(likeKey) {
    throw new Error('Abstract method!')
  }
}

export class BrowserStorage extends Storage {
  get(key) {
    return new Promise((resolve, reject) => {
      localforage.getItem(key)
        .then(data => resolve(SuccessMsg.instance(data)))
        .catch(err => reject(err))
    })
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      localforage.setItem(key, value)
        .then(() => resolve(SuccessMsg.emptyInstance()))
        .catch(err => reject(err))
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      localforage.removeItem(key)
        .then(() => resolve(SuccessMsg.emptyInstance()))
        .catch(err => reject(err))
    })
  }

  getSync(key) {
    return JSON.parse(localStorage.getItem(key))
  }

  setSync(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  removeSync(key) {
    localStorage.removeItem(key)
  }

  getTempCache(key) {
    return this.get(key)
  }

  setTempCache(key, attachment) {
    return this.set(key, attachment)
  }

  removeTempCache(key) {
    return this.remove(key)
  }

  queryLikeAsObject(likeKey) {
    return new Promise((resolve, reject) => {
      const data = {}
      localforage.iterate((v, k) => {
        if (k.startsWith(likeKey)) {
          data[k] = {items: v}
        }
      }).then(() => resolve(SuccessMsg.instance(data))).catch(err => reject(err))
    })
  }

  queryLikeAsArray(likeKey) {
    return new Promise((resolve, reject) => {
      const data = []
      localforage.iterate((v, k) => {
        if (k.startsWith(likeKey)) {
          v.forEach(item => data.push(item))
        }
      }).then(() => resolve(SuccessMsg.instance(data))).catch(err => reject(err))
    })
  }

  removeLike(likeKey) {
    return new Promise((resolve, reject) => {
      const ps = []
      localforage.iterate((v, k) => {
        if (k.startsWith(likeKey)) {
          ps.push(localforage.removeItem(k))
        }
      }).then(() =>
        Promise.all(ps)
          .then(() => resolve(SuccessMsg.emptyInstance()))
          .catch(err => reject(err))
      ).catch(err => reject(err))
    })
  }
}


export class UToolsStorage extends Storage {
  get(key) {
    return new Promise((resolve, reject) => {
      resolve(SuccessMsg.instance(utools.dbStorage.getItem(key)))
    })
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      utools.dbStorage.setItem(key, value)
      resolve(SuccessMsg.emptyInstance())
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      utools.dbStorage.removeItem(key)
      resolve(SuccessMsg.emptyInstance())
    })
  }

  getSync(key) {
    return utools.dbStorage.getItem(key)
  }

  setSync(key, value) {
    utools.dbStorage.setItem(key, value)
  }

  removeSync(key) {
    utools.dbStorage.removeItem(key)
  }

  getTempCache(key) {
    return new Promise((resolve, reject) => {
      localforage.getItem(key)
        .then(data => resolve(SuccessMsg.instance(data)))
        .catch(err => reject(err))
    })
  }

  setTempCache(key, attachment) {
    return new Promise((resolve, reject) => {
      localforage.setItem(key, attachment)
        .then(() => resolve(SuccessMsg.instance(SuccessMsg.emptyInstance())))
        .catch(err => reject(err))
    })
  }

  removeTempCache(key) {
    return new Promise((resolve, reject) => {
      localforage.removeItem(key)
        .then(() => resolve(SuccessMsg.instance(SuccessMsg.emptyInstance())))
        .catch(err => reject(err))
    })
  }

  queryLikeAsObject(likeKey) {
    return new Promise((resolve, reject) => {
      utools.db.promises.allDocs(likeKey).then(res => {
        let data = {}
        if (!res) {
          resolve(SuccessMsg.instance(data))
          return
        }
        res.forEach(item => data[item['_id']] = {items: item['value']})
        resolve(SuccessMsg.instance(data))
      }).catch(err => reject(err))
    })
  }

  queryLikeAsArray(likeKey) {
    return new Promise((resolve, reject) => {
      utools.db.promises.allDocs(likeKey).then(res => {
        let data = []
        if (res) {
          res.forEach(item => item['value'].forEach(e => data.push(e)))
        }
        resolve(SuccessMsg.instance(data))
      }).catch(err => reject(err))
    })
  }

  removeLike(likeKey) {
    return new Promise((resolve, reject) => {
      utools.db.promises.allDocs(likeKey).then(res => {
        if (!res) {
          resolve(SuccessMsg.emptyInstance())
          return
        }
        res.forEach(item => utools.dbStorage.removeItem(item['_id']))
        resolve(SuccessMsg.emptyInstance())
      }).catch(err => reject(err))
    })
  }
}
