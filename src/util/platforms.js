/**
 * 判断是否为 uTools 平台
 * @return {boolean}
 */
export function isUTools() {
  return Reflect.has(window, 'utools')
}
