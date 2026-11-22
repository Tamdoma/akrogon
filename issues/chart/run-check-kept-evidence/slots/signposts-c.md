# Signposts missed angles (slot C)

## Missing direction questions

1. **Retention lifetime and sweep owner:** When may a kept failed-run temp dir be removed — (a) with the leaf temp when the leaf finishes and its tab/slice closes, (b) after a fixed TTL/drain window, or (c) only manually (like `refusal.json`) — and what rule governs `--holder` (`slug: 'checkout'`) runs that have no leaf tab?
   - Reason: governs `reconcile`'s `run-*` and `ownTemps` sweep (`src/reconcile.ts` `reconcile`), `/var/tmp` disk bounds, and whether failed-leaf evidence survives tab close or idle passes (`src/run-check.ts` `leafTarget`).
2. **Printed-path preservation vs relocation:** Must the child's literal printed `TMPDIR` path (`run-<id>/...`) stay readable in place after exit, or may `run-check` move/rename kept contents (e.g. out of `run-*` or into the leaf folder) and announce the new path?
   - Reason: keeping the printed path in place rules out post-exit renames and cross-device `/var/tmp`→`/home` moves, forces `reconcile` (`src/reconcile.ts` `reconcile`) or temp layout to handle kept runs in situ, and avoids `akrogon pack` / repo bloat.
3. **Caller and failure scope (`run-check` vs `verify`, and killed runs):** Should retention apply to (a) every non-zero `checkedRun` (including `verify` setup, `checks`, `merge_checks`, and `--known-red` base runs) or direct `run-check` calls only, and (b) normal non-zero exits only or also killed/abandoned runs?
   - Reason: `verify` delegates to `checkedRun` (`src/verify.ts` `runOnce`, `src/run-check.ts` `checkedRun`), so this decides whether red `verify` / `--known-red` runs retain heavy test temps and whether dead-`.owner` crash runs stay swept (`src/reconcile.ts` `reconcile`).
4. **Operator and tool visibility:** Should kept failed-run temps stay silent as active-leaf scratch, or surface in `akrogon status`/`akrogon leftovers` and/or `run-check` stderr?
   - Reason: any new `reconcile` keep reason flows into `reconcile/<repo>.json`, `status` (`src/status.ts` `statusCommand`, `jsonRepo`), and `akrogon leftovers` unless whitelisted in `inUse` (`src/leftovers.ts` `leftover`), and stderr changes affect `runCheck` (`src/run-check.ts`) output consumers.

## Draft question issues

- **Q2 (mis-optioned / incompatible):** Option (a) freezes both `reconcile`'s sweep and the per-run/success layout while letting only the failed-run exit path change, which cannot keep a `run-*` path alive past the next `reconcile` pass — `src/reconcile.ts` (`reconcile`) immediately `drop()`s `run-*` dirs with a dead `.owner`, idle-sweeps ownerless `run-*` after 60s (while flagging `'run younger than 60s'` / `'unowned entry'`), and only preserves `refusal.json` (which blocks `leafTemp` deletion forever and reports publish-refusal leftovers). Separate true invariants (success-path cleanup, per-run isolation, eventual reclamation) from whether `reconcile`'s `run-*` rule may change.
- **Q3 (already settled by intake):** `INTAKE.md` (`Scope`) already fixes `Destination: akrogon` for one chart, so changing framework drivers is out of scope rather than an open direction choice.
- **Q4 (immaterial):** Both `checkedRun` removal (`src/run-check.ts` `checkedRun`) and `reconcile` sweeping (`src/reconcile.ts` `reconcile`) are deterministic and locally testable with a failing command; a paid capture changes no design pick.
- **Q5 (immaterial):** Retiring the mechanism's lesson lines in the stopping leaf is already the standing rule (`learnings/LESSONS.md`, `INTAKE.md` `Agent findings`) and changes no downstream design pick.
