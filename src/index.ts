export * from './x/Dozy'
export * from './x/Functions'
export * from './x/WebFunctions'
export * from './modules/Store'
export * from './modules/EnableScaler'
export * from './modules/XCode'
export * from './modules/RepoStore'
export * from './modules/Interface'
export * from './modules/gens/Gens'
export * from './modules/gens/GensDirectives'
export * from './modules/Color'

// 第三方重库已拆到独立子入口，避免命名冲突并让 tree-shake / code-splitting 更干净：
//   lodash-es                -> 'dozy/lodash'  (含 l 命名空间)
//   axios                    -> 'dozy/axios'
//   crypto-js                -> 'dozy/crypto'
//   browser-image-compression-> 'dozy/image'

export { nanoid, customAlphabet, urlAlphabet } from 'nanoid'

export const DOZY = '1.0.109'
