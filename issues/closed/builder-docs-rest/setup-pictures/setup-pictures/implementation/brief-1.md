# Brief 1: setup-pictures unit U1

## 1. Goal

Draw one picture for each `##` section of `docs/guide/01-install.md` in the style of `docs/pictures/charting-session.svg`, each holding the shared "created by" mark group, and embed each under its section with plain alt text. Plan decisions D1, D2, D3, D4, D6, D7 (and D5 for U3).

## 2. Numbered acceptance criteria

1. `docs/pictures/machine-check.svg` under `## Check your machine`: a checklist card, one row per prerequisite with its check command and what a ready machine prints: Linux with a systemd user manager (`systemctl --user is-system-running`, running or degraded), Bun (`bun --version`), Git, `flock`, `herdr-core` (`hc --version`), `herdr-app`, one agent CLI (`claude`, `codex`, `agy` or `pi`); GitHub CLI (`gh auth status`) marked optional.
2. `docs/pictures/install-steps.svg` under `## Install step by step`: five numbered steps left to right: clone into `~/code/akrogon`, write `~/.akrogon/config.yaml`, `bun install` and `bun src/akrogon.ts install`, `~/.local/bin` on `PATH`, `akrogon config` ends `repo: none`. Under step 3, what install creates: `~/.akrogon/current`, `~/.local/bin/akrogon`, skill folders for every agent CLI, systemd units with `akrogon-listener.service`.
3. `docs/pictures/agent-clis.svg` under `## Optional: add more agent CLIs`: `~/.akrogon/config.yaml` with `harnesses:` claude, codex, agy, pi; `slots:` a (slot A, the builder), b (slot B, the reviewer), consultant, each pointing at one harness, for example a to claude, b to codex, consultant to pi; note: every harness a slot names needs a line under `harnesses:`.
4. `docs/pictures/updates-and-rollback.svg` under `## Updates and rollback`: your checkout registered as repository `akrogon`; a merged update builds `~/.akrogon/releases/<commit>`; `~/.akrogon/current` switches to it; `akrogon rollback` points `current` back at the previous release.

5. Each new SVG holds exactly one mark group, identical to the one in `docs/pictures/mode-and-route.svg` apart from its outer translate, containing `<title>Tamdoma</title>` and `created by`; none holds `href`, `<script`, `@import`, `@font-face`, `animation`, `<animate` or an em dash.
6. Each render on a white page reads: labels inside their boxes, nothing clipped or overlapping, the mark at the bottom right on the text line.
7. Planned tests (A's, committed f629638f; you run them, never edit them): `tests/docs-pictures.test.ts` cases "every section of guide pages 01 to 03 has a picture with alt text" and "every picture on guide pages 01 to 03 holds the charting pictures mark group and no outside or moving markup", plus `tests/docs-links.test.ts` and `tests/docs-em-dash.test.ts`.

Binding style (plan D1, D2, D3, D6, D7), copied from plan.md:

- D1 Mark group: copy the mark group whole from `docs/pictures/mode-and-route.svg`: the outer `<g transform="translate(838 Y)"><title>Tamdoma</title>`, the `created by` text with its inline style, the inner logo group `<g transform="translate(8 -14) scale(0.05)" fill="#0f0f0f">` with all eight `<path>` elements, and both closing `</g>`. Change only the outer translate: X is 838 on a 960 px card, Y is the card height minus 22. Copy it byte for byte (for example with a script that extracts it), never retype it.
- D2 Drawing style: copy the `<svg>` root attributes (`viewBox`, `width`, `height`, `role="img" aria-labelledby="t d"`), `<title id="t">`, `<desc id="d">`, the `<style>` block, the `<defs>` arrow marker and the card `<rect>` from `docs/pictures/charting-session.svg`. Width 960, height as the content needs (about 300 to 480); the card rect is `width-1.5` by `height-1.5` at 0.75. Heading at (40, 48) class `h`, one `soft` subtitle at (40, 72). Commands, paths and config keys in class `mono`. Use the existing classes (`box`, `key` for the highlighted item, `link` dashed sage connectors, `line`, `frame`, `arrow`). The file must contain no `href`, no `<script`, no `@import`, no `@font-face`, no `animation`, no `<animate` and no em dash (U+2014 or its entities). Text stays as `<text>`, never paths.
- D3 Words: labels and alt text use the page's own words and these approved names: slot A (the builder), slot B (the reviewer), consultant, task, repository, space, tab, Charting mode, Build route, Direct, Lifecycle, watcher. Never: manual, quick fix, seat, door, leaf, attended, autopilot signposts. Copy every command and path exactly from the page. Draw nothing the page does not say.
- D6 Embeds: one line `![<alt>](../pictures/<file>.svg)` per section with a blank line each side, placed after the section's first paragraph, or after the first block (table, list, code block) that paragraph introduces. A section whose first child is a `###` step gets the embed directly after its intro line before the first `###` (or directly under the `##` heading when there is no intro line). Alt text and the SVG `<desc>` hold the same plain sentence saying what the picture shows. Alt text cannot contain `)` or `]`, so write "slot A, the builder" in alt text. Change no other guide text.
- D7 File names: use exactly the names below. Touch no existing SVG.
- Layout check: every label fits inside its box with about 10 px slack (system fonts vary). Read left to right. No screenshots of command output, but a drawn command label is fine.

## 3. Read-first list

- `docs/reference/where-things-go.md` section `## Pictures`.
- `docs/pictures/charting-session.svg` (style block, defs, card, box classes, tab frame path) and `docs/pictures/mode-and-route.svg` (mark group source).
- `docs/pictures/opening-a-session.svg` and `docs/pictures/chart-records.svg`: tab frames and folder cards to copy patterns from.
- `docs/guide/01-install.md`: the sections you draw. Every label comes from here.
- `tests/docs-pictures.test.ts`: what the checks read.
- `/home/ivan/.akrogon/current/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Owned paths: the new SVGs named in section 2 under `docs/pictures/`, and embed lines in `docs/guide/01-install.md`.
- Must land first: nothing. Shared test resource: none (renders and tests are local reads). Consumed output: none.
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/setup-pictures-u1`, created detached at commit f629638f1fce71d166987d83bf8fc3c5ac898e62 (the creation commit for your final `git reset --soft`).

## 5. Do-not, reasons and exceptions

- Do not edit any test file (`tests/`), `docs/reference/where-things-go.md`, other guide pages, README.md (unless this brief owns it) or any existing SVG. Reason: the tests are A's planned proof and other units own the other pages. Exception: none; a planned test that looks wrong is a mismatch returned to A with evidence.
- Do not change guide text other than adding embed lines. Reason: the leaf's design excludes guide text other than embed lines. Exception: none.
- Do not change scope or an interface: return a mismatch with evidence and the smallest brief correction instead. Exception: a revised brief from A.
- Never run any `git stash` subcommand: every worktree of this repo shares one stash and a pop can lift a sibling worker's edit. To set work aside, make a WIP commit; before returning, `git reset --soft <creation commit>` and make this unit's one returned commit, so A's cherry-pick carries all the work. To check behaviour on the base, use a second worktree of the base.
- Run commands unattended: no command that waits on a human (prompt, confirmation, editor, pager); no poll or sleep loop; a slow command runs once in the foreground with the tool timeout above its expected time; re-express a harness denial inside the same grant (a simpler single command, the configured runner, your own read or edit tool), never around a secret, `.env` or grant rule, and when no formulation answers, return a mismatch with the denial text verbatim; name no env file path on a command line. Reason: no human answers a worker's command and you read only this brief.
- Stop no process by command-line pattern (`pkill -f`, `killall`).

Restated: tests, other pages and existing SVGs are not yours (A's proof, other units); guide text stays except embed lines (design); scope changes come back as a mismatch unless A revises the brief; no `git stash` ever (shared stash), WIP commit then soft reset to one commit; every command unattended, no exception.

## 6. Ordered steps

1. Read section 3. Extract the mark group from mode-and-route.svg with a small script so the copy is byte for byte.
2. For each picture in section 2: write the SVG, render it white, open the PNG, fix layout until it reads. Check the mark sits on the text line at `-z 2`.
3. Add each embed line to its section per D6.
4. Run the targeted tests; fix your own pictures or embeds until your sections leave the list.
5. Make one commit and fill the report.

Advisory size: about 5 files and under 20 turns; work clearly beyond it returns a mismatch with evidence.

## 7. Commands

- Render: `rsvg-convert -b white -o "$TMPDIR/<file>.png" docs/pictures/<file>.svg` (and `-z 2` for a closer look at the mark). Open each PNG with your file read tool and look at it.
- Targeted tests: `akrogon run-check --name u1-docs -- bun test tests/docs-pictures.test.ts tests/docs-links.test.ts tests/docs-em-dash.test.ts`. First run `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` once in this worktree.
- Expected test state when you finish: `docs-links` and `docs-em-dash` green. In `docs-pictures`, the case "every section of guide pages 01 to 03 has a picture" still lists the other two units' sections but none of yours; the mark case passes once no picture is broken (it may still fail on a `toContain` for a picture another unit owns); the 04 to 08 cases and the fixture case pass. Report the exact remaining list.

## 8. Done-when, evidence and report

Done when every picture listed above exists, renders, reads as its section's content, holds the mark group identical to mode-and-route.svg's apart from the translate, and is embedded under its section with plain alt text, and the targeted tests are in the expected state. Keep command output through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line; at most a short excerpt in the report. Return the one commit ID (message like `docs: pictures for guide page 0X sections`), the render PNG paths, and for each picture one sentence on what the render shows.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
