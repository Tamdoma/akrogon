# Leaf split at charting

## Question
Q1. Should the handoff audit ask, for each proposed leaf, whether a dependent consumes only part of its output, and split the leaf when the parts can merge on their own?
Q2. May chained leaves build one spine stage, with only the last one owning the stage's spine criterion?
Q3. What happens now to emdash-launch and the six dependents idle behind emdash-conversion?

### Carries
- Intake: ../INTAKE.md (#45 verbatim). The seed's harm is six dependents idle in plan.synthesis behind one leaf.
- Map: ../slots/map-merged.md M0, M4, M5. Rebuttals: ../slots/map-rebuttal-B.md F4 (no criterion-count trigger, ask the dependency question for every leaf), ../slots/map-rebuttal-C.md R1 (lead with dependency shape, not size), R2 (spine stage vs leaf).
- Current split rule: skills/chart-issues/SKILL.md:41 ("independently checkable outcomes ... only an actual dependency orders work").
- Lock (cross-leaf-proof spine-growth Q1 1a): each stage has an owning leaf whose done-criterion puts that stage in the spine (shapes.md:172, standing-design.md:11). Q2 interprets this lock.
- Off route (CHART.md): any numeric size gate, clock or watchdog. Splitting or rewriting the live emdash-conversion leaf.
- Taken: red-criterion 1a and 2a, provider-death Q1-Q4, failed-stop-race 1a.
- Operator intent, verbatim: "The intent is to have a smooth implementation process that doesn't get stuck like this over night, because I lose hours and hours." and "I want to be removed as much as possible from the entire process."

## Findings
- M0 (A,C): across 50 framework leaves, implement hours barely track insertions. The overnight loss came from provider deaths, one hard unit and the red C1, not size.
- (C, corrected by C) emdash-launch has 10 done-criteria, not 16 (brief.md:22-84). It cites `framework:verify` (brief.md:84).

Exchange: blind rounds ../slots/leaf-split-B.md and leaf-split-C.md. Merged below.
- (A,B,C) The dependents form a real chain from state.yaml blocked-by: content-fixes <- conversion. launch <- conversion, content-fixes. fleet-backup, offer-join <- launch. health-run <- launch, fleet-backup. upgrade-route <- launch, fleet-backup, conversion.
- (B,C) Four dependents need a whole live launch as their fixture (fleet-backup brief.md:36, health-run :43, upgrade-route :31, offer-join :58). content-fixes' spine criterion runs on the site conversion imports, the last part of conversion (content-fixes brief.md:26). (C) A split of conversion or launch would have freed none of the six. #45's harm is a real chain plus a red base, not a missed split.
- (A,B,C) SKILL.md:41 already permits the split. The audit reads each leaf alone (shapes.md:170) and never asks what a dependent consumes.
- Practitioners: DORA "Working in small batches" (B): usable, testable increments give earlier feedback. Google eng-practices "Small CLs" (C): split so some tracks move while others wait for review.
- Q1 (A,B,C) 1a, an audit question with no count or size trigger. Difference: (C,A) each dependent's brief names the output it consumes, and the door shows only the splits it proposes. (B) record a reason for every bundle kept.
- Q2 disagreement: (B) 2a allow chained contributors to one stage, each with its own output proof, the last owning the stage spine criterion, recorded as an interpretation of the lock. (C,A) no new rule: when a leaf splits its stage row splits too, each part owns its stage and spine criterion, and the lock stays word for word. A part with no runnable output is an ordinary leaf with unit tests. C withdraws its map Q3 view because earlier parts merging outside the spine is the gap the lock closed.
- Q3 difference: (C,A) 3a no live action. Red-criterion Q3 greens main and adds `framework_verify` to `checks`, after which launch brief.md:84 and content-fixes brief.md:27 comply as written. (B) 3a an operator-owned framework audit of launch before it starts implementation, split only via new intake.
- (C) Not checked: whether upgrade-route's blocked-by on fleet-backup is a real dependency or file overlap, and whether `framework:verify` covers offer-join's cited `hooks:typecheck` and `hooks:verify` (brief.md:68).

Rebuttals (../slots/leaf-split-rebuttal-B.md, -C.md)
- (B F1) "A split frees none of the six" is C's hypothesis. Fleet-backup needs a launch through acceptance (brief.md:36), while launch also owns later domain and client acceptance verifiers and extension wiring (launch brief.md:14,55-70). Whether an initialized-site outcome could serve those fixtures is unproven.
- (B F2) Q2 2a satisfies the lock's wording: each stage still has one owner with the spine criterion. Mandatory row splits tie merge boundaries to the proof table.
- (C R1) "Greens main" means one full green `framework:verify` run on main before `checks` gains `framework_verify`. Door task v3 step 3 already requires this.
- (C R2) Against B's launch audit: launch is not oversized and an audit adds an operator step before every start, against "removed as much as possible".
- (C R3) Against a recorded reason per kept bundle: on #45 it would yield six "kept" lines and no split.
- (C R4) Each split costs a full plan, review and merge cycle (emdash-kit: 8 hours, 2 fix rounds, 8 criteria). 1b (no change) is defensible. 1a rests on the chart Destination, not on #45's evidence.
- (C R5) Line 22 omits merged blockers: offer-join also has offer-join-deploy, and launch also has deploy-profile and access-gate. No effect on the conclusion.

## Taken
Operator 2026-10-01: "1a | 2a | 3a".
Q1 1a: one clause on the handoff audit. For every `blocked-by` entry, the dependent's brief names the output it consumes. When that output is a part the producer could merge with its own proof, the door proposes that part as a prerequisite leaf. No count or size trigger, and no recorded reason for a kept bundle. Taken on the chart Destination, not on #45's evidence (C R4).
Q2 2a: no new rule. When a leaf splits, its stage row splits too, and each part owns its stage and spine criterion, as the spine-growth lock already says. A part with no runnable output is an ordinary leaf with unit tests. Foreclosed: B's chained contributors to one stage.
Q3 3a: no live action. Red-criterion Q3 (door task v3) ends with one full green `framework:verify` on main and `framework_verify` in `checks`. Conversion then resumes and the chain runs in order.
