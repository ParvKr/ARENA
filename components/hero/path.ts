// components/hero/path.ts
export type Pt = { x: number; y: number } // fractions of a w×h box (may sit slightly outside it)
export type Vec = [number, number]

export interface Seg {
  p1: Vec
  c1: Vec
  c2: Vec
  p2: Vec
}

/** Catmull-Rom spline through the points, as cubic Bézier segments. */
export function splineSegments(pts: Pt[], w: number, h: number): Seg[] {
  const at = (i: number): Pt => pts[Math.min(Math.max(i, 0), pts.length - 1)] ?? { x: 0, y: 0 }
  const X = (i: number) => at(i).x * w
  const Y = (i: number) => at(i).y * h
  const segs: Seg[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    segs.push({
      p1: [X(i), Y(i)],
      c1: [X(i) + (X(i + 1) - X(i - 1)) / 6, Y(i) + (Y(i + 1) - Y(i - 1)) / 6],
      c2: [X(i + 1) - (X(i + 2) - X(i)) / 6, Y(i + 1) - (Y(i + 2) - Y(i)) / 6],
      p2: [X(i + 1), Y(i + 1)],
    })
  }
  return segs
}

export function segmentsToPath(segs: Seg[]): string {
  const first = segs[0]
  if (!first) return ''
  let d = `M${first.p1[0]},${first.p1[1]}`
  for (const s of segs) d += ` C${s.c1[0]},${s.c1[1]} ${s.c2[0]},${s.c2[1]} ${s.p2[0]},${s.p2[1]}`
  return d
}

export function toSpline(pts: Pt[], w: number, h: number): string {
  return segmentsToPath(splineSegments(pts, w, h))
}
