import { readFileSync } from "node:fs"
import { resolve } from "node:path"

export const EPISODE_URL = "https://ncode.syosetu.com/n0000aa/1/"
export const TOP_URL = "https://ncode.syosetu.com/n0000aa/"

/**
 * tests/fixtures 以下の HTML を Document として読み込む
 */
export function loadFixture(name: string): Document {
  const html = readFileSync(
    resolve(import.meta.dirname, "fixtures", name),
    "utf8",
  )
  return new DOMParser().parseFromString(html, "text/html")
}

/**
 * HTML 片を Document として読み込む
 */
export function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html")
}
