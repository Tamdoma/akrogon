# Design: herdr-skill

## Binding decisions, verbatim

Copied verbatim from each fork's Taken section in the akrogon chart `issues/chart/herdr-app/` (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/`). Proof records: `forks/proofs.md`.

### Signposts: herdr-app (forks/signposts.md)


Operator 2026-11-06, door t15, verbatim: "1a | 2a - we just need to make sure to test everything out, including e2e to make sure it works before we delete the old stuff. But yes, we're removing everything old, no fallbacks either | 3 - if it doesn't have something we need, use the herdr-setup space (you can find the repo in this session) to create patches that will survive upstream updates. | 4a - if the crashes happen, we need an auto-fix with the watcher (/watch-issues) agent. Pretty much the same what we have now. I don't want to change how the workflow is done, I just want to move and upgrade everything to herd-core and herdr-app. | 5a - but I still need a global herdr skill that pulls from that agents.md file (which exists in herdr-app), so I don't have to remind them. Maybe you can create a symlink skill that links to that file and call it /herdr and symlink it from pi, claude code and codex to that file? | 6a so we can test - but then everything old needs to be completely removed | 7a |"

Read as:
- 1a: akrogon code only for starting an agent (name, labels, visible pane, harness argv); every other hc step is plain `hc` commands in skill text.
- 2a: everything that exists only for old herdr is removed, no fallbacks. Before anything old is deleted, the new path is tested end to end and shown working.
- 3: a missing hc or herdr-app capability is filled by a patch in the herdr-setup repo (`/home/ivan/Work/infra/herdr-setup`, registered as `herdr-setup`) built to survive upstream updates. Not 3a, 3b or 3c as written.
- 4a: an event listener notices crashes, and crash recovery is an automatic fix by the watch-issues agent, as today. The workflow does not change; only the substrate moves to herdr-core and herdr-app.
- 5a: global CLAUDE.md and AGENTS.md stay untouched. Added: one global `herdr` skill whose content comes from herdr-app's AGENTS.md, linked into pi, Claude Code and Codex (operator's proposed mechanism: a symlink skill), replacing the old herdr skill.
- 6a: the engine is ported first so the rest can run and be tested on it; after that every old part is removed completely.
- 7a: one smallest live run per operation per agent kind at charting, in a throwaway herdr-app session, within one paid budget the operator approves.

What the session prioritizes and gives up (A): the same workflow on a new substrate, proven end to end before old code is deleted, with gaps patched in herdr-setup rather than worked around in akrogon or waited on upstream. It gives up any period where old and new both work, and features that only old herdr made possible unless the operator names them.

Correction 2026-11-06 (operator, round 1 engine-shape, door t15), verbatim: "the goal is not to invent new stuff, it's to move from the old herdr to the new herdr-core and herdr app while keeping and making everything elegant and working". Binding for every fork: when options differ, the one closest to how akrogon works on old herdr wins unless it is less elegant or does not work.

Correction, operator 2026-11-06, door t15, verbatim: "just make sure that we have all the behavior very similar to what the old akrogon is doing for now, with the addition of all the improvements of herdr-core and herdr-app"

Read as: every remaining fork keeps today's akrogon behavior as close as hc and herdr-app allow, and takes what herdr-core and herdr-app do better (events instead of the plugin, turns instead of session-file offsets, labels, core-side terminals that outlive the window) where they replace an old mechanism. No new features beyond that; improvements to behavior wait for later work.

Clarification, operator 2026-11-06, door t15, verbatim: "Yes, by improvements, I mean no polling or waiting, and using <hc> wherever possible for communication."

Read as: the herdr-core improvements taken are event-driven: no polling loops, no sleeps or timed waits standing in for a signal, and seats talk to each other by `hc send`, arriving as `<hc from=...>` messages, wherever a message can carry it. Where a bounded wait remains (start's 60 s first-task check, delivery Q1), it follows hc events, not repeated reads.

Direction, operator 2026-11-06, door t15, verbatim: "when it comes to the new way of communication, I want the most elegant solutions so that the least amount of things can break. I had the old akrogon and herdr working perfectly, nothing should break with this migration. Only made better."

Read as: for communication between seats and with the engine, each fork picks the option with the fewest moving parts that can fail, preferring hc's own mechanisms (`hc send` / `<hc>` messages, events, labels) over akrogon-built ones. Every behavior that works today must still work after the migration, proven by the e2e tests before old herdr is removed (signpost 2a); a regression is a failed migration, not a cost.

Exception, operator 2026-11-07, door t15 (chart-door round, picking 2a, which stated the exception): the chart door's handover reset helper stays akrogon code besides the start step.

Read as: signpost 1a holds everywhere else. The reset helper is the only other akrogon script in the chart door, ported to hc events (forks/chart-door.md `## Taken`).

### Global herdr skill (forks/herdr-skill.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2a - the skill needs to be in the herdr-setup repo (already exists) and symlinked to it from pi, codex and claude, so there's no duplication. Similar to how akrogon skills are set up so that all harnesses have access to them. This shouldn't be a problem, right? | 3a - It needs to be described sufficiently enough so that it triggers when needed |"

Read as:
- Q1 1a: one small owned `skills/herdr/SKILL.md` in the herdr-setup repo (`/home/ivan/Work/infra/herdr-setup`), front matter `name: herdr` and a description. The body holds only the gate and directions: agents and terminals → `hc --skill`; the window → `herdr-app --skill`; layouts, keys and mods → `${HERDR_APP_HOME:-$HOME/.config/herdr-app}/AGENTS.md` and `herdr-app commands`. No copied manual text and no hc facts. Outside hc (`HC_TERMINAL_ID` unset) it stops hc and `herdr-app do` control but still allows reading AGENTS.md when asked to edit layouts, keys or mods.
- Q2 2a: one copy only. The `skills/herdr` folder lives in herdr-setup and every harness reaches it through a symlinked folder, the way akrogon's skills are linked today (`~/.<harness>/skills/<name> -> <release>/skills/<name>`), so all harnesses see the same file: `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr`, `~/.agents/skills/herdr`, and agy's `~/.gemini/config/skills/herdr` ("all harnesses"). herdr-setup's `./install` creates the links with its existing `link()` helper, which moves the old real herdr skill folders to its backup folder in the same run. akrogon install neither writes nor prunes this link.
- Q3 3a: description only, written so it triggers when needed: it names `HC_TERMINAL_ID` being set, a message in `<hc>` tags, hc, herdr-core, herdr-app, starting, messaging or waiting on other terminals or agents, and changing the window, runtime trigger first and short enough for Codex's skill budget; no old "only when the user mentions Herdr" wording. Done-criterion: per harness, a fresh session inside a throwaway hc terminal given an hc-shaped task and an incoming `<hc>` report loads the skill without being told; a harness that does not gets better wording, not a new mechanism. No startup hooks, no global file edits, nothing added to akrogon's start.
- Operator check "This shouldn't be a problem, right?": no problem, with one probe. Claude Code and Codex document symlinked skill folders, and pi follows and deduplicates them in code; akrogon's skills already reach those homes this way. agy's docs do not say, so the per-harness discovery probe covers agy before handoff. herdr-setup has no `skills/` folder yet; the leaf adds it and one link loop in `./install`.

### Patches in herdr-setup (forks/patch-mechanism.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2b |"

Read as:
- A herdr-setup patch is herdr-setup files on public surfaces only: mods (clones carry `cloned_from`), layouts, `keys.json`, `settings.json`, named `bin/` helpers that call `hc`, `hc connect` (`doc.get`/`doc.set`) or `herdr-app do`, and the linked skill. No PATH wrappers shadowing `hc` or `herdr-app`, no binary edits, no version pin.
- Q1 1a: no source patches to herdr-core or herdr-app, even though their source is public. A gap that only their code can fix gets a `herdr-app feedback` draft and comes back to the operator as a new decision.
- Q2 2b: herdr-setup gets one check command the operator runs after an hc or herdr-app update. It runs herdr-setup's checks and behavior tests (observing the new build actually loaded, not assuming a layout switch did it), probes a named session (`herdrapp session list`, `hc ls` inside it, since `HC_SESSION` is undocumented), diffs clones against the shipped copies, and prints the installed hc and herdr-app versions beside the last pair that passed. No automatic trigger and no timer: herdr-app has no post-update hook.
- Agreed, not asked: when upstream ships the missing feature, the patch is deleted and the caller moves to the native surface in one change, after it passes the same behavior test, no fallback. Each real gap gets one feedback draft for the operator, recorded with the patch as drafted, sent or declined. Tests on both sides: herdr-setup tests its half; akrogon's e2e in a throwaway session tests the contract against real hc and herdr-app (notices observe the toast posted before deletion and pending kept on a posting failure) and fails clearly when herdr-setup is not installed. herdr-setup leaves land and `./install` runs before dependent akrogon e2e proofs.

### Exclusions

- identity, engine-shape, start-and-pane, delivery, session-id, notices, containment, watcher, chart-door, tests, cutover, config: akrogon leaves and operator steps. akrogon's start adds nothing for this skill and akrogon install neither writes nor prunes these links.
- patch-mechanism: applies as "the linked skill is a public-surface patch file"; the post-update check is update-check.

### Standing design

Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf:
- The link loop is proven by running `./install` against a scratch `HOME` with herdr-app present, the real boundary, cheapest.
- Loading a global linked skill folder: akrogon's skills reach claude, codex and pi homes as links; agy's global loader following a linked folder is observed at charting before handoff (forks/proofs.md P14, herdr-skill Q2's agy probe) (B). After `./install`, the operator's N6 step checks per harness that `herdr` resolves to the linked file (C). What stays unproven is whether the description triggers, which is model behavior per harness, so criterion 2 offers the candidate through each harness's project skill folder in a throwaway cwd, never touching the operator's live homes before merge (B), each harness side by side in its own throwaway terminal.
- No startup hooks, no global file edits.

## Leaf architecture

Owned surfaces: `skills/herdr/SKILL.md` (new folder), `install` (one link loop after the existing links), a test for the loop.

Literal interfaces:
- link targets: `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr`, `~/.agents/skills/herdr`, `~/.gemini/config/skills/herdr`, each `-> <repo>/skills/herdr`.
- existing helper `link <source> <target>` in `install`.

State and preconditions changed, with consumers:
- The old real folders `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr` (today real folders) move to the backup. Consumer: every harness's skill loader; checked by criterion 2.
- `Open for the plan:` each harness's project skill folder, read from that harness's own documentation before the run (Claude Code `.claude/skills`, agy `.agents/skills` per its binary's text; codex and pi to confirm).
- `install` runs `curl ... | sh` when `herdr-app` is missing, switches the layout of an open window and runs `herdrapp session link/seed`; the test pins `HOME`, `XDG_STATE_HOME`, `HERDR_APP_HOME` and the session homes to scratch folders (B). `Open for the plan:` whether the loop is tested inside the full `install` under those pins or factored so it runs alone.
- Upstream gaps met while building get one `herdr-app feedback` draft text each in the report; the operator sends (B).

Dependencies: none.
