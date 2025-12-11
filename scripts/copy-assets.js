import { cp } from 'fs/promises'
import { resolve } from 'path'

// 源目录和目标目录
const srcDir = resolve(process.cwd(), 'src/assets')
const destDir = resolve(process.cwd(), 'dist/assets')

async function copyAssets() {
	try {
		await cp(srcDir, destDir, { recursive: true })
		console.log(`Assets copied from ${srcDir} to ${destDir}`)
	} catch (err) {
		console.error('Failed to copy assets:', err)
		process.exit(1)
	}
}

copyAssets()
