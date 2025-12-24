import { Items } from '../Interface.js'
import { textShadow } from './Gens.js'

export function __GensStyleIds() {
	let v: any = {
		V: 'color: #555555;',
		W: 'color: #AAAAAA;',
		v: 'color: #000000;',
		w: 'color: #FFFFFF;',

		R: 'color: #AA0000;',
		Y: 'color: #FFAA00;',
		G: 'color: #00AA00;',
		A: 'color: #00AAAA;',
		B: 'color: #0000AA;',
		P: 'color: #AA00AA;',

		r: 'color: #FF5555;',
		y: 'color: #FFFF55;',
		g: 'color: #55FF55;',
		a: 'color: #55FFFF;',
		b: 'color: #5555FF;',
		p: 'color: #FF55FF;',

		i: 'color: #FfC0CB;',
		m: 'font-size: 0.833em;',
		M: 'font-size: 1.2em;',
		t: 'font-weight: bold;',
		l: 'font-style: italic;',

		// u: 'font-family: var
		// o: 'font-family: var;',
		// q: 'font-family: var;',

		s: `${textShadow(undefined, true)}`,
		S: 'text-shadow: 0 2px 0 #000',
		c: 'user-select: text',
		C: 'user-select: none',
		// C: 'text-shadow: 0 1px 0 #000;',

		insectnColor: 'background-color: var(--insectnColor);',
		insectnShadow: 'box-shadow: var(--insectnShadow);',
		insectn: '',
		bgctp: 'background-color: var(--tp);',
		noshadow: 'box-shadow: 0 0 0 0;',
		unsectn: '',
		br: 'border-radius: 12px;',
	}

	// numeric style groups: make them 10-per-group
	// 0..9   => color: var(--rb0..rb9)
	// 10..19 => color: #fff; + textShadow(var(--rbN), true)
	// 20..29 => color: var(--rbN); + textShadow(var(--rbN))
	for (let i = 0; i < 10; i++) {
		v[String(i)] = `color: var(--rb${i});`
		v[String(i + 10)] = `color: #fff;${textShadow('var(--rb' + i + ')', true)}`
		v[String(i + 20)] = `color: var(--rb${i});${textShadow('var(--rb' + i + ')')}`
	}

	v.insectn = v.insectnColor + v.insectnShadow + v.br
	v.unsectn = v.bgctp + v.noshadow
	return <Items<string>>v
}
