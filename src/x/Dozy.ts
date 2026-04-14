// export type LogFilter = (msg: string) => boolean // true means filter out

import { $loadOpt } from './Functions'

export type DozyConfigItem = {}
export type DozyConfig = Partial<DozyConfigItem>
class Dozy {
	/**
	 * 将用户传入的配置合并到当前运行时配置对象中。
	 *
	 * 行为说明：
	 * - 通过 `$loadOpt` 逐字段合并。
	 * - 当两边字段都是对象时，会继续执行嵌套合并。
	 * - 现有属性可能会被新值覆盖。
	 *
	 * @param config 要合并进 `this.config` 的部分配置对象。
	 * @returns 无返回值；内部 `config` 会被原地更新。
	 */
	loadConfig(config: DozyConfig) {
		$loadOpt(this.config, config)
	}
	config: DozyConfig = {}
}
export const dozy = new Dozy()
