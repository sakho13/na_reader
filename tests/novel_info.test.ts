import { afterEach, describe, expect, it, vi } from "vitest"
import { findBody, getNovelInfo } from "../content_scripts/novel_info"
import { buildQueue } from "../content_scripts/queue"
import { EPISODE_URL, TOP_URL, loadFixture, parseHtml } from "./helpers"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getNovelInfo", () => {
  it("本文ページから作品ID・話数・サブタイトルを取得する", () => {
    const doc = loadFixture("episode.html")

    expect(getNovelInfo(EPISODE_URL, doc)).toEqual({
      novelId: "n0000aa",
      episodeNo: 1,
      subtitle: "第一話　はじまり",
    })
  })

  it("クエリやハッシュが付いていても取得できる", () => {
    const doc = loadFixture("episode.html")

    expect(
      getNovelInfo("https://ncode.syosetu.com/n0000aa/12/?p=1#L3", doc),
    ).toMatchObject({ novelId: "n0000aa", episodeNo: 12 })
  })

  it("作品トップページでは null を返し、警告は出さない", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const doc = loadFixture("novel_top.html")

    expect(getNovelInfo(TOP_URL, doc)).toBeNull()
    expect(warn).not.toHaveBeenCalled()
  })

  it("サブタイトルが見つからないときは null を返して警告を出す", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const doc = parseHtml("<p>構造が変わったページ</p>")

    expect(getNovelInfo(EPISODE_URL, doc)).toBeNull()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("サブタイトルが見つかりません"),
    )
  })
})

describe("findBody", () => {
  it("本文の要素を取得する", () => {
    const body = findBody(loadFixture("episode.html"))

    expect(body).not.toBeNull()
    expect(body!.children).toHaveLength(6)
  })

  it("前書き・後書きを除いた本文だけを取得する", () => {
    const body = findBody(loadFixture("episode_with_preface_afterword.html"))

    expect(body).not.toBeNull()
    expect(buildQueue(body!.children)).toEqual([
      "本文の一行目です。",
      "本文の二行目です。",
    ])
  })

  it("本文が見つからないときは null を返して警告を出す", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    expect(findBody(loadFixture("novel_top.html"))).toBeNull()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("本文が見つかりません"),
    )
  })
})
