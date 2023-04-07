/**
 * URLとページから取得できる情報
 */
type NovelInfo = {
  novelId: string
  episodeNo: number
  subtitle: string
}

type VoiceOption = {
  rate: number
  pitch: number
  volume: number
}

function getNovelInfoFromUrl(): NovelInfo | null {
  const url = window.location.href
  const urlObj = new URL(url)
  const params = urlObj.pathname.split("/").filter((v) => v !== "")
  const novelId = params[0]
  const episodeNo = Number(params[1])

  const subtitle = document.querySelector("p.novel_subtitle")

  if (params.length >= 2 && !isNaN(episodeNo) && subtitle) {
    return {
      novelId: novelId,
      episodeNo: episodeNo,
      subtitle: subtitle.textContent ?? `${novelId}_${episodeNo}`,
    }
  }
  return null
}

class Speaker {
  private queue: string[] = []
  private current: string | null = ""
  public paused: boolean = false
  public initialized: boolean = false
  private speechSynthesizer: SpeechSynthesis = window.speechSynthesis
  private novelInfo: NovelInfo
  private options: VoiceOption = {
    rate: 1,
    pitch: 1,
    volume: 1,
  }

  constructor(honbun: HTMLCollection, novelInfo: NovelInfo) {
    this.createQueue(honbun)
    this.fetchOptions()
    this.novelInfo = novelInfo
  }

  public speak() {
    // console.log(this.paused, this.finnish, this.current)
    if (this.paused || this.finnish || this.current === null) return

    const utterance = new SpeechSynthesisUtterance(this.current)
    this.fetchOptions()
    utterance.volume = this.options.volume
    utterance.rate = this.options.rate
    utterance.pitch = this.options.pitch

    utterance.onend = () => {
      this.next()
      this.speak()
    }

    this.speechSynthesizer.speak(utterance)
  }

  private next() {
    const next = this.queue.shift()
    this.current = next ?? null
  }

  public pause() {
    this.paused = true
    this.speechSynthesizer.pause()
  }

  public resume() {
    this.paused = false
    if (!this.initialized) {
      this.initialized = true
      this.next()
    }
    this.speechSynthesizer.resume()
    this.speak()
  }

  public refresh(honbun: HTMLCollection) {
    this.queue = []
    this.current = ""
    this.paused = false
    this.createQueue(honbun)
    this.speak()
  }

  private createQueue(honbun: HTMLCollection) {
    this.queue = []

    for (let i = 0; i < honbun.length; i++) {
      const node = honbun.item(i)?.childNodes
      if (!node) continue

      const parse: string[] = []

      for (let j = 0; j < node.length; j++) {
        const c = node.item(j)

        if (c.nodeType === Node.TEXT_NODE && c.textContent) {
          parse.push(this.textParser(c.textContent))
          continue
        }

        if (c.nodeName === "BR") {
          parse.push("")
          continue
        }

        if (c.nodeName === "RUBY") {
          const word = c.childNodes[0].textContent
          const ruby = c.childNodes[2].textContent
          if (word && ruby) {
            if (ruby.includes("・")) {
              parse.push(this.textParser(word))
            } else {
              parse.push(this.textParser(ruby))
            }
          }
          continue
        }

        console.warn("skipped text:", c.nodeName)
      }

      if (parse.length > 0) this.queue.push(parse.join(""))
    }
  }

  private textParser(text: string): string {
    const str = text.trim()
    // Divider
    const divChars = ["※", "―", "…", "・", "◇"]
    if (divChars.some((c) => str.includes(c)))
      return divChars.reduce(
        (str, char) => str.replace(new RegExp(char, "g"), "、"),
        str,
      )
    return str
  }

  private fetchOptions() {
    chrome.storage.local.get(["VOLUME", "RATE", "PITCH"], (r) => {
      const volume = Number(r.VOLUME)
      if (r.VOLUME && !isNaN(volume) && volume >= 0 && volume <= 1)
        this.options.volume = volume

      const rate = Number(r.RATE)
      if (r.RATE && !isNaN(rate) && rate >= 0.1 && rate <= 10)
        this.options.rate = rate

      const pitch = Number(r.PITCH)
      if (r.PITCH && !isNaN(pitch) && pitch >= 0 && pitch <= 2)
        this.options.pitch = pitch
    })
  }

  public get finnish() {
    return this.queue.length === 0
  }
}

function load() {
  const novelInfo = getNovelInfoFromUrl()
  if (novelInfo === null) return

  const honbun = document.querySelector("div#novel_honbun")?.children
  if (!honbun) return
  const speaker = new Speaker(honbun, novelInfo)

  const button = document.createElement("button")
  button.id = "na_reader_play_btn"
  button.textContent = "Play"

  const toggleSpeak = () => {
    if (speaker.paused || !speaker.initialized) {
      // 再生する
      speaker.resume()
      button.textContent = "Stop"
    } else {
      // 一時停止する
      speaker.pause()
      button.textContent = "Play"
    }
  }

  button.addEventListener("click", toggleSpeak)
  window.addEventListener("beforeunload", () => {
    document.removeEventListener("click", toggleSpeak)
  })

  const targetElement = document.querySelector("p.novel_subtitle")
  if (targetElement) targetElement.appendChild(button)
}

load()
