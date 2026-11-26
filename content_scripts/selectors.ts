/**
 * 「小説家になろう」の本文ページから要素を取得するためのセレクタ
 *
 * サイトのHTML構造が変わったときはここを修正する
 * （2024年9月のリニューアル後の構造に対応）
 */
export const SELECTORS = {
  /** 各話のサブタイトル。再生ボタンはこの要素の直後に挿入する */
  subtitle: "h1.p-novel__title",
  /** 本文（前書き・後書きを除く） */
  body: ".p-novel__text:not(.p-novel__text--preface):not(.p-novel__text--afterword)",
} as const
