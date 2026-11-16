# Report: claude-seat-no-questions

Implement pass, slot A, 2026-11-16. Serial-solo (one unit in one wave per plan.md); no workers, no sub-briefs.

## Changed files and reasons

- `src/seat.ts` (`harnessArgv`): per plan D1 — returns `{ kind, argv: [...argv, ...extra] }` where `extra` is `['--session-id', randomUUID()]` for `pi`, `['--disallowedTools=AskUserQuestion']` for `claude`, `[]` otherwise. Equals form, last element, so `startSeat`/`startConsultant` keep the appended task last. One function diff; no other code touched.
- Tests were committed at plan.synthesis and only reformatted here (prettier): `tests/seat.test.ts`, `tests/hc-start.test.ts`, `tests/hc-fixture.ts`.

## Base and head

- Refresh: branch rebased `8532a1f7` → `f7748167` (origin/main moved one docs commit; the prior test commit rebased cleanly, then soft-reset and recommitted after the prettier fix).
- Committed head: `7cee541d` (`00106a11` tests, `3318a229` product, `7cee541d` empty trailer commit citing the added `tests/seat.test.ts` — the `check.review` move requires a `Test-Change:` citation for added test files too). No `issues/` files on the branch; worktree clean.

## Commands and results

| Command | Commit | Result | Log |
|---|---|---|---|
| `bun test tests/seat.test.ts` (run-check `crit-proofs`) | 3318a229 | 4 pass 0 fail | `check-crit-proofs-1794844773793-755493.log` |
| `bun test tests/hc-start.test.ts -t AskUserQuestion` (run-check `crit-proofs-launch`) | 3318a229 | 1 pass, flag once at `at(-2)`, task at `at(-1)`, `core.tasks` `[task]` | `check-crit-proofs-launch-1794844774087-755657.log` |
| `akrogon verify` (setup, format, typecheck, full test) | 3318a229 | **green**: 1188 pass 0 fail; first run red on prettier for the 3 test files, fixed by `bunx prettier --write` and recommit | `check-test-1794844844978-756007.log`; earlier red `check-format-1794844754841-753890.log` |

Done-criterion proofs: criterion 1 — launch argv carries `--disallowedTools=AskUserQuestion` once before the task at `startSeat`'s `hc run` line (plus `harnessArgv` unit green); criterion 2 — codex/pi/agy unit argv equal to template words, pi keeping `--session-id <uuid>`. All green on head.

Wall time: `akrogon verify` ~2 min total (test suite 62.87 s); all other commands seconds.

## Limitations / unverified

- Operator-started claude sessions and a machine template already carrying `--disallowedTools` remain uncovered (plan stated limits, unchanged).
- No paid or live launch run; the flag's in-Claude-Code effect stays the free stub probe recorded in the design.
