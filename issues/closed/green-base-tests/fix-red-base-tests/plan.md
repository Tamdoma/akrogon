# Plan: fix-red-base-tests

## Intent

Commit f3199df changed two behaviors and left two tests stale. `skills/chart-issues/scripts/peer-wait.ts` gained a `herdr agent list` call (`readPeerAgent`) that `tests/fake-herdr.ts` does not answer, so every peer-wait run dies with `Unexpected fixture invocation: ["agent","list"]`. `src/next.ts` made in-progress dependencies print `waiting:` and keep exit 0 (documented in `docs/guide/next.md`), but `tests/dependents-first.test.ts:103` still expects exit 1. Fix both inside `tests/` only; nothing under `src/`, `skills/` or `docs/` changes.

Reproduced live at f3199df: `bun test tests/peer-wait.test.ts tests/dependents-first.test.ts --timeout=30000` → 9 fail (8 peer-wait, 1 dependents-first), matching the brief.

## Decisions

- D1: `tests/fake-herdr.ts` gains a handler `if (args[0] === 'agent' && args[1] === 'list')` beside the existing `agent start/prompt/wait` handlers. It returns `result({ agents: [...] })` — one entry per pane fixture with `agent !== null`, each `{ pane_id, agent }` plus `agent_session` only when the pane carries one (`{ kind, value }` shape, passed through as stored). Panes with `agent: null` are omitted, matching real herdr (captured output `skills/watch-issues/scripts/fixtures/herdr-agent-list.json` lists agent-bearing panes only). No flag parsing: `peer-wait.ts` calls it bare.
- D2: `tests/dependents-first.test.ts:103` `expect(result.code).toBe(1)` becomes `toBe(0)`. The same test adds stdout assertions for the documented lines `waiting: d1 on many (plan.synthesis)` and `waiting: d2 on d1 (plan.synthesis)` — done-criterion 2 names the printed line, and the current test never checks stdout. One extra assertion in the same test, still `tests/`-only, is the cheapest proof; the design's "single stale assertion" described the failure, not a ban on asserting the criterion.
- D3: `tests/peer-wait.test.ts` needs no change: its fixture pane has `agent: 'fake'` and no `agent_session`, `agent.kind` is `'fake'` so `turnOpen` returns false without reading a session, and `agentListSchema` tolerates the absent session field.
- D4: No doc updates: `docs/guide/next.md` already documents the exit-0 waiting semantics, `tests/AREA.md` does not enumerate fake-herdr handlers, and no skill text describes `agent list` fixture coverage.
- D5: Type narrowing for the filter: `FakePane.agent` is `string | null`, so the handler maps with a type guard (`(p): p is FakePane & { agent: string } => p.agent !== null` or equivalent `flatMap`) — `agentListSchema` requires `agent: z.string()`.

## Read-first

- `tests/fake-herdr.ts`: `result()`/`save()` helpers, `FakePane` type, the `agent start/prompt/wait` handler block for house style.
- `skills/chart-issues/scripts/peer-wait.ts`: `agentListSchema` and `readPeerAgent` (~line 87) — the response contract.
- `tests/peer-wait.test.ts`: `setup()` fixture pane shape and the outcome tests.
- `tests/dependents-first.test.ts`: the `next --all` test at :93-119, stale assertion at :103.
- `src/next.ts` ~684: `waiting:` print and the `picked` deps branch; :1568 `skipped` → exit 1.
- `docs/guide/next.md` "When picked work cannot start": the documented exit-code rule.
- `skills/watch-issues/scripts/fixtures/herdr-agent-list.json`: verbatim real `agent list` output.
- `learnings/LESSONS.md` 2026-10-08: `bun run format` rewrites pre-existing prettier drift in untouched files — revert any unrelated drift after formatting.

## Interfaces

- Fake fixture contract added: `herdr agent list` → stdout `{"result":{"agents":[{"pane_id":string,"agent":string,"agent_session"?:{"kind":"id"|"path","value":string}}]}}`, exit 0. No new exported symbol, state field, or config key.

## Checklist

### Wave 1 (independent, parallel)

- U1 — owns `tests/fake-herdr.ts`. No shared test resource (peer-wait fixtures build their own tmp DB per test). No dependency. Implement D1/D5.
- U2 — owns `tests/dependents-first.test.ts`. No shared test resource (its tmp fixture invokes `agent wait`/`start`/`prompt`, never `agent list`, so U1's handler is not a prerequisite). No dependency. Implement D2.

## Docs

No agent or human doc affected: `docs/guide/next.md` is the reference and already matches, `tests/AREA.md` lists no fixture handler inventory.

## Verification

| Criterion | Proof | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|
| 1 peer-wait reaches all four outcomes, no `Unexpected fixture invocation` | `bun test tests/peer-wait.test.ts --timeout=30000` — 9 tests green (done×2, blocked×1, failure×2, budget×2, pass-through, arg validation) | missing handler, wrong envelope (`result.agents`), missing `agent` field, null-agent panes leaking in | seconds | change to `tests/fake-herdr.ts` or `peer-wait.ts` |
| 2 `next --all` dispatches many before few, prints `waiting:` lines, exits 0 | `bun test tests/dependents-first.test.ts --timeout=30000` — exit 0, both `waiting:` lines in stdout, prompt order asserted | stale exit expectation, missing or misformatted `waiting:` output | seconds | change to `src/next.ts` deps branch or the test |
| 3 diff touches only `tests/` | `git diff --name-only "$AKROGON_BASE"..HEAD` → every path matches `tests/` | out-of-scope file edits | seconds | any new commit |
| blocking checks | `bun run typecheck`; `bun run format` (revert unrelated drift per 2026-10-08 lesson); `bun test --timeout=30000` (suite green — this leaf exists to unred base); `bun test --changed="$AKROGON_BASE" --timeout=30000` | type errors in the new handler, format drift, regressions in files sharing fake-herdr (`tests/next.test.ts`, `tests/batch-dispatch.test.ts`, `tests/pause-next.test.ts` all drive the same fixture) | minutes | any code change |

Not a slow-run leaf: all proofs are seconds-to-minutes; no restart boundaries needed.

## Notes

- While iterating, run only the two failing files (`bun test tests/peer-wait.test.ts tests/dependents-first.test.ts --timeout=30000`) per the standing design's cheapest-sufficient-test rule; the full suite is the gate check.
- Foreclosed per design: reverting f3199df's `src/` changes, widening into full-suite cleanup.
- Shared-fixture risk: every dispatch test symlinks `fake-herdr.ts`, so the new handler must be purely additive — a malformed response shape would break `next`-family tests that do exercise agent starts. The full-suite check above catches that.
