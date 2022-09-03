import FileSaver from 'file-saver'
import {Msg} from '@/util/storage'

/**
 * 导出为 JSON 字符串
 * @param {Object} data 数据源
 * @param {string} filename 导出的文件名
 * @return {Promise<Msg>}
 */
export function exportJSON(data, filename) {
  return new Promise((resolve, reject) => {
    let dataStr = JSON.stringify(data, null, 2)
    let blob = new Blob([dataStr], {type: 'application/json'})
    FileSaver.saveAs(blob, filename)
    resolve(Msg.instance())
  })
}

/**
 * 导入 JSON 数据为 JS 对象
 * @param {File} file
 * @return {Promise<Msg>}
 */
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => resolve(Msg.instance(JSON.parse(reader.result)))
  })
}

/**
 * Uint8Array 类型转换为字符串类型
 * @param {Uint8Array} fileData
 * @return {string}
 */
export function uint8ArrayToString(fileData) {
  let dataString = ''
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i])
  }
  return dataString
}


/**
 * 字符串类型转换为 Uint8Array 类型
 * @param {string} str
 * @return {Uint8Array}
 */
export function stringToUint8Array(str) {
  let arr = []
  for (let i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i))
  }
  return new Uint8Array(arr)
}
