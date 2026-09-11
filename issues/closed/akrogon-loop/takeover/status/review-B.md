# Review B: status

Base: `33387facaaa93d38f2937d646f262233812cdf50`
Reviewed head: `333ce854da8798f06be1674bc9daa9ae4da42730`
Verdict: **fix**

## Findings

### F1 — Fix: unreadable state can disappear from a successful scan

`src/status.ts:43–51` detects a directory entry named state.yaml, then passes the directory back to `leavesUnder`. That helper checks `existsSync(state.yaml)`, which follows symlinks. With a dangling state.yaml symlink it returns false, treats the leaf as a container and returns an empty list. Status consequently reports a successful empty repo, without the unreadable path.

Reproduced against the reviewed head using a real CLI subprocess and a temporary repository: create a failed leaf, replace its state.yaml with a symlink to an absent file, then invoke status from outside the repo. Actual result:

```json
{"scenario":"dangling state.yaml symlink","code":0,"stdout":"repo","stderr":""}
```

This violates plan D3/C3 and brief done-criterion 1: unreadable repo data must be named and produce a nonzero exit, never an apparently complete scan. It also exposes the same incorrect empty-success path if the state file disappears after directory enumeration.

Repair: once traversal discovers state.yaml, read that leaf's state directly using the existing parser, instead of re-entering the missing-path-tolerant recursive discovery helper. Keep the exact state path in the diagnostic. Add a fail-first subprocess regression with another readable repo, asserting nonzero exit, the affected repo/path, and retained readable output. No shared state/routing changes are needed.

Reproduction command, run from the worktree (fixture cleanup executes in finally):

```sh
bun -e 'import { fixture, leaf, cli } from "./tests/helpers.ts"; import { unlinkSync, symlinkSync } from "node:fs"; import { resolve } from "node:path"; const f = await fixture(); try { const path = leaf(f, "unreadable-state", "failed"); const state = resolve(path, "state.yaml"); unlinkSync(state); symlinkSync(resolve(f.home, "missing-state.yaml"), state); const result = await cli(f, ["status"], f.home); console.log(JSON.stringify({scenario:"dangling state.yaml symlink", ...result})); } finally { f.clean(); }'
```

### F2 — Fix: tests lock human display serialization

`tests/status.test.ts:99–105` and `119–125` require literal strings such as `attempts=A:2,B:3`, `verdict=A:fix,B:nits`, `tab="w1:t9"` and `done=[]`. Later detail assertions require `phase: merged` and exact JSON punctuation for the slug. These are human output choices, not executable commands or fixed references. For example, displaying the same A/B verdicts in reverse order or omitting optional quotes around the tab preserves every required fact but fails these tests.

This is a concrete maintainability defect under the locked design's Command Tests decision and check-issue's explicit instruction to reject output-wording tests. Plan C6 and the implementation brief also require behavior/value tests, not display serialization tests.

Repair: retain the real command invocations and required field/value associations, but compare parsed YAML/JSON data where those formats already exist and make row assertions tolerate cosmetic spacing, quoting and slot ordering. Preserve assertions for hierarchy, attention order, exact numeric values, missing history, command arguments and file immutability. Do not introduce a public output mode or a large parser abstraction just for tests.

## Verification and scope

- Reviewed all six changed files against plan D1–D7, C1–C6 and the implementation report. No unrelated implementation changes found. Worktree was clean at the reviewed head.
- Existing evidence is valid for this unchanged head: `implementation/full-test.txt` records 30 passing tests, zero failures and 314 assertions. `implementation/typecheck.txt` records successful tsc, and the implementation turn records successful formatting and diff checks. No reason to repeat the whole suite during this review.
- Ran the additional F1 subprocess scenario above, which demonstrates a behavior not covered by that passing suite. No real herdr notification, pane, GitHub call or persistent fixture was used.
- Existing tests meaningfully cover multi-repo scans, age selection, authoritative detail from a worktree, no writes and failed-leaf notification/no dispatch. F2 concerns their assertion contracts, not replacing those scenarios.
- C7 remains the operator's post-merge takeover proof. This review does not claim that live acceptance. Plan L1 and L2 remain recorded limitations and do not independently cause this verdict.
