# Plan: docs-start

Debate is off (`debate: "no"`), so this plan comes straight from `brief.md` and `design.md`. All seven blocked-by leaves are `merged`, and their pages and pictures are on the base `2c073b38`.

## Read first

- `brief.md`, `design.md` (this folder)
- `issues/chart/beginner-docs/PAGE-MAP.md` under the registered root (door-owned, never edited)
- `issues/chart/beginner-docs/scratch/provenance.md` under the registered root (gitignored; read only, never copied)
- The P2 start-story leaf folder named in provenance: `brief.md`, `design.md`, `plan.md`, `implementation/`, `review-A.md`, `review-B.md`, `state.yaml`
- `docs/reference-index.md`, `src/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md`
- Current `README.md` (sections "How the pieces fit", "Guide", "Install", "Initialize a repository")
- Old sources per page-map row: `docs/guide/idea.md`, `parts.md`, `state.md`, `install.md`, `setup.md`, `phases.md`, `merge.md`
- Facts: `src/install.ts`, `src/config.ts`, `src/init.ts`, `src/next.ts`, `src/land.ts`, `src/phase.ts`, `src/akrogon.ts`, `skills/init-akrogon/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`
- Style and link targets: `docs/use/a-working-day.md`, `docs/examples/README.md`, `docs/reference/*.md`, `docs/pictures/*.svg`
- Tests: `tests/docs-links.test.ts`, `tests/log-reader.test.ts`, `tests/hold-retired.test.ts`, `tests/run-permit.test.ts`

Missing resources: none.

## Decisions

- D1. Every page states current behavior only. Each fact is checked against `src/` and `skills/` before it is written. Where an old guide page disagrees, the code wins and the old claim is dropped. Pages carry no dates, no "was removed" notes and no retired command or setting names.
- D2. The start pages are an ordered explanation, not a tutorial. Each ends with a "Next" link to the following page. The order is `what-it-is.md`, `why-it-works.md`, `install.md`, `set-up-a-project.md`, `one-change.md`. `one-change.md` ends by pointing to `docs/use/a-working-day.md`. No page asks the reader to try, practice or finish anything.
- D3. The "what you need" box appears in `README.md` and at the top of `docs/start/install.md`. Contents: Linux desktop with a running systemd user manager, Bun, Git, flock, Herdr, one agent CLI (Claude Code, Codex or pi), and an authenticated `gh` for GitHub work. flock is included because `src/config.ts`, `src/state.ts` and the repo `checks` use it, which corrects the design's short list by the code-wins rule (D1). Placeholders only, never real keys.
- D4. The readiness check is a short block of existing commands with the expected result of each: `systemctl --user is-system-running` (prints `running` or `degraded`), `bun --version`, `git --version`, `flock --version`, `herdr --version`, the agent CLI's `--version`, `gh auth status` (GitHub work only), and, on a machine that already has Akrogon, `akrogon config`. If all pass, the reader skips to `set-up-a-project.md`. The implementer confirms each command's real output on this machine before writing it.
- D5. `install.md` gives the exact install from a checkout (`bun install`, `bun src/akrogon.ts install`), PATH for `~/.local/bin`, and a minimal `~/.akrogon/config.yaml` with placeholder values matching `src/config.ts`. Release, deploy and rollback details are linked to `docs/reference/releases-and-updates.md` and `docs/use/roll-back-a-release.md`, not restated.
- D6. `set-up-a-project.md` covers `/init-akrogon` → `akrogon init --from <proposal>` → `akrogon config`, the repo config fields a beginner touches (`checks`, `grounding.index`, `default_branch`, `remote`, seat overrides) with a link to `docs/reference/config.md` for the rest, and grounding with the grounding picture.
- D7. `one-change.md` tells the P2 two-step sign-in leaf as "a translation web app": the note, charting, handoff, `akrogon next`, plan, build, review, landing, merged. It uses today's command names and quotes recorded output only where it matches today's tool. Otherwise it uses prose. It names no project, client, person, home path, machine, project path, session id, SHA or date.
- D8. `README.md` is one screen: what Akrogon is, who it is for, the what-you-need box, `factory-overview.svg`, one "Start here" link to `docs/README.md` and a few daily-job links into `docs/use/`. It has no command table, install steps, rollback or counts. The text "akrogon log" leaves README with the wording check (criterion 6).
- D9. `docs/README.md` lists start/ in reading order, then use/, reference/ (including `words.md` and `where-things-go.md`) and examples/, one line each.
- D10. `docs/reference-index.md` keeps its code-area lines. The `[Documentation](guide/)` line becomes a link to `README.md` (the docs home) and `reference/where-things-go.md`.
- D11. `where-things-go.md` states each folder's purpose (start, use, reference, examples, pictures, reference-index), the one-home rule (each fact has one owning page and others link it), the link rule (link real pages, pictures, skills and source files only, never placeholders) and that a code change updates the page that owns its fact. It does not copy the page-map table.
- D12. `words.md` has one line per term. Each term links to the page that explains it: leaf, chart, door, seat A/B, consultant, phase, worktree, grounding, contract, landing, direct route, autopilot, park/pause/stop, lesson, and so on, taken from `guide/parts.md` "The words" and checked against code.
- D13. The `docs/guide/` deletion is the last step of U3, after `git grep "docs/guide"` outside `issues/`, `learnings/` and `docs/guide/` itself is empty. The final grep output goes into the report.
- D14. The tests stay as they are, except for one deletion. In `tests/log-reader.test.ts`, the "docs and skills name akrogon log" test is removed whole. Reason: it is a wording-only check on README, which the short front door no longer holds. Its skill assertions are wording checks too, and the design's fact-ownership Q2 deletes wording-only checks. The four runtime tests in that file stay unchanged.

Note for review (brief or skill versus design): plan-issue asks for a new test for any criterion no existing test proves. The design rules out "new tests beyond the test rows named here", and the design wins. Criteria 1–4 and 7 are content criteria, proven by B's page review plus `tests/docs-links.test.ts` and the mechanical greps below. No new test file is added, so there is no test-first commit and no intended red to record.

## Units and waves

| Unit | Owns | Shared test resource | Needs first |
|---|---|---|---|
| U1 start pages | `docs/start/what-it-is.md`, `why-it-works.md`, `install.md`, `set-up-a-project.md`, `one-change.md` | none | none |
| U2 test removal | `tests/log-reader.test.ts` | none | none |
| U3 front door, home, reference, guide removal | `README.md`, `docs/README.md`, `docs/reference-index.md`, `docs/reference/words.md`, `docs/reference/where-things-go.md`, deletion of `docs/guide/*.md` | none | U1 (its links point at the start pages) and U2 (README loses "akrogon log", which breaks the old wording test) |

- Wave 1: U1, U2.
- Wave 2: U3.

U1 pages link only existing pages under `docs/use`, `docs/reference`, `docs/examples`, `docs/pictures`, skills and sources, and each other. They do not link `words.md` or `where-things-go.md`, so U1 is complete on its own. Pictures per page follow the page map: what-it-is → factory-overview, why-it-works → two-seats, install → machine-parts, set-up-a-project → project-folders and grounding, one-change → change-flow. Each picture has alt text describing what it shows.

## Checklist by criterion

1. README front door (U3): the box, the picture, the docs-home link. No command table, install steps, rollback or counts.
2. start/ order and content (U1): five pages in the D2 order with readiness check (D4), Next links, pictures with alt text, no exercises.
3. one-change privacy (U1): D7, plus the scrub grep below. B reviews it against provenance.
4. Index and reference (U3): D10, D11, D12.
5. Guide removed (U3): D13.
6. Wording check removed (U2): D14.
7. Accuracy (U1, U3): D1. B checks each page against its listed sources.

Docs affected: `README.md`, `docs/README.md`, `docs/reference-index.md`, `docs/start/*` (5 new), `docs/reference/words.md`, `docs/reference/where-things-go.md`, all 17 `docs/guide/*.md` (deleted). Agent docs: `docs/reference-index.md` only. `src/AREA.md` and `skills/AREA.md` hold no `docs/guide` reference, so no other agent doc changes.

## Verification

Each command runs from the worktree through `akrogon run-check --name <label> -- <cmd>`.

| Crit | Boundary and observation | Before → after | Failure it catches | Command | Size | Rerun when |
|---|---|---|---|---|---|---|
| 1, 2, 4 | Every README and docs link and image resolves | green now (`docs-links-before`: 0) → green with new pages | dead links, missing pictures, links to deleted guide pages | `bun test --timeout=30000 tests/docs-links.test.ts` | seconds | any README, docs or picture edit |
| 1, 2, 3, 4, 7 | B reads each owned page against its sources and the provenance file | n/a → verdict in review | stale facts, tutorial steps, missing alt text, private details | B review (check-issue) | minutes | any owned page edit |
| 5 | No `docs/guide` reference outside issues/ and learnings/, and the folder is gone | red now (`c5-guide-refs-before`: exit 1, README:39–55, 59, 84) → exit 0 | leftover references or guide pages | `sh -c '! git grep -n "docs/guide" -- . ":!issues" ":!learnings" && test ! -e docs/guide'` | seconds | any README, docs, src, skills or tests edit |
| 6 | Only the wording test is gone and the runtime tests pass | 5 pass (`log-reader-before`: 0) → 4 pass, diff shows only the one removed test block | removed runtime coverage, or a kept wording check | `bun test --timeout=30000 tests/log-reader.test.ts` plus `git --no-pager diff origin/main...HEAD -- tests/log-reader.test.ts` | seconds | edit to that file |
| 7 | No dates on owned pages | n/a → no match | dates in prose | `sh -c '! grep -nE "\b(19\|20)[0-9]{2}\b" README.md docs/README.md docs/start/*.md docs/reference/words.md docs/reference/where-things-go.md'` | seconds | owned page edit |
| 3 | No private identifiers in one-change.md | n/a → no match | private names or paths leaking | `grep -nEi -f <scratch patterns file> docs/start/one-change.md` must find nothing. The patterns file sits in the seat scratchpad, built from provenance: org and repo names, registered keys, root paths, `/home/`, `~/Work`, a UUID regex and a date regex. It is never committed. | seconds | one-change.md edit |
| all | Repo checks | → green | format, type or test regressions | configured `checks` (format, test, typecheck) | minutes | any commit |

Equivalence guard for D14: before the deletion, `tests/log-reader.test.ts` passes with README still holding "akrogon log". After U3 drops the phrase from README, the unremoved test would fail. Deleting it in U2 is what keeps the run green, and the runtime tests' expectations are unchanged.

No model or outside stage, no credentials (`env: []`, no `Missing:` lines), and no slow runs.

## Baseline runs

- `check c5-guide-refs-before: 1 .../implementation/check-c5-guide-refs-before-1792769598903-170796.log` (red as expected: README guide links)
- `check docs-links-before: 0 .../implementation/check-docs-links-before-1792769599002-170884.log`
- `check log-reader-before: 0 .../implementation/check-log-reader-before-1792769601493-171302.log` (after `bun install --frozen-lockfile`. The first try failed on missing `zod` in a fresh worktree.)
