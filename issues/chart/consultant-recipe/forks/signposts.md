# Signposts: consultant-recipe

Original, held in this chart (consultant-recipe). Missed angles from B (slots/signposts-b.md), C (slots/signposts-c.md), D (slots/signposts-d.md).

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

- N1 pending: operator adds `slots.consultant: {harness, model, effort}` (harness listed under `harnesses:`) to `~/.akrogon/config.yaml`. Purpose: the live config parses after the change lands, and the stalled pi-extensions consult can start. Consumers: this chart's landing; watch consults. Source: operator's choice of recipe (official shape `docs/reference/config.md` Machine config.yaml, checked 2026-11-25). Destination: `~/.akrogon/config.yaml`. Done: `akrogon config` prints a `consultant:` entry under `slots:`.

- N1 supplied (2026-11-25T15:20:50Z): ~/.akrogon/config.yaml holds `slots.consultant` {harness: pi, model: devin/swe-2-1-max, effort: high}, added outside this door between 14:02Z and 15:16Z; A's own duplicate codex block was removed, the existing recipe kept.
