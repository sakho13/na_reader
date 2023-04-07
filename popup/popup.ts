const SettingParams = ["VOLUME", "RATE", "PITCH"]

// type Settings = {
//   rate: number
//   pitch: number
//   volume: number
// }

function getInputElem(id: string) {
  return document.querySelector<HTMLInputElement>(`#${id}`)
}

function store() {
  const item: { [key: string]: unknown } = {}

  const volumeInput = getInputElem("settings_volume")
  if (volumeInput) {
    const val = Number(volumeInput.value)
    if (!isNaN(val) && val >= 0 && val <= 10) {
      item.VOLUME = val
    } else {
      volumeInput.value = "10"
    }
  }

  const rateInput = getInputElem("settings_rate")
  if (rateInput) {
    const val = Number(rateInput.value)
    if (!isNaN(val) && val >= 0.1 && val <= 10) {
      item.RATE = val
    } else {
      if (!isNaN(val)) {
        rateInput.value = val > 10 ? "10" : "1"
        item.RATE = Number(rateInput.value)
      } else {
        rateInput.value = "1"
      }
    }
  }

  const pitchInput = getInputElem("settings_pitch")
  if (pitchInput) {
    const val = Number(pitchInput.value)
    if (!isNaN(val) && val >= 0 && val <= 2) {
      item.PITCH = val
    } else {
      if (!isNaN(val)) {
        pitchInput.value = val > 2 ? "2" : "1"
        item.PITCH = Number(pitchInput.value)
      } else {
        pitchInput.value = "1"
      }
    }
  }

  chrome.storage.local.set(item)
  chrome.storage.local.get(SettingParams, (r) => {
    console.log(r)
  })
}

function init() {
  const form = document.querySelector<HTMLFormElement>("#settings")
  if (!form) return

  const updBtn = document.querySelector<HTMLButtonElement>("#update_btn")
  if (!updBtn) return

  const volumeInput = getInputElem("settings_volume")
  if (!volumeInput) return
  const rateInput = getInputElem("settings_rate")
  if (!rateInput) return
  const pitchInput = getInputElem("settings_pitch")
  if (!pitchInput) return

  chrome.storage.local.get(SettingParams, (r) => {
    console.log(r)
    if (r.VOLUME) {
      const val = Number(r.VOLUME)
      volumeInput.value = String(!isNaN(val) ? val : 10)
    }

    if (r.RATE) {
      const val = Number(r.RATE)
      rateInput.value = String(!isNaN(val) ? val : 1)
    }

    if (r.PITCH) {
      const val = Number(r.PITCH)
      pitchInput.value = String(!isNaN(val) ? val : 1)
    }
  })

  console.log(volumeInput.value, rateInput.value, pitchInput.value)

  // registration of events
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    store()
  })
  updBtn.addEventListener("click", () => {
    store()
  })
  volumeInput.addEventListener("input", () => {
    volumeInput.value = volumeInput.value
  })
  rateInput.addEventListener("input", () => {
    rateInput.value = rateInput.value
  })
  pitchInput.addEventListener("input", () => {
    pitchInput.value = pitchInput.value
  })
}

init()
