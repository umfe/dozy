// export type LogFilter = (msg: string) => boolean // true means filter out

import { $loadOpt } from './Functions'

export type DozyConfigItem = {}
export type DozyConfig = Partial<DozyConfigItem>
class Dozy {
	loadConfig(config: DozyConfig) {
		$loadOpt(this.config, config)
	}
	config: DozyConfig = {}
}
export const dozy = new Dozy()
