# Review B

Date: 2026-10-06. Phase: check.review. Verdict: fix.
Base: 3ce20853c64d843d97a1ebe0fbef335958ac0dff.
Reviewed head: 4a56324e4c25263dbe3dcee93e641a6c6335201a.

Read brief.md, design.md, plan.md including implementation notes, implementation/report.md, and the check-issue ponytail reference before the diff. Debate is disabled, so no positions-B.md or rebuttal-B.md is expected. Reviewed the whole initial diff blind.

## Fixes

### F1 — Empty seats falsely report measured usage

Location: skills/chart-issues/scripts/chart-usage.ts:439–472.
Source: the documented outside-Herdr chart workflow writes `seats: []` (SKILL.md Open and shapes.md seats.yaml). Brief criterion 1 explicitly requires its table to say `usage unmeasured`.
Consequence: the script writes a table with zero operator wait and no unmeasured row, then prints `outcome done`. This presents an unavailable measurement as a successful zero measurement.
Proof: CLI run with valid opened/restatements and empty seats exited 0 and printed `operator wait 0.0 min, operator turns 0` followed by `outcome done`; USAGE.md contained no `usage unmeasured` row.
Required repair: represent the empty-seat measurement as unmeasured and partial, retaining exit 0. The existing sibling-summary test uses this exact source but asserts `outcome done`, contradicting brief criterion 1 and plan D3/D7. Cite that criterion when changing its expectation.

### F2 — Codex seat A never gets completed operator turns

Location: skills/chart-issues/scripts/chart-usage.ts:300–310.
Source: a chart door using Codex, supported by the harness-neutral seat record and the Codex transcript reader. Traced the design's actual Codex session `01a10f8a-d864-7f20-b425-d2fc02d57295`, assigned to A in a temporary chart, without altering its transcript. Window: 2026-10-06T16:34:47.701Z through 2026-10-06T20:16:00Z.
Consequence: every operator row is labelled incomplete and operator wait is 0.0 minutes even though the same script recognizes 19 completed seat turns and 28.3 working minutes. `replyEndMs` is always assigned null instead of being associated with the recorded completion. This violates brief criterion 3 and plan D5/D7's operator-wait contract.
Proof: exit 0, `outcome done`, summary `operator wait 0.0 min, operator turns 20`, per-seat `turns 19` and `working minutes 28.3`, and all 20 operator rows incomplete. The live transcript supplies the real source, rather than a handcrafted completion scenario.
Required repair: derive Codex operator reply ends from its real turn boundaries and distinguish injected context from operator messages. Add a boundary test for a Codex door's completed and incomplete operator rows. Current tests use Claude as the door and never assert Codex operator wait.

### F3 — An in-window counter reset is silently accepted

Location: skills/chart-issues/scripts/chart-usage.ts:275–283.
Criterion: brief criterion 5 requires a Codex counter reset to be handled or reported as an explicit error. Plan D6 specifically requires cumulative decreases to produce unmeasured usage and partial outcome.
Proof: ran the existing codex-reset.jsonl fixture with opened 2026-10-06T10:00:00Z and until 2026-10-06T20:16:00Z. Its recorded output counter decreases from 100 at 10:01 to 50 at 17:01. CLI exited 0, printed `A=50 output` and `outcome done`, and wrote `output_tokens 50` without an unmeasured error.
Consequence: usage before the reset is silently lost. Checking only final minus baseline detects a reset only if the final counter is below the pre-window baseline. A reset inside a chart with baseline zero is accepted.
Required repair: check successive relevant cumulative records, including the pre-window baseline, for decreases. The existing reset test starts after the first count and only exercises a negative final difference. Add the criterion's in-window reset outcome. This finding is grounded in the explicitly required outcome, not an asserted production incident.

### F4 — Operator wait uses array order instead of seat A

Location: skills/chart-issues/scripts/chart-usage.ts:368–371.
Source: valid seats.yaml entries populated from `herdr agent list`, with B listed before A. The schema and documented seat contract impose no ordering requirement. Brief criterion 3 and plan D5 require operator messages from A's transcript.
Proof: CLI runs with the same live A and B sessions and reference window, changing only entry order. A,B gives `operator wait 99.4 min, operator turns 20`; B,A gives `operator wait 0.0 min, operator turns 20`. Both exit 0 with `outcome done`, and both retain identical per-seat output totals (A 270787, B 49427).
Consequence: a valid seat-record ordering changes the chart's operator wait and rows to the peer's transcript.
Required repair: select the named A seat, not the first array entry, and cover reversed entry order at the CLI boundary. All existing multi-seat tests place A first.

## Verification and scope

- `bun test tests/chart-usage.test.ts`: 9 pass, 0 fail, 108 assertions. Rerun was justified by the counting and incomplete-turn concerns above. Green tests do not catch F1–F4.
- Independently ran CLI probes for F1–F4 with temporary chart folders. F2/F4 used actual transcripts. F3 used the existing edge fixture and a window covering both counts. Every probe exited 0 and created USAGE.md. All temporary folders were removed.
- Reviewed the report's deliberate-break evidence and checks: format unchanged, typecheck clean, full suite 510 pass, changed suite 9 pass. No unrelated check reruns were needed.
- Followed docs/reference-index.md to docs/guide/chart.md and inspected docs/guide/files.md. The changed guide and skill describe the new records and measurement behavior. files.md has no chart-record list. No AREA.md is changed, so no changed-area path listing applies.
- Skill Open/Take/Handoff rules and the shapes/guide record listings satisfy the planned prose edits. No model, effort, price, or rate literal is introduced into the script, skill, or guide. Whole-session cost labels read recorded values. Fixture leak markers are excluded by the passing boundary tests.
- `git status --short` is empty. No src/ or issues/ file is changed in the reviewed diff. Review artifacts are written only under the authoritative leaf.

## Test-Change trailers

`3ce20853c64d843d97a1ebe0fbef335958ac0dff..HEAD` contains no Test-Change trailers. Commits f954b04a24de338b9979bea03b7e9e05234169bd and 4a56324e4c25263dbe3dcee93e641a6c6335201a add new tests/fixtures or edit prose, and change no existing test file matched by src/test-files.ts. No trailer is required.

## Operator actions

None. No credentials, external writes, or operator-only access are required for these fixes.

## check.repair — 2026-10-06

Reviewed both initial reviews at head 4a56324e4c25263dbe3dcee93e641a6c6335201a. A's F1 duplicates B's F1. Repaired all four distinct Fixes. Repair head: 2351281. No operator actions or items handed to A remain. A's deferred Nits are outside this repair's Fix scope. B holds no reusable Nit requiring a new learning record.

### F1 — repaired

Test commit: 8348fbb. Fix commit: de184cb.
The empty-seat case now produces a `usage unmeasured` row naming seats.yaml and the empty seats field, with `outcome partial` and exit 0. Updated the existing empty-seat sibling-summary expectation because its `outcome done` contradicted brief criterion 1 and the documented outside-Herdr source. The test commit carries that source in its Test-Change trailer.

Command: `bun test tests/chart-usage.test.ts --test-name-pattern 'second run replaces'`.
Before: exit 1, 0 pass / 1 fail, expected `outcome partial`, received `outcome done`.
After: exit 0, 1 pass / 0 fail, 9 assertions, including the unmeasured label, sibling summaries, and replacement behavior.

### F2 — repaired

Test commit: e633e1a. Fix commit: b7bf856.
Codex operator rows use the recorded `metadata.user_input_order` to distinguish operator messages from injected context. Their recorded `metadata.retained_source.id.turn_id` associates each message with its task completion. The metadata is schema-validated at this boundary. A completion beyond the next operator message or window end leaves the row incomplete.

Verified these fields on the actual design Codex transcript. The injected AGENTS/environment record at 16:35:54.565Z has no user_input_order. The operator message at 16:35:54.647Z has user_input_order 0 and the same turn ID as the completion at 16:44:26.097Z. Existing scrubbed rollout-B.jsonl retains these record-level metadata fields and turn IDs.

Command: `bun test tests/chart-usage.test.ts --test-name-pattern 'Codex door'`.
Before: exit 1, 0 pass / 1 fail, expected operator turns 2, received 3, with zero wait and all rows incomplete.
After: exit 0, 1 pass / 0 fail, 7 assertions. The cutoff 16:49:30Z yields two operator rows, 8.5 minutes wait, the first completed reply and the second incomplete reply, excluding injected context.
Live rerun with that design session assigned to A at the full reference window: exit 0, `outcome done`, operator turns 19, operator wait 28.3 minutes, output 49427. No transcript bodies were printed.

### F3 — repaired

Test commit: 3cef78c. Fix commit: cff1140.
Compare every successive in-window cumulative record with its predecessor, beginning with the pre-window baseline. Any decreasing token class returns the existing explicit counter-reset error rather than silently dropping earlier usage.

Command: `bun test tests/chart-usage.test.ts --test-name-pattern 'wholly inside'`.
Before: exit 1, 0 pass / 1 fail, expected `outcome partial`, received `outcome done` for the existing reset fixture with both counts inside the window.
After: `bun test tests/chart-usage.test.ts --test-name-pattern 'counter reset'` exits 0, 2 pass / 0 fail, 10 assertions. Both a decrease below the baseline and an in-window decrease from a zero baseline produce unmeasured usage and partial outcome, with no false output_tokens 50 row.

### F4 — repaired

Test commit: f7b42cd. Fix commit: 2351281.
Operator rows select seat A by name, independent of the order in seats.yaml.

Command: `bun test tests/chart-usage.test.ts --test-name-pattern 'peer is recorded first'`.
Before: exit 1, 0 pass / 1 fail. After F2, reversed seats still selected B and gave 28.3 minutes wait / 19 operator turns instead of A's 99.4 minutes / 20 turns.
After: exit 0, 1 pass / 0 fail, 5 assertions. Reversed entries preserve A's 99.4 minutes / 20 operator turns and both output totals (A 270787, B 49427).

### Done-criterion proof after repairs

1. Read Open's seat-record rule and shapes' seats.yaml contract. The boundary test now proves empty seats report unmeasured usage.
2. Changed-file suite proves CLI summary/outcome, sibling summaries, USAGE.md creation, replacement, and no other chart writes.
3. Same suite proves per-seat fields, whole-session dollars, first-turn rows and operator rows. F2/F4 now cover Codex operator completion and named-A selection.
4. Repeated the plan's literal scan over script, skill, shapes, and guide. No model/effort/price/rate literal appears. Matches are ordinary prose substrings and the transcript field name totalCostUSD plus its required output label, not a dollar estimate. Sentinel model/effort values remain read from fixtures.
5. Changed-file suite proves exact token totals, repeated Claude message IDs, cumulative Codex differences, both reset positions, window exclusion, summed sessions, non-operator messages and incomplete turns.
6. Same suite proves unmeasured missing/ambiguous/broken transcripts, continued measurement of other seats, partial/exit 0, and nonzero invalid seats or missing chart folder. Empty seats now also follow the unmeasured path.
7. Fixture marker assertions pass, including the new Codex operator-row test. No message or tool bodies appear in the live table output.
8. Read Take/Handoff again: restatements are counted by meaning on answer-recording rounds, Taken retains the count, the script runs before review and again on Handed off/Held/Closed, and partial measurement continues handoff.
9. Both chart-record lists contain seats.yaml and USAGE.md. docs/guide/files.md has no chart-record list, as reported at implementation and initial review.
10. Repeated the three-session live CLI proof using a temporary chart, opened 2026-10-06T16:34:47.701Z and until 2026-10-06T20:16:00Z. Exit 0, outcome done. A: 152 assistant messages, output 270787, input 326, cache-read 19768778, cache-write 638581. C: 116, output 111968, input 250, cache-read 14434644, cache-write 336356. B: 19 turns, input 12716484, cached 12255616, output 49427, reasoning 9681. C and B match the reference exactly. A's difference remains the one assistant message group at 20:15:56.224Z already identified in the implementation report. At until 20:15:50Z, A matches exactly: 151 / 268671 / 324 / 19653997 / 635593. All three transcripts are present. Temporary charts were removed after verification.
11. Full suite passes and branch scope remains unchanged outside the planned owned surfaces. Repair commits change only chart-usage.ts and its boundary test. Worktree is clean.

Required checks, all exit 0:

- `bun run format`: all files unchanged.
- `bun run typecheck`: clean.
- `bun test --timeout=30000`: 513 pass / 0 fail, 5547 assertions across 24 files.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: 12 pass / 0 fail, 126 assertions, base 3ce20853c64d843d97a1ebe0fbef335958ac0dff.

All four test commits carry Test-Change trailers naming tests/chart-usage.test.ts and their criterion or real source. Every Fix has separate test and implementation commits. No merge checks were run during repair.

## merge — 2026-10-06

Attempt: 089a6952-cee5-4cec-93e5-7dfb048b2e3f.
Refreshed base: 0969a0f216f77e5e50d13367d0a7ebd09db3350c (origin/main).
Applied and tested top: c7e5de3cf166f5ef17b3c9932b2b0c1f1fa5080b.
Batch has no carried members. HEAD equals the prompted top and the worktree is clean. No commits, fetch, or rebase performed by the merge seat.

Compared `git range-diff 3ce2085..2351281 0969a0f..HEAD`: script/test commits remain equivalent after command-owned integration. The prose commit retains the already-merged sibling's blind-notes and move-reviewed-drafts behavior in its surrounding text. Read the integrated Handoff passage and confirmed both procedures remain present.

All configured checks exit 0 on this applied top:

- `bun run format`: all unchanged.
- `bun test --timeout=30000`: 513 pass / 0 fail, 5547 assertions across 24 files, 24.14 seconds.
- `bun run typecheck`: clean.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, with the refreshed base above: 12 pass / 0 fail, 126 assertions.

No merge_checks or advisory commands are configured. No operator actions remain. Completion owner is chart-door-cost: its peer-notes-single-writing leaf is already merged, and chart-usage-table is its last open leaf. Gathered both leaf briefs and the parent ISSUE.md for the completion update.
