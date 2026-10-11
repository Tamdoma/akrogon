# Brief 4: seat scratch placement follows leafTemp home root

## 1. Goal

Plan unit U5 (decision D5, done-criterion 4). `next.ts allocate` creates the leaf scratch under the new `leafTemp` root (`~/.akrogon/scratch/<repo>` by default, `AKROGON_LEAF_TEMP_ROOT` in tests) — `ensurePrivateDir` must create missing parents recursively — and the seat tab env `TMPDIR=<scratch>` continues to point there.

## 2. Acceptance criteria

1. `ensurePrivateDir` inside `allocate` (`src/next.ts` ~:371-392) creates the directory and missing parents recursively (`mkdirSync(path, {recursive: true, mode: 0o700})` semantics), while keeping all existing validations: symlink refusal, not-a-directory refusal, foreign-uid refusal, chmod 0o700.
2. Nothing akrogon creates for a leaf lands under `/tmp` unless `AKROGON_LEAF_TEMP_ROOT` points there: `leafTemp` (worker 1, already in your base) returns the home path; verify `allocate`'s `TMPDIR=${scratch}` and `removeLeafTemp` use it unchanged — no `/tmp` literals remain in leaf scratch handling (the `git worktree prune` call is unaffected).
3. Proof: a `next` dispatch on a fresh fixture leaf (existing `tests/next.test.ts`/`batch-dispatch.test.ts` patterns with `fakeHerdr`) creates `leafTempRoot(f)/<slug>-<hex>` as a directory and passes `--env TMPDIR=<that path>` in the `herdr tab create` call; deleting `~/.akrogon/scratch` intermediate parents does not break it (recursive creation).
4. `batch.ts`'s `leafTemp(repo, 'batch-' + id)` call needs no change (root moved inside `leafTemp`) — verify only.

## 3. Read-first

- `src/next.ts` — `allocate` scratch block ~:368-416 (`leafTemp`, `ensurePrivateDir`, `rmSync(scratch)`, placement array), `removeLeafTemp` ~:730.
- `src/config.ts` — `leafTemp` (worker 1's new root is in your base; verify first).
- `tests/next.test.ts`, `tests/helpers.ts` — `fakeHerdr`, `leafTempRoot`, `cli`, `leaf`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Plan D5: `/home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/check-env/plan.md`.

## 4. Change list and interfaces

Owned paths: `src/next.ts` (`allocate` region ~:368-420 ONLY), `tests/next.test.ts`.
Lands after: workers 1 and 3 (worker 3 also edits `src/next.ts` in the `mergeWake` region ~:1050-1110 — disjoint; your base already contains both commits, verify).
Consumed by: nothing further in this leaf.

- Change is deliberately small: add `recursive: true` to the two `mkdirSync` calls in `ensurePrivateDir` (or restructure minimally if lint/style demands) so `resolve(scratch, '..')` (`~/.akrogon/scratch` or `<tempRoot>`) and `scratch` both tolerate missing ancestors. Keep the rest byte-identical.

## 5. Do-not, reasons and exceptions

- Do not touch `mergeWake`, `sweep`, `buildStack` or anything outside `allocate` in `src/next.ts`: worker 3's edits and locked merge logic live there.
- Do not change `leafTemp`, `config.ts`, `attempts.ts`, `state.ts`, `run-check.ts`, `akrogon.ts`, `helpers.ts`: other units own them.
- Do not weaken `ensurePrivateDir`'s security checks to make recursion work: the refusal path (foreign-owned/symlink parents) stays authoritative.
- Do not add cleanup of the old `/tmp/akrogon-*` trees: other leaves own migration; this leaf only moves creation.
- Mismatch rule: conflict with live code or a landed unit diff → return a mismatch with evidence; the exception is a revised brief from A. Restating: each exclusion exists because another unit owns that surface or the design fixes the behavior; the only exception is a revised brief.

## 6. Ordered steps

1. `git log --oneline -3`; confirm base holds worker 1's `leafTemp` change and worker 3's `mergeWake` edit. Missing → mismatch.
2. Apply the recursive-mkdir change in `ensurePrivateDir`.
3. Extend `tests/next.test.ts` (or the file with existing allocation tests) per criterion 3: after `cli(f, ['next', slug], ...)`, assert `existsSync(<leafTempRoot>/<slug>-*>)`, its mode, and that fake herdr recorded `--env TMPDIR=...`; add a case deleting an intermediate parent first if the fixture can express it, else note it.
4. Run changed tests to green; `bun run format` touched files.

Advisory size: 2 files, under 20 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/check-env-u4
bun install
AKROGON_BASE=354c80e14aca6483c430312c61ae5c1397bb548e sh -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'
```

## 8. Done-when, evidence and report

Criteria 1-4 green; commit on the detached worktree with `Test-Change:` trailer for `tests/next.test.ts` changes. Report commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
