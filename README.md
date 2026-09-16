# ADHOMS

**Adaptive Homeostasis Management System**

ADHOMS is a simulation game project about observing a changing region, investigating signals, and adjusting priorities without directly controlling society.

## Public Prototype

This repository currently hosts the public **ADHOMS Ver.1 TGS Playtest v0.7** baseline.

- Stage: 倶利伽羅町
- UI: FIELD TERMINAL / FEED-centered smartphone layout
- Interaction: observe FEED posts, mark concerns, register investigations, follow sources, advance time, and review each month
- Runtime: static HTML/CSS/JavaScript
- Entry point: `index.html`

The public prototype is designed to demonstrate the player experience and presentation flow. It is **not** a reproduction of the private ADHOMS Core simulation architecture.

## Run locally

No build step is required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

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
- non-public research or design documents

## Repository role

GitHub is the implementation source of truth for the public playable prototype. Product theory, research, and internal design decisions are managed separately from this public codebase.

---

河北恒研 / KAHOKU KOKEN
