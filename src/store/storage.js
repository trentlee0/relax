import FileSaver from 'file-saver'
import * as localforage from 'localforage'

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
   * @param {string} key
   * @return {Promise<SuccessMsg>}
   */
  get(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步获取
   * @param {string} key
   * @return Object
   */
  getSync(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 设置附件
   * @param {string} key
   * @param {string} attachment
   * @return {Promise<SuccessMsg>}
   */
  setAttachment(key, attachment) {
    throw new Error('Abstract method!')
  }

  /**
   * 获取附件
   * @param {string} key
   * @return {Promise<SuccessMsg>}
   */
  getAttachment(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 删除附件
   * @param {string} key
   * @return {Promise<SuccessMsg>}
   */
  removeAttachment(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 异步设置值
   * @param {string} key
   * @param {Object} value
   * @return {Promise<SuccessMsg>}
   */
  set(key, value) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步设置值
   * @param {string} key
   * @param {Object} value
   * @return {void}
   */
  setSync(key, value) {
    throw new Error('Abstract method!')
  }

  /**
   * 异步删除
   * @param {string} key
   * @return {Promise<SuccessMsg>}
   */
  remove(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步删除
   * @param {string} key
   * @return {void}
   */
  removeSync(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 获取大文档
   * @param key
   * @return {Promise<SuccessMsg>}
   */
  getLargeDoc(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 设置大文档
   * @param key
   * @param value
   * @return {Promise<SuccessMsg>}
   */
  setLargeDoc(key, value) {
    throw new Error('Abstract method!')
  }

  /**
   * 删除大文档
   * @param key
   * @return {Promise<SuccessMsg>}
   */
  removeLargeDoc(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 导出为 JSON 字符串
   * @param {Object} data 数据源
   * @param {string} filename 导出的文件名
   * @return {Promise<SuccessMsg>}
   */
  static exportJSON(data, filename) {
    return new Promise((resolve, reject) => {
      try {
        let dataStr = JSON.stringify(data, null, 2)
        let blob = new Blob([dataStr], {type: 'application/json'})
        FileSaver.saveAs(blob, filename)
        resolve(SuccessMsg.emptyInstance())
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * 导入 JSON 数据为 JS 对象
   * @param {File} file
   * @return {Promise<SuccessMsg>}
   */
  static importJSON(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => resolve(SuccessMsg.instance(JSON.parse(reader.result)))
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Uint8Array 类型转换为字符串类型
   * @param {Uint8Array} fileData
   * @return {string}
   */
  static uint8ArrayToString(fileData) {
    let dataString = ''
    for (let i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i])
    }
    return dataString
  }


  /**
   * 字符串类型转换为 Uint8Array 类型
   * @param str
   * @return {Uint8Array}
   */
  static stringToUint8Array(str) {
    let arr = []
    for (let i = 0; i < str.length; i++) {
      arr.push(str.charCodeAt(i))
    }
    return new Uint8Array(arr)
  }
}


export class BrowserStorage extends Storage {
  get(key) {
    return new Promise((resolve, reject) => {
      try {
        resolve(SuccessMsg.instance(JSON.parse(localStorage.getItem(key))))
      } catch (err) {
        reject(err)
      }
    })
  }

  getSync(key) {
    return JSON.parse(localStorage.getItem(key))
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        resolve(SuccessMsg.emptyInstance())
      } catch (err) {
        reject(err)
      }
    })
  }

  setSync(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  getAttachment(key) {
    return new Promise((resolve, reject) => {
      localforage.getItem(key)
        .then(data => resolve(SuccessMsg.instance(data ? data : '')))
        .catch(err => reject(err))
    })
  }

  setAttachment(key, attachment) {
    return new Promise((resolve, reject) => {
      localforage.setItem(key, attachment)
        .then(() => resolve(SuccessMsg.instance(SuccessMsg.emptyInstance())))
        .catch(err => reject(err))
    })
  }

  removeAttachment(key) {
    return new Promise((resolve, reject) => {
      localforage.removeItem(key)
        .then(() => resolve(SuccessMsg.instance(SuccessMsg.emptyInstance())))
        .catch(err => reject(err))
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(key)
        resolve(SuccessMsg.emptyInstance())
      } catch (err) {
        reject(err)
      }
    })
  }

  removeSync(key) {
    localStorage.removeItem(key)
  }

  getLargeDoc(key) {
    return new Promise((resolve, reject) => {
      localforage.getItem(key)
        .then(data => resolve(SuccessMsg.instance(data)))
        .catch(err => reject(err))
    })
  }

  setLargeDoc(key, value) {
    return new Promise((resolve, reject) => {
      localforage.setItem(key, value)
        .then(() => resolve(SuccessMsg.emptyInstance()))
        .catch(err => reject(err))
    })
  }

  removeLargeDoc(key) {
    return new Promise((resolve, reject) => {
      localforage.removeItem(key)
        .then(() => resolve(SuccessMsg.emptyInstance()))
        .catch(err => reject(err))
    })
  }
}


export class UToolsStorage extends Storage {
  get(key) {
    return new Promise((resolve, reject) => {
      try {
        resolve(SuccessMsg.instance(utools.dbStorage.getItem(key)))
      } catch (err) {
        reject(err)
      }
    })
  }

  getSync(key) {
    return utools.dbStorage.getItem(key)
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      try {
        utools.dbStorage.setItem(key, value)
        resolve(SuccessMsg.emptyInstance())
      } catch (err) {
        reject(err)
      }
    })
  }

  setSync(key, value) {
    utools.dbStorage.setItem(key, value)
  }

  getAttachment(key) {
    return new Promise((resolve, reject) => {
      localforage.getItem(key)
        .then(data => resolve(SuccessMsg.instance(data ? data : '')))
        .catch(err => reject(err))
    })
  }

  setAttachment(key, attachment) {
    return new Promise((resolve, reject) => {
      localforage.setItem(key, attachment)
        .then(() => resolve(SuccessMsg.instance(SuccessMsg.emptyInstance())))
        .catch(err => reject(err))
    })
  }

  removeAttachment(key) {
    return new Promise((resolve, reject) => {
      localforage.removeItem(key)
        .then(() => resolve(SuccessMsg.instance(SuccessMsg.emptyInstance())))
        .catch(err => reject(err))
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      try {
        utools.dbStorage.removeItem(key)
        resolve(SuccessMsg.emptyInstance())
      } catch (err) {
        reject(err)
      }
    })
  }

  removeSync(key) {
    utools.dbStorage.removeItem(key)
  }

  getLargeDoc(key) {
    return this.get(key)
  }

  setLargeDoc(key, value) {
    return this.set(key, value)
  }

  removeLargeDoc(key) {
    return this.remove(key)
  }
}
