import {
	loadProxies,
	openNewTab,
	reloadTab,
	saveProxies,
	transformURL,
} from './shared.js'

if (typeof globalThis.browser === 'undefined') {
	globalThis.browser = chrome
}

async function migrate() {
	const items = await browser.storage.sync.get(['proxies', 'base_url'])
	if (items.proxies) {
		console.info('up to date')
		// We are up to date.
		return
	}

	if (items.base_url) {
		console.info('migrated from base_url')
		// Migrate to new format.
		await saveProxies([{ name: items.base_url, url: items.base_url }])
		await browser.storage.sync.remove('base_url')
		return
	}

	if (localStorage && localStorage.base_url) {
		console.info('migrated from localStorage base_url')
		// Migrate to new format.
		await saveProxies([{
			name: localStorage.base_url,
			url: localStorage.base_url,
		}])
		delete localStorage.base_url
		return
	}

	console.info('no stored data')
}

async function updateMenus() {
	browser.contextMenus.removeAll()
	browser.action.setPopup({ popup: '' })

	const proxies = await loadProxies()

	if (proxies.length === 0) {
		return
	}

	browser.contextMenus.create({
		id: 'reload',
		title: 'Reload page with EZProxy',
		contexts: ['page'],
		documentUrlPatterns: ['http://*/*', 'https://*/*'],
	})

	browser.contextMenus.create({
		id: 'open',
		title: 'Open link',
		contexts: ['link'],
	})

	browser.contextMenus.create({
		id: 'open_new',
		title: 'Open link in new tab',
		contexts: ['link'],
	})

	browser.contextMenus.create({
		id: 'copy',
		title: 'Copy URL to clipboard',
		contexts: ['link'],
	})

	if (proxies.length > 1) {
		browser.action.setPopup({
			popup: browser.runtime.getURL('popup.html')
		})

		for (const proxy of proxies) {
			browser.contextMenus.create({
				parentId: 'reload',
				id: `1.${proxy.url}`,
				title: proxy.name,
				contexts: ['page'],
			})

			browser.contextMenus.create({
				parentId: 'open',
				id: `2.${proxy.url}`,
				title: proxy.name,
				contexts: ['link'],
			})

			browser.contextMenus.create({
				parentId: 'open_new',
				id: `3.${proxy.url}`,
				title: proxy.name,
				contexts: ['link'],
			})

			browser.contextMenus.create({
				parentId: 'copy',
				id: `4.${proxy.url}`,
				title: proxy.name,
				contexts: ['link'],
			})
		}
	}
}

async function urlFromMenuInfo(info) {
	// If a top-level menu item was clicked, return the first proxy.
	if (typeof info.parentMenuItemId !== 'string') {
		const proxies = await loadProxies()
		if (proxies.length === 0) {
			throw new Error('no proxy defined')
		}
		return proxies[0].url
	}

	// Otherwise, the URL is encoded in the sub-menu ID. Slice off the digit
	// prefix to recover.
	return info.menuItemId.substr(2)
}

function doCopyText(text) {
	const input = document.createElement('input')
	try {
		document.body.appendChild(input)

		input.value = text
		input.focus()
		input.select()

		document.execCommand('copy')
	} finally {
		input.remove()
	}
}

function copyText(text, tabId) {
	// This function runs in the context of a Service Worker.  We don't have
	// access to `document` here, which we need to interact with the clipboard.
	// Thus, we have to inject the actual function in the currently active tab.
	browser.scripting.executeScript({
		target: { tabId },
		func: doCopyText,
		args: [text],
	})
}

browser.runtime.onInstalled.addListener(async details => {
	console.info('onInstalled')

	await migrate()
	await updateMenus()
})

browser.storage.onChanged.addListener(async changes => {
	await updateMenus()
})

browser.action.onClicked.addListener(async tab => {
	const proxies = await loadProxies()
	if (proxies.length === 0) {
		browser.runtime.openOptionsPage()
		return
	}

	const proxy = proxies[0].url
	const oldURL = tab.url
	const newURL = transformURL(oldURL, proxy)

	reloadTab(tab, newURL)
})

async function onContextMenuClicked(info, tab) {
	let menuID = info.parentMenuItemId

	if (typeof menuID !== 'string') {
		menuID = info.menuItemId
	}

	const oldURL = info.linkUrl || tab.url

	const proxy = await urlFromMenuInfo(info)
	const newURL = transformURL(oldURL, proxy)

	switch (menuID) {
		case 'reload':
		case 'open':
			reloadTab(tab, newURL)
			break

		case 'open_new':
			openNewTab(newURL)
			break

		case 'copy':
			copyText(newURL, tab.id)
			break
	}
}

browser.contextMenus.onClicked.addListener((info, tab) => {
	const menuID = info.parentMenuItemId || info.menuItemId

	// The permissions.request call doesn't work if this function is async, so
	// do the permissions request here before calling it.

	if (menuID === 'copy') {
		const permissions = ['clipboardWrite']
		browser.permissions.request({ permissions }, granted => {
			if (!granted) {
				console.warn('copy permission denied')
				return
			}

			onContextMenuClicked(info, tab)
		})
	} else {
		onContextMenuClicked(info, tab)
	}
})
