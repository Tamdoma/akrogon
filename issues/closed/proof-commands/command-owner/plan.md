# Plan: command-owner

Debate is off (`debate: no`); this plan is synthesized directly from `brief.md` and the locked `design.md`.

The leaf is skill-text only. Per the design's standing-design interpretation, no test exists for criteria 1, 2, 3 or 5 (a prose-asserting test is a vanity test keeping a copy of the text); their proof is B's review reading each changed section against the criterion. Criterion 4 is a repository search. No env names are configured and no credential is needed.

## Read-first

- `brief.md`, `design.md` in the leaf folder (authoritative criterion text and locked decisions)
- `skills/plan-issue/SKILL.md` — rule's home; `plan.synthesis` section
- `skills/implement-issue/SKILL.md` — Shared context failure ending, red-check paragraph, `implement` test-writing paragraph, `check.fix` merge-returned paragraph, `Direct form`
- `skills/check-issue/SKILL.md` — `check.review` red-check paragraph and proof-judging paragraph, `check.repair` exceptions and `Handed to A`, `Standalone review`
- `skills/merge-issue/SKILL.md` — `attempt top` repair exceptions, `Shared endings` red-verify paragraph
- `skills/chart-issues/assets/shapes.md` — criterion-shape rule the design cites as exclusion context; do not edit
- `docs/reference-index.md` and `skills/AREA.md` — doc pointers if a section description changes

## Decisions

- D1 — Rule home and shape. The proof-command-owner rule lives as one paragraph in `skills/plan-issue/SKILL.md` under `plan.synthesis` (design: the rule and its equivalence guard live in one paragraph of `plan.synthesis`). It states: a done-criterion locks only its observable result and `plan.md` owns the proof command; when a proof command is wrong — it departs from the repo's configured runner semantics, or it is red for a cause outside the leaf while the criterion's result holds — A replaces it with a command observing the same result, preferring the repo's configured runner; the equivalence guard is that the same tests and cases still run and a deliberate break still fails; A records old command, new command, reason and evidence of that guard; a runner command already written inside a criterion counts as proof under this rule; an invocation that is itself the product behavior the criterion names stays locked; a correction never widens a live or paid action. Other skills cite "the `plan-issue` `plan.synthesis` proof-command rule" instead of restating it (design interface, C).
- D2 — Stop boundary. The `failed` endings in `implement-issue` Shared context apply only when the criterion's result itself cannot be shown within the leaf (unsuitable machinery/environment). A wrong proof command no longer stops the pass; it is corrected under D1 before any failure ending.
- D3 — Correction record. On the leaf route A records the correction (old command, new command, reason, guard evidence) in `implementation/report.md` beside the criterion it proves. On the direct route the chart door records it in `<chart>/direct/plan.md` (criterion 5).
- D4 — Merge-returned path. In `check.fix` after a red merge ending, when the failure's cause is the proof command the pass keeps the rejected run's evidence as recorded, treats the corrected command as the rerun target, records the correction under D3, and a green corrected rerun returns the leaf to review without the old command turning green. Configured `checks` keep their receipt and known-red requirements unchanged (design avoidance mechanisms).
- D5 — B routes, never corrects. In `check.review` B judges a recorded correction against D1's equivalence guard by naming the `plan-issue` section; in `check.repair` and at merge a needed proof-command correction is listed under `Handed to A` / routed to `check.fix`, never made by B.
- D6 — Wording replacement. The three `test-proof-rules` citations are replaced at each site with a pointer to the D1 rule section; no new term, no stacked clauses (design: replaced at each point, not stacked).
- D7 — No mechanical check. No lint, registry or matcher validates commands in criteria (locked 3a).

## Units

All units are independent edits to disjoint files with no shared test resource. One wave, three units, listed order.

### Wave 1

- U1 — Owns `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`. Edits:
  1. plan.synthesis: add the D1 rule paragraph (single paragraph, placement beside the criterion/proof-command paragraph).
  2. Shared context failure ending ("A done-criterion still failing during implement or check.fix ..."): scope it to a criterion whose result cannot be shown within the leaf; wrong proof commands take D1 correction, not the stop.
  3. Shared context red-check paragraph ("During implement end and check.fix, a red test or check ..."): replace "a unit of the leaf's own done-criteria that is wrong is A's correction under `test-proof-rules`" — a wrong proof command is corrected under the D1 rule before the stop path; a criterion whose result cannot be shown still takes the stop.
  4. `implement` test-writing paragraph: the "wrong criterion ends the pass" sentence applies only to a result that cannot be shown; a wrong proof command takes D1 correction.
  5. `check.fix` merge-returned paragraph: add the D4 path — when the rejected run's failure cause is the proof command, keep the recorded evidence, correct the command under D1 (recorded in `implementation/report.md`), rerun the corrected command, and a green corrected rerun returns to review without the old command turning green.
  6. `Direct form`: the door corrects a wrong proof command under the same rule and records it in `<chart>/direct/plan.md` (criterion 5).
- U2 — Owns `skills/check-issue/SKILL.md`. Edits:
  1. `check.review` red-check paragraph: replace "becomes a Fix routed to A under `test-proof-rules`" with a Fix routed to A under the D1 rule section name.
  2. `check.review` proof-judging (the paragraph where B checks the report runs planned tests through `plan.md`'s commands): B also judges each recorded proof-command correction against the D1 equivalence guard by naming the `plan-issue` `plan.synthesis` section, not restating it.
  3. `check.repair` exceptions: add a needed proof-command correction to the not-repaired-by-B list so it lands under `Handed to A` (D5).
  4. `Standalone review`: where the rules name `plan.md`, the direct route uses `<chart>/direct/plan.md` (with the draft brief and design); B judges the proof mapping and any recorded correction from that file under the D1 rule (criterion 5).
- U3 — Owns `skills/merge-issue/SKILL.md`. Edits:
  1. `Shared endings` red-verify paragraph: replace "including any wrong expectation in its own done-criteria under test-proof-rules" — expectation corrections stay A's, and a needed proof-command correction routes to A through `check.fix` under the D1 rule.
  2. `attempt top` repair exceptions: make explicit that a needed proof-command correction is not an in-place fix — it routes to A through `check.fix` (D5), alongside the existing check-issue exceptions.
  3. Criterion-4 sweep: after edits, `git grep -n "test-proof-rules" -- skills docs README.md` must return no hits; also `grep -rn test-proof-rules docs/ README.md` to confirm no citation lives outside `skills/` (already verified clean at planning).

## Acceptance criteria and proofs

Each criterion's proof is a model-facing review read (B, `check.review` and `Standalone review`) unless marked otherwise; recordings are `review-A.md`/`review-B.md` or the standalone `out=` file; consumers are the merge gate and operator. Sizes: review reads are minutes; the grep is seconds.

| # | Criterion result (locked) | Observation | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | `plan-issue` `plan.synthesis` states the rule once with every element the criterion names | Boundary: the `plan.synthesis` section text. Before: no such paragraph. After: one paragraph covering result-locks/plan-owns-command, A corrects, configured-runner preference, equivalence guard, recorded fields, in-criterion runner command is proof, product invocation stays locked, no live/paid widening. Failure caught: missing or split rule text. Command: B reads the file against the criterion in `check.review`. | minutes | Re-review on any change to the paragraph |
| 2 | `implement-issue` applies correction before failure endings and handles the merge-returned case | Boundary: the five edited sections (U1 items 2–5). Before: stops covered wrong commands; merge-returned reran the recorded command only. After: correction path, stop scoped to unshowable results, corrected-rerun path. Command: B reads each changed section against the criterion. | minutes | Re-review on any change to those sections |
| 3 | `check-issue` judges corrections via the named section and hands needed corrections to A; `merge-issue` routes the same to A | Boundary: U2 items 1–3 and U3 items 1–2. Command: B reads each changed section against the criterion. | minutes | Re-review on any change |
| 4 | No text under `skills`, `docs` or `README.md` cites `test-proof-rules` | Boundary: repository text search. Before: 3 hits (skills/check-issue:69, implement-issue:40, merge-issue:79). After: zero. Failure caught: a stale or renamed citation a reader would follow to a dead leaf. Command: `git grep -n "test-proof-rules" -- skills docs README.md` exits nonzero (no output). Intended red already observed at planning via `akrogon run-check --name c4-red`: `check c4-red: 0 .../check-c4-red-1792428729373-2971492.log` printed the 3 current citations. | seconds | Rerun after any edit under `skills/`, `docs/`, `README.md` |
| 5 | Direct route: door corrects under the same rule recording in `<chart>/direct/plan.md`; `Standalone review` judges proof mapping and corrections from it | Boundary: `implement-issue` `Direct form` and `check-issue` `Standalone review` sections. Command: B reads both sections against the criterion. | minutes | Re-review on any change |

No `merge_checks` configured; none added. `akrogon verify` (format, test, typecheck) runs at implement end on the committed head as the standard receipt; the grep command above is the criterion-4 proof and uses no new machinery.

## Restart boundaries

Serial file edits only; each unit's edits are committed together. A resumed pass continues from the live diff and re-derives remaining edits from this checklist.

## Affected docs

- `skills/AREA.md`: one line only if a section description changes materially; otherwise unchanged — the skills' own text is the doc.
- No `docs/` or `README.md` doc is affected (verified: no `test-proof-rules` citations there; no behavioral command changed).
