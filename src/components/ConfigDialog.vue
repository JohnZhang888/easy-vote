<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileJson, FileText, Upload } from 'lucide-vue-next'
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
import { Separator } from '@/components/ui/separator'
import {
  describeImport,
  exportCandidatesText,
  exportConfigJson,
  parseCandidatesText,
  parseConfigJson,
} from '@/lib/configFile'
import type { ImportResult } from '@/lib/configFile'
import type { Candidate, Settings, SortMode } from '@/lib/types'

const props = defineProps<{
  open: boolean
  candidates: Candidate[]
  settings: Settings
  sortMode: SortMode
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  import: [result: ImportResult]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const status = ref<{ kind: 'ok' | 'error'; text: string } | null>(null)

watch(
  () => props.open,
  (open) => {
    if (open) status.value = null
  },
)

function onExportTxt() {
  exportCandidatesText(props.candidates)
}

function onExportJson() {
  exportConfigJson(props.candidates, props.settings, props.sortMode)
}

function triggerImport() {
  status.value = null
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const trimmed = text.trimStart()
    const isJson =
      /\.(json|jsonc)$/i.test(file.name) ||
      trimmed.startsWith('{') ||
      trimmed.startsWith('[')
    const result = isJson ? parseConfigJson(text) : parseCandidatesText(text)
    emit('import', result)
    status.value = { kind: 'ok', text: `导入成功：${describeImport(result)}` }
  } catch (err) {
    status.value = {
      kind: 'error',
      text: `导入失败：${err instanceof Error ? err.message : '文件读取出错'}`,
    }
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>配置文件</DialogTitle>
        <DialogDescription>
          将候选人名单与设置保存为文件，或从文件一键恢复。
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4">
        <!-- 导出 -->
        <section class="grid gap-2">
          <p class="text-sm font-medium">导出</p>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" @click="onExportTxt">
              <FileText class="size-4" aria-hidden="true" />
              导出 TXT（仅名单）
            </Button>
            <Button variant="outline" @click="onExportJson">
              <FileJson class="size-4" aria-hidden="true" />
              导出 JSON（全部配置）
            </Button>
          </div>
        </section>

        <Separator />

        <!-- 导入 -->
        <section class="grid gap-2">
          <p class="text-sm font-medium">导入</p>
          <div class="flex flex-wrap items-center gap-2">
            <Button @click="triggerImport">
              <Upload class="size-4" aria-hidden="true" />
              选择文件导入
            </Button>
            <input
              ref="fileInput"
              type="file"
              accept=".txt,.text,.json,.jsonc"
              class="hidden"
              @change="onFileChange"
            />
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground">
            支持 TXT（每行一个姓名，仅名单）与 JSON（完整配置）。导入的候选人将
            覆盖现有名单；JSON 中未提到的设置将保持当前值。
          </p>
        </section>

        <!-- 导入结果提示 -->
        <p
          v-if="status"
          class="rounded-md border px-3 py-2 text-sm"
          :class="
            status.kind === 'ok'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-red-300 bg-red-50 text-red-700'
          "
        >
          {{ status.text }}
        </p>
      </div>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">关闭</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
