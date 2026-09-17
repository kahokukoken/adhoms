# ADHOMS Football — Market Feedback Layer

This layer separates three questions:

1. **Prediction edge** — does the model assign better probabilities than the market?
2. **Information edge** — can the model anticipate opening-to-closing market correction?
3. **Execution edge** — after many agents adopt similar models, how much edge remains before prices absorb it?

The `market_feedback_v2.py` experiment is intentionally stylized. It uses the observed opening-to-closing normalized probability correction as the information eventually absorbed by the market, then asks how much of that correction remains exploitable if 0%, 10%, 25%, 50%, 75%, or 100% is incorporated earlier.

It must not be interpreted as a realistic bookmaker elasticity model. It is a sensitivity test for the self-eroding-edge mechanism only.
