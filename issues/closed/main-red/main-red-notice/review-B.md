# Review B

Base: `c9f658b16d3cf8ee4a153260f54756410bbc8786`
Reviewed head: `7e08d2b7a46be18c27102e3265e6f1c7afa52da7`
Verdict: **fix**

Reviewed brief, design, plan, implementation report, the entire initial diff, `docs/reference-index.md`, `src/AREA.md`, and the verify contract in `docs/guide/setup.md`. Debate is off, so positions/rebuttal artifacts are absent as expected. No peer review was read. No code was changed or committed.

## Fixes

### F1: A green receipt on the same revision clears every subsequent red incident

Location: `src/verify.ts:205-211`.

Source and criterion: brief criteria 2 and 3 explicitly require a passing observation on the red revision to clear the incident, a later failure to notify again, and repeats of that new unresolved incident to remain silent. This also occurs when a flaky check passes and later fails without main advancing.

Trace: notified base red at S → completed green receipt at S → fresh base red at S → another fresh base red at S. The scan treats the historical green at S as resolving both later red records because ancestry equality passes without any observation-order check. Therefore neither later notice covers the incident. The two later runs both notify, producing three total notices instead of two. The problem persists until the tested revision changes. The report's limitation does not override the brief's repeat-silence requirement.

Proof: existing fixture helpers and real CLI runs, with `greenReceipt` recording the brief's same-revision passing observation between the first and second red runs. Both later `verify --known-red` calls exit 0, but the final notice-count assertion fails: expected 2, received 3.

Required result: preserve the ancestry rule for older/newer revisions and ensure an earlier clearing observation cannot clear a subsequent red incident at the same revision. Add a regression for red → green → red → repeated red at one revision.

### F2: A failed setup produces a false main-red test notification

Location: `src/verify.ts:356-358`, `src/verify.ts:189-193`.

Realistic source: a configured setup command fails, such as the repository's dependency installation failing. `runOnce` copies that setup failure's exit/log into each command without executing the checks. The finalize path nevertheless calls `newRedUnits` for every base record, without requiring `completed(me)` (`end` present and setup 0). `failedTests` turns the setup log into `(no test name)` and the code sends a test incident notice.

Consequence today: the operator receives `1 new red on main: (no test name); ...; chart a repair` even though no test ran, and the failed-setup receipt stores `notice: shown`. This violates brief criterion 1's completed failing-test trigger and plan D3's completed/setup-0 red-observation contract.

Proof: configure setup as `echo dependency-install-failed; exit 9` and the check as `sh check.sh`, then invoke the real CLI with `verify --known-red`. Verify correctly exits 1, but its base receipt has `setup: 9`, `notice: shown`, and one notification instead of zero.

Required result: reserve/send only for completed base records with setup 0. Preserve the failed setup's receipt and verify result without creating a test incident.

## Verification

- Both findings reproduced together: `check review-B-boundaries-proven: 1 /home/ivan/Work/infra/akrogon/issues/open/main-red/main-red-notice/implementation/check-review-B-boundaries-proven-1792230820368-3524686.log`. Read back with `akrogon log`. Two named tests failed at their intended assertions. Temporary probe files and fixture repositories were removed. The probes copied existing test helpers into a temporary test file and exercised the real CLI with fake herdr. These are failures caused by this diff, so the unrelated-red retry rule does not apply.
- Current implementation evidence is valid for the planned cases: C1–C5 logs below were read back, yielding seven passing cases. They ran after the latest test/helper change, on the reviewed product head. C4's actual `-t "herdr"` selects both delivery-error and absent-binary cases, correcting the narrower pattern in the plan's command example.
  - `check notice-c1: 0 implementation/check-notice-c1-1792230535107-3063868.log`
  - `check notice-c2: 0 implementation/check-notice-c2-1792230537116-3064264.log`
  - `check notice-c3: 0 implementation/check-notice-c3-1792230539585-3064772.log`
  - `check notice-c4: 0 implementation/check-notice-c4-1792230541840-3065820.log`
  - `check notice-c5: 0 implementation/check-notice-c5-1792230544812-3066770.log`
- Initial deliberate-red evidence was checked: `check notice-c1: 1 implementation/check-notice-c1-1792230382146-3051347.log` fails on the missing notification before product implementation.
- Existing `akrogon verify` receipt `1d8b307b-5db3-44c9-953a-1a0c41ad6b49` matches the reviewed head and current commands, with setup/format/test/typecheck all 0. Its recorded logs were read back: format passed, 1010 tests passed, typecheck passed. No required checks were skipped or disabled in this diff. A full rerun would add no evidence for the two targeted failures.
- Two preliminary probe invocations did not execute the probes (a per-run temporary-path mismatch, then stdin not forwarded by the wrapper). Their results are excluded. Only `review-B-boundaries-proven` above is behavioral proof.

## Documentation and paths

The existing setup guide's verify behavior remains valid. The AREA update describes the new notice/reservation behavior. Every literal `src/`, `tests/`, and `docs/` file pointer named by `src/AREA.md` exists, including all changed-behavior pointers. Listing trace: `check review-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/main-red-notice/implementation/check-review-evidence-1792230768877-3521055.log`. `issues/` and its runtime receipt/timing paths are absent in this sparse worktree by design and resolve in the registered checkout. No dead-pointer defect found.

## Test-Change trailers

`c9f658b16d3cf8ee4a153260f54756410bbc8786..HEAD` contains one:

`104c943ce3ab560485257eda7ce85ed77e7acec4`: `Test-Change: tests/verify.test.ts plan.synthesis and brief criteria 1-5: red tests for the main-red notice, its generation-based clearing, send failure and reservation rules`

`tests/verify.test.ts` matches `src/test-files.ts`. The trailer cites the brief outcomes the added tests exercise. Existing assertions/fixtures were not changed or deleted, only imports were extended, so no unsupported expectation correction exists. The existing tests miss F1 and F2.

## Nits and operator actions

None.

## 2026-10-17 check.repair B

Repair base: `7e08d2b7a46be18c27102e3265e6f1c7afa52da7`. Repaired head: `a02d845`.

- **B F1 repaired:** reproduction test `8210d717e706e9d5ed96d2238f5b34d350228498`, product fix `d5b12795fe0bec7d8d02301fe4f8b331d233fde7`. Clearing now requires a later completed green observation as well as landed-main ancestry. Historical equal-revision green receipts cannot clear subsequent red incidents. Appended the required dated implementation note to the plan without changing its other text or the design.
- **B F2 / A F1 repaired together:** reproduction test `3a4ac1f2c0b1f0b69967a8e023a257d8ad173e79`, product fix `c40697e017c96012a95b0c1fc62714983221cf5a`, test-format correction `a02d845`. The single scan call now requires the finalized base receipt to satisfy `completed`, covering both failed setup and incomplete command execution. Failed receipts and verify results remain intact.

Each product defect has its own reproduction-test commit followed by its fix commit. New reproduction tests are the only tests B added. Existing expectations and the locked design were not changed. Both test commits and the formatting commit carry `Test-Change` trailers citing the findings and their source. No operator actions, reusable B Nits, or handoff to A remain.

### Fail-before / pass-after evidence

All cited logs were read back using `akrogon log`. Paths below are relative to this leaf.

- F1 red: `check repair-f1-red: 1 implementation/check-repair-f1-red-1792230931779-3534138.log` — expected 2 notices, received 3. Green: `check repair-f1-green: 0 implementation/check-repair-f1-green-1792230939279-3535379.log`.
- F2 red: `check repair-f2-red: 1 implementation/check-repair-f2-red-1792230950686-3536830.log` — setup exits 9, expected 0 notices, received 1. Green: `check repair-f2-green: 0 implementation/check-repair-f2-green-1792230956365-3537410.log`.
- Both regressions pass on the final formatted head: `check repair-regressions: 0 implementation/check-repair-regressions-1792231007853-3690117.log` (2 pass).

### Planned proofs on the repaired head

Replayed all five planned proof groups after the latest test change. These are A's original tests, unchanged by B, and accept the repaired behavior. The existing C4 selector `herdr` includes both failed delivery and absent binary. Dependency setup ran under the configured install lock before proofs. Local fixtures use the existing fake herdr, create no live external resources, and are removed by their `finally` cleanup.

- C1: `akrogon run-check --name notice-c1 -- bun test tests/verify.test.ts -t "one main-red notice"` → `check notice-c1: 0 implementation/check-notice-c1-1792231007195-3689996.log`.
- C2: `akrogon run-check --name notice-c2 -- bun test tests/verify.test.ts -t "same unresolved unit sends nothing"` → `check notice-c2: 0 implementation/check-notice-c2-1792231007519-3690009.log`.
- C3: `akrogon run-check --name notice-c3 -- bun test tests/verify.test.ts -t "resolves only on green evidence"` → `check notice-c3: 0 implementation/check-notice-c3-1792231008408-3690046.log`.
- C4: `akrogon run-check --name notice-c4 -- bun test tests/verify.test.ts -t "herdr"` → `check notice-c4: 0 implementation/check-notice-c4-1792231007500-3690083.log`.
- C5: `akrogon run-check --name notice-c5 -- bun test tests/verify.test.ts -t "one notification|dead process"` → `check notice-c5: 0 implementation/check-notice-c5-1792231007207-3690064.log`.

### Full verification

The first `akrogon verify` on `c40697e` found a formatting error in the F2 reproduction's multiline function argument (`implementation/check-format-1792230971506-3542565.log`). B applied Prettier and committed `a02d845`, then replayed every targeted proof above. That earlier receipt cannot approve the final head. An attempted `akrogon stop-run f02d6c4e-5449-488b-a944-9dbfe29f8914` returned `No run f02d6c4e-5449-488b-a944-9dbfe29f8914 owned by scope ...`; no process was killed. The earlier run completed with 1012 tests and typecheck passing, format failing as expected.

Fresh `akrogon verify` on `a02d84506d1c99e76a08116264f3b992f3f0eda0` exits 0: **green**, setup/format/test/typecheck all 0. The kept logs were read back:

- `verify format: 0 implementation/check-format-1792231024298-3774460.log`
- `verify test: 0 implementation/check-test-1792231182720-3774460.log` — 1012 pass, 0 fail across 60 files, including both new regressions.
- `verify typecheck: 0 implementation/check-typecheck-1792231184778-3774460.log`

No merge checks were run. Working tree is clean and `git diff --check` passes. All review Fixes are repaired, with no Handed to A items and no operator actions. Ready for merge.

## 2026-10-17 merge B

Attempt: `e4fd5886-6883-4a43-afbc-131dc9247ce0`. Applied top: `a02d84506d1c99e76a08116264f3b992f3f0eda0`, built on `c9f658b16d3cf8ee4a153260f54756410bbc8786`, no members. HEAD matches the recorded top and the worktree is clean. No fetch, rebase, or additional code change was needed.

`akrogon verify --attempt e4fd5886-6883-4a43-afbc-131dc9247ce0` exits 0 and reuses receipt `05e4e8cb-1204-4f80-ac85-d4c3c9690b40` for identical tree `93f612341975814029c00e62e4024a3394ead04e` and unchanged command set. Format, 1012 tests, and typecheck are green; the receipt logs were read back again. No advisory or extra merge commands are configured.

`akrogon phase main-red-notice merged --slot B --check --attempt e4fd5886-6883-4a43-afbc-131dc9247ce0` returned `ok`. Completion context was gathered from all three main-red leaf briefs before the final merge command.
