# Brief 1: Setup chapter (01-03) and charting connectors (04, 08)

## 1. Goal

Write the setup chapter (`docs/guide/01-install.md`, `02-set-up-a-repo.md`, `03-your-three-tabs.md`) and update `docs/guide/04-a-charting-session.md` and `docs/guide/08-hand-off.md` to link into the 12-page guide, implementing plan decisions **D1**, **D2**, **D3**, **D4**, and **D8**.

## 2. Numbered acceptance criteria

1. `docs/guide/01-install.md` exists in the tone and depth of `docs/guide/04-a-charting-session.md` to `08-hand-off.md`:
   - Opens with a machine prerequisites check list (Linux desktop with `systemctl --user`, Bun, Git, `flock`, `herdr-core` / `hc`, `herdr-app`, one agent CLI, optional `gh`), each with its command and what a ready machine prints.
   - Continues with numbered steps (each giving its command and expected result) from cloning Akrogon (`https://github.com/Tamdoma/akrogon.git`) to checking `akrogon config`.
   - First ` ```yaml ` block is a full copyable `~/.akrogon/config.yaml` that works with one agent CLI (`claude`), real slot values (`claude-opus-5-5`, `high` for `a`, `b`, `consultant`), `max_active: 3`, `repos: {}`, `prefixes: {}`, zero `<...>` placeholders, and the verbatim `claude` launch line from `/home/ivan/.akrogon/config.yaml`.
   - Second ` ```yaml ` block is an optional harnesses block adding `codex`, `agy`, and `pi` using their verbatim launch lines from `/home/ivan/.akrogon/config.yaml`, with zero `<...>` placeholders.
   - States plainly that you install Akrogon once per machine (not per project) and it serves every registered repository.
   - Ends with `Previous: [Docs home](../README.md) · Next: [Set up a repo](02-set-up-a-repo.md)` and links `../reference/releases-and-updates.md` and `../reference/roll-back-a-release.md`.
2. `docs/guide/02-set-up-a-repo.md` exists:
   - Shows one Akrogon install serving a made-up upstream repo (`acme-core`, prefix `ac`) and two product repos built on it (`client-portal`, prefix `cp`, and `partner-hub`, prefix `ph`) in one `~/.akrogon/config.yaml`, naming no real or private repo from `/home/ivan/.akrogon/config.yaml`.
   - Gives numbered steps (each with command and expected result) walking `/init-akrogon` on `client-portal`, showing every file `akrogon init` writes (`issues/config.yaml`, `issues/open/`, `learnings/LESSONS.md`, `.gitignore`, `.gitattributes`, `repos` entry in `~/.akrogon/config.yaml`), adding `client-portal: cp` under `prefixes:` in `~/.akrogon/config.yaml` (required by `repoPrefix` in `src/config.ts` / `src/seat.ts` / `src/next.ts`), and ending by checking `akrogon status` showing `client-portal`.
   - Has a `## Grounding` section explaining `grounding.index`, `docs/reference-index.md`, `AREA.md` (max 40 lines, four sections: Commands, Key files, Non-obvious patterns, See also), and `grounding: none`.
   - Ends with `Previous: [Install](01-install.md) · Next: [Your three tabs](03-your-three-tabs.md)`.
3. `docs/guide/03-your-three-tabs.md` exists:
   - Gives numbered steps (each with command/action and expected result) for creating the **required** herdr space named after the registered repo (`client-portal`, matched by `src/hc.ts` `resolveSpace`) and the three daily tabs (`t-client-portal`, `c-client-portal`, `w-client-portal`), noting explicitly that the space name is required while the `t-`/`c-`/`w-` tab names are your convention, not enforced by code.
   - Has `## What runs in each tab` clearly answering cold-reader Q3: `t-`: `akrogon status` and `akrogon next`; `c-`: the charting agent (`/chart-issues`); `w-`: the watcher (`watch-issues <root>`).
   - Ends with `Previous: [Set up a repo](02-set-up-a-repo.md) · Next: [A charting session](04-a-charting-session.md)`.
4. `docs/guide/04-a-charting-session.md` shrinks `## Where you chart: the c- tab` to a short 1-2 sentence link to `[Your three tabs](03-your-three-tabs.md)` and updates its footer to `Previous: [Your three tabs](03-your-three-tabs.md) · Next: [Signposts](05-signposts.md)`.
5. `docs/guide/08-hand-off.md` updates its footer to `Previous: [Build route](07-build-route.md) · Next: [Lifecycle](09-lifecycle.md)`.
6. Zero em dashes (`—`, `&mdash;`, `&#8212;`, `&#x2014;`), zero retired phrases (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`), zero partial consultant examples, zero marketing jargon, zero unexplained developer jargon, zero embeds of pictures not on `main`.
7. Planned tests passing on this unit: `tests/docs-em-dash.test.ts` (em-dash check) and `tests/docs-links.test.ts` (`install guide copyable machine config` and `install config validator`).

## 3. Read-first list

- Model tone/structure: `docs/guide/04-a-charting-session.md`, `docs/guide/08-hand-off.md`
- Retired source material (facts only; do not link): `docs/start/install.md`, `docs/start/set-up-a-project.md`
- Live code truth: `src/config.ts`, `src/install.ts`, `src/init.ts`, `src/hc.ts` (`resolveSpace`), `src/status.ts`, `systemd/akrogon.slice`, `systemd/akrogon-land.slice`, `systemd/akrogon-listener.service`, `skills/init-akrogon/SKILL.md`
- Guard/test contract: `tests/docs-links.test.ts` (`validateInstallConfigMarkdown`)
- Hygiene guide: `/home/ivan/.gemini/config/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- **Prerequisites**: none (Wave 1).
- **Shared test resource / consumed output**: none.
- **Worker worktree creation commit**: `775b8b436641885f70340f1c40bbd89dac1cb46c`
- **Owned paths (edit ONLY these)**:
  - `docs/guide/01-install.md` (create)
  - `docs/guide/02-set-up-a-repo.md` (create)
  - `docs/guide/03-your-three-tabs.md` (create)
  - `docs/guide/04-a-charting-session.md` (edit tab section + footer only)
  - `docs/guide/08-hand-off.md` (edit footer only)
- **Verbatim harness launch lines from `/home/ivan/.akrogon/config.yaml`** (copy EXACTLY; do not alter flags or quotes):
  - `claude`: `"claude --model {model} --effort {effort} --settings '{\"env\":{\"CLAUDE_CODE_SUBAGENT_MODEL\":\"{model}\",\"CLAUDE_CODE_SUBAGENT_MODEL_FORCE\":\"1\"}}' --dangerously-skip-permissions"`
  - `codex`: `"codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access"`
  - `agy`: `"agy --model {model} --effort {effort} --mode auto"`
  - `pi`: `"pi --model {model} --thinking {effort} -a --exclude-tools request_user_input"`
- **YAML block rule for `01-install.md`**:
  - Use ` ```yaml ` ONLY for the primary copyable config block (block 0) and the optional harnesses block (block 1). Use ` ```text ` for expected `akrogon config` / `akrogon status` output snippets.
- **Required headings for cross-unit links**:
  - `02-set-up-a-repo.md`: `## Grounding` (`#grounding`)
  - `03-your-three-tabs.md`: `## What runs in each tab` (`#what-runs-in-each-tab`)
- **Cold-reader questions these pages must answer directly and quotably**:
  - Q1: "Do I install Akrogon once per project?" -> No. Once per machine, and it serves every registered repo.
  - Q2: "List the commands, in order, from a fresh machine to your first `akrogon status`." -> The ordered numbered commands in `01` and `02`.
  - Q3: "What runs in each of the three tabs?" -> `t-`: `akrogon status` and `akrogon next`. `c-`: the charting agent. `w-`: the watcher.

## 5. Do-not, reasons and exceptions

- Do NOT write or edit any test file (`tests/*`) or any file outside your 5 owned paths; return a mismatch with evidence to A if a planned test contradicts the brief. Exception: a revised brief from A.
- Do NOT use any em dash (`—`) or retired phrase (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`), or include any real/private repo from `/home/ivan/.akrogon/config.yaml` (`framework`, `mdcny-ghl-data-pulls`, `boulevard-automation`, `clinique-la-roya`, `lens`, `Himne`, `lingua-relay`, `blepsis`, `varhop`, `herdr-setup`), or add any image embed. Reason: brief criteria 1, 7, 8 and design D8/R10. Exception: none.
- Do NOT edit `issues/` files inside the worktree. Reason: `akrogon phase` rejects leaf commits touching `issues/`. Exception: none.
- **Standing git stash exclusion**: Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree instead. To set work aside, commit a WIP commit and before returning run `git reset --soft 775b8b436641885f70340f1c40bbd89dac1cb46c` and make the unit's single returned commit. Exception: none.
- **Standing unattended commands exclusion**: Write no command that waits on a human (no prompt, confirmation, editor, pager); write no poll or sleep loop; run slow commands once in the foreground waiting on exit; re-express harness denials inside the same grant/identity or return a mismatch verbatim if no formulation answers; name no env file path on a command line. Reason: no human answers a seat's command, and a worker reads only its brief. Exception: none.
- **No pattern kills**: Never run `pkill -f`, `killall`, or `pgrep | xargs kill`; stop a run only with `akrogon stop-run <run-id>`. Reason: pattern kills cross leaves. Exception: none.

Reasons and exceptions restated: scope/test/doc exclusions protect parallel waves, frozen tests, and reader clarity (exception only via revised brief from A); stash, unattended-command, and pattern-kill rules protect sibling workers and unattended execution with no exceptions.

## 6. Ordered steps

1. Read the read-first files inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u1` (advisory size: 5 files, ~20 turns).
2. Create `docs/guide/01-install.md` satisfying criteria 1 and 6.
3. Create `docs/guide/02-set-up-a-repo.md` satisfying criteria 2 and 6.
4. Create `docs/guide/03-your-three-tabs.md` satisfying criteria 3 and 6.
5. Edit `docs/guide/04-a-charting-session.md` (shrink tab section to link to `03-your-three-tabs.md`; update footer) and `docs/guide/08-hand-off.md` (update footer to `09-lifecycle.md`) satisfying criteria 4, 5, and 6.
6. Run Section 7 commands inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u1` through `akrogon run-check`.
7. Stage ONLY your 5 owned files and make one commit on detached HEAD; verify `git status --porcelain` is empty.

## 7. Commands

Run inside `/home/ivan/.akrogon/worktrees/akrogon/guide-chapters-u1`:
```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'
akrogon run-check --name u1-em-dash -- bun test tests/docs-em-dash.test.ts -t "hold no em dashes|retired-phrase guard checks"
akrogon run-check --name u1-install-config -- bun test tests/docs-links.test.ts -t "install guide copyable machine config|install config validator"
```
(Do NOT run `akrogon verify` or full `docs-links.test.ts`, which expects Units 2–4 to have landed.)

## 8. Done-when, evidence and report

Done when all 5 owned files are committed cleanly in one commit, both targeted `run-check` commands exit 0 (cite their `check <label>: <exit> <path>` lines), and your return includes:
1. The returned commit SHA.
2. A compact fact table listing every command, path, number, and always/never/only rule in `01`–`03` with its supporting path (`src/...`, `skills/...`, or `/home/ivan/.akrogon/config.yaml`).
3. The four fill-in lines below:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
