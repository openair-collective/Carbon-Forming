export function pad(value:number):string {
  return value < 10 ? '0' + value : value.toString()
}