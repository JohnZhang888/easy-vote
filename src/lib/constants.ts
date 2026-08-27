import type { CandidateColor, Settings, SortMode } from './types'

export const COLOR_OPTIONS: {
  value: CandidateColor
  label: string
  dot: string
}[] = [
  { value: null, label: '无色', dot: 'border border-border bg-transparent' },
  { value: 'red', label: '红色', dot: 'bg-red-500' },
  { value: 'orange', label: '橙色', dot: 'bg-orange-500' },
  { value: 'yellow', label: '黄色', dot: 'bg-yellow-500' },
  { value: 'green', label: '绿色', dot: 'bg-green-500' },
  { value: 'cyan', label: '青色', dot: 'bg-cyan-500' },
  { value: 'blue', label: '蓝色', dot: 'bg-blue-500' },
  { value: 'purple', label: '紫色', dot: 'bg-purple-500' },
  { value: 'pink', label: '粉色', dot: 'bg-pink-500' },
]

/**
 * 颜色 → 卡片样式。必须写成完整类名字符串，
 * 以便 Tailwind v4 JIT 在构建时保留这些类。
 */
export const COLOR_STYLES: Record<Exclude<CandidateColor, null>, string> = {
  red: 'border-red-300 bg-red-50 text-red-950',
  orange: 'border-orange-300 bg-orange-50 text-orange-950',
  yellow: 'border-yellow-300 bg-yellow-50 text-yellow-950',
  green: 'border-green-300 bg-green-50 text-green-950',
  cyan: 'border-cyan-300 bg-cyan-50 text-cyan-950',
  blue: 'border-blue-300 bg-blue-50 text-blue-950',
  purple: 'border-purple-300 bg-purple-50 text-purple-950',
  pink: 'border-pink-300 bg-pink-50 text-pink-950',
}

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'name', label: '拼音 / 字典序' },
  { value: 'added', label: '添加顺序' },
  { value: 'votes', label: '得票从高到低' },
]

export const DEFAULT_SETTINGS: Settings = {
  minPerBallot: 1,
  maxPerBallot: null,
  electedCount: 1,
  enlargeFont: false,
}
