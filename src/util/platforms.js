/**
 * 判断是否为 uTools 平台
 */
export function isUTools() {
  return Reflect.has(window, 'utools')
}
