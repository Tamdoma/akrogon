# Round 4 intake (blind; each slot writes round4-<slot>.md and reads no other round4-* file)

## Context for a new slot
A /chart-issues door in akrogon (repo /home/ivan/Work/infra/akrogon). akrogon runs coding leaves through phases with two seats: plan.positions/rebuttal/synthesis -> implement (A, worker) -> check.review (B, codex reviewer) -> check.repair (B) / check.fix (A) -> merge (B). Skills: skills/plan-issue, implement-issue, check-issue, merge-issue, chart-issues (the attended door that writes briefs with done-criteria and hands off). Original operator intake: intake.md here. Operator goal: cut tests to what matters, stop agents bending tests to fit their own findings, stop AI-made unit tests with no real-world basis from blocking leaves.

## Taken so far (operator)
- Q1: changing an existing test expectation needs a cited source; and fix the criterion itself.
- 5a: test through the real boundary by default (CLI, HTTP, browser, DB); units only for tricky logic; E2E only where smaller misses.
- 6a: delete false/outdated checks with a reason; delete duplicates only naming the surviving test; check deletions as a batch; keep real-regression tests.
- 7a: fail-before/pass-after for fixes; one deliberate break for new behavior; no mutation score.
- Locks: issues/chart/realistic-fix-bar (09-30: smallest test set proving criteria, realistic-source Fix bar), reviewer-repair (10-02), test-time-and-temp (10-01). Open: framework-test-scope, test-runs, akrogon-slow-phases.

## Current Question (Q4, reshaped twice)
A criterion in a brief can demand a bad test (example: TMPDIR assertion `expect(tmp.startsWith('/var/tmp/akrogon-')).toBe(false)`, commit 175b862, blocked proof-order and wave-table until removed in 2dd1106; the real goal was "temp dir is private": containment and mode 0700). Today a seat can only stop the leaf (`akrogon phase failed`) and wait for manual recovery.
Rejected by the operator:
- Seat sends a bad criterion back to the chart owner (manual).
- "Bar at the chart door + A corrects proofs with a recorded reason + B checks corrections" — operator: "There must be a more elegant, automated way ... find out a better way without polluting the charting process with testing."

Find the more elegant, fully automated way. Constraints: no human step after handoff; do not add test rules to the chart door; the agent writing code must not be able to shrink its own target; fewest moving parts; prefer removing the problem class over guarding it (e.g. criteria that state outcomes only and leave proof choice to plan, tests owned by a different seat than the code, a mechanical check, deleting rule text instead of adding it). Inspect the actual skills (file:line) and akrogon src where relevant. Cite practitioner sources where they help.

## Output
round4-<slot>.md: diagnosis of why the problem exists (file:line), 2-4 options with one recommendation, what it deletes vs adds, pitfalls, under 70 lines.
