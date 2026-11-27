# Signposts: codex-seat-scope

Copy of this door session's signposts. Original: issues/chart/consultant-recipe/forks/signposts.md (answered by A under full autopilot, 2026-11-25T13:55Z). Carried, not re-asked: same door session. Read in this chart as general direction: S1a remove the problem class, S2a no fallbacks, S3a narrow scope, S5b never break running leaves on landing, S6a fix false docs in the same change, S7a free tests on touched boundaries.

## Question

- S1 What wins when they conflict: removing the silent stall class for good (a, recommended) or least disruption to running leaves and watches (b)? Steers the enforcement fork.
- S2 Fallbacks: none, a missing recipe fails loudly (a, recommended) or a built-in default or seeded recipe (b, includes B's S4c and D M4) or an explicit notify-only opt-out value (c, C 3, D M1)? Steers the schema shape and the watch skill's notify-only path.
- S3 Scope: only the slots.consultant gap (a, recommended) or every optional-but-required machine config key and writer audit (b, B M4, D M5)? Steers Off route.
- S4 The live ~/.akrogon/config.yaml: the operator adds the key, needs row N1 (a, recommended) or the door writes a recipe (b)? Steers who picks the model that acts unattended.
- S5 Rollout under auto-deploy (B M3, C 2, D M3): never break a config that parses today (a), break allowed only after the live config carries the key (b, recommended), break immediately (c)? Steers landing order.
- S6 Docs and skill text the change makes false are fixed in the same change (a, recommended) or code only (b)?
- S7 Proof kind (C 4): free tests on the touched boundaries (a, recommended) or a live watch-consults e2e run (b)?

Enforcement boundary (B M1, C 1, D M2) is the chart's core design question, taken as a fork after the map, not a signpost.

## Taken

A's picks under full autopilot, 2026-11-25T13:55Z, not operator words:

- S1 a: removing the problem class is the operator's core principle ("what removes the whole problem class").
- S2 a: the operator's standing rule "Add no fallback unless requested"; an opt-out value (c) adds a state no one asked for (YAGNI).
- S3 a: the disappearance has no supported cause (intake); auditing every key widens scope. Recorded under Off route.
- S4 a: the recipe picks a model that acts unattended with cost; only the operator chooses it.
- S5 b: loud refusal is wanted, but landing must not break the installed command while leaves run; landing waits on N1.
- S6 a: false docs are a defect the change creates.
- S7 a: the property is config parsing and a refusal message; free tests reach it, a paid live run adds nothing.

Account: the session puts removing the silent stall first and gives up tolerance of configs without the key; the operator's one manual step (N1) gates landing.

## Needs

Asked with this chart's proposal, 2026-11-25T15:58Z (chart added after the signposts round):

- N2 pending: authorization for the door to recover the two failed framework leaves (h1-from-seo-plan, canonical-list-binding) after the fix is installed, by `akrogon phase <slug> check.review` then `akrogon next <slug>`, or to leave them to the framework watch consult case h1-from-seo-plan-1. Consumers: this chart's landing step on main. Done: both leaves past check.review dispatch with a live B seat, or the operator's "leave it".
- N3 pending: interim choice while the fix is charted: keep `slots.b` codex (framework leaves at check.review keep failing until the fix lands), or the operator switches `slots.b` in `~/.akrogon/config.yaml` to a non-bash-wrapped harness. Only the operator picks an unattended model. Done: the operator's answer.

- N2 supplied (2026-11-25T16:20:02Z): operator "N2 restart". The door restarts h1-from-seo-plan and canonical-list-binding after the fix is installed.
- N3 supplied (2026-11-25T16:20:02Z): operator "N3 keep". slots.b stays codex, and framework reviews may fail until the fix lands.
