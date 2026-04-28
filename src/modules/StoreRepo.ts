import { Octokit } from '@octokit/core'
import {
	$decodeBase64ToBinary,
	$decodeBase64ToUnicode,
	$encodeUnicodeToBase64,
	$formatDate,
	$s,
} from '../x/Functions'
import { $jsonParse, $jsonStringify } from './Store'

type q = any

/**
 * StoreRepo - GitHub 仓库内容存储类
 * 
 * 基于 Octokit 实现的 GitHub 仓库文件操作类，支持文件的增删改查、JSON 序列化存储、
 * 目录列表等功能。所有操作都通过 GitHub REST API v3 的 Contents API 完成。
 * 
 * @remarks
 * - 支持自动处理 Base64 编码/解码（GitHub API 要求文件内容使用 Base64 编码）
 * - 内置冲突重试机制（HTTP 409 冲突时自动重试）
 * - 提供原始模式和文本模式的切换（raw 参数）
 * - 可通过重写 `_prind` 和 `path` 方法实现自定义处理（如加密、路径映射等）
 * 
 * @example
 * ```typescript
 * const repo = new StoreRepo('github-token', 'username', 'repo-name')
 * 
 * // 存储 JSON 数据
 * await repo.putJson('data/config.json', { key: 'value' })
 * 
 * // 读取 JSON 数据
 * const data = await repo.getJson('data/config.json')
 * 
 * // 列出目录
 * const files = await repo.list('data')
 * ```
 */
export class StoreRepo {
	/**
	 * Octokit 实例，用于与 GitHub API 交互
	 * @internal
	 */
	ware: Octokit

	/**
	 * 仓库所有者（用户名或组织名）
	 */
	owner: string

	/**
	 * 仓库名称
	 */
	repo: string

	/**
	 * HTTP 请求头配置
	 * @property {'""'} ['If-None-Match'] - 设置为空字符串以禁用 ETag 缓存，确保获取最新内容
	 * @property {string} ['Cache-Control'] - 可选，用于禁用缓存（当前已注释）
	 */
	headers = {
		// 'Cache-Control': 'no-cache',
		'If-None-Match': '""',
	}

	/**
	 * 内容预处理方法（可重写）
	 * 
	 * 在内容被编码存储前或解码读取后调用，用于对内容进行自定义处理（如加密/解密、压缩/解压等）。
	 * 这是一个钩子方法，子类可以重写以实现特定的内容转换逻辑。
	 * 
	 * @param content - 要处理的内容字符串
	 * @param en - 处理方向：`true` 表示编码（存储前），`false` 表示解码（读取后）
	 * @returns 处理后的内容字符串
	 * 
	 * @remarks
	 * - 默认实现直接返回原内容，不做任何处理
	 * - 当 `en=true` 时，在 Base64 编码之前调用
	 * - 当 `en=false` 时，在 Base64 解码之后调用
	 * 
	 * @example
	 * ```typescript
	 * class EncryptedStoreRepo extends StoreRepo {
	 *   _prind(content: string, en: boolean) {
	 *     return en ? encrypt(content) : decrypt(content)
	 *   }
	 * }
	 * ```
	 */
	_prind(content: string, en: boolean) {
		return content
	}

	/**
	 * 路径处理方法（可重写）
	 * 
	 * 在每次操作路径之前调用，用于对路径进行自定义转换（如添加前缀、路径映射等）。
	 * 这是一个钩子方法，子类可以重写以实现特定的路径处理逻辑。
	 * 
	 * @param path - 原始路径
	 * @returns 处理后的路径
	 * 
	 * @remarks
	 * - 默认实现直接返回原路径，不做任何处理
	 * - 所有公开方法（get、put、del、det、list 等）都会先调用此方法处理路径
	 * 
	 * @example
	 * ```typescript
	 * class PrefixedStoreRepo extends StoreRepo {
	 *   path(path: string) {
	 *     return `data/${path}`
	 *   }
	 * }
	 * ```
	 */
	path(path: string) {
		return path
	}

	/**
	 * 检测文件或目录是否存在
	 * 
	 * @param path - 要检测的文件或目录路径（相对于仓库根目录）
	 * @returns `true` 表示存在，`false` 表示不存在（HTTP 404）
	 * 
	 * @throws {Error} 当遇到非 404 错误时抛出异常（如权限不足、API 限流等）
	 * 
	 * @remarks
	 * - 使用 GitHub API 的 GET contents 端点进行检测
	 * - 仅对 HTTP 404 错误返回 false，其他错误会向上抛出
	 * - 会自动应用 `path()` 方法处理路径
	 * 
	 * @example
	 * ```typescript
	 * if (await repo.det('config.json')) {
	 *   console.log('文件存在')
	 * } else {
	 *   console.log('文件不存在')
	 * }
	 * ```
	 */
	async det(path: string) {
		path = this.path(path)
		try {
			await this.ware.request('GET /repos/{owner}/{repo}/contents/{path}', {
				owner: this.owner,
				repo: this.repo,
				path: path,
				headers: this.headers,
			})
			return true
		} catch (e: q) {
			if (e.status === 404) return false
			throw e
		}
	}

	/**
	 * 获取文件或目录内容
	 * 
	 * @param path - 文件或目录路径（相对于仓库根目录）
	 * @param raw - 原始模式标志
	 *   - `false`（默认）：自动解码 Base64 内容，返回文本字符串或二进制数据
	 *   - `true`：返回 GitHub API 响应的原始 Base64 编码内容
	 * @returns 
	 *   - 当 `raw=true`：返回 Base64 编码的字符串
	 *   - 当 `raw=false` 且内容是文本：返回解码后的 Unicode 字符串（会经过 `_prind` 处理）
	 *   - 当 `raw=false` 且内容是二进制：返回 `ArrayBuffer`
	 *   - 当 `data.content` 为空时：返回完整的 API 响应数据（可能是目录列表或文件元数据）
	 * 
	 * @throws {Error} 当 GitHub API 请求失败时抛出异常（如文件不存在、权限不足等）
	 * 
	 * @remarks
	 * - 文本内容会尝试使用 `$decodeBase64ToUnicode` 解码，失败则使用 `$decodeBase64ToBinary` 解码
	 * - 返回目录列表时，`data.content` 为空，此时返回原始响应数据
	 * - 会自动应用 `path()` 方法处理路径
	 * - 解码后的文本会经过 `_prind(content, false)` 处理
	 * 
	 * @see https://docs.github.com/en/rest/repos/contents
	 * 
	 * @example
	 * ```typescript
	 * // 获取文本文件
	 * const text = await repo.get('README.md')
	 * console.log(text) // 解码后的文本字符串
	 * 
	 * // 获取目录列表（返回原始数据）
	 * const dirData = await repo.get('src')
	 * console.log(dirData) // 数组，包含目录下的文件信息
	 * 
	 * // 获取原始 Base64 内容
	 * const base64 = await repo.get('image.png', true)
	 * ```
	 */
	async get(path: string, raw: boolean = false) {
		path = this.path(path)
		let x = await this.ware.request('GET /repos/{owner}/{repo}/contents/{path}', {
			owner: this.owner,
			repo: this.repo,
			path: path,
			headers: this.headers,
		})
		let data = <q>x.data
		if (raw) return data.content
		if (!$s(data.content)) return data
		try {
			let t = $decodeBase64ToUnicode(data.content)
			return this._prind(t, false)
		} catch (e) {}
		return $decodeBase64ToBinary(data.content)
	}

	/**
	 * 生成提交信息（commit message）
	 * 
	 * @returns 格式化的日期时间字符串，用作 Git 提交信息
	 * 
	 * @remarks
	 * - 使用 `$formatDate` 格式化当前时间
	 * - 每次调用都会生成新的时间戳
	 * - 可以通过重写此方法自定义提交信息格式
	 * 
	 * @example
	 * ```typescript
	 * class CustomMsgStoreRepo extends StoreRepo {
	 *   msg() {
	 *     return `Update at ${new Date().toISOString()}`
	 *   }
	 * }
	 * ```
	 */
	msg() {
		return $formatDate(new Date())
	}

	/**
	 * 创建或更新文件内容
	 * 
	 * @param path - 文件路径（相对于仓库根目录）
	 * @param content - 要存储的内容（字符串）
	 * @param raw - 原始模式标志
	 *   - `false`（默认）：将内容视为文本，经过 `_prind` 处理后 Base64 编码再存储
	 *   - `true`：假定 content 已经是 Base64 编码，直接存储（跳过编码步骤）
	 * @returns 无返回值
	 * 
	 * @throws {Error} 当遇到非 409 错误时抛出异常（如权限不足、API 限流等）
	 * 
	 * @remarks
	 * - **冲突处理**：当遇到 HTTP 409（冲突）错误时，会自动重试一次（递归调用自身）
	 * - **SHA 处理**：如果文件已存在，会自动获取其 SHA 值用于 API 调用（GitHub API 要求提供 SHA 以更新文件）
	 * - **编码流程**：非 raw 模式下，内容会先经过 `_prind(content, true)` 处理，然后 Base64 编码
	 * - **空文件检测**：使用 `det()` 方法检查文件是否存在，不存在时 sha 为 undefined（创建新文件）
	 * - 会自动应用 `path()` 方法处理路径
	 * 
	 * @see https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
	 * 
	 * @example
	 * ```typescript
	 * // 存储文本文件
	 * await repo.put('hello.txt', 'Hello, World!')
	 * 
	 * // 存储 JSON（推荐用 putJson）
	 * await repo.put('data.json', JSON.stringify({ a: 1 }))
	 * 
	 * // 存储原始 Base64 内容
	 * const base64 = btoa('binary data')
	 * await repo.put('data.bin', base64, true)
	 * ```
	 */
	async put(path: string, content: string, raw: boolean = false) {
		let srcPath = path
		let srcContent = content
		path = this.path(path)
		try {
			let sha: undefined | string = undefined
			if (await this.det(srcPath)) sha = (<q>(
					await this.ware.request('GET /repos/{owner}/{repo}/contents/{path}', {
						owner: this.owner,
						repo: this.repo,
						path: path,
						headers: this.headers,
					})
				).data).sha
			if (!raw) {
				content = this._prind(content, true)
				content = $encodeUnicodeToBase64(content)
			}
			await this.ware.request('PUT /repos/{owner}/{repo}/contents/{path}', {
				owner: this.owner,
				repo: this.repo,
				path: path,
				message: this.msg(),
				headers: this.headers,
				content,
				sha,
			})
		} catch (e: q) {
			if (e.status === 409) {
				await this.put(srcPath, srcContent, raw)
			} else throw e
		}
	}

	/**
	 * 删除文件或目录
	 * 
	 * @param path - 要删除的文件或目录路径（相对于仓库根目录）
	 * @returns 无返回值
	 * 
	 * @throws {Error} 当遇到非 409 错误时抛出异常（如权限不足、API 限流等）
	 * 
	 * @remarks
	 * - **幂等性**：如果文件不存在（通过 `det()` 检测），方法会直接返回，不会报错
	 * - **冲突处理**：当遇到 HTTP 409（冲突）错误时，会自动重试一次（递归调用自身）
	 * - **SHA 要求**：GitHub API 删除文件需要提供文件的 SHA 值，此方法会自动获取
	 * - **目录删除**：GitHub API 不支持直接删除目录，需要递归删除目录下的所有文件
	 * - 会自动应用 `path()` 方法处理路径
	 * 
	 * @see https://docs.github.com/en/rest/repos/contents#delete-a-file
	 * 
	 * @example
	 * ```typescript
	 * // 删除文件
	 * await repo.del('old-file.txt')
	 * 
	 * // 删除不存在的文件（不会报错）
	 * await repo.del('non-existent.txt')
	 * ```
	 */
	async del(path: string) {
		let srcPath = path
		path = this.path(path)
		try {
			if (!(await this.det(srcPath))) return
			let sha = (<q>(
				await this.ware.request('GET /repos/{owner}/{repo}/contents/{path}', {
					owner: this.owner,
					repo: this.repo,
					path: path,
					headers: this.headers,
				})
			).data).sha
			await this.ware.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
				owner: this.owner,
				repo: this.repo,
				path: path,
				headers: this.headers,
				message: this.msg(),
				sha,
			})
		} catch (e: q) {
			if (e.status === 409) {
				await this.del(srcPath)
			} else throw e
		}
	}

	/**
	 * 安全获取 JSON 数据（忽略 404 错误）
	 * 
	 * 与 `getJson` 类似，但当文件不存在（HTTP 404）时不会抛出异常，而是返回 undefined。
	 * 适用于不确定文件是否存在的场景。
	 * 
	 * @param path - JSON 文件路径（相对于仓库根目录）
	 * @returns 
	 *   - 解析后的 JSON 对象（成功时）
	 *   - `undefined`（当文件不存在，即 HTTP 404 时）
	 * 
	 * @throws {Error} 当遇到非 404 错误时抛出异常（如权限不足、JSON 解析错误等）
	 * 
	 * @remarks
	 * - 仅在 HTTP 状态码为 404 时静默失败，其他错误会正常抛出
	 * - 内部调用 `getJson` 方法，因此会经过 Base64 解码和 `_prind` 处理
	 * 
	 * @example
	 * ```typescript
	 * // 安全读取，文件可能不存在
	 * const config = await repo.c_getJson('config.json')
	 * if (config) {
	 *   console.log('配置已加载', config)
	 * } else {
	 *   console.log('配置文件不存在，使用默认配置')
	 * }
	 * ```
	 */
	async c_getJson(path: string) {
		try {
			return await this.getJson(path)
		} catch (error: q) {
			if (error.status !== 404) throw error
		}
	}

	/**
	 * 获取并解析 JSON 数据
	 * 
	 * 从仓库读取文件内容，并使用 `$jsonParse` 解析为 JSON 对象。
	 * 
	 * @param path - JSON 文件路径（相对于仓库根目录）
	 * @returns 解析后的 JSON 对象（类型由调用者指定）
	 * 
	 * @throws {Error} 当文件不存在、读取失败或 JSON 解析失败时抛出异常
	 * 
	 * @remarks
	 * - 内部调用 `get()` 方法获取内容，因此会经过 Base64 解码和 `_prind` 处理
	 * - 使用 `$jsonParse` 进行解析（可能包含自定义的 JSON 解析逻辑，如日期恢复等）
	 * - 如果文件内容不是有效的 JSON，会抛出异常
	 * 
	 * @example
	 * ```typescript
	 * interface Config {
	 *   theme: string
	 *   version: number
	 * }
	 * 
	 * const config = await repo.getJson<Config>('config.json')
	 * console.log(config.theme)
	 * ```
	 */
	async getJson(path: string) {
		let a = <q>await this.get(path)
		try {
			return $jsonParse(a)
		} catch (error) {
			throw error
		}
	}

	/**
	 * 将对象序列化为 JSON 并存储到仓库
	 * 
	 * 使用 `$jsonStringify` 将对象序列化为 JSON 字符串，然后调用 `put` 方法存储。
	 * 这是存储结构化数据（对象、数组等）的便捷方法。
	 * 
	 * @param path - 目标文件路径（相对于仓库根目录）
	 * @param content - 要存储的对象（会被序列化为 JSON）
	 * @returns `put` 方法的返回值
	 * 
	 * @throws {Error} 当序列化失败或存储失败时抛出异常
	 * 
	 * @remarks
	 * - 使用 `$jsonStringify` 进行序列化（可能包含自定义的 JSON 序列化逻辑，如日期处理等）
	 * - 默认以文本模式存储（非 raw），会经过 Base64 编码
	 * - 推荐使用此方法而非手动 `JSON.stringify` + `put`，以保持序列化逻辑一致
	 * 
	 * @example
	 * ```typescript
	 * // 存储对象
	 * await repo.putJson('user.json', {
	 *   name: 'Alice',
	 *   age: 30,
	 *   tags: ['developer', 'designer']
	 * })
	 * 
	 * // 读取回来
	 * const user = await repo.getJson('user.json')
	 * ```
	 */
	async putJson(path: string, content: Object) {
		return await this.put(path, $jsonStringify(content))
	}

	/**
	 * 列出目录下的文件和子目录
	 * 
	 * 获取指定路径的内容列表，返回精简的文件信息数组。
	 * 
	 * @param path - 目录路径（相对于仓库根目录）
	 * @returns 
	 *   - 成功时：包含文件信息的数组，每个元素包含 `name`、`path`、`type` 属性
	 *   - 如果路径不是目录或获取失败：返回 `undefined`
	 * 
	 * @throws {Error} 当 GitHub API 请求失败时抛出异常
	 * 
	 * @remarks
	 * - 返回的 `type` 字段可能是 `'file'`、`'dir'` 或 `'symlink'`
	 * - 返回的 `path` 是文件的完整路径（相对于仓库根目录）
	 * - 如果路径指向文件而非目录，GitHub API 返回的不是数组，此时方法返回 undefined
	 * - 会自动应用 `path()` 方法处理路径
	 * 
	 * @see https://docs.github.com/en/rest/repos/contents#get-contents
	 * 
	 * @example
	 * ```typescript
	 * // 列出目录内容
	 * const files = await repo.list('src')
	 * if (files) {
	 *   for (const file of files) {
	 *     console.log(`${file.type}: ${file.name} (${file.path})`)
	 *   }
	 * }
	 * 
	 * // 过滤只显示文件
	 * const onlyFiles = files?.filter(f => f.type === 'file')
	 * ```
	 */
	async list(path: string) {
		let a = <q>await this.get(path)
		if (!(a instanceof Array)) return
		return a.map((v) => ({
			name: v.name,
			path: v.path,
			type: v.type,
		}))
	}

	/**
	 * 创建 StoreRepo 实例
	 * 
	 * @param x0 - GitHub Personal Access Token（个人访问令牌）
	 *   - 需要具有对目标仓库的读写权限
	 *   - 可在 https://github.com/settings/tokens 创建
	 * @param user - 仓库所有者（用户名或组织名）
	 * @param repo - 仓库名称
	 * 
	 * @remarks
	 * - 初始化时会创建 Octokit 实例，用于后续的 API 调用
	 * - Token 会通过 `auth` 配置传递给 Octokit
	 * - 确保 Token 具有 `repo` 或 `contents:write` 权限
	 * 
	 * @example
	 * ```typescript
	 * // 基本用法
	 * const repo = new StoreRepo(
	 *   'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // GitHub Token
	 *   'myusername',                                // 所有者
	 *   'my-repo'                                    // 仓库名
	 * )
	 * 
	 * // 组织仓库
	 * const orgRepo = new StoreRepo(
	 *   process.env.GITHUB_TOKEN,
	 *   'my-organization',
	 *   'org-repo'
	 * )
	 * ```
	 */
	constructor(x0: string, user: string, repo: string) {
		this.ware = new Octokit({ auth: x0 })
		this.owner = user
		this.repo = repo
	}
}
