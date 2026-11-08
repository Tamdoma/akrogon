# Design: herdr-sweep

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

### Cutover, drain and removal (forks/cutover.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2b"

Read as:
- Drain (agreed): no old-runtime work at the switch: no open leaf in any registered repo, no outstanding land, verify or broadcast work, and the stale `stopped.yaml` mark `framework/relay-obrazac` cleared; nothing is pushed to akrogon main between the drain check and the engine leaf's merge, which is the switch (`akrogon pause` does not stop a deploy). Checked just before the merge. No state migration: a state file with old pane ids fails the strict parse with a "state predates hc" message.
- Q1 1a: a small prerequisite leaf lands before the engine leaf (the engine leaf is `blocked-by` it): deploy and install relink the herdr plugin only while the release has `plugin/`, and install, enable and restart the listener unit when the release ships one. Its own deploy still relinks (its release keeps `plugin/`); the engine release then deploys cleanly under it and starts the listener. The final sweep deletes the conditional.
- Rollback (agreed): from the first hc release, `akrogon rollback` refuses before `flip`, under the install lock, when `<releases>/<previous>/plugin` exists ("previous release runs on old herdr; fix forward"); hc-to-hc rollback as today. The guard is deleted only after no pre-hc release remains (existing collector) and nothing can restore a legacy `previous`.
- Removal (agreed), after the 2a proof, in order: (1) akrogon final sweep leaf removes `plugin/`, the `herdr integration install`/`plugin link` calls, the prerequisite's conditional, fake herdr and herdr fixtures, current wording; (2) operator: `herdr plugin unlink` and `herdr integration uninstall <kind>` for every kind ever installed while the binary exists, checked by `herdr plugin list`/`integration status`, and dead `herdr agent` permission lines listed; (3) operator: disable and remove `herdr-patches.path/.timer/.service`, `herdr-patches-failed.service`, `herdr-claude-rules.path/.service`, omarchy hooks `apply-omarchy-theme` and `ensure-herdr-after-omarchy-update`, `~/.local/share/herdr-patches`, `~/.cache/herdr-patches`, and `omarchy-customizations/herdr/` with its `install.sh` lines (unregistered repo: operator edit); (4) Moshi hook's `MOSHI_HERDR_PATH` dependency moved or removed; (5) stop old herdr servers and sessions, remove `~/.local/bin/herdr`, `/usr/bin/herdr` through pacman, `~/.config/herdr/`, the old desktop shortcut. Done when identified obsolete units, processes, binaries and reinstall hooks are gone; herdr-app and hc units and trees stay. The sweep leaf writes the exact command list as Pending steps.
- Q3 2b: the source checkouts `infra/herdrdev/` (herdr, herdr-patched, herdr-worktrees, zig caches) and `infra/herdr-plugins/` are removed as the last removal step. Before deletion the step lists every commit, branch, stash and worktree change that exists only on disk (`herdr-patched`'s origin is upstream `herdrdev/herdr`), the operator picks where they are kept (a pushed fork branch or a `git bundle`), and deletion happens only after that is confirmed.
- Wording (agreed): the sweep rewrites README, `docs/` (including `docs/pictures/machine-parts.svg`), `src/` and AREA files, skills, tests; `learnings/history/`, `issues/closed/`, chart folders and append-only records stay as dated history; LESSONS `:11` and `:21` are retired or generalized through the lesson rule, `:43` stays. Done-check: a scoped grep allowing `herdr-app`, `herdr-core`, `herdr-setup`, `HERDR_APP_HOME`, `herdr.d.ts`, the `"herdr"` mod import and the `herdr` skill, excluding history and archives, each remaining hit read for substance. Other repos' docs are outside this epic.

Correction, operator 2026-11-07, door t15 (leaf review round, slots/leaf-review-merged.md S1, S2), verbatim: "1a | 2a | 3a"

Read as:
- 1a: engine-on-hc deletes `plugin/` and, in the same deploy and install path, unregisters akrogon's plugin from old herdr (`herdr plugin unlink`, checked by `herdr plugin list`) while the `herdr` binary exists (D,B: deleting files does not unregister a loaded plugin). Old herdr itself stays installed until the removal steps after the 2a proof. The sweep's `plugin/` item becomes a check that it is gone. Foreclosed: keeping inert plugin files until the sweep (B).
- 2a: every leaf of both charts is handed off at once. The drain reads: at the engine merge, no leaf other than the engine leaf has seats or work in flight in any registered repo; this epic's leaves blocked behind the engine wait without seats; herdr-setup's leaves run under today's engine and are finished before the engine merges, which the drain check confirms. Foreclosed: a staged second handoff after the switch.

### Harness config (forks/config.md)

Operator 2026-11-07, door t15, verbatim: "1a, it needs to be on the list as well | 2a |"

Read as:
- `harnesses.codex` becomes `codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access` (agreed). Consultants keep the recipe recorded for their seat; a sandboxed codex consultant keeps `-c sandbox_workspace_write.network_access=true`.
- Q1 1a: `harnesses:` gains an `agy` entry: `agy --model {model} --effort {effort} <auto-approve> -i`, with `-i` last so the start verb's appended first task follows it. `<auto-approve>` is `--mode auto` or `--dangerously-skip-permissions`, decided by one probe before handoff that checks the effective mode and that tool use outside cwd and the `hc send` report work unattended for the chosen model and effort; a failed probe is reported, never silently swapped. No slot changes; agy becomes selectable for slots and for consultants through the start verb, with delivery's silent-stop handling and the session-id `/proc` path applying as for other kinds (watcher log tail keeps today's no-log path for agy).
- `harnesses.claude` unchanged (agreed). Doors in auto mode: a probe checks the existing `Bash(akrogon:*)` lets the start verb pass; the legacy `herdr agent start` `autoMode.allow` entry is retired at cutover (removed, or replaced by one narrow entry naming the start verb if the probe needs it); no `Bash(hc:*)`; akrogon never writes Claude settings.
- App home (agreed): one function in akrogon's hc module from herdr-setup's convention (`default` → `~/.config/herdr-app`, else `~/.config/herdr-app-sessions/<session>`); the caller's environment is never used; a missing folder is an error naming the expected path; `herdrapp session list --json` is used only in the e2e assertion that the two agree.
- Q2 2a (operator answer to A's separate question on the deleted Tasks board): the final sweep deletes akrogon's Tasks mod (`herdr-app/tasks/`), its tests (`tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`) and akrogon install's herdr-app mod linking with its stale-link pruning, since `tasks` is the only mod akrogon ships; the installed link `~/.config/herdr-app/mods/tasks` is removed by that install, and the infra session's link to it (`~/.config/herdr-app-sessions/infra/mods/tasks`, made by herdr-setup's `session link`) is checked and removed in the same step.

Correction, operator 2026-11-07, door t15 (probe round, forks/proofs.md P3), verbatim: "1a | 2b - if that doesn't work, I'll approve the working akrogon folder manually so it can work in any repo. | 3 - I don't understand, elid. What are the consequences"

Read as (2b, proven by P8): the start verb starts agy without the task in argv (`harnesses.agy` is `agy --model {model} --effort {effort} --mode auto`, no `-i`); when agy's status is `blocked`, `kind: permission`, `msg: Trust this folder?` it presses enter once, waits for `idle`, then delivers the first task by `hc send`, so the turn counts and the start proof follows delivery Q1. Cost: agy adds each answered folder to `~/.gemini/antigravity-cli/settings.json` `trustedWorkspaces`, one entry per agy leaf worktree. The operator's fallback (trusting the akrogon worktree folder once) would not cover worktrees inside it: P5 showed trust is per exact folder (`/home/ivan` listed did not cover its subfolders).

Final-shape check, 2026-11-07 (slots/final-probe-B..E.md), applied by A within 2b: agy's ready state is either `idle`, turn 0, with no dialog (already trusted folder: repo-root consultants, a restarted seat in the same worktree), or the trust dialog (`blocked`, `kind: permission`, `msg: Trust this folder?`), answered by exactly one enter, then `idle`; then exactly one first-task send and the normal start proof (B,C,E). For every kind, a first send refused with `kind: unavailable` ("still starting", nothing typed) is sent again on the seat's next status event within the 60 s start budget; this is not the `started: false` case delivery Q2 forbids resending (C). Unattended tool use outside cwd under `--mode auto` is shown by P5's fourth agy run (wrote `agy-outside.txt` outside its cwd); the agy leaf keeps it as a done-criterion (C).

### Test fakes and e2e (forks/tests.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2a | how long is the testing going to last for? Make sure the tests are meaningful and don't take too much time, ok?"

Read as:
- Q1 1a: `tests/fake-herdr.ts` is replaced by a real throwaway hc core per fixture (`HC_SESSION` unique per fixture, scratch XDG runtime and state under the suite root with the socket path under 107 bytes, inherited `HC_TERMINAL_*`/`HC_SCOPE` stripped, stopped on teardown, swept by `tests/isolation.ts`'s subreaper) and a small stand-in agent script that emits OSC 7501 status and does the scripted thing (write a return file, `hc send` its parent, block, exit, stay silent, stay idle). Error cases are produced on the real core (second `--name`, `state=blocked`, idle stand-in for `started: false`, `hc server restart`, `chmod 000` socket, stopped core). Only `herdr-app` is faked: strict, refusing unplanned calls, captures dated and refreshed by the window tier. No fake `hc`. `fake-busctl.ts` goes with `adoptShell`; `fake-proc.ts` keeps only helpers of the new design (resolver fds, leaf-slice identity).
- Q2 2a: the real-hc tests run inside the normal `test` check, so every verify and merge sees an hc regression; separate files, each with its own core; a machine without hc fails the check clearly. The window tier and the paid per-kind tier stay separate attended runs that fail rather than skip.
- Time and meaning (operator condition, binding for every leaf): the `test` check stays about as fast as today (median 75 s, max 121 s over the last 60 verify runs, `issues/verify-runs.jsonl`; a test check took 73-74 s on 2026-11-04, `issues/timings.jsonl`). Real-hc tests wait on hc events or `hc wait`, never sleeps, and each finishes in a few seconds. Each test checks a behavior akrogon relies on from a taken fork (start and first-task proof, delivery and turns, reports, listener wakes, silent-stop bound, restart, containment, notices, weights, session-id path, observe lines); none re-tests hc itself. Tests of removed behavior are deleted, not ported. Done-criterion per leaf: the leaf's verify `test` duration is recorded and compared with today's; a leaf that adds more than about 10 s says why in its evidence.
- Agreed, not asked: 2a proof before deleting old herdr is the full suite green plus one recorded window and per-kind run on the final installed revisions with the loaded mod build observed, plus one real leaf through its whole life, one consultant round and one watcher check, logs kept. Each leaf ports its own tests; the engine leaf lands the fixture core, stand-in and fake `herdr-app`; each leaf names the old tests it replaces; ownership and partial-state guarantees are kept; the sweep removes obsolete machinery after the proof (wording scope stays with cutover).

### Exclusions

- identity, engine-shape, start-and-pane, delivery, session-id, containment, watcher, chart-door, notices: delivered by engine-on-hc and the hc-doors leaves; this leaf only removes leftovers and rewrites wording.
- herdr-skill, patch-mechanism: herdr-setup leaves.
- config: harness lines and Claude settings are operator edits (needs N1, N2); this leaf removes the Tasks mod and install's mod linking. The infra session link `~/.config/herdr-app-sessions/infra/mods/tasks` (made by herdr-setup's `session link`) is checked and removed by the operator step list, since it lies outside akrogon's install.
- cutover: drain and the machine removal steps (2) to (5) and the checkout step are operator steps; the door writes them into CHART.md's Pending steps at handoff from cutover's removal list (a leaf touches no `issues/` path), and this leaf refines the commands and checks in its report (C). Other repos' docs are outside this epic.

### Standing design

Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf:
- Removal is proven by install tests at the process boundary; the destination's own `test` check, which verify runs anyway, shows nothing still depends on the removed files, so no criterion claims it (C).
- Deleted tests are judged as a batch, each with its reason; no test that guards a real past regression is dropped while its behavior still exists on hc (its hc counterpart is named).
- The lesson rule decides: line 21 (the herdr plugin's cwd) retires with the plugin; line 11's failure class (non-JSON stderr from an outside CLI) still applies to `hc` and `gh`, so it is generalized, its history kept (B).
- No live run.

## Leaf architecture

Owned surfaces: `src/shell.ts` (old exports whose last users were `observe.ts`, moved by watcher-on-hc, and `tests/fake-herdr.ts`, deleted here) (B,E), `src/install.ts` (`install`, `planSkillLinks` mod part, `staleIn` for mods), `src/self-update.ts` (`deployStage` conditional), `herdr-app/tasks/`, `tests/fake-herdr.ts`, `tests/tasks-mod*.test.ts`, remaining herdr fixtures, README, `docs/`, AREA files, `skills/` wording, `learnings/LESSONS.md`, new `learnings/history/` entries the lesson rule asks for.

State and preconditions changed, with consumers:
- Install no longer links herdr-app mods; stale pruning of `~/.config/herdr-app/mods/tasks` must still run once. Consumer: `install` and `deployStage` links step (`planSkillLinks` `stale`). `Open for the plan:` keep pruning of that one old link without keeping mod linking.
- Removing the deployer's conditional: every release from here has no `plugin/`. Consumer: `rollback` (guard on `<previous>/plugin` stays, from engine-on-hc).

Dependencies: chart-door-on-hc, watcher-on-hc, notices-on-hc (blocked-by; engine-on-hc through them); the recorded end-to-end proof file (readiness input).
