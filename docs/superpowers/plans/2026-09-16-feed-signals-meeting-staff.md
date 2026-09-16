# ADHOMS FEED +/- and Staff Meeting Fix

## Goal
Restore two previously accepted Ver1 behaviors that regressed in the public v0.7 prototype:

1. FEED reactions use `+ / -` instead of the temporary 「気になる / 調査」 labels.
2. Monthly review shows named staff with distinct personalities in an actual back-and-forth conversation.

## Accepted behavior recovered from prior project decisions

- FEED reaction expression: `+ / -`.
- Initial staff: 宮下 / 藤井 / 水野 / 佐伯.
- Character cues: 宮下 = 辛辣, 藤井 = ワタワタ, 水野 = 変な趣味, 佐伯 = ADHOMSオタク.
- Ver1 uses names, roles, category/card styling and writing style rather than character illustrations.

## Implementation

- Add failing Playwright coverage first.
- Keep the recovered v0.7 baseline intact and layer public-prototype UI behavior through `enhancements.js`.
- `+` raises observation priority and queues supported automatic research.
- `-` lowers observation priority; it does not erase the observation.
- Preserve Follow / Detail actions.
- Rewrite the monthly review as six linked turns: four staff exchanges, a staff synthesis, then ADHOMS.
- Keep value-priority sliders and month progression unchanged.

## Verification

- Browser QA must verify exact `+` and `-` controls.
- Browser QA must find all four staff names.
- Meeting must render six dialogue bubbles and include cross-reference between staff speakers.
- Existing five-year progression must remain green.
