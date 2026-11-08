# Rebuttal: chart-door (Seat E)

## Q1. Why `hc wait --children all` is needed per exchange, not only at handover/restart (vs B, D)

- **Every exchange round is a collection barrier (`SKILL.md:57`):** A cannot merge `fork-*-merged.md` or present the operator round until all active consultants finish or are nudged/dropped. Restricting `hc wait --children` to restart/handoff/handover (D) leaves every normal fork-notes and rebuttal round exposed if the slowest consultant silently ends in `done`/`idle` (`INTAKE.md:200`).
- **Ending A's turn mid-exchange (B) breaks `SKILL.md:56,178`** ("While a prompted peer's turn is open A stays in its own turn") and wakes A on each child's report separately; `hc wait --children all` already exists in `hc` without binary patches (`map-merged.md:9`).

## Q2. Why C's two blind self-sends violate signpost 2a / 2026-11-06 direction

- **Losing `superseded` cancellation (`SKILL.md:163`) and new-transcript verification (`INTAKE.md:51-54`) is a regression, not an acceptable cost (`signposts.md:74`):** Firing `hc send $HC_TERMINAL_ID "/clear"` and `hc send $HC_TERMINAL_ID "<start prompt>"` before A's turn ends cannot cancel if the operator types during turn teardown (`SKILL.md:163`), and risks pasting `<start prompt>` before `/clear` or `/new` rotates the transcript (`INTAKE.md:51-52`). The detached reset helper (using `hc events --terminal $HC_TERMINAL_ID` + the `src/` transcript resolver) keeps every existing guard with zero polling.

## Q3. Temp-path removal (vs C)

- Removing the `/tmp/<session>/map-*` rule is an explicit operator direction in `INTAKE.md:126-134` (create `issues/chart/<chart-slug>/` at Open before the opening map).
