# Plan: guide-chapters

Base commit (`AKROGON_BASE`): `9a7402bf4464d812163e3dd4e1b4dcfd312c867a`
Leaf folder: `/home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters`
Readiness check (`akrogon status guide-chapters`): no `Missing:` lines; `readiness.yaml` holds empty `inputs`, `produces`, `grants`, `retained`, `proofs`.

## Design and brief alignment note

- `design.md`'s `Rest shape (forks/rest-shape.md)` explicitly supersedes Q1's page list (dropping `01-what-akrogon-is` and `13-other-tools`), Q3's six-SVG set, Q5's per-picture dark renders, Q6's leaf list, and the door reading's per-section picture rule. `brief.md` and `design.md` agree on the resulting 12-page guide (`01` to `12`), the `docs/README.md` "Other tools" table, moving `docs/use/roll-back-a-release.md` to `docs/reference/roll-back-a-release.md`, retiring `docs/start/`, `docs/use/`, and `docs/examples/`, and leaving `README.md` without a picture embed until `setup-pictures` adds the hero.
- Live code check (`src/config.ts:274-284`, `src/next.ts:743`, `src/seat.ts:306,500,524`, `skills/watch-issues/scripts/start.ts:111`): `prefixes` in `~/.akrogon/config.yaml` IS read at seat start, consultant start, watch-consultant start, and watch timer start, while `akrogon init` (`src/init.ts:88-92`) writes `repos` and `toolkits` without auto-adding a `prefixes` entry. Therefore `01-install.md` includes `prefixes: {}`, `02-set-up-a-repo.md` includes adding the repo's two-letter prefix under `prefixes:` in `~/.akrogon/config.yaml`, and `docs/reference/config.md` corrects the stale "No command reads it yet." sentence.

## Decisions

- **D1 (12-page guide structure & running examples)**: Keep `04` to `08` numbers unchanged; write `01-install.md`, `02-set-up-a-repo.md`, `03-your-three-tabs.md`, `09-lifecycle.md`, `10-merging.md`, `11-while-you-are-away.md`, and `12-when-work-stops.md` in the tone and depth of `04` to `08` (plain technical English, no marketing jargon, no unexplained developer jargon, no em dashes, no partial consultant examples). Use the made-up upstream `acme-core` plus two product repos built on it (`client-portal` and `partner-hub`, naming no real/private repo from `/home/ivan/.akrogon/config.yaml`) in `02`, and carry `client-portal`'s `csv-export` and `scheduled-email` (`weekly-client-report`) from `08-hand-off.md` through `09` to `12`.
- **D2 (01-install.md machine config contract)**: `01-install.md` opens with a prerequisite check list (Linux desktop with `systemctl --user`, Bun, Git, `flock`, `hc`, `herdr-app`, one agent CLI, optional `gh`), each with its command and what a ready machine prints, then numbered steps from `git clone https://github.com/Tamdoma/akrogon.git` through `~/.akrogon/config.yaml`, `bun install --backend=copyfile`, `bun src/akrogon.ts install`, PATH setup, ending with `akrogon config`. Its first `yaml` block is a complete copyable `~/.akrogon/config.yaml` that works with one agent CLI (`claude`, using real values `claude-opus-5-5` / `high` for `a`, `b`, and `consultant`, `max_active: 3`, `repos: {}`, `prefixes: {}`, zero `<...>` placeholders, and the verbatim `claude` launch line from `/home/ivan/.akrogon/config.yaml`). A second optional `yaml` block adds the other harnesses (`codex`, `agy`, `pi`) using their verbatim launch lines from `/home/ivan/.akrogon/config.yaml`. Both blocks validate cleanly against `globalSchema` and `harnessArgv`.
- **D3 (02 and 03 setup steps & herdr space rule)**: `02-set-up-a-repo.md` explains one Akrogon install serving `acme-core`, `client-portal`, and `partner-hub` (`prefixes` `ac`, `cp`, `ph`), then gives numbered steps (command + expected result) walking `/init-akrogon` on `client-portal`, showing every file `akrogon init` writes (`issues/config.yaml`, `issues/open/`, `learnings/LESSONS.md`, `.gitignore`, `.gitattributes`, `repos` entry), adding `client-portal: cp` under `prefixes`, explaining grounding (`grounding.index`, `docs/reference-index.md`, `AREA.md`, `grounding: none`), and ending by checking `akrogon status`. `03-your-three-tabs.md` gives numbered steps (command + expected result) for creating the required herdr space named `client-portal` (matching the registered repo name, enforced by `src/hc.ts` `resolveSpace`) and the three daily tabs (`t-client-portal` for `akrogon status`/`akrogon next`, `c-client-portal` for `/chart-issues` and consultants, `w-client-portal` for `watch-issues <root>`), stating plainly that the space name is required while `t-`/`c-`/`w-` are your workspace convention.
- **D4 (04 and 08 connectors)**: In `docs/guide/04-a-charting-session.md`, shrink `## Where you chart: the c- tab` to a brief link to `[Your three tabs](03-your-three-tabs.md)` and update the footer to `Previous: [Your three tabs](03-your-three-tabs.md) · Next: [Signposts](05-signposts.md)`. In `docs/guide/08-hand-off.md`, update the footer to `Previous: [Build route](07-build-route.md) · Next: [Lifecycle](09-lifecycle.md)`. Leave `05` to `07` untouched.
- **D5 (09 to 12 lifecycle, merging, watcher, stop/failure)**:
  - `09-lifecycle.md`: slot A (plans in `plan.synthesis` with `plan-issue` and frozen tests, builds in `implement` with `implement-issue` in its own sparse worktree), slot B (reviews blind alongside A in `check.review`, repairs most Fixes in `check.repair` or sends exceptions back to A in `check.fix`, then B-only review when `fix_rounds > 0`), starting handed-off work (`akrogon next`, `akrogon next csv-export`, `akrogon next weekly-client-report`, `akrogon next --all`), why a ready task may wait (`blocked-by`, missing `readiness.yaml` inputs like `POSTMARK_API_KEY`, machine/repo `max_active`, stopped/failed/paused), start order (merged leaves first, then most unmerged dependents; capacity waiters refill longest-waiting first), what starts sessions (`akrogon next` opens the leaf tab/worktree/seats; `akrogon-listener.service` runs `akrogon listen` to trigger `--wake`/`--resume`), and watching from `t-client-portal`.
  - `10-merging.md`: one merge turn per repo (active batch holder, most dependents, earliest `merge_stamp`), command-owned landing (`akrogon next` rebases and launches `akrogon land <slug> --attempt <id>` in `akrogon-land-<id>` under `akrogon-land.slice`), checks on the merged result (`akrogon verify --attempt <id>`: `checks` minus `merge_covers`, then parallel `merge_checks`, land gates, fast-forward push with one restack retry), red going back to `check.repair` via `state.merge_exit` (`red`, `gate`, `conflict`, `dirty`), issue/epic completion (`csv-export` wakes `scheduled-email`; last leaf closes `sources`, deletes plain `*.log`, moves owner to `issues/closed/`, prints `issue complete weekly-client-report` / `epic complete <epic>`), and Discord announcements (`broadcast.discord.webhook_env`, `~/.config/akrogon/env`, `broadcast pending`, slot B runs `broadcast-issue` once per owner).
  - `11-while-you-are-away.md`: watcher in `w-client-portal` (`watch-issues <root>`, 20-minute `<prefix>-watch` timer, works in `claude`, `codex`, `pi`, and `agy`), keeping the exact heading `## What each check does` with NO `akrogon status` inside that section and zero `cron` / `CronCreate` / `CronList` / `CronDelete` / `expir` matches anywhere in the file, plus `## Stop the watch` (anchor linked from `docs/reference/skills.md`), and explicitly stating what keeps moving vs what still waits for you (keys, approvals, operator decisions, stop list).
  - `12-when-work-stops.md`: failed work (illustrated with `scheduled-email` stopping in `failed`, inspecting `akrogon status scheduled-email`, fixing the cause, recovering with `akrogon phase scheduled-email implement` with no `--slot`, and running `akrogon next scheduled-email`), `park`/`unpark`, `pause`/`unpause`, `stop`/`start`/`stop-run`, `leftovers`, common command refusals, ending with a link to the lookup shelf for other tools (`../README.md#other-tools` and `../README.md#reference`).
- **D6 (Reference shelf, move map, and front doors)**:
  - Move `docs/use/roll-back-a-release.md` to `docs/reference/roll-back-a-release.md` (preserving `mv -T .next-current current`, `release-hold.yaml`, and `writeDeploySuccess`, fixing relative links).
  - Fold the shelf-owned facts from retired `docs/use/write-issues-by-hand.md` and `docs/use/save-records.md` into `docs/reference/files.md` (`## Writing issues by hand` and `## Saving records with akrogon sync`), while preserving `(script)` and the `verify-runs.jsonl` row (`timeouts`, `durations`, `attempt`).
  - Rewrite `docs/reference/words.md` with an explicit `## Guide words to shelf words` table (e.g. task/leaf, slot A/seat A, slot B/seat B, charting agent/chart door, Direct/direct route, Lifecycle/lifecycle route, Charting mode, Build route, watcher/watch-issues) plus alphabetical definitions linking only to existing `../guide/*.md` and `*.md` pages.
  - Rewrite `docs/reference/where-things-go.md` `## Folders` for `docs/guide/`, `docs/reference/`, `docs/pictures/`, and `docs/reference-index.md` while keeping `## Pictures` byte-for-byte identical to `AKROGON_BASE`.
  - Update approved words and fix all retired inbound links across `docs/reference/*.md` (`skills.md`, `limits.md`, `config.md`, `checks.md`, `commands.md`, `releases-and-updates.md`, `state-and-phases.md`). Keep `docs/reference/commands.md`'s command table strictly compliant with `tests/command-reference.test.ts` and `docs/reference/checks.md`'s `(script)` intact.
  - Rewrite `README.md` as a short front door (what Akrogon is, who it fits, at most two sentences of soft selling, chapter list `01` to `12`, link to `docs/README.md`, NO picture embed).
  - Rewrite `docs/README.md` as the chapter index (`01` to `12`), a short `## Other tools` table linking shelf pages, `## Reference` (all 11 shelf pages including `roll-back-a-release.md`), and the link to `reference-index.md`.
  - Delete `docs/start/`, `docs/use/`, and `docs/examples/` completely; record the 23-row move map in `implementation/report.md`.
- **D7 (Retired-phrase guard and moved-doc test updates)**:
  - Extend `tests/docs-em-dash.test.ts` with `findRetiredPhrases(root)` checking `"manual mode"`, `"manual route"`, `"quick fix"`, and `"autopilot signposts"` case-insensitively across `README.md` and `docs/**/*.md` read freshly from disk, plus tracked `skills/**/*.md` via `git ls-files -s skills/` (so untracked vendored `node_modules` never count), splitting on `/\r\n|[\n\r\u2028\u2029]/` and skipping only lines starting with `Old record words:`.
  - Extend `tests/docs-links.test.ts` with mechanical contract checks for guide pages `01` to `12`, retired directory removal, `README.md` having no image, Previous/Next neighbour links, `01-install.md` copyable config validation via `globalSchema` + `harnessArgv` (rejecting `<...>` placeholders, multi-CLI primary configs, invalid claude settings, or missing `agy` optional block), and `where-things-go.md` folder names.
  - Update the moved-doc paths in `tests/rollback.test.ts` (`../docs/reference/roll-back-a-release.md`) and `tests/watch-timer.test.ts` (`docs/guide/11-while-you-are-away.md`, all three sites) without altering any content assertion.
  - Commit all test edits in `plan.synthesis` with `Test-Change:` trailers so `implement` edits docs only and leaves frozen tests untouched.
- **D8 (Pictures boundary)**: Keep all existing SVGs in `docs/pictures/` untouched (deletion of old pictures belongs to `away-pictures`), keep existing shelf embeds in `docs/reference/*.md`, drop `README.md`'s old embed and embeds on deleted pages, and add no embed of any picture that does not exist on `main`.

## Read-first paths

- Grounding index & areas: `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md`
- Approved tone & running example (model pages): `docs/guide/04-a-charting-session.md`, `docs/guide/05-signposts.md`, `docs/guide/06-charting-mode.md`, `docs/guide/07-build-route.md`, `docs/guide/08-hand-off.md`
- Live machine harness source (verbatim launch lines only): `/home/ivan/.akrogon/config.yaml`
- Code truth for documented commands/paths/numbers/rules: `src/config.ts`, `src/hc.ts`, `src/init.ts`, `src/install.ts`, `src/seat.ts`, `src/next.ts`, `src/turn.ts`, `src/status.ts`, `src/land.ts`, `src/phase.ts`, `src/park.ts`, `src/pause.ts`, `src/stop.ts`, `src/listen.ts`, `src/akrogon.ts`, `systemd/akrogon.slice`, `systemd/akrogon-land.slice`, `systemd/akrogon-listener.service`
- Skill truth for documented workflows: `skills/init-akrogon/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `skills/watch-issues/scripts/start.ts`, `skills/broadcast-issue/SKILL.md`
- Retired pages (source material for move map & shelf folds): `docs/start/*.md`, `docs/use/*.md`, `docs/examples/*.md`
- Reference shelf & doc tests: `docs/reference/*.md`, `tests/docs-em-dash.test.ts`, `tests/docs-links.test.ts`, `tests/rollback.test.ts`, `tests/watch-timer.test.ts`, `tests/run-permit.test.ts`, `tests/hold-retired.test.ts`, `tests/command-reference.test.ts`

## Needed interfaces (cross-unit contracts)

All Wave 1 units execute in parallel and rely on these locked paths, headings, and link contracts:

1. **Guide file paths and Previous/Next footers** (last non-empty line of each file):
   - `docs/guide/01-install.md`: `Previous: [Docs home](../README.md) · Next: [Set up a repo](02-set-up-a-repo.md)`
   - `docs/guide/02-set-up-a-repo.md`: `Previous: [Install](01-install.md) · Next: [Your three tabs](03-your-three-tabs.md)`
   - `docs/guide/03-your-three-tabs.md`: `Previous: [Set up a repo](02-set-up-a-repo.md) · Next: [A charting session](04-a-charting-session.md)`
   - `docs/guide/04-a-charting-session.md`: `Previous: [Your three tabs](03-your-three-tabs.md) · Next: [Signposts](05-signposts.md)`
   - `docs/guide/05-signposts.md` .. `07-build-route.md`: unchanged (already link `04`/`06`, `05`/`07`, `06`/`08`)
   - `docs/guide/08-hand-off.md`: `Previous: [Build route](07-build-route.md) · Next: [Lifecycle](09-lifecycle.md)`
   - `docs/guide/09-lifecycle.md`: `Previous: [Hand-off](08-hand-off.md) · Next: [Merging](10-merging.md)`
   - `docs/guide/10-merging.md`: `Previous: [Lifecycle](09-lifecycle.md) · Next: [While you are away](11-while-you-are-away.md)`
   - `docs/guide/11-while-you-are-away.md`: `Previous: [Merging](10-merging.md) · Next: [When work stops](12-when-work-stops.md)`
   - `docs/guide/12-when-work-stops.md`: `Previous: [While you are away](11-while-you-are-away.md) · Next: [Docs home](../README.md)`
2. **Locked heading anchors linked across units**:
   - `docs/guide/02-set-up-a-repo.md`: `## Grounding` (`#grounding`) — linked by `docs/reference/words.md`
   - `docs/guide/03-your-three-tabs.md`: `## What runs in each tab` (`#what-runs-in-each-tab`)
   - `docs/guide/09-lifecycle.md`: `## Slot A (the builder)`, `## Slot B (the reviewer)`
   - `docs/guide/11-while-you-are-away.md`: `## What each check does` (required by `tests/watch-timer.test.ts`; MUST NOT contain `akrogon status` inside this section), `## Stop the watch` (`#stop-the-watch`, linked by `docs/reference/skills.md`). Entire file MUST contain `claude`, `codex`, `pi`, `agy` and zero matches of `/cron/i`, `CronCreate|CronList|CronDelete`, `/expir/i`.
   - `docs/guide/12-when-work-stops.md`: `## Failed work` (`#failed-work`), `## Park an issue` (`#park-an-issue`), `## Pause a repository` (`#pause-a-repository`), `## Stop a leaf or a check run` (`#stop-a-leaf-or-a-check-run`) — linked by `docs/reference/words.md`.
   - `docs/reference/files.md`: `## Writing issues by hand` (`#writing-issues-by-hand`), `## Saving records with akrogon sync` (`#saving-records-with-akrogon-sync`) — linked by `docs/README.md` and `docs/reference/words.md`. Keeps `(script)` and `| \`verify-runs.jsonl\` |` row with `` `timeouts` ``, `` `durations` ``, `` `attempt` ``.
   - `docs/reference/roll-back-a-release.md`: keeps `mv -T .next-current current`, `release-hold.yaml`, `writeDeploySuccess` (required by `tests/rollback.test.ts`).
   - `docs/README.md`: `## Guide` (`#guide`), `## Other tools` (`#other-tools`), `## Reference` (`#reference`) — linked by `docs/guide/12-when-work-stops.md`.
3. **01-install.md YAML block contract**:
   - First ` ```yaml ` block: complete copyable `~/.akrogon/config.yaml` with `max_active: 3`, `slots` (`a`, `b`, `consultant` all using `claude`, `claude-opus-5-5`, `high`), `harnesses` (only `claude`, verbatim from `/home/ivan/.akrogon/config.yaml`), `repos: {}`, `prefixes: {}`, no `<...>` placeholders.
   - Second ` ```yaml ` block: optional `harnesses:` block adding `codex`, `agy`, `pi` (and optionally showing `claude` too), each launch line verbatim from `/home/ivan/.akrogon/config.yaml`, no `<...>` placeholders.
   - Example `akrogon config` / `akrogon status` output blocks use ` ```text ` fences so only config blocks use ` ```yaml `.
4. **Running example names (consistent across all units)**:
   - Upstream repo: `acme-core` (prefix `ac`)
   - Product repos: `client-portal` (prefix `cp`) and `partner-hub` (prefix `ph`)
   - Issue & tasks from `08-hand-off.md`: `weekly-client-report` containing `csv-export` and `scheduled-email` (`blocked-by: [csv-export]`, needs `POSTMARK_API_KEY` in `client-portal/.env` and staging send grant for `staging-reports@agency.example`).

## Implementation waves and units

### Wave 1 (3 independent units in parallel; disjoint owned paths, no shared test resource)

- **Unit 1: Setup chapter (`01` to `03`) and charting chapter connectors (`04`, `08`)**
  - Owned paths:
    - `docs/guide/01-install.md` (create)
    - `docs/guide/02-set-up-a-repo.md` (create)
    - `docs/guide/03-your-three-tabs.md` (create)
    - `docs/guide/04-a-charting-session.md` (edit tab section + Previous/Next footer only)
    - `docs/guide/08-hand-off.md` (edit Previous/Next footer only)
  - Criteria covered: C1 (01-03), C3 (01-04 & 08 Previous/Next), C8, C10 (facts for 01-03)
  - Prerequisites: none
  - Shared test resource: none
  - Targeted worker verification: `bun test tests/docs-em-dash.test.ts -t "hold no em dashes|retired-phrase guard checks"` and `bun test tests/docs-links.test.ts -t "install guide copyable machine config"`

- **Unit 2: Lifecycle, merging, overnight watch, and stop/failure chapter (`09` to `12`)**
  - Owned paths:
    - `docs/guide/09-lifecycle.md` (create)
    - `docs/guide/10-merging.md` (create)
    - `docs/guide/11-while-you-are-away.md` (create)
    - `docs/guide/12-when-work-stops.md` (create)
  - Criteria covered: C1 (09-12), C2 (`csv-export` & `scheduled-email`), C3 (09-12 Previous/Next), C6 (`11-while-you-are-away.md` watch-timer contract), C8, C10 (facts for 09-12)
  - Prerequisites: none
  - Shared test resource: none
  - Targeted worker verification: `bun test tests/watch-timer.test.ts -t "docs describe the timer watch|the watch check omits the akrogon status"` and `bun test tests/docs-em-dash.test.ts -t "hold no em dashes"`

- **Unit 3: Reference shelf updates and `roll-back-a-release.md` move**
  - Owned paths:
    - `docs/reference/roll-back-a-release.md` (create from `docs/use/roll-back-a-release.md`, fix relative links/words)
    - `docs/reference/words.md` (rewrite: approved words + guide-to-shelf mapping table, updated links)
    - `docs/reference/where-things-go.md` (rewrite `## Folders`; keep `## Pictures` byte-for-byte unchanged)
    - `docs/reference/files.md` (add `## Writing issues by hand` and `## Saving records with akrogon sync`; approved words; keep `(script)` and `verify-runs.jsonl` row)
    - `docs/reference/skills.md` (approved words; fix link to `../guide/11-while-you-are-away.md#stop-the-watch`)
    - `docs/reference/limits.md` (approved words; fix links to `../guide/06-charting-mode.md`)
    - `docs/reference/config.md` (approved words; update stale `prefixes` note to match `src/config.ts` `repoPrefix`)
    - `docs/reference/checks.md` (audit approved words/links; keep `(script)`)
    - `docs/reference/commands.md` (audit approved words/links; keep exact command table)
    - `docs/reference/releases-and-updates.md` (audit approved words/links)
    - `docs/reference/state-and-phases.md` (audit approved words/links)
  - Criteria covered: C4 (rollback copy), C5, C6 (`roll-back-a-release.md` contract), C8, C10 (shelf facts)
  - Prerequisites: none
  - Shared test resource: none
  - Targeted worker verification: `bun test tests/rollback.test.ts -t "the roll-back page manual steps"` and `bun test tests/command-reference.test.ts` and `bun test tests/docs-links.test.ts -t "where-things-go|files.md documents|seat texts"`

### Wave 2 (1 unit; runs after Wave 1 lands)

- **Unit 4: Front doors (`README.md`, `docs/README.md`) and removal of retired folders**
  - Owned paths:
    - `README.md` (rewrite short front door, no picture embed)
    - `docs/README.md` (rewrite chapter index + Other tools table + Reference shelf)
    - Delete `docs/start/` (5 files), `docs/use/` (14 files), `docs/examples/` (4 files)
  - Criteria covered: C3 (`README.md`, `docs/README.md`, all links resolving), C4 (retired folders removed), C7 (zero retired phrases across repo), C8
  - Prerequisites: Units 1, 2, 3
  - Shared test resource: none
  - Targeted worker verification: `bun test tests/docs-em-dash.test.ts tests/docs-links.test.ts tests/run-permit.test.ts tests/hold-retired.test.ts`

## Affected agent and human documentation checklist

Agent docs:
- `docs/reference-index.md`: unaffected (agent-facing index; `docs/README.md` and `docs/reference/where-things-go.md` both stay at their paths).
- `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`: unaffected (no code paths or commands renamed or removed).

Human docs:
- `README.md`: rewritten as a short front door with chapter list and no picture embed.
- `docs/README.md`: rewritten as the chapter index, "Other tools" table linking shelf pages, and reference shelf.
- `docs/guide/01-install.md`: new install guide (machine checklist, numbered steps, copyable 1-CLI config, optional multi-harness block with `agy`, ends with `akrogon config`).
- `docs/guide/02-set-up-a-repo.md`: new repo setup guide (`acme-core` + `client-portal` + `partner-hub`, numbered `/init-akrogon` walkthrough, grounding, ends with `akrogon status`).
- `docs/guide/03-your-three-tabs.md`: new tabs guide (required repo-named herdr space and `t-`/`c-`/`w-` daily tabs, numbered steps).
- `docs/guide/04-a-charting-session.md`: tab section shrunk to a link to `03-your-three-tabs.md`; Previous footer updated to `03-your-three-tabs.md`.
- `docs/guide/08-hand-off.md`: Next footer updated to `09-lifecycle.md`.
- `docs/guide/09-lifecycle.md`: new lifecycle guide (slot A, slot B, `akrogon next`, wait reasons, start order, session launch, watching from `t-`, following `csv-export` and `scheduled-email`).
- `docs/guide/10-merging.md`: new merging guide (one merge turn per repo, checks on merged result, red back to repair, issue/epic completion, Discord announcements, following `csv-export` and `scheduled-email`).
- `docs/guide/11-while-you-are-away.md`: new overnight watcher guide in `w-`, keeping `## What each check does` and `## Stop the watch`, all four harnesses, no cron/expir wording, following `client-portal`.
- `docs/guide/12-when-work-stops.md`: new failure/control guide (failed `scheduled-email` recovery, park/pause/stop/`stop-run`/`leftovers`, link to shelf for other tools).
- `docs/reference/roll-back-a-release.md`: moved from `docs/use/roll-back-a-release.md`, relative links updated, rollback proof strings preserved.
- `docs/reference/words.md`: rewritten with approved words and guide-word-to-shelf-word mapping table.
- `docs/reference/where-things-go.md`: `## Folders` updated for `docs/guide/` and retired folders removed; `## Pictures` kept unchanged.
- `docs/reference/files.md`: adds shelf sections for hand-written issues and `akrogon sync` record saving; keeps `(script)` and `verify-runs.jsonl` row.
- `docs/reference/skills.md`: approved words; updates watch link to `../guide/11-while-you-are-away.md#stop-the-watch`.
- `docs/reference/limits.md`: approved words; updates autopilot links to `../guide/06-charting-mode.md`.
- `docs/reference/config.md`: approved words; updates `prefixes` description to match live `repoPrefix` enforcement.
- `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/releases-and-updates.md`, `docs/reference/state-and-phases.md`: audited for approved words and valid links.
- `docs/start/install.md`, `docs/start/one-change.md`, `docs/start/set-up-a-project.md`, `docs/start/what-it-is.md`, `docs/start/why-it-works.md`: deleted (mapped in report move map).
- `docs/use/a-working-day.md`, `docs/use/autopilot.md`, `docs/use/learn-from-work.md`, `docs/use/merge-and-announce.md`, `docs/use/park-pause-stop.md`, `docs/use/plan-work.md`, `docs/use/quick-fix.md`, `docs/use/report-an-observation.md`, `docs/use/roll-back-a-release.md`, `docs/use/run-work.md`, `docs/use/save-records.md`, `docs/use/watch-while-away.md`, `docs/use/when-work-fails.md`, `docs/use/write-issues-by-hand.md`: deleted (mapped in report move map).
- `docs/examples/README.md`, `docs/examples/autopilot-story.md`, `docs/examples/quick-fix-story.md`, `docs/examples/recovery-story.md`: deleted (mapped in report move map).

## Done-criteria verification map, condition checks, and planning red runs

No slow or paid model stages exist in this leaf; all automated proof commands run locally in seconds.

### Criterion 1: Pages 01-03 and 09-12 exist with content in What; 01-03 numbered steps with command + expected result; 01 copyable 1-CLI config + optional harnesses with `agy` + `akrogon config`; 02 walks `/init-akrogon` on `client-portal` + `akrogon status`
- **Real boundary**: Repository filesystem + `src/config.ts` (`globalSchema`) + `src/seat.ts` (`harnessArgv`) parsing `docs/guide/01-install.md`'s fenced YAML blocks; slot B + cold-reader Q1-Q7 for prose content/steps.
- **State before -> after**: Before: `docs/guide/01`..`03` and `09`..`12` do not exist. After: all 7 pages exist, `01-install.md`'s primary YAML passes `globalSchema` + `harnessArgv` with 1 harness and zero `<...>` placeholders, and its optional harnesses YAML defines `agy` and valid harness lines.
- **Product failure caught**: Missing guide page, broken/unparseable copyable `~/.akrogon/config.yaml`, leftover `<model>` placeholder, multi-CLI primary config, broken `--settings` JSON on `claude`, or missing `agy` harness template.
- **Proof test & command**: `tests/docs-links.test.ts` (`guide pages 01 to 12 exist...`, `install guide copyable machine config...`, `install config validator rejects...`) via `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`.
- **Size**: seconds (< 1 s). **Rerun trigger**: any edit to `docs/guide/01`..`03`, `09`..`12`, `src/config.ts`, `src/seat.ts`, or `tests/docs-links.test.ts`.
- **Model-choice reading**: The prose depth, tone, numbered-step clarity, `acme-core`/`client-portal`/`partner-hub` walkthrough, and coverage of `What` bullets are judged by slot B reading `docs/guide/01`..`03`, `09`..`12` and cold-reader answers (Q1-Q7) in `review-B.md`; automated tests do not assert prose wording.
- **Condition checks**:
  - **C1-placeholder** (D2): `globalSchema` (`src/config.ts:11-15`) accepts `<model>` because `seat` only bans quotes. `validateInstallConfigMarkdown` explicitly checks `/<[^>\n]+>/` on both YAML blocks.
    - Temp violation red output: disabling the placeholder check in `validateInstallConfigMarkdown` turned `install config validator rejects...` red (`Expected to contain: "primary machine config contains angle-bracket placeholder", Received: []`): `check plan-cond-c1-placeholder: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-cond-c1-placeholder-1795787874371-1058217.log`.
  - **C1-single-cli / C1-claude-settings / C1-optional-agy** (D2): checked in the same unit test (`tests/docs-links.test.ts:450-490`) verifying rejection of 2-harness primary configs, malformed `claude --settings`, and missing `agy` in the optional block.
- **Planned red output at `plan.synthesis`**:
  - `check plan-docs-links: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-docs-links-1795787850133-1056433.log`
  - Excerpt: `(fail) guide pages 01 to 12 exist...` (`missing docs/guide/01-install.md`) and `(fail) install guide copyable machine config...` (`ENOENT ... docs/guide/01-install.md`).

### Criterion 2: Pages 09 to 12 carry the `csv-export` and `scheduled-email` example from page 08
- **Model-choice reading**: Narrative continuity of `client-portal`'s `csv-export` and `scheduled-email` across `09-lifecycle.md`, `10-merging.md`, `11-while-you-are-away.md`, and `12-when-work-stops.md` is reviewed by slot B reading `docs/guide/08-hand-off.md` through `12-when-work-stops.md`, with section references listed in `implementation/report.md`. No brittle prose-grep test is added.

### Criterion 3: `README.md` and `docs/README.md` match What; every guide page's previous/next line names its neighbours; every link in `README.md` and `docs/` resolves
- **Real boundary**: `tests/docs-links.test.ts` scanning `README.md`, every `docs/**/*.md`, and tracked `skills/**/*.md` on disk, plus guide footer link inspection and `README.md` prose image check.
- **State before -> after**: Before: `README.md` embeds `docs/pictures/factory-overview.svg` and links `docs/use/*`; `docs/README.md` links `start/*`, `use/*`, `examples/*`; `04` and `08` footers link `../README.md` instead of `03` and `09`. After: all links and heading anchors resolve, `README.md` carries no image in prose, and every guide `01`..`12` footer links its adjacent neighbour(s).
- **Product failure caught**: Broken relative links or heading anchors, stale neighbour footers on `04`/`08` or new pages, or an unapproved picture embed left in `README.md`.
- **Proof test & command**: `tests/docs-links.test.ts` (`README, docs and skill links resolve...`, `guide pages 01 to 12 exist...`, `every guide page previous/next line links its neighbours`) via `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`.
- **Size**: seconds (< 1 s). **Rerun trigger**: any edit to `README.md`, `docs/**/*.md`, or `skills/**/*.md`.
- **Model-choice reading**: `README.md` framing (what Akrogon is, who it fits, at most two sentences of soft selling) and `docs/README.md` "Other tools" table clarity are judged by slot B reading both files.
- **Planned red output at `plan.synthesis`**:
  - `check plan-docs-links: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-docs-links-1795787850133-1056433.log` (`(fail) every guide page previous/next line links its neighbours`: `ENOENT ... 01-install.md`, plus `README.md` currently embeds `factory-overview.svg`).

### Criterion 4: `docs/start`, `docs/use`, and `docs/examples` no longer exist; report holds a move map from every retired page checked by slot B
- **Real boundary**: Repository filesystem check (`!existsSync` on `docs/start`, `docs/use`, `docs/examples`) + `tests/docs-links.test.ts` ensuring zero dangling inbound links; 23-row move map in `implementation/report.md` checked by slot B.
- **State before -> after**: Before: 5 files in `docs/start/`, 14 in `docs/use/`, 4 in `docs/examples/`. After: all three folders are removed, `docs/reference/roll-back-a-release.md` exists, and all inbound links resolve.
- **Product failure caught**: Leftover retired folder/files or broken links to deleted pages.
- **Proof test & command**: `tests/docs-links.test.ts` (`guide pages 01 to 12 exist, retired folders are gone...` and `README, docs and skill links resolve...`) via `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`.
- **Size**: seconds (< 1 s). **Rerun trigger**: any add/delete under `docs/`.
- **Record / review part**: `implementation/report.md` lists all 23 retired pages and the destination page(s) holding their facts; slot B verifies each row.
- **Planned red output at `plan.synthesis`**:
  - `check plan-docs-links: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-docs-links-1795787850133-1056433.log` (fails on missing new pages / existing retired directories).

### Criterion 5: `docs/reference/words.md` defines approved words and maps guide words to shelf words; `docs/reference/where-things-go.md` describes new folders and keeps picture-style lines unchanged
- **Real boundary**: `tests/docs-links.test.ts` (`where-things-go describes docs/guide and drops retired folders` + link resolution on `words.md` and `where-things-go.md`) + `git diff "$AKROGON_BASE"...HEAD -- docs/reference/where-things-go.md` confirming `## Pictures` lines are untouched.
- **State before -> after**: Before: `where-things-go.md` lists `docs/start/`, `docs/use/`, `docs/examples/` and omits `docs/guide/`; `words.md` links `../start/*` and `../use/*` and has no guide-to-shelf mapping table. After: `where-things-go.md` lists `docs/guide/` with zero retired folder refs and untouched `## Pictures`; `words.md` defines approved terms and maps guide words to shelf words with valid links.
- **Product failure caught**: Stale folder references in `where-things-go.md`, accidental edits to `## Pictures` (which would collide with `charting-pictures-more`), or broken links in `words.md`.
- **Proof test & command**:
  - `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`
  - `akrogon run-check --name where-things-go-diff -- git diff "$AKROGON_BASE"...HEAD -- docs/reference/where-things-go.md` (recorded in `implementation/report.md` to prove `## Pictures` lines 26-36 untouched)
- **Size**: seconds (< 1 s). **Rerun trigger**: any edit to `docs/reference/words.md` or `docs/reference/where-things-go.md`.
- **Model-choice reading**: Completeness and accuracy of `words.md` definitions and guide-to-shelf mappings are judged by slot B. (We intentionally avoid hardcoding `## Pictures` lines in a committed test so downstream `charting-pictures-more` can update the Mark rule cleanly.)
- **Planned red output at `plan.synthesis`**:
  - `check plan-docs-links: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-docs-links-1795787850133-1056433.log` (`(fail) where-things-go describes docs/guide and drops retired folders`: `Expected to contain: "docs/guide/"`).

### Criterion 6: Moved-doc tests read new paths and check the same content (`tests/rollback.test.ts`, `tests/watch-timer.test.ts`), and `run-permit` / `hold-retired` sweeps pass
- **Real boundary**: Real CLI/doc tests in `tests/rollback.test.ts`, `tests/watch-timer.test.ts`, `tests/run-permit.test.ts`, and `tests/hold-retired.test.ts` reading files from disk.
- **State before -> after**: Before: `tests/rollback.test.ts:140` read `../docs/use/roll-back-a-release.md`; `tests/watch-timer.test.ts:1370,1393,1402` read `docs/use/watch-while-away.md`. After: they read `../docs/reference/roll-back-a-release.md` and `docs/guide/11-while-you-are-away.md` with every assertion intact, and both sweeps pass across all new/updated docs.
- **Product failure caught**: Moved docs losing required rollback commands (`mv -T .next-current current`, `release-hold.yaml`, `writeDeploySuccess`), `11-while-you-are-away.md` missing `## What each check does` or any of the four harnesses (`claude`, `codex`, `pi`, `agy`), reintroducing `cron`/`expir` or `akrogon status` inside `## What each check does`, or reintroducing `run permit` / `hold-fix` / `unhold` / `--red-on-base` / `held.yaml`.
- **Proof tests & commands**:
  - `akrogon run-check --name rollback-doc -- bun test tests/rollback.test.ts`
  - `akrogon run-check --name watch-timer-docs -- bun test tests/watch-timer.test.ts -t "docs describe the timer watch|the watch check omits the akrogon status"` (full `tests/watch-timer.test.ts` runs in configured `checks.test`)
  - `akrogon run-check --name run-permit-sweep -- bun test tests/run-permit.test.ts -t "docs describe the start check"`
  - `akrogon run-check --name hold-retired-sweep -- bun test tests/hold-retired.test.ts -t "sweep:"`
- **Size**: seconds (< 10 s). **Rerun trigger**: any edit to `docs/reference/roll-back-a-release.md`, `docs/guide/11-while-you-are-away.md`, `README.md`, `docs/**/*.md`, or the four test files.
- **Planned red outputs at `plan.synthesis`**:
  - `check plan-rollback-doc: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-rollback-doc-1795787850483-1056548.log` (`ENOENT ... docs/reference/roll-back-a-release.md`)
  - `check plan-watch-timer-docs: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-watch-timer-docs-1795787850627-1056798.log` (`ENOENT ... docs/guide/11-while-you-are-away.md` in both tests)

### Criterion 7: Guard test from `charting-fixes` (`tests/docs-em-dash.test.ts`) fails on retired phrases case-insensitively across `README.md`, `docs/**/*.md` on disk, and tracked `skills/**/*.md` (`git ls-files`), exempting lines starting with `Old record words:`; report shows one deliberate break turning it red
- **Real boundary**: `tests/docs-em-dash.test.ts` scanning the real repo (`README.md`, `docs/**/*.md` from disk, `git ls-files -s skills/` for tracked skill Markdown) plus a temp git repo test exercising all conditions in one process.
- **State before -> after**: Before: `tests/docs-em-dash.test.ts` checked em dashes only, and `README.md`/`docs/README.md`/`docs/start/*`/`docs/use/*`/`docs/examples/*` contained 14 lines with `"Quick fix"`. After: `tests/docs-em-dash.test.ts` enforces zero retired phrases across the whole scope and passes green; `implementation/report.md` records one deliberate break turning it red and then reverted.
- **Product failure caught**: Reintroduction of `"manual mode"`, `"manual route"`, `"quick fix"`, or `"autopilot signposts"` (any casing) in README, any doc (including newly added files), or any tracked skill file outside `Old record words:`, or false positives from untracked `skills/*/node_modules`.
- **Proof test & command**: `tests/docs-em-dash.test.ts` via `akrogon run-check --name docs-em-dash -- bun test tests/docs-em-dash.test.ts` (plus one deliberate temporary break run recorded in `implementation/report.md`).
- **Size**: seconds (< 1 s). **Rerun trigger**: any edit to `README.md`, `docs/**/*.md`, `docs/pictures/*.svg`, `skills/**/*.md`, or `tests/docs-em-dash.test.ts`.
- **Condition checks (D7)**:
  - **C7-vendored**: `trackedSkillMarkdown` uses `git ls-files -s skills/` so untracked `skills/demo/node_modules/pkg/README.md` containing all four phrases is ignored while tracked `skills/demo/SKILL.md` is scanned.
    - Temp violation red output (switching skill scan to `readdirSync`): failed flagging `skills/demo/node_modules/pkg/README.md:1: Quick fix and manual mode and manual route and autopilot signposts`: `check plan-cond-c7-vendored: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-cond-c7-vendored-1795787873920-1057890.log`.
  - **C7-prefix**: exemption uses `line.startsWith('Old record words:')`, never substring `.includes(...)`.
    - Temp violation red output (switching to `.includes`): failed missing `docs/nested/page.md:1: Note: Old record words: manual mode`: `check plan-cond-c7-prefix: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-cond-c7-prefix-1795787874012-1057971.log`.
  - **C7-linesplit**: splits on `LINE_SPLIT` (`/\r\n|[\n\r\u2028\u2029]/`), not `\n` alone, so `Old record words: autopilot signposts\rquick fix\n` still catches line 2.
    - Temp violation red output (switching to `.split('\n')`): failed missing `docs/nested/page.md:2: quick fix`: `check plan-cond-c7-linesplit: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-cond-c7-linesplit-1795787874119-1058056.log`.
  - **C7-case**: regex uses `/i` so mixed/uppercase variants (`Quick Fix`, `MANUAL MODE`, `Manual Route`, `Autopilot Signposts`) are caught.
    - Temp violation red output (removing `/i`): failed missing `README.md:1: Try a Quick Fix today.`: `check plan-cond-c7-case: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-cond-c7-case-1795787874220-1058139.log`.
  - **C7-fresh-disk**: `collectRetiredPhraseFiles` holds no cache and calls `readdirSync`/`readFileSync` freshly on every invocation; proven in-process by writing `docs/fresh/added.md` after a clean call in the same test (`tests/docs-em-dash.test.ts:212-218`).
- **Planned red output at `plan.synthesis`**:
  - `check plan-docs-em-dash: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-plan-docs-em-dash-1795787849968-1056342.log`
  - Excerpt: `(fail) README, docs markdown and tracked skills markdown hold no retired phrases` (caught 14 hits across `README.md`, `docs/README.md`, `docs/examples/*`, `docs/start/what-it-is.md`, `docs/use/*`; zero hits in `skills/` where `skills/chart-issues/SKILL.md:128` is exempted by `Old record words:`).

### Criterion 8: No em dash and no partial consultant example on any page this leaf writes
- **Real boundary**: `tests/docs-em-dash.test.ts` (em-dash guard across `README.md`, `docs/**/*.md`, `docs/pictures/*.svg` on disk) + grep audit in `implementation/report.md` for every `consultant` mention on edited/added pages confirming any consultant-launch example names slot, harness, model, and effort.
- **State before -> after**: Before: em-dash guard passes on base; new pages not yet written. After: em-dash guard passes on all new and edited pages, and zero partial consultant examples exist.
- **Product failure caught**: Em dash (`—`, `&mdash;`, `&#8212;`, `&#x2014;`) leaking into docs, or a partial consultant prompt like "Use two consultants" omitting slot/harness/model/effort.
- **Proof test & command**:
  - `akrogon run-check --name docs-em-dash -- bun test tests/docs-em-dash.test.ts`
  - `akrogon run-check --name consultant-audit -- git grep -in "consultant" -- README.md docs/` (inspected by A in `implementation/report.md` and read by slot B).
- **Size**: seconds (< 1 s). **Rerun trigger**: any edit to `README.md`, `docs/**/*.md`, or `docs/pictures/*.svg`.

### Criterion 9: Cold-reader subagent check in slot B's review
- **Model-choice / review-owned criterion**: No automated test or score stands in for this. During `check.review`, slot B spawns a fresh subagent given ONLY `README.md` and `docs/guide/01` to `12`, asks all 8 questions in `design.md` `## Cold-reader questions`, and records every answer with its quoted line in `review-B.md`. Any wrong or unsupported answer is a Fix.

### Criterion 10: Every command, path, number, and always/never/only rule on new pages matches `src/`, `skills/`, or `/home/ivan/.akrogon/config.yaml`; tone is slot B's reading
- **Record & verification boundary**: `implementation/report.md` holds a complete verification table listing every command, path, number, and always/never/only rule introduced on the new pages (`01`..`03`, `09`..`12`) and edited shelf pages with its exact supporting path in `src/`, `skills/`, or `/home/ivan/.akrogon/config.yaml` (harness launch lines checked verbatim against `/home/ivan/.akrogon/config.yaml`).
- **Model-choice reading**: Tone (no marketing jargon, no unexplained developer jargon, matching `04` to `08`) is slot B's reading of `README.md` and `docs/guide/01`..`12`, recorded with its reason in `review-B.md`.

### Criterion 11: Destination's `checks` pass
- **Real boundary**: Configured `checks` from `akrogon config` (`format`, `typecheck`, `test`) executed via `akrogon verify` on the committed leaf head at implement end.
- **State before -> after**: Before: planned tests are red on unchanged docs. After: `format`, `typecheck`, and `test` (including 5x `--rerun-each=5` on changed `tests/*.test.ts`) all pass green with a `leaf` verify receipt for HEAD.
- **Product failure caught**: Formatting drift, TypeScript errors, broken links/contracts, or regressions in any test file.
- **Proof command**: `akrogon verify` (which runs `format`, `typecheck`, and `test` on a detached fresh checkout and writes the green `leaf` receipt).
- **Size**: minutes (~1-3 min). **Rerun trigger**: final committed head before `check.review`.

## Open limitations

- `README.md` intentionally carries no hero picture and `01`..`03`, `09`..`12` carry no new section pictures until downstream leaves (`setup-pictures`, `build-pictures`, `away-pictures`) draw and embed them.
- Existing old SVGs in `docs/pictures/` remain on disk (and shelf embeds in `docs/reference/*.md` remain) until `away-pictures` removes obsolete SVGs and updates shelf embeds.
- Per `learnings/LESSONS.md` (2026-11-27), when an `agy` seat runs `akrogon verify`, `<home>/tool-entry` on `PATH` can cause `tests/tool-entry.test.ts:141` to fail while `main` holds a green non-agy receipt; if encountered with no cause in this leaf's diff, follow the retry / `--known-red` rule in `skills/lifecycle-rules.md`.
