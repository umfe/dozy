#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const javascriptObfuscator = require('javascript-obfuscator')

const distDir = path.resolve(__dirname, '..', 'dist')
const configPath = path.resolve(__dirname, '..', 'obfuscator.config.json')

function readConfig() {
	try {
		return JSON.parse(fs.readFileSync(configPath, 'utf8'))
	} catch (e) {
		console.warn('Cannot read obfuscator config, using defaults')
		return {}
	}
}

function obfuscateFile(filePath, options) {
	const code = fs.readFileSync(filePath, 'utf8')
	const obfResult = javascriptObfuscator.obfuscate(code, options)
	fs.writeFileSync(filePath, obfResult.getObfuscatedCode(), 'utf8')
	console.log('Obfuscated:', path.relative(process.cwd(), filePath))
}

function walkAndObfuscate(dir, options) {
	const entries = fs.readdirSync(dir, { withFileTypes: true })
	for (const ent of entries) {
		const full = path.join(dir, ent.name)
		if (ent.isDirectory()) {
			walkAndObfuscate(full, options)
			continue
		}
		if (ent.isFile() && full.endsWith('.js')) {
			obfuscateFile(full, options)
		}
	}
}

function main() {
	if (!fs.existsSync(distDir)) {
		console.error('dist directory not found. Run `npm run build:plain` first.')
		process.exitCode = 1
		return
	}
	const options = readConfig()
	console.log('Starting obfuscation with options from', path.relative(process.cwd(), configPath))
	walkAndObfuscate(distDir, options)
	console.log('Obfuscation complete.')
}

main()
