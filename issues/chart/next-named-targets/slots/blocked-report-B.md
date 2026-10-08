# Blocked report — blind Slot B notes

Read Intake, current Blocked report Question/Carries (not Findings), related fork context, and only Boundary Taken from repo-pause. No *-A.md or names-merged.md read. Names Taken and invocation classification are locks. Sources inspected 2026-10-08, repository references relative to /home/ivan/Work/infra/akrogon.

## Q1 — Which invocations and wait reasons produce errors?

### 1. Pick, reason and cost

Recommend new dependency-wait diagnostics for the leaves directly selected by a manual next pass: leaf/name/path targets, bare repo next, and --all (including its existing outside-repo scope). Every selected active leaf with unsatisfied blocked-by gets one diagnostic naming that leaf and all unmet dependencies, with each known phase or parked/missing/unreadable distinction. Merged closed dependencies satisfy the requirement. Ready siblings still dispatch; any reported dependency wait makes the command exit nonzero.

Hooks, --resume and phase merge wake remain quiet for ordinary dependency waits. Implicit dependent/merge cascades also remain quiet for leaves outside the operator's selected set, even when the initiating next pass was manual. Quiet means no new expected-wait diagnostics, not suppression of existing parse, missing-record, foreign-repo or delivery failures. Preserve those errors and their exit behavior.

Recommend keeping this issue's new error categories limited to dependencies. Do not add owner-wide missing-input or failed-phase wait reporting without an explicit scope choice. Preserve today's single-leaf missing-input refusal. Failed leaves themselves remain skipped under their existing rule; a failed leaf blocking another selected active leaf is named with phase failed. Capacity, busy agents and waiting for a merge turn remain ordinary waits.

Cost: reporting scope must be independent of selected count and distinct from cascade dispatch scope. A manual pass can make useful progress and still exit 1. Narrow dependency scope retains the current uneven missing-input reporting; expanding it is an operator decision, not an incidental cleanup.

For diagnostic timing, recommend evaluating each selected leaf against the current inventory when its dispatch is attempted, with a message describing that attempt's blockers. Do not freeze dependency phases before dispatch begins. A later completion can release a reported wait during the same pass; if the operator wants only blockers remaining at pass end, choose a final fresh-state reporting step explicitly instead.

### 2. Rejected options and reasons

- Single-leaf-only errors: repeats the reported defect. Whether an owner has one or several leaves should not determine visibility.
- Every sweep emits wait errors: automatic hooks and completion cascades repeatedly encounter valid waiting work, producing routine nonzero passes without an operator request for that leaf.
- Manual invocation makes all cascaded leaves report waits: a leaf-targeted command can then fail because an unselected dependent still waits on another prerequisite. This expands the command's diagnostic scope beyond its target.
- First unmet dependency only: hides other required work and forces repeated discovery after each prerequisite merges.
- Fail before dispatching any sibling: violates the intake's ready-sibling requirement.
- Expand to every reason no prompt occurred: busy/capacity/merge-turn waits are normal and do not mean a selected leaf has broken dependencies. Missing inputs and failed phases need their own explicit decision.

### 3. Evidence, tier, source and date

- Operator tier: #59 Intake, https://github.com/Tamdoma/akrogon/issues/59. It requires every selected dependency-blocked leaf, each blocker and its phase/missing/parked state, ready siblings continuing, and nonzero exit. It does not request a general wait-reason reporter.
- Operator locks: Names Taken fixes target resolution and preserves discovery errors. Repo-pause Boundary Taken fixes --resume automatic; explicit target/--all manual; no-input next automatic only with a Herdr event. Do not classify by HERDR_PANE_ID or number of leaves.
- Better-than-training: `src/next.ts:1247-1257` uses explicit=true for one selected leaf but sweep for several. `src/next.ts:710-717` passes false in sweeps. `src/next.ts:634-643` reports dependency/input waits only when explicit. This explains the owner-size inconsistency.
- Better-than-training: `src/turn.ts:8-20` prioritizes dependencies and returns only kind deps, losing blocker details; readiness is examined only after dependencies pass. `src/next.ts:622` skips failed leaves before eligibility. A failed prerequisite still fails eligibility for its active dependents.
- Better-than-training: `src/next.ts:629-632` already errors on the first missing/unreadable dependency in non-explicit dispatch. `src/next.ts:111-117` deduplicates per-leaf error records, and :1341 converts them to exit 1. `tests/next.test.ts:1204-1217` proves missing-record errors coexist with ready sibling dispatch while readable unmet dependencies wait. Preserve real errors on automatic paths.
- Better-than-training: `src/next.ts:1151-1162` starts same-repo dependents outside an original target, and :1332 runs a merge pass after the main pass. A manual invocation flag alone is insufficient to distinguish selected diagnostic subjects from implicit work.
- Better-than-training: `src/state.ts:146-158` detects parked names without parsing parked state. `src/next.ts:120-166` excludes unreadable/foreign records from valid inventory while reporting their real errors. Do not invent a phase for those records or present a known unreadable record as cleanly missing.
- Better-than-training, outside primary docs: GNU make Options Summary, https://www.gnu.org/software/make/manual/html_node/Options-Summary.html, documents keep-going processing of independent work despite failed prerequisites. Gradle CLI, https://docs.gradle.org/current/userguide/command_line_interface.html, documents --continue execution of tasks whose dependencies succeeded. These support sibling progress with an unsuccessful overall command, not blanket suppression of errors. Searches for dependency keep-going behavior found these primary sources as the strongest directly applicable evidence; they do not settle Akrogon's manual-versus-automatic reporting boundary.

### 4. Pitfalls and what removes each

- Selected leaf visited by both the ordinary sweep and a merge/dependent cascade emits duplicate diagnostics. Retain the selected identities and report once per selected leaf using the existing deduplication contract. Do not use that identity set to expand dispatch targets.
- A parked record has invalid YAML. Detect parked identity by folder/state-file presence, preserving existing behavior; never parse it solely to print a blocker phase.
- An unreadable or foreign dependency masquerades as missing. Keep the discovery error and label the dependent's unavailable record accurately where identity is known. Report every unmet dependency without treating excluded foreign state as valid.
- Frozen blockers refer to phases already changed during the pass. Read current inventory at the attempted dispatch. The operator must choose attempt-time versus final-state reporting before the criterion is written.
- Shared eligibility is changed to make manual reporting easier and alters merge order. Keep the eligibility result semantically identical; any richer dependency data must preserve its truth value and readiness priority. Verify merged closed prerequisites, multiple blockers, ready siblings and unchanged automatic waits.
- Newly named one-leaf owners accidentally gain different missing-input/failed behavior from many-leaf owners. Preserve existing behavior deliberately under the narrow scope, or explicitly authorize broader reporting. Do not let cardinality silently choose the product rule.

### 5. Questions missing or needing separation

- Does “operator-typed targets” include bare next and --all? Recommend yes. These manually select work too, and invocation classification is already settled.
- Are implicit dependents outside the selected set included in manual error reporting? Recommend no, while preserving actual errors on every path.
- Should diagnostics describe blockers when attempted or only blockers still unmet after the pass finishes? Recommend attempted/current-state diagnostics for the smallest change, with their timing stated explicitly.
- Must a selected failed leaf also list its unmet dependencies? Recommend retain the failed-leaf skip; its failure, rather than scheduling eligibility, is the reason it cannot resume. If the operator wants every reason for every selected leaf, missing inputs and failed phase are a scope expansion to settle together.

No recommendation is an operator answer. Leaf split remains its own fork.
