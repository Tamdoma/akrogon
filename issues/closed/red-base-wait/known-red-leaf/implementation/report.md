# Report: known-red-leaf

Base `64f27d0e3c4ae254a6aafd49ea393033dc677606`, head `93f4b5f` on `known-red-leaf`. Delegated mode: U1 worker (modules) then wave 2 with U2 (wiring) and U3 (docs) workers in parallel; A's wrong-expectation test corrections committed in the lane.

## check.fix 2026-10-11 (review B verdict fix)

- B repaired F1 (`f73de41`/`0d37285`: `inconsistent` records require a completed passing retry) and F2 (`db202e9`/`d6672cb`: one `herdr` call per notice, error recorded).
- F3 repaired by A in `93f4b5f`: `tests/red-docs.test.ts` keeps only literal contracts (`--compare`, `akrogon base-run --base "$AKROGON_BASE" -- <command>`, `known-red`, the literal `incomplete base run` and retired `red on base` stop strings); prose predicates removed, with `Test-Change` citing B's finding. Semantic review of the skill wording confirmed criteria 8/9: retry/compare/record/`--compare` rules present in both seat skills and `plan.synthesis`; no retired or base-result-reuse text outside the merge-owned files listed below.
- F4 repaired by A in `plan.md`: proof selectors `-t refusal` and `-t verdict` matched zero tests; corrected to `-t 'refused'`, `-t 'refuses|admitted'`, `-t 'notice'`, `-t 'resolves|newer revision'` — verified 16, 5 and 6 matching cases green.

## Commits

- `8ee95de` test: prove comparison record validation, red record and --compare flag (planning pass, red-first)
- `4341622` feat: add comparison record and red record modules (U1)
- `95b3c6e` test: feed the real check command to the fabricated base-run line (A correction)
- `6edee21` test: give compare fixtures the setup key real base-run needs (A correction)
- `91b7160` test: repair three unreachable expectations found in review (A correction)
- `cccd9ce` feat: carry comparison records on phase moves and show red entries (U2)
- `04babfc` docs: replace pre-merge base-red stop with comparison record flow (U3)
- `f53a0d8` test: match recurrence entries by real id, not fabricated prefix (A correction)
- `ed7b88d` style: apply the format check's pre-existing rewrites (write-mode check drift on `src/status.ts`, `skills/chart-issues/scripts/peer-wait.ts`)
- `fb95d02` docs: fold AREA entries to keep the 40-line cap

## Done-criterion proof

1. Valid records move like green — `tests/compare.test.ts` first/second cases (real `akrogon base-run`, moved implement/check.review, `moved` output).
2. Field-named refusals — 14-case `test.each` plus the slot-mismatch case; every `ComparisonError` names its field/file.
3. new/unverified/own-criterion refused toward implement/check.review/merge, admitted on check.fix — five verdict-destination cases.
4. Open+notice once, silent join, notice stored apart — first case (opened+notice events, one herdr `notification show`, zero on the second record) and the failed-notice case (move still lands, `error` notice event).
5. Resolve only on base pass/same provenance/ancestor; partial; recurrence — the resolves case (one resolved of three entries, new entry+notice on recurrence) and the newer-revision case (entry stays active).
6. Lock-then-revalidate — `applyComparison`/`resolveComparison` call no `withLock` and re-read the file inside the global lock `phaseCommand` already holds; exercised by every record test.
7. Status lines — dedicated case asserts unit, command, first-seen and notice result on slug and board views.
8. Skill text — `tests/red-docs.test.ts` cases 1-2 (rules present, retired stop gone, incomplete stop kept, known-red exception on the checks-block line).
9. Sweep — `tests/red-docs.test.ts` case 4 scans `skills/` and `docs/guide/` for the retired patterns; out-of-scope merge-owned hits listed in `plan.md` (merge-issue/SKILL.md:73, guide/merge.md:29, README `--red-on-base` clause, implement-issue:78, src/AREA.md hold line).

## Commands run

- `bun install` — worker worktrees and lane.
- `bun run typecheck` — clean at every stage including after `93f4b5f`.
- `bun test --changed=$AKROGON_BASE --timeout=30000` — 170 pass / 0 fail (final).
- `bun test --timeout=30000` — 789 pass / 0 fail, ~113s (one red-docs case folded into two per F3).
- `bun test tests/compare.test.ts -t 'refused'|'-t refuses|admitted'|'-t notice|resolves|newer revision|status'` — 16, 5 and 6 cases, all green.
- `bun run format` — applied; two pre-existing rewrites committed as `ed7b88d`; clean after repair.
- `akrogon status known-red-leaf` — no `Missing:` lines.

## Worker returns

- U1 `4316ce3`: modules as specced; flagged the base-run `log` schema optionality and, as a mismatch, the self-defeating command-mutation test (fixed by A in `95b3c6e`).
- U2 `8b61c2b`: wiring as specced; returned a mismatch on three committed-test bugs (fixture setup, batch `applied`, assertion counting) — all corrected by A, never by the worker.
- U3 `3093e64`: docs as specced; README assertion awaited U2, green on the lane.

## Known limitations

- A same-code flaky unit can resolve and reopen, costing one notice per flip; the record only dedupes notices (locked Limit).
- `applyComparison` re-folds `activeRed` per unit — O(units × events) inside the lock, bounded by record size.
- `parseArgs` `multiple` needs a type cast on the option literal (`src/akrogon.ts`); functionally correct.

## Unverified criteria

None.
