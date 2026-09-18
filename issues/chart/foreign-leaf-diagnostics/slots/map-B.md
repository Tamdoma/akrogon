# Territory map B

Independent map, 2026-09-18. Repository: `/home/ivan/Work/infra/akrogon`. Proposed chart destinations below are proposals only. No issue records or consumer files were changed.

## Evidence and authority

- **E1 — Operator:** Intake locks are authoritative: existing terminal markers and last-marker precedence stay, leaf branches carry code only, issue artifacts belong in the registered checkout, and no hidden watchdogs, clocks or polling may be introduced.
- **E2 — Practitioner:** The three seed reports were read verbatim. They establish observed incidents and workarounds, not current completeness or frequency across every harness. No practitioner interview was conducted. Questions below remain unanswered.
- **E3 — Primary code:** Inspected `src/status.ts`, `src/state.ts`, `src/next.ts`, `src/phase.ts`, `src/init.ts`, relevant tests and fixture helpers, planning/implementation skills, chart shapes, the closed terminal-marker leaf, and consumer Git/filesystem evidence. Existing uncommitted edits to both skills were preserved. Skill text is evidence of intended behavior, not proof of enforcement.
- **E4 — Search record:** Ran local `rg` searches for terminal stages, mismatches, debate artifacts, dirty/code-only checks, registration, and authoritative-path rules. Inspected commits `2edea9c`, consumer `e9a9a388`, and boulevard `9ac9d01`, plus branch history and net issue-file diff. Searched consumer filenames for framework tooling. The guessed `.claude/commands/update-framework.md` does not exist. This did not identify the importing operation. No web research or external practitioner sources were used. Recommendations below are inferences from inspected code, not claims of external consensus.

## Seed #15: held/closed charts remain charting

**F1 — Resolved on the live CLI surface.** Commit `2edea9c` implements the three terminal markers. `src/status.ts:247-251` selects the last matching line before falling back to charting/empty. The closed leaf `issues/closed/chart-terminal-stage/terminal-stage-marker/state.yaml:2` is merged. Ran `bun test tests/status.test.ts -t 'charts derives stage'`: 1 passed, 0 failed, 8 assertions. `tests/status.test.ts:488-535` covers marker precedence, closed charts retaining forks, prose bullets, and the single-chart layout.

**K1 — Remaining fork: data correction versus new behavior.** A hold recorded only in `forks/disposition.md` still does not establish a CHART.md terminal marker. Correcting such a chart is an operator artifact edit. Inferring terminal state from arbitrary prose would reopen the already settled marker contract and is not justified by this seed.

**Q1 — Practitioner question:** Do the original framework charts now have the explicit CHART.md markers, and is the operator running a CLI containing `2edea9c`? Their live files and installed binary were not checked here. This affects incident closure, not whether the repository implementation is fixed.

**R1 — Pitfall:** Do not create another implementation leaf for this feature or interpret chart age as proof that work is unfinished. Preserve last-line precedence. The implementation matches marker words at the start of a line and does not validate the date, so this is not evidence of a strict date parser.

**D1 — Destination:** Off route for new development. Attach shipped evidence to source triage. Any missing marker is an operator step in the owning framework checkout, outside this map's write scope.

## Seed #17: foreign issue tree in a registered consumer

**F2 — Incident removed, general behavior unresolved.** In clinique-la-roya, commit `e9a9a3886d32ab8b18bcd9e0f181e3900f63a198` removed 96 state files. Current `issues/open` and `issues/closed` contain zero state files. The specific 96-leaf flood therefore has no current input. Foreign residue remains: `issues/chart/`, `issues/continuity/`, `issues/history/`, `issues/token-ledger.yaml`, and 488 log lines carrying `repo: framework`. Presence establishes residue, not that every remaining file can safely be deleted.

**F3 — Detection still differs by command.** `src/next.ts:98-119` reports a mismatch per leaf and scans both open and closed. `src/next.ts:77-83` deduplicates per path within one invocation, not across invocations. `src/state.ts:79-90` rejects the first mismatch, but the intake's description of status needs qualification: overview uses its own open-only walk at `src/status.ts:44-69`, rejects a mismatched open leaf, and emits an unreadable-repo record at `src/status.ts:288-289`. Detail calls `findLeaf` at `src/status.ts:272`, which uses `allLeaves` at `src/state.ts:108-110`. Closed-only foreign leaves can therefore be absent from overview while breaking detail or flooding next. `src/init.ts:16-49` registers without checking existing leaf ownership.

**K2 — Material fork: summarize versus reject the whole repository.** One actionable mismatch summary per repository per invocation can preserve dispatch of valid local leaves. Rejecting the whole contaminated repository is stricter and also blocks otherwise valid work. These have different scheduling consequences and need an operator decision. Retain other repositories' progress either way.

**K3 — Material fork: registration gate versus walk detection.** Registration validation catches inherited state already present at initialization. It cannot catch a later merge introducing foreign leaves. Walk-time reporting covers recurrence. Choose the required boundary explicitly rather than assuming registration fixes both cases.

**K4 — Material fork: what does “once” mean?** Once per invocation needs no persistent machinery. Once until repaired requires remembered state and rules for newly added mismatches. Recommend the former unless the operator explicitly needs the latter. Do not add background monitoring or hide errors on later explicit invocations.

**K5 — Material fork: CLI ownership diagnosis versus import prevention.** Error aggregation does not stop framework history entering a consumer. The deletion commit describes inheritance through a framework merge, but the exact merge/update procedure was not independently traced. That prevention change belongs to the actual importing workflow once identified, not automatically to akrogon.

**Q2 — Practitioner question:** In a mixed repository, should valid consumer leaves continue dispatching, or should any foreign leaf stop that repository?

**Q3 — Practitioner question:** Does “single actionable message” mean each invocation, and what evidence must it contain: registered/stored keys, affected count, and paths sufficient to repair?

**Q4 — Practitioner question:** Which exact framework import command or merge brought these records in, and which remaining consumer records must be retained? Ask the workflow owner before prescribing exclusions or deletion.

**R2 — Pitfalls:** Do not silently skip foreign state, relabel foreign leaves as consumer-owned, assume status overview validates closed history, or delete all of `issues/` including valid configuration. Registration alone is not recurrence prevention. Broad unification of all readers is not automatically needed for a focused reporting change.

**D2 — Destination:** Separate proposed akrogon chart `issues/chart/foreign-leaf-diagnostics/`, sourced from #17, limited to the selected detection/reporting contract. Keep consumer cleanup and framework-import prevention as separately owned operator/workflow actions. Current consumer cleanup is not a code-only leaf.

## Seed #18: debate artifacts committed in the worktree

**F4 — Synthesis incident bypassed, root cause remains.** The authoritative boulevard leaf now has all four debate artifacts and `state.yaml:2` says `implement`. This confirms movement past the incident, not correct artifact placement. Commit `9ac9d01` adds `plan.md` under the branch's issue folder, while the inspected authoritative folder had no `plan.md`. The current `origin/main...worker-scaffold` issue diff also includes four implementation briefs, both positions and both rebuttals. Activity is ongoing, so this is an inspection snapshot. Copying four debate files has not repaired the branch or the ongoing write destination.

**F5 — Existing gates explain the failure.** Dispatch provides skill, slug, slot and phase but no path (`src/next.ts:411`). The synthesis gate checks only authoritative positions-file existence (`src/next.ts:482-487`). It does not establish whether debate never ran. Phase checks worktree cleanliness on every move but checks issue-file diffs only when entering review (`src/phase.ts:117-118`). Committing a misplaced artifact makes the worktree clean and allows planning transitions. Planning instructions identify the authoritative read location at `skills/plan-issue/SKILL.md:14`, but write instructions at lines 33, 41 and 49 use filenames without an explicit absolute destination.

**K6 — Material fork: path guidance, enforcement, or both.** An authoritative leaf path in dispatch plus explicit write-destination instructions reduces ambiguity. It does not guarantee agent compliance. Enforcing the existing issue-free branch invariant on phase transitions stops a misplaced committed artifact before later phases record success. Recommend both as one coherent artifact-ownership change, subject to the operator choosing that scope. Do not weaken the authoritative synthesis check to search worktrees.

**K7 — Material fork: reuse the whole guard versus separate invariants.** `requireCodeOnly` also rejects an empty branch (`src/phase.ts:150-157`). Calling it unchanged on every planning transition would reject legitimate planning before code exists. Separate the no-issues-diff condition from the nonempty implementation condition, keeping the latter at review handoff. Earlier checks must run before a slot is recorded (`src/phase.ts:121-128`).

**K8 — Material fork: path enforcement versus artifact completeness.** A clean branch can still lack an authoritative artifact. Deciding to require pass artifacts at each transition is additional behavior, distinct from rejecting misplaced branch changes. If chosen, validate existence/nonempty content and configured phase requirements, not fixed prose or headings. Rebuttal may be disabled, debate may be off, and a first slot records completion before the peer. Do not silently add this broader gate under a path-only fix.

**Q5 — Practitioner question:** Is the desired contract explicit authoritative paths plus no issue diffs at every applicable move, or only clearer dispatch instructions? The former mechanically enforces the existing branch rule.

**Q6 — Practitioner question:** Who will move the missing synthesis/implementation artifacts into the registered checkout and remove their net changes from the active branch without losing ongoing work? The current workaround is incomplete.

**Q7 — Practitioner question:** Must transitions prove each authoritative artifact exists, or should missing-artifact diagnosis remain at dispatch? This choice changes acceptance criteria and should be settled before handoff.

**R3 — Pitfalls:** Do not claim failure “at write time” if checking only at transition time. Do not search multiple copies and pick whichever exists, copy automatically, reset the leaf to positions despite completed work, or remove the debate gate. Do not move the nonempty-branch requirement into planning. A net branch diff check enforces final branch content, not that no historical commit ever touched issues. Consider recovery from failed phases and moves without a worktree when defining the widened guard.

**D3 — Destination:** One separate proposed akrogon chart `issues/chart/authoritative-leaf-artifacts/`, sourced from #18. Keep dispatch path context, skill write destinations and appropriately separated phase invariants together because they address the same failure. Recovery of boulevard's artifacts/branch is a distinct operator action, not part of the implementation leaf.

## Verification boundaries for later contracts

- **A1 — #15:** Existing focused regression passed. No new implementation or test is needed for the shipped contract. Check original chart markers and installed version only if closing the original operational incident.
- **A2 — #17:** Once K2–K4 are answered, exercise many foreign leaves, mixed valid/foreign leaves, closed-only contamination, multiple stored keys, healthy neighboring repositories, and repeated explicit invocations. Prove the chosen count and dispatch behavior without changing foreign state. Extend existing mismatch coverage at `tests/next.test.ts:1098-1117` and `tests/status.test.ts:269-298` only where the selected scope needs it.
- **A3 — #18:** Exercise clean empty planning branches, clean branches with committed issue artifacts, dirty artifacts, each slot before any done-state mutation, debate/rebuttal configurations, valid code-only review handoff, and actionable authoritative-path diagnostics. Existing `tests/phase.test.ts:127-155` checks issue-file refusal only at review. `tests/next.test.ts:1729` covers the late debate gate. Existing fixtures at `tests/helpers.ts:11-31` provide isolated repositories, so do not test by advancing the live consumer.

## Proposed split

| Decision | Sources | Destination | Boundary |
|---|---|---|---|
| D1 | #15 | Shipped-evidence/source disposition | Off route for a new chart or leaf. Original marker repair, if needed, is an operator action. |
| D2 | #17 | `issues/chart/foreign-leaf-diagnostics/` | CLI diagnosis and chosen detection boundary. Consumer cleanup/import prevention remain separately owned. |
| D3 | #18 | `issues/chart/authoritative-leaf-artifacts/` | One chart for authoritative write context and branch invariant enforcement. Live recovery remains operator-owned. |

Do not merge #17 and #18 into a general “issue ownership” chart. They share vocabulary, but one concerns foreign repository history and inventory reporting, while the other concerns a leaf's authoritative artifact destination and phase transitions. They can ship independently. No implementation dependency between D2 and D3 is established by the inspected code. The open practitioner questions are chart decisions, not permission to change consumer data or invent a generic recovery system.
