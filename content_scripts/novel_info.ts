import { SELECTORS } from "./selectors"

/**
 * URLとページから取得できる情報
 */
export type NovelInfo = {
  novelId: string
  episodeNo: number
  subtitle: string
}

export function getNovelInfo(url: string, doc: Document): NovelInfo | null {
  const params = new URL(url).pathname.split("/").filter((v) => v !== "")
  const novelId = params[0]
  const episodeNo = Number(params[1])

  // 作品トップ（目次）など、話数を含まないページは対象外
  if (params.length < 2 || isNaN(episodeNo)) return null

  const subtitle = doc.querySelector(SELECTORS.subtitle)
  if (!subtitle) {
    console.warn(
      `[NaReader] サブタイトルが見つかりません: ${SELECTORS.subtitle}`,
    )
    return null
  }

  return {
    novelId: novelId,
    episodeNo: episodeNo,
    subtitle: subtitle.textContent?.trim() || `${novelId}_${episodeNo}`,
  }
}

/**
 * 本文（前書き・後書きを除く）の要素を取得する
 */
export function findBody(doc: Document): Element | null {
  const body = doc.querySelector(SELECTORS.body)
  if (!body) console.warn(`[NaReader] 本文が見つかりません: ${SELECTORS.body}`)
  return body
}
