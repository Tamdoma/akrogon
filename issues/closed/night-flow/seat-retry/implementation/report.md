# Implementation report: seat-retry

Base: `c53f6196533289555518577f08907ec9c713721c` · Head: `eea5223` · Branch: `seat-retry`

## Done-criteria → evidence

1. **Retryable `agent start`/`agent prompt` failures keep phase, record error+count, retry next pass** — `recordFailure` now unconditionally `saveState`s (`src/next.ts`); `unreachable` and the `>= 3` `commitMove` are deleted. Proven by `three consecutive prompt failures keep the leaf in phase, record each error, and retry on the next pass`, `retryable agent start failures keep the leaf in phase until a start succeeds`, `a stale prompt never re-prompts a busy or done seat, and repeated delivery failures keep the leaf in phase`, `next resumes interrupted tab creation, then retries every failing pass without failing`, `a merge seat consumes one delivery attempt per pass and retries instead of failing`. Green in `bun test tests/next.test.ts`.
2. **Non-retryable errors stay in phase, error recorded, retry next pass** — same record path regardless of `retryable()`; proven by `a non-retryable prompt code records the error without failing, the leaf retries, and siblings still dispatch`, `non-JSON prompt stderr records a delivery error with exit code and trimmed message`, `malformed prompt error JSON records a delivery error with exit code`. Green.
3. **Successful delivery clears error and resets count** — `recordDelivery` unchanged; `a successful prompt clears delivery_error and resets attempts`, `a successful prompt between failures resets attempts`, `a record appended after a timeout is recognized by the next pass without resending` green.
4. **`akrogon status` shows slot + code + count; guide corrected** — `delivery errors surface as prompt tokens unless the seat is busy` extended with `A:2`/`A:1` attempt assertions (green); `docs/guide/next.md`, `limits.md`, `problems.md` updated (commit `624450a`).
5. **Offset used only while pane session equals recorded session** — reconcile requires `pane.agent_session.value === delivery_error[slot].session`; proven by `a session replacement after a timeout resends the prompt instead of settling from the old offset` (green: matching text in the new file neither cleared the error nor suppressed the resend).

## Changed files and reasons

| Commit | Files | Why |
|--------|-------|-----|
| `f2fba96` (plan) | `tests/next.test.ts`, `tests/status.test.ts` | Criterion proofs: 5 cases rewritten, 2 added, 1 extended. |
| `e928b94` | `tests/next.test.ts` | A-correction: 3 merge-order tests still asserted the deleted cap; rewritten to record-and-retry outcomes (brief: delivery faults never fail the leaf). |
| `6b5795f` (worker U1) | `src/next.ts` | D1: `recordFailure` always records; `unreachable` deleted; `retryable` no longer routes delivery errors. D2: reconcile bound to recorded `session`. |
| `624450a` (worker U2) | `docs/guide/next.md`, `limits.md`, `problems.md` | D4 doc corrections. |
| `eea5223` | `tests/next.test.ts` | Prettier reflow only. |

## Commands run (with results)

- `AKROGON_BASE=c53f619... bun test --changed=$AKROGON_BASE --timeout=30000` — **389 pass, 0 fail** (74.6s wall).
- `bun test --timeout=30000` (full suite, check `test`) — **794 pass, 0 fail** (105.2s wall).
- `bun run typecheck` (check `typecheck`) — clean, no diagnostics.
- `bun run format` (check `format`) — one reflow, committed as `eea5223`; worktree clean after.
- `bun test tests/docs-links.test.ts --timeout=30000` (U2) — 4 pass, 0 fail.
- `grep -rn "put the leaf into failed\|count toward failure\|needs a usable seat" docs/` — 0 stale hits (`in-practice.md:87` "recovery needs a usable seat" covers nonhuman failure recovery generally, not delivery).

## Worker returns (folded)

- **U1** (`src/next.ts`, commit `e8a50c2` → `6b5795f`): D1/D2 as specified; reported a mismatch — 3 stale cap tests the planner missed. Resolved by A directly at `e928b94` (planned-test expectation correction, `Test-Change` trailer).
- **U2** (docs, commit `ea97dc7` → `624450a`): three sentence-level edits; noted docs/code disagree until U1 lands (resolved by landing both in one wave).

## Known limitations

- A leaf in delivery fault accumulates unbounded `attempts` until a delivery clears them or the operator acts — the locked design (fork S5).
- `status` hides `delivery_error` while the seat is busy (pre-existing display rule).
- A non-retryable `agent start` error records the failure but a later pass still calls `agent start` again — deliberate: the design removes the retryable/non-retryable distinction entirely.
- `docs/guide/state.md:58` and `in-practice.md:87` still describe `failure`-caused recoveries; correct for non-delivery causes, left per design's out-of-scope note.

## Unverified criteria

None.

---

# check.fix — 2026-10-11 (merge-ending repair, F2)

Repair from the red merge ending recorded in `review-B.md` ("Merge finalization defect and handoff"). Started at rebased head `bd61382` on `origin/main` `22ede6c` (B's recorded head).

## Replay

Rejected run: base `c53f619`, head `1b5d68a` (pre-finalization; final head at refusal was `22ede6c` pushed to `origin/main`).

Rerun: base `22ede6c` (`akrogon config` refreshed `AKROGON_BASE`; `git rebase origin/main` was a no-op — HEAD `bd61382` already sat on the tip), head `9dd3924`.

Replayed command verbatim: `akrogon phase seat-retry merged --slot B --attempt 9a7a6dbe-b3c8-4e3a-9946-89c4ed0e3122`

Result: exit 1, `Illegal move check.fix -> merged` (`src/phase.ts:288`). The replay cannot reach the citation validator — routing refuses `check.fix → merged` before `batchPush`/citation checks run, because the `check.fix` move cleared `state.batch` and `phase`. The defect's proof therefore lives in the boundary reproduction below, which drives the same `phase merged` path through a real fixture push.

## Reproduction (red before fix)

New test `a solo merge push keeps citations valid when the remote ref advanced` (`tests/phase.test.ts`, commit `c995d48`): a solo merge leaf whose `frozen` records `x.test.ts`, its worktree cites the change in a `Test-Change` trailer, `phase merged --check` passes, then `phase merged` pushes `head` to `origin/main` and `transition` runs. Red output before the fix, matching the live failure:

```
error: Changed test files need a citation:
Test-Change: x.test.ts <source and reason>
      at requireFrozenCitations (src/phase.ts:521)
      at async transition (src/phase.ts:326)
      at async batchPush (src/phase.ts:653)
```

## Fix (commit `9dd3924`)

`transition` gains `from?: string`, threaded to `requireNoIssueFiles`/`requireTestChangeCitations`/`requireFrozenCitations`. The two post-push call sites — `batchPush`'s success path and `finishPush`'s landed-verification path — pass `record.built_on`/`batch.built_on`, the same base `--check` validated. This covers both the new-push range and the already-landed retry shape (pre-push tip == head gives an empty range; `built_on` still spans the leaf's pushed commits). Reproduction now green: push advances `origin/main` to the tested head and the leaf moves to `issues/closed`.

## Proof after repair

- `bun test tests/phase.test.ts --timeout=30000` — 67 pass, 0 fail (frozen-citation, restack, completion suites included).
- `AKROGON_BASE=22ede6c bun test --changed=$AKROGON_BASE --timeout=30000` — 803 pass, 0 fail (137.3s wall).
- `bun test --timeout=30000` (full suite, check `test`) — 817 pass, 0 fail (113.1s wall).
- `bun run typecheck` — clean. `bun run format` — clean after commit.

Before commits: `bd61382` (rebased head with B's trailer-only citation). After commits: `c995d48` (red reproduction), `9dd3924` (fix). Head: `9dd3924`.
