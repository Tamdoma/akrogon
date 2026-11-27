# Review B, round 1: consultant-recipe direct route

Base `011d47575accb875bdf898f5b52f67d016a1120f`, reviewed head `0b00bfb5e016912a8e742518e037f527357473a4`, worktree `/home/ivan/.akrogon/worktrees/akrogon/consultant-recipe-required`.

Verdict: **nits**

## Test-Change trailers in base..head

- `6dd1e052` — ten trailers, one per touched test file, each citing refusal-boundary Taken item 4. Each matches its diff: the added refusal case in `config.test.ts`, the consultant additions in fixtures and e2e files, the hc-core missing-recipe test removal in `watch-consult.test.ts`. The removal cites the correct real source: a keyless config no longer parses after Taken 1, so the seat-level path the test exercised cannot exist; the test asserted the deleted throw, which fork item 2 deletes.
- `0b00bfb5` — one trailer for `tests/rollback.test.ts` citing the real build (pinned predecessor 6121559e's strict slots schema holds only a/b). Matches the implementation note in plan.md. Valid correction: expectation unchanged, input config corrected to what the pinned binary can accept.
- `cf9a8a2e` touches no test file: no trailer required.

## Findings

### Fix

None.

Checks performed with evidence:

1. **Done-criteria coverage.** Taken items 1–6 map one-to-one onto the diff: schema required (`src/config.ts:26`), dead throw deleted with both now-unused imports (`src/akrogon.ts`), superRefine iterates `config.slots` directly, `effectiveConfig` prints unconditionally, skill sentence deleted, three docs updated, fixtures carry the key. A repo-wide scan of every `slots:` block in `tests/**/*.ts` finds none missing `consultant` (python scan, worktree HEAD); a scan of `docs/ skills/ src/` for stale "missing/optional consultant" claims finds none.
2. **Red-on-base / green-on-head.** `check-red-on-base-...4001336.log`: the new refusal test fails on base src exactly because the optional schema parses the keyless config (exit 0, `expect not.toBe(0)` fails at line 374). Final verify on head `0b00bfb5`: 1466 pass 0 fail across 91 files, plus the 620-test changed-file rerun green; setup, typecheck, format green. First verify on `cf9a8a2e` was red only in the rollback manual-steps case, cause in the diff (fixture key refused by the pinned old release), repaired in `0b00bfb5` with its own green run — the report's account matches the logs.
3. **Test deletion and corrections have cited sources.** The hc-core test removal and the rollback strip each cite a real behavioral change, not convenience. No assertion was widened; the printed-slots `toEqual` gained the consultant entry rather than relaxing.
4. **Docs accuracy.** `config.md` row claims the refusal names the file and the key — the test asserts exactly `stderr` contains the config path and `consultant`. `install.md`'s minimal config is now parse-valid under the new schema, which was load-bearing for the enforcement choice. `commands.md` no longer promises a seat-level recipe-missing refusal that cannot occur.
5. **Proof mapping.** The plan names targeted tests then full verify; the report ran both through run-check with logs kept in `<chart>/direct`, and the report's proof-command sequence matches the plan. No planned test was skipped; e2e files are outside `checks` and the plan never included running them (S7a free-test boundary), so the report's known limitation is honest and within plan.
6. **Landing gate.** Taken item 6 is not implementable in the leaf itself and correctly absent: the report records it as outstanding with N1, which is the door's merge-turn sequencing, not a leaf defect.

### Nits

- **N1. Dangling "Any other" in the skill Open sentence.** After deleting the missing-recipe sentence, `skills/watch-issues/SKILL.md` `## Consult` Open reads "Any other failed or unconfirmed start keeps the case open…" with no antecedent failure mode left in the text. Deferred because no behavior changes: every reader applies the sentence to all failed starts, which is exactly the intended post-fix meaning, so there is no consequence today. Promotes to a Fix if a future edit adds another exception clause ahead of it, when the dangling phrasing would silently capture or exclude the wrong cases.

## Notes

- Operator actions: none from this review. N1 (operator adds the key to live `~/.akrogon/config.yaml`) and the Taken-6 pre-push gate are recorded in the report and the fork, owned by the door.
- No covered operations launched; review is read-only plus log inspection. Paid sessions in evidence: none claimed, none expected.
- The report's disclosed incident (uncommitted edits dropped once by a `git checkout src` with unset TMPDIR, reapplied before commit) is covered by the post-commit green verify and needs no action.
