# Leaf review C: coverage-audit

Disagreements only. Every Taken decision and every adopted final-shape item has a home in the brief; readiness.yaml and state.yaml are right for a text-only leaf.

## V1 Criterion 6: "`bun test` passes" is a repo-wide checks command the audit refuses

`akrogon config` lists `test` under `checks`, so `akrogon verify` runs it on every leaf already. `assets/shapes.md` "Preflight and validation" refuses a criterion "claiming repo health outside leaf ownership" and "allows a repo-wide `checks` command only when the chart names the property no smaller test proves"; the chart names none, and the leaf touches no code. Precedent: `issues/closed/autopilot/any-consultants/brief.md` "Done-criteria" ends with the diff-name-only check alone. Change: drop "`bun test` passes" from criterion 6.

## V2 Criterion 6 and the design's open docs question contradict each other

Criterion 6: the diff "lists only the files named in What", and What names one docs page. Design "Leaf architecture", Open for the plan: any other docs hit "is owned and listed in the report". An implementer who finds a second docs hit cannot satisfy both. The question can be closed now: a grep of `docs/` for "waiver", "not narrowed", "declin", "limits stating", "what the call does not prove", "live-run line" and "review line" returns nothing, and the earlier map grep found only `docs/reference/files.md`'s `readiness.yaml` row ("Needs, grants and proofs"), which stays true. Change: remove the open question, state in the design that `docs/use/plan-work.md` "Review the handoff" is the only docs surface, and keep criterion 6's file list as the guard.

## V3 Criterion 1 writes signpost 2b into "Take" while the design excludes 2b

Criterion 1: "within the one operator-approved paid test budget (a run past an approved bound stays allowed with a warning)". Design "Binding decisions", signposts Exclusions: "2b (paid runs past a bound, owned by chart grant-run-count, Tamdoma/akrogon#126) have no home in this leaf." The final-shape adoption of B F1 says 2b "stands" and "grant counting is #126's", which is a statement that the leaf does not touch it, not that it restates it. Writing the warn-and-run rule into chart-issues "Take" puts #126's rule in a file #126's leaf may also edit. Change: drop the parenthetical from criterion 1; the budget sentence stands on its own.

## V4 B's standing dissent is not carried into the design

Fork "Taken" pick 1 records "Standing dissent: B on the review line format (accepts a semantic audit, not a new reporting line)". `SKILL.md` "Handoff", the peers paragraph, requires A to carry "any held disagreement into the leaf design". The design's verbatim copy of Taken includes the line, but the design's own text (Standing design, Leaf architecture) does not name the dissent or what the implementer does with it. Change: one line under Leaf architecture: the review line is written as decided; B's dissent is recorded and changes nothing in this leaf.

## V5 Criterion 1 "replaces the two special cases" against the design's "their specifics stay"

Criterion 1 says the general rule "replaces" the provider dry-run and locked-setting sentences. Design "Leaf architecture" says the two sentences fold in and "their specifics (real identity and target; same key, location and value) stay". A check reviewer reading criterion 1 alone can judge the kept specifics as an unmet replacement. Change: criterion 1 says "folds the two special cases into one general rule, keeping their specifics", matching the design.
