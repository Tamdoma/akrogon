# Design: notices-on-hc

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

### Notices (forks/notices.md)


Operator 2026-11-06, door t15, verbatim: "1a - where is session-status? I can't see it anywhere | 2a | 3a |"

A's answer to the question (not a change): `session-status` is herdr-setup's bottom status bar (`/home/ivan/Work/infra/herdr-setup/mods/session-status/main.js`): the strip along the bottom of the window showing the session name, "This computer", the branch, the agent count with "needs you", and "Ctrl Shift P commands". The active layout is `flat` (`~/.config/herdr-app/shared.json`), which holds it; `board` does too.

Read as:
- Q1 1a: herdr-setup's `session-status` mod shows akrogon's notices; it gains a small handler, no new mod and no layout change. The handler's contract (folder, file shape) is akrogon's, pinned by an e2e test in both repos.
- Q2 2a: akrogon writes one notice file per notice atomically into a notices folder under the resolved session's herdr-app home; `session-status` follows the folder with `watchFolder` (no polling), posts `notify()` with the sound, then deletes the file. akrogon's next event-driven pass reads a deleted file as `shown` and a remaining one as `pending`, folding that into today's records (`busy_notified`, merge `batch.notified`, `failure.delivery`, verify `notice`). With the window closed the file waits and shows when herdr-app opens; a notice whose condition cleared (busy seat finished, failed leaf recovered) is removed before it shows. verify's `noticeCovers` (`src/verify.ts:237-239`) gets a rule for a pending file that outlives the sending pid. Callers covered: busy, merged, failed, main red, merge slow, watcher needs-you (the watcher writes through one akrogon verb, not `herdr notification show`).
- Q3 3a: titles, bodies and sounds as today: attention sound (`playSound("blocked")`, honoring herdr-app sound settings) for failed, merged and needs-you; busy, main red and merge slow silent; no click action; the merge step stays body text.

### Patches in herdr-setup (forks/patch-mechanism.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2b |"

Read as:
- A herdr-setup patch is herdr-setup files on public surfaces only: mods (clones carry `cloned_from`), layouts, `keys.json`, `settings.json`, named `bin/` helpers that call `hc`, `hc connect` (`doc.get`/`doc.set`) or `herdr-app do`, and the linked skill. No PATH wrappers shadowing `hc` or `herdr-app`, no binary edits, no version pin.
- Q1 1a: no source patches to herdr-core or herdr-app, even though their source is public. A gap that only their code can fix gets a `herdr-app feedback` draft and comes back to the operator as a new decision.
- Q2 2b: herdr-setup gets one check command the operator runs after an hc or herdr-app update. It runs herdr-setup's checks and behavior tests (observing the new build actually loaded, not assuming a layout switch did it), probes a named session (`herdrapp session list`, `hc ls` inside it, since `HC_SESSION` is undocumented), diffs clones against the shipped copies, and prints the installed hc and herdr-app versions beside the last pair that passed. No automatic trigger and no timer: herdr-app has no post-update hook.
- Agreed, not asked: when upstream ships the missing feature, the patch is deleted and the caller moves to the native surface in one change, after it passes the same behavior test, no fallback. Each real gap gets one feedback draft for the operator, recorded with the patch as drafted, sent or declined. Tests on both sides: herdr-setup tests its half; akrogon's e2e in a throwaway session tests the contract against real hc and herdr-app (notices observe the toast posted before deletion and pending kept on a posting failure) and fails clearly when herdr-setup is not installed. herdr-setup leaves land and `./install` runs before dependent akrogon e2e proofs.

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

- The `session-status` handler is herdr-setup's status-notices leaf; this leaf owns the file contract and pins it from akrogon's side.
- identity, engine-shape, start-and-pane, delivery, session-id, containment, chart-door: engine-on-hc and chart-door-on-hc. watcher: watcher-on-hc owns the watch skill except its needs-you notice line, which this leaf moves to the notice verb.
- config: only the app home rule applies, delivered by engine-on-hc.
- herdr-skill, cutover, signposts removal steps: other leaves and the operator.

### Standing design

Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf:
- Writing, folding and clearing notice files are proven by own tests at the file boundary with the real-core fixture where a caller needs hc state.
- The toast, the sound, deletion after posting and the closed-window wait are runtime behavior of a real herdr-app window with herdr-setup's handler; no smaller check shows them, so criterion 4 is an attended window tier, free (patch-mechanism: akrogon's e2e tests the contract against real hc and herdr-app and fails clearly when herdr-setup is not installed).
- Tests of `herdr notification show` calls are deleted with their reason.

## Leaf architecture

Owned surfaces: the notice writer in `src/` (one function, used by every caller), the callers in `src/next.ts` (`observeBusy`, `mergeNotice`), `src/phase.ts` (`announceFailed`), `src/verify.ts` (`noticeSend`, `sendMainRedNotice`, `sendMergeSlowNotice`, `noticeCovers`), the notice verb in `src/akrogon.ts`, the needs-you line in `skills/watch-issues/SKILL.md`, the old session lookup in `src/shell.ts` where notices were its last user (functions `observe.ts` or `tests/fake-herdr.ts` still import stay for watcher-on-hc and herdr-sweep) (B,E), `docs/reference/commands.md`, their tests.

Literal interfaces (shared with herdr-setup status-notices):
- folder: `<app home>/akrogon-notices/`, app home `~/.config/herdr-app` for `default`, else `~/.config/herdr-app-sessions/<session>`;
- file: `<id>.json`, written as a temporary name not ending in `.json` and renamed; content `{"title": string, "body": string, "attention": boolean}`;
- the handler posts `notify({title, body})`, calls `playSound("blocked")` when `attention` is true, then deletes the file; a posting failure keeps the file.
- Notice verb: `akrogon notice --title <text> --body <text> [--attention]`, writing for the repo of its cwd, used by the watcher; row in `docs/reference/commands.md` and `contracts` in `tests/command-reference.test.ts` (E).
- Handler presence for the window tier: herdr-setup's handler file `mods/session-status/notices.js` (status-notices), held by this leaf's readiness input (B,E).

State and preconditions changed, with consumers:
- `busy_notified`, merge `batch.notified`, `failure.delivery` and verify's `notice` field read "shown" from a deleted file and "pending" from a present one. Consumers: `observeBusy` (stall notice once), `mergeNotice` and `reconcileBatch` in `src/next.ts`, `announceFailed` and `commitMove` in `src/phase.ts` (`busy_notified` reset on failed or merged), `decideSlow` and `noticeCovers` in `src/verify.ts`, `note` and `leafAttention` in `src/status.ts`.
- A pending file for a cleared condition is removed by the pass that sees the condition cleared. `Open for the plan:` which pass removes which kind (busy, failed) and the notice id scheme that lets it find the file.
- `noticeCovers` (`src/verify.ts`): pending covers while its file exists, shown covers, a failed write (`error`) never covers; the sending-pid and boot clauses go, since the file itself carries a pending notice across processes (C).

Dependencies: engine-on-hc (blocked-by); herdr-setup status-notices merged and its handler present in the installed `session-status` mod, held by the readiness input (B,E; needs N6).
