import duration from 'dayjs/plugin/duration'
import dayjs from 'dayjs'
import * as string from '@/util/string'

dayjs.extend(duration)

export function formatDurationSeconds(second) {
  let m = second / 60
  let s = second % 60
  return string.format('%02d:%02d', m, s)
}

export function formatDurationMinutes(minute) {
  return dayjs.duration(minute, 'm')
    .format(parseInt(minute / 60) ? 'H 时 mm 分' : 'm 分')
}

/**
 * @param {number} timestamp
 * @return {number}
 */
export function startOfDay(timestamp = undefined) {
  return dayjs(timestamp).startOf('day').valueOf()
}

/**
 * @param {number} timestamp
 * @return {number}
 */
export function endOfDay(timestamp = undefined) {
  return dayjs(timestamp).endOf('day').valueOf()
}

/**
 * @param {number} timestamp
 * @return {{start: number, end: number}}
 */
export function startAndEndOfDay(timestamp = undefined) {
  const d = dayjs(timestamp)
  return {
    start: d.startOf('day').valueOf(),
    end: d.endOf('day').valueOf()
  }
}

/**
 * @param {number} timestamp
 * @return {{start: number, end: number}}
 */
export function startAndEndOfWeek(timestamp = undefined) {
  const d = dayjs(timestamp)
  let ws = d.startOf('week')
  ws = d.day() === 0 ? ws.subtract(6, 'day') : ws.add(1, 'day')
  return {
    start: ws.valueOf(),
    end: ws.add(6, 'day').endOf('day').valueOf()
  }
}

/**
 * @param {number} timestamp
 * @return {{start: number, end: number}}
 */
export function startAndEndOfMonth(timestamp = undefined) {
  const d = dayjs(timestamp)
  return {
    start: d.startOf('month').valueOf(),
    end: d.endOf('month').valueOf()
  }
}

/**
 * @param {number} timestamp
 * @return {{start: number, end: number}}
 */
export function startAndEndOfYear(timestamp = undefined) {
  const d = dayjs(timestamp)
  return {
    start: d.startOf('year').valueOf(),
    end: d.endOf('year').valueOf()
  }
}
