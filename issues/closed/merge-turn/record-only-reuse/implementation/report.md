# Report: record-only-reuse

Base: `43729a61d82935f52739ac727bd7bfcfd100e945` (`AKROGON_BASE`, merge-base of HEAD and origin/main)
Head: `c439883` on `record-only-reuse` — commits `efee828` (engine + tests, worker U1, cherry-picked from `6183def`) and `c439883` (docs, worker U2, cherry-picked from `a18cd87`).

## Changed files and reasons

- `src/state.ts` — `batchSchema` gains `tested_main` and `decision` (`'reuse' | 'rerun'`) (D1).
- `src/batch.ts` — `equalOutsideRecordFolders` and `recordConfigEqual` over `diffQuiet`; code 0 equal, 1 differs, else `CommandError` (D4).
- `src/phase.ts` — `batchCheck` writes `tested_top`/`tested_main` (= `merge-base head trackingRef`) only when `decision !== 'reuse'`; `batchPush` slot gate accepts `head === top` on a reuse record and the refusal write clears `tested_main`/`decision`; `restack` flags every `!staged.ok` iteration, evaluates the three pathspec diffs only when the tested pair exists, writes the reuse payload (`candidate: undefined` — reconcile treats `applied && candidate` as push-pending) or clears tested fields for rerun, and prints `reuse|rerun tested=<T1|none> pushed=<T2>` or `rerun rebase <slug> onto <M2>` (D2–D6).
- `tests/batch-merge.test.ts` — `advanceRemote` helper; refused-push and member-conflict assertions updated to the new line; seven new serial tests covering criteria 1–5, 7, 8 (criterion 6 asserted inside them via stdout + snapshot). `Test-Change` trailers on the commit.
- `tests/batch-dispatch.test.ts` — restack assertion now `rerun rebase cc onto <sha>`. Trailer on the commit.
- `skills/merge-issue/SKILL.md` — both refusal spots describe `reuse`/`rerun`/`rerun rebase`; on `reuse` B copies the printed line into `review-B.md` and skips rerunning checks (criterion 6 docs half).
- `docs/guide/merge.md` — refusal section rewritten for the three printed lines.
- `docs/guide/state.md` — batch keys list `tested_main` and `decision`.
- `docs/guide/setup.md` — record-folder rule after the config bullets (criterion 9).

## Done-criteria → proof

1. `a record-only main advance ends in one check run and a reuse push` (new serial test): counter file == 1, stdout `reuse tested=<T1> pushed=<T2>`, remote lands T2. Pass.
2. `a code commit on main forces a rerun` — `rerun` line, counter == 2 after seat rerun. Pass.
3. `a main commit matching a member's change reruns` — identical `file-mem-a` content on main; condition (i) fails even though (ii) could pass. Pass.
4. `an issues/config.yaml change on main reruns` — plus deliberate break verified: dropping the `recordConfigEqual` conjunct turned this test red (printed `reuse`), restored. Pass.
5. `a learnings/history restack conflict prints rerun` — member conflict on `learnings/history/shared.md`, member dropped to solo, remote tip unchanged until recheck+push. Pass.
6. Line and record hold tested/pushed/decision — asserted via stdout and a `git` PATH wrapper snapshotting `state.yaml` at push time (post-merge the record is cleared, so at-push state is the only window where `tested_top` and `candidate` coexist); SKILL.md instructs B to copy the line into `review-B.md`. Pass.
7. `a second refused push after reuse still compares against the originals` — second record-only advance → `reuse tested=T1 pushed=T3`, `tested_top` still T1. Pass.
8. `the reuse decision is identical when the command runs from a subdirectory` — `cli` cwd = empty subdir inside holder worktree. Pass.
9. `docs/guide/setup.md` line 62 carries the record-folder rule next to `checks`. Pass.

## Commands run (lane, head c439883)

- `bun run format` → clean, exit 0
- `bun run typecheck` → `tsc --noEmit` clean, exit 0
- `bun test --timeout=30000` → 500 pass, 0 fail, 5412 expect() calls, 23 files, ~24s
- `AKROGON_BASE=43729a61d82935f52739ac727bd7bfcfd100e945 bun test --changed=$AKROGON_BASE --timeout=30000` → 352 pass, 0 fail, 7 files, ~20s
- `grep -rn "fresh checks required" src tests docs skills README.md` → no output
- Baseline full suite at 43729a6 (before leaf diff): 493 pass, 0 fail

## Known limitations

- Record folders are fixed (`issues/` minus `issues/config.yaml`, plus `learnings/`); the reuse relies on checks not reading those folders — documented in setup.md, not enforced at runtime (per the design probe's text-search limit).
- A reprompted `top=` on a reused record remains safe: `batchCheck` preserves the original tested pair and the push gate accepts `top`.

## Unverified criteria

None.
