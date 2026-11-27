# Brief 2: Lifecycle, merging, overnight watch, and stops (09-12)

## 1. Goal

Write the lifecycle, merging, overnight watcher, and stop/failure pages (`docs/guide/09-lifecycle.md`, `10-merging.md`, `11-while-you-are-away.md`, `12-when-work-stops.md`) carrying `client-portal`'s `csv-export` and `scheduled-email` running example from `08-hand-off.md`, implementing plan decisions **D1**, **D5**, and **D8**.

## 2. Numbered acceptance criteria

1. `docs/guide/09-lifecycle.md` exists in the tone and depth of `04` to `08` and covers:
   - Starting handed-off work from `t-client-portal` (`akrogon next`, `akrogon next csv-export`, `akrogon next weekly-client-report`, `akrogon next --all`).
   - Why a ready task may wait (`blocked-by` with `scheduled-email` waiting on `csv-export` printing `waiting: scheduled-email on csv-export (<phase>)`, missing `readiness.yaml` inputs like `POSTMARK_API_KEY` printing `Missing:` and refusing start, machine `max_active` default `3` and optional repo `max_active` in `issues/config.yaml`, paused repo, stopped or failed leaf).
   - Start order: merged leaves first, then leaves with more unmerged dependents (transitive count), up to `max_active`; capacity waiters refill longest-waiting first on automatic passes (`--wake`/`--resume`).
   - What starts agent sessions: `akrogon next` creates the sparse worktree at `~/.akrogon/worktrees/client-portal/<slug>` on branch `<slug>`, writes declared `.env` keys, runs `setup` if configured, opens the leaf tab in the `client-portal` herdr space, and starts slot A and slot B inside the leaf's systemd slice; after that `akrogon-listener.service` (`akrogon listen`) watches hc events and triggers `akrogon next --wake`/`--resume` automatically.
   - `## Slot A (the builder)`: plans in `plan.synthesis` (`plan-issue`, writes `plan.md` and red-first criterion tests, frozen on move to `implement`), builds in `implement` (`implement-issue`, inline, serial-solo, or waves of up to 3 workers), runs `akrogon verify`, writes `implementation/report.md`, moves to `check.review`.
   - `## Slot B (the reviewer)`: reviews slot A's finished work blind alongside slot A in `check.review` (verdicts `ready`, `nits`, or `fix`, written to `review-A.md` and `review-B.md`), then in `check.repair` repairs most Fixes itself or sends exceptions back to slot A in `check.fix` (after which only slot B reviews because `fix_rounds > 0`). Clearly answers cold-reader Q4.
   - Watching progress from `t-client-portal` (`akrogon status`, `akrogon status csv-export`, `akrogon log <path>`).
   - Ends with `Previous: [Hand-off](08-hand-off.md) · Next: [Merging](10-merging.md)`.
2. `docs/guide/10-merging.md` exists and follows `csv-export` and `scheduled-email` through landing:
   - One merge turn per registered repo (queue order: active batch holder first, then most unmerged dependents, then earliest `merge_stamp`; first return keeps its stamp, second mints a new one; `akrogon status` shows `holder`/place and `land`).
   - Command-owned landing with no seat: `akrogon next` fetches, rebases onto `<remote>/<default_branch>`, strips resurrected retired lessons, and starts `akrogon land <slug> --attempt <id>` in `akrogon-land-<id>` under `akrogon-land.slice`.
   - Checks on the merged result: `akrogon verify --attempt <id>` runs `checks` (excluding `merge_covers`), then `merge_checks` in parallel; land gates (`Test-Change:` trailers, clean worktree, no `issues/` files, no resurrected retired lessons, green merge receipt or main-red cover); fast-forward push (first non-fast-forward refusal restacks and retries once; second clears batch, prints `held <slug> attempt=<id>` and keeps queue place; other push errors move to `failed`).
   - Red going back to repair: red verify (uncovered), gate refusal, conflict, or dirty worktree moves the leaf to `check.repair` with `state.merge_exit` (`red`, `gate`, `conflict`, `dirty`), where slot B repairs, sends leaf-caused fixes to `check.fix`, returns an inconsistent/flaky red unchanged to `merge`, or stops on a main-caused red (`failed`). Clearly answers cold-reader Q5.
   - Issue/epic completion: merging `csv-export` wakes dependent `scheduled-email`; merging `scheduled-email` (last leaf of `weekly-client-report`) closes linked GitHub `sources`, deletes plain `*.log` files, moves `issues/open/weekly-client-report/` to `issues/closed/weekly-client-report/`, and prints `issue complete weekly-client-report` (or `epic complete <epic>`).
   - Announcements: when `broadcast.discord.webhook_env` is configured (reading URLs from `~/.config/akrogon/env`), `akrogon status` shows `broadcast pending` and `akrogon next` prompts slot B once with `broadcast-issue` to post one plain-language summary (`before`/`now`) per completed issue or epic; broadcast failure never undoes the merge.
   - Ends with `Previous: [Lifecycle](09-lifecycle.md) · Next: [While you are away](11-while-you-are-away.md)`.
3. `docs/guide/11-while-you-are-away.md` exists and follows leaving `client-portal` running overnight in `w-client-portal`:
   - Starts with `watch-issues <root>` (Claude alias `/watch-issues <root>`); works in all four harnesses: `claude`, `codex`, `pi`, and `agy`; runs a timer terminal `<prefix>-watch` (e.g. `cp-watch`) sending ticks every 20 minutes; busy coalescing and prompt-during-tick caveat (`claude`/`agy` vs `codex`).
   - Keeps the EXACT heading `## What each check does`, with **NO** `akrogon status` anywhere inside that section (verified by `tests/watch-timer.test.ts`!). Covers `observe.ts`, unblocked waiting leaves (`akrogon next`), up to two consecutive unproductive failed-leaf retries when seats are idle, busy-seat loop detection and one steer per seat per watch (`codex` notify-only), consult cases using machine `slots.consultant`, and herdr-app notice toasts.
   - Clearly states what keeps moving vs what still waits for you (keys, credentials, logins, grants/permissions, operator decisions/locks, host tooling installs/downgrades, force push/history rewrite, scope-changing fixes, stopping the watch) and what the watch never does. Clearly answers cold-reader Q6.
   - Keeps the EXACT heading `## Stop the watch` (linked by `docs/reference/skills.md`): `watch-issues stop <root>` (Claude alias `/watch-issues stop <root>`), auto-stop triggers, `/clear` vs `/new`, compaction summary keeping the watch running, shell-launched agent exit caveat.
   - Contains ZERO matches of `/cron/i`, `CronCreate|CronList|CronDelete`, or `/expir/i` anywhere in the file!
   - Ends with `Previous: [Merging](10-merging.md) · Next: [When work stops](12-when-work-stops.md)`.
4. `docs/guide/12-when-work-stops.md` exists and follows one failure on `client-portal`'s `scheduled-email` (alongside `csv-export`):
   - `## Failed work`: recorded stop keeping plan/reviews/code; inspect with `akrogon status scheduled-email` (reads `failure.reason` and any `Missing:` line), fix the cause (e.g. add `POSTMARK_API_KEY` to `client-portal/.env`, never the worktree), recover with `akrogon phase scheduled-email implement` (with NO `--slot`; never edit read-only `state.yaml` by hand; keeps `fix_rounds`), then `akrogon next scheduled-email`. Clearly answers cold-reader Q7.
   - `## Park an issue`: `akrogon park <issue>`, `akrogon park --all`, `akrogon unpark <issue>` / `--all` (refuses running leaf with tab/worktree or needed dependency).
   - `## Pause a repository`: `akrogon pause`, `akrogon unpause` (stops automatic passes only; typed `akrogon next` still runs; unpause runs one pass).
   - `## Stop a leaf or a check run`: `akrogon stop <slug>`, `akrogon stop --all`, `akrogon start <slug>`, `akrogon stop-run [<run-id>]`, `akrogon leftovers`.
   - `## Common command refusals`: phase-move refusals, failed dependency, sync refusal, non-fast-forward push.
   - Ends with a link to the lookup shelf for other tools (`[Other tools](../README.md#other-tools)` and `[Reference](../README.md#reference)` / `[Commands](../reference/commands.md)`) and footer `Previous: [While you are away](11-while-you-are-away.md) · Next: [Docs home](../README.md)`.
5. Zero em dashes, zero retired phrases, zero partial consultant examples, zero `/run permit/i`, zero `hold-fix`/`unhold`/`--red-on-base`/`held.yaml`, zero embeds of pictures not on `main`.
6. Planned tests pass on this unit: `tests/watch-timer.test.ts` doc checks and `tests/docs-em-dash.test.ts` em-dash check.

## 3. Read-first list

- Model tone & running example: `docs/guide/04-a-charting-session.md`, `docs/guide/08-hand-off.md`
- Retired source material (facts only; do not link): `docs/use/run-work.md`, `docs/use/merge-and-announce.md`, `docs/use/watch-while-away.md`, `docs/use/when-work-fails.md`, `docs/use/park-pause-stop.md`, `docs/start/why-it-works.md`
- Live code/skill truth: `src/next.ts`, `src/turn.ts`, `src/land.ts`, `src/phase.ts`, `src/park.ts`, `src/pause.ts`, `src/stop.ts`, `src/status.ts`, `src/listen.ts`, `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `skills/broadcast-issue/SKILL.md`
- Guard/test contracts: `tests/watch-timer.test.ts` (lines 1365-1410)
- Hygiene guide: `/home/ivan/.gemini/config/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- **Prerequisites**: none (Wave 1).
- **Shared test resource / consumed output**: none.
- **Worker worktree creation commit**: `775b8b436641885f70340f1c40bbd89dac1cb46c`
- **Owned paths (edit ONLY these)**:
  - `docs/guide/09-lifecycle.md` (create)
  - `docs/guide/10-merging.md` (create)
  - `docs/guide/11-while-you-are-away.md` (create)
  - `docs/guide/12-when-work-stops.md` (create)
- **Required headings for cross-unit links**:
  - `09-lifecycle.md`: `## Slot A (the builder)`, `## Slot B (the reviewer)`
  - `11-while-you-are-away.md`: `## What each check does`, `## Stop the watch`
  - `12-when-work-stops.md`: `## Failed work`, `## Park an issue`, `## Pause a repository`, `## Stop a leaf or a check run`
- **Shelf links that will exist once Wave 2 lands**: `../README.md#other-tools`, `../README.md#reference`, `../reference/commands.md`, `../reference/state-and-phases.md`, `../reference/checks.md`, `../reference/config.md`, `../reference/files.md`. Link ONLY to these real paths/anchors (never to `../start/`, `../use/`, `../examples/`).

## 5. Do-not, reasons and exceptions

- Do NOT write or edit any test file (`tests/*`) or any file outside your 4 owned paths; return a mismatch with evidence to A if a planned test contradicts the brief. Exception: a revised brief from A.
- Do NOT put `akrogon status` inside `## What each check does` in `11-while-you-are-away.md`, or use `cron`/`expir` anywhere in `11-while-you-are-away.md`, or use any em dash (`—`), retired phrase (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`), `run permit`, `hold-fix`, `unhold`, `--red-on-base`, `held.yaml`, or image embed. Reason: brief criteria 6, 7, 8 and design D8. Exception: none.
- Do NOT edit `issues/` files inside the worktree. Reason: `akrogon phase` rejects leaf commits touching `issues/`. Exception: none.
- **Standing git stash exclusion**: Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree instead. To set work aside, commit a WIP commit and before returning run `git reset --soft 775b8b436641885f70340f1c40bbd89dac1cb46c` and make the unit's single returned commit. Exception: none.
- **Standing unattended commands exclusion**: Write no command that waits on a human (no prompt, confirmation, editor, pager); write no poll or sleep loop; run slow commands once in the foreground waiting on exit; re-express harness denials inside the same grant/identity or return a mismatch verbatim if no formulation answers; name no env file path on a command line. Reason: no human answers a seat's command, and a worker reads only its brief. Exception: none.
- **No pattern kills**: Never run `pkill -f`, `killall`, or `pgrep | xargs kill`; stop a run only with `akrogon stop-run <run-id>`. Reason: pattern kills cross leaves. Exception: none.

Reasons and exceptions restated: scope/test/doc exclusions protect parallel waves, frozen tests, and watch-timer/guard contracts (exception only via revised brief from A); stash, unattended-command, and pattern-kill rules protect sibling workers and unattended execution with no exceptions.

## 6. Ordered steps

1. Read the read-first files inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u2` (advisory size: 4 files, ~16 turns).
2. Create `docs/guide/09-lifecycle.md` satisfying criteria 1 and 5.
3. Create `docs/guide/10-merging.md` satisfying criteria 2 and 5.
4. Create `docs/guide/11-while-you-are-away.md` satisfying criteria 3 and 5.
5. Create `docs/guide/12-when-work-stops.md` satisfying criteria 4 and 5.
6. Run Section 7 commands inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u2` through `akrogon run-check`.
7. Stage ONLY your 4 owned files and make one commit on detached HEAD; verify `git status --porcelain` is empty.

## 7. Commands

Run inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u2`:
```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'
akrogon run-check --name u2-watch-timer-docs -- bun test tests/watch-timer.test.ts -t "docs describe the timer watch|the watch check omits the akrogon status"
akrogon run-check --name u2-em-dash -- bun test tests/docs-em-dash.test.ts -t "hold no em dashes"
```
(Do NOT run `akrogon verify` or full `docs-links.test.ts`, which expects Units 1, 3, and 4 to have landed.)

## 8. Done-when, evidence and report

Done when all 4 owned files are committed cleanly in one commit, both targeted `run-check` commands exit 0 (cite their `check <label>: <exit> <path>` lines), and your return includes:
1. The returned commit SHA.
2. A compact fact table listing every command, path, number, and always/never/only rule in `09`–`12` with its supporting path (`src/...` or `skills/...`), plus where `csv-export` and `scheduled-email` appear in each page.
3. The four fill-in lines below:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
