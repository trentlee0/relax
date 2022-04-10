/**
 * 判断是否为 uTools 平台
 */
export function isUtools() {
  return Reflect.has(window, 'utools')
}
