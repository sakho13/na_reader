import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { load } from "../content_scripts/load"
import { EPISODE_URL, TOP_URL, loadFixture } from "./helpers"

beforeEach(() => {
  // Speaker が設定の読み込みに使う chrome.storage をモックする
  vi.stubGlobal("chrome", { storage: { local: { get: vi.fn() } } })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("load", () => {
  it("本文ページではサブタイトルの直後に再生ボタンを追加する", () => {
    const doc = loadFixture("episode.html")

    const button = load(doc, EPISODE_URL)

    expect(button).not.toBeNull()
    expect(button!.id).toBe("na_reader_play_btn")
    expect(button!.textContent).toBe("Play")

    const title = doc.querySelector("h1.p-novel__title")!
    expect(title.nextElementSibling).toBe(button)
    // 見出しの中には入れない（見出しのテキストやスタイルを汚さない）
    expect(title.contains(button)).toBe(false)
  })

  it("前書き・後書きがあるページでも再生ボタンを追加する", () => {
    const doc = loadFixture("episode_with_preface_afterword.html")

    expect(load(doc, "https://ncode.syosetu.com/n0000aa/2/")).not.toBeNull()
    expect(doc.querySelectorAll("#na_reader_play_btn")).toHaveLength(1)
  })

  it("作品トップページでは再生ボタンを追加しない", () => {
    const doc = loadFixture("novel_top.html")

    expect(load(doc, TOP_URL)).toBeNull()
    expect(doc.querySelector("#na_reader_play_btn")).toBeNull()
  })

  it("本文が見つからないときは警告を出し、再生ボタンを追加しない", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const doc = loadFixture("novel_top.html")

    // 話数付きの URL だが本文が無いページ
    expect(load(doc, EPISODE_URL)).toBeNull()
    expect(doc.querySelector("#na_reader_play_btn")).toBeNull()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("本文が見つかりません"),
    )
  })
})
