# Slot B review · paid-red-stop

Base `842db38b6f54b733d6a3d6cf97119c37f69e7cb4`
Reviewed head `445621864f30424d7ac4a46ebc70a2b7852bf8e4`
Verdict `fix`

## Fix

**F1 — Criterion 3. The shared retry still requires a paid relaunch that the new rule forbids.** In the merge flow named by the brief, consider a verify command that reaches its paid stage and fails for a setup cause outside the leaf diff. Without a passing free reproduction after repair or a live-only diagnostic with a new observation, `skills/lifecycle-rules.md:9` bars the next launch. But `skills/lifecycle-rules.md:25` says this red gets a same-command retry, and `skills/merge-issue/SKILL.md:73-75` directs B to that exact verify rerun on the unchanged head. The retry can buy the same failing run. The same conflict applies to the known-red comparison: `src/verify.ts:879-892` can run the same configured command set on the base. Changing the revision does not itself supply a free reproduction or a named new observation. Plan D4 and the report rely on the new rule covering merge, but neither instruction makes the mandatory retry or known-red run conditional. State in the shared rules that a retry or known-red command that would launch paid work must satisfy the paid-red rule before it starts. The configured checks here are free, so this finding comes from the merge-stage paid scenario criterion 3 explicitly requires.

## Criteria and evidence

- Criterion 1. The diff adds one paragraph under Grant reuse and count lines, with zero removed lines. Four sections and the count and repeat-bound wording remain. All four seat links resolve to the same file. In the watch-timer first paid matrix, Claude root ended red at 16:25:09.334 UTC and Claude shell started at 16:25:09.457 UTC under the same grant operation (`issues/timings.jsonl:16815-16818`, source plan D12). Reading the new paragraph against that sequence, the next ordinary cell must wait for the free reproduction to pass after repair. This addresses the back-to-back run recorded in `issues/chart/watch-live-speed/slots/map-e.md` F10.
- Criterion 2. A live-only diagnostic must name an observation earlier runs did not produce. If it returns the same watch-timer failure without that observation, the new paragraph ends paid launches of that operation at the seat's named `failed` stop. The four linked seat skills supply the stop command. This was checked by reading the rule against the incident, as the design specifies.
- Criterion 3. See F1.
- Docs. Checked `skills/AREA.md:18` and the reference index. The shared file still has the four documented sections and all four consumers. The same-command retry claim in `skills/AREA.md:30` reflects the conflict in F1. No AREA file is in the diff.
- Tests. `origin/main..HEAD` contains no `Test-Change:` trailers and changes no path matched by `src/test-files.ts`. No test or runner configuration was filtered, skipped, or changed by this diff.
- Proof. Read the kept `check docs-links: 0 implementation/check-docs-links-1795199615738-451820.log` (13 passed) and the format, typecheck, and test logs for leaf verify receipt `e8ebad41-8806-4499-8a85-4a381982ee1b` on the reviewed head. All three exited 0. `check test: 0 implementation/check-test-1795199683408-452233.log` records 1,233 passed. `git --no-pager diff 842db38b6f54b733d6a3d6cf97119c37f69e7cb4...HEAD -- skills/lifecycle-rules.md` confirms the planned added-lines-only check. `git diff --check` passed.
- Grant audit. `readiness.yaml` has no grants. Kept check logs and this leaf's timing rows agree with the report's free docs-links and verify runs. This review made zero covered launches.

## 2026-11-20 · check.repair

Fixed F1 in `a52d3dad76ee78769b62a18c6798a84030a75a18`. Review A had no Fixes.

- Before, the shared red-check section said a red with no cause in the leaf diff “gets one retry of that same command, args and scope.” It also directed a known-red run that could reach the paid operation on the base.
- After, the shared Grant reuse and count lines section says “Before any retry or known-red command, including at merge, check every paid launch it could trigger on the head or base and run the command only if this rule allows each launch.”
- Applied criterion 3 to the same merge commands. After a paid red, the seat cannot invoke either command if it could relaunch that operation without a passing free reproduction after repair or a qualifying live-only diagnostic. The check applies equally to a known-red base run. A command with no paid launch can follow the existing retry path. The same diagnostic failure without its named observation still triggers the operator-blocker stop. The implementation note in `plan.md` records this prerequisite.
- The planned base-to-head diff shows two lines added inside Grant reuse and count lines and zero removed lines. The count and repeat-bound wording and all four links are intact. `git diff --check` passed.
- Ran the planned `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` on the repair commit. `check docs-links: 0 implementation/check-docs-links-1795199876508-804335.log` records 13 passed, 0 failed.
- The first `akrogon verify` on the repair commit was red. Receipt `f5057396-ae30-4b5b-a2d3-f53dfb4922c3` had green format and typecheck. `check test: 1 implementation/check-test-1795199958927-805341.log` records one listener test timing out while waiting for a wake in its fixture's `passes.log`. The diff only changes the shared skill text and the listener test exercises an isolated event stream and a shimmed command. No plausible cause in the diff, so the unchanged head gets one same-command test retry through `akrogon run-check`.
- The unchanged-head test retry was green. `check test: 0 implementation/check-test-1795200039941-1071616.log` records the listener test passing and 1,233 passed overall. Recorded the original listener timeout as inconsistent.
- Final `akrogon verify` was green on the repair commit. Receipt `57157c11-ec8c-476c-b173-229956a510d5` records format, typecheck and test all exit 0. `verify test: 0 implementation/check-test-1795200115969-1334339.log` records 1,233 passed. Criterion 3 was verified by reading the shared rule against both merge paths. No paid launches ran.
