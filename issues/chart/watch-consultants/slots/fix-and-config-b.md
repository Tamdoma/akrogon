### Q1. Base fix

- **Pick.** Fetch the configured remote and reproduce the failure on its default-branch tip in a separate, clean worktree. Commit only the base repair. Run the failing command, configured checks and merge checks on the commit being pushed. Push that commit to the configured branch by ordinary fast-forward push. The cost is a separate checkout and fresh checks if the base moves.
- **Reject.** Pushing a failed leaf branch can publish unrelated work. Editing the operator's checkout risks including their changes. Reserving the whole merge queue adds coordination that Git's fast-forward check already provides.
- **Evidence.** Operator, 2026-11-21, S2/S3 and consult-loop Taken 9. Better-than-training, inspected 2026-11-21, `src/config.ts` (`repoSchema`) configures remote and target; `merge-issue/SKILL.md` (Shared endings) uses fast-forward publication and rechecks an integrated tree.
- **Pitfall.** After a refusal or uncertain push result, fetch and check reachability first. If another merge already fixed the failure, verify the new base. If it still fails, apply the repair to the new tip and rerun the checks. Record the actual pushed revision and send the locked non-attention notice once confirmed.
- **Ask.** What if reproducing or proving the fix requires a host downgrade or spending beyond the grant? Record the blocked command and apply S3 before taking that step.

### Q2. Leaf-local fix

- **Pick.** Return the diagnosis, failing command, repair instructions and evidence to the watcher. Resume through the appropriate leaf phase and let its assigned seat perform the edit and normal review. Give the seat a case-file pointer through its normal phase task. Cost is one ordinary repair turn. Verify the pointer reaches the seat through dispatch before treating handoff as complete.
- **Reject.** A consultant commit directly in the failed worktree is authorized in principle, but can mix with uncommitted seat work or bypass review when the leaf resumes at merge. Creating a separate fix leaf for a purely local defect adds ownership and a dependency.
- **Evidence.** Operator, 2026-11-21, S2 permits consultant commits. Better-than-training, inspected 2026-11-21, `src/phase.ts` (`moveGuards`) permits a dirty worktree on blocked recovery; `src/next.ts` (`promptFor`, `dispatchSlot`) supplies the lifecycle prompt. A case note written outside the repo is not automatically in that prompt.
- **Pitfall.** A permission to recover a leaf does not authorize overwriting its draft or messaging a busy seat. Preserve the worktree, recheck owner availability and distinguish “repair handed off” from “fix verified.”
- **Ask.** If a leaf failed at merge and still needs a code edit, which phase owns it? Use `check.fix` for A's repair and subsequent review. An already-landed batch follows Q3.

### Q3. Resume

- **Pick.** The watcher re-observes each attached leaf and its prerequisites, confirms the relevant seats are idle or absent, and runs `akrogon phase <slug> <phase>` without a slot, then `akrogon next <slug>`. Use the recorded phase for a cleared blocker, the repair phase for an outstanding leaf edit, and `merge` for a previously landed batch candidate. Cost is an individual decision and state re-read for each leaf.
- **Reject.** Never force `merged`, drop `batch` by hand or replay a push to make the state match. `next` alone refuses a failed leaf. For `failed=unknown`, recover the prior phase from the lifecycle history or a confirmed batch before dispatch. If the target remains unresolved, keep the case open for evidence.
- **Evidence.** Better-than-training, inspected 2026-11-21, `src/phase.ts` (`transition`, `commitMove`) forbids slot recovery and preserves batch data. `src/next.ts` (`mergeTurn`, `reconcileBatch`) compare the candidate with the fetched target and respect live land commands. `tests/batch-dispatch.test.ts` exercises a failed holder with a landed candidate returning to merge without a second run or push.
- **Pitfall.** An unpublished candidate or stale attempt is different from a landed one. Leave reconciliation to the command. If a land command still owns the attempt, wait for it before acting. A move can commit before a subsequent error. Re-read phase, batch and remote before retrying, and report each actual move under consult-loop Taken 11.
- **Ask.** How is partial success proved? Stage both landed and unlanded candidates, including recovery interrupted after the phase move. Confirm the final leaf state and absence of duplicate publication.

### Q4. Never and S3

- **Pick.** Consult even when a reason says “needs a key.” The peers can determine whether an existing grant or permitted route resolves the blocker without touching credentials. If the step actually requires S3 authority, record that step and send one attention notice. Cost is one consult even for an obvious stop.
- **Reject.** A reason-string prefilter bypasses S1 and the real intake case where a supposed operator step was actionable. Letting a consultant answer leaf-seat dialogs or grant itself permission would cross the same boundary by delegation.
- **Evidence.** Operator, 2026-11-20/21, seed decision, S1 and S3. Better-than-training, inspected 2026-11-21, `watch-issues/SKILL.md` (Judge, Never) and consult-loop Taken 4, 6 and 7.
- **Pitfall.** Scope the communication exception to the verified watch helper's peer exchange. Scope kill/remove to that helper's documented cleanup plus the existing timer exceptions. Keep the watch's prohibitions on leaf-seat answers, `--force`, `.env`, direct worktree/state edits and killing unrelated processes. The helper's base-worktree grant is distinct from the watch's authority to issue `phase` and `next`.
- **Ask.** Does a blocked helper establish an S3 need? Only when its evidence identifies one. Otherwise the locked replacement and reconciliation path applies.

### Q5. Machine recipe

- **Pick.** Add an optional machine-level `consultant` field using the existing slot recipe schema and harness-template validation. Add an explicit watch-consultant launch form to `akrogon seat` that resolves this recipe and uses the existing first-task startup path. Keep the explicit chart form and positional leaf form intact. The cost is one CLI form and one optional field.
- **Reject.** A new A/B-like seat risks entering leaf overrides. A skill-side YAML parser duplicates validation. Baking agy into code selects an unavailable harness on some machines. Do not rewrite existing machine configs on every install.
- **Evidence.** Operator, 2026-11-21, S5/N2, real machine entry agy/neon/high after landing. Better-than-training, inspected 2026-11-21, `src/config.ts` (`globalSchema`, `repoSchema`, `effectiveConfig`) and `src/seat.ts` (`harnessArgv`). `src/install.ts` (`install`) reads an existing config and installs links and services.
- **Pitfall.** Missing is valid for legacy installs. On first consultation, report the config path and missing key, leave the failure recoverable, and continue watching other leaves without repeated paid launches. A present invalid entry should yield the exact validation error. Exercise the old chart launch with all flags and the watch launch with its configured defaults.
- **Ask.** Where should operators inspect the resolved recipe? Expose the top-level field through existing `akrogon config`; the current effective config reconstructs `slots` as A/B for registered repos.

### Q6. Identity and cleanup

- **Pick.** Use `<prefix>-watch-consult` with a distinct watch-helper role, repo and owning watch identity. Keep the watcher as the hc parent with `outlive: false`. At case end, verify ownership and close the helper by address. On explicit stop, stop the verified timer first, then close its watch's helper. A watcher terminal exit relies on the hc child lifetime. Cost is a separate identity and an ownership check.
- **Reject.** Chart names collide with `<prefix>-slot-<letter>`. Name-only cleanup could kill someone else's terminal. Making the timer the helper's parent would hide child status from the watcher's locked `hc wait --children any` protocol.
- **Evidence.** Better-than-training, inspected 2026-11-21, `src/hc.ts` (`consultantName`), `src/seat.ts` (`startConsultant`), `stop.ts` (`main`), `timer.ts` (`readWatcher`, `poll`) and consult-loop Taken 6–7.
- **Pitfall.** A watcher process or transcript can disappear while its parent terminal survives. Make the timer's verified shutdown path clean up that watch instance's helper too. Simultaneous stop or exit must tolerate an already-gone helper and cannot authorize killing a replacement. Retain the watch identity through timer removal and reconcile the case after the writer stops.
- **Ask.** Does abrupt watcher loss leave a live child when the terminal remains a shell? Observe both true terminal exit and in-place watcher replacement, with a chart helper present. Verify the cleanup hits only the old watch helper.
