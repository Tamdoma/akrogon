# Implementation report: leaf-temp-dir

Delegated mode, two waves. Wave 1: unit 1 (src) plus unit 3 (docs). Wave 2: unit 2 (tests) on the landed wave-1 head. Every worker worktree removed before proof.

Base: `88f252f02eb36aacee6dadf6668c303374b692d5`. Head: `5b31956d63d14d17cfbc2785ff210dd674ddf77d` (`962f024` u1 src, `4d30fba` u3 docs, `ab983b1` u2 tests, `5b31956` format).

## Changed files and reasons

- `src/config.ts` (D1): exported `leafTemp(repo, slug)` beside `worktreeStore`; override parsed as optional nonblank absolute, else production root.
- `src/next.ts` (D3-D6): parent-first 0700 ensure in `allocate` plus `TMPDIR` in `placement`; shared `removeLeafTemp`; `tab_closed` merged-first deletion with `report` parity; `closeMergedTab` had-live return; `cleanupMerged` guard before the open return.
- `tests/helpers.ts` (D2): centralized `leafTempRoot` wired through `cli` defaults and `fakeHerdr().env`.
- `tests/next.test.ts` (D8): missing-seat TMPDIR extension plus 11 focused tests and refusal coverage.
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` (D7): one `$TMPDIR` sentence each.
- `docs/guide/merge.md`, `docs/guide/problems.md`, `docs/guide/limits.md` (D7): confirmed-gone temp deletion in the cleanup paragraphs.
- `src/AREA.md` verified untouched (names no allocate env).

## Commands run

Worker changed tests (artifacts under `implementation/`):

- u1: `AKROGON_BASE=88f252f... bun test --changed="88f252f..."` → 251 pass, 0 fail, 6 files [76.97s]. Log: `brief1-changed-tests.log`. Diff: `brief1-diff.patch`. Also `bun run typecheck` pass.
- u3: same command → 0 pass, 0 fail, no test files affected (prose-only). Evidence: `u3-evidence.log`. Diff: `u3.diff`.
- u2: same command → 346 pass, 0 fail, 13 files [80.21s]. Logs: `u2-changed-tests.log`, `u2-criteria-proofs.log`. Diff: `u2-diff.patch`.

Lane changed tests after each pick:

- After u1 pick: 251 pass, 0 fail [71.85s].
- After u3 pick: 251 pass, 0 fail [73.10s].

A criterion proofs on the formatted lane (all pass, real root `ls -A /var/tmp/akrogon-1000` = 0 after every run):

- `bun test tests/next.test.ts -t 'allocation carries TMPDIR'` → 8 pass [3.12s]. C1 plus refusal.
- `-t 'leaf temp path bounds'` → 1 pass. C2.
- `-t 'closed tab scratch'` → 2 pass. C3.
- `-t 'sweep scratch catch-up'` → 2 pass. C4.
- `-t 'recreates missing scratch'` → 1 pass. C5.
- `-t 'fixture temp root'` → 1 pass. C6.

Checks (C7, C8):

- `grep -n 'TMPDIR' skills/*/SKILL.md` → one line each at implement:25, check:18, merge:18. Guide lines merge:33, problems:53, limits:10 confirmed; contradiction sweep over `docs/guide/*.md` clean.
- `bun run format` → style-only diff in 3 owned files, committed as `5b31956`.
- `bun run typecheck` → pass.
- `bun test` → 353 pass, 0 fail, 15 files [81.28s]; real root still 0.

Criterion-to-test map: C1 fresh `tests/next.test.ts:3219`, C1 recovery `:1808` (4), refusal `:3238/:3258/:3275`; C2 `:3303`; C3 `:3360/:3396`; C4 `:3426/:3477`; C5 `:3505`; C6 `:3530`.

## Known limitations

- Inherited R1 gap: rm success plus prune failure is not retried once the folder is gone; only a later same-repo deletion prunes the stale entry.
- Panes running at rollout keep their old env until recreated; the operator 7-day sweep may clear paused-leaf scratch.
- Foreign-uid refusal untested (needs root); symlink and non-directory refusal tested.
- Later-hook removal after a live-panes sweep is covered indirectly by the C3 merged test, not re-driven.

## Unverified criteria

None. C1-C6 by the tests above, C7 by grep plus read, C8 by the three checks.

## Repair round 1 (B finding F1)

Before: `5b31956d63d14d17cfbc2785ff210dd674ddf77d` (reviewed head). After: `9b3e1c9` (`u4` guide hook wording, 3 lines).

Cause: the three guide paragraphs attached temp deletion to the exclusive sweep claim, omitting the `tab_closed` hook path that deletes merged scratch immediately. Fix states hook deletion with sweep/startup catch-up and keeps the exclusive-sweep restriction on worktree/branch removal only. No plan change: confirmed-gone already covered both paths.

Proof after repair: changed tests 346 pass [82.58s]; C7 grep shows `closed-tab hook deletes` once each in merge.md:33, problems.md:53, limits.md:10 with contradiction sweep clean (log: `brief4-sweep.log`); `bun run format` 36 unchanged with clean tree; `bun run typecheck` pass; `bun test` 353 pass, 0 fail, 15 files [79.46s]; real root 0. C1-C6 code evidence reused unchanged (repair touched guides only). Worker diff/log/report: `brief4-diff.patch`, `brief4-changed-tests.log`, `brief4-report.md`.

A review nit N1 (stale C3-C6 line refs above) corrected incidentally in this same report edit.
