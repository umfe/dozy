export type LogFilter = (msg: string) => boolean // true means filter out

export type DozyConfigItem = { logFilters: LogFilter[] }
export type DozyConfig = Partial<DozyConfigItem>
class Dozy {
	config: DozyConfigItem = { logFilters: [] }
	setFilters(filters: LogFilter[]) {
		this.config.logFilters = filters
	}
}
export const dozy = new Dozy()
