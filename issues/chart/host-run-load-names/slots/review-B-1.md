# Direct review B, round 1

Verdict: **fix**

Base: `68a3076d43851a0d3b750680e69fa6dfe07679d7`  
Reviewed head: `9bec9b992e646006aaa163f1a8e8d0cdd405ad04`  
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/host-run-load-names`

## Fix

- F1. **A targeted test filter is mistaken for a full-suite command.** With `checks.test: bun test` and `full: [test]`, the legitimate targeted invocation `run-check --name targeted -- bun test --test-name-pattern "bun test"` queues behind a full holder. Its final argv element is filter data, not another invocation of the configured command. `argv.join(' ')` loses that distinction, and the suffix/boundary check accepts the space preceding the filter (`src/run-check.ts:188-192`). A targeted check now waits for an unrelated full suite, contrary to direct plan criterion 2 and the operator's targeted-work exemption. This is not the accepted false-negative residual for changed full commands. Preserve argument boundaries when classifying, and add this negative CLI case while retaining the real quoted-shell wrapper match. The literal suffix rule in criterion 1 needs narrowing where argument contents overlap criterion 2.

## Reproduction and verification

Used the real reviewed CLI with a temporary registered repo and fake systemd helper. Held a named full run, launched the targeted invocation above, then read status before releasing the holder. Status reported `targeted waiting 1`; the targeted process had not exited. It proceeded only after release. Bun then reported no tests in the empty fixture, so the fixture's target exit 1 is not a project test failure. The defect is the observed admission delay before Bun starts. The holder exited normally and the fixture directory was removed in `finally`.

Kept result: `check review-B-targeted-filter: 0 /home/ivan/Work/infra/akrogon/issues/chart/host-run-load-names/direct/check-review-B-targeted-filter-1792859018349-3388200.log`. Read back with `akrogon log`. Dependency setup ran first under the installation lock. No full test suite was launched by this review.

Read back the author's `direct/check-red-first2-1792858824592-3136637.log` and `direct/check-targeted-1792858866535-3170589.log`: the renamed-command case fails before the change and all 17 admission tests pass after it. Existing negative cases cover an appended filename and `xbun test`, but not a trailing filter argument containing the configured command. Ordinary end-boundary handling follows the enumerated delimiters. The loss of argument identity creates F1.

Full verify receipt `b1f7aba1-fe16-4681-b3c8-76d540698aa4` for this head remains in flight at the last read, with empty commands and no end. Criterion 5 is not yet verified. The door should retain its eventual result and obtain current-head verification after repairing F1. No duplicate full verify was started.

## Other review checks

- E1. Reviewed the config/checks reference pages and the complete five-file diff. Documentation describes suffix matching but does not resolve the targeted-filter collision. No unrelated code changes found.
- E2. Listed every literal repository path in changed `src/AREA.md` from the worktree root. All exist.
- E3. `34e6ce39` carries `Test-Change: tests/run-permit.test.ts`, citing the observed framework renamed-suite incident and red proof. It only adds the classification case. The trailer and before/after evidence are valid. No existing expectation or runner configuration was weakened.

Last operation: wrote direct review, verdict fix. No product edits, commits or phase transition.
Next: door repairs F1 and supplies current-head verification for slot B re-check.
