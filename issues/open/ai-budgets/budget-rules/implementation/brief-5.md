# Worker brief 5 — paid e2e cells refuse unreserved sessions (U5, D9)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/budget-rules-u5

## 1. Goal

Add the `AKROGON_SESSIONS` reservation guard to the paid e2e cells so an unreserved paid run
cannot start (plan decision D9, brief criterion 4). Free cells must never reach the guard.

## 2. Acceptance criteria

1. `tests/e2e/tier.ts` exports one helper `reservedSessions(planned: number): void` that reads
   `process.env.AKROGON_SESSIONS` and, when it is unset, non-numeric, or `< planned`, prints
   `refusing paid cell: plans <planned> sessions, AKROGON_SESSIONS=<printed value>` to stderr
   and calls `process.exit(1)`.
2. `kinds.e2e.ts` test calls `reservedSessions(8)` after its env checks, before `startTier`.
3. `watch-stop.e2e.ts` test calls `reservedSessions(4)` after its env checks, before
   `startWatchTier`.
4. `watch-consults.e2e.ts` test calls `reservedSessions(2)` after its env checks, before
   `startWatchTier`; its deadline becomes `Date.now() + minutes * 60_000` where `minutes` is
   `required('AKROGON_SESSION_MINUTES')` parsed as a positive number — an unset or invalid
   value refuses with a `required`-style failure before any session launch — and it reports the
   deadline it took (one `console.log`/`tier.record` line, e.g.
   `session deadline: <ISO> (AKROGON_SESSION_MINUTES=<m>)`).
5. `watch-live.e2e.ts` paid test ('watch live cell: a real harness in the tier', the third
   test) calls `reservedSessions(shape === 'root' ? 2 : 1)` after it parses `kind` and `shape`,
   before `setupCell`. The `watch-preflight` and `standin` tests add NO guard call.
6. `window.e2e.ts` and `notices.e2e.ts` are untouched.
7. Guards sit inside the paid test bodies — never module scope, `beforeAll`, or a shared
   beforeEach — so free cells never reach them.
8. TypeScript stays strict-typed (`planned: number`, `process.exit(1)` after a printed
   message); prettier-clean.

## 3. Read-first list

- `tests/e2e/tier.ts` (:37 `required`) — put the helper beside it.
- `tests/e2e/kinds.e2e.ts` (:78 test start; header says 8 sessions); `watch-stop.e2e.ts` (:104;
  header says 4); `watch-consults.e2e.ts` (:140 test, :154 `Date.now() + 14 * 60_000`);
  `watch-live.e2e.ts` (:925 test serial; `shape` parsed at :930).
- Ponytail: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

One helper, five call sites, one deadline swap, one report line. Planned session numbers are
each file's own stated count (header comments), per the leaf plan: kinds 8, watch-stop 4,
watch-consults 2, watch-live root 2 / shell 1. watch-consults' `Date.now() + 14 * 60_000` is
replaced by the `AKROGON_SESSION_MINUTES` deadline; parse with `z.coerce.number().positive()`
or `Number()` + a `required`-consistent check — match the file's existing zod style.

Chunks that must land first: none. Owned paths: `tests/e2e/{tier,kinds.e2e,watch-stop.e2e,
watch-consults.e2e,watch-live.e2e}.ts`. Shared test resource: none (A runs the proof
invocations). Creation commit: filled by A.

## 5. Do-not, reasons and exceptions

- Do not touch `window.e2e.ts`, `notices.e2e.ts`, `watch-tier.ts`, or any file outside the
  owned list — free cells and shared tier code are out of scope (tier.ts's only change is the
  exported helper).
- Do not add the guard to `watch-preflight`, `standin`, or module scope — the criterion
  requires those cells to start without the variable.
- Do not write or edit assertion tests for the guard — A's criterion-4 proof is direct
  invocations; these e2e files are the product surface, not proof tests.
- Do not change any other logic in the touched tests.
- Return a mismatch with evidence if a named call site differs from this brief; the exception
  is a revised brief from A.
- Standing exclusions: never `git stash`; commit WIP then `git reset --soft <creation commit>`
  and make the unit's one returned commit. The commit changes files matched by
  `src/test-files.ts` (`tests/` and `e2e/` both match), so its message ends with a
  `Test-Change:` trailer per changed file: `Test-Change: tests/e2e/<file>.ts adds the
  AKROGON_SESSIONS reservation guard for brief criterion 4; no test expectation changed`.
  Restated: one commit, five files, no stash, trailer on the commit.

## 6. Ordered steps

1. Read the four e2e files and tier.ts; confirm call sites. (AC7)
2. Add `reservedSessions` to tier.ts. (AC1)
3. Add the guard call in each paid test; swap the watch-consults deadline + report line. (AC2-5)
4. Run §7; commit once with trailers.

Advisory size: 5 files, under 20 turns.

## 7. Commands

```
akrogon run-check --name u5-refuse -- env AKROGON_E2E=kinds AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-u5-XXXXXX) AKROGON_E2E_OUT=$(mktemp -d /var/tmp/akr-u5o-XXXXXX) bun test ./tests/e2e/kinds.e2e.ts
akrogon run-check --name u5-typecheck -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile --backend=copyfile'"'"' && bun run typecheck'
akrogon run-check --name u5-format -- sh -c 'bunx prettier --check tests/e2e'
```

Expected: `u5-refuse` exits non-zero with your refusal line and NO tier/harness launch in the
log — that is the proof shape; the other two green. Report the refusal text verbatim.

## 8. Done-when, evidence and report

Done when AC1-8 hold, `u5-refuse` shows the refusal before any launch, and the commit carries
its `Test-Change:` trailers. Cite `check` lines. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
