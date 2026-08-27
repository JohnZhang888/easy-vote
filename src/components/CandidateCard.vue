<script setup lang="ts">
import { computed } from 'vue'
import { Ban, Pencil, Trophy } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import { COLOR_STYLES } from '@/lib/constants'
import type { RankedCandidate } from '@/lib/types'

const props = defineProps<{
  candidate: RankedCandidate
  selected: boolean
  isElected: boolean
}>()

const emit = defineEmits<{
  toggle: []
  edit: []
}>()

const colorStyle = computed(() =>
  props.candidate.color ? COLOR_STYLES[props.candidate.color] : '',
)
</script>

<template>
  <Item
    variant="outline"
    size="sm"
    class="cursor-pointer select-none transition-shadow hover:shadow-sm"
    :class="[
      colorStyle,
      isElected && 'ring-2 ring-amber-400/70',
      candidate.disabled && 'opacity-60',
    ]"
    @click="emit('toggle')"
  >
    <Checkbox
      :model-value="selected"
      :disabled="candidate.disabled"
      class="shrink-0"
      @click.stop
      @update:model-value="emit('toggle')"
    />
    <ItemContent class="min-w-0">
      <ItemTitle class="w-full gap-1.5">
        <span class="truncate">{{ candidate.name }}</span>
        <Ban
          v-if="candidate.disabled"
          class="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </ItemTitle>
    </ItemContent>
    <ItemActions class="shrink-0">
      <Badge
        :variant="isElected ? 'default' : 'outline'"
        :class="
          isElected
            ? 'border-amber-500 bg-amber-500 text-white hover:bg-amber-500/90'
            : ''
        "
      >
        <Trophy v-if="isElected" class="size-3" aria-hidden="true" />
        <span class="tabular-nums">#{{ candidate.rank }}</span>
      </Badge>
      <span class="flex items-baseline gap-1 text-sm tabular-nums">
        <b>{{ candidate.liveVotes }}</b>
        <span class="text-xs text-muted-foreground">票</span>
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        class="shrink-0"
        aria-label="编辑候选人"
        @click.stop="emit('edit')"
      >
        <Pencil class="size-4" aria-hidden="true" />
      </Button>
    </ItemActions>
  </Item>
</template>
