# Intake: failure-identity

## Scope

Destination repo: akrogon. One report, Tamdoma/akrogon#134, handed whole: a red check gets a usable failure identity in `akrogon flaky`, in `verify --known-red` and in red-main notices, including reds that print no `bun test` failure line and reds whose log was retired. Grouping is proposed after the map.

## Provenance

- GitHub: Tamdoma/akrogon#134
- Operator: 2026-11-11T21:10Z, door t126

## Source: Tamdoma/akrogon#134

# akrogon flaky lists 14 framework flips with no failure name and 36 as (log gone); the same placeholders are the comparison keys of verify --known-red, so two different nameless reds can cover each other (suspected)

Source: Tamdoma/akrogon#134
URL: https://github.com/Tamdoma/akrogon/issues/134

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

`akrogon flaky` in the framework repo on 2026-11-11 listed 50 flips without a usable failure identity: 12 as `(no test name)`, 2 as `(unnamed)`, and 36 as `(log gone)` (35 verify, 1 cheap).

The red log behind each of the 12 `(no test name)` entries names the failed script and the failed check:

- 8 are `test:remote-image`, a node script: `[FAIL] no network attempts during build: GET /; GET /`
- 3 are `test:variant-parity`, a script with its own fixture verdicts: `[FAIL] fixture fail-fallback-never-runs: expected failure on "forced-fallback:scenario:tail/reveal", got: native:..., forced-fallback:...`
- 1 is `test:e2e:emdash-kit`, Playwright: test title `routing and SEO head`, `pollUntil timeout ... connection refused`

Bun's fan-out also prints `<script> | Exited with code <n>` for every failed script in these logs. The verify command fans out to 168 scripts: 43 are `bun test` only, 13 mixed, 112 custom (node or bun self-tests, tsc, lint, Playwright).

The 2 `(unnamed)` entries are Bun's own text for a hook timeout: `(fail) (unnamed) [6139.57ms]`, `a beforeEach/afterEach hook timed out for this test`.

The 36 `(log gone)` entries are all older than 2026-10-27. On that day the framework repo deleted its closed-leaf evidence packs on purpose (framework commit `aac40283de`, 5,130 files). The logs still exist in Git history at `aac40283de^:issues/closed/<owner>/evidence.tar.zst`. This is not a packing fault in akrogon. The consequence is that old receipts lost their failure names.

One trap for any wider reader: every `test:remote-image` log, green ones included, holds `[FAIL] no network attempts during build: CONNECT cdn.shopify.com:443`. It comes from a planted control (`proxy-control.js` runs the harness, expects exit 1 and forwards the child's output). The owning harness's final verdict is green in those runs.

## Location

- `src/flaky.ts:10-22` `failedTests`: keeps lines matching `/(?:^|\| )\(fail\) (.+?)(?: \[[\d.]+m?s\])?$/gm`, returns `['(no test name)']` on no match and `['(log gone)']` on `LogError` kind `nomatch`
- `src/verify.ts:190` `knownRedReceipt`, line 215: `if (names.every((name) => baseNames.includes(name))) return true;` Only `(log gone)` is refused, at line 205
- `src/verify.ts:291` `newRedUnits`, line 307: units are keyed by command and the `failedTests` name
- `src/evidence.ts` `readLog`: resolves a recorded log from the current owner folder or its `evidence.tar.zst`
- Release `97e88038a7d26ee0940de20a074d3ad71d8f9840`
- Consumer: Tamdoma/tamdoma-framework, `issues/verify-runs.jsonl`, command `bun run framework:verify`

## Reproduction

1. Seen: in a consumer whose verify command fans out to scripts that do not use `bun test`, one such script goes red and then green on the same tree. `akrogon flaky` lists the flip as `(no test name)`. 12 times in the framework ledger between 2026-10-27 and 2026-11-09.
2. Not run, read from the code: a head is red only in script X and its merge base is red only in a different script Y, both under the same configured command and neither printing a `(fail)` line. Both parse to `['(no test name)']`, line 215 holds, and `verify --known-red` judges the head covered. The same holds for two different bare hook timeouts, which both parse to `(unnamed)`.

## Expected behavior

Not provided. The reporter's view: a red entry says which script and check failed, two different failures are never judged the same failure, and a receipt stays readable after the consumer retires old evidence.

## Urgency

- The merge owner cannot act on a flaky entry without a name. `test:remote-image` flipped 8 times in two weeks, more than any named test in that period, and no fix leaf was opened for it.
- A new nameless red on a head can pass as a known red when the base has a different nameless red under the same command. Not observed, read from the code.
- Red-main notices are grouped by the same names, so a distinct nameless red can be folded into an earlier one. Not observed, read from the code.
- Workaround: read the raw log by hand with `akrogon log`.

## Suspected cause

- Main condition: `failedTests` accepts one failure format, the `bun test` line. Every other red (custom script `[FAIL]`, Playwright title, lint or typecheck diagnostics, guard, spawn or signal) maps to one shared placeholder.
- Contributing: the placeholder strings are used as equality keys in `knownRedReceipt` and `newRedUnits`. The rejection of `(no test name)` that #133 quoted (`noTestNames`, then at line 206) is not in this release. Only `(log gone)` is refused now, and no exit code or output is compared for a nameless red.
- Contributing to `(log gone)`: the failure names are computed from the log bytes at read time. The run record keeps the command name, exit and log path, not the names, so a consumer's allowed evidence retirement removes them.
- Whose view: both. The chart door and its consultant read the code and the logs independently and agree.
- Files read: installed release copies of `src/flaky.ts`, `src/verify.ts` (`knownRedReceipt`, `newRedUnits`) and `src/evidence.ts` (`readLog`). `flaky.ts` and `verify.ts` are byte-equal to the akrogon workspace HEAD by diff on 2026-11-11. `evidence.ts` was read in the release only. In the consumer: 14 red logs from the current archives, 36 recovered from Git history, `package.json`, `remote-image/run.js` and `proxy-control.js`.
- Not inspected: whether an open akrogon chart or leaf already changes this, the callers in `src/phase.ts`, and how #133 was fixed. The head and base counterexample was not run. Would disprove: a known-red or notice path that compares nameless reds by something other than the placeholder.
- Related reports: Tamdoma/akrogon#133 (closed 2026-11-09, completed: the opposite symptom, a nameless red was never covered by its base. The current code covers any nameless red with any other). Tamdoma/akrogon#50 (closed: seats cannot tell new failures from base failures). Tamdoma/akrogon#92 (closed: check logs kept under issues/ grow the consumer repo, the growth the 2026-10-27 retirement answered). Searched Tamdoma/akrogon, state all: `--author @me created:>=2026-11-09` limit 40, `no test name` limit 10, `failedTests flaky` limit 10, `knownRedReceipt` limit 10.

## Source: operator 2026-11-11T21:10Z, door t126

chart it. Use slot b (codex default model) and slot c (agy default) consultants. Chart it all on autopilot and then nudge w-akrogon agent to start everything unless you want to fix it yourself.

## Agent findings

A's reading, 2026-11-11, akrogon main at 97e88038:

- G1 `src/flaky.ts` `failedTests` matches only Bun's `(fail) <name>` line, returns `['(no test name)']` when nothing matches and `['(log gone)']` when the log cannot be found. Confirmed as reported.
- G2 `src/verify.ts` `knownRedReceipt` refuses only `(log gone)` on the head and then requires every head name among the base names, so `(no test name)` on both sides compares equal. `newRedUnits` keys each red unit by check name, command and that name. Confirmed as reported.
- G3 The equal compare in G2 is not an accident. Chart issues/chart/known-red-nameless (#133, handed off 2026-11-09, leaf nameless-base-red landed) decided it: the operator's signposts there were 3a (the command checks function only and the seat judges the cause from the two logs and the diff) and 4a (no new configuration), and A's pick coverage-rule 1a removed the nameless refusal. The seat texts in skills/implement-issue, skills/check-issue, skills/merge-issue and the direct route require the seat to read both logs whole before it agrees. So the report's "two different nameless reds can cover each other" describes the command's half of a two-part rule; the seat's judgment is the other half. Whether the command should now also compare an identity is a signposts question, because it touches the operator's 3a.
- G4 `failedTests` has four callers: `flips` in src/flaky.ts and `knownRedReceipt`, `newRedUnits` (twice) in src/verify.ts.
- G5 `akrogon flaky` in akrogon itself lists 30 entries from 2026-10-17 to 2026-10-24, one of them `(log gone)`. `akrogon status` shows no open leaf.
- G6 The operator's words "unless you want to fix it yourself" name the direct route. The door does not offer the direct route under autopilot (chart-issues `## Direct route`), so the route is lifecycle.
