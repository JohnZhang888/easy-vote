<script setup lang="ts">
import { computed, ref } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import CandidateCard from '@/components/CandidateCard.vue'
import CandidateDialog from '@/components/CandidateDialog.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
import { Button } from '@/components/ui/button'
import { useVoting } from '@/composables/useVoting'
import type { CandidateColor, Settings } from '@/lib/types'

const {
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
} = useVoting()

// —— 弹窗状态 ——
const addOpen = ref(false)
const editOpen = ref(false)
const editingId = ref<string | null>(null)
const settingsOpen = ref(false)

const editingCandidate = computed(() =>
  editingId.value == null
    ? null
    : (candidates.value.find((c) => c.id === editingId.value) ?? null),
)

function openAdd() {
  addOpen.value = true
}

function openEdit(id: string) {
  editingId.value = id
  editOpen.value = true
}

function handleSubmit(
  mode: 'add' | 'edit',
  payload: { name: string; color: CandidateColor; disabled: boolean },
) {
  if (mode === 'edit' && editingId.value) {
    updateCandidate(editingId.value, payload)
  } else {
    addCandidate(payload.name)
  }
}

function handleDelete(id: string) {
  removeCandidate(id)
  if (editingId.value === id) editingId.value = null
}

function handleSettingsSave(updated: Settings) {
  settings.value = updated
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background">
    <AppHeader
      :ballot-count="ballotCount"
      :selected-count="selectedCount"
      :min-per-ballot="settings.minPerBallot"
      :max-per-ballot="settings.maxPerBallot"
      :can-next="withinBounds"
      :can-undo="canUndo"
      :sort-mode="sortMode"
      :total-votes="totalVotes"
      @update:sort-mode="sortMode = $event"
      @next="nextBallot"
      @undo="undoLastBallot"
      @add="openAdd"
      @open-settings="settingsOpen = true"
    />

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-4">
      <!-- 空状态 -->
      <div
        v-if="candidates.length === 0"
        class="flex flex-col items-center justify-center gap-4 py-24 text-center"
      >
        <div class="grid size-16 place-content-center rounded-full border bg-muted/40">
          <UserPlus class="size-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <div class="space-y-1">
          <p class="text-base font-medium">还没有候选人</p>
          <p class="text-sm text-muted-foreground">
            点击右上角「添加候选人」，录入后即可开始投票唱票。
          </p>
        </div>
        <Button @click="openAdd">
          <UserPlus class="size-4" aria-hidden="true" />
          添加第一位候选人
        </Button>
      </div>

      <!-- 候选人网格 -->
      <div
        v-else
        class="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-2"
      >
        <CandidateCard
          v-for="c in sortedCandidates"
          :key="c.id"
          :candidate="c"
          :selected="selectedIds.includes(c.id)"
          :is-elected="electedIds.has(c.id)"
          @toggle="toggleSelected(c.id)"
          @edit="openEdit(c.id)"
        />
      </div>
    </main>

    <CandidateDialog
      :open="addOpen"
      mode="add"
      @update:open="addOpen = $event"
      @submit="handleSubmit('add', $event)"
    />
    <CandidateDialog
      :open="editOpen"
      mode="edit"
      :candidate="editingCandidate"
      @update:open="editOpen = $event"
      @submit="handleSubmit('edit', $event)"
      @delete="handleDelete"
    />
    <SettingsDialog
      :open="settingsOpen"
      :settings="settings"
      @update:open="settingsOpen = $event"
      @save="handleSettingsSave"
    />
  </div>
</template>
