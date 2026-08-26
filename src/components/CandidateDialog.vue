<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COLOR_OPTIONS } from '@/lib/constants'
import type { Candidate, CandidateColor } from '@/lib/types'

const props = defineProps<{
  open: boolean
  mode: 'add' | 'edit'
  candidate?: Candidate | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: { name: string; color: CandidateColor; disabled: boolean }]
  delete: [id: string]
}>()

const name = ref('')
/** Select 的值不能为 null，用 'none' 表示无色 */
const colorValue = ref<Exclude<CandidateColor, null> | 'none'>('none')
const disabled = ref(false)

const canSubmit = computed(() => name.value.trim().length > 0)

function initForm() {
  if (props.mode === 'edit' && props.candidate) {
    name.value = props.candidate.name
    colorValue.value = props.candidate.color ?? 'none'
    disabled.value = props.candidate.disabled
  } else {
    name.value = ''
    colorValue.value = 'none'
    disabled.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) initForm()
  },
)

function onDisabledChange(value: boolean | 'indeterminate') {
  disabled.value = value === true
}

function onSubmit() {
  if (!canSubmit.value) return
  emit('submit', {
    name: name.value.trim(),
    color: colorValue.value === 'none' ? null : colorValue.value,
    disabled: disabled.value,
  })
  emit('update:open', false)
}

function onDelete() {
  if (props.candidate) emit('delete', props.candidate.id)
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ mode === 'add' ? '添加候选人' : '编辑候选人' }}
        </DialogTitle>
        <DialogDescription>
          {{
            mode === 'add'
              ? '输入新候选人的姓名与标记。'
              : '修改该候选人的姓名、颜色或停用状态。'
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="candidate-name">姓名</Label>
          <Input
            id="candidate-name"
            v-model="name"
            placeholder="输入候选人姓名"
            autofocus
          />
        </div>

        <div class="grid gap-2">
          <Label>颜色标记</Label>
          <Select v-model="colorValue">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="选择颜色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="opt in COLOR_OPTIONS"
                :key="opt.value ?? 'none'"
                :value="opt.value ?? 'none'"
              >
                <span class="flex items-center gap-2">
                  <span
                    class="inline-block size-3 rounded-full"
                    :class="opt.dot"
                    aria-hidden="true"
                  />
                  {{ opt.label }}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center gap-2">
          <Checkbox
            id="candidate-disabled"
            :checked="disabled"
            @update:checked="onDisabledChange"
          />
          <Label for="candidate-disabled" class="cursor-pointer">
            停用此候选人（保留已有票数，不可再被勾选）
          </Label>
        </div>

        <Button
          v-if="mode === 'edit'"
          type="button"
          variant="destructive"
          class="w-full"
          @click="onDelete"
        >
          <Trash2 class="size-4" aria-hidden="true" />
          删除此候选人
        </Button>

        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit" :disabled="!canSubmit">确定</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
