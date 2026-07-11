// lodash 子入口：`import { debounce } from 'dozy/lodash'`，可被 tree-shake
export * from 'lodash-es'
// 命名空间导出：`import { l } from 'dozy/lodash'` + `l.debounce()`（用 l 时不可 tree-shake）
export * as l from 'lodash-es'
