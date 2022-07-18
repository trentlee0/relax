/**
 * @param date
 * @return {number}
 */
export function getWeek(date) {
  let d1 = new Date(date)
  let d2 = new Date(date)
  d2.setMonth(0)
  d2.setDate(3)
  let rq = d1 - d2
  let days = Math.ceil(rq / (24 * 60 * 60 * 1000))
  let num = Math.ceil(days / 7)
  return num + 1
}
