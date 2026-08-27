<script setup lang="ts">
import { ref, watch } from 'vue'
import { RefreshCcw, RotateCcw, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Separator } from '@/components/ui/separator'
import type { Settings } from '@/lib/types'

const props = defineProps<{
  open: boolean
  settings: Settings
  candidateCount: number
  totalVotes: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [settings: Settings]
  'clear-votes': []
  'delete-all': []
  'reset-all': []
}>()

const minStr = ref('1')
const maxStr = ref('')
const electedStr = ref('1')
const enlargeFont = ref(false)

function initForm() {
  minStr.value = String(props.settings.minPerBallot)
  maxStr.value =
    props.settings.maxPerBallot == null
      ? ''
      : String(props.settings.maxPerBallot)
  electedStr.value = String(props.settings.electedCount)
  enlargeFont.value = props.settings.enlargeFont ?? false
}

watch(
  () => props.open,
  (open) => {
    if (open) initForm()
  },
)

function parsePositive(v: string | number): number {
  const n = parseInt(String(v), 10)
  return Number.isNaN(n) ? 0 : Math.max(0, n)
}

function onEnlargeFontChange(value: boolean | 'indeterminate') {
  enlargeFont.value = value === true
}

function onSave() {
  const min = parsePositive(minStr.value)
  // type="number" 输入框会把值回写成数字，这里统一转回字符串再 trim
  const maxStrValue = String(maxStr.value).trim()
  const maxRaw = maxStrValue === '' ? null : parsePositive(maxStrValue)
  const max = maxRaw == null ? null : Math.max(min, maxRaw)
  const elected = Math.max(1, parsePositive(electedStr.value) || 1)
  emit('save', {
    minPerBallot: min,
    maxPerBallot: max,
    electedCount: elected,
    enlargeFont: enlargeFont.value,
  })
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>设置</DialogTitle>
        <!-- <DialogDescription>
          设置每张票允许勾选的人数范围，以及得票前 N 名当选。
        </DialogDescription> -->
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
        <div class="flex items-center gap-2">
          <Checkbox
            id="setting-enlarge-font"
            :model-value="enlargeFont"
            @update:model-value="onEnlargeFontChange"
          />
          <Label for="setting-enlarge-font" class="cursor-pointer">
            增大字体大小（仅候选人卡片，适合大屏/投影）
          </Label>
        </div>
      </div>

      <Separator />

      <!-- 危险操作 -->
      <section class="grid gap-2">
        <p class="text-sm font-medium text-red-600">危险操作</p>
        <div class="flex flex-wrap gap-2">
          <Button
            variant="outline"
            :disabled="totalVotes === 0"
            class="text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            @click="emit('clear-votes')"
          >
            <RotateCcw class="size-4" aria-hidden="true" />
            清空所有选票
          </Button>
          <Button
            variant="outline"
            :disabled="candidateCount === 0"
            class="text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            @click="emit('delete-all')"
          >
            <Trash2 class="size-4" aria-hidden="true" />
            删除所有候选人
          </Button>
        </div>
        <Button
          variant="outline"
          class="w-full text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          @click="emit('reset-all')"
        >
          <RefreshCcw class="size-4" aria-hidden="true" />
          恢复默认设置
        </Button>
        <!-- <p class="text-xs leading-relaxed text-muted-foreground">
          「清空所有选票」会把全部候选人的得票归零；「删除所有候选人」会移除
          整个名单及其得票。两项操作均不可撤销。
        </p> -->
      </section>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">取消</Button>
        </DialogClose>
        <Button @click="onSave">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
