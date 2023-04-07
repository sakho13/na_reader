# About

## Functions

- 小説のテキストを読み出し、Web speach api で読み上げ
- 読み上げるテキストは一定で区切りキューに追加読み上げる
- ページ遷移するごとにキューはリフレッシュされる
- テキストにはルビなどを表現する形式があります
  - ルビは作品ごとに辞書の形で管理（IndexedDB を使いたいです）
  - その作品で一度登録されたルビと単語のペアが、以降にルビをふらされずに書かれていたらマップにあるルビを適用する
- 対象の URL は "domain/小説 ID/話数" という形になっています
- ページに読み上げのトリガーとなるボタンが追加されます
- ブラウザバーのアイコンをクリックすると読み上げる音声の設定を変えられる
- TypeScript で作りたい

## Directory

```sh
root/
├── content_scripts/
│ ├── content_script.css
│ └── content_script.ts
├── popup/
│ ├── popup.html
│ ├── popup.ts
│ └── popup.css
├── dist/
├── icons/
├── manifest.json
├── package.json
└── tsconfig.json
```
