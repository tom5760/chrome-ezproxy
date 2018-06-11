const DEFAULT_BASE_URL = 'http://www.library.drexel.edu/cgi-bin/r.cgi?url=$@'

async function transformURL(url) {
  const items = await storageGet({ base_url: DEFAULT_BASE_URL })
  const base = items.base_url
  const transformedURL = base.replace('$@', url)
  return transformedURL
}

async function copy(text) {
  if (!await requestPermission({ permissions: ['clipboardWrite'] })) {
    return
  }

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

chrome.browserAction.onClicked.addListener(async tab => {
  const newURL = await transformURL(tab.url)
  chrome.tabs.update(tab.id, { url: newURL })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const oldURL = info.linkUrl || tab.url
  const newURL = await transformURL(oldURL)

  switch (info.menuItemId) {
    case 'redirect':
      chrome.tabs.create({ url: newURL })
      break

    case 'copy':
      copy(newURL)
      break
  }
})

chrome.runtime.onInstalled.addListener(async details => {
  // Migrate old format.
  const items = await storageGet({ base_url: null })

  if (!items.base_url) {
    var legacyBase = localStorage.base_url
    if (legacyBase) {
      delete localStorage.base_url
    } else {
      legacyBase = DEFAULT_BASE_URL
    }
    chrome.storage.sync.set({ base_url: legacyBase })
  }
})

chrome.contextMenus.create({
  id: 'redirect',
  title: 'Open link in new tab',
  contexts: ['link'],
})

chrome.contextMenus.create({
  id: 'copy',
  title: 'Copy link',
  contexts: ['browser_action', 'link'],
})
