import duration from 'dayjs/plugin/duration'
import dayjs from 'dayjs'
import * as strings from '@/util/strings'
dayjs.extend(duration)

export function formatSecond(second) {
  let m = second / 60
  let s = second % 60
  return strings.format('%02d:%02d', m, s)
}

export function formatMinute(minute) {
  return dayjs.duration(minute, 'm')
    .format(parseInt(minute / 60) ? 'H 时 mm 分' : 'm 分')
}
