# Review A: plan-condition-cases

Base `a4fc68d3`, reviewed head `abf1909` (`plan-issue: check each plan decision against its criterion's conditions before tests`). Diff: one paragraph added to `skills/plan-issue/SKILL.md` `## plan.synthesis`, between the credentials paragraph and "With `plan.md` written" — before the paragraph that writes criterion tests, matching brief `## What`.

## Criterion 1 — clause audit against landed text

- "before the criterion tests are written … each plan decision against every condition its done-criterion states (what must stay fresh, be retried, be refused, or not happen between)": landed verbatim, first sentence. ✓
- "tracing each value from where it is made to its last use through later calls, helpers and earlier iterations of a containing loop or batch": landed verbatim. ✓
- "each condition a decision can reachably break gets a case that fails on that violation, run where the decision's kept state lives (the same process, invocation or step), or the traced reason it cannot break": landed verbatim. ✓
- "each checked condition, its decision and its case or traced reason recorded in `plan.md` beside that criterion's observation": landed. ✓
- "each such case shown red at planning by a temporary edit that makes the decision's violation, discarded before the test commit, with the red output recorded beside the condition": landed. ✓
- "a count over cases where the condition holds does not prove the condition": landed. ✓
- "these cases prove the existing criterion, so an existing test that proves only the criterion's main result does not stand in for them": landed. ✓
- Ordering: paragraph sits before the criterion-tests paragraph. ✓
- `skills/check-issue/SKILL.md` and `skills/implement-issue/SKILL.md` untouched; no other file changed (opening-map agreement holds). ✓

## Criterion 2 — walk-through of the landed paragraph over design `## Case`

- Recorded criterion 3 ("failed lookup retried on the next call") × decision "memoize every result per process": the value is the memoized `null`, made at the first `commonDirectory(p)` call, used by later same-path calls in the process — reachable break under the trace. Required case: same process, lookup fails for path p, a later call for p re-runs the lookup — and "run where the decision's kept state lives (the same process)" forces the memo's process boundary, so two separate test processes would not exercise it. Recorded proof (call counts over four distinct paths) never fails-then-recalls one path: satisfies neither.
- Recorded criterion 2 ("no herdr write, prompt or wait between") × decision "one host-wide `pane list` read across `reconcileRepos`": "earlier iterations of a containing loop" traces the single read across repo iterations; repo one's `herdr tab close` is a write between the read and repo two's use — reachable break. Required case: two repos, write from the first repo's step between shared read and second use, second repo's list reflecting the write. Recorded proof (single-repo slice, no write) satisfies neither; the no-count sentence names why the count proof cannot stand in.

Both cases fall out of the text as written. ✓

## Docs

No `AREA.md` in the diff. Doc pages describing this behavior: `docs/reference/skills.md` plan-issue entry and `docs/reference/files.md` `plan.md` row — "the proof for each done-criterion" covers condition checks; no documented claim changed. One line: no documented behavior changed.

## Verification evidence

- `check skill-text: 0 .../implementation/check-skill-text-1793004636893-2674711.log` — 21 pass on head `abf1909`, rerun after the diff (input file changed since the planning-pass green).
- `akrogon verify` on `abf1909`: format 0, test 0 (1175 pass), typecheck 0 → `verify leaf abf19099…: green`. Receipt present.
- No `Test-Change:` trailers on `main..HEAD`; no test file touched.

## Findings

None. Fixes: none. Nits: none. Operator actions: none.

**Verdict: ready**
