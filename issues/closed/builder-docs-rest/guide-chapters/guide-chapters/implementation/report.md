# Implementation report: guide-chapters

- **Leaf folder**: `/home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters`
- **Branch**: `guide-chapters`
- **Base (`AKROGON_BASE`)**: `d44a586681f87b163a6613222de8be0b9a6679f6`
- **Committed HEAD**: `5c4841e8b966776579a4739ade8427ae04b6548f`

## Refresh record

1. **Implement start**: `git fetch origin && git rebase origin/main` — already up to date at `9a7402bf4464d812163e3dd4e1b4dcfd312c867a` (no move).
2. **Implement end (after Waves 1–2 and doc polish)**: `git fetch origin && git rebase origin/main` moved the branch cleanly onto `origin/main` (`charting-pictures-more` landed while Waves 1–2 ran):
   - Prior base: `9a7402bf4464d812163e3dd4e1b4dcfd312c867a` -> New base: `d44a586681f87b163a6613222de8be0b9a6679f6`
   - Prior head: `fd5ec7e0` -> New head: `5c4841e8b966776579a4739ade8427ae04b6548f`
   - Zero rebase conflicts. Re-verified `tests/docs-pictures.test.ts` (3/3 pass), `docs/reference/where-things-go.md` diff (`## Pictures` untouched), all criterion proofs, and `akrogon verify` on the rebased HEAD.

## Commits on branch (`d44a5866..5c4841e8`)

| Commit | Summary |
| --- | --- |
| `c8e77c43` | `test: planned doc-guide, retired-phrase and moved-doc tests for guide-chapters` (planning-era commit with `Test-Change:` trailers for all 4 modified test files; untouched during `implement`) |
| `d4fcacdb` | `docs(guide): add setup chapter (01-03) and update charting connectors (04, 08)` (Unit 1) |
| `5123d810` | `docs(guide): add lifecycle, merging, watch, and stop chapters (09-12)` (Unit 2) |
| `61802d7c` | `Update reference shelf docs and move roll-back-a-release` (Unit 3) |
| `6cbc970d` | `docs: rewrite README and docs index, remove retired docs folders` (Unit 4) |
| `5c4841e8` | `docs(guide): gloss technical terms and align client-portal paths in 09-12` (A final polish) |

## Worker wave summary

All 4 worker units ran in isolated detached worktrees (`guide-chapters-u1` through `guide-chapters-u4`), were cherry-picked cleanly onto `guide-chapters`, and all worker worktrees were removed before final verification:

- **Wave 1 (parallel)**:
  - **Unit 1** (`docs/guide/01`–`03`, `04` tab/footer, `08` footer): `check u1-em-dash: 0 .../check-u1-em-dash-1795788507385-1411012.log`, `check u1-install-config: 0 .../check-u1-install-config-1795788507541-1411100.log`.
  - **Unit 2** (`docs/guide/09`–`12`): `check u2-watch-timer-docs: 0 .../check-u2-watch-timer-docs-1795788645854-1422376.log`, `check u2-em-dash: 0 .../check-u2-em-dash-1795788645972-1422470.log`.
  - **Unit 3** (`docs/reference/*` + `roll-back-a-release.md` move): `check u3-rollback-doc: 0 .../check-u3-rollback-doc-1795788488356-1409595.log`, `check u3-command-ref: 0 .../check-u3-command-ref-1795788488472-1409944.log`, `check u3-ref-checks: 0 .../check-u3-ref-checks-1795788488634-1410017.log`, `check u3-em-dash: 0 .../check-u3-em-dash-1795788488720-1409588.log`.
- **Wave 2 (after Wave 1 landed)**:
  - **Unit 4** (`README.md`, `docs/README.md`, deletion of `docs/start/`, `docs/use/`, `docs/examples/`): `check u4-em-dash: 0 .../check-u4-em-dash-1795788993317-1440541.log`, `check u4-docs-links: 0 .../check-u4-docs-links-1795788993466-1440631.log`, `check u4-run-permit: 0 .../check-u4-run-permit-1795788993621-1440739.log`, `check u4-hold-retired: 0 .../check-u4-hold-retired-1795788993765-1440841.log`.

## Changed files and reasons

### Added guide pages
- `docs/guide/01-install.md`: machine readiness checklist with expected outputs, numbered install steps from `git clone` to `akrogon config`, complete copyable 1-CLI `~/.akrogon/config.yaml` (no `<...>` placeholders), optional multi-harness block (`codex`, `agy`, `pi`) with verbatim launch lines from `/home/ivan/.akrogon/config.yaml`, and updates/rollback links.
- `docs/guide/02-set-up-a-repo.md`: one Akrogon install serving made-up upstream `acme-core` plus two product repos (`client-portal`, `partner-hub`), numbered `/init-akrogon` walkthrough on `client-portal`, `akrogon init` outputs, adding `prefixes`, grounding (`grounding.index` and `AREA.md`), and `akrogon status`.
- `docs/guide/03-your-three-tabs.md`: required repo-named Herdr space rule (`resolveSpace`) vs `t-`/`c-`/`w-` convention, numbered `herdr-app do` steps to create the space and three daily tabs, what runs in each tab, and Akrogon-managed task tabs.
- `docs/guide/09-lifecycle.md`: starting handed-off work (`akrogon next`), wait reasons, start order and capacity refill, session launch and `akrogon-listener.service`, slot A (planning, frozen tests, building, `akrogon verify`) and slot B (blind review, repair, exceptions to `check.fix`, re-check), and watching from `t-client-portal`.
- `docs/guide/10-merging.md`: one merge turn per repo, command-owned landing (`akrogon land`), merge verification (`checks` minus `merge_covers`, parallel `merge_checks`), land gates, fast-forward push with restack retry, red/gate/conflict/dirty exits to `check.repair`, issue/epic completion, and Discord announcements.
- `docs/guide/11-while-you-are-away.md`: `watch-issues` in `w-client-portal` across `claude`, `codex`, `pi`, and `agy`, 20-minute `<prefix>-watch` timer, `## What each check does` (no `akrogon status`), what keeps moving vs what waits on the stop list, and `## Stop the watch` (no `cron`/`expir` wording).
- `docs/guide/12-when-work-stops.md`: failed work recovery on `scheduled-email`, `park`/`unpark`, `pause`/`unpause`, `stop`/`start`/`stop-run`, `leftovers`, common command refusals, and links to `docs/README.md#other-tools` and `docs/README.md#reference`.

### Updated guide pages & front doors
- `docs/guide/04-a-charting-session.md`: shrank `## Where you chart: the c- tab` to a brief pointer to `03-your-three-tabs.md` (preserving the `Where you chart` heading expected by `tests/docs-pictures.test.ts`); updated Previous footer to `03-your-three-tabs.md`.
- `docs/guide/08-hand-off.md`: updated Next footer to `09-lifecycle.md`.
- `README.md`: rewritten as a short front door (what Akrogon is, who it fits, at most two sentences of soft selling, chapter list `01`–`12`, link to `docs/README.md`, zero picture embeds).
- `docs/README.md`: rewritten as the chapter index (`## Guide`), `## Other tools` table linking shelf pages, `## Reference` (all 11 shelf pages), and link to `reference-index.md`.

### Reference shelf & moved page
- `docs/reference/roll-back-a-release.md`: moved from `docs/use/roll-back-a-release.md` with relative links fixed and all rollback proof strings preserved.
- `docs/reference/words.md`: rewritten with `## Guide words to shelf words` mapping table and alphabetical definitions using approved terms and updated links.
- `docs/reference/where-things-go.md`: updated `## Folders` to describe `docs/guide/` and remove `docs/start/`, `docs/use/`, `docs/examples/`; kept `## Pictures` byte-for-byte unchanged.
- `docs/reference/files.md`: added `## Writing issues by hand` and `## Saving records with akrogon sync` (folded from retired `docs/use/` pages); preserved `(script)` and the `verify-runs.jsonl` row (`timeouts`, `durations`, `attempt`).
- `docs/reference/config.md`: approved words and updated `prefixes` description to match live `repoPrefix` enforcement in `src/config.ts`.
- `docs/reference/skills.md`: approved words and updated watch link to `../guide/11-while-you-are-away.md#stop-the-watch`.
- `docs/reference/limits.md`: approved words and updated autopilot links to `../guide/06-charting-mode.md`.
- `docs/reference/releases-and-updates.md`: updated rollback link to `roll-back-a-release.md`.
- `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/state-and-phases.md`: audited — already clean on approved words, links, and command-reference/check contracts; no edit needed.

### Deleted retired folders (23 files)
- Deleted `docs/start/` (5 files), `docs/use/` (14 files, with `roll-back-a-release.md` moved to `docs/reference/`), and `docs/examples/` (4 files). Mapped row-by-row below.

### Planned tests (committed in `plan.synthesis`, untouched during `implement`)
- `tests/docs-em-dash.test.ts`: added `findRetiredPhrases` guard and unit test for `"manual mode"`, `"manual route"`, `"quick fix"`, and `"autopilot signposts"` across `README.md`, `docs/**/*.md` on disk, and tracked `skills/**/*.md`, exempting lines starting with `Old record words:`.
- `tests/docs-links.test.ts`: added checks for guide pages `01`–`12`, retired directory removal, `README.md` having no image, Previous/Next neighbour links, `01-install.md` copyable config validation (`globalSchema` + `harnessArgv`), and `where-things-go.md` folders.
- `tests/rollback.test.ts`: updated rollback doc path to `../docs/reference/roll-back-a-release.md` (assertions unchanged).
- `tests/watch-timer.test.ts`: updated watcher doc path at all 3 sites to `docs/guide/11-while-you-are-away.md` (assertions unchanged).

## Move map for retired pages (Criterion 4)

Every retired page under `docs/start/`, `docs/use/`, and `docs/examples/` (23 total) and where its facts now live:

| # | Retired page | New home(s) |
| --- | --- | --- |
| 1 | `docs/start/what-it-is.md` | `README.md`, `docs/guide/03-your-three-tabs.md`, `docs/guide/09-lifecycle.md`, `docs/reference/words.md` |
| 2 | `docs/start/why-it-works.md` | `docs/guide/04-a-charting-session.md`, `docs/guide/08-hand-off.md`, `docs/guide/09-lifecycle.md`, `docs/reference/checks.md#test-change-refusals`, `docs/reference/state-and-phases.md` |
| 3 | `docs/start/install.md` | `docs/guide/01-install.md`, `docs/reference/config.md#machine-configyaml` |
| 4 | `docs/start/set-up-a-project.md` | `docs/guide/02-set-up-a-repo.md`, `docs/reference/config.md#repo-issuesconfigyaml` |
| 5 | `docs/start/one-change.md` | `docs/guide/04-a-charting-session.md` through `docs/guide/10-merging.md` |
| 6 | `docs/use/a-working-day.md` | `README.md`, `docs/README.md#guide`, `docs/guide/03-your-three-tabs.md`, `docs/guide/04-a-charting-session.md` through `docs/guide/10-merging.md` |
| 7 | `docs/use/plan-work.md` | `docs/guide/04-a-charting-session.md`, `docs/guide/05-signposts.md`, `docs/guide/08-hand-off.md` |
| 8 | `docs/use/quick-fix.md` | `docs/guide/07-build-route.md#direct` |
| 9 | `docs/use/autopilot.md` | `docs/guide/06-charting-mode.md` |
| 10 | `docs/use/write-issues-by-hand.md` | `docs/reference/files.md#writing-issues-by-hand`, `docs/reference/state-and-phases.md#fields-a-person-sets` |
| 11 | `docs/use/run-work.md` | `docs/guide/09-lifecycle.md` |
| 12 | `docs/use/park-pause-stop.md` | `docs/guide/12-when-work-stops.md` (`#park-an-issue`, `#pause-a-repository`, `#stop-a-leaf-or-a-check-run`, `#clean-up-leftovers`) |
| 13 | `docs/use/when-work-fails.md` | `docs/guide/12-when-work-stops.md` (`#failed-work`, `#common-command-refusals`) |
| 14 | `docs/use/merge-and-announce.md` | `docs/guide/10-merging.md` |
| 15 | `docs/use/save-records.md` | `docs/reference/files.md#saving-records-with-akrogon-sync`, `docs/guide/12-when-work-stops.md#common-command-refusals` |
| 16 | `docs/use/watch-while-away.md` | `docs/guide/11-while-you-are-away.md` |
| 17 | `docs/use/report-an-observation.md` | `docs/reference/skills.md#seed-issue`, `docs/reference/commands.md#run-work`, `docs/guide/04-a-charting-session.md#opening-a-session` |
| 18 | `docs/use/learn-from-work.md` | `docs/reference/skills.md#learn-issues`, `skills/lesson-rule.md`, `skills/learn-issues/SKILL.md` |
| 19 | `docs/use/roll-back-a-release.md` | `docs/reference/roll-back-a-release.md` |
| 20 | `docs/examples/README.md` | Replaced by the worked `client-portal` running example across `docs/guide/04-a-charting-session.md` through `docs/guide/12-when-work-stops.md` |
| 21 | `docs/examples/quick-fix-story.md` | `docs/guide/07-build-route.md#direct` |
| 22 | `docs/examples/autopilot-story.md` | `docs/guide/06-charting-mode.md#semi-autopilot` |
| 23 | `docs/examples/recovery-story.md` | `docs/guide/12-when-work-stops.md#failed-work` |

## Running example continuity (`client-portal`: `csv-export` and `scheduled-email`, Criterion 2)

- `docs/guide/02-set-up-a-repo.md`: registers `acme-core` (`ac`), `client-portal` (`cp`), and `partner-hub` (`ph`) in one `~/.akrogon/config.yaml`, then walks `/init-akrogon` and `akrogon status` on `client-portal`.
- `docs/guide/03-your-three-tabs.md`: creates Herdr space `client-portal` with `t-client-portal`, `c-client-portal`, and `w-client-portal`.
- `docs/guide/09-lifecycle.md`: picks up `issues/open/weekly-client-report/` (`csv-export` and `scheduled-email` with `blocked-by: [csv-export]` and `POSTMARK_API_KEY` in `client-portal/.env`) from `08-hand-off.md`; walks `akrogon next csv-export`, `waiting: scheduled-email on csv-export (implement)`, `csv-export` worktree (`~/.akrogon/worktrees/client-portal/csv-export`), slot A planning/building/verifying, slot B blind review and repair, and `akrogon status csv-export`.
- `docs/guide/10-merging.md`: follows `csv-export` entering the `client-portal` merge turn (ordered ahead of zero-dependent leaves because `scheduled-email` depends on it), `akrogon land csv-export --attempt <id>`, `csv-export` landing and waking `scheduled-email`, and `scheduled-email` landing last to print `issue complete weekly-client-report`, move `issues/open/weekly-client-report/` to `issues/closed/weekly-client-report/`, and send the Discord summary via slot B.
- `docs/guide/11-while-you-are-away.md`: runs `watch-issues ~/code/client-portal` in `w-client-portal` (`cp-watch` / `cp-watch-consult`), shows the watcher leaving `scheduled-email` alone while `csv-export` is unmerged, starting `scheduled-email` once unblocked, opening a consult case if `scheduled-email` fails twice, and stopping on `POSTMARK_API_KEY` or a staging email grant.
- `docs/guide/12-when-work-stops.md`: walks `scheduled-email` stopping in `failed` when `POSTMARK_API_KEY` is missing in `client-portal/.env`, recovering via `akrogon status` / `akrogon status scheduled-email`, adding `POSTMARK_API_KEY` to `client-portal/.env` (never the worktree `.env`), `akrogon phase scheduled-email implement` (no `--slot`), and `akrogon next scheduled-email`; also illustrates `akrogon park weekly-client-report`, `akrogon pause` on `client-portal`, and `akrogon stop scheduled-email`.

## Fact verification table (Criterion 10)

Every command, path, number, and always/never/only rule across the new guide pages (`01`–`03`, `09`–`12`) and edited shelf pages matched against live code, skills, systemd units, `herdr-app commands`, or `/home/ivan/.akrogon/config.yaml`:

| Page | Documented command / path / number / rule | Supporting source path |
| --- | --- | --- |
| `01-install.md` | Prerequisites (`systemctl --user is-system-running` `running`/`degraded`, `bun`, `git`, `flock`, `hc`, `herdr-app`, agent CLI, optional `gh`) | `src/install.ts`, `src/scope.ts`, `src/hc.ts`, `src/pull.ts` |
| `01-install.md` | Clone URL `https://github.com/Tamdoma/akrogon.git` | `git remote -v` (`origin`) |
| `01-install.md` | `~/.akrogon/config.yaml`, `AKROGON_HOME`, `max_active` default `3`, required `slots.{a,b,consultant}`, `harnesses`, `repos`, `prefixes` (2 lowercase letters) | `src/config.ts` (`globalSchema`, `loadGlobal`, `repoPrefix`) |
| `01-install.md` | All 4 harness launch lines (`claude`, `codex`, `agy`, `pi`) verbatim | `/home/ivan/.akrogon/config.yaml` (checked verbatim) |
| `01-install.md` | `claude` merges `permissions.denyInsteadOfPrompting: true` + `--disallowedTools=AskUserQuestion`; `pi` appends `--session-id`; `agy` handles startup trust prompt | `src/seat.ts` (`harnessArgv`, `withClaudeSettings`, `launchSeat`) |
| `01-install.md` | `bun install --frozen-lockfile --backend=copyfile`, `bun src/akrogon.ts install`, `~/.akrogon/current`, `~/.local/bin/akrogon`, 5 skill targets (`~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills`, `~/.gemini/config/skills`), conflict `rm -r -- <path>`, stale `~/.config/herdr-app/mods` removal | `src/install.ts`, `issues/config.yaml` |
| `01-install.md` | `akrogon.slice` (`CPUWeight=20`, `MemoryHigh=50%`, `MemoryMax=75%`, `MemorySwapMax=0`), `akrogon-land.slice` (`CPUWeight=1000`), `akrogon-listener.service` (`akrogon listen`) | `systemd/akrogon.slice`, `systemd/akrogon-land.slice`, `systemd/akrogon-listener.service` |
| `01-install.md` | `akrogon config` prints `repo: none` outside a repo; registering repo named `akrogon` enables release deploys to `~/.akrogon/releases/<commit>` | `src/akrogon.ts`, `src/self-update.ts:217,304` |
| `02-set-up-a-repo.md` | `/init-akrogon` inspects repo, writes `docs/reference-index.md` / `AREA.md` (max 40 lines, 4 exact `##` headings), runs `akrogon init --from <proposal-file>` | `skills/init-akrogon/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` |
| `02-set-up-a-repo.md` | `akrogon init` creates `issues/config.yaml`, `issues/open/`, `learnings/LESSONS.md`, `.gitignore` entries (`issues/seeds/`, `.lock`, `issues/open/**/*.log`, `issues/parked/**/*.log`, `issues/chart/*/direct/**/*.log`), `.gitattributes` (`learnings/LESSONS.md merge=union`), registers `repos` entry, prints `~/.config/akrogon/env` if absent, refuses missing/empty `grounding.index`, allows `grounding: none` | `src/init.ts:72-95`, `src/config.ts` |
| `02-set-up-a-repo.md` | `prefixes` required before `akrogon next`, `akrogon seat`, and `watch-issues` (`<prefix>-<slug>-a`, `<prefix>-slot-b`, `<prefix>-watch`, `<prefix>-watch-consult`), not auto-written by `akrogon init` | `src/config.ts:274-284`, `src/init.ts:88-92`, `src/next.ts:743`, `src/seat.ts:306,500,524`, `skills/watch-issues/scripts/start.ts:111` |
| `02-set-up-a-repo.md` | `akrogon status` prints `Listener: live`, repo name, `no open leaves`; `worktree_store` defaults to `~/.akrogon/worktrees/<repo>`; `slots.consultant` machine-only | `src/status.ts:737,947`, `src/config.ts` |
| `03-your-three-tabs.md` | Required Herdr space matching repo name verbatim (refused if 0 or >=2 matching sessions); `t-`/`c-`/`w-` tab names are operator convention only | `src/hc.ts` (`resolveSpace`), `src/seat.ts` |
| `03-your-three-tabs.md` | `herdr-app ls`, `herdr-app do space.new --name ... --folder ... --tab ...`, `herdr-app do tab.new --name ... --folder ...` | `herdr-app commands` (`space.new`, `tab.new`), `herdr-app --skill` |
| `03-your-three-tabs.md` | Task tabs named `<slug>` or `<slug> failed`, closed on merge; closing `herdr-app` window keeps `hc` terminals alive | `src/next.ts`, `src/phase.ts`, `src/reconcile.ts`, `herdr-app --skill` |
| `09-lifecycle.md` | `akrogon next`, `akrogon next <slug>`, `akrogon next <issue>`, `akrogon next --all`, `--resume`, `--wake` mutual exclusion; path-first target lookup; bare-name ambiguity refusal | `src/next.ts`, `src/akrogon.ts`, `docs/reference/commands.md` |
| `09-lifecycle.md` | Wait lines & errors: `waiting: <slug> on <dep> (<phase>)`, `Leaf dependencies are not merged`, `Leaf inputs are missing`, `Leaf is stopped: ...`, `Leaf is failed and needs phase recovery`; `max_active` default `3` + `repo_max_active` | `src/next.ts:1017,1074,1089,1098`, `src/config.ts`, `src/turn.ts` |
| `09-lifecycle.md` | Start order (merged leaves first, then most transitive unmerged dependents) and capacity refill (longest-waiting first on `--wake`/`--resume`) | `src/next.ts`, `src/turn.ts` |
| `09-lifecycle.md` | Worktree at `~/.akrogon/worktrees/<repo>/<slug>`, sparse checkout excluding `issues/`, `.env` copy only for `env` keys, `setup` under `flock` + `akrogon guard own-modules` + `akrogon-setup` marker, systemd slice `akrogon-l<hash>.slice`, `akrogon-listener.service` (`akrogon listen`) | `src/next.ts`, `src/scope.ts:11`, `src/listen.ts`, `src/worktree.ts` |
| `09-lifecycle.md` | Slot A (`plan-issue`, `frozen` snapshot at `plan.synthesis -> implement`, `implement-issue` inline/serial-solo/waves of up to 3 workers in `<slug>-u<N>`, `akrogon verify`, never runs `merge_checks`) and Slot B (`check-issue` blind A+B initial review, B-only when `fix_rounds > 0`, B repairs in `check.repair`, `Handed to A` exceptions to `check.fix`) | `src/phase.ts`, `src/routing.ts`, `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` |
| `09-lifecycle.md` | `akrogon status`, `akrogon status <slug>` (last 10 `History:` entries, seat sources), `akrogon log <path>` | `src/status.ts`, `src/evidence.ts` |
| `10-merging.md` | One merge turn per repo ordered by active `batch` holder, most unmerged dependents, earliest `merge_stamp` (1st repair return keeps `merge_stamp`, 2nd mints new); `TURN` (`holder`, `2`, ...), `NOTE` (`land`), `land alive: akrogon-land-<id>` | `src/turn.ts:107-111`, `src/phase.ts:255-262`, `src/status.ts` |
| `10-merging.md` | Merge holds no seat; `akrogon land <slug> --attempt <id>` in `akrogon-land-<id>` under `akrogon-land.slice`; `lessons: retire applied lines` fixup; `akrogon verify --attempt <id>` (`checks` minus `merge_covers`, parallel `merge_checks`); land gates; fast-forward push (1 restack retry; 2nd -> `held <slug> attempt=<id>` keeping queue place; other error -> `failed`); operator slot-less `akrogon phase <slug> merged` | `src/land.ts`, `src/next.ts`, `src/phase.ts`, `skills/merge-issue/SKILL.md`, `src/AREA.md:15` |
| `10-merging.md` | `state.merge_exit` (`red`, `gate`, `conflict`, `dirty`), main-red cover, repeated-red base check, 4 `check.repair` outcomes, automatic clearing on leaving `check.repair` | `src/land.ts`, `src/phase.ts`, `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md` |
| `10-merging.md` | Completion closes `sources`, deletes plain `*.log` (retains failures in `verify-runs.jsonl`, reads legacy `evidence.tar.zst`), moves to `issues/closed/`, prints `issue complete <issue>` / `epic complete <epic>`; Discord broadcast (`broadcast.discord.webhook_env`, `~/.config/akrogon/env` only, `broadcast pending`, slot B runs `broadcast-issue`, 1 retry, failure never undoes merge) | `src/phase.ts`, `src/pack.ts`, `src/status.ts:199,771`, `skills/broadcast-issue/SKILL.md` |
| `11-while-you-are-away.md` | `watch-issues <root>` / `/watch-issues <root>`, `watch-issues stop <root>`, all 4 harnesses (`claude`, `codex`, `pi`, `agy`), 20-minute `<prefix>-watch` timer, busy coalescing, `observe.ts` sole read, up to 2 unproductive retries, loop steer at most once per seat (notify-only on `codex`), consult case under `~/.akrogon/watch/<repo>/consults/<case-id>` with `<prefix>-watch-consult` (`akrogon seat --watch-consultant`), stop list, never-do rules, `/clear` vs `/new` / compaction / shell-exit `pid=` rules | `skills/watch-issues/SKILL.md`, `skills/watch-issues/scripts/start.ts`, `skills/watch-issues/scripts/observe.ts`, `tests/watch-timer.test.ts` |
| `12-when-work-stops.md` | `akrogon phase <slug> failed --slot A --reason ...`; 3 silent turns or 3 lost seats -> `failed`; recovery via `akrogon status` / `akrogon status <slug>`, editing repo `.env` (never worktree `.env`), slot-less `akrogon phase <slug> <active-phase>` (never `merged`, keeps `fix_rounds`), `akrogon next <slug>` | `src/phase.ts`, `src/next.ts:784-892,1074`, `src/status.ts` |
| `12-when-work-stops.md` | `akrogon park`/`unpark` (`--all`, refuses running or needed-by-`blocked-by`), `akrogon pause`/`unpause` (`~/.akrogon/paused.yaml`, typed commands still run, `unpause` runs one pass), `akrogon stop`/`start` (`~/.akrogon/stopped.yaml`, `--all`), `akrogon stop-run [<run-id>]` (own pane scope only, never `pkill -f`), `akrogon leftovers` (`no leftovers`, `host` group), refusal rules (`sync`, `phase`, deps, push) | `src/park.ts`, `src/pause.ts`, `src/stop.ts`, `src/reconcile.ts`, `src/sync.ts:39,51,157`, `src/phase.ts:591` |
| `docs/reference/files.md` | Hand-written leaf layout, `state.yaml` person-set fields, `blocked-by` rules, `akrogon sync` 7 steps, `eligibleRecord` exclusions, refusal errors | `src/state.ts`, `src/turn.ts`, `src/next.ts`, `src/sync.ts`, `src/phase.ts:591` |
| `docs/reference/roll-back-a-release.md` | `akrogon rollback`, `mv -T .next-current current`, `release-hold.yaml`, `deploy held`, `Cannot roll back: no previous release to roll back to`, `akrogon-land.slice` guard, `writeDeploySuccess` | `src/rollback.ts:26-31`, `src/release.ts`, `src/self-update.ts:255`, `tests/rollback.test.ts` |

## Verification results (all final proofs run on committed HEAD `5c4841e8b966776579a4739ade8427ae04b6548f`)

### Criterion-by-criterion proof table

| Criterion | Status | Command & kept output | Commit | Excerpt / notes |
| --- | --- | --- | --- | --- |
| **C1** (Pages `01`–`03`, `09`–`12`; copyable 1-CLI config + optional `agy` block) | Mechanical pass; prose/steps for slot B | `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`<br>`check docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-docs-links-1795789307370-1454749.log` | `5c4841e8` | `18 pass, 0 fail, 92 expect() calls` — includes `guide pages 01 to 12 exist...`, `install guide copyable machine config passes globalSchema and harnessArgv with one CLI and optional agy block`, and validator rejection tests. |
| **C2** (`csv-export` & `scheduled-email` in `09`–`12`) | Documented above; slot B reading | See `## Running example continuity` above | `5c4841e8` | Slot B reads `08-hand-off.md` through `12-when-work-stops.md`. |
| **C3** (`README.md`, `docs/README.md`, Previous/Next neighbours, all links resolve) | Mechanical pass; framing for slot B | Same `check docs-links: 0 .../check-docs-links-1795789307370-1454749.log` + `akrogon run-check --name docs-pictures -- bun test tests/docs-pictures.test.ts`<br>`check docs-pictures: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-docs-pictures-1795789307461-1454857.log` | `5c4841e8` | All README/docs/skills links and heading anchors resolve; `README.md` has no picture embed; all 12 guide pages link exact Previous/Next neighbours; `tests/docs-pictures.test.ts` (`3 pass, 0 fail`) confirms shrunk `04` tab section remains compliant. |
| **C4** (`docs/start`, `docs/use`, `docs/examples` removed; 23-row move map) | Mechanical pass; slot B checks rows | `akrogon run-check --name retired-dirs-audit -- sh -c 'for d in docs/start docs/use docs/examples; do [ -e "$d" ] && echo "EXISTS: $d" && exit 1; done; echo "ALL RETIRED DIRS REMOVED"'`<br>`check retired-dirs-audit: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-retired-dirs-audit-1795789310985-1458053.log` | `5c4841e8` | `ALL RETIRED DIRS REMOVED`; also asserted in `docs-links` (`18 pass`). Complete 23-row move map above for slot B audit. |
| **C5** (`words.md` mapping; `where-things-go.md` folders updated, `## Pictures` unchanged) | Mechanical pass; `words.md` reading for slot B | `check docs-links: 0 .../check-docs-links-1795789307370-1454749.log` + `akrogon run-check --name where-things-go-diff -- git diff d44a586681f87b163a6613222de8be0b9a6679f6...HEAD -- docs/reference/where-things-go.md`<br>`check where-things-go-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-where-things-go-diff-1795789310766-1457891.log` | `5c4841e8` | Diff touches only lines 9–14 (`## Folders`); `## Pictures` lines 24–35 are 100% unchanged against rebased `AKROGON_BASE` (`d44a5866`). |
| **C6** (Moved-doc tests & `run-permit` / `hold-retired` sweeps) | Pass | `check rollback-doc: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-rollback-doc-1795789310079-1454927.log`<br>`check watch-timer-docs: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-watch-timer-docs-1795789310249-1457537.log`<br>`check run-permit-sweep: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-run-permit-sweep-1795789310391-1457631.log`<br>`check hold-retired-sweep: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-hold-retired-sweep-1795789310542-1457726.log`<br>`check command-reference: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-command-reference-1795789310655-1457820.log` | `5c4841e8` | `rollback.test.ts`: `9 pass, 0 fail`; `watch-timer.test.ts` doc tests: `5 pass, 0 fail`; `run-permit` sweep: `1 pass, 0 fail (286 expect)`; `hold-retired` sweep: `1 pass, 0 fail (248 expect)`; `command-reference.test.ts`: `4 pass, 0 fail (1628 expect)`. |
| **C7** (Retired-phrase guard + deliberate break) | Pass | **Deliberate break (red, reverted immediately)**: appended `Quick fix deliberate break` to `README.md`, ran `akrogon run-check --name docs-em-dash-break -- bun test tests/docs-em-dash.test.ts`<br>`check docs-em-dash-break: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-docs-em-dash-break-1795789307071-1454514.log`<br>**Clean HEAD (green)**: `akrogon run-check --name docs-em-dash -- bun test tests/docs-em-dash.test.ts`<br>`check docs-em-dash: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-docs-em-dash-1795789307210-1454653.log` | `5c4841e8` | Break excerpt: `(fail) README, docs markdown and tracked skills markdown hold no retired phrases` -> `Received: ["README.md:40: Quick fix deliberate break"]`. Clean HEAD: `4 pass, 0 fail, 23 expect() calls`. |
| **C8** (No em dash, no partial consultant example) | Pass | `check docs-em-dash: 0 .../check-docs-em-dash-1795789307210-1454653.log` + `akrogon run-check --name consultant-audit -- git grep -in "consultant" -- README.md docs/`<br>`check consultant-audit: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-consultant-audit-1795789310873-1457957.log` | `5c4841e8` | Zero em dashes across `README.md`, `docs/**/*.md`, and `docs/pictures/*.svg`. Inspected all 106 matches in `consultant-audit`: zero partial consultant launch examples (every prompt example names full slot, harness, model, and effort; all remaining hits are prose or `slots.consultant` config). |
| **C9** (Cold-reader subagent check Q1–Q8) | Unverified (slot B-owned) | Executed by slot B in `check.review` using only `README.md` and `docs/guide/01`–`12` | `5c4841e8` | Slot B records all 8 answers with quoted lines in `review-B.md`. |
| **C10** (Fact verification table + tone) | Table verified above; tone for slot B | Verified against `src/`, `skills/`, `systemd/`, `herdr-app commands`, and `/home/ivan/.akrogon/config.yaml` (all 4 harness launch lines verbatim) | `5c4841e8` | Tone (no marketing jargon, no unexplained developer jargon, matching `04`–`08`) is slot B's reading in `review-B.md`. |
| **C11** (Destination's `checks` pass) | Pass (`leaf` green receipt written) | `akrogon verify` (wall time: **272 s / 4 min 32 s**)<br>`verify setup: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-setup-1795789343891-1458825.log`<br>`verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-format-1795789347261-1458825.log`<br>`verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-typecheck-1795789350363-1458825.log`<br>`verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-test-1795789615143-1458825.log` | `5c4841e8` | `verify leaf 5c4841e8b966776579a4739ade8427ae04b6548f: green` — Prettier clean, `tsc --noEmit` clean, full test suite + 5x `--rerun-each=5` on the 4 changed `tests/*.test.ts` (`265 pass, 0 fail, 2270 expect() calls [157.05s]`). |

## Known limitations and unverified criteria

- **Slot B-owned review criteria (not runnable by A)**:
  - **Criterion 2**: Slot B narrative continuity review of `csv-export` and `scheduled-email` across `08-hand-off.md` through `12-when-work-stops.md`.
  - **Criterion 4**: Slot B row-by-row verification of the 23-row move map above.
  - **Criterion 9**: Fresh cold-reader subagent spawned inside slot B's `check.review` session given only `README.md` and `docs/guide/01`–`12` to answer Q1–Q8 from `design.md`.
  - **Criterion 10 (tone)**: Slot B reading confirming no marketing jargon, no unexplained developer jargon, and tone matching `04`–`08`.
- **Intentional picture boundary (D8 / design.md R6 & R10)**: `README.md` carries no picture embed until `setup-pictures` adds the hero, and `01`–`03` and `09`–`12` carry no picture embeds until `setup-pictures`, `build-pictures`, and `away-pictures` add them. Existing SVGs in `docs/pictures/` and existing shelf embeds in `docs/reference/` were left untouched for `away-pictures`.
