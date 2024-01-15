if (typeof globalThis.browser === 'undefined') {
	globalThis.browser = chrome
}

export function saveProxies(proxies) {
	return browser.storage.sync.set({ proxies })
}

export async function loadProxies() {
	const items = await browser.storage.sync.get('proxies')
	return items.proxies || []
}

export function transformURL(url, proxy) {
	if (proxy.indexOf('$@') === -1) {
		throw new Error('proxy missing replacement token')
	}
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
		throw new Error('not proxying http or https')
	}

	return proxy.replace('$@', url)
}

export async function openNewTab(url) {
	browser.tabs.create({ url })
}

export async function reloadTab(tab, url) {
	browser.tabs.update(tab.id, { url })
}
