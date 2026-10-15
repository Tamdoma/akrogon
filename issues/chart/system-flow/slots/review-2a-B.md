# Seat B direct review: system-flow 2a

Reviewed 2026-10-15 against CHART.md decision Q2 2a and slots/review-2a-brief.md.
Akrogon: base f412697, head 23abf2f8de1cd0e99c18b1f489a3cbe27a53b4a3, worktree `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-akro-2a`.
Framework: base 14dc8fe15, head 176e96f2d3a3c4de2fbebd2dcb2bc8d9224c8a77, worktree `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-fw-2a`.

## F1 — The operator guide retains the live-repair ownership contradiction

Location: `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-akro-2a/docs/guide/phases.md:104`.
The guide still says B hands “required live runs” to A without qualification. The revised `skills/check-issue/SKILL.md:79` keeps an exact, already-planned and authorized live replay with B.
Real source: an operator or seat follows the indexed phase guide when routing a product repair whose existing planned proof requires a live replay. Following the guide sends that work through A and another review, recreating the ownership bounce 2a removes. The check-issue skill explicitly requires grounding in docs and reviewing the unchanged page describing the changed behavior.
Repair: qualify only the guide's live-run handoff description to match the existing split: planned authorized replay stays with B; new or widened live actions go to A. Preserve the separate rules for missing cases/recordings and expectation corrections. No additional rule or prose-matching test is needed.

## Other review results

- `skills/check-issue/SKILL.md:79`: the replacement distinguishes a product defect from the missing-machinery stop and refers back to the existing ownership exceptions. It does not authorize B to change expectations, locked decisions or live scope.
- `skills/implement-issue/SKILL.md:80,82`: the replay target now consistently means the reproducing command demonstrated red on the rejected head. `skills/check-issue/SKILL.md:69,91` and `skills/plan-issue/SKILL.md:63` match. The original failing command remains recorded as provenance.
- `skills/merge-issue/SKILL.md:41–43,53,67,73–75` still requires full configured merge verification and its green receipt. A targeted repair rerun cannot substitute for that gate. `docs/guide/phases.md:94` also describes the reproducing-command rule correctly.
- Framework `package.json:168–173`: both scans move from rest-a to cheap. Read-only traversal of the script references at base and head found each scan reached once by `framework:verify` at both revisions, and once by cheap only at the new head. The standalone scan commands remain unchanged at `package.json:11–12`. No inspected production caller requires rest-a alone to provide those checks. Their earlier execution can stop a bad fast stage before core, as intended.

## Verification

Both committed ranges pass `git diff --check`. Neither changes a test/fixture path or contains a Test-Change trailer requiring review. No AREA.md or lesson changes occur. Both worktrees have an untracked `system-flow/` directory containing direct-check logs, with no tracked changes beyond the reviewed commits.
At inspection, both exact-head verify receipts had a start but no terminal result. The brief reports successful individual scans; I did not rerun suites or lifecycle commands. Full landing verification remains the door's responsibility. No code, state or other review file was changed.

Verdict: fix
