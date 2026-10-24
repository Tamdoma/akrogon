# Independent territory map, Seat B

2026-10-24. Inspected checkout: `c5cf7be720018c65ef36344d8f5c61a246a9449c`; local main and origin/main had zero commits of divergence. Recommendations below are B's, not operator decisions. No other seat's map was read. No akrogon command, peer script, Herdr mutation or test that runs those scripts was executed. Only this return file was written.

## Destination and existing locks

The outcome is correct addressing of operator-named panes, including reads that determine later actions. The chart destination is explicit about same-id panes in other sessions (`issues/chart/peer-session/CHART.md:5`). The intake's unresolved choice is explicit input versus discovery by pane id (`issues/chart/peer-session/INTAKE.md:19`).

Sibling locks constrain reuse, not the peer identity policy. Repo commands discover a workspace by registered repo label and resolve once per repo per invocation (`issues/chart/herdr-session/forks/session-address.md:28`, `:37`). Their argv builder and discovery accept a Herdr executable parameter (`issues/open/herdr-session/session-routing/design.md:71`). That leaf also owns multi-session fake support (`issues/chart/herdr-session/forks/call-coverage.md:25`). The observer already consumes the shared resolver rather than building another (`issues/open/herdr-session/watch-session/design.md:63`). Peers, however, are operator-supplied panes, not lifecycle leaves selected by workspace label (`skills/chart-issues/assets/questions.md:46`). Do not substitute the repo resolver for peer addressing.

Evidence tier: operator, named intake and sibling Taken records, 2026-10-24; better-than-training, inspected code and contracts, 2026-10-24.

## Q1. What establishes which session owns an operator-supplied pane?

**Question:** When the operator supplies `w8:p18`, what additional information authorizes a script to select its server?

**O1. Explicit qualified address, supplied by the door. Pick.** Carry the Herdr session name with each pane. The door obtains the name from an explicit operator address or an explicitly confirmed session for unqualified pane names. Validate the pane in that session before acting. A read confirms existence, not human intent, so it cannot make an ambiguous operator address authoritative. Cost: script interfaces and the agent-facing commands gain a required address component, and an ambiguous old invocation must be corrected rather than guessed.

**O2. Scan all running sessions for that pane id and accept exactly one hit. Reject as the default.** This avoids asking for the session when only one hit exists. It adds a discovery dependency on every running server, and uniqueness now does not establish which pane the operator meant. After the intended pane disappears, a formerly duplicate pane elsewhere could become the unique hit. A safe version must refuse when any running session is unreadable, bound discovery deadlines, and retain the selected session thereafter. Those costs buy convenience rather than a stronger address.

**O3. Use the inherited socket, current UI selection, cwd, or the repo workspace resolver. Reject.** None is the operator's peer address. The intake explicitly names stale socket behavior (`INTAKE.md:18`), and Herdr's CLI documentation says selecting a machine in the UI does not retarget CLI commands. The repo resolver answers a different question and would silently exclude a legitimate operator-selected pane outside that workspace.

**Evidence:** operator tier, `issues/chart/peer-session/INTAKE.md:17-19`, 2026-10-24. Better-than-training tier, Herdr team, v0.9.1 [CLI reference](https://raw.githubusercontent.com/herdrdev/herdr/v0.9.1/docs/next/website/src/content/docs/cli-reference.mdx), inspected 2026-10-24, section “Connecting machines” says workspace, tab, pane ids and agent names belong to one server. Herdr team v0.9.1 [Persistence and remote access](https://raw.githubusercontent.com/herdrdev/herdr/v0.9.1/docs/next/website/src/content/docs/persistence-remote.mdx), “Named sessions,” says each session has its own panes and sockets. These are the tool author's firsthand mechanism descriptions, classified better-than-training rather than an independent practitioner opinion.

**Pitfalls and removal:** A bare id remains ambiguous even if it currently has one hit. Required qualified addresses remove that inference. Accidentally passing an agent's native session id as the Herdr name is another failure: `peer-wait.ts:47` and `door-reset.ts:7` already use `session` for native harness identity. Use distinct names such as `herdrSession` and `agentSession`, and keep the existing native identity semantics.

## Q2. Must supplied peers share A's session?

**Question:** Is one door session enough, or may B and C be operator-named panes on different running servers?

**O1. Keep a qualified address for every supplied peer. Pick.** A's address supplies the session for panes created by splitting A. Each supplied peer retains its own session. `peer-ask` can still prompt all named peers and collect their waits in one foreground call. `peer-restart` looks up, stops and restarts each peer in that peer's session. Cost: per-peer routing data and session-scoped roster reads, with the existing multi-peer ordering retained.

**O2. Require all peers to share one explicit door session. Reject unless the operator chooses this restriction.** It is simpler and valid for peers created by this door. The current process accepts supplied panes without a stated same-session restriction (`questions.md:46`). Making all supplied peers use A's server would impose a new scope limit. This is an operator choice, not an implementation assumption.

**O3. Let each script independently find any session containing each pane. Reject.** Even if Q1 chooses initial lookup, repeated discovery must not rebind an existing exchange. A peer disappearing must not cause a duplicate elsewhere to become its replacement.

**Evidence:** operator tier, destination `issues/chart/peer-session/CHART.md:5`, 2026-10-24, refers to the session where the named panes live without requiring A's session. Better-than-training tier, `skills/chart-issues/scripts/peer-create.ts:58-85` chains new splits from A; `peer-ask.ts:112-128` prompts several peers then collects waits concurrently; `peer-restart.ts:194-200` checks derived agent-name ownership against a roster. All inspected 2026-10-24.

**Pitfalls and removal:** The same pane id can legitimately occur in two peer addresses. Key routing and duplicate-target detection by the pair, not pane alone. Agent-name collision checks must use the addressed server's roster, because Herdr names are server-local. Do not add the session to generated names merely to simulate global uniqueness. The existing restart pre-read phase must finish across every target before its first kill (`peer-restart.ts:152-210`). A failure cannot leave an unvalidated later target to be processed after earlier agents were stopped.

## Q3. What happens when the addressed session disappears during a wait or handover?

**Question:** Does the operation remain bound to its original server, or search for a replacement?

**O1. Keep the original qualified address through the whole operation and fail visibly on loss. Pick.** Pass the address into ask's wait child, every budget rerun, restart's final roster read, and both parent and detached child of door-reset. Native harness session changes remain governed by the current rollout/transcript checks. Cost: callers must preserve the Herdr address across invocations and session replacement.

**O2. Re-resolve by pane id or repo after an error. Reject.** This can convert an absent peer into a different live peer and turn a read failure into a wrong prompt, split, or kill. It conflicts with the sibling chart's once-per-invocation no-retarget principle (`session-address.md:37`).

**O3. Fall back to the inherited socket or default session. Reject.** It restores the exact ambiguity the destination removes and can make an unsuccessful explicit route appear successful.

**Evidence:** better-than-training tier, inspected 2026-10-24: `peer-ask.ts:80` launches peer-wait without a Herdr address; `peer-wait.ts:95`, `:117`, `:241` perform waits and final roster reads through ambient routing. Its `Exchange.session` is native agent identity (`:143-154`), not a Herdr server. `door-reset.ts:167-178` validates the parent then detaches with inherited env; the child repeatedly calls `readPeerAgent` (`:86`, `:98`, `:111`) and sends reset/check/start prompts (`:121`, `:126`, `:149`). `peer-restart.ts:177-215` derives a process group from the chosen pane before executing local kill.

**Pitfalls and removal:** Adding `--session` only to mutation commands leaves process-info, readiness and end-of-exchange attribution vulnerable. Thread one address through every read and action. A budget return must retain enough routing information for its exact rerun. For new seat records, preserve Herdr session separately from native agent session when needed after A's reset. Existing records have no such field (`skills/chart-issues/SKILL.md:39`), so do not infer missing values from their native `session`. Exact CLI/record syntax is a planning choice once the address policy is locked.

**Limit:** Pinning a session name does not prove continuity after deletion and recreation of that same server name with reused pane ids. The inspected CLI offers named routing, while existing code checks native agent identity only in particular paths. A server-generation guarantee is not established here. Record this limit and ask whether server replacement during an active exchange belongs in scope before inventing a new identity system.

## Implementation boundary and verification

**A1. Reuse routing, not repo ownership policy.** Depend on session-routing for its argv builder and multi-session fake, with its executable parameter honored. No second workspace resolver and no edits to installed releases. This preserves the sibling contract (`session-routing/design.md:71-76`, `call-coverage.md:25`). Existing sync, async and detached execution styles need not be unified just to obtain routed argv.

**A2. Cover every bypass and caller.** Update all five scripts, including exported `run()` and `readPeerAgent()` consumers. Update the raw pre-prompt waits and budget reruns in `questions.md:46`, peer creation/restart and agent-list prose in `SKILL.md:27-39`, and handover invocation/start context in `SKILL.md:147`. Keep prompt timeouts, foreground collection, end-signal rules and partial restart reporting unchanged. An address error is not automatically evidence that a particular consultant should be dropped (`questions.md:46`).

**A3. Prove behavior with colliding ids and a misleading environment.** Use two fake servers containing the same pane id. Assert selected-server reads and effects, untouched decoy state, and exact routed failure argv. Cover ask -> wait child -> budget rerun, restart's process-info and final roster, create's split descendants, and the actual detached door-reset child. The current door-reset setup forces `DOOR_RESET_INLINE=1` (`tests/door-reset.test.ts:98`), so those existing runs alone cannot prove detached routing. Preserve current native session and rollout tests (`tests/peer-wait.test.ts:730`, `:839`) rather than replacing them with argv-only checks. Restart's fake test harness already uses real disposable process groups (`tests/peer-restart.test.ts:74`), so decoy process survival is a meaningful assertion. These are proposed checks, not claimed passes.

## Real-call evidence and proof gaps

**P1. Read-only routing measured here, 2026-10-24.** Identity: local user ivan, `/usr/bin/herdr`, version 0.9.1, no credentials. `herdr session list --json` exited 0 and listed three running sessions (`infra`, `mdconsultingny`, `personal`) and two stopped sessions (`default`, `netreachconsulting`). Then, with `HERDR_SOCKET_PATH=/tmp/peer-session-map-B-nonexistent.sock`, `herdr --session <name> pane list` exited 0 for each running name and returned that server's pane inventory. Only ids and envelope keys were printed. Cleanup: no target created or changed. Limit: proves explicit routing with an invalid inherited socket, not mutable operations, real duplicate ids, interruption, or server-generation continuity. The live inventories inspected happened to have no duplicate full pane id across those three servers.

**P2. Prior proofs exist but must be checked for transfer.** `issues/open/herdr-session/session-routing/readiness.yaml:30-99` records discovery, scoped reads, split/process-info, agent start/prompt/wait/list and cleanup on Herdr 0.9.1. Their grant is a completed one-time charting run, and the stop line forbids calls by leaf seats (`:24-27`). This is evidence to inspect and reuse where identical, not authorization for new mutations. No new mutation was made here.

**P3. Before handoff, settle missing real-call coverage.** A must compare the proposed literal operations and flags with those proof records. A new real restart proof needs a throwaway pane and owned disposable process group for `kill -TERM -- -<group>`, with decoy survival and checked cleanup. A new real door-reset proof needs an isolated supported harness, reset command, confirmation turn and start prompt, plus bounded model cost where applicable. A mutation or paid turn needs the door's explicit grant. The brief forbids these operations in this consultant turn. Fake tests can prove routing propagation and refusal paths but cannot be described as proof of real harness reset or Herdr process-group behavior.

The public `https://herdr.dev/llms.txt` index now advertises 0.9.5. The inspected running binary is 0.9.1, so this map used the index to locate documentation and pinned mechanism references to the v0.9.1 source. No upgrade is required by this map.

## Fog and human-only prerequisites

**G1. Address authority remains the first operator fork.** Can the door obtain explicit session names for supplied peers, and should unqualified names trigger a question or a unique-hit lookup? The current destination does not settle it (`INTAKE.md:19`). Do not make a lookup result equivalent to an operator-confirmed address.

**G2. Cross-session peer support needs a direct answer.** My recommendation retains per-peer addresses. If the operator chooses one door session instead, state the restriction and refuse foreign peers before any mutation. No material format decision should conceal this behavioral choice.

**G3. Historical seats and same-name server replacement need scope decisions.** Decide how an already-open chart with unqualified seat records resumes, and whether active server replacement must be detected. An explicit session supplied once on resume is smaller than searching native session files for a guessed Herdr owner. Evidence: the current seats record stores pane, harness and native identity only (`SKILL.md:39`), while door-reset starts a fresh A (`:147`).

Human-only prerequisites: operator choice of address policy, supplying ambiguous peer session names, and any grant for missing disposable mutation/paid proofs. No unrelated login, installation, workspace relocation or registry rename is indicated by the inspected surfaces.
