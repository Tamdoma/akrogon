# Review A: fork-per-round (initial)

Base: `c9c96553f8d64c76668a1e2a9aee027e9d634ad1`
Reviewed head: `fc1cd2ef34c3ffbf82a788fb41d468275fd43788`
Branch `fork-per-round`, worktree clean. `debate: no`, no positions/rebuttal expected or read.

## Verdict: ready

No Fix, no Nit. Diff is 4 modified files, 12 insertions, 5 deletions, all design literals verbatim.

## Criterion evidence (all verified live in worktree)

- A1 (C1): `questions.md:29` holds the new current-fork sentence; old `Present all currently` count is 0 repo-wide in skills/docs; paragraph tail after the first sentence is byte-identical to base (script-compared).
- A2 (C2): `SKILL.md:47` holds re-read Fog, move sharp material, reshape forks, update Open forks list, select and research next fork; handoff-readiness and prototype clauses after the semicolon byte-identical to base.
- A3 (C3): `SKILL.md:35` is the one-fork sentence verbatim after the territory-map sentence, before the split paragraph; `:39` direct-item condition is `no open fork and no fog`, prefix before `A direct` identical to base.
- A4 (C4): `shapes.md:26` adds `## Open forks` between Forks taken and Fog with the ordered-link line; `:80` fork sentence is the new Open-forks-list sentence, prefix identical; preflight refusal line (`Refuse the handoff while any fork file lacks an operator answer...`) untouched.
- A5 (C5): `chart.md:124` says one per round plus research-after-answer; `:158` records sentence appends the open-forks order clause; diff removes only the extended records line, diagrams and export-csv example untouched.
- A6 (C6): `grep -i "chart.*round|round.*chart|fork.*round|round.*fork"` on `skills/AREA.md` and `README.md` returns nothing; both files have empty diff. Report's "none found" claim holds.
- A7 (C7): only added `##` heading in diff is `+## Open forks`; no new file, field, or command; Drain/Take/round/fork paragraphs read map, one fork per round, reshape, next fork, handoff. Contradiction hunt over `one complete round|every fork|each round|per round|one fork` shows no stale granularity sentence.
- A8 (C8): report evidence accepted without rerun (docs-only change, no code touched): `bun run format` exit 0, `bun test tests/docs-links.test.ts` 3 pass, `bun run typecheck` exit 0, `bun test` 287 pass 0 fail; `git diff -- src/ tests/ issues/` empty, confirmed live.

## Exclusions and contracts

- Design exclusions hold: `src/`, `tests/`, `plugin/`, other skills, `issues/` unchanged; round shape block, B-exchange paragraph, and B exchange rules untouched; no `blocked-by`/status/claim field.
- Tests vs criteria: no test added or changed; acceptance rests on targeted greps plus the existing docs-links and full suites. No mocks, no new prose-wording tests.
- Ponytail: minimal literal-only diff, no abstraction, no dependency. No concern.
- Changed-behavior docs: the human page describing the changed behavior (`docs/guide/chart.md`) was updated in this same diff; no unchanged doc page contradicts the new behavior.
- No AREA.md in diff, so no path-existence listing applies. No lesson claim in report, nothing to check. `learnings/LESSONS.md` not used as review input.

## Checks rerun

None at review time. Docs-only diff with complete report evidence and no specific concern; doc/index authorship stays with B.

## Merge (A)

- Rebase target: `origin/main` at `c9c96553f8d64c76668a1e2a9aee027e9d634ad1` (identical to leaf base). Rebase was a no-op, head unchanged `fc1cd2e`; no conflict, no range-diff.
- Post-rebase `AKROGON_BASE`: `c9c96553f8d64c76668a1e2a9aee027e9d634ad1`.
- Checks in worktree, all green:
  - `bun run format` → all files unchanged, exit 0.
  - `bun run typecheck` → `tsc --noEmit`, exit 0.
  - `bun test` → 287 pass, 0 fail, 3360 expect calls, 13 files.
  - `bun test --changed="$AKROGON_BASE"` → 4 changed files, no test files affected, 0 pass 0 fail, exit 0.
  - Advisory: none configured.
