# Direct review B, round 1

Verdict: **fix**

Base: `0ed00de652e571bd54481244c1b6aed1f000c176`  
Reviewed head: `5fc3a6110f013b2f568b5dc49c65728556ba17c0`  
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/host-run-load`

## Fixes

- F1. **The required cross-repo outcome has no regression proof.** The test mapped to plan criterion 1 creates two worktrees from the same `Fixture` and repository (`tests/run-permit.test.ts:263-275`). Every added serialization/FIFO case uses that same single-repo arrangement. The actual incident is competing framework, lingua-relay and akrogon suites (`issues/chart/host-run-load/INTAKE.md:60-66`), and the fork explicitly requires two repos sharing one state home (`issues/chart/host-run-load/forks/full-suite-line.md:30`). A per-repo limiter would pass these tests while leaving that incident unresolved. Add the cross-repo CLI case with a shared admission home, prove the second full command waits and a light command proceeds, then rerun the changed test. This is a criterion-1 proof gap, not an observed defect in the current global lock.
- F2. **Required full verification is incomplete.** Plan criterion 7 requires green full verify on this head (`issues/chart/host-run-load/direct/plan.md:12`), but the report still says pending (`issues/chart/host-run-load/direct/report.md:21`). Receipt `9d559909-ca10-4be3-bcd8-081b302719e9` in `issues/verify-runs.jsonl` has this head, merge scope, empty commands and no end. Setup and format logs pass, but they do not establish passing tests/typecheck. Finish the existing verify and record its completed result before approval. After F1 changes the head, obtain the required current-head receipt. No duplicate full suite was launched during review.

## Evidence and scope

- E1. Independently ran `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/host-run-load/direct --name review-B-targeted -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile && bun test tests/run-permit.test.ts'`. Result: **15 pass, 0 fail**, including both nesting cases, FIFO, death, config rejection and waiting-only status. Kept result: `check review-B-targeted: 0 /home/ivan/Work/infra/akrogon/issues/chart/host-run-load/direct/check-review-B-targeted-1792856155547-3401216.log`. Read back with `akrogon log`.
- E2. Read back targeted4 and deliberate-break-nested logs with `akrogon log`: six full-suite cases pass, and removing the nested fix makes the relevant case fail. The reviewed test file/helpers have no later changes beyond that proof. No unrelated failures were encountered, so retry/known-red was not needed.
- E3. Reviewed config/checks documentation against classification and admission. Listed every literal repository path named by changed `src/AREA.md` from the worktree root with existence checks. All exist. The implementation uses the shared status renderer and suppresses the section when no full suite waits.
- E4. Earlier R1 is fixed by heavy-parent-aware token inheritance (`src/admission.ts:93-101`). Normal cleanup counts ended holders until record removal. SIGKILL cleanup overlap, arbitrary seat names and SIGSTOP queue blockage are explicitly accepted in the fork's rebuttal outcomes, so they are not reopened here (`issues/chart/host-run-load/forks/full-suite-line.md:45-50`). No additional concrete product defect found.

## Test-Change trailers

- `292d97a8`: adds the initial five full-suite cases, citing the operator's chosen fork. Valid new behavior coverage, subject to F1.
- `bad2c0f7`: changes the wait assertion from the first timing event to the longest wait, citing the observed holder's 51 ms wait. Valid correction because both holder and waiter have the same check name.
- `8551d6ad`: adds full-under-light coverage, citing B R1 and the earlier red head. Valid criterion-4 case.
- `37026206`: replaces polling outer stderr with polling status, citing buffered inner output and the timed-out proof. Valid observation correction, preserving the same waiting outcome.

Last operation: wrote direct review, verdict fix. No code edits or phase transition.
Next: door repairs F1 and completes F2, then requests slot B re-check.
