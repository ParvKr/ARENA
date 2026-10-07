// components/hero/path.ts
export type Pt = { x: number; y: number } // fractions of a w×h box (may sit slightly outside it)

/** Catmull-Rom spline through the points, expressed as cubic Béziers. */
export function toSpline(pts: Pt[], w: number, h: number) {
  const at = (i: number): Pt => pts[Math.min(Math.max(i, 0), pts.length - 1)] ?? { x: 0, y: 0 }
  const X = (i: number) => at(i).x * w
  const Y = (i: number) => at(i).y * h
  let d = `M${X(0)},${Y(0)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const c1x = X(i) + (X(i + 1) - X(i - 1)) / 6
    const c1y = Y(i) + (Y(i + 1) - Y(i - 1)) / 6
    const c2x = X(i + 1) - (X(i + 2) - X(i)) / 6
    const c2y = Y(i + 1) - (Y(i + 2) - Y(i)) / 6
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${X(i + 1)},${Y(i + 1)}`
  }
  return d
}
