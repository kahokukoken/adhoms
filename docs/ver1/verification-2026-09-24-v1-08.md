# Ver1 V1-08 verification — 2026-09-24

Scope: V1-08, connecting Years 2–4 decisions to delayed ordinary-life reactions and to later available capabilities. This is a functional-path verification, not a claim that every possible future scene has bespoke downstream prose.

## Canonical intent

The current hub and Implementation Blueprint require prior choices to return after a delay through FEED/conversation, not only through hidden numbers. Relation and Memory must change what can be done later. Year 4 is where accumulated cooperation and resistance should become visible as the player's actual hand.

## Implemented evidence

- Year-2 flood, wildlife and snow choices have choice-specific delayed reactions approximately two months later.
- Those returns appear in ordinary FEED and add a short history-dependent exchange to the monthly staff conversation.
- Year-3 side effects already calculated by `ver1-propagation.js` now reappear in ordinary FEED after the yearly report instead of existing only inside the modal acknowledgement.
- Year-4 displays cooperation offers created by strong Relation/legitimacy and resistance created by Burden Memory/local distrust.
- Choosing to deepen the offers turns concrete proposals into secured relation thresholds rather than adding an invisible +1 only.
- Emergency command gates read those secured relations. The final disaster displays the prepared capability hand inherited from the previous four years.

## Regression evidence

Verified code revision: `cddeb3a3a6d48860933da16ec3f28ab3cc1ef4b6`.

GitHub Actions **Ver1 QA #137** (run `35971010371`):
- browser QA: **40 passed / 0 failed** in 42.1s;
- standalone assembly/build/server: success;
- standalone artifact: `adhoms-ver1-review`;
- visual/test evidence: `adhoms-ver1-qa-evidence`.

New browser coverage verifies:
1. a Year-2 flood choice returns later in FEED and in the monthly conversation;
2. three propagated Year-3 effects return to ordinary FEED;
3. Year-4 cooperation offers become concrete emergency-command capabilities and are shown as the player's prepared hand.

An existing final-UI regression initially failed because the new hand panel reused the risk-status CSS class. The panels were separated and the complete 40-test suite then passed.

## Boundaries still open

- V1-04's overall character-conversation quality and V1-14 first-play experience remain human-review items.
- V1-10 ending/reveal order still needs canonical alignment.
- V1-11 research linkage remains partially disconnected.
- Q-01–04 remain governed by the current hub.
- PR #17 remains draft; no release or merge claim.
