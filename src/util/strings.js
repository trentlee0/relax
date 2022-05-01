import voca from 'voca'

/**
 * @param {string} format
 * @param args
 * @return {string}
 */
export function format(format, ...args) {
  return voca.sprintf(format, ...args)
}
