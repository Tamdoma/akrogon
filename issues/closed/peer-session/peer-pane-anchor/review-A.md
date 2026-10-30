# Review A: peer-pane-anchor

Base: `dedbc381` · Reviewed head: `07390ad` (verify receipt green on this head).

## Evidence

- `git diff dedbc381..HEAD`: helper `peer-anchor.ts` (+84), five call sites (+2/+2/+7/+8/+8), test/fake changes committed at planning plus a prettier-only rejoin.
- `akrogon verify` on `07390ad`: format 0, test 0 (1262 pass), typecheck 0 — `check-*-1633744.log`.
- Lane criterion proofs on `f3542c1e` (pre-style head, same behavior): `check lane-peer-ask-wait: 0` (52 pass), `check lane-peer-restart-create: 0` (22 pass), `check lane-door-reset: 0` (45 pass); reds at planning recorded in plan.md (`check plan-red-*`: exit 1, scripts acted without checking).
- Criterion 4 live run reproduced by this seat earlier in the pass: `bun skills/chart-issues/scripts/peer-anchor.ts` → `w8:pXN`, exit 0; with `HERDR_SOCKET_PATH` pointing at the `personal` session → exit 1, `pane_not_found`, herdr 0.9.1. Report records both verbatim.
- Docs check: no `AREA.md` touched; `skills/chart-issues/SKILL.md` and `assets/questions.md` already treat a non-zero script exit as a reported stop — no documented behavior changed.
- Test-criterion fit: every done-criterion has a boundary test that fails on its violation (decoy shell_pid, unknown pane, unset env, other-session socket, A-pane mismatch, child re-check decoy); reds at planning are the deliberate-break evidence.

## Findings

No Fix.

### Nits

- N1: `peer-anchor.ts` imports `run`/`failureText`/`Herdr` from `./peer-restart`, making peer-restart↔peer-anchor a module cycle. Inert today — `verifyAnchor` is a hoisted function declaration so the circular binding is initialized, and typecheck/tests/live run all pass. Deferred: the alternative (moving `run` into the helper or a third module) is a bigger diff than the cycle costs. Promotes if peer-restart ever calls the anchor at module scope or a bundler/bytecode build trips on the cycle.

## Verdict

`nits`
