export type LogFilter = (msg: string) => boolean // true means filter out

export type DozyConfigItem = {}
export type DozyConfig = Partial<DozyConfigItem>
class Dozy {
	config: DozyConfigItem = {}
}
export const dozy = new Dozy()
