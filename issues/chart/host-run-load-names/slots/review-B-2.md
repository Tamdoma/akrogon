# Direct review B, round 2

Verdict: **fix**

Base: `68a3076d43851a0d3b750680e69fa6dfe07679d7`  
Previously reviewed head: `9bec9b992e646006aaa163f1a8e8d0cdd405ad04`  
Reviewed head: `135a8029e1f2dba66fbd6b14cd45599009afcc5d`

Reviewed only the two repair commits, `7d8595ab` and `135a8029`, including updated documentation.

## Findings

- **F1 closed for the reported filter case.** Direct argv with `--test-name-pattern "bun test"` no longer matches the whole configured command, and the quoted filter does not match a final shell step. The regression case also retains the nested `sh -c` wrapper path. Read back `direct/check-red-filter-1792859218499-3548101.log` (red on the prior matcher) and `direct/check-targeted2-1792859241195-3602787.log` (17 pass, 0 fail, plus clean typecheck). `7d8595ab` carries a valid `Test-Change:` trailer citing F1 and its red proof. No existing expectations were removed.
- **F2. The repair lets a full suite with leading shell whitespace bypass admission.** With `checks.test: bun test`, `full: [test]`, and another full holder, `run-check --name rerun -- sh -c ' bun test'` now starts immediately. Shell whitespace does not change the executed command. `script` uses `trimEnd()`, while the start alternative of the new regex requires the configured command at column zero (`src/run-check.ts:191-197`). The prior matcher accepted the preceding space, and direct plan criterion 1 explicitly includes a space boundary. This is introduced by `135a8029`, not the accepted residual for flags added after the command. It permits two full suites to overlap after an ordinary whitespace-only edit. Preserve leading-whitespace matching without restoring filter false positives, and add a CLI regression case that proves this invocation waits.

## Independent evidence

Ran a temporary registered CLI fixture with the reviewed entry point and fake systemd helper. Held a named full run, then launched `sh -c ' bun test'` under another name. Before releasing the holder, the second process had already executed Bun and exited. The empty fixture contained no tests, so no full suite was executed. Its exit 1 means no tests found, not a project test failure. The observed early execution is the admission defect.

Kept result: `check review-B-repair-boundary: 0 /home/ivan/Work/infra/akrogon/issues/chart/host-run-load-names/direct/check-review-B-repair-boundary-1792859383067-3641290.log`. Read back with `akrogon log`. Setup ran first under the installation lock. Fixture processes completed after normal holder release, and the temporary directory was removed in `finally`.

The same diagnostic also shows a printing-only nested-command string queuing. That behavior was already reachable with the prior suffix matcher, so it is not added as a new blocking finding in this repair-only review.

Full verify `e1bc7e12-4ade-450a-9ba0-408664952d81` for this head remains in flight at the last read, with no end or completed commands. Criterion 5 is still unverified. No duplicate full suite was launched. F2 requires a repaired-head verification result before approval.

All literal repository paths listed by changed `src/AREA.md` exist. The worktree is clean and HEAD matches the supplied SHA. No product edits, commits or phase transition were made.

Last operation: wrote direct repair review, verdict fix.
Next: door repairs F2 and supplies current-head verification for slot B re-check.
