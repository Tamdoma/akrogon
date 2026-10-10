# Report: guard-retires-lesson

Base: `2d9becac4365ec4a1079853364d561d90e356b5e` · Head: `e8be187`

## Changed files and reasons

| File | Why |
|---|---|
| `src/lessons.ts` (new) | `retiredHistoryStems`, `retiredLessonsPresent`, `removeRetiredLessons`, `mergeBase` — the re-removal engine shared by `buildStack`, `merged --check` and the merge-issue one-liner (D2–D5). |
| `src/batch.ts` | `buildStack` commits a `lessons: retire applied lines` fixup on the built top when union-merge resurrected retired lines (D3). |
| `src/phase.ts` | `batchCheck` refuses a push range still holding retired lines, solo and stack modes, naming the stems (D4). |
| `tests/batch.test.ts` | A1 re-removal test (union fixture) + A2 no-fixup test; `Test-Change:` trailer on the commit. |
| `tests/phase.test.ts` | A3 stack-mode refusal + A4 solo-mode refusal tests; `Test-Change:` trailer. |
| `skills/lesson-rule.md` | `**Retire**` bullet: full guard removes the line + appends `Applied` in the same diff; closure/duplicate/rejection never removes (D1). |
| `skills/implement-issue/SKILL.md` | Applying clause extended: guard every reachable path + line removal + `Applied` append in the leaf's own diff (D1). |
| `skills/chart-issues/SKILL.md` | One pointer clause at the handoff audit naming the shapes refusal (D6). |
| `skills/chart-issues/assets/shapes.md` | Audit refuses a lesson-sourced complete-guard leaf without a retirement criterion naming the history path (D6). |
| `skills/check-issue/SKILL.md` | Removal bar: accepted only beside a running guard on every reachable path; uncalled/partial guard or closure removal is a Fix (D7). |
| `skills/merge-issue/SKILL.md` | Solo/rerun-rebase re-removal step with the `bun -e` one-liner + scoped commit; `--check` backstop noted (D5). |
| `docs/guide/learn.md` | Retirement clause named as the normal exit; `/learn-issues` = backlog triage (criterion 6). |
| `docs/guide/merge.md` | One line naming build re-removal + `--check` refusal. |
| `src/AREA.md` | Non-obvious pattern line for the fixup + refusal. |
| `skills/AREA.md` | `learn-issues` line reframed ("not yet retired by a guard leaf"). |
| `learnings/LESSONS.md` | Header sentence now names the guard leaf as the normal exit (D9). |
| `implementation/brief-{1,2,3}.md`, `implementation/fresh-agent/*` | Pass artifacts (leaf folder, not on the branch). |

## Criterion → evidence

1. **Audit refusal + retirement criterion on lesson-sourced guard leaf** — live run, exercise 1+2: `implementation/fresh-agent/brief-guard.md` carries a retirement done-criterion naming `learnings/history/2026-09-10-review-by-reading.md`; `brief-touch.md` explicitly keeps the line. Subagent: `sa-4` (devin/swe-2-max, transcript `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-guard-retires-lesson--/2026-10-10T09-28-13-306Z_01a12524-38fa-75fe-b799-f1c93cb1779a.jsonl`).
2. **Removal survives merge** — `bun test tests/batch.test.ts tests/phase.test.ts`: buildStack fixup test (fail-first red output in worker sa-1's return: resurrected `lesson alpha` line absent after the change, fixup commit is `top`, new main line kept), `--check` refusals in both modes green. Fail-first runs recorded: A1 test red before `src/batch.ts` change (`- lesson alpha` stayed), `--check` tests exited 0 before the `phase.ts` guard.
3. **Uncalled guard = Fix** — `implementation/fresh-agent/verdict.md`: `fix`, citing the shipped bar verbatim; the shipped text in `skills/check-issue/SKILL.md:57`.
4. **No removal on closure/duplicate/rejection** — `git grep -n "LESSONS" skills/ src/` sweep: every write path is retirement-related (`batch.ts` fixup, `phase.ts` refusal, merge-issue commit, check-issue bar); `init.ts` writes the file only at repo init; `learn-issues` Apply section untouched and still gated on Guarded. Rule text in `skills/lesson-rule.md` and the check bar both state closure/duplicate/rejection never removes.
5. **Fresh agent drafts both briefs** — same run as c1 (recorded above).
6. **Guide + links** — `bun test tests/docs-links.test.ts` 4 pass (covers every edited `*/SKILL.md` + guide pages); `skills/lesson-rule.md` has no relative links; `learnings/LESSONS.md` header edited (no links, not link-checked); `git grep "learn-issues"` shows only triage descriptions — no "only way" phrasing remains.

## Commands run

| Command | Result | Wall time |
|---|---|---|
| `AKROGON_BASE=… bun test --changed=$AKROGON_BASE --timeout=30000` | 155 pass / 0 fail | 22s + 25s (two runs) |
| `bun test --timeout=30000` (full suite) | 651 pass / 0 fail | 71s |
| `bun test tests/batch-merge.test.ts tests/merge-attempts.test.ts tests/hold.test.ts tests/culprit.test.ts` | 58 pass / 0 fail | (worker sa-1) |
| `bun test tests/docs-links.test.ts` | 4 pass / 0 fail | <1s |
| `bun run typecheck` | clean | ~3s |
| `bun run format` | wrote `src/lessons.ts`, `tests/batch.test.ts`, `tests/phase.test.ts`; `src/status.ts` drift reverted per the standing lesson | ~4s |
| Fresh-agent live run (sa-4) | 3 artifacts written, all matching expectations | ~1 min |

## Worker returns (folded)

- **sa-1 (U1)** — commits `97d4609`, `562b340` (cherry-picked as `d195e0e`, `e659ae1`). Limitation noted by worker: stem matching is substring — a `history/x` stem also matches `history/x-y`; accepted, real lesson names carry a `YYYY-MM-DD-` prefix so collisions are theoretical.
- **sa-2 (U3)** — commit `805ea7d` (cherry-picked as `5061062`).
- **sa-3 (U2)** — commit `7b51df6` (cherry-picked as `2dd640e`). Worker flagged the one-liner base as `origin/main`-specific; repaired on the lane by commit `5d7b459` (awaits `mergeBase`, parametrizes `<remote>/<default_branch>`).

## Lane repairs during assembly

- Commit `5d7b459`: the merge-issue one-liner passed `Bun.spawn(...).stdout.text().then(...)` (a Promise) as `base`; added `mergeBase` to `src/lessons.ts` and fixed the verbatim text. Verified: `bun -e` prints `none` in the leaf worktree.
- Commit `e8be187`: prettier formatting of touched files only; `src/status.ts` drift reverted (known format-run hazard, history `2026-10-08-pause-dispatch.md`).

## Known limitations and unverified criteria

- Direct-route limitation preserved from plan D10: `implement-issue direct` + door push does not run `buildStack`/`batchCheck`, so a direct landing could resurrect a retired line. Brief scoped to solo/stack-top only; recorded, not fixed.
- The solo-mode re-removal is proven mechanically by `--check` tests plus the one-liner's verified run; the end-to-end solo merge with a real `gh`/remote push is exercised by existing `phase.test.ts` solo cases rather than a bespoke live push.
- No unverified criteria.
