<script setup lang="ts">
import { computed } from 'vue'
import { Ban, Pencil, Trophy } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import { COLOR_STYLES } from '@/lib/constants'
import type { RankedCandidate } from '@/lib/types'

const props = withDefaults(
  defineProps<{
    candidate: RankedCandidate
    selected: boolean
    isElected: boolean
    /** 放大候选人卡片字号（适合大屏/投影） */
    enlarge?: boolean
  }>(),
  { enlarge: false },
)

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
      enlarge && 'gap-3 px-4 py-4',
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
      :class="enlarge ? 'size-5' : ''"
      @click.stop
      @update:model-value="emit('toggle')"
    />
    <ItemContent :class="enlarge ? 'min-w-[10rem]' : 'min-w-0'">
      <ItemTitle
        class="w-full gap-1.5"
        :class="enlarge ? 'text-xl font-semibold md:text-2xl' : ''"
      >
        <span
          :class="
            enlarge
              ? 'min-w-0 flex-1 break-words'
              : 'min-w-0 flex-1 truncate'
          "
        >{{ candidate.name }}</span>
        <Ban
          v-if="candidate.disabled"
          class="shrink-0 text-muted-foreground"
          :class="enlarge ? 'size-4' : 'size-3.5'"
          aria-hidden="true"
        />
      </ItemTitle>
    </ItemContent>
    <ItemActions class="ml-auto shrink-0" :class="enlarge ? 'gap-2.5' : ''">
      <Badge
        :variant="isElected ? 'default' : 'outline'"
        :class="[
          enlarge ? 'px-3 py-1 text-base md:text-lg' : '',
          isElected
            ? 'border-amber-500 bg-amber-500 text-white hover:bg-amber-500/90'
            : '',
        ]"
      >
        <Trophy
          v-if="isElected"
          class="shrink-0"
          :class="enlarge ? 'size-4' : 'size-3'"
          aria-hidden="true"
        />
        <span class="tabular-nums">#{{ candidate.rank }}</span>
      </Badge>
      <span class="flex items-baseline gap-1 tabular-nums">
        <b :class="enlarge ? 'text-xl md:text-2xl' : ''">{{
          candidate.liveVotes
        }}</b>
        <span
          class="text-muted-foreground"
          :class="enlarge ? 'text-sm' : 'text-xs'"
        >票</span>
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        class="shrink-0"
        :class="enlarge ? 'size-9' : ''"
        aria-label="编辑候选人"
        @click.stop="emit('edit')"
      >
        <Pencil
          class="shrink-0"
          :class="enlarge ? 'size-5' : 'size-4'"
          aria-hidden="true"
        />
      </Button>
    </ItemActions>
  </Item>
</template>
