# Slot B: hygiene rebuttal

Disagreements only. Checked 2026-10-15 against `hygiene-merged.md` and akrogon `f3557d8`.

## R1. “Retired lock files … framework-tests.lock (B,C,D)” overstates B's evidence

My inventory says the exact creator of `~/.akrogon/framework-tests.lock` is unconfirmed. Its zero size and absence from current `src` references do not prove that another producer no longer uses it. Keep it as a retirement candidate, not a proven retired lock attributed to B. `run.lock` has historical retirement evidence. Current locking uses `flock` in `src/state.ts:203-218`, so deleting a still-used lock pathname can split coordination across different inodes.

## R2. Neither elapsed time, environment scanning nor leaf state closes the future-use gap

I disagree with A's one-hour mtime rule, C's environment scan plus rename, and D's merged/failed-or-no-active-leaf gate plus 60 seconds as sufficient deletion proofs.

- A paused producer can resume after either interval without changing the directory's mtime. `run-check` creates its directory before publishing `.owner` (`src/run-check.ts:154-162`), so even a missing record needs a producer-specific explanation.
- The local Bun shim is placed on PATH, not necessarily in a TMPDIR/AKROGON variable. A path can also be held in application memory or configuration. Renaming it breaks a later open of the original name just as deletion does. Bun's matching implementation creates and adds this shim directory to PATH in [PackageManager.rs](https://raw.githubusercontent.com/oven-sh/bun/main/src/install/PackageManager.rs), `ensure_temp_node_gyp_script_run`, inspected 2026-10-15.
- A terminal leaf state does not establish that every consumer stopped. This audit observed `awk` PID 3243524 in an akrogon scope, with a deleted framework worktree cwd and a deleted scratch output fd. A failed leaf may also resume, which is why the taken worker decision preserves its ordinary guard.

These checks can veto deletion or help identify a producer. They cannot establish that arbitrary contents are disposable and no consumer will reopen them. The producer's output policy and ended consumer lifetime must supply those facts.

## R3. “A,C,D: all pass and go” is unsupported by the reported checks

For the three old-store directories, my process inspection had 129 permission-denied reads across 301 own-UID processes. No visible reference is not an exhaustive absence result. The exact Chrome profile invocation was not recovered. `shared-test-browser/run-RewR23` lacks an owner record. These are unresolved facts, not passing checks.

The merged shorthand “B: Bun shim, Chrome profile safe after checks” must retain the actual conditions: the creating installer/browser lifetime has ended, including relevant descendants, and the profile has no retained/reuse purpose. I have not verified those conditions. [fuser's restrictions](https://man7.org/linux/man-pages/man1/fuser.1.html), checked 2026-10-15, likewise document partial visibility without sufficient permissions.

## R4. A closed Formspark leaf does not authorize destruction of its proof

I disagree with C,D's “closed leaf, safe to delete.” Framework's `.claude/workflow/scripts/run-formspark-build-wiring-proof.ts:1271` writes the screenshot as part of the proof. Its historical `issues/closed/formspark-api/formspark-build-wiring/review-B.md:380` explicitly requires preserved actual evidence before counting the criterion. Neither source says closing the leaf ends evidence retention.

This does not prove that this screenshot is uniquely necessary. It proves the remaining question is about evidence, which process checks and leaf closure cannot settle. Determine whether it is required and whether a retained equivalent exists before deleting it. Do not import a retention decision from this cleanup fork into the separate check-evidence chart.

## R5. Q3 presents compatible recovery timing as a disagreement

B's “producer finish, reconcile for crash recovery, plus one bounded migration” does not oppose checking all registered repos, including those with no open leaves, during normal reconcile. `src/next.ts:1323-1327` already loops repos and invokes reconcile without requiring a nonempty leaf list. I support extending that recovery to the newly owned disposable outputs.

The actual difference is whether recurring host-wide discovery may delete arbitrary unowned directories. B requires defined producer rules and an explicit legacy migration boundary. Producer cleanup is also necessary: `src/run-check.ts:220` and `src/shell.ts:65` already remove outputs at completion. Reconcile alone should not replace that responsibility.
