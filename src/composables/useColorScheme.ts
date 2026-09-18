import { watch } from 'vue'
import { usePreferredDark } from '@vueuse/core'

/**
 * 让页面的明暗模式跟随浏览器 / 操作系统的 `prefers-color-scheme` 设置：
 * 在 <html> 上切换 `.dark` 类（`style.css` 里的暗色变量挂在 `.dark` 下）。
 */
export function useColorScheme() {
  const isDark = usePreferredDark()

  watch(
    isDark,
    (dark) => {
      document.documentElement.classList.toggle('dark', dark)
    },
    { immediate: true },
  )

  return { isDark }
}
