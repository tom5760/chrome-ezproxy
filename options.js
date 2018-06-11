let form, statusBox, urlInput, urlSelect, selectRadio, customRadio,
  saveButton

async function main() {
  form = document.getElementById('form')
  statusBox = document.getElementById('status')
  urlInput = document.getElementById('url-input')
  urlSelect = document.getElementById('url-select')
  selectRadio = document.getElementById('select-radio')
  customRadio = document.getElementById('custom-radio')
  saveButton = document.getElementById('save-button')

  form.addEventListener('submit', onFormSubmit)
  selectRadio.addEventListener('click', onModeClick)
  customRadio.addEventListener('click', onModeClick)
  urlSelect.addEventListener('change', onSelectChange)

  setFormDisabled()

  await updateProxies()
  await restoreOptions()

  setFormEnabled()
}

function setStatus(text) {
  statusBox.innerText = text
}

function setFormEnabled() {
  saveButton.disabled = false
  selectRadio.disabled = false
  customRadio.disabled = false

  onModeClick()
}

function setFormDisabled() {
  const inputs = [urlInput, urlSelect, selectRadio, customRadio, saveButton]
  for (let input of inputs) {
    input.disabled = true
  }
}

async function restoreOptions() {
  const items = await storageGet({ base_url: null })
  const baseURL = items.base_url

  if (baseURL) {
    urlInput.value = baseURL
    urlSelect.value = baseURL

    if (urlSelect.value == baseURL) {
      selectRadio.checked = true
    } else {
      customRadio.checked = true
    }
  } else {
    selectRadio.checked = true
    urlSelect.selectedIndex = 0
  }
}

async function onFormSubmit(evt) {
  evt.preventDefault()
  setFormDisabled()
  setStatus('Saving options...')

  try {
    await storageSet({ base_url: urlInput.value })
  } catch (err) {
    console.error('failed to save options:', err)
    setStatus('Failed to save options. Please try again later.')
    return
  } finally {
    setFormEnabled()
  }

  setStatus('Options saved successfully.')
}

function onSelectChange() {
  if (selectRadio.checked) {
    urlInput.value = urlSelect.value
  }
}

function onModeClick() {
  urlSelect.disabled = customRadio.checked
  urlInput.disabled = selectRadio.checked
}

async function updateProxies() {
  setStatus('Updating list of proxies...')

  let proxies
  try {
    const response = await fetch('https://ezproxy-db.appspot.com/proxies.json')
    proxies = await response.json()
  } catch (err) {
    setStatus('Failed to update list of proxies. Please try again later.')
    return
  }

  if (proxies.length === 0) {
    return
  }

  for (let i = urlSelect.length - 1; i >= 0; i--) {
    urlSelect.remove(i)
  }

  for (let proxy of proxies) {
    const option = document.createElement('option')

    option.text = proxy.name
    option.value = proxy.url

    urlSelect.add(option, null)
  }

  setStatus('Proxy list updated.')
}

switch (document.readyState) {
  case 'interactive':
  case 'complete':
    main()
    break

  default:
    document.addEventListener('DOMContentLoaded', main)
    break
}
