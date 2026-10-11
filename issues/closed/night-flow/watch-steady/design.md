# Design: watch-steady

## Binding decisions, verbatim

From `issues/chart/night-flow/forks/keep-running.md`, Taken. Operator, 2026-10-11, verbatim: "1a - but this shouldn't be formal. I always do it, but there should be NO dependencies on this so we don't overcomplicate. | 2a - ..."

W watch-steady (Q1)
- The watch is an informal operator habit. No leaf, done-criterion, doc or design depends on it; S1 and S5 are correct with no watch and move on the next pass from any existing source (herdr event, startup `--resume`, merge wake, dependents, manual).
- Skill text only, `skills/watch-issues/SKILL.md`: the watch never self-deletes; remove the stop rule (`:45`) and every reference to it, including the refusal to create a job when the rule holds (`:16-18`), the tick's delete path (`:38`) and the automatic-stop notice (B F1). The wording is "never self-deletes": session loss and the 7-day job expiry remain.
- The tick runs nothing for a repo `akrogon status` reports paused, since typed `next <slug>` ignores pause (`src/next.ts:1572`, C RB5).
- No expiry warning and no doc stating the watch is required.

Exclusions: no akrogon code changes; no timer; the records-sync part of the same fork belongs to `records-sync`.

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: skill text only, so there is no code test. Proof is the report's sweep with the edited lines quoted. No live run and no outside call.

## Leaf architecture

- Edits only in `skills/watch-issues/SKILL.md`. Its `/watch-issues stop` path and its 20-minute cadence are unchanged.
