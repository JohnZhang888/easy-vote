/** 候选人的颜色标记，null 表示无色 */
export type CandidateColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | null

export interface Candidate {
  id: string
  name: string
  color: CandidateColor
  /** 停用后不可再被勾选投票，但已有票数保留 */
  disabled: boolean
  /** 累计得票数 */
  votes: number
}

/** 带实时排名与实时得票的候选人（竞赛排名：1, 2, 2, 4 …） */
export interface RankedCandidate extends Candidate {
  /** 实时得票数 = 累计得票 + 当前这张票是否勾选（勾选即 +1） */
  liveVotes: number
  /** 实时排名 */
  rank: number
}

/** 候选人排序方式 */
export type SortMode = 'name' | 'added' | 'votes'

export interface Settings {
  /** 每张票最少人数 */
  minPerBallot: number
  /** 每张票最多人数，null 表示不限 */
  maxPerBallot: number | null
  /** 当选人数（得票前 N 名） */
  electedCount: number
}
