# Design: deploy-listener-ready

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

### Repo, session and seat identity (forks/identity.md)


Operator 2026-11-06, door t15, verbatim: "1a | I'm okay with changing to pi-extensions | 2a | 3a - but remove unique codes at the end if they're not really necessary. If they are, keep |" then "3c, too".

Read as:
- Q1 1a: the engine finds a repo's space by name across running hc sessions (sessions from `/run/user/<uid>/herdr-core/<name>.sock`, no dot in name), reading the core's `herdr-app` document through `hc connect` `doc.get` so it works with the window closed; none, several or unreadable refuse with today's reasons; every hc call for a session pins `HC_SESSION` (and `HERDR_APP_HOME` for herdr-app calls) and strips inherited `HC_TERMINAL_SOCKET`, `HC_TERMINAL_ID`, `HC_SCOPE`. `doc.get` and the session list are parsed with a strict schema at the boundary, and a test pinned to `hc schema` fails the suite if the shape changes. Done 2026-11-06 by A with operator consent: space `extensions` renamed `pi-extensions` (`herdr-app do space.rename`, id sp6f9e9ac05e7ba2b0669be8c5b9863298, verified in `herdr-app ls`).
- Q2 2a: state keeps the leaf's herdr-app tab id; per seat the current hc address qualified by session (the name is derived); `prompted` is the seat's hc turn with its address; every akrogon terminal carries a constant filter label plus `akrogon.repo`, `akrogon.leaf`, `akrogon.seat`; one ownership check at the boundary; a report from an address the leaf no longer records is ignored.
- Q3 3a with the operator's condition: leaf seat names are `<prefix>-<slug>-<a|b>`. The code is necessary only when the name would pass 32 characters: names are unique without it because the prefix is unique per repo (3c), the slug is unique per repo and the seat letter differs; a cut slug can collide with another cut slug, so only then the name becomes `<prefix>-<slug head>-<4 hex of repo/slug>-<a|b>`, head cut to fit 32. Consultants stay `<prefix>-slot-<letter>`. A second door on the same repo stops on hc's `name_taken` and names the live owner.
- Q3 3c: each repo's two-letter prefix is stored once in akrogon's repo registry; registration refuses a duplicate prefix. Foreclosed: deriving it by rule (fails on `fw`, `hs`, `portal`/`portal-old`).

### Engine on hc (forks/engine-shape.md)


Operator 2026-11-06, door t15, verbatim: "1a | 2 - whatever is the closest to how akrogon works now on the old herdr. Again, the goal is not to invent new stuff, it's to move from the old herdr to the new herdr-core and herdr app while keeping and making everything elegant and working | 3b - let's test with that, but if 3a is better, I have no problem swapping to it |"

Read as:
- Q1 1a: signpost 1a binds steps agents perform from skill text. The engine keeps one small hc module in `src/` with a closed command list (prompt a seat with its guards, read status, close a finished tab, kill on stop), exporting nothing for skills. Foreclosed: an agent or the seats driving dispatch.
- Q2 2a, by A applying the operator's criterion "closest to how akrogon works now": the old plugin is installed by akrogon (`herdr plugin link`) and lives as long as the herdr server; the closest equivalent is a systemd user service installed and restarted by akrogon install/self-update that lives as long as herdr-core runs. It runs `pull --all` then `next --resume` at start (the plugin's startup pair), follows `hc events` filtered to akrogon terminals, runs `next` on turn end, blocked and exit (the plugin's events), single-flight, restarts and catches up when the stream ends, and is restarted only after a deploy fully completes. Foreclosed: a herdr-app mod (window lifetime, not core lifetime), herdr-setup ownership (the plugin was akrogon's).
- Q3 3b, as a tested choice: `akrogon phase` ends by running `next` for its own leaf through the existing dispatcher (busy seat refused, one prompt per phase and seat); the turn-end event covers same-seat phases, crash, exit and blocked. The engine leaf's end-to-end test exercises it; if the test shows 3a is better (for example a mid-turn prompt or a double prompt), the operator accepts swapping to 3a, recorded as a correction here.
- Binding decisions carried to the engine leaf: one hc module with a closed command list; listener subscribes before its catch-up pass; listener restart only after a completed deploy, proven by a self-update triggered through the listener; `akrogon status` shows listener liveness; status is a wake, never success evidence (advancement reads phase/done state); one prompt per seat per phase proven end to end.
- Amended 2026-11-06 by start-and-pane F3: the hc module's closed list also holds the start command and `doc.get`; akrogon also calls herdr-app's `tab.rename`.
- Corrected 2026-11-06 by delivery round 4: "one prompt per seat per phase" reads "one prompt per seat per turn" (phase run and turn-end event never both prompt the same idle turn; a re-prompt after a silent stop is allowed, bounded per delivery Q3).

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

### Test fakes and e2e (forks/tests.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2a | how long is the testing going to last for? Make sure the tests are meaningful and don't take too much time, ok?"

Read as:
- Q1 1a: `tests/fake-herdr.ts` is replaced by a real throwaway hc core per fixture (`HC_SESSION` unique per fixture, scratch XDG runtime and state under the suite root with the socket path under 107 bytes, inherited `HC_TERMINAL_*`/`HC_SCOPE` stripped, stopped on teardown, swept by `tests/isolation.ts`'s subreaper) and a small stand-in agent script that emits OSC 7501 status and does the scripted thing (write a return file, `hc send` its parent, block, exit, stay silent, stay idle). Error cases are produced on the real core (second `--name`, `state=blocked`, idle stand-in for `started: false`, `hc server restart`, `chmod 000` socket, stopped core). Only `herdr-app` is faked: strict, refusing unplanned calls, captures dated and refreshed by the window tier. No fake `hc`. `fake-busctl.ts` goes with `adoptShell`; `fake-proc.ts` keeps only helpers of the new design (resolver fds, leaf-slice identity).
- Q2 2a: the real-hc tests run inside the normal `test` check, so every verify and merge sees an hc regression; separate files, each with its own core; a machine without hc fails the check clearly. The window tier and the paid per-kind tier stay separate attended runs that fail rather than skip.
- Time and meaning (operator condition, binding for every leaf): the `test` check stays about as fast as today (median 75 s, max 121 s over the last 60 verify runs, `issues/verify-runs.jsonl`; a test check took 73-74 s on 2026-11-04, `issues/timings.jsonl`). Real-hc tests wait on hc events or `hc wait`, never sleeps, and each finishes in a few seconds. Each test checks a behavior akrogon relies on from a taken fork (start and first-task proof, delivery and turns, reports, listener wakes, silent-stop bound, restart, containment, notices, weights, session-id path, observe lines); none re-tests hc itself. Tests of removed behavior are deleted, not ported. Done-criterion per leaf: the leaf's verify `test` duration is recorded and compared with today's; a leaf that adds more than about 10 s says why in its evidence.
- Agreed, not asked: 2a proof before deleting old herdr is the full suite green plus one recorded window and per-kind run on the final installed revisions with the loaded mod build observed, plus one real leaf through its whole life, one consultant round and one watcher check, logs kept. Each leaf ports its own tests; the engine leaf lands the fixture core, stand-in and fake `herdr-app`; each leaf names the old tests it replaces; ownership and partial-state guarantees are kept; the sweep removes obsolete machinery after the proof (wording scope stays with cutover).

### Exclusions

- identity: only Q3 3c's registry applies here, as the config schema accepting an optional `prefixes:` map early (C,E); its requiredness, uniqueness and registration refusal are engine-on-hc's.
- start-and-pane, delivery, session-id, notices, containment, watcher, chart-door, herdr-skill, patch-mechanism, config: not this leaf's; engine-on-hc, the hc-doors leaves, herdr-sweep and the herdr-setup leaves own them.
- engine-shape: only "listener restart only after a completed deploy" applies here as the deploy's restart order; the unit file itself, the listener program and the proof "by a self-update triggered through the listener" belong to engine-on-hc.
- cutover: Q1 and the 1a correction apply here (relink only with `plugin/`, unlink the registered plugin without it). Drain, rollback guard and removal belong to engine-on-hc (rollback guard, "state predates hc"), the operator (drain, removal) and herdr-sweep (deleting this leaf's conditional).
- tests: only the time condition applies; the real-core fixture belongs to engine-on-hc.

### Standing design

Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf: the change is two conditionals in deploy and install, so the cheapest sufficient proof is the existing deploy and install tests with the process boundary faked as they already do (`tests/release-deploy.test.ts`, `tests/self-update.test.ts`, `tests/install.test.ts`, `tests/deploy-fixture.ts`). No real `systemctl` or `herdr` call and no live run. New behavior shows one deliberate break turning its test red. No machinery is added.

## Leaf architecture

Owned surfaces: `src/self-update.ts` (`deployStage` reload step and the step after `record`), `src/install.ts` (`install`, `planSkillLinks` for the unit link), `src/config.ts` (`globalSchema`: optional `prefixes:`) (C,E), their tests.

Literal interfaces (consumed by engine-on-hc, which ships the unit):
- unit source: `<release>/systemd/akrogon-listener.service`;
- unit destination: `~/.config/systemd/user/akrogon-listener.service`, a link made by `planSkillLinks` exactly as `systemd/akrogon.slice` is linked today;
- calls when the unit exists: `systemctl --user daemon-reload`, `systemctl --user enable akrogon-listener.service`, and after the deploy record is written `systemctl --user restart akrogon-listener.service`, then the unlink above (C);
- plugin and integration calls only when `<current>/plugin` exists: `herdr integration install <kind>` per harness and `herdr plugin link <current>/plugin`; otherwise, last, after the record and the listener restart, `herdr plugin unlink akrogon` (plugin id `akrogon` in `plugin/herdr-plugin.toml`; idempotent, P13) when `herdr` is on PATH (B,C,D,E);
- config: `prefixes:` top-level map in `~/.akrogon/config.yaml`, `{<registered repo name>: <two lowercase letters>}`, optional in this release; engine-on-hc makes it required for dispatch and checks uniqueness (B,C,D,E).

State and preconditions changed:
- The deploy record (`writeDeploySuccess` in `src/release.ts`) is written before the restart. Consumer: `deployStage`'s resume path (`resuming && record?.ok === true`) treats a recorded release as done, so a restart that kills the deploying process after the record leaves nothing half done. `Open for the plan:` the restart may run from inside the listener's own cgroup (the engine's listener runs `pull --all`, which deploys); the plan picks a restart call that cannot kill the caller before it returns, for example `--no-block`, and the engine leaf's self-update proof exercises it.
- `planSkillLinks` gains one optional link; its stale pruning (`staleIn`) must not prune `akrogon.slice` or the unit when the other is absent. `Open for the plan:` check `staleIn`'s preconditions against a release that has the unit and one that does not.
- `globalSchema` (`src/config.ts`) is a `strictObject`: consumers of `readGlobal` (every command) see the new optional key and ignore it; `akrogon init` rewrites the file from the parsed config and keeps it (D).
- `rollback` (`src/rollback.ts`) calls `install()`: rolling back from a unit-shipping release to a plugin release relinks the plugin and leaves the unit link stale. Excluded here: across the hc cutover, rollback is refused by engine-on-hc's guard; this leaf only keeps `install` symmetric with deploy. Because a release without `plugin/` makes no `herdr` call except the guarded unlink, every hc release stays a valid rollback and install target after old herdr is removed (B).
- The engine deploy runs inside the old plugin's own `akrogon pull --all`; unlinking last means a deploy process that the unlink stops has already written its record and started the listener, whose start pass catches up (C).

This leaf's own release keeps `plugin/`, so its own deploy still relinks the plugin (cutover Q1).
