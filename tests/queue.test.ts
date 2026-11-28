import { describe, expect, it } from "vitest"
import { findBody } from "../content_scripts/novel_info"
import { buildQueue, textParser } from "../content_scripts/queue"
import { loadFixture, parseHtml } from "./helpers"

/** HTML 片の body 直下の要素を行として返す */
function lines(html: string): HTMLCollection {
  return parseHtml(html).body.children
}

describe("buildQueue", () => {
  it("1行ずつキューに入れ、前後の空白を取り除く", () => {
    expect(buildQueue(lines("<p>　一行目。</p><p>　二行目。</p>"))).toEqual([
      "一行目。",
      "二行目。",
    ])
  })

  it("ルビが振られている場合はルビで読む", () => {
    expect(
      buildQueue(
        lines(
          "<p>　彼は<ruby>魔法<rp>(</rp><rt>まほう</rt><rp>)</rp></ruby>を使った。</p>",
        ),
      ),
    ).toEqual(["彼はまほうを使った。"])
  })

  it("傍点（ルビが「・」）の場合は元の文字を読む", () => {
    expect(
      buildQueue(
        lines(
          "<p><ruby>傍<rp>(</rp><rt>・</rt><rp>)</rp></ruby><ruby>点<rp>(</rp><rt>・</rt><rp>)</rp></ruby></p>",
        ),
      ),
    ).toEqual(["傍点"])
  })

  it("空行（<br>のみの行）は空文字として入る", () => {
    expect(buildQueue(lines("<p>前</p><p><br /></p><p>後</p>"))).toEqual([
      "前",
      "",
      "後",
    ])
  })

  it("中身のない行はキューに入れない", () => {
    expect(buildQueue(lines("<p>前</p><p></p><p>後</p>"))).toEqual(["前", "後"])
  })

  it("本文ページ全体からキューを作る", () => {
    const body = findBody(loadFixture("episode.html"))

    expect(buildQueue(body!.children)).toEqual([
      "これは一行目の文章です。",
      "彼はまほうを使った。",
      "",
      "「傍点」の例です。",
      "、　、　、",
      "最後の行です。",
    ])
  })
})

describe("textParser", () => {
  it("前後の空白（全角スペースを含む）を取り除く", () => {
    expect(textParser("　 テキスト \n")).toBe("テキスト")
  })

  it.each(["※", "―", "…", "・", "◇"])(
    "区切り文字「%s」を読点に置き換える",
    (c) => {
      expect(textParser(`前${c}${c}後`)).toBe("前、、後")
    },
  )

  it("区切り文字を含まない場合はそのまま返す", () => {
    expect(textParser("普通の文章。")).toBe("普通の文章。")
  })
})
