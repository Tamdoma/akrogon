# Review A: charting-guide

- **Base (`AKROGON_BASE` / `origin/main`)**: `5d425ea8381036e9ae0fa87ef91d7da9d0254a06`
- **Reviewed head (`HEAD`)**: `e59b9a4cef82b581dbc492fd39e815ece3752403`
- **Worktree state**: clean (`git status --porcelain` empty; 3 commits ahead of base; 6 files changed, 483 insertions)
- **Verdict**: `nits`

## Scope and documentation checks

- **Owned surfaces only**: diff touches only `docs/guide/04-a-charting-session.md`, `05-signposts.md`, `06-charting-mode.md`, `07-build-route.md`, `08-hand-off.md`, and `docs/README.md`. All `design.md` exclusions (`docs/start/`, `docs/use/`, `docs/examples/`, `README.md`, `docs/reference/`, `docs/pictures/`, `skills/`) are untouched.
- **No `AREA.md` or `learnings/` edits in diff**: none present on the leaf branch.
- **Documented behavior change**: no code behavior changed (docs-only leaf).
- **Navigation and placeholder hygiene**: all five pages carry Previous/Next links naming only files that exist at landing (`docs/README.md` and `04`–`08`), with zero links to uncreated pages (`01`–`03`, `09`–`13`) and zero picture embeds or placeholders.
- **Retired-phrase hygiene**: zero hits in `docs/guide/` or the `docs/README.md` diff for `manual`, `quick fix`, `autopilot signposts`, `chart door`, or `the door`.

## Verification evidence

- **Existing link check (`tests/docs-links.test.ts`)**: passed on `e59b9a4c` — `check docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-guide/charting-guide/implementation/check-docs-links-1795776271592-2063844.log` (13 pass, 0 fail).
- **Destination `checks` (`akrogon verify`)**: green leaf-scope receipt `3f4ccffa-cb1a-4222-aee7-283c98a3ef1d` recorded in `issues/verify-runs.jsonl` for `sha: e59b9a4cef82b581dbc492fd39e815ece3752403` (`tree: afed4f35a806f70a17d4fccf84b27f35bcd44c8a`, `setup: 0`, `format: 0`, `typecheck: 0`, `test: 0` — 1550 pass, 0 fail).
- **Behavior-claim source paths**: verified every path cited in `implementation/report.md`'s `## Behavior claims` table exists in the worktree (`src/hc.ts`, `src/AREA.md`, `skills/chart-issues/SKILL.md`, `src/pull.ts`, `src/flaky.ts`, `src/status.ts`, `skills/chart-issues/assets/questions.md`, `src/seat.ts`, `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/assets/handover.md`, `skills/chart-issues/scripts/door-reset.ts`, `skills/chart-issues/assets/autopilot.md`, `src/notice.ts`, `src/direct.ts`, `src/land.ts`, `src/phase.ts`, `src/readiness.ts`, `skills/chart-issues/scripts/chart-usage.ts`, `src/preflight.ts`).
- **Paid sessions**: none required or run (`grants: []`; `design.md` notes slot B's cold-reader subagent runs inside slot B's own review session).

## Done-criteria review

1. **Criterion 1 (Files, plain words, approved vocabulary, shared running example)**: Satisfied. Exact five filenames present; approved vocabulary used throughout; coherent made-up running example (`client-portal`, weekly client report export) carried across all five pages with no real client or machine-config repo names.
2. **Criterion 2 (`06-charting-mode.md` & `07-build-route.md`)**: Satisfied. Both pages clearly separate Charting mode from Build route, include examples for every mode and both routes (including a fast feature — new CSV export button — as well as a fix for Direct), show own-words switch-on prompts, and explicitly state Direct is offered only under No autopilot.
3. **Criterion 3 (`05-signposts.md`)**: Satisfied. Explains what signposts are, when asked (once per session before any territory map), who answers them in each Charting mode, and the operator-only needs sheet with a worked `client-portal` example.
4. **Criterion 4 (Cold-reader questions)**: Owned by slot B (`review-B.md`). Spot-check confirms all 7 questions from `design.md` have direct, self-contained, quotable answers inside `docs/guide/04`–`08`.
5. **Criterion 5 (Behavior claims match `skills/chart-issues/` and `src/` with paths in report)**: Satisfied. All 28 rows in `implementation/report.md`'s `## Behavior claims` table cite existing files and match live behavior (including `door-reset.ts` supporting `claude`/`agy`/`codex`/`pi`, `src/preflight.ts` checking remote/default branch/tracking ref, `SKILL.md` author + all body editors permission check on seed decisions, and `src/direct.ts` eligibility/drop behavior).
6. **Criterion 6 (`docs/README.md` links in order & `checks` pass)**: Satisfied. `docs/README.md` links `guide/04-a-charting-session.md` through `guide/08-hand-off.md` in order under `## Charting`; `docs-links` and `akrogon verify` (`3f4ccffa`) pass on `e59b9a4c`.
7. **Criterion 7 (Tone)**: Owned by slot B's model-choice reading (`review-B.md`). Independent read finds plain how-to prose, no marketing hype, technical terms explained on first use, and at most one restrained opening sentence per page.

## Fixes

None.

## Nits

1. **`docs/guide/08-hand-off.md` line 12 (`produces` gloss)**: Line 12 lists `readiness.yaml` fields including `` `produces` `` without repeating the short parenthetical gloss ("generated credentials") that appears on `docs/guide/07-build-route.md` line 39.
   - **Why deferred**: The chapter is numbered for sequential reading (`04` -> `08`), so a reader arrives at `08` directly after reading `07`'s gloss, and `08` does not rely on `produces` for any cold-reader question.
   - **What would promote to a Fix**: A cold-reader or operator misreading `08-hand-off.md` in isolation because `produces` was unclear.
