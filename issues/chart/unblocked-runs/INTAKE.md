# Intake: unblocked-runs

## Scope

Destination repo: akrogon (registered root /home/ivan/Work/infra/akrogon). One chart, consolidating three reports the operator handed: two defects that stop `akrogon direct` before any write (#162 session probe, #163 ENOTDIR in slugLeafFolders) and one class of seat stall on harness approval gates (#161, carrying a counting operator decision). Proposed grouping: one epic with slot A set to Opus 5.5 at medium effort, per the operator.

## Provenance

- GitHub: Tamdoma/akrogon#161
- GitHub: Tamdoma/akrogon#162
- GitHub: Tamdoma/akrogon#163
- Operator: chart-issues door message, 2026-11-25 (t126)

## Source: operator chart-issues door 2026-11-25

I just pulled three new issues. Consolidate them and chart them out. Slot B and Slot C consultants are already active in this tab, so consult with them. Full autopilot mode. Simplicity, clarity, and elegance. Whenever you can reduce the amount of code to make the whole system more elegant, go that way. If it's not absolutely necessary to add something new. In the lifecycle route, make sure that slot A is Opus 5.5 medium effort for this leaf series / epic. When you're done, run Akrogon next and notify the watcher, which is in w-akrogon

## Source: Tamdoma/akrogon#161

# Leaf seats stall autopilot by writing shell commands that trip harness manual-approval gates (seen on claude; operator decision: fix across pi, codex and agy too)

Source: Tamdoma/akrogon#161
URL: https://github.com/Tamdoma/akrogon/issues/161

Origin repo: Tamdoma/akrogon

Unverified intake.

## Operator decision (Ivan Juras, 2026-11-25)

- Seats must never depend on a human approving a command. Autopilot means no manual approvals, ever.
- The fix is valid across all harnesses — pi, codex and agy as well as claude code — not a claude-only patch.
- Achieve it without complicating the system or increasing complexity.

## Observation

On 2026-11-25 in Himne, two leaf seats stalled waiting on a human inside one hour, both on harness command-approval gates:

1. `wrangler-remote-bindings` failed at implement: the seat's live read-only command (`akrogon run-check --name remote-read -- node --env-file=... scripts/remote-read.ts`) was denied by the session permission layer, twice (planning and implement). The leaf wrote a blocker report and failed, ending a whole leaf on a permission prompt. The watch ran the command itself after the operator approved that in chat.
2. `chord-tap-editor` implement stalled over an hour: the seat hand-wrote a 25-minute shell wait loop polling the shared e2e port (`for i in $(seq 1 150); do ... ss ... sleep 10; done`), which claude's permission layer flagged for manual approval even under `--dangerously-skip-permissions`. The seat sat behind the dialog doing nothing. The interrupt printed `still_working`; the watch resteered the seat to drop the loop and run the e2e directly.

The operator found both by looking at the tabs themselves. Verbatim: "it's asking me to run commands. I'm not going to do that. This is supposed to be everything on autopilot!"

## Location

Leaf seats run by implement-issue/check-issue across harnesses. Harness recipes in ~/.akrogon/config.yaml already carry auto-approve flags: claude `--dangerously-skip-permissions`, codex `-a never -s danger-full-access`, pi `-a`, agy `--mode auto` — yet claude still gates some commands (complex shell constructs, loops, certain env reads), so the flags are not a complete autopilot guarantee at least on claude.

## Reproduction

Observed twice in one hour in one repo; the claude gate triggers on multi-line loops and unusual shell constructs even with bypass permissions. Frequency beyond that: not provided.

## Expected behavior

A seat never blocks on a human approval. When a command would need one, the seat picks a simpler formulation that runs unattended, and long waits use harness-native background tasks instead of shell loops. This holds on every harness the slots support.

## Urgency

Autopilot is the product promise of the watch; every stall of this kind silently burns wall-clock (one hour on chord-tap-editor) or kills a leaf outright (wrangler-remote-bindings failed). Workaround today: the watch notices at the next tick (up to 20 minutes late), interrupts and resteers once per seat, or the operator answers in chat.

## Suspected cause

Supported hypothesis: two contributing conditions. Main: nothing in the seat-facing instructions (implement-issue SKILL.md, worker-protocol.md, brief-template.md — grepped for approv|permission|loop|sleep, no guidance found) teaches seats which command shapes trip harness approval gates or forbids hand-written shell wait loops, so seats write them whenever convenient. Contributing: claude's permission layer gates some commands even under `--dangerously-skip-permissions`, so the harness flags alone cannot guarantee autopilot; how pi, codex and agy behave on equivalent input is unverified. Whose view: reporter (operator framing) and agent (mechanism). Files read: install release skills/implement-issue/SKILL.md, worker-protocol.md (both installed copies, not the destination source), ~/.akrogon/config.yaml harness recipes, the two leaf implementation reports. Not inspected: pi/codex/agy approval behavior, whether a shared harness-independent rule exists anywhere in the lifecycle skill set — absence there would disprove the gap. Related reports: Tamdoma/akrogon#135 (closed; same stall symptom class but about the watch confirming in-tab prompts, a different mechanism), Tamdoma/akrogon#157 (closed; background shells keeping a seat 'working', adjacent stall class).

## Source: Tamdoma/akrogon#162

# akrogon direct refuses with "the terminal resolves in 3 live sessions" when the door's address also exists in other herdr sessions, ignoring HC_SESSION

Source: Tamdoma/akrogon#162
URL: https://github.com/Tamdoma/akrogon/issues/162

Origin repo: Tamdoma/pi-extensions

Unverified intake.

## Observation

From the chart door (hc terminal t11, herdr session `infra`) in /home/ivan/.pi/agent/extensions, on 2026-11-25:

```
akrogon direct subagent-docs-current --reviewer t3vm --source Tamdoma/pi-extensions#7
error: HC_TERMINAL_ID t11: the terminal resolves in 3 live sessions (infra, netreachconsulting, personal)
      at probeExactlyOne (src/direct.ts:45:13)
      at async directCommand (src/direct.ts:69:33)
```

The door's environment held `HC_SESSION=infra`, `HC_TERMINAL_SOCKET=/run/user/1000/herdr-core/infra.sock` and `HC_TERMINAL_ID=t11`. Three herdr sessions were live, and each has its own terminal t11. No leaf state was written.

## Location

`akrogon direct`, `src/direct.ts` `probeExactlyOne` and `directCommand`, release 8ea0ff7320227e1e45785410787481e71989851e. The same code is on the akrogon workspace HEAD 15582bc (2026-11-25).

## Reproduction

1. Run two or more herdr sessions whose terminal lists share an address (here t11 in infra, netreachconsulting and personal).
2. From one of them, run `akrogon direct <slug> --reviewer <address>` for a drafted direct leaf.

Frequency: every run while the address exists in more than one live session.

## Expected behavior

Not provided.

## Urgency

Blocks the chart door's direct route entirely while the same address is live in more than one session, which is common with three herdr sessions open. No data is lost, because the refusal comes before any write. Workaround used once: run the command with a temporary `XDG_RUNTIME_DIR` whose `herdr-core/` holds only a link to the caller's socket, so `sessions()` lists one session. The run then reached the next defect (ENOTDIR in `slugLeafFolders`, filed separately). The lifecycle route (state.yaml at plan.synthesis) is unaffected.

## Suspected cause

Supported hypothesis: `directCommand` resolves the caller with `probeExactlyOne(process.env.HC_TERMINAL_ID, ...)`, which loops over every live session from `sessions()` (src/hc.ts, the socket list under `$XDG_RUNTIME_DIR/herdr-core`) and refuses on more than one hit. It never reads the caller's own `HC_SESSION` or `HC_TERMINAL_SOCKET`, which name the session the address belongs to. hc addresses are per session, so the same address in several sessions is normal. The reviewer address goes through the same probe and would hit the same ambiguity.

Whose view: agent.

Files read: installed release `src/direct.ts` (probeExactlyOne, directCommand), `src/hc.ts` (sessions, terminal, hcEnv). Workspace HEAD `src/direct.ts` probeExactlyOne checked to be the same loop.

Not inspected: whether other verbs (next, phase, land) resolve seat addresses the same way. They read recorded session refs from state.yaml, which was not verified.

Related reports: none found. Searched Tamdoma/akrogon, all states: `--author @me created:>=2026-11-23` (limit 40), "direct HC_SESSION" (limit 8), "direct resolves live sessions" (limit 8).

## Source: Tamdoma/akrogon#163

# akrogon direct crashes with ENOTDIR when issues/closed holds a plain file (slugLeafFolders)

Source: Tamdoma/akrogon#163
URL: https://github.com/Tamdoma/akrogon/issues/163

Origin repo: Tamdoma/pi-extensions

Unverified intake.

## Observation

In /home/ivan/.pi/agent/extensions on 2026-11-25, `akrogon direct subagent-docs-current --reviewer t3vm --source Tamdoma/pi-extensions#7` (run with the caller's session isolated, see Urgency) failed:

```
ENOTDIR: not a directory, stat '/home/ivan/.pi/agent/extensions/issues/closed/compaction-safety.md/subagent-docs-current'
      at slugLeafFolders (src/state.ts:236:9)
      at directLeafPath (src/direct.ts:51:29)
      at directCommand (src/direct.ts:70:28)
```

`issues/closed/` in that repo holds 6 legacy plain `.md` files beside the leaf owner folders. No leaf state was written.

## Location

`akrogon direct`, `src/state.ts` `slugLeafFolders`, called from `src/direct.ts` `directLeafPath`. Release 8ea0ff7320227e1e45785410787481e71989851e. The same code is on the akrogon workspace HEAD 15582bc (2026-11-25).

## Reproduction

1. A registered repo whose `issues/closed/` (or `issues/open/`) holds a plain file, such as `issues/closed/compaction-safety.md`.
2. Run `akrogon direct <slug> --reviewer <address>` for a drafted direct leaf.

Frequency: every run in such a repo.

## Expected behavior

Not provided.

## Urgency

The direct route cannot run at all in pi-extensions while those legacy files exist. No data is lost, because the throw comes before any write. The lifecycle route works. There is no workaround short of moving the legacy files.

## Suspected cause

Supported hypothesis: `slugLeafFolders` builds `resolve(root, owner, slug)` for every entry of `issues/open` and `issues/closed` and calls `statSync(candidate, { throwIfNoEntry: false })`. `throwIfNoEntry: false` suppresses only ENOENT. When `owner` is a plain file, the path has a file as a middle part, so the stat throws ENOTDIR. The loop does not check that `owner` is a directory first. Contributing condition: legacy repos keep single-file records under `issues/closed/`.

Whose view: agent.

Files read: installed release `src/state.ts` (slugLeafFolders), `src/direct.ts` (directLeafPath, directCommand). Workspace HEAD `src/state.ts` slugLeafFolders checked to be the same code.

Not inspected: other `readdirSync` walks over `issues/open` and `issues/closed` (`akrogon status` ran fine in the same repo), and whether `state.ts:314` has the same pattern.

Related reports: none found. Searched Tamdoma/akrogon, all states: `--author @me created:>=2026-11-23` (limit 40), "slugLeafFolders ENOTDIR" (limit 8). Related: Tamdoma/akrogon#162, the session probe defect hit in the same run before this one.

## Agent findings

- Pull time 2026-11-25T22:37:16Z; `akrogon pull` printed "3 open issues pulled". None of #161-#163 is in any leaf `sources` or chart intake; `issues/chart/watch-one-read/CHART.md:46` records #161 as recorded only, not imported.
- #161 holds `## Operator decision (Ivan Juras, 2026-11-25)`. Account check: author `ivanjuras`, `userContentEdits.totalCount` 0, `lastEditedAt` null; `gh api repos/Tamdoma/akrogon/collaborators/ivanjuras/permission --jq .permission` = `admin`. The section counts; fork `forks/approval-decision.md`.
- #162: `src/direct.ts` `probeExactlyOne` loops `sessions().live` and refuses on more than one hit; it never reads the caller's `HC_SESSION`. `docs/reference-index.md` states every hc call pins `HC_SESSION` to the resolved repo session, and `src/AREA.md` says `probeTerminal` is the probe for sessions outside the repo's own (a direct leaf's seat refs). This door's own env carries `HC_SESSION=infra`, `HC_TERMINAL_SOCKET=/run/user/1000/herdr-core/infra.sock`.
- #163: `src/state.ts` `slugLeafFolders` iterates `readdirSync(root)` names and stats `resolve(root, owner, slug)`; a plain-file owner throws ENOTDIR. `readInventory` in the same file already walks with `withFileTypes` and filters directories.
