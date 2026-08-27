import { COLOR_OPTIONS, SORT_OPTIONS } from './constants'
import type { Candidate, CandidateColor, Settings, SortMode } from './types'

/** 导入时的候选人条目（不含 id / votes，导入后重建） */
export interface ImportedCandidate {
  name: string
  color: CandidateColor
  disabled: boolean
}

/**
 * 一次导入的结果。
 * - candidates：undefined 表示不修改现有候选人；数组（含空数组）表示整体覆盖。
 * - settings：Partial，只覆盖文件中提到的字段。
 * - sortMode：undefined 表示不改动。
 */
export interface ImportResult {
  candidates?: ImportedCandidate[]
  settings?: Partial<Settings>
  sortMode?: SortMode
}

const VALID_COLORS = new Set<string>(
  COLOR_OPTIONS.flatMap((o) => (o.value == null ? [] : [o.value])),
)

// ---------- 序列化（导出） ----------

/** 导出为纯文本：每行一个姓名 */
export function serializeCandidatesText(candidates: Candidate[]): string {
  return candidates.map((c) => c.name).join('\n')
}

/** 导出为 JSON：完整配置 */
export function serializeConfigJson(
  candidates: Candidate[],
  settings: Settings,
  sortMode: SortMode,
): string {
  const data = {
    version: 1,
    candidates: candidates.map((c) => ({
      name: c.name,
      color: c.color,
      disabled: c.disabled,
    })),
    settings: {
      minPerBallot: settings.minPerBallot,
      maxPerBallot: settings.maxPerBallot,
      electedCount: settings.electedCount,
      enlargeFont: settings.enlargeFont,
    },
    sortMode,
  }
  return JSON.stringify(data, null, 2)
}

// ---------- 解析（导入） ----------

/** 解析纯文本：每行一个姓名，空行忽略 */
export function parseCandidatesText(text: string): ImportResult {
  const names = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (names.length === 0) {
    throw new Error('TXT 文件中没有有效的候选人姓名')
  }
  return {
    candidates: names.map((name) => ({ name, color: null, disabled: false })),
  }
}

function parseCandidateEntry(entry: unknown, index: number): ImportedCandidate {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw new Error(`candidates[${index}] 不是有效的对象`)
  }
  const e = entry as Record<string, unknown>
  if (typeof e.name !== 'string' || e.name.trim() === '') {
    throw new Error(`candidates[${index}] 缺少有效的 name`)
  }
  return {
    name: e.name.trim(),
    // 未指定或非法颜色一律回退为无色
    color:
      e.color == null
        ? null
        : typeof e.color === 'string' && VALID_COLORS.has(e.color)
          ? (e.color as CandidateColor)
          : null,
    // 未指定或非法一律回退为不禁用
    disabled: e.disabled === true,
  }
}

function parseNonNegativeInt(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  const n = Math.floor(v)
  return n >= 0 ? n : null
}

function parseSettings(raw: unknown): Partial<Settings> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('settings 应为对象')
  }
  const r = raw as Record<string, unknown>
  const patch: Partial<Settings> = {}
  if ('minPerBallot' in r) {
    const v = parseNonNegativeInt(r.minPerBallot)
    if (v == null) throw new Error('settings.minPerBallot 应为非负整数')
    patch.minPerBallot = v
  }
  if ('maxPerBallot' in r) {
    if (r.maxPerBallot == null) {
      patch.maxPerBallot = null
    } else {
      const v = parseNonNegativeInt(r.maxPerBallot)
      if (v == null) throw new Error('settings.maxPerBallot 应为非负整数或 null')
      patch.maxPerBallot = v
    }
  }
  if ('electedCount' in r) {
    const v = parseNonNegativeInt(r.electedCount)
    if (v == null || v < 1) throw new Error('settings.electedCount 应为正整数')
    patch.electedCount = v
  }
  if ('enlargeFont' in r) {
    if (typeof r.enlargeFont !== 'boolean') {
      throw new Error('settings.enlargeFont 应为布尔值')
    }
    patch.enlargeFont = r.enlargeFont
  }
  // 同一份文件里同时指定了上下界时，保证 max >= min
  if (
    patch.minPerBallot != null &&
    patch.maxPerBallot != null &&
    patch.maxPerBallot < patch.minPerBallot
  ) {
    patch.maxPerBallot = patch.minPerBallot
  }
  return patch
}

function parseSortMode(raw: unknown): SortMode {
  if (typeof raw !== 'string' || !SORT_OPTIONS.some((o) => o.value === raw)) {
    throw new Error('sortMode 无效（应为 name / added / votes）')
  }
  return raw as SortMode
}

/** 解析 JSON 配置；candidates 缺省表示不修改候选人 */
export function parseConfigJson(text: string): ImportResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('JSON 解析失败：不是有效的 JSON 格式')
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('JSON 根节点应为对象')
  }
  const obj = data as Record<string, unknown>

  const result: ImportResult = {}
  if (obj.candidates !== undefined) {
    if (!Array.isArray(obj.candidates)) {
      throw new Error('candidates 应为数组')
    }
    result.candidates = obj.candidates.map(parseCandidateEntry)
  }
  if (obj.settings !== undefined) {
    const patch = parseSettings(obj.settings)
    if (Object.keys(patch).length > 0) result.settings = patch
  }
  if (obj.sortMode !== undefined) {
    result.sortMode = parseSortMode(obj.sortMode)
  }
  return result
}

/** 生成导入结果的人类可读摘要，用于界面反馈 */
export function describeImport(result: ImportResult): string {
  const parts: string[] = []
  if (result.candidates !== undefined) {
    parts.push(
      result.candidates.length === 0
        ? '已清空候选人列表'
        : `已导入 ${result.candidates.length} 名候选人`,
    )
  }
  const settingKeys = result.settings
    ? (Object.keys(result.settings) as (keyof Settings)[])
    : []
  if (settingKeys.length > 0) {
    const labels: Record<keyof Settings, string> = {
      minPerBallot: '最少人数',
      maxPerBallot: '最多人数',
      electedCount: '当选人数',
      enlargeFont: '字体大小',
    }
    parts.push(
      `已更新设置（${settingKeys.map((k) => labels[k]).join('、')}）`,
    )
  }
  if (result.sortMode !== undefined) parts.push('已更新排序方式')
  return parts.join('，')
}

// ---------- 文件下载 ----------

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function timestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

/** 导出纯文本并触发浏览器下载 */
export function exportCandidatesText(candidates: Candidate[]) {
  downloadFile(
    `候选人名单-${timestamp()}.txt`,
    serializeCandidatesText(candidates),
    'text/plain;charset=utf-8',
  )
}

/** 导出 JSON 并触发浏览器下载 */
export function exportConfigJson(
  candidates: Candidate[],
  settings: Settings,
  sortMode: SortMode,
) {
  downloadFile(
    `EasyVote配置-${timestamp()}.json`,
    serializeConfigJson(candidates, settings, sortMode),
    'application/json;charset=utf-8',
  )
}
