/**
 * 按 key 懒创建并缓存实例，相同 key 返回同一个实例。
 * factory 抛错时不缓存，下次调用会重新尝试创建。
 */
export function $createKeyedSingleton<T, K = string>(factory: (key: K) => T): (key: K) => T {
	const cache = new Map<K, T>()

	return (key: K) => {
		// 使用 has 判断，避免 undefined、false 等合法返回值导致重复创建。
		if (!cache.has(key)) {
			cache.set(key, factory(key))
		}
		return cache.get(key)!
	}
}
