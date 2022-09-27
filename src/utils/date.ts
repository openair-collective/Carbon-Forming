export function oridinal(n:number) {
  let ord = ["st", "nd", "rd"]
  let exceptions = [11, 12, 13]
  let nth = ord[(n % 10) - 1] == undefined || exceptions.includes(n % 100) ? "th" : ord[(n % 10) - 1]
  return n + nth
}

export function dayMonth(value:Date):string {
  const day = value.getDate()
  const monthName = value.toLocaleString('default', { month: 'long' })
  return `${oridinal(day)} ${monthName}`
}

export function dayMonthYear(value:Date):string {
  const year = value.getFullYear()
  return `${dayMonth(value)} ${year}`
}

export function fsTimestampToDate(stamp:any) {
  return new Date(
    stamp.seconds * 1000 + stamp.nanoseconds / 1000000
  )
}