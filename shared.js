function saveProxies(proxies) {
  return browser.storage.sync.set({ proxies })
}

async function loadProxies() {
  const items = await browser.storage.sync.get('proxies')
  return items.proxies || []
}

function transformURL(url, proxy) {
  if (proxy.indexOf('$@') === -1) {
    throw new Error('proxy missing replacement token')
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('not proxying http or https')
  }

  return proxy.replace('$@', url)
}

async function openNewTab(url) {
  browser.tabs.create({ url })
}

async function reloadTab(tab, url) {
  browser.tabs.update(tab.id, { url })
}

function copyText(text) {
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
