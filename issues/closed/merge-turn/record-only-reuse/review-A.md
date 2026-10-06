# Review A: record-only-reuse

Base: `43729a61d82935f52739ac727bd7bfcfd100e945`. Reviewed head: `c439883` (`efee828` engine+tests, `c439883` docs).

## Verification evidence

Re-run in lane worktree this pass:
- `bun test --timeout=30000` → 500 pass, 0 fail (23 files, ~24s)
- `AKROGON_BASE=43729a6... bun test --changed=$AKROGON_BASE --timeout=30000` → 352 pass, 0 fail
- `bun run format`, `bun run typecheck` → clean
- `grep -rn "fresh checks required" src tests docs skills README.md` → empty

Diff inspected end to end (not report-traced). Confirmed: `candidate` is written only in `batchPush` (the `reconcileBatch` `applied && candidate` dissolve trap is avoided — reuse publishes via `top`); `conflicted` is set on every `!staged.ok` iteration so a conflicted restack never qualifies; all conflict/dirty endings clear the tested pair and set `decision: 'rerun'`; the refusal write clears `tested_main`/`decision` while `pending.record` retains the originals for evaluation; `batchCheck` preserves the tested pair only for `decision === 'reuse'`; the slot gate accepts `head === record.top` only under `reuse`; second-refusal comparison uses `tested_main`/`tested_top`, never `built_on`. New tests cover criteria 1–5, 7, 8 at the CLI boundary; the at-push `state.yaml` snapshot via a `git` PATH wrapper is the only window where `tested_top` and `candidate` coexist. Doc diffs (`SKILL.md` both forms, `merge.md`, `state.md`, `setup.md` line 62) match the shipped contract; `src/AREA.md`/`tests/AREA.md` name no affected functions, no update needed.

## Findings

- N1. Lost-reply edge: `finishPush`'s landed branch stores `applied: true, top: candidate` on a record whose `tested_*`/`decision` were cleared at refusal, so the kept record lacks tested SHA and decision for a push that reported failure but landed. Deferred: reconciliation metadata only, no wrong behavior; criterion 6's "record holds all three" is about the refused-push decision path, which does hold them at push time. Promotion evidence: an audit needing the tested SHA after a lost-reply landing.
- N2. After a `rerun`, the next `--check` advances `tested_main`/`tested_top` to the newest green pair, so "original tested values" reads as "latest green run" rather than the first ever. Deferred: the property the brief guards ("never against an earlier reused top") is proven by criterion 7's test; a rerun implies code changed, so comparing against the newest green pair cannot reuse stale approval. Promotion evidence: a scenario where a fresher tested pair wrongly reuses — none identified.

## Verdict

nits — all nine done-criteria have tests that catch their failure; the deliberate break for criterion 4 was verified red and reverted.
