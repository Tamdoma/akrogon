# Review A: proof-rules

- Base: `ea43b14eaa195c168d078b291eefd2fc3c5f4586` (origin/main)
- Reviewed head: `c39309cc41bdfbb7cf0c0242c474c54f15d12f1f`
- Debate: `no`, so no positions-A or rebuttal-A; judged against plan decisions D1-D10, acceptance criteria A1-A10, and design binding decisions.

## Verification evidence

- `git --no-pager diff --numstat origin/main...HEAD`: 13 added, 0 deleted; only the 5 owned files. Budget cap 20 satisfied (A9).
- `git --no-pager diff --numstat ... -- skills/chart-issues/assets/standing-design.md`: 4 added, 0 deleted (A9).
- `git --no-pager diff --numstat ... -- skills/implement-issue/ponytail.md skills/check-issue/ponytail.md`: empty output (A9).
- `bun test` rerun by me: 333 pass, 0 fail, 15 files, 88.29s (A10).
- No `AREA.md` in the diff; no deleted area file. `skills/AREA.md` index lines 12, 14 name changed files with still-accurate descriptions; no stale pointer.

## Criterion-by-criterion substance read

- A1 (standing-design bullet 1): cheapest sufficient test, cheapest counts creation plus upkeep, real model/outside call can be cheapest, slow or live run names what no smaller test proves. All present.
- A2 (bullet 2): trigger named (data, files, state or build input consumed by code another leaf owns); own code real; model/outside stages replay output recorded from one real run with source, revision or date and capture command; re-record never hand-patch; prompt/model/settings/output-shape/outside-call change runs one real call through consumer and checks, names property proved, re-records; unreliable-making outside change triggers re-recording; spine in consumer's blocking checks; faked "real" stage does not count; hand-written negative/edge inputs allowed; no merge requires a live model run. All present.
- A3 (bullet 3): in-branch fix bounds (no locked decision, no new feature, no acceptance-rule change); fail-first test in owning code's own tests; rerun changed stages plus every consumer of outputs; shared files/lockfile/env count as inputs; unsure means restart from a trustworthy point; every check with valid prerequisites runs, rest marked blocked, run still fails, product gates still stop the product, follow-ons grouped under root; stand-ins only in a separate diagnostic run never counted as proof; final proof valid at final commit; clean full run only when reuse cannot be shown or fresh start/order/whole-run behavior is under test. All present.
- A4 (bullet 4): one shared rule definition; model writer's instructions state checker's rule; kept second copy says why and has agreement test; tests keep independent expected results; group-size check states need for target count counting what renders; real-size test with real pool (pass) and too-small pool (design's refusal); model-judged such check tests known-acceptable and known-unacceptable at target size and states what stays unproven. All present.
- A5 (shapes.md): chain chart names spine command and stage table; per-stage criterion putting stage in spine and deleting obsolete stand-ins; blocked-by where spine needed first; rule owner named when writer/checker in different leaves; slow-run leaf's repair scope and final-proof rule; audit refuses stage-owning leaf without spine criterion. All six duties present.
- A6 (plan-issue `plan.synthesis`): plan.md maps each done-criterion to command, failure caught, size (seconds/minutes/hours/unknown), rerun trigger; slow-run leaf's plan names restart boundaries. Present.
- A7 (implement-issue): design-stop line sits immediately after the B-seat paragraph at old :31, naming `akrogon phase <slug> failed --reason` with the decision. Report gains wall-time recording for minutes/hours/unknown commands and the slow-run contents (in-branch fixes, reused stages with source commit, what changed and which stages it feeds, blocked checks). Present.
- A8 (check-issue): three Fix triggers stated after the Fix paragraph, with the slow-but-correct-test-is-a-Nit carve-out; look-alike exclusion present; "no review rerun beyond the rerun rule below" points at old :49, verified byte-identical at new :51.
- A9: 13 added, 0 deleted, both ponytail files untouched, no rewritten lines so the name-every-rewrite requirement is vacuously met (plan D2).
- A10: `bun test` passes; format skip is justified by package.json scope (`prettier --write src tests`), markdown-only diff.

## Findings

None. No Fix, no Nit.

Layout note: new lines in implement-issue and plan-issue are joined to their anchor paragraphs or set as standalone sentences; substance unambiguous, consistent with the report's declared layout constraint.

## Verdict

`ready`

---

# Merge pass evidence (slot A)

- Fetch + rebase onto `origin/main` (`ea43b14eaa195c168d078b291eefd2fc3c5f4586`): no-op, HEAD `c39309cc41bdfbb7cf0c0242c474c54f15d12f1f` already directly on top. No conflict, so no range-diff applies.
- `AKROGON_BASE` after rebase: `ea43b14eaa195c168d078b291eefd2fc3c5f4586` (unchanged).
- `bun run format`: all files `(unchanged)`, worktree stayed clean.
- `bun run typecheck` (`tsc --noEmit`): clean, no output.
- `bun test --changed="$AKROGON_BASE"`: 5 changed files, no test files affected, 0 pass / 0 fail.
- `bun test`: 333 pass, 0 fail, 3896 expect() calls, 15 files, 90.66s.
