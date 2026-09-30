# Implementation report: realistic-review-bar

Base: `14e045cf44daf5edf3413ba681fd5b66410b62ba`. Committed head: `f47f525`. Lane commits: `2ef9ae5` (U1), `8369480` (U2), `90c8c27` (U3), `f47f525` (A gate-driven sharpening). No file under `issues/` on the branch.

## Changed files and reasons

- `skills/check-issue/SKILL.md` (8 lines, U1, plus a 2-line A sharpening): fix-bar on every Fix trigger (lines 35, 37, 41, 43, 47, 53), test-bar (line 45), always-block anchor (line 49), three-part Nit format (line 41). The A edit pins down source proof: the input must be traced from the named source to the defect, defect-location pointers and harnessed handcrafted inputs establish no source, and the finding names which build, content, integration or entry point. Proves C1, C2, C3.
- `skills/implement-issue/SKILL.md` (2 lines, U2): smallest proving test set with consequence gate at line 42, Fixes-only repair in `check.fix`. Proves C4.
- `skills/implement-issue/brief-template.md` (3 lines, U2): same test rules in sections 2 and 8, conditional end to end evidence. Proves C4.
- `skills/chart-issues/assets/standing-design.md` (2 lines, U2): blanket mandatory line replaced with criterion and consequence driven cases, conditional end to end evidence. Kept lines 7, 10, 11 byte-identical. Proves C5.
- `docs/guide/phases.md` (2 lines, U3): test-evidence and blocking-finding paragraphs rewritten to the new bars. Proves C6.
- `docs/guide/learn.md` (3 lines, U3): Fix, Nit and lesson paragraphs rewritten; Nits stay in the record, repair works Fixes only. Proves C6.
- Verified unchanged: `skills/implement-issue/ponytail.md`, the `skills/check-issue/ponytail.md` symlink (target `../implement-issue/ponytail.md`) and `skills/plan-issue/SKILL.md`. No conflicting Fix or test rule in either file.

## Commands run with pasted results and artifact paths

Wave 1, worker U1 in `realistic-review-bar-u1`, commit `d93557c`:
`AKROGON_BASE=14e045cf44daf5edf3413ba681fd5b66410b62ba bun test --changed="14e045cf44daf5edf3413ba681fd5b66410b62ba"` → 0 pass, 0 fail, exit 0 (prose-only). Grep confirmed the bar on lines 35, 37, 41, 43, 45, 47, 49, 53 and no old blanket trigger remained.

Wave 1, worker U2 in `realistic-review-bar-u2`, commit `7fd4618`:
Same changed-test command → 0 pass, 0 fail, exit 0. Greps confirmed the new rules; `Mandatory negative` absent from the standing design; symlink verified. Note: the worker's no-conflict grep used basic-regex alternation that matches literally, so A re-verified with `grep -nE "Fix|Nit|mandatory|vanity"` on the lane: ponytail has no Fix or test rule, plan-issue has none. Claim holds.

Lane after each cherry-pick (`2ef9ae5`, `8369480`): changed-test command → 0 pass, 0 fail, exit 0 each time.

Wave 2, worker U3 in `realistic-review-bar-u3`, commit `b81b136`:
Same changed-test command → 0 pass, 0 fail, exit 0. Sweep log at `/tmp/akrogon-realistic-review-bar-sweep.log` (final A rerun on the lane, same result): 3 hits, no contradicting line. Hits: new `check-issue:43` text itself; `docs/guide/files.md:25` and `docs/guide/idea.md:86`, both overview shorthands stating no blocking bar, kept as out of scope.

Lane after `90c8c27`: changed-test command → 0 pass, 0 fail, exit 0.

A blocking checks on the lane (all worker worktrees removed):
- `bun run format` → all files unchanged, exit 0, 0.6 s.
- `bun run typecheck` → exit 0, 1.2 s.
- `bun test` → 339 pass, 0 fail, 3937 assertions, 78.07 s wall (1m18 with harness).

C7 gate: evidence bundle at `/tmp/akrogon-realistic-review-bar-c7-bundle.md` (verbatim F12, F17, F1 findings plus a constructed attacker-input case and a failed-check case; no provenance added to cases 1-3). Four fresh subagent runs, same bundle, rule text evolving between runs:
- Run 1 (`sa-4`, transcript `.../2026-09-30T16-49-18-838Z_01a0f338-75f6-74df-bdf4-b3429b2f1cfb.jsonl`): Fix, Fix, Nit, Fix, Fix. Cases 1-2 misread real harness runs as a realistic source.
- A clarification 1: a handcrafted input stays handcrafted when real test machinery runs it.
- Run 2 (`sa-5`, transcript `.../2026-09-30T16-50-36-788Z_01a0f339-a674-74df-bdf4-b344a5a4079c.jsonl`): Fix, Fix, Nit, Fix, Fix. Cases 1-2 misread bare file and line pointers as the allowed code trace.
- A clarification 2: the source is shown by tracing the input from that source to the defect; defect-location pointers alone establish no source; the source named is the actual one.
- Run 3 (`sa-6`, transcript `.../2026-09-30T16-54-00-153Z_01a0f33c-c0d9-74df-bdf4-b34702491015.jsonl`): Nit, Fix, Nit, Fix, Fix. Case 2 misread gate jargon ("live capture") as provenance.
- A clarification 3: the finding names which build, which user action or content, which integration, or which attacker-reachable entry point.
- Run 4 (`sa-7`, transcript `.../2026-09-30T16-58-05-002Z_01a0f340-7d4a-74df-bdf4-b3490857b205.jsonl`): Nit, Nit, Nit, Fix, Fix. Reasons: case 1 input synthetic and untraced from real content; case 2 handcrafted Alice/Bob HTML with contrived regex, no real content traced; case 3 passes 37/37 with only a hypothetical future rename; case 4 attacker payload traced from public form to admin session theft today; case 5 failed check exits 1. All five match the expected outcomes. Each run took minutes.

## Criterion to proof linkage

- C1, C2, C3: U1 edit plus A sharpening; plan greps rerun on the lane hit lines 35, 37, 41, 43, 45, 47, 49, 53.
- C4: U2 edit; grep hits implement SKILL lines 42, 60 and template line 13.
- C5: U2 edit; blanket line absent, conditional and kept lines present.
- C6: U3 edit plus A sweep rerun; log at `/tmp/akrogon-realistic-review-bar-sweep.log`.
- C7: run 4 verdicts above; bundle and transcripts pathed above.
- C8: format, typecheck and full suite green above.
- No new tests written per D9; no real bug fixed, so no before and after proof applies.

## Known limitations

- L1 from the plan holds: the five-case gate samples past cases only and does not prove uniform reviewer behavior on unseen inputs. Later chart-door measurement covers that.
- Out of scope sweep hits kept: `docs/guide/files.md:25`, `docs/guide/idea.md:86` (overview shorthands, no blocking bar stated), `skills/chart-issues/assets/standing-design.md:7` (kept verbatim line).
- Judgment call for review: U1 replaced the old line 47 sub-triggers (second copy without agreement test, writer/checker disagreement, group-size without target-size test) with the missing-test Fix format instead of gating each by the bar. The standing design still states the agreement-test and target-size rules, so a criterion requiring them can still block through the test-bar; free-standing violations are now Nits. This follows D2 but reviewers should confirm the intent.

## Unverified criteria

None. C1 through C8 each hold with the evidence above.

## Repair round 1 (review-B F1)

Before: `f47f525`. After: `c8162fc` (cherry-picked from worker commit `8c010f0`).

F1: `docs/guide/phases.md:101` directed repair on a contract violation alone through a sourceless CSV example. Repaired in place to name real user content (newline pasted from a user spreadsheet), the consequence today (extra row breaking import) and the hit criterion. One line in one file; all surrounding lines byte-identical.

Verification: worker re-ran the meaning sweep (4 hits, all judged, none contradicting) and re-read both guide sections; changed-test command passed on the worker tree and again on the lane after the pick (0 pass, 0 fail, prose-only). No full-suite rerun: prose-only repair with no code change, and the finding seat stated no rerun was warranted. Worker worktree removed. No other doc made stale. C6 now holds on the repaired line; C1-C5, C7, C8 unaffected (check-issue text untouched since the C7 gate).
