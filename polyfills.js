/* Wrap some Chrome APIs to return promises instead of using callbacks. */

function requestPermission(options) {
  return new Promise((resolve, reject) =>
    chrome.permissions.request(options, resolve))
}

function storageGet(keys) {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(keys, items => {
      if (chrome.extension.lastError) {
        reject(chrome.extension.lastError)
      } else {
        resolve(items)
      }
    })
  )
}

function storageSet(keys) {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.set(keys, () => {
      if (chrome.extension.lastError) {
        reject(chrome.extension.lastError)
      } else {
        resolve()
      }
    })
  )
}
