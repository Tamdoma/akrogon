# Review A: fix-red-base-tests

Base: `f3199df89b25b4f215df04f8703ef6d71880cd6a` · Reviewed head: `82b79cc` (3 commits, all under `tests/`)

## Verdict: nits

## Evidence

- `bun test tests/peer-wait.test.ts tests/dependents-first.test.ts --timeout=30000` at reviewed head: 13 pass / 0 fail (failure tests ~10 s each via the real grace path).
- `git diff --name-only f3199df..HEAD`: `tests/fake-herdr.ts`, `tests/peer-wait.test.ts`, `tests/dependents-first.test.ts` only — done-criterion 3 holds.
- Report's full-suite claim verified from `implementation/full-test.log`: 663 pass / 0 fail.
- `docs/guide/next.md` "When picked work cannot start" opened: the leaf changes only test-side assertions to match the already-documented contract (exit 0 + `waiting:` line). No documented behavior changed; no doc edit needed. `tests/AREA.md` names no fixture handler inventory — nothing stale.
- `Test-Change:` trailers present and correctly cited on all three commits (one per changed `tests/` file).
- Live contract check: `agent list` output shape matches `peer-wait.ts`'s `agentListSchema` and the verbatim real capture in `skills/watch-issues/scripts/fixtures/herdr-agent-list.json` (agent-bearing panes only). `--until` semantics checked against `peer-wait.ts` grace call and `src/next.ts` `prompt --until working` (fake `prompt` enforces it separately — untouched).
- No other in-repo caller of `agent wait` through the fixture besides peer-wait; the `untils.length === 0` guard preserves the old working-pane timeout exactly, so non-until callers are unaffected.
- Deviation sanity: the `failure` outcome is genuinely unreachable pre-fix (`resumedWorking` always true on a non-working pane, and `graceMs < IDLE_GRACE_MS` at budget 10) — the mid-flight `--until` + budget change was the minimal repair inside `tests/`.

## Findings

### Nits

- N1 Budget literal `12` in `tests/peer-wait.test.ts` (two tests) is implicitly coupled to `IDLE_GRACE_MS = 10000` in `skills/chart-issues/scripts/peer-wait.ts` plus `readPeerAgent` overhead; a comment or named constant would keep it readable if the constant ever moves. Deferred: margin is ~2 s vs ~100 ms typical overhead, tests are green, and the constant lives in a file the leaf must not touch. Promotes to Fix if the grace constant grows or the tests flake.
- N2 In `tests/fake-herdr.ts` `agent wait`, a `--until` miss sleeps `Number(flag('--timeout'))` even when a `waitScript` `sleepMs` already ran, and scripted `entry.status` success bypasses the until check. Real herdr returns early on status change mid-wait, which a static DB can't show anyway. Deferred: no caller exercises this combination today (peer-wait sends `--until` only in the grace path with an empty waitScript), and the combination is still deterministic. Promotes to Fix if a future test scripts `sleepMs`/`status` alongside `--until`.
- N3 `args[i + 1]` in the `--until` collector would read `undefined` if `--until` were the last token. Deferred: no caller emits a trailing `--until`, and `flag()`-style strictness for every flag isn't the fixture's pattern. Promotes to Fix only if a real invocation passes a bare trailing `--until`.

## Operator actions

None.
