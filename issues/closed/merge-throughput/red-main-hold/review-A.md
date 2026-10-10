# Review A: red-main-hold

Base: `547063c` · Reviewed head: `ec9fe38` · Diff inspected in full: `src/hold.ts` (new), `src/phase.ts`, `src/next.ts`, `src/akrogon.ts`, `src/status.ts`, `skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/{merge,next,cheat}.md`, `src/AREA.md`, `tests/hold.test.ts` (new), `tests/pause-status.test.ts`, `tests/command-reference.test.ts`.

## Verification evidence

- Ran the leaf's own checks on this head during implement: `bun test` 629/0, `bun run typecheck` clean, `bun run format` clean (unrelated `src/status.ts` prettier drift reverted; our `command-reference` wrap committed in `ec9fe38`).
- Read every changed hunk against plan D1–D8 and the brief's done-criteria; traced `--red-on-base` end to end: flag parse → refusals → fetch/`localBase` sha check → restore/clear → `writeHeld` → print → `herdrCall` notice → `committed` → `mergeWake` → `mergeTurn` site-1/site-2 guards.
- `src/AREA.md` names `held.yaml` and `mergeTurn` — both exist (`src/next.ts` `mergeTurn`, runtime file under `globalHome()`); file is 36 lines with its exact four `##` sections.
- Doc claims checked against code: `docs/guide/next.md` hold-gates-manual-`next` matches the guard ignoring `isAutomatic`; `merge.md` and `SKILL.md` flag spellings match `akrogon.ts` (`'red-on-base'`, `command`) and the contract test; `unhold` row exists and the verb dispatches.
- Refusal battery covers stale/missing attempt, wrong sha, wrong phase, `--command`/`--red-on-base` asymmetry, `--check`, and no-record — all asserted to change nothing.
- Deliberate-break evidence recorded by workers (skipped `writeHeld`, removed site-1 `return`) — consistent with the standing-design requirement.
- `Test-Change` trailers present on the commits that touch existing test files (`d762266`, `800dda6`, `3612c45`, `ec9fe38`).

## Findings

### Nit 1 — `--red-on-base` accepts any or no `--slot`

`src/phase.ts` `phaseCommand`: the hold path returns before `transition` runs, so the required-slot check never fires — `akrogon phase <slug> check.fix --red-on-base <sha> --command 'x'` with no `--slot`, or `--slot A`, holds the repo, while every sibling ending requires the B seat. Deferred because the consequence today is nil: the resulting hold, restore and `held` attempt line are identical to the signed call, and `held.yaml` records `holder`/`attempt` not the seat. Promote if a contract later requires seat attribution for holds or an unsigned state change is itself a defect.

### Nit 2 — site-1 `clearHeld` can drop a newer hold

`src/next.ts` `mergeTurn` reads `heldFor` outside the lock and clears inside a fresh one; a hold written between those two points is dropped silently. Deferred because no hold writer can run in that window today — `writeHeld` requires an existing batch record, which a held repo cannot have — and a wrongly dropped newer hold costs one extra attempt, not a wrong merge. Already recorded in `implementation/report.md` limitations. Promote if `hold-fix-leaf` (or any future writer) gains the ability to write a hold without a batch.

## Docs check

One documented behavior changed (the red ending, the new verb, the held status); the touched pages describe it correctly. No documented behavior changed in `docs/guide/problems.md`, `state.md` or other unedited pages — hold is merge-specific and `next.md` covers the `next`-user angle.

## Verdict

`nits` — both findings are deferred with named promotion evidence; no Fix (no wrong behavior, broken contract or missing criterion test found).
