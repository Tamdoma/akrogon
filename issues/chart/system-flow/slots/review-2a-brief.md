# Brief: B review of 2a (direct route)

Operator chose 2a in the system-flow round: land the three repair-loop fixes, door implements, B reviews. Review as the lifecycle reviewer would. Read-only; no lifecycle commands.

Changes:
1. Akrogon commit 23abf2f in worktree `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-akro-2a` (branch system-flow-2a, base origin/main f412697).
   - `skills/check-issue/SKILL.md:79`: the closing clause "a proven product defect whose repair needs a live rerun is still handed to A" contradicted the same paragraph's "a proven product defect whose repair needs that replay stays with B". Now: "a proven product defect is never this stop and follows the repair split above." The clause's original job (test-proof-rules leaf: a product defect is not the missing-machinery stop) stays.
   - `skills/implement-issue/SKILL.md:82`: "the failing output and the recorded command are the finding and the replay's target" (left from bounce-repair-proof) contradicted :80 (fb236ec: replay the narrowest reproducing command). Now: "the failing output is the finding and the reproducing command is the replay's target."
2. Framework commit 176e96f2d in worktree `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-fw-2a` (base origin/main 14dc8fe15): `package.json` moves `skills:scan sections:scan` from `framework:verify:rest-a` into `framework:verify:cheap` (the leaf `checks`; `framework:verify` still runs cheap at merge, so merge coverage is unchanged and nothing runs twice). Both scans pass in about 0.1 s.

Check:
- Is either new sentence wrong, ambiguous, or in conflict with any other line in skills/check-issue, implement-issue, merge-issue or plan-issue (search for "recorded command", "live rerun", "replay")?
- Does the framework move drop the scans from any path that needs them, or run them twice?
- Anything a seat could now misread into skipping the full merge verify.

Write findings with path:line, then a verdict line `Verdict: ready` or `Verdict: fix`, to exactly:
`/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/review-2a-B.md`
