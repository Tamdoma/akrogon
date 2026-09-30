# Review A: realistic-review-bar

Phase: `check.review` (initial review). Date: 2026-09-30.
Base: `14e045cf44daf5edf3413ba681fd5b66410b62ba`.
Reviewed head: `f47f5254b50cb48c3a1eb4c9cd1f18338b30f595`.
Verdict: **ready**. Requested destination: `merge`.

No peer review was read. No debate artifacts exist because `debate: no`. Reviewed under the rules in force at review start, not the leaf's own new text.

## Findings

None. No Fix and no Nit.

## Verification

- **V1:** Head is ahead of base (`git merge-base --is-ancestor` passed) and `git status --porcelain` is empty. The diff holds exactly the six owned files: `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`, `skills/chart-issues/assets/standing-design.md`, `docs/guide/phases.md`, `docs/guide/learn.md`. No `AREA.md` is in the diff, so no path inventory applies. No file under `issues/`, `src/`, `tests/` or the framework repo is touched.
- **V2 (C1):** Read the new check-issue block end to end. Lines 35, 37, 41, 43, the new 47 and 53 each apply the fix-bar: every Fix names its actual realistic source, consequence today and criterion, check or gap. Line 43 defines the four source kinds with the naming parenthetical, trace-or-output proof, handcrafted-alone-is-Nit, maintainability-needs-consequence-today and the rarity rule. Line 49 keeps failed checks and named-criterion scenarios always blocking.
- **V3 (C2, C3):** Line 45 states the three test-blocking cases and lists style, non-failing wording coupling, extra cases and coverage gaps as Nits while keeping the prose-wording test rejection. Line 41 requires each Nit to state reproduction or concern, why deferred and promotion evidence.
- **V4 (C4):** Implement skill line 42 states the smallest proving set, one-test-several-criteria, before-and-after proof per real bug, the four-consequence gate, extend-before-add and report linkage. Its `check.fix` limits repair to Fixes only with no separate Nit work or test. Template sections 2 and 8 carry the same rules with conditional end to end evidence; the observable-contract line and Playwright flags are intact.
- **V5 (C5):** The blanket mandatory line is gone, replaced with criterion and consequence driven cases. End to end evidence is conditional. No-vanity-tests, cheapest-test, Playwright and chain-trigger lines are unchanged.
- **V6 (C6):** `phases.md` and `learn.md` describe the new bars in the existing voice. Reran the meaning sweep on the lane: 3 hits, none contradicting (new line 43 itself; `files.md:25` and `idea.md:86` overview shorthands that state no blocking bar). A wider grep over `skills/`, `docs/guide/` and `README.md` surfaced only non-rules by meaning: broadcast wording, in-branch fail-first tests (a form of before-and-after proof), the untouched writer/checker and target-size standing lines, a brief-content line and an init fallback line. Ponytail, its symlink and plan-issue are untouched and conflict free.
- **V7 (C7):** Bundle at `/tmp/akrogon-realistic-review-bar-c7-bundle.md` exists; cases 1-3 carry verbatim findings with no added provenance and no verdict leakage (checked by grep). All four classifier transcripts exist under the lane session dir. Run 4 (`sa-7`) returned Nit, Nit, Nit, Fix, Fix with reasons matching the expected outcomes. Runs 1-3 were failed verifications that drove principled text fixes with the bundle held constant; that is red-then-green, not teaching to the test.
- **V8 (C8):** Reused the report's same-head evidence: format unchanged exit 0, typecheck exit 0, full `bun test` 339 pass 0 fail. Prose-only diff with no code change, so no check rerun. `git diff --check` is clean.
- **V9 (disclosed judgment call):** The dropped line-47 sub-triggers (agreement test, writer/checker disagreement, target-size test) follow the locked test-bar "blocks on tests only when" clause; the standing rules they enforced remain for leaves whose criteria require them. Intent confirmed, no finding.
- **V10 (docs):** Changed behavior is an agent reading the new rules; the describing pages changed with it. Unchanged pages checked (`files.md:25`, `idea.md:86`, `README.md:184-185`, `skills/AREA.md`) state no contradicting claim and all named paths exist.

## Documentation and scope

The diff stays within the brief's owned files and the design's exclusions. Plan decisions D1-D11 are implemented as written. The report records changed files with reasons, commands with results and artifact paths, base and head, limitations, zero unverified criteria and the full C7 run history. No reusable lesson beyond the leaf's own subject was found.
