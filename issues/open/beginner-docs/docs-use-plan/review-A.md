# Review A: docs-use-plan (check.review)

Base `40902d83`. Reviewed head `1e5d84f9`. Diff: nine new `docs/use/*.md` pages and `tests/door-reset.test.ts` (1+, 3-).

## Verification evidence

- `akrogon verify` on `1e5d84f9`: green (format, test 1114 pass, typecheck). Receipt and logs in `implementation/`. Nothing has changed since, so no rerun.
- `check docs-links: 0 .../check-docs-links-1792767948353-2256307.log`, `check retired: 0 .../check-retired-1792767949032-2256448.log`, `check door-reset: 0 .../check-door-reset-1792767950318-2258406.log`.
- Date grep over `docs/use/*.md` prints nothing. Every `akrogon <cmd>` used on the pages exists in `src/akrogon.ts`.
- `Test-Change:` trailer: `d0f4ea1d` on `tests/door-reset.test.ts` cites fact-ownership Q2 (wording-only doc checks are deleted) and the PAGE-MAP row. It matches the diff.

## Criteria

1. All nine pages exist, each on its PAGE-MAP subject. Optional marks are present for watch, broadcast and GitHub intake (`akrogon pull`, seed-issue, `sources`). Direct-route wording (skips the handoff and `akrogon next`, keeps the charted decisions and B review) is on a-working-day, plan-work and quick-fix. Autopilot wording (charts and hands off, starts no execution) is on a-working-day, plan-work and autopilot.
2. Six pictures are embedded with descriptive alt text (working-day, ways-to-run, chart-door, dispatch-order, control-states, watch-loop). The ways-to-run alt matches the SVG's "Autopilot never takes the direct route". All nine pages end with `Next:`, and the links resolve.
3. The `docs/guide` read is gone from `tests/door-reset.test.ts`, and its behavior tests pass.
4. Spot checks against the code:
   - `Leaf is stopped ... run akrogon start` is at `src/next.ts:706`.
   - stop-run is limited to the caller's scope (`src/stop-run.ts:10-24`).
   - `max_active` covers all repos (`src/next.ts:356-402`, `config.md:27`).
   - The paused-repo skip is at `src/next.ts:1165`.
   - seed-issue does two lookups (`skills/seed-issue/SKILL.md:73-77`).
   - `sources` closing is in `state-and-phases.md:84`.
   - Autopilot hands off without starting anything (`skills/chart-issues/SKILL.md:135-145`).
   - Failed-leaf recovery in watch-while-away points at `limits.md:26`.
   Every documented behavior is unchanged, since this diff changes no `src/` or `skills/` file.

No `AREA.md` in the diff.

## Findings

### Nits

- N1 Criterion 3 scope. The brief says "the door-reset documentation check" is removed. The diff removes only the `docs/guide/chart.md` read and its "handover" check, as the PAGE-MAP row says (plan D9). The skill and shapes wording checks stay. Deferred because they read no docs page, so they do not block docs-start's deletion of `docs/guide`. It becomes a Fix only if the operator reads criterion 3 as requiring every wording check in that file to go.
- N2 Proof gap. Hand-split panes surviving a stop (park-pause-stop) rests on `docs/guide/next.md:147,159` and the fact that only recorded panes get a `systemd-run --scope` (`src/scope.ts:45`). No test shows it. It becomes a Fix with a run showing a hand-split pane killed by `akrogon stop`.

## Verdict

nits
