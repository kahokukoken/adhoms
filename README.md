# ADHOMS

**Adaptive Homeostasis Management System**

## 現在の開発対象：Ver1

物語・人物への愛着・Ver2への接続を優先し、軽量シミュレーションで5年間の実証を支えます。現行仕様はNotion、実装と検証記録はGitHubで管理します。

- 開発開始時：[現行仕様・開発ハブ](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef) → [実装対応表](docs/ver1/current-spec.md) → [開発手順](AGENTS.md)
- 開発中：[draft PR #17](https://github.com/kahokukoken/adhoms/pull/17)。正式版完成・公開済みではありません。
- 確認用：`dist/ADHOMS-Ver1.html` をダウンロードしてブラウザで開くと、サーバーなしで動作します。
- 旧TGS公開版はアーカイブ／参照用：[以前の公開先](https://kahokukoken.github.io/adhoms/)。PRの最新成果物と同じとは限りません。

スマートフォンの縦画面を基準にしています。セーブは使用したブラウザ内に保存されます。

---

ADHOMS is a simulation game project about observing a changing region, investigating signals, and adjusting priorities without directly controlling society.

## Ver1 player flow

The current development branch builds a scenario-led lightweight Ver1 flow on the existing FIELD TERMINAL UI. Story completion and first-play experience remain tracked in the acceptance map.

- Stage: 倶利伽羅町
- UI: FIELD TERMINAL / FEED-centered smartphone layout
- Interaction: observe lottery-terminal FEED posts and replies, weight observations internally, advance weeks or months, review quarterly and respond to consequential events
- Runtime: static HTML/CSS/JavaScript
- Entry point: `index.html`

The public prototype is designed to demonstrate the player experience and presentation flow. It is **not** a reproduction of the private ADHOMS Core simulation architecture.

## Run locally

1. Download or clone this repository.
2. Run `node scripts/apply-enhancements.mjs && node scripts/build-standalone.mjs` to assemble current source scripts.
3. Open `dist/ADHOMS-Ver1.html` in a modern browser, or serve `index.html` locally.

For a simple local web server, run for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Public / Private Boundary

This public repository may include:

- prototype UI
- presentation-only interaction logic
- public screenshots and documentation
- playable builds intended for evaluation

It does **not** contain:

- ADHOMS Core internal models
- private evaluation equations or detailed parameters
- internal prompts
- API keys or secrets
- the full private Notion knowledge base (development references and acceptance summaries are included)

## Repository role

GitHub is the implementation source of truth. Notion is the source for accepted game/story design and decisions. Read the current hub and original character pages before implementation; older prototype documents do not override them.

---

河北恒研 / KAHOKU KOKEN
