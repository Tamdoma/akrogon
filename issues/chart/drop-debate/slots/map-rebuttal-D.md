# Rebuttal: drop-debate merged map (seat D)

## Agreed

- Wrong wording: "Debate-yes leaves show no lower Fix rate" contradicts its own numbers. Framework debate-yes is numerically lower (4/13, 31%) than debate-no (334/622, 54%), akrogon the reverse. Correct claim: tiny samples pointing opposite ways, so no detectable effect. The no-shape-change conclusion survives on that weaker claim plus the Fix-class evidence. (`fix_rounds` in closed `state.yaml` under akrogon and framework `issues/closed`; better-than-training; 2026-10-25)
- Missing scope on the token sweep: `debate:`, `positions-` legitimately remain in `issues/closed/**` records and closed artifacts this same file says stay as history. The sweep must name its roots (`src/`, `skills/`, `docs/`, `tests/`), or it instructs the over-deletion it warns against. (`issues/closed` leaf records; better-than-training; 2026-10-25)
- Otherwise no disagreement.

## Differ

1. Final pick: strip `debate`/`rebuttal` at read in `readState`/`readRepo` permanently, because `.optional()`-then-follow-up and door-strips-11-repos both depend on a later cleanup across repos this leaf cannot land, while strip-on-read needs none and self-cleans state on next save. (`src/state.ts` `readState`, `saveState`; `src/config.ts` `readRepo`; better-than-training; 2026-10-25)
2. Final pick: map a retired phase to `plan.synthesis` with `done` cleared on read, because the no-mapping alternative leaves the leaf undispatchable until an operator hand-edit that the error does not describe. (`src/state.ts` `readState`; `src/routing.ts` `routing`; better-than-training; 2026-10-25)

- Item 2, "fails loudly" overstates the no-mapping outcome: a retired-phase state lands in `unreadable` from `readInventory` (`src/state.ts`), which `src/status.ts` and `src/next.ts` do report, but with a Zod enum error that never mentions clearing `done`, and no command can move the leaf. Loud, not actionable, and stuck. An in-flight seat is also unmentioned: its finishing call dies at `phaseSchema.parse` in `phaseCommand` (`src/phase.ts`) under either option, but only the map lets A proceed at synthesis afterwards. (better-than-training; 2026-10-25)
- Item 4, "all options share" the rollback break is imprecise: B's coordinated migration carries rollback data by construction. A, C, and D break rollback only for records created or cleaned after removal, since the old binary required `debate` (`src/state.ts` `stateSchema`). Record that scope, not a blanket equivalence. (better-than-training; 2026-10-25)
- Item 3: no disagreement. The sentence stays optional.

## Open questions

No disagreement.
