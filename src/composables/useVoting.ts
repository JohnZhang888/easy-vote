import { computed, ref } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { DEFAULT_SETTINGS } from '@/lib/constants'
import type {
  Candidate,
  CandidateColor,
  RankedCandidate,
  Settings,
  SortMode,
} from '@/lib/types'

/** 拼音/字典序排序，带数字感知 */
const nameCollator = new Intl.Collator('zh-Hans-CN-u-co-pinyin', {
  numeric: true,
  sensitivity: 'base',
})

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export interface Voting {
  candidates: Ref<Candidate[]>
  ballotCount: Ref<number>
  settings: Ref<Settings>
  sortMode: Ref<SortMode>

  selectedIds: Ref<string[]>
  selectedCount: Ref<number>
  withinBounds: Ref<boolean>
  canUndo: Ref<boolean>

  addCandidate: (name: string) => void
  updateCandidate: (
    id: string,
    patch: Partial<Pick<Candidate, 'name' | 'color' | 'disabled'>>,
  ) => void
  removeCandidate: (id: string) => void

  toggleSelected: (id: string) => void
  nextBallot: () => void
  undoLastBallot: () => void

  sortedCandidates: Ref<RankedCandidate[]>
  electedIds: Ref<Set<string>>
  totalVotes: Ref<number>
}

export const VotingKey: InjectionKey<Voting> = Symbol('easy-vote:voting')

export function useVoting(): Voting {
  /** 候选人数组，数组顺序即“添加顺序” */
  const candidates = useStorage<Candidate[]>('easy-vote:candidates', [])
  const ballotCount = useStorage<number>('easy-vote:ballot-count', 0)
  const settings = useStorage<Settings>('easy-vote:settings', {
    ...DEFAULT_SETTINGS,
  })
  const sortMode = useStorage<SortMode>('easy-vote:sort-mode', 'name')

  /** 当前这张票勾选的人（瞬时状态，不持久化） */
  const selectedIds = ref<string[]>([])
  /** 最近一次统计的票，用于撤销 */
  const lastBallot = ref<{ ids: string[] } | null>(null)

  // ---------- 候选人增删改 ----------

  function addCandidate(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    candidates.value.push({
      id: createId(),
      name: trimmed,
      color: null,
      disabled: false,
      votes: 0,
    })
  }

  function updateCandidate(
    id: string,
    patch: Partial<Pick<Candidate, 'name' | 'color' | 'disabled'>>,
  ) {
    const c = candidates.value.find((x) => x.id === id)
    if (!c) return
    if (patch.name !== undefined) {
      const trimmed = patch.name.trim()
      if (trimmed) c.name = trimmed
    }
    if (patch.color !== undefined) c.color = patch.color
    if (patch.disabled !== undefined) c.disabled = patch.disabled
  }

  function removeCandidate(id: string) {
    candidates.value = candidates.value.filter((x) => x.id !== id)
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }

  // ---------- 勾选 ----------

  const selectedCount = computed(() => selectedIds.value.length)

  function toggleSelected(id: string) {
    const c = candidates.value.find((x) => x.id === id)
    if (!c || c.disabled) return
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((x) => x !== id)
    } else {
      selectedIds.value = [...selectedIds.value, id]
    }
  }

  // ---------- 唱票 / 撤销 ----------

  const withinBounds = computed(() => {
    const count = selectedIds.value.length
    if (count < settings.value.minPerBallot) return false
    if (settings.value.maxPerBallot != null && count > settings.value.maxPerBallot) {
      return false
    }
    return true
  })

  const canUndo = computed(() => lastBallot.value != null)

  function nextBallot() {
    if (!withinBounds.value) return
    lastBallot.value = { ids: [...selectedIds.value] }
    for (const id of selectedIds.value) {
      const c = candidates.value.find((x) => x.id === id)
      if (c) c.votes += 1
    }
    ballotCount.value += 1
    selectedIds.value = []
  }

  function undoLastBallot() {
    const last = lastBallot.value
    if (!last) return
    for (const id of last.ids) {
      const c = candidates.value.find((x) => x.id === id)
      if (c && c.votes > 0) c.votes -= 1
    }
    ballotCount.value = Math.max(0, ballotCount.value - 1)
    selectedIds.value = last.ids
    lastBallot.value = null
  }

  // ---------- 排名 / 排序 ----------

  /** 按得票降序的竞赛排名（平票同名次，1,2,2,4） */
  const ranked = computed<RankedCandidate[]>(() => {
    const sorted = [...candidates.value].sort((a, b) => b.votes - a.votes)
    let lastVotes: number | null = null
    let lastRank = 0
    return sorted.map((c, i) => {
      const rank = c.votes === lastVotes ? lastRank : i + 1
      lastVotes = c.votes
      lastRank = rank
      return { ...c, rank }
    })
  })

  /** 按当前排序模式展示的候选人（附实时排名） */
  const sortedCandidates = computed<RankedCandidate[]>(() => {
    const rankById = new Map(ranked.value.map((r) => [r.id, r.rank]))
    const list = [...candidates.value]
    switch (sortMode.value) {
      case 'votes':
        list.sort((a, b) => b.votes - a.votes)
        break
      case 'name':
        list.sort((a, b) => {
          const n = nameCollator.compare(a.name, b.name)
          return n || 0
        })
        break
      case 'added':
        // 保持数组原有顺序（添加顺序），Array.sort 稳定排序保证不重排
        break
    }
    return list.map((c) => ({ ...c, rank: rankById.get(c.id) ?? 0 }))
  })

  const electedIds = computed<Set<string>>(() => {
    const n = settings.value.electedCount
    if (n < 1) return new Set()
    return new Set(ranked.value.filter((r) => r.rank <= n).map((r) => r.id))
  })

  const totalVotes = computed(() =>
    candidates.value.reduce((sum, c) => sum + c.votes, 0),
  )

  return {
    candidates,
    ballotCount,
    settings,
    sortMode,
    selectedIds,
    selectedCount,
    withinBounds,
    canUndo,
    addCandidate,
    updateCandidate,
    removeCandidate,
    toggleSelected,
    nextBallot,
    undoLastBallot,
    sortedCandidates,
    electedIds,
    totalVotes,
  }
}
