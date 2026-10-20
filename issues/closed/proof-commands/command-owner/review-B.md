# Review B: command-owner

Base: `96a96979d15bc355115a70f409ec297a9fa81587`
Reviewed head: `92498f6de81daf6ce3f4f64009068a516f82baae`
Verdict: `fix`

Initial blind review. Debate is off, so no positions-B.md or rebuttal-B.md exists. No peer review was read. Code was not changed or committed.

## Fixes

### F1: Keep the equivalence guard in its single owner

`skills/check-issue/SKILL.md:57` names the shared rule but then restates its guard: “the correction observing the same result with the same tests and cases still running and a deliberate break still failing”. Criterion 3 explicitly requires judging the guard by naming the plan-issue section without restating it. Design's Interface and plan D1/D5 require a single owner. The review consumer now receives a second definition instead of following the one owned by plan.synthesis. Remove the repeated definition, retaining the reference and judgment requirement. This is a criterion-3 failure, not a preference about phrasing.

Evidence: `check review-b-rules: 0 /home/ivan/Work/infra/akrogon/issues/open/proof-commands/command-owner/implementation/check-review-b-rules-1792429388362-3905345.log`, read back with `akrogon log`.

### F2: Separate the rejected command's red evidence from the corrected command's green evidence

`skills/implement-issue/SKILL.md:82` makes the corrected command stand as the reproducing command, but its next sentence still requires that reproducing command and its arguments to have a red result on the rejected head. `skills/check-issue/SKILL.md:71` independently makes absence of that evidence a blocking Fix. In the command-only correction scenario required by criterion 2, the product already satisfies the result, so the corrected command can pass on the rejected head. The old command supplies the red evidence, not the corrected one. The new path therefore tells A to return with a green corrected command while still requiring unavailable red evidence for that command, and tells B to reject the report without it.

Keep the rejected command, output, base and head as the failure evidence. For an approved proof-command correction, require the correction record and corrected-command green rerun instead of a red result for the corrected command on the rejected head. Align A's recording instruction and B's re-check gate. Preserve the existing configured-check receipt and known-red requirements. This fails criterion 2's merge-returned command-correction outcome and plan D4. The criterion explicitly names this scenario, so no invented runtime fixture or prose test is needed.

Evidence: the same `review-b-rules` log shows implement-issue line 82 and check-issue line 71 together. `check review-b-context: 0 /home/ivan/Work/infra/akrogon/issues/open/proof-commands/command-owner/implementation/check-review-b-context-1792429374344-3896568.log`, also read back, records the surrounding flow.

## Criteria and documentation

- C1: Satisfied. plan.synthesis contains one paragraph covering every required rule element, including product invocations staying locked and no widening of live or paid actions.
- C2: Not satisfied because of F2. The Shared context and implement stop boundaries otherwise distinguish an unshowable result from a wrong proof command.
- C3: Not satisfied because of F1. B's repair exception and merge's routing send needed command corrections to A.
- C4: Satisfied. Read back `check-c4-red-1792428729373-2971492.log` (three original citations) and `check-c4-green-1792429027525-3238415.log` (no output). The report records `check c4-green: 0` on the reviewed head for the inverted no-match proof of `git grep -n "test-proof-rules" -- skills docs README.md`.
- C5: Satisfied. Direct form records corrections in `<chart>/direct/plan.md`; Standalone review consumes that file for proof mapping and correction judgment under the shared rule.

The four changed skills are the documentation and product surface. Read their affected sections, docs/reference-index.md, skills/AREA.md and the unchanged shapes.md criterion/audit rules. No AREA.md changed, no affected index description became stale, and the design's shapes.md and learnings exclusions remain untouched.

## Verification and test trailers

Reused the implementation's green `akrogon verify` on the exact reviewed head. Read back its format, test and typecheck logs with `akrogon log`:

- `implementation/check-format-1792429033917-3242288.log`: all matched files use Prettier style.
- `implementation/check-test-1792429223404-3242288.log`: 1,072 pass, zero fail, 65 files.
- `implementation/check-typecheck-1792429225847-3242288.log`: `tsc --noEmit`, reported exit 0.

No code, tests, fixtures, runner configuration or dependencies changed. No current-run gap requires repeating the full checks. Criteria 1–3 and 5 use review of the actual skill text as planned, rather than tests asserting prose. No proof-command correction was performed by this implementation, so there is no correction record to judge beyond the new protocol itself.

Test-Change trailers in `96a96979d15bc355115a70f409ec297a9fa81587..HEAD`: none. Reviewed all three commit messages and src/test-files.ts in `review-b-context`; only four skills/*/SKILL.md files changed, none matching that path rule. No existing test assertion or recording changed.

No Nits or operator actions.

## 2026-10-19 check.repair

Repair input: both initial reviews of `92498f6de81daf6ce3f4f64009068a516f82baae`. A reported ready with no findings. B's F1 and F2 are repaired on `21422a68da2dd676f7e97077f18e4321ea7064f3`, one commit per Fix. These are corrections to the skill product, not changes to this leaf's proof commands or locked decisions. Nothing is handed to A and no operator action is open.

- F1: `7c80e3c` removes the repeated guard from check.review, keeping the reference to its sole owner in plan.synthesis. Before: “rule's equivalence guard — the correction observing the same result with the same tests and cases still running and a deliberate break still failing —”. After: “rule's equivalence guard”.
- F2: `21422a6` aligns A's report requirements with B's re-check gate. Both retain the original command's failing output and rejected base/head, plus the rerun command, arguments, base/head and green result. Product repairs still require a reproducing command red on the rejected head. Command corrections instead require the shared rule's correction record, with no red result required for the corrected command on the rejected head. Configured checks explicitly retain receipt and known-red requirements.

Before evidence: `check repair-before: 0 /home/ivan/Work/infra/akrogon/issues/open/proof-commands/command-owner/implementation/check-repair-before-1792429430937-3952860.log`.

After evidence:

- `check repair-f1-after: 0 /home/ivan/Work/infra/akrogon/issues/open/proof-commands/command-owner/implementation/check-repair-f1-after-1792429436162-3956904.log`
- `check repair-f2-after: 0 /home/ivan/Work/infra/akrogon/issues/open/proof-commands/command-owner/implementation/check-repair-f2-after-1792429451176-3974311.log`
- `check repair-criteria: 0 /home/ivan/Work/infra/akrogon/issues/open/proof-commands/command-owner/implementation/check-repair-criteria-1792429458717-3983243.log`
- `check repair-proof-read: 0 /home/ivan/Work/infra/akrogon/issues/open/proof-commands/command-owner/implementation/check-repair-proof-read-1792429464902-4004539.log`

All cited logs were read back with `akrogon log`. No prose assertion test was added, as the locked design requires review reads for these criteria. The planned review proof existed before B's repairs.

Current criterion proof on `21422a6`: C2 and C3 pass the planned review read. For C2, the old command can stay red while the corrected command is green even on the rejected product head, and A and B now accept the same evidence. Ordinary product repairs still need red-before/green-after evidence. The implement stop boundaries remain scoped to unshowable results. For C3, B judges the single guard by reference and still routes needed proof-command corrections to A. C4 was rerun using the planned git-grep no-match proof and passed. C5 was re-read because both skills changed: direct correction records and standalone proof mapping still use `<chart>/direct/plan.md`. C1's unchanged paragraph retains its prior passing review evidence.

No test, fixture, runner, config, lockfile, AREA.md or index was changed. No Test-Change trailer is required. No reusable Nit is held.

Final verification: `akrogon verify` exited 0 with `verify leaf 21422a68da2dd676f7e97077f18e4321ea7064f3: green`. Format, test and typecheck each exited 0. Test result: 1,072 pass, zero fail across 65 files. Read back all three logs with `akrogon log`:

- `implementation/check-format-1792429461243-3983337.log`
- `implementation/check-test-1792429658995-3983337.log`
- `implementation/check-typecheck-1792429661392-3983337.log`

No merge_checks ran. All Fixes are resolved and the repaired head is ready for merge.
