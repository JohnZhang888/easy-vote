<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Settings } from '@/lib/types'

const props = defineProps<{
  open: boolean
  settings: Settings
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [settings: Settings]
}>()

const minStr = ref('1')
const maxStr = ref('')
const electedStr = ref('1')

function initForm() {
  minStr.value = String(props.settings.minPerBallot)
  maxStr.value =
    props.settings.maxPerBallot == null
      ? ''
      : String(props.settings.maxPerBallot)
  electedStr.value = String(props.settings.electedCount)
}

watch(
  () => props.open,
  (open) => {
    if (open) initForm()
  },
)

function parsePositive(v: string): number {
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? 0 : Math.max(0, n)
}

function onSave() {
  const min = parsePositive(minStr.value)
  const maxRaw = maxStr.value.trim() === '' ? null : parsePositive(maxStr.value)
  const max = maxRaw == null ? null : Math.max(min, maxRaw)
  const elected = Math.max(1, parsePositive(electedStr.value) || 1)
  emit('save', { minPerBallot: min, maxPerBallot: max, electedCount: elected })
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>投票设置</DialogTitle>
        <DialogDescription>
          设置每张票允许勾选的人数范围，以及得票前 N 名当选。
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="setting-min">每张票最少人数</Label>
          <Input
            id="setting-min"
            v-model="minStr"
            type="number"
            min="0"
            inputmode="numeric"
          />
        </div>
        <div class="grid gap-2">
          <Label for="setting-max">每张票最多人数（留空 = 不限）</Label>
          <Input
            id="setting-max"
            v-model="maxStr"
            type="number"
            min="0"
            inputmode="numeric"
            placeholder="不限"
          />
        </div>
        <div class="grid gap-2">
          <Label for="setting-elected">当选人数（得票前 N 名）</Label>
          <Input
            id="setting-elected"
            v-model="electedStr"
            type="number"
            min="1"
            inputmode="numeric"
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">取消</Button>
        </DialogClose>
        <Button @click="onSave">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
