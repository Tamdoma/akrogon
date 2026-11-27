# Brief 3: Reference shelf updates and roll-back-a-release move

## 1. Goal

Update `docs/reference/*.md` to the approved taxonomy, move `docs/use/roll-back-a-release.md` to `docs/reference/roll-back-a-release.md`, rewrite `docs/reference/words.md` and `docs/reference/where-things-go.md`, fold hand-written-issues and record-saving facts into `docs/reference/files.md`, and fix every inbound link to retired `docs/start/`, `docs/use/`, and `docs/examples/` inside `docs/reference/`, implementing plan decisions **D6** and **D8**.

## 2. Numbered acceptance criteria

1. `docs/reference/roll-back-a-release.md` exists (copied from `docs/use/roll-back-a-release.md` without deleting `docs/use/` here; Unit 4 deletes `docs/use/` in Wave 2):
   - Preserves verbatim `mv -T .next-current current`, `release-hold.yaml`, and `writeDeploySuccess` (required by `tests/rollback.test.ts`).
   - Updates `../reference/releases-and-updates.md#rollback` to `releases-and-updates.md#rollback` and replaces `Next: [Learn from work](learn-from-work.md)` with a valid link (e.g. `Back to [Releases and updates](releases-and-updates.md) · [Docs home](../README.md)`).
2. `docs/reference/words.md` is rewritten:
   - Opens with a `## Guide words to shelf words` table explicitly mapping guide terms to shelf terms (`task` -> `leaf`, `slot A (the builder)` -> `seat A`, `slot B (the reviewer)` -> `seat B`, `charting agent` -> `chart door`, `Direct` -> `direct route`, `Lifecycle` -> `lifecycle route`, `Charting mode` -> `No autopilot` / `Semi-autopilot` / `Full autopilot` (`## Mode record`), `Build route` -> `Route: direct|lifecycle`, `watcher` -> `watch-issues` / timer terminal).
   - Lists alphabetical one-line definitions for the approved words (including `Build route`, `Chart`, `Charting mode`, `Check`, `Consultant`, `Contract`, `Direct`, `Epic`, `Failed`, `Fork`, `Grounding`, `Harness`, `Issue`, `Landing`, `Leaf`, `Lesson`, `Lifecycle`, `Merged`, `Park`, `Pause`, `Phase`, `Release`, `Seed`, `Signposts`, `Slot A and slot B`, `Stop`, `Sync`, `Verify`, `Worktree`, `Worktree store`), linking ONLY to valid `../guide/01`..`12` or `*.md` shelf pages (zero links to `../start/`, `../use/`, `../examples/`).
3. `docs/reference/where-things-go.md` is updated:
   - `## Folders` describes `docs/guide/`, `docs/reference/`, `docs/pictures/`, and `docs/reference-index.md`, with ZERO mentions of `docs/start/`, `docs/use/`, or `docs/examples/`.
   - `## Pictures` (lines 26-36) is **byte-for-byte unchanged** from `AKROGON_BASE`.
4. `docs/reference/files.md` is updated:
   - Adds `## Writing issues by hand` (`#writing-issues-by-hand`, carrying the folder tree `issues/open/<issue>/<slug>/` and `<epic>/<issue>/<slug>/`, starter files, `blocked-by` slug rules and no cycle check from `docs/use/write-issues-by-hand.md`).
   - Adds `## Saving records with akrogon sync` (`#saving-records-with-akrogon-sync`, carrying leaf-branch-code-only vs `issues/` records, `akrogon sync` steps, eligible vs skipped files, and sync refusals from `docs/use/save-records.md`).
   - Keeps `(script)` and keeps the `| \`verify-runs.jsonl\` |` row naming `` `timeouts` ``, `` `durations` ``, and `` `attempt` `` (required by `tests/docs-links.test.ts`).
5. `docs/reference/skills.md`, `limits.md`, `config.md`, `checks.md`, `commands.md`, `releases-and-updates.md`, `state-and-phases.md`:
   - `skills.md`: updates `../use/watch-while-away.md#stop-the-watch` to `../guide/11-while-you-are-away.md#stop-the-watch`; keeps approved words (`Charting mode`, `Build route`, `Direct`, `Lifecycle`, `slot A`/`slot B` where appropriate alongside shelf words) and keeps zero `cron`/`expir` wording (required by `tests/watch-timer.test.ts`).
   - `limits.md`: updates both `../use/autopilot.md` links to `../guide/06-charting-mode.md`; approved words only.
   - `config.md`: corrects the stale `prefixes` description ("No command reads it yet.") to match `src/config.ts` `repoPrefix` / `src/seat.ts` / `src/next.ts` / `watch-issues` (required when starting seats, consultants, or the watch timer, unique two lowercase letters per repo); keeps every other schema fact accurate.
   - `checks.md`, `commands.md`, `releases-and-updates.md`, `state-and-phases.md`: audit for approved words and valid links; keep `(script)` in `checks.md` and keep `commands.md`'s command table 100% compliant with `tests/command-reference.test.ts`.
   - Keep existing shelf SVG embeds (`../pictures/*.svg`) intact (deleted/replaced later by `away-pictures`).
6. Zero em dashes, zero retired phrases (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`), zero links to `../start/`, `../use/`, or `../examples/` anywhere in `docs/reference/*.md`, zero `/run permit/i`, zero `hold-fix`/`unhold`/`--red-on-base`/`held.yaml`.
7. Planned tests pass on this unit: `tests/rollback.test.ts` (rollback doc step), `tests/command-reference.test.ts`, and `tests/docs-links.test.ts` (`where-things-go`, `files.md documents`, `seat texts`).

## 3. Read-first list

- Reference shelf: all 10 existing files in `docs/reference/*.md`
- Retired pages for migration: `docs/use/roll-back-a-release.md`, `docs/use/write-issues-by-hand.md`, `docs/use/save-records.md`
- Live code truth: `src/config.ts` (`repoPrefix`), `src/sync.ts`, `src/rollback.ts`
- Guard/test contracts: `tests/rollback.test.ts` (lines 135-146), `tests/command-reference.test.ts`, `tests/docs-links.test.ts` (lines 260-305 and 492-498), `tests/watch-timer.test.ts` (lines 1367-1389)
- Hygiene guide: `/home/ivan/.gemini/config/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- **Prerequisites**: none (Wave 1).
- **Shared test resource / consumed output**: none.
- **Worker worktree creation commit**: `775b8b436641885f70340f1c40bbd89dac1cb46c`
- **Owned paths (edit ONLY these)**:
  - `docs/reference/roll-back-a-release.md` (create)
  - `docs/reference/words.md`
  - `docs/reference/where-things-go.md`
  - `docs/reference/files.md`
  - `docs/reference/skills.md`
  - `docs/reference/limits.md`
  - `docs/reference/config.md`
  - `docs/reference/checks.md` (if any word/link edit needed)
  - `docs/reference/commands.md` (if any word/link edit needed)
  - `docs/reference/releases-and-updates.md` (if any word/link edit needed)
  - `docs/reference/state-and-phases.md` (if any word/link edit needed)
- **Locked guide targets & anchors from Units 1 & 2 (safe to link from `words.md`, `skills.md`, `limits.md`)**:
  - `../guide/01-install.md`
  - `../guide/02-set-up-a-repo.md#grounding`
  - `../guide/03-your-three-tabs.md`
  - `../guide/04-a-charting-session.md` (`#opening-a-session`, `#what-consultants-do-during-charting`, `#4-one-fork-per-round`)
  - `../guide/05-signposts.md`
  - `../guide/06-charting-mode.md`
  - `../guide/07-build-route.md` (`#direct`, `#lifecycle`)
  - `../guide/08-hand-off.md`
  - `../guide/09-lifecycle.md` (`#slot-a-the-builder`, `#slot-b-the-reviewer`)
  - `../guide/10-merging.md`
  - `../guide/11-while-you-are-away.md#stop-the-watch`
  - `../guide/12-when-work-stops.md` (`#failed-work`, `#park-an-issue`, `#pause-a-repository`, `#stop-a-leaf-or-a-check-run`)
- **Required headings this unit exports for Unit 4 (`docs/README.md`)**:
  - `docs/reference/files.md`: `## Writing issues by hand` (`#writing-issues-by-hand`), `## Saving records with akrogon sync` (`#saving-records-with-akrogon-sync`)
  - `docs/reference/roll-back-a-release.md`

## 5. Do-not, reasons and exceptions

- Do NOT delete `docs/use/roll-back-a-release.md` or anything under `docs/start/`, `docs/use/`, `docs/examples/` (owned by Unit 4 in Wave 2), and do NOT touch `docs/reference-index.md` or any file in `tests/`. Reason: Wave 1 disjointness and frozen tests. Exception: revised brief from A.
- Do NOT modify a single character of `## Pictures` (lines 26-36) in `docs/reference/where-things-go.md`. Reason: brief criterion 5 and avoids conflict with `charting-pictures-more`. Exception: none.
- Do NOT introduce em dashes, retired phrases (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`), `cron`/`expir` in `skills.md`, `run permit`, or retired hold verbs. Reason: brief criteria 6, 7, 8. Exception: none.
- Do NOT edit `issues/` files inside the worktree. Reason: `akrogon phase` rejects leaf commits touching `issues/`. Exception: none.
- **Standing git stash exclusion**: Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree instead. To set work aside, commit a WIP commit and before returning run `git reset --soft 775b8b436641885f70340f1c40bbd89dac1cb46c` and make the unit's single returned commit. Exception: none.
- **Standing unattended commands exclusion**: Write no command that waits on a human (no prompt, confirmation, editor, pager); write no poll or sleep loop; run slow commands once in the foreground waiting on exit; re-express harness denials inside the same grant/identity or return a mismatch verbatim if no formulation answers; name no env file path on a command line. Reason: no human answers a seat's command, and a worker reads only its brief. Exception: none.
- **No pattern kills**: Never run `pkill -f`, `killall`, or `pgrep | xargs kill`; stop a run only with `akrogon stop-run <run-id>`. Reason: pattern kills cross leaves. Exception: none.

Reasons and exceptions restated: scope/test/Pictures exclusions protect parallel waves, frozen tests, and downstream picture leaves (exception only via revised brief from A); stash, unattended-command, and pattern-kill rules protect sibling workers and unattended execution with no exceptions.

## 6. Ordered steps

1. Read the read-first files inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u3` (advisory size: 7–11 files, ~30 turns).
2. Create `docs/reference/roll-back-a-release.md` from `docs/use/roll-back-a-release.md` (criterion 1).
3. Rewrite `docs/reference/words.md` (criterion 2) and update `docs/reference/where-things-go.md` keeping `## Pictures` byte-for-byte unchanged (criterion 3).
4. Update `docs/reference/files.md` (criterion 4), `skills.md`, `limits.md`, `config.md`, and audit `checks.md`, `commands.md`, `releases-and-updates.md`, `state-and-phases.md` (criterion 5).
5. Verify zero em dashes, zero retired phrases, zero links to `../start/`, `../use/`, `../examples/` inside `docs/reference/`, and run Section 7 commands through `akrogon run-check`.
6. Stage ONLY your changed files under `docs/reference/` and make one commit on detached HEAD; verify `git status --porcelain` is empty.

## 7. Commands

Run inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u3`:
```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'
akrogon run-check --name u3-rollback-doc -- bun test tests/rollback.test.ts -t "the roll-back page manual steps"
akrogon run-check --name u3-command-ref -- bun test tests/command-reference.test.ts
akrogon run-check --name u3-ref-checks -- bun test tests/docs-links.test.ts -t "where-things-go|files.md documents|seat texts"
akrogon run-check --name u3-em-dash -- bun test tests/docs-em-dash.test.ts -t "hold no em dashes"
```
(Do NOT run `akrogon verify` or full `docs-links.test.ts`, which expects Units 1, 2, and 4 to have landed.)

## 8. Done-when, evidence and report

Done when all changed `docs/reference/*.md` files are committed cleanly in one commit, all four targeted `run-check` commands exit 0 (cite their `check <label>: <exit> <path>` lines), `git diff 775b8b436641885f70340f1c40bbd89dac1cb46c -- docs/reference/where-things-go.md` shows `## Pictures` untouched, and your return includes:
1. The returned commit SHA.
2. Any new/changed fact lines with supporting `src/` or `skills/` paths.
3. The four fill-in lines below:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
