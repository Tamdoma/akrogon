# Brief 4: Front doors (README.md, docs/README.md) and retired-folder removal

## 1. Goal

Rewrite `README.md` as a short front door (no picture embed), rewrite `docs/README.md` as the chapter index, "Other tools" table, and reference shelf, and delete the retired folders `docs/start/`, `docs/use/`, and `docs/examples/`, implementing plan decisions **D6** and **D8**.

## 2. Numbered acceptance criteria

1. `README.md` is a short front door matching the tone of `docs/guide/04` to `08`:
   - States plainly what Akrogon is (a lightweight software factory for people who already use coding agents: install once per machine to serve all registered repos, chart work into written contracts, fresh slot A builds in an isolated worktree, fresh slot B reviews/repairs, the command merges onto the default branch).
   - States who it fits (technical operators, agencies, and teams already using coding agents who want a repeatable path from request to merged code without babysitting every turn; what it does not do: decide product strategy or deploy your app).
   - Uses **at most two sentences of soft selling**, zero marketing jargon, zero unexplained developer jargon.
   - Lists the full 12-page guide in reading order (`docs/guide/01-install.md` through `docs/guide/12-when-work-stops.md`) grouped cleanly by chapter, plus a link to [Docs home](docs/README.md).
   - Carries **NO picture embed** (neither `![...](...)` nor `<img ...>` in prose; `setup-pictures` adds the hero later).
2. `docs/README.md` contains:
   - `## Guide` (`#guide`): all 12 guide chapters (`guide/01-install.md` through `guide/12-when-work-stops.md`) in reading order, grouped into the 5 chapters (1 Set up, 2 Charting, 3 Lifecycle, 4 Merging, 5 While you are away and when work stops).
   - `## Other tools` (`#other-tools`): a short table of minor/occasional tools linking directly to the reference shelf:
     - Write issues by hand -> `reference/files.md#writing-issues-by-hand` (and `reference/state-and-phases.md#fields-a-person-sets`)
     - Save issue records (`akrogon sync`) -> `reference/files.md#saving-records-with-akrogon-sync`
     - Report an observation (`/seed-issue`, `akrogon pull`) -> `reference/skills.md#seed-issue` and `reference/commands.md#run-work`
     - Learn from work (`/learn-issues`) -> `reference/skills.md#learn-issues`
     - Roll back a release (`akrogon rollback`) -> `reference/roll-back-a-release.md`
     - Pack logs, timing, flaky tests, leftovers (`akrogon pack`, `timing`, `flaky`, `leftovers`) -> `reference/commands.md` and `reference/files.md`
   - `## Reference` (`#reference`): all 11 shelf pages (`words.md`, `commands.md`, `config.md`, `state-and-phases.md`, `checks.md`, `files.md`, `skills.md`, `releases-and-updates.md`, `roll-back-a-release.md`, `limits.md`, `where-things-go.md`).
   - Footer link to the agent code map: `[reference index](reference-index.md)`.
3. `docs/start/`, `docs/use/`, and `docs/examples/` (all 23 files) are completely removed (`git rm -r docs/start docs/use docs/examples`).
4. Zero em dashes (`—`, `&mdash;`, `&#8212;`, `&#x2014;`), zero retired phrases (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`), zero partial consultant examples, zero broken links or anchors anywhere in `README.md`, `docs/`, or tracked `skills/`.
5. All targeted tests in Section 7 pass green (zero failures across `docs-em-dash.test.ts`, `docs-links.test.ts`, `run-permit.test.ts` doc sweep, and `hold-retired.test.ts` doc sweep).

## 3. Read-first list

- Current front doors: `README.md`, `docs/README.md`
- Landed Wave 1 guide pages (titles and anchors): `docs/guide/01-install.md` through `docs/guide/12-when-work-stops.md`
- Landed Wave 1 shelf pages: `docs/reference/files.md`, `docs/reference/roll-back-a-release.md`, `docs/reference/words.md`, `docs/reference/skills.md`, `docs/reference/commands.md`
- Test contracts: `tests/docs-links.test.ts`, `tests/docs-em-dash.test.ts`
- Hygiene guide: `/home/ivan/.gemini/config/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- **Prerequisites**: Wave 1 Units 1, 2, 3 (all landed at `d6a59e1e425d83c9eeb8fefd0870dd6480dea7a2`).
- **Shared test resource / consumed output**: none.
- **Worker worktree creation commit**: `d6a59e1e425d83c9eeb8fefd0870dd6480dea7a2`
- **Owned paths (edit/delete ONLY these)**:
  - `README.md` (rewrite)
  - `docs/README.md` (rewrite)
  - `docs/start/` (delete all 5 files)
  - `docs/use/` (delete all 14 files)
  - `docs/examples/` (delete all 4 files)
- **Anchors required by Wave 1 pages**:
  - `docs/guide/12-when-work-stops.md` links `../README.md#other-tools` and `../README.md#reference`, so `docs/README.md` MUST keep the exact headings `## Other tools` and `## Reference` (and `## Guide`).
- **Move map reminder**: before deleting `docs/start/`, `docs/use/`, and `docs/examples/`, confirm every one of the 23 files is accounted for in your return's move map (or report if any Wave 1 link breaks in `docs-links.test.ts` as a mismatch!).

## 5. Do-not, reasons and exceptions

- Do NOT edit any file outside your owned paths (do NOT edit `tests/*`, `docs/guide/*`, `docs/reference/*`, `docs/pictures/*`, or `docs/reference-index.md`); if `tests/docs-links.test.ts` reveals a broken link inside a Wave 1 file (`docs/guide/*` or `docs/reference/*`), return a mismatch naming the exact file and broken link so A fixes it cleanly. Exception: revised brief from A.
- Do NOT put any picture/image embed in `README.md` (`![...](...)` or `<img ...>`), and do NOT delete any SVG in `docs/pictures/`. Reason: brief What/C3 and design D8/R6 (`setup-pictures` and `away-pictures` own pictures). Exception: none.
- Do NOT use em dashes, retired phrases (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`), `run permit`, or retired hold verbs. Reason: brief criteria 6, 7, 8. Exception: none.
- Do NOT edit `issues/` files inside the worktree. Reason: `akrogon phase` rejects leaf commits touching `issues/`. Exception: none.
- **Standing git stash exclusion**: Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree instead. To set work aside, commit a WIP commit and before returning run `git reset --soft d6a59e1e425d83c9eeb8fefd0870dd6480dea7a2` and make the unit's single returned commit. Exception: none.
- **Standing unattended commands exclusion**: Write no command that waits on a human (no prompt, confirmation, editor, pager); write no poll or sleep loop; run slow commands once in the foreground waiting on exit; re-express harness denials inside the same grant/identity or return a mismatch verbatim if no formulation answers; name no env file path on a command line. Reason: no human answers a seat's command, and a worker reads only its brief. Exception: none.
- **No pattern kills**: Never run `pkill -f`, `killall`, or `pgrep | xargs kill`; stop a run only with `akrogon stop-run <run-id>`. Reason: pattern kills cross leaves. Exception: none.

Reasons and exceptions restated: scope/test/picture exclusions protect Wave 1 files, frozen tests, and downstream picture leaves (exception only via revised brief from A); stash, unattended-command, and pattern-kill rules protect sibling workers and unattended execution with no exceptions.

## 6. Ordered steps

1. Read the read-first files inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u4` (advisory size: 2 edited + 23 deleted files, ~12 turns).
2. Rewrite `README.md` (criterion 1).
3. Rewrite `docs/README.md` (criterion 2).
4. Delete `docs/start/`, `docs/use/`, and `docs/examples/` with `git rm -r docs/start docs/use docs/examples` (criterion 3).
5. Run Section 7 commands inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u4` through `akrogon run-check`.
6. Stage ONLY your owned changes and make one commit on detached HEAD; verify `git status --porcelain` is empty.

## 7. Commands

Run inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u4`:
```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'
akrogon run-check --name u4-em-dash -- bun test tests/docs-em-dash.test.ts
akrogon run-check --name u4-docs-links -- bun test tests/docs-links.test.ts
akrogon run-check --name u4-run-permit -- bun test tests/run-permit.test.ts -t "docs describe the start check"
akrogon run-check --name u4-hold-retired -- bun test tests/hold-retired.test.ts -t "sweep:"
```
(Do NOT run `akrogon verify`.)

## 8. Done-when, evidence and report

Done when `README.md`, `docs/README.md`, and the deletion of `docs/start/`, `docs/use/`, and `docs/examples/` are committed cleanly in one commit, all four `run-check` commands exit 0 (cite their `check <label>: <exit> <path>` lines), and your return includes:
1. The returned commit SHA.
2. The complete 23-row move map (every deleted file under `docs/start/`, `docs/use/`, `docs/examples/` -> destination page(s) holding its facts).
3. The four fill-in lines below:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
