# Merged map: drop-debate

Sources: map-A.md, map-B.md, map-C.md, map-D.md (all 2026-10-25, main 69390138).

## Agreed

- Remove `plan.positions`, `plan.rebuttal`, their routes and `failed.next` entries (`src/routing.ts` `routing`), the rebuttal-destination guard (`src/phase.ts` `transition`), the debate dispatch guard (`src/next.ts`), the `## plan.positions`/`## plan.rebuttal` sections and the debate clause in `## plan.synthesis` (`skills/plan-issue/SKILL.md`), the debate-artifact sentences in `skills/check-issue/SKILL.md` `## check.review`. (A,B,C,D)
- Keep the phase name `plan.synthesis`. Renaming is a second migration of every log line. (B,D)
- Door: route question becomes lifecycle or direct; `Route: <lifecycle | direct>`; state.yaml template drops `debate` and always starts at `plan.synthesis`; autopilot drops debate from its self-answers. (A,B,C,D)
- Non-target: the chart-level consultant rebuttal in `skills/chart-issues/assets/questions.md` and `## Take` stays. Sweep by token (`plan.positions`, `plan.rebuttal`, `debate:`, `rebuttal:`, `positions-`), never by the word "rebuttal". Lesson 2026-09-11 lock-vs-criterion. (C,D)
- Closed leaves' `positions-*.md`/`rebuttal-*.md` stay as history. (B,D)
- Retired phase names stay readable in history: `issues/log.jsonl` (`src/log.ts` `logSchema`, `readLog` throws on a bad line), `issues/timings.jsonl` (`src/timing.ts`), and `failure.phase`. A historical phase enum used only by those readers; live state and moves use live phases only. Rewriting logs is refused: it is the move audit. 65 lines across 5 repos name the retired phases. (C,D)
- Tests that use `plan.rebuttal`/`plan.positions` as a generic two-slot phase (`tests/phase.test.ts` race cases, `tests/next.test.ts` busy/override fixtures) are ported to a surviving phase, not deleted; `tests/helpers.ts` `leaf()` and fixtures stop writing `debate`, so a new-shape record is proven to parse. (B,C,D)
- One leaf, one release: command and skills deploy together through `~/.akrogon/current`; a split leaves installed skill text calling phases the installed binary rejects. (C,D)
- Docs sweep in the same leaf: `docs/reference/state-and-phases.md`, `config.md`, `skills.md`, `files.md`, `limits.md`, `docs/use/plan-work.md`, `quick-fix.md`, `write-issues-by-hand.md`, `docs/start/one-change.md`, `docs/examples/autopilot-story.md`, `docs/pictures/phases.svg`, `skills/watch-issues/SKILL.md`, `skills/init-akrogon/SKILL.md` config sample. (B,C,D)
- Handoff format: no change to brief.md or design.md. Debate-yes leaves show no lower Fix rate (akrogon 3/5 vs 55/215, framework 4/13 vs 334/622); Fixes in both groups are implementation and proof defects; the design already forces consumers per changed precondition and `Open for the plan:` questions (27 of 198 akrogon designs use it); with peers named, the door already has every peer review each draft brief/design as an implementer. (A,B,C,D)

## Differ

1. Old `debate:` keys in 1,058 state.yaml and `rebuttal:` in 11 repo configs, both under strict schemas (`src/state.ts` `stateSchema`, `src/config.ts` `repoSchema`):
   - strip the key at read in `readState`/`readRepo`, permanent; types stay clean; no cross-repo edits (D)
   - keep the field `.optional()` and ignored, then a follow-up strips configs and drops the line (C)
   - tolerate in the leaf, door strips keys in all 11 repos on main after release, then a follow-up removes tolerance (A)
   - strict schemas with an explicit coordinated migration and rollback data (B)
2. A record at a retired phase at install (open, parked, or failed-from): measured zero in all 11 repos today (B,C,D).
   - map on read to `plan.synthesis` with `done` cleared (D)
   - no mapping; recheck zero at cutover; a stray record fails loudly (B,C)
3. Optional plan-issue sentence: `## plan.synthesis` names the simplest alternative considered and why it loses, replacing the "simpler alternative" debate positions required (D, optional). Others: no change.
4. Rollback to the previous release cannot read new records without `debate` (D). All options share this; D accepts and records it.

## Open questions

- D Q9: on charts without named peers, nobody second-reads a brief/design before A plans. Should the door recommend peers for large leaves? (D)
- Route: lifecycle vs direct (A leans lifecycle).
