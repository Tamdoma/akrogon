# pane-record notes — slot C

## Pick

**(a) — record each pane id in `state.pane` immediately after it is created (pair save before `box`), relying on allocate's existing entry sweep to close a recorded pane left outside its scope.**

Reason: the current save ordering creates a state the code cannot heal — an unrecorded pane that every later pass treats as foreign. Recording early only ever creates a state the code already heals: at entry, allocate closes any recorded pane `inOwnScope` reports as `outside` and splits a fresh one, then re-saves the pair. So the fix deletes the orphan class entirely for every failure after the save (box throw, adoption deadline, SIGKILL, power loss), and it does so by inverting a comment, not by adding a mechanism. This is the smallest diff of all candidates: move two `saveState` calls, update the comment, extend a seat-containment test.

Cost: for the interval between a pane's split and its box, `state.pane` names an unboxed shell. No consumer breaks — `stop` acts on the slice, `dispatchSlot`/`observeBusy`/`ownsPane`/`log`/`closeMergedTab`/`broadcastPass` only resolve pane ids, and the entry sweep is exactly the consumer that converts recorded-unboxed into closed-and-recreated. The one real residue: a kill between `pane split` returning and `saveState` completing still orphans, because herdr cannot atomically return-and-record. That window shrinks to microseconds but never reaches zero; an operator split pane and that orphan remain indistinguishable to any automatic cleanup.

Mechanics that make it safe (binding if picked):

- Save complete pairs only. After `first` is resolved: `{A: first, B: repairB}` in the repair path, `{A: first}` otherwise — never `{A: first, B: undefined}` while a live recorded B exists. In the repair path `recordedB` is alive; saving `{A: first, B: undefined}` then dying would strand that live recorded B as an orphan on the next pass (bootstrap would be false only through A, `recordedB` would be gone from state — the tab member survives unrecorded). When `state.pane.B` is already recorded and alive, the pair save must keep it.
- After `second` is resolved (re-split or existing): save `{A: first.pane_id, B: second.pane_id}` before `box(second)`. This save can replace today's final `saveState(allocated)` — same content, earlier point. A kill after `box(second)` then needs no further save.
- The comment "Boxed before any save records it" inverts: "Recorded before boxing, so a later throw leaves a recorded pane the entry sweep closes."

## Rejected options

**(b) reuse an existing unrecorded tab member as B on bootstrap.** Fails the fork: it converts one orphan into zero orphans only when the orphan happens to sit at `members[0]`'s sibling and is the pane picked — and it does nothing about the actual defect, which is that `box`-then-save can orphan on every run. Worse, it can adopt an operator's hand-split pane: `members[0]` is chosen by position, and a hand-split shell inherits the leaf worktree as cwd, so neither position nor `inWorktree` distinguishes akrogon's orphan from the operator's. Boxing would then adopt an operator shell into the leaf slice — silent capture, the opposite failure direction. B's own map flagged this.

**(c) reconcile unrecorded members before splitting, with an ownership rule.** The ownership rule does not exist. Orphan and operator panes are identical on every observable surface: same tab, same cwd (worktree), both `outside` the slice, both `agent: null`, both shells. `pane.cwd` inside the worktree cannot discriminate — it matches for both. The only real discriminator is a marker env var injected by `--env` at split and checked via `/proc/<shell_pid>/environ` (operator splits don't pass `--env`, so they can't inherit it). That is a second mechanism — marker injection, environ probe, close rule — to cover the residual window that (a) already shrinks to a single statement. Also deletes nothing.

**(d) catch/finally close of a split pane on allocate failure** (from map-B's O3). Handles only thrown failures inside the process; does nothing for SIGKILL, power loss or herdr-side split succeeding while the reply dies. Can also mask the original error or close a pane that adopted fine. Strictly weaker than (a), which turns the same throws into the self-healing recorded-unboxed state.

**(e) rebuild the tab wholesale when pane state is incomplete** (map-B's O4). Destroys operator panes by design. Rejected by the carry: operator panes in a leaf tab are legal.

## Evidence

- Tier 3 · `src/next.ts` `allocate` at HEAD 92dddada, read 2026-10-22 · Confirmed the gap: `saveState(tabState)` before any pane op; `box(first)`; repairB swap; `second` split; `box(second)`; only then `saveState(allocated)`. Any failure in or after `box(second)` leaves `second` live and unrecorded; next pass takes `bootstrap` (both pane ids undefined) or `recordedB === undefined` and splits a new B. The intake's pA/pB/pC trace matches exactly.
- Tier 3 · `src/next.ts` allocate entry sweep · Recorded panes found `outside` their scope are closed and the pass splits fresh — the self-heal path (a) rides on. Already exercised by `tests/seat-containment.test.ts` ("an outside pane is closed and recreated boxed before any prompt").
- Tier 3 · `src/next.ts` consumers of `state.pane` (`dispatchSlot`, `observeBusy`, `ownsPane`, `paneOwners`, `broadcastPass`, hook `pane.B` check) and `src/stop.ts` · Every consumer resolves recorded ids against the live pane list or acts on the whole slice; none assumes "recorded ⇒ currently boxed" except the entry sweep, whose job is enforcing it. A recorded-unboxed pane is a state the design already names ("A recorded pane found outside its scope… is closed and recreated", `docs/guide/next.md`).
- Tier 3 · `src/reconcile.ts` · Reconcile never closes panes at all — it only stops slices and closes tabs of finished leaves — so no existing cleanup covers an orphan; the fix must live in allocate. Confirms (a) over (c)-as-existing-behavior.
- Tier 3 · `tests/fake-herdr.ts` `pane split`/`tab create` · Splits take `--cwd`/`--env` flags; a marker-env ownership rule for (c) is technically feasible but adds a herdr surface plus `/proc/<pid>/environ` reading — real cost for the one window (a) leaves open.
- Tier 3 · intake · The observed failure is one orphan once, urgency low — argues against paying (c)'s machinery for the residual window.

## Pitfalls and what removes them

- **Recorded-unboxed pane observed mid-allocate** (another `next`, `stop`, a hook pass): removed by the global `.lock` around every allocation caller and by the entry sweep being the first thing allocate does; worst case a concurrent reader sees a pane id that is closed and re-split before next read — same transient the sweep already produces.
- **Repair path stranding a live recorded B**: removed by the pair-only save rule above; a leaf done-criterion should cover "interrupt after A dies, B lives, retry — B is neither orphaned nor re-split".
- **Residual kill between `pane split` return and `saveState`**: cannot be closed by any in-process ordering; what removes the practical risk is keeping split→save adjacent (one statement gap) plus the documented operator remedy `herdr pane close`. If A wants it fully closed, that is a separate marker-env mechanism (candidate (c)'s real shape), not a reason to pick (c) over (a) for #116.
- **`box(second)` throw today also strands `first` boxed-but-unrecorded**: already healed on retry (sweep finds recorded ids only… actually `first` under bootstrap is reused via `members[0]` position — noted in intake). Under (a) `first` is recorded before its box, so this strand case disappears too.
- **`akrogon stop` mid-allocate**: stops the slice only; a just-split unboxed pane survives regardless of ordering today and after (a) — pre-existing, not introduced by the fix; the leaf should not try to also fix this.

## Questions the fork does not ask

1. Should the leaf also change `state.pane` saves to clear stale ids when the entry sweep closes a pane? Today the closed id stays in `state.pane` until the pair save overwrites it mid-allocate — harmless because consumers re-resolve against the live list, but a `{A: undefined}` write on close would tighten "recorded ⇒ live". Small; optional.
2. Is the residual split→save orphan worth a reconcile-level rule ever (marker env + `/proc` environ)? If the operator's answer is "yes, eventually", the leaf should name the marker now so both fixes share one mechanism; if "no", (a) stands alone and docs gain one sentence: an orphan from a hard kill is closed by hand.
3. Does `herdr pane split` guarantee the new pane is a member of the source pane's tab on every ordering (the `members` re-fetch assumes it)? If herdr can place the split elsewhere, the pair save would record a pane outside the leaf tab. Probe or fake-herdr contract check in the leaf.
