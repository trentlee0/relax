/**
 * @param {function} fn
 * @param {number} delay
 * @return {function(): void}
 */
export function debounce(fn, delay) {
  let timeout = null
  return function() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}

/**
 * @param {function} fn
 * @param {number} delay
 * @return {function(): void}
 */
export function throttle(fn, delay) {
  let canRun = true
  return function() {
    if (!canRun) return
    canRun = false
    setTimeout(() => {
      fn.apply(this, arguments)
      canRun = true
    }, delay)
  }
}

/**
 * 判断是否为 uTools 平台
 * @return {boolean}
 */
export function isUTools() {
  return Reflect.has(window, 'utools')
}

export function isMacOS() {
  return isUTools() ? utools.isMacOs() : /mac/i.test(navigator.platform)
}

export function isWindows() {
  return isUTools() ? utools.isWindows() : /win/i.test(navigator.platform)
}


/**
 * @param {any} obj
 * @return {any}
 */
export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * @param {number} length
 * @param {any} defaultVal
 * @return {any[]}
 */
export function createArray(length, defaultVal = undefined) {
  if (defaultVal === undefined) return new Array(length)
  return new Array(length).fill(defaultVal, 0, length)
}
