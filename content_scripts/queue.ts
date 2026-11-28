/**
 * 本文の行要素（`<p>` など）から、読み上げる文字列のキューを作る
 */
export function buildQueue(lines: HTMLCollection | Element[]): string[] {
  const queue: string[] = []

  for (const line of Array.from(lines)) {
    const nodes = line.childNodes
    const parse: string[] = []

    for (let j = 0; j < nodes.length; j++) {
      const c = nodes.item(j)

      if (c.nodeType === Node.TEXT_NODE && c.textContent) {
        parse.push(textParser(c.textContent))
        continue
      }

      if (c.nodeName === "BR") {
        parse.push("")
        continue
      }

      if (c.nodeName === "RUBY") {
        const word = c.childNodes[0]?.textContent
        const ruby = c.childNodes[2]?.textContent
        if (word && ruby) {
          if (ruby.includes("・")) {
            // 傍点はルビではなく元の文字を読む
            parse.push(textParser(word))
          } else {
            parse.push(textParser(ruby))
          }
        }
        continue
      }

      console.warn("skipped text:", c.nodeName)
    }

    if (parse.length > 0) queue.push(parse.join(""))
  }

  return queue
}

/**
 * 読み上げ用にテキストを整形する
 */
export function textParser(text: string): string {
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
