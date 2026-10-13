# Implementation report: run-permit

Base: 99a5ada582267e92d227c005eb1705ce7dc80576 (origin/main, unchanged across both refreshes, no rebase moved the branch).
Head: 6c43d3f3e8b353015e94f19bf56e4a884b0c3139.
Mode: subagents, delegated. Wave 1 U1 (brief-1.md), wave 2 U2 (brief-2.md) and U3 (brief-3.md) in parallel. All worker worktrees removed.

## Commits
- 76a4f1b test: prove the host-wide run permit (planning)
- 6968997 feat: hold a host-wide run permit in run-check (U1, worker b92609b)
- 67c905f feat: hold the run permit while base-run runs its command (U2, worker 97ac992)
- 6c43d3f feat: show the live run permit holder in status (U3, worker 659b544)

## Changed files and reasons
- `src/permit.ts` (new): `withPermit` and `liveHolder`. flock(2) through bun:ffi on `<globalHome>/run.lock` (O_CLOEXEC, LOCK_EX|LOCK_NB polled every 250 ms, errno via `__errno_location`, only EWOULDBLOCK retried), atomic `run-holder.yaml` sidecar verified by pid start time and boot id, nested reuse through `AKROGON_RUN`, one waiter stderr line (D1-D6).
- `src/run-check.ts`: check_start through check_end inside `withPermit`, `AKROGON_RUN` in the constructed env, `wait_ms` on check_start when held (D7).
- `src/config.ts`: `AKROGON_RUN` reserved (D8).
- `src/timing.ts`: optional `wait_ms` on check_start (D8).
- `src/base-run.ts`: permit around spawnLogged only (D9).
- `src/status.ts`: `Run permit:` holder line on the board (D10).
- `.gitignore`: `run.lock`, `run-holder.yaml` (D11).
- Docs: `README.md` run-check and base-run rows, `docs/guide/setup.md` permit sentence, `docs/guide/files.md` check_start `wait_ms`, `src/AREA.md` permit line. To keep `src/AREA.md` at 40 lines U1 merged the two timing Key-files lines and dropped the Non-obvious line "Init refuses a declared grounding index..." which repeats the `src/init.ts` Key-files line.

## Criteria and proof (all on 6c43d3f)
`bun test --timeout=30000 tests/run-permit.test.ts`: 7 pass, 0 fail (`proof-run-permit.txt`). Each test was red before product code (plan.md, Red evidence).
1. C1: `a second run-check waits for the holder to exit, names the holder once and records its wait`, `a base-run waits for a live run-check holder before its command`: pass.
2. C2: `a SIGKILLed holder frees the permit within a second while its setsid child lives`: pass.
3. C3: `a run-check started inside an admitted run runs at once`, plus existing `tests/run-check.test.ts` nested case: pass.
4. C4: `a run token that does not match a live holder waits`: pass.
5. C5: `status and next complete while a run waits`: pass.
6. C6: `status names the live holder and drops it once the holder is gone or dead`: pass.
7. C7: covered by the C1 run-check test (`wait_ms >= 1000`): pass.

## Checks (on 6c43d3f, AKROGON_BASE 99a5ada)
- format: exit 0, 2 s, no diff (`proof-format.txt`)
- typecheck: exit 0, 2 s (`proof-typecheck.txt`)
- test: exit 0, 106 s, 865 pass 0 fail (`proof-test.txt`)
- test_changed: exit 0, 88 s, 704 pass 0 fail (`proof-test_changed.txt`)
No comparison records: no red check.

## Known limitations
- Accepted residuals from design: leftovers of a killed run can overlap the next run, a SIGKILLed holder leaves check_start without check_end, a harness tool timeout leaves a waiter running in its pane, servers kept alive across separate run-check calls lose the permit between calls.
- D12: the lock lives in akrogon home, so two different AKROGON_HOMEs on one host do not share a permit.
- A corrupt (unparseable) `run-holder.yaml` makes status and waiters throw a zod error. Writes are atomic, so only a manual edit produces one.

## Unverified criteria
None.
