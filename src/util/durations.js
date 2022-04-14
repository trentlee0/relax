import duration from 'dayjs/plugin/duration'
import dayjs from 'dayjs'

dayjs.extend(duration)

export function formatSecond(second) {
  return dayjs.duration(second, 's')
    .format(parseInt(second / 3600) ? 'HH:mm:ss' : 'mm:ss')
}

export function formatMinute(minute) {
  return dayjs.duration(minute, 'm')
    .format(parseInt(minute / 60) ? 'H 时 mm 分' : 'm 分')
}
