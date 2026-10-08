# Slot B independent territory map

Inspected 2026-10-07. No Slot A scratchpad read. No repository edits or lifecycle commands. Picks below are recommendations, not operator decisions.

Evidence tiers: **operator** = supplied intake and locks, dated 2026-10-07. **better-than-training** = inspected repository code/docs or official vendor documentation, checked 2026-10-07. No named practitioner evidence was supplied or found for this repository's policy. Design judgments are **model-knowledge**, distinguished from observed behavior.

## F1. Where settings live and how an epic reaches its leaves

**Pick:** optional YAML front matter in existing `EPIC.md` and `ISSUE.md`, containing a strict `slots` setting. Optional leaf `state.yaml.slots` provides the narrowest override. Resolve each seat through machine → repo → epic → issue → leaf, highest present seat wins. Read ancestors from the registered checkout every time resolution is needed. An epic choice reaches all descendant leaves without copying settings. Example: epic A=Claude, issue B=Codex, leaf A=another Claude model resolves those independently. A standalone issue has no epic layer.

Reason: directly meets the operator's one-setting-in-the-folder requirement and preserves one owner of each inherited choice. Cost: a small front-matter boundary parser and ancestor lookup, shared by dispatch/config/status. `slots` is configuration, not a phase/counter, so it need not violate “no lifecycle state,” but the index contract must explicitly permit settings.

**Reject:** leaf-only settings with epic values copied at handoff. Cheapest schema change, but epic edits no longer reach its leaves, new leaves can diverge, and copied values obscure deliberate exceptions. Reject a keyed map in `issues/config.yaml`: outside the requested folder, duplicates ownership paths and needs move/close cleanup. Reject arbitrary markdown blocks: parsing prose introduces avoidable ambiguity. Reject a new container YAML file: expressly outside the operator constraint. Reject full effective-seat snapshots in every leaf: pins inherited defaults unintentionally and creates multiple authorities.

**Evidence:** operator intake requests per-issue/per-epic choices in existing files. Better-than-training: `skills/chart-issues/assets/shapes.md:86-122` defines two leaf depths and existing indexes, `src/state.ts:114-129` recognizes only leaf state, `src/config.ts:60-70` is the current resolver, `src/config.ts:110-120` resolves worktrees to the registered checkout.

**Pitfalls removed:** do not place container `state.yaml` beside indexes, because `leavesUnder()` would treat it as a leaf (`src/state.ts:123-125`). Bound ancestor lookup to the documented two layouts, rather than walking arbitrary parent markdown. Resolve closed records using their current owner folder, since completion moves the entire owner (`src/phase.ts:185-195`). Read main's authoritative files, never a leaf's stale `issues/` copy. Unknown or malformed front matter must fail with its file path, not become “no override.”

**Q1:** Must changing one epic setting affect every descendant's next agent start, including leaves already dispatched? My pick says yes. If the operator means a fixed handoff choice, copying is a different policy that needs an explicit decision.

## F2. Whole seat or partial fields

**Pick:** keep the existing whole-seat contract `{harness, model, effort}` at every level. Either `a`, `b`, or both may be supplied. Omitting a seat inherits it. An empty `slots` map is harmless, matching existing behavior. Removing a seat restores inheritance.

Reason: a seat is one runnable selection. A partial merge can combine a Claude harness with a model or effort inherited from Pi/Codex. Whole seats remove that failure class and preserve current semantics. Cost: repeating three short values when changing one model.

**Reject:** generic field-by-field merging, because harness changes can silently form invalid combinations. Reject hybrid rules such as model-only patches but complete seats on harness changes: more policy and surprising inheritance for little gain. Reject requiring both seats: needlessly prevents selecting only the writer or reviewer. Reject named profiles: another indirection and configuration surface not required here.

**Evidence:** better-than-training, `src/config.ts:11-16,49,60-68` already requires complete seats and independently inherits A/B. `tests/config.test.ts:130-146` rejects missing effort, unknown seat and null while accepting `{}`. `tests/next.test.ts:3080-3100` verifies one-seat inheritance. Operator asked freedom for specific slots, not partial merging.

**Pitfall removed:** make completeness a boundary invariant and reuse one seat schema across all levels. Harness existence can be validated centrally, while provider-specific model/effort acceptance remains a harness boundary, not a guessed universal enum.

**Q2:** Is specifying all three values acceptable when selecting a model? If not, which demonstrated editing problem justifies changing existing merge semantics?

## F3. Effective time and phase changes

**Pick:** settings affect the next actual agent start in each pane. Preserve a running session after an edit. Do not introduce per-phase selections. Document that an idle but attached agent is still an existing session. An operator wanting the new selection now must deliberately end the affected session, then dispatch again.

Reason: current sessions span phases and carry context. Cost: edits are not immediate, and A/B may temporarily run selections from different configuration revisions.

**Reject:** auto-stop/relaunch on mismatch, which can interrupt work and discard context. Reject per-phase switching: it requires restart/resume policy across plan, implement, review, repair and merge, beyond the request. Reject silently promising that phase advancement applies edits.

**Evidence:** better-than-training, `src/next.ts:405-437` allocates persistent leaf panes, `src/next.ts:504-528` skips busy sessions and calls `launch()` only when `pane.agent === null`. `docs/guide/cheat.md:28` already states next-start semantics. `src/routing.ts:28-35,53-54` puts implementation on A, repair/merge on B, with review participation changing after repairs.

**Pitfall removed:** display desired next-start selection separately from an observed running selection. Do not infer the model of an already attached/manual agent from today's config. If recording launched selections is chosen, tie the record to session identity and make it command-owned. That adds state and is a separate visibility cost, not a reason to restart automatically.

**Q3:** Is next-start behavior sufficient, or is automatic session replacement actually required? The intake does not authorize interruption.

## F4. Does the writing model do the writing?

**Observed:** selecting Claude for A selects its coordinator, not necessarily its writing workers. Repo `implement: subagents` delegates every implementation unit, including a single unit. The Claude template explicitly forces workers to Sonnet. A still writes its own synthesis/report, but delegated product prose can be authored by Sonnet.

**Pick:** smallest systemic fix, if the intended policy is “selected seat model also authors delegated work,” replace the hardcoded subagent `sonnet` value in the existing Claude template with `{model}`, retaining the force flag. The existing launcher already replaces every `{model}` occurrence. No new schema, worker-model field or per-leaf execution-mode setting is needed. Cost: all Claude workers, including research workers covered by the force setting, use that model, so selecting an expensive model increases worker cost. This is a machine-template change and must be explicitly included in the operator's final choice.

**Reject:** removing both environment controls and hoping for inheritance. Vendor definitions or invocation choices can still pick a different model. Reject setting the default without force for the same reason. Reject switching this whole repository to inline merely for one writing issue. Reject adding leaf `implement` overrides as the first solution: it expands execution policy when the existing template can carry the seat choice. Reject a separate worker-model axis unless the operator actually wants cheap coordination plus specialist writing workers.

**Evidence:** better-than-training, `config.yaml:12`, `issues/config.yaml:6`, `skills/implement-issue/SKILL.md:53-55`, `src/next.ts:252-259`. Official [Claude subagent documentation](https://code.claude.com/docs/en/sub-agents#run-every-subagent-on-one-model), inspected lines 364-380, says both variables force the specified model, requires v2.1.257+, and identifies fork/inherit exceptions. [Environment-variable reference](https://code.claude.com/docs/en/env-vars), inspected lines 431-433, confirms default versus force semantics. These prove documented routing, not that any particular model writes better.

**Pitfall removed:** before handoff, prove the installed Claude version and one disposable delegated writing unit with the chosen real model and identity, checking the actual worker model. This map performs no paid model call. Test nested template substitution and shell quoting, because `{model}` inside JSON must preserve both JSON validity and argv integrity. Full model IDs/aliases accepted by both main and worker paths need a real probe. Choosing a model string alone does not prove provider availability, writing quality or effective worker effort.

**Q4:** Should all workers use the seat model, or does the operator need coordinator and writer choices independently? This answer determines whether the one-line template change is sufficient.

## F5. Visibility and worktree identity

**Pick:** use the same resolver for launch, `akrogon config` in a managed leaf worktree, and per-leaf status. Root config stays repo-level. Leaf config prints effective seats and their source paths. Status shows effective A/B harness/model/effort as desired next-start settings, with explicit source information in detailed leaf output. If active-model reporting is required, use session-linked launch records or harness observations rather than relabeling config as runtime truth.

Cost: map cwd to an authoritative leaf and provide resolved seats to status. Detached worker worktrees have no direct leaf record, so their leaf context should be passed explicitly if they need leaf-specific config. Do not guess their owner by suffix.

**Reject:** putting resolution only in `launch()` leaves skills and operators seeing different settings. Reject deriving identity solely from Git branch names. Reject copying index settings into worktrees. Reject always labeling effective configuration “running model.”

**Evidence:** better-than-training, `src/config.ts:168-180` currently prints only repo-resolved seats even in linked worktrees, `tests/config.test.ts:152-174` locks that behavior, `src/status.ts:94-135,294-308` has no resolved model view. `src/next.ts:198-203` already identifies leaf worktree containment. `skills/implement-issue/worker-protocol.md:11` creates detached workers, not managed leaf lanes.

**Pitfall removed:** authoritative path/record matching works with custom worktree roots and subdirectories. Preserve global behavior outside a registered repo and repo-level behavior in an unrelated linked worktree. Extend tests rather than accidentally making every worktree resolve an issue.

**Q5:** Does the operator need actual running models on the status board, or is desired next-start configuration plus provenance sufficient?

## F6. Chart handoff and lifetime

**Pick:** `/chart-issues` records explicitly requested slot choices at their selected scope, shows their effective impact once in handoff review, and omits settings when no choice is supplied. Ask only when unresolved scope or coordinator/worker behavior materially affects the outcome. Write container settings with indexes before leaf state becomes dispatchable. The state template shows optional leaf slots, not copied epic defaults.

Cost: update shapes and handoff behavior, plus state-field documentation for leaf overrides. This is required contract work, not a new question on every small issue. Settings are authored at the door or by the operator on main, never by the leaf branch.

**Reject:** mandatory model election for every issue, unconditional snapshotting, and a prose-only design instruction that the launcher never consumes.

**Evidence:** operator existing-file and main-authoring locks. Better-than-training, `skills/chart-issues/assets/shapes.md:250-260` already makes optional fields explicit, `:268-274` excludes `issues/` work from leaf scope and writes state last. `src/AREA.md:24` documents the branch guard. Index settings move with completed owners (`src/phase.ts:185-195`).

**Pitfall removed:** old leaves/indexes without settings inherit unchanged. Newly added leaves inherit their current parent settings. Scope exceptions are explicit seats at narrower levels. Batch merge is a separate limit: one holder B handles the shared pass (`src/next.ts:649-653`, `src/batch.ts:42-47`), so per-leaf B selection cannot imply every carried member has its own chosen model execute the merge. Preserve current batching and explain holder ownership unless strict per-member model execution is requested.

**Q6:** Must B's model choice govern that leaf's own merge execution even when carried by another holder? That would change batching scope.

## F7. Validation and proof boundary

**Pick:** strict optional slots at every boundary, complete nonblank seat fields, only a/b, no nulls or extra seat fields. Preserve the narrow legacy filter: `priority`, singular `slot`, `failed_notified` remain ignored, plural `slots` is validated. Resolve both seats and validate harness references before worktree/tab allocation, even if the current phase uses only A. Include scope/file/seat in failures.

**Reject:** letting unknown fields disappear, expanding the legacy filter to arbitrary keys, deferring config errors until the other seat starts, or silently inheriting around malformed settings.

**Evidence:** better-than-training, `src/state.ts:60-87,99-107` is strict with three legacy exceptions. `src/config.ts:9-11` currently accepts whitespace-only strings, so “nonblank” requires an explicit improvement within the new settings contract. `src/next.ts:655-659` validates before allocation. `tests/next.test.ts:3106-3122` proves refusal has no allocation effects. `tests/init.test.ts:202-235` proves unknown harness refusal and override preservation.

**Pitfalls removed / proof targets:** extend existing config/state/next/init tests for epic→issue→leaf precedence, either-seat inheritance, old records, malformed front matter, legacy filtering, unknown harness before side effects, argv quoting, and an edit leaving a live agent untouched but affecting its replacement start. Verify root/leaf/subdirectory/closed/worker config contexts and status use the same resolver. Avoid exact prose assertions. Mock launch tests do not prove installed harness acceptance or worker model routing, which remain the real-call prerequisite in F4.

**Q7:** Should whitespace-only values become invalid at all existing seat boundaries, or only the new ones? Applying one shared nonblank schema is consistent but changes existing acceptance.

Recommended minimum: live parent settings, whole-seat overrides, next-start semantics, one shared resolver, truthful desired-seat visibility, and an explicit decision on Claude worker model routing. The material open choice is whether selecting a seat model must also select every delegated writer.
