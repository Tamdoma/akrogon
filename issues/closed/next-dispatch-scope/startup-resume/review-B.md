# Review B: startup-resume

Blind initial review. Peer review not read. `debate: no`, so no debate artifacts expected.

- Base: `1a21e22e0056a7e9d6b5e35a5a395b867847a844`
- Reviewed head: `5589f64162b652f871859e05e0a5bb21d93b4f3c` (single commit, ahead of base, worktree clean, no `issues/` files on branch)
- Verdict: `nits`

## Findings

- N1 (Nit): `skills/merge-issue/SKILL.md:51` still says "the startup sweep removes the worktree and branch". The effect claim is true (the resume branch still runs global `cleanupRepos`), but "sweep" now names the `--all` allocation pass that startup no longer runs. Reason for the Nit: terminology drift for future readers. Optional rename to "startup cleanup"; not required for this leaf since plan D9 scoped skills as unaffected and the report disclosed it.

No Fix. Every plan decision D1-D11 holds in the diff; every acceptance criterion A1-A6 is covered by a passing test or a verified doc line (see evidence).

## Verification evidence

- Targeted reruns on the reviewed head, all green: `bun test tests/next.test.ts -t "resume"` (3 pass, incl. both new tests), `-t "epic sibling"` (1 pass), `tests/pull.test.ts -t "startup runs"` (1 pass), `tests/command-reference.test.ts` (4 pass).
- Live CLI probes: `next --resume x`, `next --resume --all` and `next a b` each exit 1 with `Use a target, --all or --resume, not combined`.
- Full-suite evidence from the report (`bun test`: 293 pass / 0 fail; format clean; typecheck exit 0) stands: no code changed since that run on this head, so no rerun owed.
- Stale-reference greps over `src/ tests/ plugin/ docs/ README.md skills/`: zero hits for `next.sh", "--all"` and for `Startup also runs a sweep`.
- Tests use the real CLI plus existing helpers and fake-herdr; no mocks of the unit under test. Rejection asserts check exit codes only, not wording; literal asserts (manifest entries, prompt text, branch names) are fixed references that run as written.

## Criteria mapping

- Done 1: `--resume` parsed next-only, combos rejected (guard + tests), README row and contract list it.
- Done 2: manifest startup is pull `--all` then next `--resume` (diff + manifest test).
- Done 3: two-repo resume test passes with exact prompt/tab/attempt assertions.
- Done 4: merged-in-open completion test passes (owner moved, worktree/branch/tab cleaned, dependent untouched); epic-sibling test passes on `--resume` run from outside any repo.
- Done 5: `next.md` startup line is resume-only. `limits.md:10`, `problems.md:51`, `merge.md:27` unchanged and still true because the resume branch ends with global `cleanupRepos`.
- Done 6: report's format/typecheck/full-suite runs green on this head.

## Scope notes

- No `AREA.md` in the diff; no area-path check owed.
- Design exclusions intact: the `--all` branch, `phase.ts` and the pull startup entry are untouched.
- Changed-behavior docs opened even where unchanged (`limits`, `problems`, `merge`, `cheat`, `watch-issues`): no wrong claim found; one line recorded instead: no documented behavior changed beyond the `next.md` startup sentence and the README row.
- No reusable lesson found; nothing added to `learnings/`.
