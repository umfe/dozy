import axios, { AxiosError } from '../axios'
import { errToString, maybeString } from '../x/Functions'
import type { Logger } from './InterTypes/InterType'
import { $createKeyedSingleton } from './Singleton'

export type CreateXRequestOption = {
	logger?: Logger
}

export type XRequestOption = {
	headers?: Record<string, string>
	/** 每次请求的超时秒数，默认 300 秒，支持小数。 */
	timeoutS?: number
	log?: string
	logResult?: boolean
	/** 最多尝试次数，包含首次请求，默认 13 次。 */
	retryTimes?: number
	logMaxLen?: number
}

const DEFAULT_TIMEOUT_S = 5 * 60
const REQUEST_TIMES = 13

/**
 * 创建带重试的 GET 请求函数，日志交给配置中可选的 Logger。
 * Logger 支持同步或异步；消息第一行是 URL，之后是请求日志。
 * 未提供 Logger 或未产生日志时不输出，日志输出失败不影响请求结果。
 */
export function $createXRequest(options?: CreateXRequestOption) {
	const logger = options?.logger
	const getAxios = $createKeyedSingleton((timeoutS: number) => {
		return axios.create({
			timeout: timeoutS * 1000,
			// 沿用现有压缩限制，规避部分运行环境中的 Brotli 解压错误。
			headers: { 'Accept-Encoding': 'gzip, deflate' },
		})
	})

	return async <T = any>(
		url: string,
		options?: XRequestOption,
	): Promise<{ data?: T; error: string }> => {
		const headers = options?.headers ?? {}
		const timeoutS = options?.timeoutS ?? DEFAULT_TIMEOUT_S
		let log = options?.log ?? ''
		const logResult = !!options?.logResult
		let retryTimes = options?.retryTimes ?? REQUEST_TIMES
		const logMaxLen = options?.logMaxLen
		const a = getAxios(timeoutS)
		let error = ''
		let data: T | undefined = undefined

		for (let attempt = 1; attempt <= retryTimes; attempt++) {
			try {
				const { origin } = new URL(url)
				const response = await a.get<T>(url, {
					headers: {
						...headers,
						'User-Agent': generateRandomUA(),
						Origin: origin,
						Referer: origin,
					},
				})
				data = response.data
				error = ''
				if (attempt > 1) log += `/succeeded_at_attempt_${attempt}`
				break
			} catch (err) {
				const thisErr = errToString(err)
				error = thisErr
				log += `/attempt_${attempt}:${thisErr}`
				if (err instanceof AxiosError) {
					log += maybeString(err.response?.data, logMaxLen ?? 40)
					const status = err.response?.status
					if (status === 400 || status === 404 || status === 401) {
						// 不能把调用方指定的更小尝试上限扩大到 4 次。
						retryTimes = Math.min(retryTimes, 4)
					}
				}
				if (attempt < retryTimes) {
					const delay = getRetryDelay(attempt)
					log += `\n/retry_in_${delay}ms`
					await sleep(delay)
				}
			}
		}
		if (logResult && !error) log += '/' + maybeString(data, logMaxLen)

		if (log && logger) {
			// 日志是附带操作，Logger 故障不能让已完成的请求向上抛错。
			try {
				await logger(`${url}\n${log}`)
			} catch {}
		}
		return { data, error }
	}
}

function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomUA(): string {
	const osList = [
		`Windows NT ${randomInt(6, 10)}.${randomInt(0, 3)}`,
		`Macintosh; Intel Mac OS X 10_${randomInt(10, 15)}_${randomInt(0, 7)}`,
		`X11; Linux x86_64`,
		`Linux; Android ${randomInt(10, 13)}; SM-${String.fromCharCode(
			65 + randomInt(0, 25),
		)}${randomInt(900, 999)}B`,
	]
	const os = osList[randomInt(0, osList.length - 1)]
	const chromeVersion = `${randomInt(100, 117)}.0.${randomInt(4000, 6000)}.${randomInt(0, 200)}`
	const edgeVersion = `${randomInt(100, 117)}.0.${randomInt(200, 1000)}.${randomInt(0, 200)}`
	const firefoxVersion = `${randomInt(100, 116)}.0`
	const browserList = [
		`Chrome/${chromeVersion} Safari/${chromeVersion}`,
		`Edg/${edgeVersion} Chrome/${chromeVersion} Safari/${chromeVersion}`,
		`Firefox/${firefoxVersion}`,
		`Version/${randomInt(12, 17)}.0 Safari/${chromeVersion}`,
	]
	const browser = browserList[randomInt(0, browserList.length - 1)]
	return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}`
}

function sleep(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function getRetryDelay(attempt: number): number {
	const base = 40
	let backoff: number
	if (attempt <= 4) {
		backoff = 70
	} else {
		const c = attempt - 4
		backoff = base * Math.pow(2, c)
	}
	const jitter = Math.floor(Math.random() * 40)
	return backoff + jitter
}
