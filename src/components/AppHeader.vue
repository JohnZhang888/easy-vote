<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowUpDown,
  FileCog,
  RotateCcw,
  Settings,
  UserPlus,
  Vote,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SORT_OPTIONS } from '@/lib/constants'
import type { SortMode } from '@/lib/types'

const props = defineProps<{
  ballotCount: number
  selectedCount: number
  minPerBallot: number
  maxPerBallot: number | null
  canNext: boolean
  canUndo: boolean
  sortMode: SortMode
  totalVotes: number
}>()

const emit = defineEmits<{
  'update:sortMode': [value: SortMode]
  next: []
  undo: []
  add: []
  'open-settings': []
  'open-config': []
}>()

const boundsText = computed(() =>
  props.maxPerBallot == null
    ? `至少 ${props.minPerBallot} 人`
    : `${props.minPerBallot} ~ ${props.maxPerBallot} 人`,
)

const hint = computed(() => {
  if (props.selectedCount < props.minPerBallot) {
    return `还需再选 ${props.minPerBallot - props.selectedCount} 人`
  }
  if (
    props.maxPerBallot != null &&
    props.selectedCount > props.maxPerBallot
  ) {
    return `超出上限 ${props.selectedCount - props.maxPerBallot} 人`
  }
  return '人数符合要求，可提交'
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
      <div class="mr-auto flex min-w-0 items-center gap-2">
        <Vote class="size-6 shrink-0 text-primary" aria-hidden="true" />
        <div class="min-w-0">
          <h1 class="text-lg leading-tight font-bold">EasyVote</h1>
          <p class="text-xs leading-tight text-muted-foreground">
            实时投票 · 唱票
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="配置文件"
          @click="emit('open-config')"
        >
          <FileCog class="size-4" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="设置"
          @click="emit('open-settings')"
        >
          <Settings class="size-4" aria-hidden="true" />
        </Button>

        <Select
          :model-value="sortMode"
          @update:model-value="emit('update:sortMode', $event as SortMode)"
        >
          <SelectTrigger class="w-auto gap-1.5" aria-label="排序方式">
            <ArrowUpDown class="size-4 shrink-0" aria-hidden="true" />
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in SORT_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Separator
          orientation="vertical"
          class="hidden h-6 sm:block"
        />

        <Button variant="outline" @click="emit('add')">
          <UserPlus class="size-4" aria-hidden="true" />
          添加候选人
        </Button>

        <ButtonGroup>
          <Button :disabled="!canNext" @click="emit('next')">
            <Vote class="size-4" aria-hidden="true" />
            下一张票
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="撤销上一张票"
            :disabled="!canUndo"
            @click="emit('undo')"
          >
            <RotateCcw class="size-4" aria-hidden="true" />
          </Button>
        </ButtonGroup>
      </div>
    </div>

    <div class="border-t bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1">
        <span>
          已统计 <b class="text-foreground">{{ ballotCount }}</b> 张票
        </span>
        <span>
          当前已选 <b class="text-foreground">{{ selectedCount }}</b> 人
          <span class="text-muted-foreground/80">（要求 {{ boundsText }}）</span>
        </span>
        <span :class="canNext ? 'text-emerald-600' : 'text-amber-600'">
          {{ hint }}
        </span>
        <span class="ml-auto">
          总票数 <b class="text-foreground">{{ totalVotes }}</b>
        </span>
      </div>
    </div>
  </header>
</template>
