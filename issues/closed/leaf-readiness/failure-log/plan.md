# Plan: failure-log

Direct synthesis (`debate: "no"`): built from brief, design and live surfaces.

## Decisions

- **D1 — Where the key is written.** `logMove` (`src/log.ts`) records `after.failure` on moves into `failed`, on no other move. `commitMove` (`src/phase.ts:108-125`) passes `announced` as `after`, and `announceFailed` has already persisted `delivery` before `logMove` runs in the `finally` block, so the written key is exactly the state's `failure` (`cause`, `phase`, `slot`, `reason`, `delivery` when present). Implementation: conditional spread `...(after.failure === undefined ? {} : { failure: after.failure })` in the `JSON.stringify` object. Omitting a `failure: undefined` key instead of emitting it keeps `Object.keys` assertions and criterion 3's "no `failure` key" both true without a second branch.
- **D2 — Where each criterion is proven.**
  - Criterion 1 (`cause: blocked`): new test in `tests/phase.test.ts` driving `cli(f, ['phase', <slug>, 'failed', '--reason', <text>, '--slot', 'A'])`, then asserting the appended record's `failure` deep-equals `readState(path).failure`.
  - Criterion 2 (`cause: attempts`): extend the existing `misses` test in `tests/next.test.ts` (`tests/next.test.ts:200-252`), which already reaches `cause: 'attempts'` with `failPrompts`; add the log assertion after its `phase === 'failed'` assertions. No second fixture run.
  - Criterion 3: new or existing-flow assertions in `tests/phase.test.ts`: parse the last log line of a non-failed `phase` move, assert `record.failure === undefined` and `!Object.keys(record).includes('failure')`, then `cli(f, ['status', <slug>])` exits 0 and stdout contains `History:` and the slug.
- **D3 — No status change.** `logSchema` (`src/status.ts:27-40`) is a non-strict `z.object`; the extra key parses through, which criterion 3's status run proves.
- **D4 — No backfill, no version, no display change.** Design exclusions stand; existing `failed` records stay without the key.

## Read-first

- `src/log.ts` — `logMove`, the only edited function.
- `src/phase.ts:48-125` — `announceFailed` (persists `delivery`) and `commitMove` (`after` is `announced`).
- `src/phase.ts:200-206` — `cause: 'blocked'` call site.
- `src/next.ts:429-450` — `cause: 'attempts'` call sites (`undelivered`, `unreachable`).
- `src/state.ts:11-18` — `failureSchema` (strict; `delivery` optional).
- `src/status.ts:27-50,288-300` — `logSchema` non-strict, `status <slug>` history print.
- `tests/helpers.ts:38-79` — `fixture`, `cli`, `leaf`.
- `tests/phase.test.ts:128-152` — exact-key assertion style on log records (non-failed move; unchanged list stays correct under D1).
- `tests/next.test.ts:200-252` — the `misses` fixture flow extended for criterion 2.

## Interfaces

- `logMove(repo, before, after, slot)` signature unchanged; `after.failure` already typed `Failure | undefined` by `State`.
- Log record gains optional `failure: { cause, phase, slot, reason, delivery? }` — the same object `state.yaml` holds; no schema or type is declared for the record in `log.ts` (it is a `JSON.stringify` literal), so no type edit is needed.
- Env variables: none. No credential check applies; the standing design names no secrets.

## Checklist (waves)

### Wave 1 (single unit — all owned paths overlap)

- **U1 — src + tests.** Owns `src/log.ts`, `tests/phase.test.ts`, `tests/next.test.ts`. One unit because the two test files assert the same record shape and the src change is one expression; splitting adds coordination for no parallelism gain. Shared test resource: none (each test uses its own `fixture()`/`dispatchFixture()`).
  - `src/log.ts`: add the conditional `failure` spread per D1.
  - `tests/phase.test.ts`: add the criterion-1 test (blocked move, `failure` deep-equals state) and the criterion-3 assertions (non-failed record has no `failure` key; `status <slug>` prints history).
  - `tests/next.test.ts`: extend `misses` with the criterion-2 log assertion.

## Docs affected

None. The change is invisible to operators except log consumers; `docs/` describes no log record shape (verified: no doc documents `logMove`'s fields). Skill files unchanged.

## Verification

| Done-criterion | Proof command | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1. blocked move logs `failure` = state | `bun test tests/phase.test.ts --timeout=30000` | missing/mismatched `failure` on `phase failed` | minutes | any edit to `src/log.ts`, `src/phase.ts`, `tests/phase.test.ts` |
| 2. attempts stop logs `failure` | `bun test tests/next.test.ts --timeout=30000` | `attempts` path bypassing the new key | minutes | any edit to `src/log.ts`, `src/next.ts`, `tests/next.test.ts` |
| 3. non-failed record has no `failure` key; status prints history | `bun test tests/phase.test.ts --timeout=30000` (same run) | key emitted unconditionally; `logSchema` regression breaking `status` | minutes | same as criterion 1 |
| Suite health | `bun run format`, `bun run typecheck`, `bun test --timeout=30000` | style/type regressions; `Object.keys` exact-match tests broken elsewhere | minutes | before handoff to check |

No slow-run restart boundaries needed: all proofs are single-command, self-contained fixture runs.
