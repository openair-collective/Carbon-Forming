export function intersect(a:any[], b:any[]):any[] {
  return a.filter(Set.prototype.has, new Set(b));
}