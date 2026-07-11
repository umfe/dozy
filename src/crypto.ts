// crypto-js 子入口：`import Cryptojs from 'dozy/crypto'`
// 注意：crypto-js 是 CommonJS，无法 tree-shake，用到即全量引入。
export { default } from 'crypto-js'
export { default as Cryptojs } from 'crypto-js'
