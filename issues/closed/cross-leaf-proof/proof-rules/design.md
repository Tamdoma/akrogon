# Design: proof-rules

## Binding decisions, verbatim

Operator 2026-09-29 (CHART.md destination): "yes, cap it at 20 lines"; recorded as at most 20 added lines in the whole diff, one line per rule where possible. Operator 2026-09-29 split: "o1", one issue with one leaf. Debate: no (very small issue).

Operator 2026-09-29 intake note: "This leaf has been running for two or three days, which is just not acceptable. So something is wrong in the way that this is being tested. I need to make sure that the system, when it does this type of testing, actually creates the simplest, most effectie way to test so that issues progress faster if possible."

### proof-selection
Operator 2026-09-29: "1a | 2a |"

Q1 = 1a. Standing-design line beside the unchanged E2E lock: "Each done-criterion is proven by the cheapest sufficient test that catches its failure. A slow or live run names what no smaller test proves." Charting applies it when writing criteria. Plan synthesis maps each criterion to a command, the failure it catches, a size (seconds, minutes, hours or unknown) and its rerun trigger; one command may cover several criteria. Review makes a Fix when a failure the leaf's own code can cause is left untested in that leaf; a slow but correct test is a Nit; rerun rules unchanged. Cheapest counts creation and maintenance effort; a real model or external call can be the cheapest sufficient test when that behavior is under test.
Reason: the chart locks criteria before planning, so the rule must reach charting, planning and review.
Foreclosed: 1b plan-only, 1c no rule.

Q2 = 2a. No numeric budget. The implementation report records measured wall time for every command the plan sizes as minutes, hours or unknown.
Reason: no measured stage durations exist; data first.
Foreclosed: 2b a number now.

### spine-growth

Operator 2026-09-29: "1a | 2a | 3a | 4 - why does it say no fixtures? Ponytail is really important, it's a file that dictates clean code." then "4c". Peer final check B, C: none.

Q1 = 1a. When a chain exists, the chart names the spine command and a stage table: each stage has an owning leaf whose done-criterion puts that stage in the spine (scripts real, model and outside services recorded-from-real) and deletes obsolete stand-ins. Reuse an existing command or make the spine part of the earliest relevant leaf; a stage leaf needing the spine first gets it in blocked-by. The handoff audit refuses a stage-owning leaf without that criterion. The spine runs in the consumer's blocking checks. A stage labelled real that fakes its result does not count.
Reason: keep-green alone let two stage leaves skip the spine.
Foreclosed: 1b keep-green only; 1c rule without the audit check.

Q2 = 2a. Applies when one leaf's output (data, files, state or build input) is consumed by code another leaf owns. The chart names the chain. File overlap or shared epic alone does not trigger it.
Reason: matches the actual producer-consumer risk.
Foreclosed: 2b only charts with a final proof leaf.

Q3 = 3a. Own scripts, consumers and checks run real. Model and outside-service stages replay output recorded from one real run, with source, revision or date and capture command named; re-record, never hand-patch. A leaf changing a prompt, model, settings, output shape or outside call runs one real call through its consumer and checks, names the property it proves and re-records; an outside change that makes a recording unreliable also triggers re-recording. Hand-written negative and edge inputs stay allowed. No live model run per merge.
Reason: hand-authored stand-ins hid producer mismatches (#1); live runs per merge cost hours.
Foreclosed: 3b hand-written positive outputs; 3c live sessions every merge.

Q4 = 4c. No clause and no ponytail.md edit. ponytail.md:30 "no frameworks, no fixtures" governs only the one smallest self-check, and the same line keeps "anything explicitly requested"; the spine is required by done-criteria.
Reason: ponytail already covers it; the operator keeps ponytail unchanged.
Foreclosed: 4a extra clause; 4b ponytail edit.

### proof-leaf-policy
Operator 2026-09-29: "1a | 2a | 3a | 4a". Peer final check: C none; B found that "earliest changed stage" misses a second independent change, corrected below within 2a's intent.

Scope: future designs of any leaf whose criteria include a slow or live run. Existing leaf contracts change only by operator.

Q1 = 1a. The proof leaf fixes a bug in another leaf's code in its own branch when the fix meets an already-settled requirement: no locked decision changed, no new feature, no changed acceptance rule. Each fix gets a fail-first test at the cheapest level in the owning code's own tests, is listed in the implementation report and gets normal review. A fix needing a locked decision changed ends the pass with `akrogon phase <slug> failed --reason` naming the decision; implement-issue/SKILL.md gains this line beside :31.
Reason: a leaf per bug cost a full lifecycle; review cannot make design decisions.
Foreclosed: 1b record design conflicts for review (B's view); 1c new leaf per bug.

Q2 = 2a. A debug run reruns every stage whose code, inputs or config changed, plus every stage that consumes their outputs; unchanged, unaffected stages keep their saved results. The report names the saved run's commit, what changed and which stages it feeds. Shared files, lockfile or environment count as inputs to every stage reading them. If validity cannot be shown, restart from the last trustworthy point or from scratch.
Reason: rerunning what depends on a change equals a clean result at a fraction of the time.
Foreclosed: 2b always from scratch.

Q3 = 3a. Every check whose own prerequisites are valid runs; checks with invalid prerequisites are marked blocked, not passed; the run still ends failed; product gates still stop the product. Stand-ins only in a separate diagnostic run, named, never proof. Follow-on failures grouped under their root.
Reason: one run finds every independent bug.
Foreclosed: 3b stop at first failure.

Q4 = 4a. Final proof is one result at the final commit where every stage ran there or passes the Q2 rule, listed with its source commit. A clean full run only when reuse can't be shown or when fresh start, uninterrupted order or whole-run behavior is itself under test.
Reason: same strength as a clean run without repeating unchanged hours.
Foreclosed: 4b always clean; 4c resumed with waived checks.

Homes: standing design; chart states repair scope and final-proof rule; plan names restart boundaries; implement-issue records fixes and reuse in its report and gains the design-stop line; check-issue judges under current rerun rules.

### review-rules
Operator 2026-09-29: "1a | 2a". Peer final check B, C: none.

Q1 = 1a. When one part writes something and another part checks it, the rule lives in one function, schema or data both use. A model writer's instructions state the checker's rule, including limits and required inputs. A design keeping two copies says why and names a test that checks they agree. The chart names the rule's owner when writer and checker sit in different leaves. Tests keep independently written expected results. Review Fix: a leaf adds or changes a second copy without a reason and agreement test, or writer and checker reproducibly disagree. Look-alike code alone is not a Fix; no refactor of unrelated duplicates.
Reason: #11, #12 and #14 were one rule kept or implied in two places.
Foreclosed: 1b tests share the rule too; 1c nothing new.

Q2 = 2a. Applies only to a check whose result depends on how many items exist or how many choices a pool offers. The leaf states what the check needs for the target count, counting what actually renders, and tests at the real target count with the real pool (must pass) and with a too-small pool (must get the refusal the design specifies, at the design's own boundary). A model-judged check of this kind tests one known-acceptable and one known-unacceptable case with the real instructions and judge at target size, and states what stays unproven. No invented numeric bound. An impossible target changes the requirement or generator through design, never by loosening the check. Review Fix when such a check has no stated need or no target-size test. Other checks stay under standing-design.md:8, spine 3a and proof-selection 1a. No review rerun beyond check-issue/SKILL.md:49.
Reason: #16 could never pass at 4 sites and nothing tested it at that size.
Foreclosed: 2b real pass and focused fail for every check (B's view, repeats taken rules); 2c nothing new.

## Standing design
Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`. This leaf edits that file; the installed path is a symlink into this repo's `skills/chart-issues/assets/`.

Interpretation for this leaf:
- **Mandatory negative and edge-case tests; no vanity tests.** check-issue/SKILL.md:45 rejects akrogon tests of prose wording, so no new test is written. Criterion 9's line count and unchanged-file checks are the negative evidence.
- **End-to-end verification with an artifact.** Prose leaf: the artifact is the diff and the pasted numstat total in the report. Not a browser flow.
- **Agent-owned.** No human-only prerequisite, no env values, no external operation.
- The new rules apply to future leaf designs. Existing leaf contracts, including framework live-replay, change only by operator.

## Leaf architecture
Owned surfaces: `skills/chart-issues/assets/standing-design.md`, `skills/chart-issues/assets/shapes.md`, `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, plus any agent or human doc the plan finds stale (`skills/AREA.md`, `docs/guide/*.md`), all inside the 20-line cap.

Placement, each rule stated once: the four rules' substance lives in standing-design.md, one bullet each (criteria 1-4). shapes.md, plan-issue, implement-issue and check-issue carry only the part their phase acts on (criteria 5-8) and point to the standing-design rule rather than restating it. Wording is free; substance is fixed by the binding decisions above. The proof-selection Q1 quote may be used as written.

Line budget (A proposal): 4 standing-design bullets, about 2 lines in shapes.md, 1 in plan-issue, 2 in implement-issue, 1-2 in check-issue, leaving room for a stale doc. The cap counts added lines from `git diff --numstat`, so rewriting an existing line counts. (A) Each added line states its rule in at most three sentences, since a line cap alone lets one line grow into a paragraph.

Exclusions: no `src/` or test change; no ponytail.md edit (spine-growth Q4 = 4c); no change to `skills/merge-issue`, `skills/chart-issues/SKILL.md` or any other file unless the plan shows a doc made stale; no edit to framework or any file under `issues/`; no removed or loosened check; no numeric time budget (proof-selection Q2 = 2a); no new review rerun beyond check-issue/SKILL.md:49.
