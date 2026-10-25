# Design: remove-plan-debate

## Binding decisions, verbatim

### Scope (operator, 2026-10-25)

"I think we need to remove the planning debate question at the end and the planning debate in general. We're just not using it, and the entire planning is already done." Clarified the same day: only the lifecycle planning debate goes; the debate during charting stays ("I just want to make sure we're not talking about debating during charting: I want to keep that!"). "We also need to update the documentation, so make it a part of this issue."

Exclusion: `skills/chart-issues/assets/questions.md` peer exchange, `skills/chart-issues/SKILL.md` `## Take` and `## Handoff` peer leaf-writing exchange, `docs/pictures/chart-door.svg` and `docs/examples/quick-fix-story.md` describe the charting rebuttal and stay unchanged.

### Legacy records (fork legacy-records, operator `1a | 2a`, 2026-10-25)

- Q1 1a: `readState` and `readRepo` drop the `debate` and `rebuttal` keys from the raw YAML before the strict parse, permanently; neither key exists in `stateSchema`, `repoSchema` or their types; no edits to other repos' records or configs; open leaves lose the key on their next save. Reason: least code, no cross-repo work, no behavior gained by rewriting records. Foreclosed: 1b optional ignored field (field stays in the type and contract, invites reuse, needs a config follow-up); 1c strict schemas with coordinated migration of 11 repos (11 record commits, cutover timing, undo data).
- Known limit: the previous release cannot read records written without `debate`. A rollback after this leaf lands needs `debate: 'no'` re-added to records written since; `docs/use/roll-back-a-release.md` says so (B).
- Q2 2a: no read-time mapping for records at `plan.positions`/`plan.rebuttal`; the door rechecked zero such records (open, parked, `failure.phase`) in all registered repos right before handoff (2026-10-25: zero); a stray record fails as unreadable and is fixed by hand. Foreclosed: 2b map to `plan.synthesis` (permanent code for a measured-zero case, stale per-phase bookkeeping).

### Handoff format (fork handoff-format, operator `1a`, 2026-10-25)

- 1a: no change to brief.md, design.md or `skills/plan-issue/SKILL.md` `## plan.synthesis` beyond deleting the debate clause. Reason: no recorded Fix shows a brief/design gap debate would have closed; the design's consumer-per-precondition rule and `Open for the plan:` questions plus chart peer review of drafts already cover it; keep akrogon lean. Foreclosed: 1b simplest-alternative sentence (no failure it prevents).

### Agreed at the opening map (A,B,C,D), not contested

- `plan.synthesis` keeps its name.
- History stays readable: a historical phase enum (live phases plus `plan.positions`, `plan.rebuttal`) is used only by `logSchema` `from`/`to` (`src/log.ts`), the phase fields of `timingEventSchema` (`src/timing.ts`) and `failureSchema.phase` (`src/state.ts`). Live state `phase`, routing, moves and `akrogon phase` arguments use live phases only. Logs are never rewritten. Reason: `readLog` throws on a bad line and 65 log/timing lines across 5 repos name the retired phases.
- Closed leaves' `positions-*.md`/`rebuttal-*.md` and everything under `issues/` and `learnings/history/` stay untouched as history.
- Tests that use a retired phase as a generic two-slot phase are ported to a surviving phase, not deleted; only debate-specific expectations are deleted, each with its reason.

/home/ivan/.akrogon/releases/5b7b2a577861da1d0faed0e279fcd8382f8a10b8/skills/chart-issues/assets/standing-design.md applies as follows: no new machinery; proofs are the repo's own `bun test` cases at the real boundary (`readState`, `readRepo`, `readLog`, `readTimings`, `transition`/`akrogon phase`, `akrogon next` dispatch), each new behavior shown red by one deliberate break; deleted debate tests are deleted with their reason, and tests that guard races, busy seats and seat overrides keep guarding them on a surviving phase. Docs criteria are judged by review against the listed files, not by a grep.

## Leaf architecture

Owned surfaces:
- `src/routing.ts`: `phaseSchema` loses `plan.positions`, `plan.rebuttal`; the `routing` entries for them and their places in `failed.next` go; one exported historical phase enum holds every phase ever written, with a one-line comment that it exists because `issues/log.jsonl` history is never rewritten.
- `src/state.ts`: `stateSchema` loses `debate`; `failureSchema.phase` uses the historical enum; `readState` deletes a `debate` key from the parsed YAML object before `stateSchema.parse`.
- `src/config.ts`: `repoSchema` loses `rebuttal`; one strip path in `src/config.ts` deletes a `rebuttal` key before `repoSchema.parse`, used by `readRepo` and by `src/init.ts` `initialize` (B,C,D); `effectiveConfig` stops printing it.
- `src/init.ts`: `initialize` parses an operator proposal or the existing `issues/config.yaml` directly through `repoSchema`; every registered config carries `rebuttal`, so it uses the shared strip path (B,C,D).
- `src/timing-report.ts`: `visitsOf`/`visitGaps` call `requiredSlots(visit.phase, ...)`, which indexes live `routing`; a completed retired-phase visit takes its required slots (A and B, as both retired phases had) from a small retired table beside the historical enum in `src/routing.ts`, never from live `routing` entries; `Visit.phase` takes the historical type (B,C,D).
- `src/phase.ts`: `transition` loses the "Destination contradicts rebuttal config" guard.
- `src/next.ts`: the "Debate leaf skipped its debate" dispatch guard goes.
- `src/log.ts` `logSchema`, `src/timing.ts` `timingEventSchema`: phase fields use the historical enum.
- Skills: `skills/plan-issue/SKILL.md` (description line, `## plan.positions`, `## plan.rebuttal`, the debate clause of `## plan.synthesis`), `skills/check-issue/SKILL.md` `## check.review` (the two debate-artifact sentences), `skills/chart-issues/SKILL.md` (`## Handoff` debate election, `## Direct route` route question becomes lifecycle or direct, `## Autopilot` debate in the self-answered list and route line), `skills/chart-issues/assets/shapes.md` (`## Chart records` Route line and autopilot `route:` line, `## Leaf files` state.yaml template and its paragraph), `skills/init-akrogon/SKILL.md` config sample, `skills/watch-issues/SKILL.md` required-seats line.
- Docs: `docs/use/a-working-day.md` `## The usual day` (D), `docs/use/roll-back-a-release.md` rollback data note (B), `docs/reference/state-and-phases.md`, `docs/reference/config.md`, `docs/reference/skills.md`, `docs/reference/files.md`, `docs/reference/limits.md`, `docs/use/plan-work.md`, `docs/use/quick-fix.md`, `docs/use/write-issues-by-hand.md`, `docs/start/one-change.md`, `docs/examples/autopilot-story.md`, `docs/pictures/phases.svg` (hand-edited SVG, no generator in the repo).
- Tests: `tests/helpers.ts` `leaf()` and fixtures in `tests/batch.test.ts`, `leaf-stop.test.ts`, `next.test.ts`, `pause-next.test.ts`, `phase.test.ts`, `release-any-phase.test.ts`, `session-routing.test.ts`, `state-inventory.test.ts`, `state.test.ts`, `timing-report.test.ts`, `skills/watch-issues/scripts/observe.test.ts`, `observe-log-tail.test.ts` stop writing `debate` and stop using retired phases.

Exclusions: `skills/watch-issues/scripts/fixtures/codex-session.jsonl` is a recorded session and stays as recorded; everything under `issues/` and `learnings/` (history) is not touched; the charting rebuttal surfaces named under Scope stay.

Changed state and its consumers:
- State records without `debate`: consumers are every `readState` caller (`repoInventory`/`readInventory`, `statusCommand`, `ownerScope`, `flowReport`). The strip runs inside `readState`, so all of them inherit it.
- Repo config without `rebuttal`: `readRepo` callers, `effectiveConfig` and `initialize` (settled above).
- `phaseSchema` narrowed: consumers are `stateSchema.phase`, `routing` (`Record<Phase, Route>`), `transition` argument parse, `logSchema`, `timingEventSchema`, `failureSchema`, `src/timing-report.ts` (settled above; its `plan.` prefix grouping keeps working). `failure.phase` has no reader in `src/`; `routing` is indexed only with `state.phase` in `transition` and the allocated phase in `src/next.ts` (C). Open for the plan: any other `Phase`-typed consumer of a log or timing value the plan finds, and whether it takes the historical type or narrows to a live phase first.
- `skills/watch-issues/scripts/observe.ts` defines no state or phase schema; it imports `repoInventory` from `src/state.ts` and `readRepo` from `src/config.ts` and inherits both strips; only its tests' fixtures change (C,D).

Dependencies: none. One leaf, one release: command and skills deploy together through `~/.akrogon/current`.
