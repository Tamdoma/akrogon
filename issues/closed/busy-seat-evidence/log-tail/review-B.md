# Review B: log-tail

Date: 2026-10-02. Phase: check.review, initial blind review.
Base: `5bb552d0e2726cab6469699541317fe53053bd6c`.
Reviewed head: `082033a63ecdddf8484ed037b21414ebff88e2bb`.
Verdict: **fix**.

## F1. Fix: concatenated commands receive a false literal identity

Location: `skills/watch-issues/scripts/log-tail.ts:169-194`, especially the immediate return after reading a string at line 191.

Actual source: the real Codex session `/home/ivan/.codex/sessions/2026/10/02/rollout-2026-10-02T12-45-55-01a0fc38-7cb2-7f31-8388-738b9b09bf4b.jsonl`, complete record 334, call `call_XeabmjvlKAMz9PwGwEd5AqR5`, timestamp `2026-10-02T11:35:12.999Z`. This is the same source session used for the committed Codex excerpt. The seat constructs its test command from a list of test names and a loaded temporary directory:

```javascript
const dir=load("recheckTmp");const base="./.claude/skills/admin-emdash-fleet/test/";
const names=["backup-site","backup-store","export-tool","fleet","fleet-lock","register","restore-drill","schedule-install"];
text(await tools.exec_command({cmd:"bun test "+names.map(n=>base+n+".test.ts").join(" ")+" > "+dir+"/unit.log 2>&1; result=$?; tail -n 6 "+dir+"/unit.log; exit \"$result\"",max_output_tokens:800,yield_time_ms:10000}));
```

Trace: copied source records 1 and 334 verbatim into a JSONL file in a newly allocated temporary directory and ran the actual `bun skills/watch-issues/scripts/log-tail.ts <file>`. Exit 0, stdout:

```text
2026-10-02T11:35:12.999Z exec bun test  #72c59fba -> running:
```

Required output:

```text
2026-10-02T11:35:12.999Z exec <expr> #- -> running:
```

Consequence today: `readArg` reads only the first string token of an expression and treats it as the entire command. Different dynamically assembled test commands sharing `"bun test "` receive the same usable hash, despite different files, arguments or directories. The watch's command-identity evidence is therefore false and can satisfy the repeated-command rule for distinct work. This violates plan D4/D5 and the brief's non-literal command contract. Existing tests cover identifiers and interpolated templates, but not concatenation beginning with a literal.

Repair: establish that the whole argument value is a string literal before assigning a usable identity. Add regression coverage based on the recorded command above, retaining `<expr>`/`#-` for expressions. Do not execute logged source.

## Verification evidence

- Read the plan, locked design, brief, implementation report and provenance before reviewing the diff. `debate: no`, so no B position or rebuttal artifacts exist. Did not read or contact the peer review.
- Inspected all eight changed paths, the summarizer's collection/pairing/rendering paths, fixture expectations and edge tests, and the root gate `tests/watch-issues-scripts.test.ts`.
- Re-ran `cd skills/watch-issues && bun test scripts` for the command-identity concern: **37 pass, 0 fail, 131 assertions**. F1 is not covered by that passing suite.
- Ran the actual CLI against the committed Codex capture and excerpt. Fixture statuses, joined targets, truncation and pending-session markers match their test expectations.
- Independently compared the required source records with both committed excerpts byte-for-byte: all required pi lines 8, 422, 461-462, 485-488, 684-686 and Codex lines 18, 460, 466 are present unchanged.
- Accepted the implementation report's existing passing root checks and subpackage typecheck evidence. No code changed during review and no red check required a base rerun. The configured changed-test command selects no root tests for these script paths, as documented in the plan.
- Reviewed `skills/AREA.md`, `docs/reference-index.md`, and the unchanged watch skill describing the consumer. One shell command listed all file paths named by the changed AREA file and checked existence from the repository root, resolving its `scripts/` pointers within `skills/watch-issues`: all ten paths exist. The changed documentation accurately describes the new summarizer. Busy-rule integration remains owned by the sibling leaf.
- Fresh-capture provenance, cleanup and the precommit secret-value checks have recorded evidence in the implementation artifacts. The orphan-result behavior and newline flattening are disclosed in the plan implementation notes and report. They do not account for F1.
- Worktree remains clean. The F1 reproduction used a temporary directory and removed it after execution. No code or fixture edits were made.

## Operator actions

None.

## 2026-10-02 check.repair

Repaired both latest initial-review Fixes. No operator actions or items handed to A remain. Repair head: `a57d5fb`.

### B.F1: concatenated commands receive a false literal identity

- Test commit: `da14fd8` (`Test recorded concatenated command identity`). The regression copies the actual source code of Codex record 334 into a temporary session log and asserts `<expr>`/`#-` without executing the source.
- Failing proof: `cd skills/watch-issues && bun test scripts/log-tail.test.ts -t 'concatenated recorded command'` → **0 pass, 1 fail**, expected `2026-10-02T11:35:12.999Z exec <expr> #- -> running:`, received `2026-10-02T11:35:12.999Z exec bun test  #72c59fba -> running:`.
- Fix commit: `4dbf1ed` (`Reject command expressions beginning with a literal`). A string token is accepted only when its following non-whitespace/comment character terminates the object property value. A concatenation no longer acquires a literal identity.
- Passing proof: same command → **1 pass, 0 fail**, 2 assertions.

### A.F1: unsupported pi wrapped commands share the empty-target hash

- Test commit: `b15247b` (`Test identities for recorded unsupported pi wrappers`). Two different real `tools.bash` wrapper calls are copied from records 13 and 15 of `/home/ivan/.pi/agent/sessions/--home-ivan-.pi-agent-extensions--/2026-09-13T23-58-25-640Z_01a09d35-3768-73ed-8f93-ac97197d0b25.jsonl` into temporary test input.
- Failing proof: `cd skills/watch-issues && bun test scripts/log-tail.test.ts -t 'unrecognized recorded pi exec'` → **0 pass, 1 fail**. Both expected `exec  #- -> running:` lines instead contained `exec  #e3b0c442 -> running:`.
- Fix commit: `a57d5fb` (`Remove usable identity from unrecognized exec commands`). A scan with no recognized command returns no usable identity. This is the minimal repair explicitly allowed by A's finding. Older wrapper targets and results remain unsupported, but their empty targets cannot count as matching command identities.
- Passing proof: same command → **1 pass, 0 fail**, 2 assertions.

### Done-criteria and checks

- Criterion 1: all original captured fixtures are unchanged from reviewed head `082033a` (`git diff --exit-code 082033a HEAD -- skills/watch-issues/scripts/fixtures` → exit 0). Their recorded capture, byte-copy and deletion evidence remains in `implementation/provenance.md` and the implementation report. Harness versions, capture dates and commands remain in the test header.
- Criterion 2: excerpt bytes are unchanged, retaining the independent source-line comparison recorded above and the original precommit secret-value checks. No fixture or source log was modified during repair.
- Criteria 3 and 4: `cd skills/watch-issues && bun test scripts` → **39 pass, 0 fail, 135 assertions**, including every captured fixture, both excerpts, all ten original edge cases and the two recorded-source regressions. `bun run typecheck` in the subpackage → exit 0.
- Criterion 5 / configured test check: `bun test --timeout=30000` at root → **356 pass, 0 fail, 4139 assertions**, including `tests/watch-issues-scripts.test.ts`.
- Configured format check: `bun run format` → exit 0, all files unchanged.
- Configured typecheck: `bun run typecheck` at root → exit 0.
- Configured changed-test check: `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` → exit 0, 8 changed files but no root test files affected. The direct subpackage suite and root gate above supply the actual script verification.
- Final worktree status is clean. Repair changes only `log-tail.ts` and `log-tail.test.ts`. Temporary test inputs were removed by the tests. No `merge_checks` were run.

The original review's test-only command issued from the root selected no files because of root discovery scope. The actual failing and passing proofs above were run from the subpackage and reproduced the recorded defects.

## 2026-10-02 merge

Prior reviewed/repaired head: `a57d5fb85822f407ed4df98aea86adeb9a386f55`.
Fetched and rebased onto `origin/main` at `feeb382d3563e023585b277393adb8c19b90b1e4` without conflicts.
Rebased head: `bf88de02b3d4541accb6045e9bced3feb45355b4`.
Refreshed `AKROGON_BASE` through `akrogon config`: `feeb382d3563e023585b277393adb8c19b90b1e4`.

`git range-diff 5bb552d0e2726cab6469699541317fe53053bd6c..a57d5fb85822f407ed4df98aea86adeb9a386f55 feeb382d3563e023585b277393adb8c19b90b1e4..bf88de02b3d4541accb6045e9bced3feb45355b4` reports all nine commits unchanged (`=`). Repair commit mappings: `da14fd8` → `7ae365e`, `4dbf1ed` → `fb7895b`, `b15247b` → `7542744`, `a57d5fb` → `bf88de0`.

All configured checks rerun in the worktree after rebase:

- `bun run format` → exit 0, all files unchanged.
- `bun test --timeout=30000` → exit 0, **357 pass, 0 fail, 4148 assertions**, including the watch scripts test/typecheck gate.
- `bun run typecheck` → exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with the refreshed base → exit 0; 8 changed files, no affected root tests. The full root check above verifies the script suite through its gate.

No merge checks or advisory commands are configured. Worktree clean after checks. Read and gathered the four completion-owner briefs (`log-tail`, `busy-rule-log`, `seat-log-path`, `watch-scripts-check`) before marking the leaf merged.

`git push origin HEAD:main` → exit 0, confirmed fast-forward `feeb382..bf88de0` to `main`.
