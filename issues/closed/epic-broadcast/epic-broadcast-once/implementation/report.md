# Implementation report: epic-broadcast-once

Base: `147dcb33c8c5ae826cff3b74be212d120e0ba913`. Head: `6ea82d10769354c75411bc43e951d6a98bb36fef`. Three wave commits, no follow-up edits; worktree clean.

## Changed files and reasons

- `src/phase.ts` (D2): `completeOwner` print moved after `if (!complete) return;`; prints `issue complete <basename(owner)>` when `owner === issue`, else `epic complete <basename(owner)>`, only when `complete && justMerged`. Closure order, folder move, lock untouched.
- `tests/phase.test.ts` (D4): completion test asserts inner-issue silence (exact `moved merged`), final `moved merged\nepic complete epic`, repeated `merged` prints no `complete`, and a standalone concurrent race prints exactly once; private-sources test asserts inner silence and final epic line with close/view asserts unchanged; retry tests gain `epic complete` negative asserts.
- `skills/merge-issue/SKILL.md` (D5): broadcast-issue runs only on `issue complete` or `epic complete`; gathers the completion owner's briefs (every leaf brief under the epic when the leaf has one) before the move.
- `skills/broadcast-issue/SKILL.md` (D6): one message per completed standalone issue or completed epic, after either line, from the owner's briefs.
- `docs/guide/merge.md` (D6): shows both completion lines plus the silent inner case; broadcast sections state one update per standalone issue or whole epic.
- `docs/guide/cheat.md`, `docs/guide/idea.md`, `README.md` (D6): rows read as a completed-issue-or-epic update.

## Commands run with results

Wave picks on the lane (each followed by the changed-test command, all green):

- `git cherry-pick d3ae9cd` (U1) then `AKROGON_BASE=147dcb33c8c5ae826cff3b74be212d120e0ba913 bun test --changed="147dcb33c8c5ae826cff3b74be212d120e0ba913"` → 37 pass, 0 fail, 316 expects, 5.83s.
- `git cherry-pick bc49df2` (U2) then same command → 37 pass, 0 fail, 6.03s.
- `git cherry-pick 6ea82d1` (U3) then same command → 37 pass, 0 fail, 5.96s.

Worker red/green (U1 worktree, since removed): tests-first run against unmodified `src/phase.ts` → 35 pass, 2 fail (the two updated tests); after the fix → 37 pass, 0 fail. Logs lived at the removed worktree root (`test-red.log`, `test-green.log`).

Final verification on the lane:

- `bun run format` → clean, no files changed; worktree still clean. Wall 0.6s.
- `bun run typecheck` → `$ tsc --noEmit`, exit 0. Wall 1.3s.
- `bun test` → 339 pass, 0 fail, 3932 expects across 15 files, including untouched `tests/next.test.ts:844,1007` standalone asserts. Wall 1m22s.
- `grep -rn "issue complete" docs skills README.md` → only the standalone example in `merge.md:22`, the gated trigger lines in both skills, and the out-of-scope source-closure prose in `chart.md:203` ("delivering issue completes", substring hit about `sources`, not broadcasts). No line claims an inner issue triggers a broadcast.
- `grep -rn "epic complete" docs skills README.md` → `merge.md` example plus broadcast sentences and both skills' trigger lines.

## Known limitations

- L1 (plan): silent recovery. A first `merged` that throws during source closure prints nothing, and the later `akrogon next` retry uses `justMerged: false`, so the owner completes with no broadcast. Outside locked scope.
- The exactly-once race assert runs on a standalone owner (concurrent inner-issue merges cannot complete an epic by construction); both race shapes are covered across the test.

## Unverified criteria

None. C1-C5 by `tests/phase.test.ts` red→green plus the full suite; C6-C7 by pasted grep plus reads; C8 by format, typecheck, and full `bun test`.

## Repair round 1 (check.fix, review-B F1)

Before: `6ea82d10769354c75411bc43e951d6a98bb36fef`. After: `14e045cf44daf5edf3413ba681fd5b66410b62ba`.

F1 asked that the new completion asserts not require unrelated `moved merged` wording. Worker repair (commit `bce7e87`, brief-1 as revised 2026-09-30): exit-code asserts restored/added, completion lines isolated and asserted by absence (`not.toContain` pair) or exact value/count (`toEqual` on filtered `complete` lines); state, move, and source-closure asserts retained; `tests/phase.test.ts` only. A added a format rewrap on top (`14e045c`, whitespace only).

Evidence: changed tests after pick → 37 pass, 0 fail, 321 expects, 6.19s. Decoupling proof (throwaway `moved merged` → `phase merged` in worker worktree, reverted): both repaired completion tests passed; the single failure was the pre-existing unrelated `merge to merged clears busy fields` assert, out of scope per F1's "repair only the new assertions". Final tree: `bun run format` clean (36 unchanged), `bun run typecheck` exit 0, `bun test` 339 pass, 0 fail, 3937 expects. Wall 1m28s. No docs/index lines affected.
