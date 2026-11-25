# Report: verify-test-facts

Serial-solo implement (one wave, one unit in plan.md; no workers, no sub-briefs). Slot A, 2026-11-25.

Base: `085f2f88c3a1920732e10afbc0bad190cf32d540` (origin/main, unchanged — the refresh at pass start fetched and the branch was already current).
Head: `66100fc4` (trailer-only citation commit on top of verified `1f85baff5a5ec33ba37043176eddc451b6db9c0b`; no content change after the green verify).

## What was built

- `src/flaky.ts`: `scanBunOutput` — one ordered scan returning `{ names, timeouts, durations }`. `names` is byte-identical to the old `failureNames` output (same regex shapes, same `(script)`/`(unnamed)` rules); `failureNames` is now a thin wrapper. `timeouts` attaches `  ^ this test timed out after <n>ms.` to the most recent `(fail)` name of its own chain; lines of other chains in between do not break attachment. `durations` dedupes every `[<n>ms]`-bracketed `(pass)`/`(fail)` line per normalized name keeping the largest rounded ms.
- `src/verify.ts`: `verifyRunSchema` gains optional `timeouts` (non-empty, unique, subset of the same leg's `failures`) and `durations` (non-empty, unique names, integer non-negative ms) on command rows and inside `rerun`, and `attempt` on the run. `commandRow` scans each leg's own output: timeouts in every scope, durations (20 slowest union timed failures, ms-descending) at merge scope only, first leg inside `rerun`, rerun leg at top level. `runOnce` copies `passCaller(record).attempt` into the receipt's first append. Blocked/setup-copy rows never pass through `commandRow`, so they carry neither field.
- `docs/reference/files.md`: the `verify-runs.jsonl` row documents `timeouts`, `durations` (merge scope, 20 slowest plus failures, per leg on a rerun) and `attempt`, and states a ledger holding them does not parse under an older akrogon.
- `src/AREA.md`, `tests/AREA.md`: one clause each naming the new facts.
- `tests/verify.test.ts` + `tests/fixtures/verify-runs-legacy.jsonl` + `tests/docs-links.test.ts`: the plan's seven criterion proofs, committed red-first in 49297476 before product code.

## Commands run and results

Criterion proofs (all green on the committed head unless noted; wall time each under 1 s of test time plus ~2-3 s verify fixture overhead):

| Proof | Command | Result | Log |
|---|---|---|---|
| scan byte-identity | `bun test tests/flaky.test.ts tests/flaky-merge.test.ts` | 24 pass, 0 fail | `check impl-scan-targeted: 0 implementation/check-impl-scan-targeted-1795578247033-1526913.log` |
| criterion 1 (durations) | `bun test --timeout=120000 tests/verify.test.ts -t "20 slowest"` | 1 pass | `check crit-durations: 0 implementation/check-crit-durations-1795578249738-1546785.log` |
| criterion 2 (timeouts) | same file `-t "stream-attached timeouts"` | 1 pass | `check crit-timeouts2: 0 implementation/check-crit-timeouts2-1795578278218-1642336.log` |
| criterion 3 (rerun legs) | `-t "per-leg durations"` | 1 pass | `check crit-rerun-legs: 0 implementation/check-crit-rerun-legs-1795578252846-1568496.log` |
| criterion 4 (scope/blocked) | `-t "leaf rows carry no durations"` | 1 pass | `check crit-scope-gates: 0 implementation/check-crit-scope-gates-1795578290000-1653560.log` |
| criterion 5 (attempt) | `-t "stamps the attempt"` | 1 pass | `check crit-attempt: 0 implementation/check-crit-attempt-1795578290508-1655779.log` |
| criterion 6 (legacy parse) | `-t "legacy verify-runs"` | 1 pass | `check crit-legacy: 0 implementation/check-crit-legacy-1795578290669-1656500.log` |
| schema pins | `-t "pins timeouts and durations"` | 1 pass | `check crit-schema-pins2: 0 implementation/check-crit-schema-pins2-1795578299365-1658302.log` |
| criterion 7 (docs) | `bun test tests/docs-links.test.ts` | 14 pass | `check crit-docs: 0 implementation/check-crit-docs-1795578321323-1680322.log` |
| all proofs on head after the prettier commit | combined `-t` run | 7 pass, 0 fail | `check impl-criteria-fmt: 0 implementation/check-impl-criteria-fmt-1795578516172-1713069.log` |

Deliberate breaks (each a temporary edit run red, reverted, never committed; the two invalid first attempts were rerun correctly after the product commit — see incidents):

| Violation | Red command | Result |
|---|---|---|
| timeout attachment keyed globally instead of per-chain | `bun test tests/verify.test.ts -t "stream-attached timeouts"` | red: alpha's caret attaches to `beta-assert` — `check break-chain-check: 1 implementation/check-break-chain-check-1795578356552-1688405.log` |
| the 20-entry slice removed | `-t "20 slowest"` | red: durations gains t20..t24 — `check break-cutoff2: 1 implementation/check-break-cutoff2-1795578460999-1698901.log` |
| subset intersection dropped from `timeoutsFor` | `-t "per-leg durations"` | red: `gamma-new` enters top-level timeouts — `check break-subset2: 1 implementation/check-break-subset2-1795578461599-1699328.log` |

`akrogon verify` on the committed head: **green** — `verify leaf 1f85baff5a5ec33ba37043176eddc451b6db9c0b: green`; format 0 (`check-format-1795578521385-1715392.log`), typecheck 0 (`check-typecheck-1795578524257-1715392.log`), test 0, ~2.3 min wall (`check-test-1795578660554-1715392.log`). The first verify run (2ec7ffe0) was red on prettier formatting only; fixed and rerun. No paid runs; no credentials needed (`env_names: []`).

## Test corrections during implement (both committed with `Test-Change:` trailers)

- `f495002b`: the timeouts fixture printed alpha's caret unchained; real chained output always carries the caret under the failing test's own chain (forks/test-facts.md P2), so the caret now carries the `a` chain — cited real source.
- `4589dc0a`: the schema pin asserted `attempt` inside a command-row fixture; `attempt` is a run-level field, so the pin parses a run row — wrong authoring expectation.

No other test edits after planning. No reproduction-test or removal exceptions used.

## Incident: uncommitted implementation destroyed mid-pass

After the first round of deliberate-break edits, `git checkout -- src/flaky.ts` and `git checkout -- src/verify.ts` reverted the still-uncommitted implementation (the revert idiom is for violation edits made on top of committed work). The first `break-cutoff` and `break-subset` runs therefore tested pre-change or partially reverted code and are invalid evidence; the implementation edits were re-applied verbatim, verified by the criterion proofs, and committed in 2ec7ffe0 before `break-cutoff2`/`break-subset2` were run. `break-chain-check` ran against the correct uncommitted implementation and is valid evidence.

## Criteria linkage

1. Durations (20 slowest + failures, integer ms, dedupe max, no unbracketed/look-alike lines, surviving log deletion): crit-durations.
2. Timeouts (interleaved chains, assertion failure and thrown-error non-attachment, both scopes, byte-identical failures, green/non-timeout rows carry none): crit-timeouts2 + break-chain-check.
3. Rerun legs (per-leg placement, subset invariant under the all-names fallback): crit-rerun-legs + break-subset2.
4. Leaf rows carry no durations; merge and `compares` rows do; blocked rows neither (proven with a log copy that itself contains timed lines): crit-scope-gates.
5. `attempt` stamped with `--attempt`, absent without it: crit-attempt.
6. Legacy rows parse unchanged: crit-legacy (fixture: 3 rows copied verbatim from this repo's pre-change live ledger + 1 synthesized pre-change rerun row).
7. files.md row: crit-docs.

## Known limitations

- `attempt` is written whenever the pass caller carries one, so a merge-phase leaf verifying without `--attempt` still writes `attempt` (pre-existing `leafFields` behavior, per the locked caller-copy decision — noted for review in plan.md).
- The ms-descending tie order within equal-ms entries is insertion order of first appearance; nothing in the brief constrains ties.
- A repo listing `CLAUDECODE` in `pass_env` loses Bun `(pass)` lines and thus most green durations (pre-existing, recorded in forks/test-facts.md P3).
- Unverified: none. Every done-criterion has green proof on the committed head.

## check.fix round 1 — review-B F1-F4 (2026-11-25)

Before: `66100fc4` (reviewed head). After: `a90a1b768d5a4c575b393c4e1541a5e83bfc533b` (worker commit `796e8e6b` cherry-picked clean; B's docs repair `b1e27a54` already on the lane).

Reproduction tests committed red-first in `2959a001` (red logs: `check-repro-f1-red`, `check-repro-f2-red`, `check-repro-f3-red`, `check-repro-f4-red` in this folder), each modeled on the real Bun 1.4.5 output in B's evidence logs. Delegated repair brief-1 to one worker (one wave, one unit — all four fixes touch the same function `scanBunOutput`). The worker's repair, validated before cherry-pick:

- F1: legacy extraction verbatim — names computed with the original multiline `matchAll` regexes, so `\r`/U+2028/U+2029 line boundaries behave exactly as before. Worker fuzz: 2000/2000 then 10000/10000 byte-identical against the `085f2f88` implementation across adversarial terminator compositions.
- F2: per-chain candidate window — set by the chain's `(fail)` line, expired by any other same-chain line (pass, second fail, ordinary output), consumed by its caret; other chains' lines do not interfere.
- F3: durations only for strict `\d+(\.\d+)?ms` brackets; `[...ms]` stores nothing and NaN is unreachable by construction.
- F4: duration titles from the anchored result first — a leading `(pass) `/`(fail) ` keeps the whole remainder even when the title holds `| (fail) `.

Evidence after cherry-pick on `a90a1b76`:

- repros green: `check fix-repros: 0 implementation/check-fix-repros-1795580817018-3316492.log` (4 pass)
- criterion proofs green: `check fix-criteria: 0 implementation/check-fix-criteria-1795580817833-3317413.log` (7 pass)
- legacy scan suites + docs green: `check fix-scan-suite: 0 implementation/check-fix-scan-suite-1795580818671-3319634.log` (38 pass)
- worker's own logs: `w1-repro-after`, `w1-scan-suite`, `w1-criteria`, `w1-typecheck`, `w1-format`, `w1-repro-fmt` all 0 in this folder
- A's independent probe on B's exact evidence inputs: CRLF names/timeouts `['assertion']`, U+2028 `['first']`, adjacency timeouts `[]` with direct caret still attaching, untimed bracket no durations, piped title `keeps text | (fail) in a title` at 10 ms — all correct. One probe expectation of A's (fail-title containing `| (fail)`) was initially written wrong; verified against the verbatim legacy implementation that legacy takes the whole remainder (`["keeps text | (fail) in a title"]`), which the scan reproduces — byte-identity confirmed.
- `akrogon verify` on `a90a1b76`: **green** — format 0 (`check-format-1795580850127-3324830.log`), typecheck 0 (`check-typecheck-1795580852652-3324830.log`), test 0, ~2.2 min wall (`check-test-1795580986570-3324830.log`).

No plan correction needed; no test expectation weakened; the only test edits this round are the four committed reproductions. Worktree `verify-test-facts-u1` removed.

## check.fix round 2 — review-B F2/F4 (2026-11-25)

Before: `a90a1b76` (round-1 re-checked head). After: `a118b2ff346f42d4ab826eab359743a9eecc00f9` (worker commit `283a2a45` cherry-picked clean).

Round-2 reproduction tests committed red-first in `36985021` (red logs `check-repro2-f2-red`, `check-repro2-f4-red` in this folder), modeled on the real Bun 1.4.5 output in `check-recheck-b-bun-streams-1795581072649-3786828.log`. Delegated repair brief-2 to one worker. The repair, validated before cherry-pick:

- F2: text now splits with `\r\n` as one line ending, so a genuine blank line is bare output of the empty chain and expires its candidate like any other bare output; the two bytes of a CRLF ending never read as a blank line (round-1 CRLF repro stays green).
- F4: the chained reading uses one leftmost-marker alternation `(pass|fail)` — the marker following the wrapper chain — for durations, `(unnamed)` normalization and candidate set/expire, replacing the fail-first/pass-second pair. The legacy whole-text names extraction is byte-untouched.

Evidence after cherry-pick on `a118b2ff`:

- all six repros (rounds 1+2) green: `check fix2-all-repros: 0 implementation/check-fix2-all-repros-1795582586121-387325.log`
- criterion proofs green: `check fix2-criteria: 0 implementation/check-fix2-criteria-1795582586922-388641.log` (7 pass)
- worker's own logs: `w2-repro-after` 0, `w2-repro-round1` 0 (6 pass), `w2-scan-suite` 0 (24 pass), `w2-criteria` 0 (7 pass) in this folder; fuzz 3000/3000 byte-identical names against the `085f2f88` implementation including blank-line and terminator compositions
- A's independent probe on B's exact round-2 inputs plus round-1 regressions and chained-adjacency shapes: blank-line timeouts `[]` with direct and chained carets still attaching, wrapped pass keeps `keeps text | (fail) in a title` at 10 ms, chained pass holding failure-like title text no longer opens a candidate, CRLF timeouts unchanged — all correct.
- `akrogon verify` on `a118b2ff`: **green** — format 0 (`check-format-1795582603452-393132.log`), typecheck 0 (`check-typecheck-1795582606176-393132.log`), test 0, ~2.4 min wall (`check-test-1795582749369-393132.log`).

No plan correction needed; no test expectation weakened; the only test edits this round are the two committed reproductions. Worktree `verify-test-facts-u1` removed.
