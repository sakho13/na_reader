import { getNovelInfo } from "./novel_info"
import { buildQueue } from "./queue"
import { SELECTORS } from "./selectors"
import { Speaker } from "./speaker"

/**
 * 本文ページに再生ボタンを追加する
 *
 * @returns 追加したボタン。対象外のページや要素が見つからない場合は `null`
 */
export function load(doc: Document, url: string): HTMLButtonElement | null {
  const novelInfo = getNovelInfo(url, doc)
  if (novelInfo === null) return null

  const body = doc.querySelector(SELECTORS.body)
  if (!body) {
    console.warn(`[NaReader] 本文が見つかりません: ${SELECTORS.body}`)
    return null
  }
  const speaker = new Speaker(buildQueue(body.children), novelInfo)

  const button = doc.createElement("button")
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

  const targetElement = doc.querySelector(SELECTORS.subtitle)
  if (!targetElement) return null
  targetElement.appendChild(button)

  return button
}
