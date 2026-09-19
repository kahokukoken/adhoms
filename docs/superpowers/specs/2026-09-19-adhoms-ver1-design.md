# ADHOMS Ver1 正式版設計仕様

- Status: Design and implementation start approved in conversation
- Date: 2026-09-19
- Product: ADHOMS Ver1
- Target: Web-first formal release
- Branch: ver1-production
- Supersedes for product planning: public prototype v0.7 and the narrow Phase 2 transport slice

## 1. Purpose

ADHOMS Ver1 is a complete five-year social-simulation game set in 倶利伽羅町. A first-time player must be able to begin the municipal demonstration, observe society through incomplete information, make institutional decisions, and reach the final A–D evaluation in one web session.

The game is not a direct-control city builder. The player represents 河北恒研 and changes institutions, priorities, observation policy, and constraints. Residents, organizations, infrastructure, and nature respond through local rules, relationships, delayed effects, memory, and feedback.

## 2. Completion target

Ver1 is complete only when all of the following are true:

1. A new player can complete 60 simulated months from setup to final evaluation in a web browser.
2. The intended first-run playtime is 45–60 minutes.
3. The mobile portrait FEED interface remains the primary play surface.
4. Player decisions affect society through Capability, Authority, Legitimacy, resources, relations, and time delays rather than direct outcome assignment.
5. The final evaluation is derived from simulated state and recorded history.
6. Save/resume, deterministic replay, automated validation, and full-run testing are operational.

## 3. Permanent design principles

- Simplify while preserving causal chains, interaction, feedback, delay, and history.
- Prefer emergence from Entity, State, Relation, Perception, Action, and Memory over phenomenon-specific correction systems.
- Treat Capability, Authority, and Legitimacy as cross-cutting constraints.
- Separate physical or social ground truth from what 河北恒研 can observe.
- Do not let authored FEED text, scenario copy, or UI code directly overwrite simulation outcomes.
- The player designs institutions and priorities; the player does not directly control residents.
- Capture residuals and classify mismatches before changing theory.
- New ADHOMS research is placed in a later-version backlog unless required by this specification.

## 4. Product scope

### 4.1 Included

- 倶利伽羅町 over five years and 60 monthly ticks
- Initial 河北恒研 priority allocation and team-leader choice
- A fixed starting staff of no more than five people; the selected leader changes advice and dialogue, not physical ground truth
- Monthly observation, quarterly institutional decisions, and annual review
- A mayoral election during year four
- the fictional 倶利伽羅八朔相撲, a forest-park live event, and heavy rain during the final year
- Representative residents, households, districts, institutions, facilities, and infrastructure
- Population, household, mobility, economy, municipal finance, health/welfare, infrastructure, environment, weather, and political legitimacy
- Snow, heavy rain, infrastructure aging, and wildlife incidents generated through shared rules and relations
- FEED, investigations, staff reports, annual reports, forecasts with uncertainty, and final evaluation
- Local automatic save and resume
- Seeded deterministic simulation and release validation

### 4.2 Excluded

- Prefectural, national, global, war, pandemic, and thousand-year stages
- Character portraits and animated standing art
- Free-form generative character chat
- Direct resident control
- Full real-world reproduction
- Stock, betting, horror, defense, social-publishing, and other ADHOMS research applications
- Godot-first rewrite before the web Ver1 is complete

## 5. Game rhythm

### 5.1 Monthly observation

Each month the simulation advances once. The player reads new observations, marks internal importance, bookmarks items, registers investigations, and advances when ready.

Monthly observation is not a mandatory policy-edit screen. This preserves time for delayed effects to become visible.

### 5.2 Quarterly decision

At quarterly boundaries, the player may revise priorities, approve or reject staff proposals, and change institutional or observation policy within available administrative capacity, budget, Authority, and Legitimacy.

A normal run should contain roughly twenty major institutional decision points plus a small number of crisis decisions.

### 5.3 Annual review

At the end of each year, 河北恒研 presents:

- state trends and uncertainty
- notable causal chains
- unresolved residuals
- staff advice
- five-year forecast
- risks created by the player's own policies

The player then performs the annual strategic redesign.

### 5.4 Political and final events

The mayoral election in year four changes the political relationships through which policies are implemented. The final-year 倶利伽羅八朔相撲, forest-park live event, and heavy rain combine cultural, logistical, infrastructure, weather, and institutional pressures. These events provide conditions and shocks; they do not script the outcome.

倶利伽羅八朔相撲 is an original fictional local tradition. Its organizer, history, venue, rules, visual identity, and participants must not copy a specific real-world event. The release credits state that the municipalities, organizations, people, and events depicted in the game are fictional and unrelated to real entities.

## 6. Population and entity scale

Ver1 uses a hybrid representative-agent model.

- Generate 1,000–2,000 synthetic resident agents.
- Each resident agent represents a weighted portion of the town population.
- Residents have age, household, district, occupation, income conditions, health, mobility, capabilities, relationships, perceptions, actions, and memories.
- Important visible actors such as the mayor, staff, experts, media actors, and influencers remain individual entities.
- Named actors do not receive privileged outcome rules; they use the same primitives and relation system.
- FEED visibility is a selection from observed entities, not a complete list of simulated residents.

This scale preserves individual variation and relation-driven emergence without requiring unverifiable detail for every real-world resident.

## 7. Observation-terminal demonstration

The town conducts a five-year ADHOMS demonstration by offering bidirectional observation terminals to residents selected through a lottery.

### 7.1 Terminal functions

- resident posts
- voluntary questionnaires
- incident or condition reports
- municipal and project notices
- optional contextual reports defined by the observation policy

The terminal is not a continuous surveillance device. It does not provide the player with unrestricted private data or exact ground truth.

### 7.2 Sampling and bias

Selection, participation, refusal, dropout, usage frequency, response behavior, district coverage, age distribution, compensation, anonymity, and privacy policy affect what can be observed.

The terminal system is part of the society it observes. Distribution and data policy can change:

- information coverage
- participation burden
- trust
- privacy concern
- municipal cost
- Legitimacy
- resident behavior

The Core simulates all representative residents. The Observation layer exposes only terminal reports, institutional statistics, staff investigations, and media information available to 河北恒研.

## 8. FEED interaction design

The FEED is an institutional observation inbox, not a consumer social network.

Removed from Ver1:

- follow controls
- follower counts
- personalized follow-based ranking

Retained actions:

- plus: privately raise analytical priority
- minus: privately mark low priority or probable noise
- bookmark: retain for later review
- investigation registration: request structured follow-up
- source profile: inspect available attributes and prior reporting behavior

These actions are internal to 河北恒研 and are not shown to residents as likes or dislikes.

The default FEED is chronological. Filters may use district, domain, source type, and stated confidence. A monthly observation summary is generated separately. FEED narration may describe observations but may not mutate ground truth.

### 8.1 Fixed presentation constraints

- Use the approved smartphone portrait layout and keep the primary monthly flow within one screen-height structure where practical.
- Put the title, premise, and opening explanation into the FEED flow rather than a detached presentation screen.
- Keep the month/year and next-month control in the lower primary action area; keep the load-more control with the FEED.
- Preserve reply hierarchy and allow longer posts from staff, experts, and notable actors.
- Show positive numeric movement with blue treatment and negative movement with red treatment.
- Annual reports include staff advice and a five-year forecast line chart.
- Do not add character portraits or standing art in Ver1.

## 9. Player controls

### 9.1 Initial setup

The player:

- selects a team leader from the fixed starting staff roster of no more than five people
- allocates a constrained total across welfare, market vitality, future investment, technology, and environment/disaster readiness
- configures observation-terminal policy, including coverage, sampling balance, compensation, data scope, anonymity, and survey frequency

All priority dimensions cannot be maximized at once.

### 9.2 Institutional decisions

Quarterly and crisis decisions may:

- change allocations or priorities
- approve or reject proposed programs
- modify rules, delegated authority, service support, information policy, or investigation capacity
- accept short-term cost for resilience or adaptability
- trade observation coverage against cost, participation burden, privacy, and trust

No action directly sets resident happiness, health, income, access, support, disaster outcome, or final grade.

## 10. Simulation domains

Ver1 includes only domains needed for the five-year municipal game:

1. Residents and households
2. Districts, facilities, and physical access
3. Mobility and transport services
4. Employment, local economy, and municipal finance
5. Health, care, and welfare access
6. Infrastructure condition and maintenance
7. Weather, snow, heavy rain, environmental pressure, and wildlife encounters
8. Municipal institutions, mayor, factions, Authority, and Legitimacy
9. Information, observation, media propagation, trust, and distortion
10. Memory, path dependence, delayed effects, and residuals

Domains must communicate through shared entities, states, relations, actions, and memories. A new domain-specific subsystem is rejected when the behavior can be produced by existing primitives.

## 11. Architecture

### 11.1 Simulation Core

Owns ground truth, entities, relations, state transitions, actions, memory, deterministic random state, residuals, and monthly advancement. It contains no UI text and no authored outcome selection.

### 11.2 Scenario

Defines 倶利伽羅町 initial conditions, calendar constraints, institutions, facilities, seasonal conditions, and event inputs. It may introduce conditions and shocks but may not assign the resulting social outcome.

### 11.3 Observation

Transforms Core state and events through source access, perception, visibility, confidence, distortion, sampling, and institutional reporting. It produces FEED items, investigation results, forecasts, and reports without changing Core ground truth.

### 11.4 Game UI

Renders the portrait FEED, setup, decisions, reports, filters, save state, and final evaluation. It submits validated player actions to the Core through an explicit command interface.

### 11.5 Required flow

Player institutional design
→ authority and implementation constraints
→ delayed changes in relations and state
→ entity perception and information propagation
→ observable reports
→ FEED and evaluation display

Reverse writes from FEED, authored text, or evaluation presentation into simulated ground truth are prohibited.

## 12. State, save, and failure handling

- The full deterministic state includes scenario version, rules version, seed, tick, calendar, entities, relations, memories, observations, residuals, player actions, and random-generator state.
- The game automatically saves after each successfully completed month.
- Save loading validates schema and rules compatibility before resuming.
- Monthly advancement is transactional: calculate and validate a candidate next state, then commit it.
- If an invariant fails, retain the last valid state, stop advancement, and record a classified diagnostic residual.
- Silent repair of invalid causal state is prohibited.
- Values with defined physical bounds may be bounded at their owning primitive, with the boundary event recorded when it affects interpretation.

## 13. Evaluation

The final A–D grade is derived from multiple dimensions rather than a single hidden score:

- social stability
- adaptability
- political and institutional Legitimacy
- fiscal sustainability
- resilience and recovery
- observation quality and uncertainty management

A and B are successful demonstration outcomes. C and D are failed demonstration outcomes. The report must explain causal evidence, uncertainty, trade-offs, and unresolved residuals rather than merely displaying the grade.

## 14. Validation and testing

### 14.1 Unit and contract tests

Each Core unit must test its public interface, bounds, immutability expectations, and deterministic behavior.

### 14.2 Causal tests

Tests must confirm that:

- player actions operate through institutional relations
- identical shocks can produce different results from different prior state
- observation actors cannot mutate physical ground truth
- authored FEED text cannot assign outcomes
- memory and delay change later behavior
- residual collection does not auto-fit the model

### 14.3 Repeated simulation

- Every pull request affecting Core: at least 100 seeded runs
- Release candidate: at least 1,000 seeded runs
- Required invariants include deterministic replay, valid relation bounds, non-negative count-like state, calendar completion, save/load equivalence, and absence of forbidden direct outcome mutation.

### 14.4 Full-game testing

Automated tests must complete all 60 months, including election, annual reports, final events, save/resume, and A–D evaluation. Manual first-time-player testing must verify the intended 45–60 minute completion range and comprehension of delayed causality.

## 15. Repository and version strategy

- Preserve the existing public prototype v0.7 as an archive/reference build.
- Develop the formal game on ver1-production until a release decision.
- Reuse validated Phase 2 Core components through reviewed transplantation, not by merging the stale branch wholesale.
- Keep game code, simulation Core, scenario data, and observation/UI adapters in explicit directories.
- Keep betting, stock, horror, defense, X publishing, and unrelated research outside the Ver1 game runtime and test graph.
- Do not deploy Ver1 over the public prototype until the completion criteria and release validation pass.

## 16. Release acceptance criteria

Ver1 may be called complete only when:

1. The complete 60-month run is playable on mobile and desktop web.
2. A normal first run finishes in 45–60 minutes.
3. The observation-terminal premise is present from the opening and governs visible information.
4. Follow and follower mechanics are absent.
5. Player intervention is institutional and indirect.
6. Representative residents and important individual entities interact through shared primitives.
7. Quarterly decisions, annual reviews, the year-four election, and the final-year 倶利伽羅八朔相撲, forest-park live event, and heavy-rain interaction function.
8. A/B success and C/D failure are derived and explained.
9. Monthly transactional save/resume is reliable.
10. Deterministic replay and required 100-seed/1,000-seed validations pass.
11. Full-game automated and manual acceptance tests pass.
12. Prototype scripts and unrelated ADHOMS research cannot write Ver1 ground truth.
