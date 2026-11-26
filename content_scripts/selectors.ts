/**
 * 「小説家になろう」の本文ページから要素を取得するためのセレクタ
 *
 * サイトのHTML構造が変わったときはここを修正する
 */
export const SELECTORS = {
  /** 各話のサブタイトル。再生ボタンはこの要素の直後に挿入する */
  subtitle: "p.novel_subtitle",
  /** 本文（前書き・後書きを除く） */
  body: "div#novel_honbun",
} as const
