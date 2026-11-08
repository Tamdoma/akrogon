# Design: update-check

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

### Patches in herdr-setup (forks/patch-mechanism.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2b |"

Read as:
- A herdr-setup patch is herdr-setup files on public surfaces only: mods (clones carry `cloned_from`), layouts, `keys.json`, `settings.json`, named `bin/` helpers that call `hc`, `hc connect` (`doc.get`/`doc.set`) or `herdr-app do`, and the linked skill. No PATH wrappers shadowing `hc` or `herdr-app`, no binary edits, no version pin.
- Q1 1a: no source patches to herdr-core or herdr-app, even though their source is public. A gap that only their code can fix gets a `herdr-app feedback` draft and comes back to the operator as a new decision.
- Q2 2b: herdr-setup gets one check command the operator runs after an hc or herdr-app update. It runs herdr-setup's checks and behavior tests (observing the new build actually loaded, not assuming a layout switch did it), probes a named session (`herdrapp session list`, `hc ls` inside it, since `HC_SESSION` is undocumented), diffs clones against the shipped copies, and prints the installed hc and herdr-app versions beside the last pair that passed. No automatic trigger and no timer: herdr-app has no post-update hook.
- Agreed, not asked: when upstream ships the missing feature, the patch is deleted and the caller moves to the native surface in one change, after it passes the same behavior test, no fallback. Each real gap gets one feedback draft for the operator, recorded with the patch as drafted, sent or declined. Tests on both sides: herdr-setup tests its half; akrogon's e2e in a throwaway session tests the contract against real hc and herdr-app (notices observe the toast posted before deletion and pending kept on a posting failure) and fails clearly when herdr-setup is not installed. herdr-setup leaves land and `./install` runs before dependent akrogon e2e proofs.

### Exclusions

- Patches themselves (skill, notices handler, weights helper) are the other herdr-setup leaves; akrogon's e2e is akrogon's.
- identity, engine-shape, start-and-pane, delivery, session-id, notices, containment, watcher, chart-door, herdr-skill, tests, cutover, config: akrogon leaves, other herdr-setup leaves and operator steps.

### Standing design

Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf: the check is proven by one real run on the installed revisions and by own tests of its failure paths with a deliberate break; no paid run, no timer.

## Leaf architecture

Owned surfaces: `bin/herdr-update-check`, `install` (one `link` line), its tests (E).

Literal interfaces: `herdr-app check <mod>` (the existing `mods` check), `bun test`, `herdr-app status` (`errors`), `/proc/<window pid>/exe`, `/run/user/<uid>/herdr-core/<name>.sock`, `HC_SESSION=<name> hc server status --json` (its `version`, P9) only after the socket exists, `herdrapp session list --json`, `HC_SESSION=<name> hc ls --json`, `hc --version`, `herdr-app --version`, mod `cloned_from` fields. Any `hc` call with `HC_SESSION=<name>` starts a core when none runs (P0, tests fork), hence the socket check first (C,B); names with a dot (`*.holder.*` sockets) are not sessions and are skipped (P13). Stated limit: a core that exits between the socket check and the call can be started by that call (B); the check is operator-run and prints the core's start time, so a fresh empty core is visible.

State and preconditions changed, with consumers:
- The last passing version pair, kept under `${XDG_STATE_HOME:-~/.local/state}/herdr-setup/`, where `install` keeps backups; tests use a scratch `XDG_STATE_HOME` (E).
- "The new build actually loaded" (patch-mechanism Q2) is observed as stated in the brief: the running window's executable not replaced under it, no mod load errors in `herdr-app status`, and the core's reported version equal to the installed one (B,C). `Open for the plan:` how the window pid is found (the `herdr-app` process of the session's app home).
- Upstream gaps met while building get one `herdr-app feedback` draft text each in the report; the operator sends (B).

Dependencies: none.
