let mainForm, statusBox, availableProxiesSelect, activeProxiesSelect, addButton,
  removeButton, saveButton, searchInput, customForm, customNameInput,
  customURLInput, customAddButton

const availableProxies = new Map()
const activeProxies = new Map()

async function main() {
  statusBox = document.getElementById('status')

  mainForm = document.getElementById('main-form')
  availableProxiesSelect = document.getElementById('available-proxies')
  activeProxiesSelect = document.getElementById('active-proxies')
  addButton = document.getElementById('add-button')
  removeButton = document.getElementById('remove-button')
  searchInput = document.getElementById('search')
  saveButton = document.getElementById('save-button')

  customForm = document.getElementById('custom-form')
  customNameInput = document.getElementById('custom-name')
  customURLInput = document.getElementById('custom-url')
  customAddButton = document.getElementById('custom-add')

  mainForm.addEventListener('submit', onFormSubmit)
  addButton.addEventListener('click', onAddClick)
  removeButton.addEventListener('click', onRemoveClick)
  searchInput.addEventListener('input', updateLists)

  customForm.addEventListener('submit', onCustomSubmit)

  setFormDisabled(true)

  await updateProxies()
  await restoreOptions()

  updateLists()

  setFormDisabled(false)
}

function setStatus(text) {
  statusBox.innerText = text
}

function setFormDisabled(disabled) {
  const inputs = [
    availableProxiesSelect,
    activeProxiesSelect,
    addButton,
    removeButton,
    searchInput,
    saveButton,
    customNameInput,
    customURLInput,
    customAddButton,
  ]
  for (let input of inputs) {
    input.disabled = disabled
  }
}

async function restoreOptions() {
  const proxies = await loadProxies()

  activeProxies.clear()
  for (const { url, name } of proxies) {
    activeProxies.set(url, name)
  }
}

function onAddClick() {
  for (let option of availableProxiesSelect.selectedOptions) {
    activeProxies.set(option.value, option.text)
  }

  availableProxiesSelect.selectedIndex = -1
  searchInput.value = ''

  updateLists()
}

function onRemoveClick() {
  for (let option of activeProxiesSelect.selectedOptions) {
    activeProxies.delete(option.value)
  }

  activeProxiesSelect.selectedIndex = -1
  updateLists()
}

async function onFormSubmit(evt) {
  evt.preventDefault()
  setFormDisabled()
  setStatus('Saving options...')

  const proxies = []
  for (const [url, name] of activeProxies.entries()) {
    proxies.push({ name, url })
  }

  try {
    await saveProxies(proxies)
  } catch (err) {
    console.error('failed to save options:', err)
    setStatus('Failed to save options. Please try again later.')
    return
  } finally {
    setFormDisabled(false)
  }

  setStatus('Options saved successfully.')
}

function onCustomSubmit(evt) {
  evt.preventDefault()

  const name = customNameInput.value.trim()
  const url = customURLInput.value.trim()

  if (name.length === 0 || url.length === 0) {
    return
  }

  activeProxies.set(url, name)

  customNameInput.value = ''
  customURLInput.value = ''

  updateLists()
}

async function updateProxies() {
  setStatus('Updating list of proxies...')

  let proxies
  try {
    const response = await fetch('https://libproxy-db.org/proxies.json')
    proxies = await response.json()
  } catch (err) {
    setStatus('Failed to update list of proxies. Please try again later.')
    return
  }

  availableProxies.clear()
  for (const { url, name } of proxies) {
    availableProxies.set(url, name)
  }

  setStatus('Proxy list updated.')
}

function updateLists() {
  clearSelect(availableProxiesSelect)
  clearSelect(activeProxiesSelect)

  for (let [url, name] of availableProxies.entries()) {
    // Filter out active proxies.
    if (activeProxies.has(url)) {
      continue
    }

    // Apply any search term
    const searchTerm = searchInput.value.trim().toLowerCase()
    const haystack = name.toLowerCase()
    if (searchTerm && haystack.indexOf(searchTerm) === -1) {
      continue
    }

    addOption(availableProxiesSelect, name, url)
  }

  for (let [url, name] of activeProxies.entries()) {
    addOption(activeProxiesSelect, name, url)
  }
}

function clearSelect(select) {
  for (let i = select.length - 1; i >= 0; i--) {
    select.remove(i)
  }
}

function addOption(select, name, url) {
  const option = document.createElement('option')

  option.text = name
  option.value = url
  option.title = `${name} - ${url}`

  select.add(option, null)
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
