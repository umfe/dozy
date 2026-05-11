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

export * from 'browser-image-compression'
export { default as imageCompression } from 'browser-image-compression'

export * from 'axios'
export { default as axios } from 'axios'

import * as l from 'lodash-es'
export { l }

export { default as Cryptojs } from 'crypto-js'
// import('crypto-js').then((mod) => {
// 	console.log('Loaded crypto-js AES module:', mod.default.AES)
// })

export { nanoid, customAlphabet, urlAlphabet } from 'nanoid'

export const DOZY = '1.0.83'
