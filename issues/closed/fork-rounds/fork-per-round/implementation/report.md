# Implementation report: fork-per-round

Mode: subagents, 2 sequential workers. Plan checklist done in order.

## Changed files and reasons

- `skills/chart-issues/assets/questions.md`: round first sentence now current-fork only, next fork researched after answer (C1, D2).
- `skills/chart-issues/SKILL.md` Drain: inserted one-fork sentence after territory-map paragraph; direct-item condition now no open fork and no fog (C3, D3).
- `skills/chart-issues/SKILL.md` Take: replaced middle clause with re-read Fog, move sharp material, reshape forks, update Open forks list, select and research next fork (C2, D4).
- `docs/guide/chart.md`: added one-per-round paragraph in forks section, appended open-forks order sentence to records paragraph (C5, D6).
- `skills/chart-issues/assets/shapes.md`: template gains `## Open forks` between Forks taken and Fog; fork last sentence now points at ordered Open forks list (C4, D5).
- `skills/AREA.md`, `README.md`: read, no sentence describing chart rounds found, unchanged (C6, D7).

## Commands run with pasted results

Worker 1 (brief-1, questions.md + SKILL.md):
- `AKROGON_BASE=c9c96553f8d64c76668a1e2a9aee027e9d634ad1 bun test --changed="c9c96553f8d64c76668a1e2a9aee027e9d634ad1"` → 2 changed files, no test files affected, 0 pass 0 fail, exit 0.
- Red: old `Present all currently` present, new absent. Green: new current-fork sentence present, old gone, tail byte-identical.
- Artifacts: `/tmp/fork-worker1/grep-red.log`, `/tmp/fork-worker1/grep-green.log`, `/tmp/fork-worker1/diff.log`, `/tmp/fork-worker1/test.log`.

Worker 2 (brief-2, shapes.md + guide + verify-only):
- `AKROGON_BASE=c9c96553f8d64c76668a1e2a9aee027e9d634ad1 bun test --changed="c9c96553f8d64c76668a1e2a9aee027e9d634ad1"` → 4 changed files, no test files affected, 0 pass 0 fail, exit 0.
- Green: `## Open forks` at shapes.md:26, new fork sentence at :80, guide sentences at chart.md:124 and :158. AREA/README grep confirms no chart-rounds sentence, diff empty.
- Artifacts: `/tmp/fork-worker2/grep-green-shapes.txt`, `/tmp/fork-worker2/grep-green-chart.txt`, `/tmp/fork-worker2/grep-verify-docs.txt`, `/tmp/fork-worker2/diff.txt`, `/tmp/fork-worker2/test.log`, `/tmp/fork-worker2/consistency.txt`.

B final checks in worktree:
- `bun run format` → all `src`/`tests` unchanged, exit 0.
- `bun test tests/docs-links.test.ts` → 3 pass, 0 fail, 8 expect calls.
- `bun run typecheck` → `tsc --noEmit`, exit 0.
- `bun test` → 287 pass, 0 fail, 3360 expect calls, 13 files, 73.73s.
- Scope: `git diff -- src/ tests/ issues/` empty; `git diff -- skills/AREA.md README.md` empty; added headings grep shows only `+## Open forks`; old strings (`Present all currently`, `CHART.md lists none`, `finds no fog writes`) each count 0.

## Base and committed head

- Base: `c9c96553f8d64c76668a1e2a9aee027e9d634ad1`
- Head: `fc1cd2ef34c3ffbf82a788fb41d468275fd43788`
- Branch `fork-per-round`, worktree clean after commit. Diff: 4 files, 12 insertions, 5 deletions.

## Known limitations

- Installed copy under `~/.claude/skills` not updated by this leaf; operator refreshes after merge.
- `preferring the one whose answer reshapes the most remaining forks` stays agent judgment; no dependency system per design.

## Unverified criteria

- None. All A1-A8 verified: greps hit, docs-links and full suite pass, scope diff clean, Drain/Take/round/fork paragraphs read as map, one fork per round, reshape, next fork, handoff.

## Worker returns folded

- Worker 1: Changed files and reasons: questions.md + SKILL.md Drain/Take per D1-D4. Tests run: changed-test 0/0 exit 0. Known limitations: none known. Unverified criteria: none.
- Worker 2: Changed files and reasons: shapes.md + chart.md per brief 4. Tests run: changed-test 0/0 exit 0. Known limitations: none known. Unverified criteria: none.

Sub-briefs: `implementation/brief-1.md`, `implementation/brief-2.md`.
