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

  if (localStorage.base_url) {
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
  browser.browserAction.setPopup({ popup: '' })

  const proxies = await loadProxies()

  if (proxies.length === 0) {
    return
  }

  browser.contextMenus.create({
    id: 'reload',
    title: 'Reload page',
    contexts: ['browser_action', 'page'],
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


  // Copying and permissions doesn't work from background pages in Firefox, so
  // just hide the copy menu item for now.
  //   https://bugzilla.mozilla.org/show_bug.cgi?id=1422605
  //   https://bugzilla.mozilla.org/show_bug.cgi?id=1272869
  //
  // Also, Chrome doesn't have the getBrowserInfo method right now (Chrome 67).
  let canCopy = true
  if (browser.runtime.getBrowserInfo) {
    const info = await browser.runtime.getBrowserInfo()
    canCopy = info.name !== 'Firefox'
  }

  if (canCopy) {
    browser.contextMenus.create({
      id: 'copy',
      title: 'Copy URL to clipboard',
      contexts: ['link'],
    })
  }

  if (proxies.length > 1) {
    browser.browserAction.setPopup({
      popup: browser.extension.getURL('popup.html')
    })

    for (const proxy of proxies) {
      browser.contextMenus.create({
        parentId: 'reload',
        id: `1.${proxy.url}`,
        title: proxy.name,
        contexts: ['browser_action', 'page'],
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

      if (canCopy) {
        browser.contextMenus.create({
          parentId: 'copy',
          id: `4.${proxy.url}`,
          title: proxy.name,
          contexts: ['link'],
        })
      }
    }
  }
}

async function urlFromMenuInfo(info) {
  // If a top-level menu item was clicked, return the first proxy.
  if (!info.parentMenuItemId) {
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

browser.runtime.onInstalled.addListener(async details => {
  console.info('onInstalled')

  await migrate()
  await updateMenus()
})

browser.storage.onChanged.addListener(async changes => {
  await updateMenus()
})

browser.browserAction.onClicked.addListener(async tab => {
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

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const menuID = info.parentMenuItemId || info.menuItemId
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
      const permissions = ['clipboardWrite']
      browser.permissions.request({ permissions }, granted => {
        if (!granted) {
          console.warn('copy permission denied')
          return
        }
        copyText(newURL)
      })
      break
  }
})
