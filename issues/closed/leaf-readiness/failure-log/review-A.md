# Review A: failure-log

Base: `b2c15ec5d2fe889e158934b084dd93cfeafc9f72` · Reviewed head: `ad67158`

## Findings

### Fix F1 — `failure` record misses `delivery: 'error'` when the failed announce fails

- **Source (reproduced, not conjectured):** `commitMove` (`src/phase.ts:108-125`) runs `announceFailed` in a `try` and `logMove(repo, recorded, announced, slot)` in `finally`. `announceFailed` (`src/phase.ts:70-82`) calls `saveState(announced)` — with `failure.delivery = 'error'` — *before* its `throw lastError`. When the `herdr notification show` call fails (herdr down, timeout, or socket error on any `phase failed` / attempts-stop path — a routine availability event, reached by any operator or seat running `akrogon phase <slug> failed` while herdr is unreachable), the function throws, `announced` in `commitMove` keeps the pre-announce value, and `logMove` writes `after.failure` **without** the `delivery` key.
- **Consequence today:** the log record's `failure` differs from the state failure on exactly the records this leaf exists to fix. Criterion 1 requires the record's `failure` to equal the state's `failure` ("including `delivery` when present" per the brief). A #52-style cause analysis cannot distinguish "no delivery attempted" from "delivery attempted and failed", and the `status` failure-reason line reads `error` while the log says nothing.
- **Probe evidence** (fixture + fake herdr with `failNotification`, run in `$TMPDIR`, leaf worktree, current HEAD):
  - `akrogon phase probe failed --reason 'probe divergence' --slot A` → `moved failed`, exit 1
  - log record: `{"cause":"blocked","phase":"implement","slot":"A","reason":"probe divergence"}`
  - state failure: `{...same, "delivery":"error"}` — divergent.
- **Criterion hit:** brief criterion 1 (`failure` equals the state's `failure`) and criterion 2 by the same mechanism (`unreachable`/`undelivered` attempts stops also call `commitMove` → `announceFailed`; any herdr failure during their announce drops `delivery` identically).
- **Suggested shape:** restructure `announceFailed` to return `{ announced, lastError }` (or have `commitMove` re-read the persisted failure) so `logMove` always sees the state-as-written, while preserving "transition committed even if announce fails". Adds `src/phase.ts` to owned paths — minimal, one function boundary.
- **Test gap (same Fix):** no existing test drives a failed move whose announce itself errors; the new tests only cover `delivery: 'shown'` and `delivery` absent-by-success. A failing-first test with `failNotification` asserting `record.failure === readState(path).failure` reproduces this.

## Other checks (clean)

- `src/log.ts` conditional spread is correct: `after` is `announced`, key omitted (not `undefined`) on non-failed moves; `Object.keys` assertion at `tests/phase.test.ts:137` (`check.repair` record) correctly unchanged.
- `src/status.ts` `logSchema` is non-strict `z.object` — extra key parses through; criterion 3's `status` assertion proves it.
- `tests/next.test.ts` `misses` extension asserts `record.failure` deep-equals `readState(path).failure` on the `cause: 'attempts'` path.
- Doc surfaces: no `docs/` or `skills/` page documents log-record fields (only `issues/log.jsonl` as a file to tail/read — `cheat.md:65`, `watch-issues/SKILL.md:30,39`); `src/AREA.md`/`tests/AREA.md` name no removed or renamed paths. No documented behavior changed.
- Committed diff is exactly the three owned files (+42 lines), lane clean, `ad67158`.

## Verdict: fix

One reproducible criterion violation on a realistic path. Everything else holds.
