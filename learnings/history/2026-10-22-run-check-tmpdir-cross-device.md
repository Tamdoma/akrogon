# run-check TMPDIR on another filesystem breaks rename into tmpdir

## Case

lingua-relay leaf `kostur-aplikacije`, 2026-10-22, implement pass. The planned criterion test `tests/criteria/guardrails.test.ts:131` moves `workers/api/migrations/0000_init.sql` aside with `renameSync(file, join(mkdtempSync(join(tmpdir(), ...)), ...))` to prove `migrations:check` fails on a missing migration file.

## Evidence

- `akrogon run-check --name guardrails -- bun test tests/criteria/guardrails.test.ts`: exit 1, 8 pass and 1 fail, `EXDEV: cross-device link not permitted, rename ... -> /var/tmp/akr-1000/.../run-elKdKY/lr-crit-migr-.../0000_init.sql` (log `issues/open/osnova-aplikacije/temelj/kostur-aplikacije/implementation/check-guardrails-1792691634376-1567229.log` in lingua-relay).
- `src/run-check.ts:62` sets `env.TMPDIR = runRoot`, which lives under `/var/tmp` (`/dev/mapper/root`). The worktree store `~/.akrogon/worktrees` is on `/home/ivan` (`/dev/mapper/home_ivan_crypt`).
- The same command with `TMPDIR` set to a mktemp dir under `$HOME/.cache` passed 9 of 9 (`check-guardrails-samefs-1792691692368-1569492.log`).

## Learning

Under `run-check`, `tmpdir()` can sit on a different filesystem than the worktree, so a test that `rename`s a repo file into tmpdir and back fails with `EXDEV` although the product is fine. A test that moves a repo file aside should copy and delete, or move it to a sibling path inside the same tree, and a seat seeing `EXDEV` should suspect the run environment before the product.
