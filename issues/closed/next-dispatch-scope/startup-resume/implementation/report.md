# Implementation report: startup-resume

## Changed files and reasons

- `src/akrogon.ts`: `next` gets its own options branch `{ all, resume }`; one mutual-exclusion guard for target plus both flags (`Use a target, --all or --resume, not combined`, subsuming the old zod max-1 check); passes `'--resume'` to `nextCommand`. Covers A1.
- `src/next.ts`: selection bypass extended to `'--resume'`; new resume branch after `--all` (per-repo filtered sweep, no completion follow-up, global `cleanupRepos`). Covers A3, A4.
- `plugin/herdr-plugin.toml`: second startup entry to `["sh", "next.sh", "--resume"]`. Covers A2.
- `tests/pull.test.ts`: startup test retitled, manifest entry to `next.sh --resume`. Covers A2.
- `README.md` + `tests/command-reference.test.ts`: `next` contract to `[<slug>|<path>|--all|--resume]`, override and invalid list updated. Covers A1.
- `tests/next.test.ts`: two-repo resume test, merged-in-open completion test, `--resume` rejection asserts, epic-sibling sweep switched to `--resume`. Covers A1, A3, A4.
- `docs/guide/next.md`: startup line is now resume-only. Covers A5.

Workers (sequential, one worktree): brief-1 tests/red, brief-2 code/green, brief-3 docs, brief-4 merged-premise remainder. Briefs: `implementation/brief-1.md` through `implementation/brief-4.md`.

## Commands run

Worker runs (from the worktree, `AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844`):

- Brief 1 red: `bun test --changed=<base>` → exit 1, 117 pass / 5 fail. Real reds: README contract, pull manifest, both new resume tests, epic-sibling switch. Rejection asserts vacuous pre-change (strict parsing already rejects unknown `--resume`), as predicted.
- Brief 2 green: same command → 122 pass / 0 fail (57.77s). Plus `bun run typecheck` → clean.
- Brief 3 green: same command → 122 pass / 0 fail. Plus `grep -rn 'Startup also runs a sweep' docs/ README.md plugin/ skills/ src/ tests/` → empty.
- Brief 4 green: same command → exit 0, 122 pass / 0 fail / 2085 expects (58.24s).

Worker temp logs (`brief-1-red.log`, `brief-1.diff`, `brief-2-test.log`, `brief-2.diff`, `brief-3-report.md`, `brief-4-test.log`) were folded into this report and deleted before commit.

B final verification (after last worker, before commit):

- `bun run format` → clean, no modifications.
- `bun run typecheck` (`tsc --noEmit`) → exit 0.
- `bun test` → 293 pass / 0 fail / 3522 expects across 14 files (70.81s).

## Base and head

- Base (`AKROGON_BASE`): `1a21e22e0056a7e9d6b5e35a5a395b867847a844`
- Committed head: `5589f64162b652f871859e05e0a5bb21d93b4f3c` on branch `startup-resume` (8 files, +111/-19). Worktree clean.

## Known limitations

- L1 (plan): no single-repo resume. `--resume` inside a checkout still covers all repos.
- `skills/merge-issue/SKILL.md:51` says "startup sweep". Evaluated: the outcome claim (startup removes the worktree and branch) is still true, so it was left alone as out of scope.
- Two positional targets to `next` now report the D4 message instead of zod's max-1 error. Both exit non-zero; no test locks the old text.

## Unverified criteria

None. A1 through A6 all verified by the runs above.
