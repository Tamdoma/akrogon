# Intake: state-hand-edits

## Scope

Destination: akrogon. A seat that writes a leaf's `state.yaml` by hand bypasses `akrogon phase` and its guards. Proposed grouping: one standalone issue with one leaf.

## Provenance

- Operator: 2026-11-24 door message in t126, with a screenshot of `akrogon next` run in the Himne workspace

## Source: operator 2026-11-24 t126

/chart-issues [Image #2] This is what I got in one of the repos (Himne workspace in in personal session). Fix it yourself here. Autopilot full, no consultants.

Screenshot text (transcribed by A, image not stored): `akrogon next` printed `{"repo":"framework","path":"/home/ivan/Work/infra/tamdoma/framework/issues/open/walk-stop-truth/step-halts/halt-record","error":"[ ... \"Invalid state .../halt-record/state.yaml\" ... \"code\": \"invalid_value\", \"values\": [\"plan.synthesis\", \"implement\", \"check.review\", \"check.repair\", \"check.fix\", \"merge\", \"merged\", \"failed\"], \"path\": [\"phase\"], \"message\": \"Invalid option: expected one of ...\" ]"}`, then `t1k` and `waiting: notes-reflow-zoom on notes-stanza-layout (plan.synthesis)`, exit non-zero.

## Agent findings

- F1. The invalid value was `phase: ready-for-solve` in framework `issues/open/walk-stop-truth/step-halts/halt-record/state.yaml`. The string exists nowhere in akrogon source or skills.
- F2. Seat A (pi, devin/swe-2-max, terminal t398) wrote it with its `edit` tool at 2026-11-23T23:48:54Z, transcript `/home/ivan/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-framework-halt-record--/2026-11-23T22-23-03-054Z_cfe451b2-2a7c-4a72-9018-3501e2d0d581.jsonl` lines 441-442. The same edit cleared `busy_since`/`busy_notified` and set `attempts.A: 1`. The seat had read plan-issue SKILL.md (line 5-6), whose plan.synthesis section ends "Finish with `akrogon phase <slug> implement --slot A`". It never ran that command.
- F3. The hand edit skipped a real gate. After A restored the three changed fields from the transcript's `oldText` and ran `akrogon phase halt-record implement --slot A`, the command refused: "Changed test files need a citation" for 9 test files of commit 2d65860d90 (src/phase.ts requireTestChangeCitations). The leaf now reads valid at `plan.synthesis`, and the lifecycle re-prompts seat A to finish.
- F4. `akrogon next` reporting the bad leaf as JSON on stderr and continuing with other repos is existing behaviour (src/next.ts `report`). It surfaced in Himne because `next` walks every registered repo.
- F5. Nothing stops a hand write. `saveState` (src/state.ts) is the only command writer of `state.yaml`, through `writeYaml` (src/shell.ts), which writes a temp file and renames it. docs/use/when-work-fails.md already says "Do not edit `state.yaml` by hand". A hand edit to a valid phase would pass silently and skip every move guard.
