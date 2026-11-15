# Intake: known-red-nameless

## Scope

Destination: a leaf is not stopped for the operator by a configured check that fails the same way on the leaf's head and on its base when the failing log names no test (a syntax check, lint or JSON validation broken on main). One chart, destination repo akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#133
- Operator: door t15, 2026-11-09T19:27Z

## Source: operator 2026-11-09T19:27Z

/chart-issues I just pulled an issue. Use slot b consultant (codex) and solve it on autopilot. The watcher is w-argon tab agent so nudge it when you're done.

## Source: Tamdoma/akrogon#133

# verify --known-red never covers a non-test check that fails identically on base, so one broken main check stops every leaf at check.review

Source: Tamdoma/akrogon#133
URL: https://github.com/Tamdoma/akrogon/issues/133

Origin repo: Tamdoma/herdr-setup

Unverified intake.

## Observation

In herdr-setup leaf `deeper-path-lookup` (issue `link-hints-nested`), the configured `shell` check (`bash -n install && bash -n bin/herdrapp && bash -n omarchy/apply-herdr-app-theme`) exited 127 with the same output on head `3f369b1c1be9cfce1b260d4ec8ed97048dc2a160` and on base `3cef1ac2ee195f079b6c55ca05677566b5f0dd59`:

```
bash: bin/herdrapp: No such file or directory
```

`akrogon verify --known-red` ran the base at the merge-base and printed `verify known-red 3f369b1…: fail`. The leaf moved `implement -> failed` at 2026-11-09T15:30:38Z (`blocked@implement`, slot A) with reason "check.review refused: verify receipt red only on the 'shell' check … repair needs a main-side change". The check itself is broken on main (Tamdoma/herdr-setup#2). The leaf's own diff did not cause the red.

## Location

- `src/verify.ts:191-225` `knownRedReceipt`, line 206: `if (names.some((name) => noTestNames.includes(name))) return false;`
- `src/verify.ts:160` `noTestNames = ['(no test name)', '(log gone)']`
- `src/flaky.ts:10-22` `failedTests`: returns `['(no test name)']` when the log has no `(fail) <name>` line
- `skills/check-issue/SKILL.md:69`: known-red agrees only when "the red command logged a real test name and that name also fails on the base"
- Release `a93fec755e9b4481d96feda0001841a5eb072ca9`

## Reproduction

1. Configure a non-test check (syntax check, lint, JSON validation) in a consumer's `checks`.
2. Break it on main so it fails before any test runner output.
3. Run any leaf to check.review. `akrogon verify --known-red` reproduces the same exit and output on base and still judges `fail`.

Seen once here (1 of 1 leaf so far).

## Expected behavior

Not provided. The reporter's view is that a check failing identically on head and base should not stop every leaf for the operator.

## Urgency

Every open leaf in the repo stops at check.review until main is fixed by hand, and the watch can't recover them because the fix lives outside a leaf's owned surfaces (`issues/config.yaml`). Workaround: fix the check on main, then `akrogon phase <slug> implement`.

## Suspected cause

- **Main condition:** known-red matches base coverage by failed test name only. A check whose log names no tests maps to `(no test name)`, which line 206 rejects before any base comparison, so exit code and output equality are never considered. This looks deliberate in both code and skill text (guarding against unrelated failures sharing a generic exit), so the gap is in the design rather than a code slip.
- **Contributing:** herdr-setup's `merge_checks: {}` let commit `020d282` (renaming `bin/herdrapp` to `bin/herdr`) land without running the `shell` check.
- Whose view: both.
- Files read: installed release copies of `src/verify.ts` (lines 150-240, 410-440, 825-885), `src/flaky.ts` (1-60), `skills/check-issue/SKILL.md:69`. These are the installed release, not the akrogon workspace source. They are not checked against `/home/ivan/Work/infra/akrogon` main.
- Not inspected: whether newer akrogon main already changed this. Would disprove: a known-red path that compares nameless reds by exit plus output.
- Related reports: Tamdoma/herdr-setup#2 (the broken check itself). Tamdoma/akrogon#76 (closed: red main fails leaves one by one, no operator signal). Tamdoma/akrogon#105 (closed: done-criterion red at base stops a leaf). Tamdoma/akrogon#121 (closed: known-red leaves no lasting intake). Searched Tamdoma/akrogon, state all: `--author @me created:>=2026-11-07` limit 30, `known-red` limit 10, `no test name` limit 5.

## Agent findings

A, 2026-11-09, inspected at main a93fec75 (also the installed release, so the report's installed-copy reading holds for main):

- `knownRedReceipt` (src/verify.ts) reads each red head entry's failed names with `failedTests` and returns not covered as soon as one name is in `noTestNames` (`(no test name)`, `(log gone)`), before any base run is compared. Exit code and output are never compared.
- `failedTests` (src/flaky.ts) recognizes only bun-test `(fail) <name>` lines; any other log yields `(no test name)`.
- The rule is an operator lock, not a slip: issues/chart/red-base-wait/forks/comparison.md `## Taken`, operator 2026-10-10, Q2 2a: "a missing, crashed, timed-out, short-circuited or skipped unit is unverified, never known-red, and blocks ... A non-test error on both sides never exempts the tests it prevented." Foreclosed there: "command-exit comparison; crash exemption". #133 asks to change that lock for a check that names no tests.
- Seat text carrying the rule: skills/check-issue/SKILL.md, skills/implement-issue/SKILL.md and skills/merge-issue/SKILL.md Shared-context known-red paragraphs ("the red command logged a real test name and that name also fails on the base"), and skills/chart-issues/SKILL.md `## Direct route` landing step 3.
- The reported check is `bash -n install && bash -n bin/herdrapp && bash -n omarchy/apply-herdr-app-theme`: it stops at the first failure, so the same red on both sides still hides the third file's syntax check.
- The reporting leaf (herdr-setup `deeper-path-lookup`, terminal t11n, tab "deeper-path-lookup failed") and Tamdoma/herdr-setup#2 are outside the handed list: recorded only.
