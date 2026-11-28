import type { NovelInfo } from "./novel_info"

type VoiceOption = {
  rate: number
  pitch: number
  volume: number
}

export class Speaker {
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

  constructor(lines: string[], novelInfo: NovelInfo) {
    this.queue = [...lines]
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

  public refresh(lines: string[]) {
    this.queue = [...lines]
    this.current = ""
    this.paused = false
    this.speak()
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
