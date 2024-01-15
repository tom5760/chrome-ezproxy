import {
	loadProxies,
	reloadTab,
	transformURL,
} from './shared.js'

if (typeof globalThis.browser === 'undefined') {
	globalThis.browser = chrome
}

async function main() {
	const list = document.getElementById('proxy-list')
	const proxies = await loadProxies()

	for (const proxy of proxies) {
		const button = document.createElement('button')
		button.type = 'button'
		button.innerText = proxy.name
		button.title = proxy.url
		button.value = proxy.url

		button.addEventListener('click', onClick)

		list.appendChild(button)
	}
}

async function onClick(evt) {
	const tabs = await browser.tabs.query({ active: true, currentWindow: true })
	if (tabs.length !== 1) {
		console.error('failed to get current tab')
		return
	}
	const tab = tabs[0]

	const proxy = evt.target.value
	const oldURL = tab.url
	const newURL = transformURL(oldURL, proxy)

	await reloadTab(tab, newURL)

	window.close()
}

main()
