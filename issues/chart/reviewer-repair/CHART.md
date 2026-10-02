# Chart: akrogon

## Destination
Review findings stop costing a full A turn: B repairs the findings it can prove inside its review pass and merges, A gets only the work B cannot do, and operator-only items stop once instead of riding repair rounds.

## Forks taken
- [Repair authority](forks/repair-authority.md): 1a 2a 3a, B repairs every Fix except plan changes, missing units, live runs and operator-only items, after both blind verdicts, with no second reader
- [Operator-only exit](forks/operator-only-exit.md): 1a, B repairs the doable Fixes first, then one failed stop naming every operator action
- [Round budget](forks/round-budget.md): 2a 3a, recovery keeps fix_rounds, B's in-pass repairs do not count

## Open forks

## Fog

## Off route
- Model and effort choice for slots, and the `fix_rounds` cap value.
- The realistic Fix bar itself (`issues/chart/realistic-fix-bar/`).
- Test and check time inside implement and merge: its own chart, `issues/chart/akrogon-slow-phases/`.
- A command-run checks gate: `src/phase.ts:283` holds a global lock, so running checks inside `akrogon phase` blocks every leaf; operator did not ask for it.
- Leaf size in framework charts (emdash-launch 10k-line diff). A framework chart concern.
- Changing the running emdash-launch leaf. Operator action there.

Handed off 2026-10-02
