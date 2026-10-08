// components/results/types.ts
// Plain, serialisable shapes handed from the server page to the client view.

export interface ResultRow {
  rank: number
  /** 0 to 100 */
  score: number
  points: number
  username: string | null
  displayName: string
  avatarUrl: string | null
  fileUrl: string
  fileType: string
  interpretation: string
  tools: string
}

export interface ResultsSprint {
  id: string
  number: number
  title: string
  discipline: string
}

export interface ArchiveItem {
  number: number
  title: string
}
