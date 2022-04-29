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

