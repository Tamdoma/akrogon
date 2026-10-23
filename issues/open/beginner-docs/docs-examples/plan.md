# Plan: docs-examples

Direct synthesis (`debate: no`) from brief.md and design.md. No brief/design conflict found.

This file sits under `issues/`, which is pushed to public main. It names private projects only as P1 and points to the gitignored provenance file. Implementers keep the same rule in every report and commit message.

## Read first

- `docs/reference-index.md` (grounding index; still links the old `guide/`, docs-start owns that change)
- `learnings/LESSONS.md` lines 10, 14, 18: grep for stale terms and report out-of-scope hits
- `issues/chart/beginner-docs/PAGE-MAP.md` under the registered root (other leaves' pages; read only)
- `issues/chart/beginner-docs/scratch/provenance.md` under the registered root (private source map; never copied)
- Link targets: `docs/use/quick-fix.md`, `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/use/run-work.md`, `docs/use/merge-and-announce.md`, `docs/use/when-work-fails.md`, `docs/reference/commands.md`, `docs/reference/state-and-phases.md`, `docs/reference/files.md`, `docs/pictures/ways-to-run.svg`, `docs/pictures/failure-recovery.svg`
- Skills each story links for agent procedure: `skills/chart-issues/`, `skills/implement-issue/`, `skills/check-issue/`, `skills/merge-issue/`
- Old `docs/guide/in-practice.md`: authoring source only, never linked

## Decisions

- D1. Four pages, no others: `docs/examples/README.md`, `quick-fix-story.md`, `autopilot-story.md`, `recovery-story.md`. No watch story. No test changes (design: "No test changes").
- D2. Sources, from provenance.md. Quick fix = P1 `script-lane-effort` chart, `direct/` record. Autopilot = P1 `website-speed` chart plus its child leaves under P1 `issues/closed/`. Recovery = varhop `issues/chart/overlay-rework` (CHART.md, forks/disposal.md, archive/overlay-plugin) and `issues/closed/overlay-rework/`.
- D3. Landing re-check, done by the implementer before writing each story. Synthesis pre-check passed: the P1 direct commit named in provenance is an ancestor of P1 `origin/main`, and varhop `0be8ca4` is an ancestor of varhop `origin/main`. The implementer repeats the check for all three and, for the autopilot story, confirms each named child leaf is `phase: merged` and its merge commit is on P1 main.
- D4. varhop conflict resolved: both records are true. The first `overlay-plugin` leaf failed. Its folder was moved to `issues/chart/overlay-rework/archive/overlay-plugin/` (state `phase: failed`). The disposal fork retired it and kept its code. A successor leaf reused the slug `overlay-plugin`, adopted the same branch and worktree, and merged, followed by the `overlay-rework` leaf that closed varhop#1. The story tells it in that order: failed, retired and archived, code carried forward under the same name, landed.
- D5. Privacy. Pages name only varhop, link https://github.com/Tamdoma/varhop/issues/1 and public varhop commits. P1 is described by what it is ("a web framework project", "a company website project"). No repo names, client names, people's names, home paths, session ids, secrets, private SHAs or dates. Calendar words like "that week" are fine. Leaf slugs from P1 appear only when they reveal nothing private. The website-speed intake names a client repo: never quote the intake.
- D6. Telling. Past-tense narration of what the operator and seats did, in plain short sentences. Every step names today's command or skill and links its current `use/` page and `reference/` page. Recorded output is quoted only if the same command prints that shape today (check against `src/`). Otherwise prose. No "you should", no numbered task steps for the reader. Each page ends with a next step (a link).
- D7. Facts come from current `src/` and `skills/`. Where a record shows an old command, setting or file name that no longer exists, the story uses today's name or leaves it out. No "was removed" notes.
- D8. Pictures: quick-fix-story links `../pictures/ways-to-run.svg`, recovery-story links `../pictures/failure-recovery.svg`. Each with alt text describing what the picture shows.
- D9. Link rule: links go only to merged blocker pages (`docs/use/`, `docs/reference/`, `docs/pictures/`), skills and source files. Never `docs/guide/`. No link to `docs/start/` or a docs home (docs-start lands later and adds inbound links).

## Interfaces

None. Plain Markdown pages. `tests/docs-links.test.ts` already scans every `docs/**/*.md` file, and `tests/hold-retired.test.ts` and `tests/run-permit.test.ts` already scan `docs/` for retired terms, so new pages are covered with no test edit.

## Waves

Wave 1 (parallel, disjoint paths, no shared test resource):

- [ ] U1 quick-fix story. Owns `docs/examples/quick-fix-story.md`. Prereqs: none. Criteria 1, 2, 3.
- [ ] U2 autopilot story. Owns `docs/examples/autopilot-story.md`. Prereqs: none. Criteria 1, 2, 3.
- [ ] U3 recovery story. Owns `docs/examples/recovery-story.md`. Prereqs: none. Criteria 1 (incl. D4), 2, 3.

Wave 2:

- [ ] U4 examples index. Owns `docs/examples/README.md`: one short paragraph per story saying what way of working it shows, with a link. Prereqs: U1, U2, U3 (its links must resolve).

Docs affected: the four new pages only. `docs/reference-index.md` and the docs home are not touched here (docs-start owns inbound links). No agent doc (AREA, skill) is affected.

## Criteria and proof

| # | Result | Boundary and observation | Command | Size | Rerun when |
|---|---|---|---|---|---|
| 1 | Each story matches its landed record. varhop told per D4. | Source repo `origin/main` before writing. Catches a story about work that never landed. | `git -C <P-root> fetch origin && git -C <P-root> merge-base --is-ancestor <commit> origin/main` for each story's commit (P roots and commits from provenance.md, run in a shell, result recorded as landed/not landed with no identifiers). For autopilot, `grep '^phase' <P1-root>/issues/closed/<leaf>/state.yaml` per named leaf. Seat B compares each story's claims to the records. | seconds | a story's facts change |
| 2 | No private name, client, person, home path, private repo, session id, secret or date. varhop named and linked. | The four committed pages. Catches a leak into public main. | `akrogon run-check --name examples-scrub -- sh -c '! grep -rnE "/home/|~/|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}|\b(19|20)[0-9]{2}\b" docs/examples'` (generic patterns; exit 0 = clean). Pattern checked at synthesis on a scratch file: clean text gave no match, a line with a home path and a year matched. Private names: build a word list in the scratchpad from provenance.md and the P1 records (repo names, client names, people), run `grep -rniF -f <list> docs/examples`, record only "no match" in the report, then delete the list. Seat B reviews text, links, alt text and images of each page. | seconds | any page edit |
| 3 | Plain telling with today's commands, links to current use/ and reference/ pages, not instructions. | The pages and current `src/`, `skills/`. Catches stale commands, dead links and tutorial wording. | `akrogon run-check --name test -- bun test tests/docs-links.test.ts tests/hold-retired.test.ts tests/run-permit.test.ts` (links resolve, no retired terms). Every command named in a story is checked against `src/akrogon.ts` and `docs/reference/commands.md`. Seat B reviews tone and step-to-link coverage. | seconds | any page edit |

The repo `checks` (format, test, typecheck) run as usual. Nothing here touches code, so format and typecheck are unaffected.

## Tests

No new tests. Criteria 1 and 2 are judgments on content against records and a private list that cannot enter the repo. Criterion 3's mechanical part is covered by existing scans of `docs/**`. The design forbids test changes for this leaf. So no red runs are recorded at synthesis and no test commit precedes the pages.

Base run of the criterion 3 command at `7fb2ad95`, after the repo `setup` (`bun install --frozen-lockfile`, needed in a fresh worktree): `check test: 0 implementation/check-test-1792768809548-3856945.log`, 23 tests, 0 fail. A first run before setup failed on a missing `zod` package (`check test: 1 implementation/check-test-1792768800929-3856593.log`), cause outside the leaf.

## Limits

- The private-name scan depends on the list the implementer builds. Seat B's per-page review is the backstop.
- Recorded output from P1 and varhop often predates today's command output. Expect most stories to be prose with few quotes.
