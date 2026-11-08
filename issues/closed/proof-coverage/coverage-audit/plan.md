# Plan: coverage-audit

Text-only leaf. Rewrites the chart door's handoff rule so every pre-existing key part a done-criterion rests on must have a recorded observation before handoff, and a declined or impossible probe cuts the contract instead of holding it. Closes the `fixture-weave-recorder` hole (Tamdoma/akrogon#127): its `proofs[0].limits` said "not ... finalize or verify acceptance" while criterion 1 rested on verify acceptance, and nothing compared the two.

## Read first

- `skills/chart-issues/SKILL.md` — "## Take" (the paragraph "Every external operation a brief names…"), "## Handoff" (first paragraph, live-run review line), "## Autopilot" (non-grant approval wait list).
- `skills/chart-issues/assets/shapes.md` — "## Preflight and validation", second paragraph ("Read the briefs as an implementer").
- `skills/chart-issues/assets/questions.md` — "## Optional measurement" (last paragraph).
- `docs/use/plan-work.md` — "## Review the handoff".
- `skills/chart-issues/assets/standing-design.md` — "cheapest sufficient test" and "an input whose effect on a model stage is unknown is investigated" lines; the new rule points at these rather than copying them.
- Worked example the new text must catch: `/home/ivan/Work/infra/tamdoma/framework/issues/closed/about-titles/fixture-weave-recorder/readiness.yaml` `proofs[0]` (limits: "not the copy judgment session, finalize or verify acceptance") against `brief.md` criterion 1 (real verify reports no finding).
- `learnings/LESSONS.md` — reviewed; no lesson changes the plan.

## Decisions

- **D1** One general proof rule in "Take": a proof counts only for the property it observed, which its `limits` records. The provider dry-run and locked outside-tool setting sentences fold into this rule and keep their specifics (real identity and target for dry-run; same key, location and value for a locked setting). (Design proof-coverage answer 1.)
- **D2** Pre-existing key parts: every clause of a done-criterion whose pass rests on something existing before the leaf builds (an outside system's acceptance, an existing checker's verdict, existing data or recordings) is observed at charting by the smallest call that reaches it, free before paid, within the one operator-approved paid test budget (signpost 3a; "ceiling" resolved as the approved test budget). A compound criterion has one key part per such clause. Stale recordings against a newer checker count as existing data. (Design answers 2, final-check pick 2.)
- **D3** Split clause: a clause needing an existing checker to accept output the leaf builds is split — the existing input or contract assumption (e.g. a checked-in fixture and the current verify checks) is observed at charting; acceptance of the new output stays the leaf's own done-criterion proof. (Final-check pick 1, B F2.)
- **D4** Every observation a kept key part rests on, free ones included, is a `proofs` entry in `readiness.yaml` with its own `limits` (`cleanup` may say none). (Final-check pick 1, C K1.)
- **D5** Cut rule replaces "the handoff is held and scope is not narrowed": every operation and key part kept in the contract needs its proof before handoff; a declined probe, or no safe one, cuts the contract to what is proven at the handoff review, naming what was cut and where it lands — a prerequisite leaf under the existing missing-machinery rule, an exclusion in each dependent's design, or an Off route entry in CHART.md. The cut removes that proof obligation and the brief's What drops a cut operation. "There is no waiver" stays: nothing unproven is handed off as promised. (Design answer 3; final-check picks 3, C K4.)
- **D6** A cut removing the chart's useful outcome parks the chart for the operator under the existing "operator approval that is not a grant" autopilot wait; the cut and its reason are recorded; A never answers it. The existing Autopilot wait-list wording already covers this case, so no pointer is added there. (Final-check pick 3, C K3.)
- **D7** Handoff review gains one line per leaf, written beside the existing live-run review line in "Handoff": the leaf's pre-existing key parts each with the `proofs` entry that reached it, plus anything cut with its landing; information only, like the live-run line. When the chart changes the door's own skill, the review states the change reaches doors only at the next release link. (Design answer 1; carry C R4.)
- **D8** `shapes.md` "Preflight and validation": the implementer audit paragraph gains the per-criterion step — for each done-criterion it names the proof or charting observation that reached each pre-existing key part, and refuses the handoff when one rests only on a proof's `limits` or on no proof. The existing refusal of a missing proof stays. (Design answer 1; brief criterion 3.)
- **D9** `questions.md` "Optional measurement": the sentence "Declining a required probe holds the handoff under the Take operation-proof rule" is replaced by the cut rule; "never replaces required operation proof" stays. (Final-check pick 3, C K2; brief criterion 5.)
- **D10** `docs/use/plan-work.md` "Review the handoff": one sentence naming the new review line. (Brief criterion 5.)
- **D11** B's standing dissent on the review-line format (fork proof-coverage pick 1) is recorded and changes nothing; the line is written as decided. Signpost 2b (paid run past an approved bound allowed with a warning) is not restated here; grant counting is chart grant-run-count (#126).
- **D12** No code reads `limits`; `src/readiness.ts` `proofSchema` stays unchanged (signpost 1c). No `src/`, `tests/`, `issues/` changes; the installed release copy updates only via the normal release (signposts 5a, 6a).

No `Open for the plan:` questions exist in the design. No credentials are named by the design; `akrogon status coverage-audit` shows no `Missing:` lines, so no env blockers.

## Interfaces needed

None. Prose edits only; no code reads the changed text.

## Units and waves

Serial-solo: one wave holding one unit; A implements the plan itself, no workers.

### Wave 1 — U1: proof-coverage rule rewrite

Owns: `skills/chart-issues/SKILL.md` ("Take", "Handoff"), `skills/chart-issues/assets/shapes.md` ("Preflight and validation"), `skills/chart-issues/assets/questions.md` ("Optional measurement"), `docs/use/plan-work.md` ("Review the handoff").

Shared test resource: none. Prerequisite units: none.

Splitting the edits across parallel workers was considered and rejected: the five files state one rule and must agree with each other (criteria 1–5), so one author keeps them consistent; the change is a handful of sentences.

Docs affected (one line each):
- `skills/chart-issues/SKILL.md` — "Take" operation-proof paragraph rewritten per D1–D6; "Handoff" gains the key-part review line and release-link note per D7.
- `skills/chart-issues/assets/shapes.md` — implementer-audit paragraph gains the key-part refusal per D8.
- `skills/chart-issues/assets/questions.md` — "Optional measurement" last sentence replaced by the cut rule per D9.
- `docs/use/plan-work.md` — "Review the handoff" gains one sentence naming the new review line per D10.
- No other docs affected: the design's docs inventory (`grep -rn -i "handoff review|operation proof|real call|probe|waiver|not narrowed" docs README.md`) was rerun in this worktree; hits are `docs/use/plan-work.md` (in scope) plus mentions in `docs/use/quick-fix.md`, `docs/examples/quick-fix-story.md`, `docs/examples/autopilot-story.md`, `docs/start/one-change.md` and `docs/pictures/chart-door.svg` that describe the review existing without restating the proof rule — unchanged per design.

## Done-criterion verification

Standing design: no test pins new prose; review reads it against the done-criteria. No committed test files are added. Each criterion is instead proven by a repeatable read of the written artifact (the real boundary is the file the chart door reads), run through `akrogon run-check`. Baseline state recorded 2026-11-04 on the leaf branch: the general rule phrases are absent and the old sentences are present — shown below, which is each condition case's intended-red evidence at planning (the change is text; the red state is the pre-edit text itself, no temporary code edit applies).

Criterion ↔ condition checks (D1–D12 against what each criterion states must hold, stay, or be gone):

### Criterion 1 — "Take" teaches the generalized proof rule, clause observation, split, and proofs-entry recording

Conditions from the criterion: the general rule folds in both special cases keeping their specifics; a proof counts only for what it observed and `limits` records it; every pre-existing-dependence clause is observed at charting by the smallest reaching call, free before paid, within the one approved paid test budget; a clause needing an existing checker to accept new output is split; every observation (free included) is a `proofs` entry with its own `limits`.

Cases that would catch a decision's violation:
- D1 could drop the dry-run or locked-setting specifics while folding: case greps the written paragraph for the kept specifics — `grep -c "real identity and target\|same key, location and value" skills/chart-issues/SKILL.md` ≥ 1 each. Baseline: both present (in the old special-case sentences).
- D1 could keep the per-operation rule but never generalize to key parts: case greps for the general rule — `grep -n "counts only for the property\|key part" skills/chart-issues/SKILL.md` returns matches. Baseline red: 0 matches.
- D2 could state the clause rule without the budget bound or the free-before-paid order: review reads the written sentences for "smallest", "free before paid" and the approved test budget. Baseline red: absent.
- D3 could leave the split unstated: review reads for the split wording (existing input observed at charting, new-output acceptance left to the leaf's proof). Baseline red: absent.
- D4 could leave free observations unrecorded: review reads for "free" observations becoming `proofs` entries with `limits`. Baseline red: absent.
- Worked-example check: the written Take paragraph must make `fixture-weave-recorder`'s situation fail — its `proofs[0]` observed batch dispatch but `limits` disclaimed verify acceptance, which criterion 1's "real verify reports no finding" rests on. Under D3 this splits: current verify checks on the checked-in fixtures are existing data needing a charting observation; acceptance of the new recording stays the leaf's proof. Under D8 the audit refuses the handoff because verify acceptance rested only on a proof's `limits`. Reviewer applies the written text to that readiness.yaml.

Proof command (one read, run after the edit): `akrogon run-check --name criterion-1 -- sed -n '/^## Take/,/^## Handoff/p' skills/chart-issues/SKILL.md` — the reviewer confirms every element above appears in the printed paragraph. Size: seconds. Rerun trigger: any edit to the Take section.

### Criterion 2 — "Take" states the proof-before-handoff and cut rules, drops "scope is not narrowed", keeps "no waiver"

Conditions: kept operations and key parts need proof before handoff; a declined or impossible probe cuts the contract at the handoff review naming the cut and its landing (three landings named); the cut removes the proof obligation and drops the operation from What; a cut removing the chart's useful outcome parks under the non-grant approval wait, never answered by A; "no waiver" stays; "scope is not narrowed" is gone.

Cases:
- D5 could cut without naming landings or keeping the proof-obligation removal: review reads the written paragraph for all three landings and the obligation/What drops. Baseline red: absent.
- D6 could park under a new mechanism instead of the existing wait: review confirms the text names the existing non-grant approval wait and that A never answers it. Baseline red: absent.
- Old-sentence removal, mechanical: `grep -rn "scope is not narrowed" skills/chart-issues/` must print nothing. Baseline red (sentence present): SKILL.md:61.
- "No waiver" retained: `grep -rn "no waiver" skills/chart-issues/SKILL.md` still matches. Baseline: line 61.

Proof command: `akrogon run-check --name criterion-2 -- sh -c 'sed -n "/^## Take/,/^## Handoff/p" skills/chart-issues/SKILL.md && ! grep -rn "scope is not narrowed" skills/chart-issues/'`. Size: seconds. Rerun trigger: any edit to the Take section or a new "not narrowed" phrase elsewhere under skills/chart-issues/.

### Criterion 3 — shapes.md audit names the proof per pre-existing key part and refuses limits-only or absent proof

Condition: D8 could add the step but lose the existing missing-proof refusal, or refuse on no proof but not on a limits-only rest.

Cases:
- Review reads the implementer-audit paragraph for the per-criterion key-part step and both refusals side by side. Baseline red: step absent.
- The existing refusal sentence "Refuse the handoff when a brief names an external operation with no recorded proof under the Take operation-proof rule" survives: `grep -c "no recorded proof under the Take operation-proof rule" skills/chart-issues/assets/shapes.md` stays ≥ 1 (appears in both the preflight paragraph and audit). Baseline: present.

Proof command: `akrogon run-check --name criterion-3 -- sed -n '/^## Preflight and validation/,$p' skills/chart-issues/assets/shapes.md` (the audit paragraph). Size: seconds. Rerun trigger: any edit to that section.

### Criterion 4 — "Handoff" gains the per-leaf key-part review line and the release-link note

Conditions: one line per leaf lists each pre-existing key part with the `proofs` entry that reached it plus cuts with landings; information only like the live-run line; the release-link statement appears when the chart changes the door's own skill.

Cases:
- D7 could add the line but make it a gate: review confirms it is stated information-only, beside the live-run line. Baseline red: absent.
- The release-link note could be omitted: review confirms the sentence exists in the Handoff section. Baseline red: absent.

Proof command: `akrogon run-check --name criterion-4 -- sed -n '/^## Handoff/,/^## Direct route/p' skills/chart-issues/SKILL.md`. Size: seconds. Rerun trigger: any edit to the Handoff section.

### Criterion 5 — questions.md and plan-work.md agree with criteria 1–4

Conditions: the measurement paragraph still never replaces required operation proof; its declining-probe sentence is replaced by the cut rule; the docs page names the new review line in one sentence.

Cases, mechanical where possible:
- `grep -c "never replaces required operation proof" skills/chart-issues/assets/questions.md` ≥ 1 (stays). Baseline: present, line 60.
- `grep -rn "Declining a required probe holds the handoff" skills/chart-issues/` prints nothing. Baseline red: questions.md:60.
- Review reads questions.md's replacement sentence for the cut rule (contract cut to what is proven, landing named). Baseline red: absent.
- Review reads docs/use/plan-work.md "Review the handoff" for the one new sentence naming the per-leaf key-part line. Baseline red: absent.

Proof command: `akrogon run-check --name criterion-5 -- sh -c 'sed -n "/^## Optional measurement/,\$p" skills/chart-issues/assets/questions.md; sed -n "/^## Review the handoff/,/^##/p" docs/use/plan-work.md; ! grep -rn "Declining a required probe holds the handoff" skills/chart-issues/'`. Size: seconds. Rerun trigger: any edit to either file.

### Criterion 6 — the diff lists only the five named files

Boundary: the leaf branch against its base. Before: branch equals base, empty diff. After: exactly `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/assets/questions.md`, `docs/use/plan-work.md` — and `issues/` records excluded by the criterion's own wording since it names product files (the criterion is read as: only the files named in What change; `src/` and `tests/` untouched). Product failure caught: scope creep — an unintended `src/`/`tests/` or extra docs file in the diff.

Proof command (the criterion's own locked invocation): `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD`, output compared to the four product paths. `AKROGON_BASE` resolves at implementation time under the leaf environment (it is not a ref in this worktree yet). Size: seconds. Rerun trigger: every commit on the leaf branch; final check before `implement` completes.

## Restart boundaries

None — no slow or live runs; the leaf is a text edit verified in one pass.

## Known limitations

- New handoffs only (signpost 5a): already-handed leaves like `fixture-weave-recorder` are not re-checked.
- The rule is written guidance to the door seat (signpost 1c): no command enforces it, so a door that misreads the prose can still hand off a gap; review of the chart's own output is the check.
- Docs hits outside `plan-work.md` mention the handoff review without restating the proof rule and stay unchanged; a hit found elsewhere later is reported, not edited.
- Paid overspend past an approved bound is still possible with a warning (signpost 2b), owned by chart grant-run-count, not this leaf.
