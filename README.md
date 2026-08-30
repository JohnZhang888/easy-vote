*Currently, only Chinese is supported in the app and its documentation. Please stay tuned for future updates regarding multi-language support.*

# EasyVote · 实时投票

一款用于现场投票、唱票与实时排名的轻量级 Web 应用，借助 DeepSeek v4 与 Copilot 构建。在浏览器中即可添加候选人、逐张唱票，所有数据自动保存在本地，刷新或关闭页面也不会丢失。

- 实时得票与实时排名：勾选即生效，平票采用竞赛排名（1、2、2、4 …）
- 当选标记：自动标出得票前 N 名候选人
- 本地持久化：候选人、票数、设置全部保存在浏览器 `localStorage`
- 单文件构建：`npm run build` 后产物为单个 HTML 文件，可离线使用或随处分发

## 功能特性

### 候选人管理

- 添加候选人，可设置 8 种颜色标记（红 / 橙 / 黄 / 绿 / 青 / 蓝 / 紫 / 粉）或无色
- 编辑候选人姓名、颜色，或将其停用（停用后不可再被勾选，但已有票数保留）
- 删除单个候选人；支持一键删除全部候选人

### 投票与唱票

- 逐张唱票：勾选本张票支持的候选人，点击「下一张票」提交
- 每张票可选人数范围可在设置中配置（最少人数、最多人数，上限可留空表示不限）
- 提交前实时校验人数是否满足要求，并给出提示（还需再选几人 / 超出上限几人）
- 支持撤销上一张票，勾选状态与票数一并回退

### 实时统计

- 卡片实时显示每个候选人的得票数与排名，勾选/取消勾选立即反映
- 当选候选人（得票前 N 名）以奖杯徽标高亮
- 顶部状态栏展示：已统计票数、当前已选人数、总票数

### 排序方式

- 拼音 / 字典序（中文按拼音排序，含数字感知）
- 添加顺序
- 得票从高到低

### 设置

- 每张票最少 / 最多人数
- 当选人数（得票前 N 名）
- 增大候选人卡片字号（适合大屏 / 投影展示）
- 危险操作（均有二次确认）：清空所有选票、删除所有候选人、恢复默认设置

### 配置文件导入导出

- 导出 TXT：仅候选人名单，每行一个姓名
- 导出 JSON：完整配置（候选人 + 设置 + 排序方式）
- 导入 TXT / JSON：一键恢复名单或全部配置；JSON 中未提到的设置会保留当前值

## 技术栈

- [Vue 3](https://vuejs.org/)（Composition API + `<script setup>`）
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) + `vite-plugin-singlefile`（单文件构建）
- [Tailwind CSS v4](https://tailwindcss.com/)（通过 `@tailwindcss/vite` 集成）
- [reka-ui](https://reka-ui.com/)（无样式组件，内置 Dialog / Select / Checkbox 等）
- [lucide-vue-next](https://lucide.dev/) 图标
- [@vueuse/core](https://vueuse.org/)（`useStorage` 本地持久化）

## 快速开始

要求 Node.js `^22.18.0 || >=24.12.0`。

```sh
# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 类型检查 + 生产构建（输出单个 HTML 文件）
npm run build

# 预览生产构建产物
npm run preview

# 仅类型检查
npm run type-check

# 仅构建（跳过类型检查）
npm run build-only
```

构建产物位于 `dist/` 目录下，为单个 HTML 文件，可直接双击打开或部署到任意静态服务器。

## 使用说明

1. 点击右上角「添加候选人」，录入姓名并可选设置颜色，即可加入名单。
2. 在候选人卡片上点击（或勾选复选框）选择本张票支持的人选。
3. 按需求调整勾选人数，点击「下一张票」提交，票数与排名即时更新。
4. 误操作可点击「撤销」按钮回退上一张票。
5. 通过顶部「配置文件」按钮可导出 / 导入名单与完整配置。

## 配置文件格式

导出的 JSON 格式如下（`version` 当前为 `1`）：

```json
{
  "version": 1,
  "candidates": [
    { "name": "张三", "color": "red", "disabled": false },
    { "name": "李四", "color": null, "disabled": false }
  ],
  "settings": {
    "minPerBallot": 1,
    "maxPerBallot": null,
    "electedCount": 1,
    "enlargeFont": false
  },
  "sortMode": "name"
}
```

字段说明：

- `candidates`：候选人数组。`name` 为姓名；`color` 取值 `red` / `orange` / `yellow` / `green` / `cyan` / `blue` / `purple` / `pink`，或 `null`（无色）；`disabled` 为布尔值，表示是否停用。
- `settings.minPerBallot`：每张票最少人数（非负整数）。
- `settings.maxPerBallot`：每张票最多人数（非负整数），`null` 表示不限。
- `settings.electedCount`：当选人数（正整数，得票前 N 名）。
- `settings.enlargeFont`：是否放大候选人卡片字号（布尔值）。
- `sortMode`：排序方式，取值 `name`（拼音/字典序）、`added`（添加顺序）、`votes`（得票从高到低）。

导入时，`candidates` 会整体覆盖现有名单（票数清零）；`settings` 与 `sortMode` 采用字段级合并，文件中未提到的部分保持当前值不变。TXT 文件每行视为一个候选人姓名，空行会被忽略。

## 数据说明

所有数据均保存在浏览器本地 `localStorage`（键名以 `easy-vote:` 为前缀），不会上传到任何服务器。清除浏览器站点数据会同时清空应用数据，如需保留可先导出配置文件。

## 项目结构

```
src/
├── App.vue                     # 应用根组件（页面编排、弹窗状态管理）
├── main.ts                     # 入口
├── composables/
│   └── useVoting.ts            # 核心投票逻辑（候选人、唱票、排名、持久化）
├── components/
│   ├── AppHeader.vue           # 顶部工具栏与状态栏
│   ├── CandidateCard.vue       # 候选人卡片（排名、得票、当选标记）
│   ├── CandidateDialog.vue     # 添加 / 编辑候选人弹窗
│   ├── ConfigDialog.vue        # 配置文件导入导出弹窗
│   ├── SettingsDialog.vue      # 设置弹窗（含危险操作）
│   ├── ConfirmDialog.vue       # 危险操作二次确认弹窗
│   └── ui/                     # 基于 reka-ui 封装的无样式 UI 组件
└── lib/
    ├── types.ts                # 类型定义（Candidate / Settings 等）
    ├── constants.ts            # 颜色、排序选项与默认设置
    ├── configFile.ts           # 配置文件的序列化与解析
    └── utils.ts                # 通用工具函数
```

