export let _res = (x: string) => x

import { Items } from '../Interface.js'
import { Gens, RainbowGen } from './Gens.js'

export function __GensDirectives() {
	let v: Items<(...args: string[]) => string> = {
		icon: (args) => {
			args =
				args.startsWith('http://') ||
				args.startsWith('https://') ||
				args.startsWith('data:')
					? args
					: _res('icons/' + args)
			return `<div class="icon" style='background-image: url(${args})'></div>`
		},
		auBorder: (args) => Gens(`{[^Y^${args}^a^]^Y}^u`),
		frac: (a, b) => Gens(`{${a}^g^/^Y^${b}^a}^u`),
		rya: (a, b) => Gens(`{${a}^r^/^Y^${b}^a}^u`),
		rb: (args) => Gens(RainbowGen.staticRainbowHTMLRaw(args)),
		rbd: (args) => Gens(RainbowGen.staticRainbowHTMLRaw(args, true)),
		drb0: (args) => Gens(RainbowGen.rainbowHTMLRaw(args)),
		drb1: (args) => Gens(RainbowGen.rainbowHTMLRaw(args, 1)),
		drb2: (args) => Gens(RainbowGen.rainbowHTMLRaw(args, 2)),
		rotx: (args) => `<span class="rotateX">${args}</span>`,
		roty: (args) => `<span class="rotateY">${args}</span>`,
		rotz: (args) => `<span class="rotateZ">${args}</span>`,
	}
	return v
}
