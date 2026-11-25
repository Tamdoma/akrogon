# Fork notes, slot D: tool-cgroup

Blind notes for Q1 to Q6 of `forks/tool-cgroup.md` `## Question`. Date: 2026-11-25. Evidence ids: E1 to E6 are my map observations (`slots/map-D.md`, own throwaway scopes); N1 to N5 and P-claude, P-codex, P-agy are new observations recorded at the end of this file. Tiers: **observed** = own probe on this host; **primary doc** = kernel, systemd or harness documentation read 2026-11-25; **code** = inspected live source; **model** = model knowledge, nothing stronger found.

## Q1 Granularity and the caller

### Pick: a, one cgroup per tool shell (`<seat scope>/tools/t-<pid>-<starttime>`)

Reason: it is the only option where the kill happens inside the phase advance, synchronously, with no extra process and no bus call under the home lock. The caller's own tool command is spared by identity (its `t-` dir), not by moving anyone and not by waiting for anyone. For seats other than the caller's, one write to `tools/cgroup.kill` ends the whole subtree (N2). For the caller's seat, commitMove enumerates `tools/t-*` directory names and kills each except the caller's. Directory names are akrogon-minted files, not a process census: a `t-` created after the listing is a miss until the next advance, never a wrong kill. That keeps F1, F3, F8, F9, F10 and F12 removed as classes. Under signposts 1a and 3a this beats b: b adds a transient helper unit per move forever to protect one tool call, when per-tool placement makes that tool call addressable on its own.

Cost: the entry hook does more per tool-shell spawn (mint a unique dir, move in, export the marker). Empty `t-` dirs accumulate between advances. A background child started in the same tool command as the phase call survives this advance (accepted residual; the next advance from any caller kills that `t-`, and leaf close stops the slice).

### Rejected

- b (one `shells/`, detached helper waits for the caller's tool shell, then kills). Works, and the `startRunGuard` pattern exists (`src/scope.ts`). Rejected on moving parts and failure surface: unit naming, a bus call to spawn the helper while `phaseCommand` holds the home lock, pid-reuse on the wait target, and a helper that dies before its write returns the silent stall with nothing in the leaf record unless the helper is an akrogon subcommand that logs. It also kills the same-command background child, which a does not; that is b's one real advantage, and it is worth less than removing the helper class.
- c (one `shells/`, killed in commitMove including the caller). E5a: the writer of the kill is SIGKILLed by it and runs nothing after. Here that writer is `akrogon phase` itself after `saveState` and the `moved` print. The harness then sees its phase tool call killed and possibly garbled output, and a seat that reads the tool result as failure may call phase again or report a false fault. It spends the phase protocol's success signal to save one dir level.

### Evidence

- Observed, N5: a `BASH_ENV` entry script mints `t-<pid>-<starttime>` (start time from `/proc/self/stat`), moves the shell in, exports `AKROGON_TOOL_CGROUP`; a nested bash inherits the same `t-`; a `setsid` orphan stays behind in the `t-` after the tool shell exits and dies from one write to that dir's `cgroup.kill`.
- Observed, N1: writing `1` to an unpopulated cgroup's `cgroup.kill` succeeds, so commitMove can write every `t-` without a populated read first.
- Observed, N2: writing `tools/cgroup.kill` kills nested `t-` trees; the dirs remain afterwards.
- Observed, N3: an unpopulated `t-` rmdirs cleanly right after its kill; a populated one refuses with EBUSY.
- Observed, E5a: self-kill semantics behind rejecting c. Primary doc, kernel cgroup v2: `cgroup.kill` SIGKILLs the whole tree and "will deal with concurrent forks appropriately and is protected against migrations". Code: `src/phase.ts:phaseCommand` holds the home `.lock` across `commitMove`; `src/scope.ts:startRunGuard` is the existing wait-then-act helper shape b would reuse.

### Pitfalls, and what removes each

- Empty `t-` dirs pile up over a long seat life. Removed by best-effort rmdir in commitMove for each `t-` it just killed or found unpopulated (EBUSY is expected for still-dying or spared ones; the next advance retries). No wait, no error path (N3).
- `t-` id reuse could make a later shell inherit an earlier dir that a concurrent kill is about to hit. Removed by minting with pid plus process start time, which cannot repeat while the dir exists (N5 used exactly this).
- The caller's own `t-` identity must survive Q2 relocation: once `akrogon phase` has moved itself into `akrogon/`, `/proc/self/cgroup` no longer names its tool shell's `t-`. Removed by identifying the spared dir from the entry hook's env marker (`AKROGON_TOOL_CGROUP`), which the caller inherits from its tool shell, with `/proc/self/cgroup` only as the no-relocation case.
- A caller whose marker is missing (someone ran `akrogon phase` with a stripped env, or entry failed for that shell) has no `t-` to spare. Removed by treating "no marker and caller not inside any `t-`" as an outside caller for that seat only when the caller's own cgroup is outside `tools/` entirely; if the caller sits in a `t-` it cannot name, kill nothing for its own seat and warn. A miss is safe; a self-kill is c.
- The same-command background child survives one advance and can keep claude masked. Not removed under a; bounded by the next advance and by leaf close. If the door weighs this over the helper's cost, that is the honest point to flip to b.

### Not asked by the fork

- What does the kill record as evidence? The old design promised a timing row with ended pids and names. Under a, the natural row is per seat: which `t-` dirs were killed and which read populated before the write (a report-only read). The fork never asks what the row must contain.
- The fork assumes commitMove enumerates under the home lock. The enumeration is a directory listing plus bounded writes, but someone should state the bound for a seat with thousands of stale `t-` dirs, or commit to the rmdir hygiene keeping it small.

## Q2 akrogon's own processes

### Pick: a, every akrogon CLI process that starts inside a tool cgroup moves itself into a seat-scope child (`akrogon/`) before it writes any record or capture

Reason: it makes "nothing akrogon-owned is ever in the kill set" a property of the binary, checked once at startup, instead of a property each command must remember. The run-check writer is the known victim (F2), but it is not the only akrogon process a seat runs from a tool shell while another seat or the operator advances the leaf: `phase`, `stop`, and the merge commands all write state. Guarding only the writer leaves the class open for every present and future writer (against signpost 1a). The move is one bounded write of the own pid, gated on "my cgroup is under a seat scope's `tools/`", so it is a no-op for operator shells, consultant seats and run-check payloads.

Cost: relocation code at the very top of the CLI, before any record or capture write, plus one `akrogon/` dir created per seat at `startSeat`. Children of a relocated process (git, hc, a nested run-check's payload) inherit `akrogon/` and so survive tool kills, which is intended for commands and accepted for nested payload work.

### Rejected

- b (only the run-check writer, at `checkedRun` start). Fixes the recorded F2 case only. The window it leaves is not theoretical: an operator advance during a long check is exactly F2, and the same advance during a seat's `akrogon stop` or a second `akrogon phase` would SIGKILL that process mid-write under b. It also puts the one relocation far from the other startup invariants, where the next writer-adding change will not see it.

### Evidence

- Code: `src/run-check.ts:checkedRun` writes the run `.owner` and capture pair from the writer process in the seat scope; a killed writer mid-publish leaves an abandoned capture pair (`abandonedCaptures`) that refuses later moves. `constructedEnv` copies only a fixed env list into payloads, so an `akrogon` run inside a check payload sits in a run scope with no seat marker and will not relocate.
- Observed, E1 and E2: a process can write its own pid into a sibling subcgroup of its seat scope, with or without delegation, on this host.
- Observed, E4: the same-user ownership that permits the relocation also permits tool shells to move themselves around inside the seat scope, so relocation is a placement convention for trusted processes, not a boundary.

### Pitfalls, and what removes each

- Relocation must precede the first state write of every command, including lock acquisition side effects. Removed by placing it as the CLI entry's first step, not per command.
- A milliseconds-wide window remains between the tool shell spawning `akrogon` and the relocation, where a concurrent advance can kill the new process. Nothing removes it fully; it is harmless in kind because nothing has been written yet (a lost command, never the abandoned-capture state F2 produced).
- If the relocation write fails (scope being torn down), proceeding would write records from inside the kill set. Removed by failing that command fast with the cgroup paths in the error; a dying seat scope is not a place to half-run a phase move.
- Long-lived akrogon processes accumulate in `akrogon/` across a seat's life (each command is short-lived, so in practice only run-check writers linger). No kill of `akrogon/` is ever needed for #157; leaf close stops the slice. Nothing to build.

### Not asked by the fork

- Does relocation apply to an akrogon process started inside `akrogon/` itself (a nested invocation from a writer's hook or a payload that inherited the marker)? The gate should be "inside `tools/`", so `akrogon/` residents stay put, but the fork does not say.

## Q3 Harness entry

### Pick: a, one akrogon-owned entry asset wired per harness kind, with `BASH_ENV` also set for every kind as the base layer

Reason: one placement rule (gate on the akrogon env marker plus current cgroup exactly at the seat scope root; mint `tools/t-<pid>-<starttime>`; move self; export the marker) and three wirings is still one mechanism to reason about, while covering the harness differences that are now observed, not guessed: claude accepts the wrapper-as-bash (P-claude), codex ignores `PATH` for its shell but runs bash with `BASH_ENV` inherited (P-codex), pi always execs `/bin/bash -c` (its installed docs). Setting `BASH_ENV` for agy too costs nothing if its shell never reads it, and covers the case where it execs bash directly. The claude wrapper is the only wiring that also settles the zsh question, by making claude's shell bash outright.

Cost: the wrapper is a new shipped asset whose path must stay valid for the whole seat life, including across akrogon self-updates, so it belongs at a stable home path written by `startSeat` or install, not inside a versioned release dir. Claude seats on a zsh host get bash snapshots (`.bashrc` instead of `.zshrc`). Agy remains unproven (P-agy failed on auth before any tool ran).

### Rejected

- b (`BASH_ENV` only for every harness). Simpler by one asset. Rejected because its failures are silent and whole-harness: claude with a zsh `$SHELL` never reads it, and any future harness whose tool shell is not bash falls out of placement with no error anywhere, which is exactly how the original stall presented. On this host, where `SHELL=/usr/bin/bash`, b would work today for claude, pi and codex; the pick is about the contract, not today's symptom.
- c (per-harness native settings). Claude's `CLAUDE_CODE_SHELL_PREFIX` also wraps stdio MCP server startup (primary doc), so under c the MCP servers land in tool cgroups and die at the first advance. Pi's native route is a settings file or extension akrogon cannot set per seat (installed pi docs: `shellPath` lives in user or project settings; no env or flag override found). No native shell option was found for codex or agy at all. C multiplies mechanisms and version coupling for less coverage than a.

### Evidence

- Observed (paid, recorded below), P-claude: claude 2.1.332 accepted `CLAUDE_CODE_SHELL=<script named bash>`; the wrapper was hit for the `-c env` probe, the `-c -l` snapshot creation, and the Bash tool call. `BASH_ENV` also fired for the same shells, including the login-flagged snapshot shell.
- Observed (paid), P-codex: codex-cli 0.172.0 `exec` ran its shell command with `BASH_ENV` inherited (9 firings across the session's shells) and never touched a `PATH`-shadowed `bash`. So codex entry is `BASH_ENV` or nothing, and `PATH` wiring is dead weight for codex.
- Observed (paid attempt, failed), P-agy: agy 1.5.16 in the run-check payload context demanded OAuth login and timed out before running any tool; no entry conclusion either way. Its binary contains `/bin/bash` strings (weak, tier model).
- Observed, N4: `bash -l -c` on bash 5.3.20 still reads `BASH_ENV`, so a login-flavoured codex shell does not by itself defeat `BASH_ENV` on this host. (I expected the opposite; the probe says otherwise.)
- Primary doc: claude env-vars reference for `CLAUDE_CODE_SHELL` (path to a bash or zsh binary, ignored if not working) and `CLAUDE_CODE_SHELL_PREFIX` (also wraps MCP startup); bash manual for `BASH_ENV` on non-interactive start; installed pi docs for `/bin/bash -c` and `shellPath`. Searched 2026-11-25: no shell-program key in the codex config reference, no shell key in agy help.

### Pitfalls, and what removes each

- The wrapper also places claude's snapshot-creation shells (P-claude shows them going through it). Harmless: they exit immediately and their `t-` dirs are cleaned at advance. Nothing to add.
- A wrapper failure must never break a tool call. Removed by the asset's contract: all placement output discarded, any failure falls through to `exec /usr/bin/bash "$@"`, and as a `BASH_ENV` file it must return 0 whatever happened.
- `BASH_ENV` breadth: it fires for every bash in the payload and seat, including run-check plumbing shells (visible in both P-claude and P-codex logs as firings inside the run scope). Removed by the gate doing nothing unless the current cgroup is exactly the marker's seat scope root.
- Claude may tighten what `CLAUDE_CODE_SHELL` accepts in a future version; the doc already reserves ignoring a non-working path, and my wrapper passes through to real bash for any version probe. Residual risk accepted; the `BASH_ENV` base layer still covers claude-on-bash if the wrapper gets ignored, which is the concrete reason for layering both.
- Entry coverage decays silently on harness updates (an extension replacing pi's bash tool, codex routing exec through its code-mode host). Removed only in part: the gate's marker plus a per-advance timing signal (a seat whose `tools/` is always empty while it works) makes decay visible; per-harness probes must be re-run on harness major changes.

### Not asked by the fork

- Where does the wrapper file live and who refreshes it? Seats keep the env they launched with across akrogon self-updates, and release dirs are versioned, so a release-dir path can rot under a live seat. The fork does not ask for the asset's home or update story.
- Is forcing claude seats from zsh to bash an acceptable operator-visible change, or should a zsh host keep zsh and take a `ZDOTDIR`-style entry instead? The fork's a decides this implicitly.

## Q4 Delegation

### Pick: add `-p Delegate=yes` to the seat scope

Reason: it is the only supported promise that systemd will not manipulate or move processes below the unit's cgroup (`systemd.resource-control`, primary doc). Under Q1a the seat's subtree is churned constantly (a mkdir per tool shell), so the placement contract should rest on the documented ownership, not on today's observed tolerance. The cost is one unit property in `startSeat`.

Cost: controllers are enabled for sibling units in the slice (man page note; no seat sets limits, so this is inert), and seat processes gain documented management of their own subtree, which on this host they already have in practice (E1, E4).

### Rejected

- Create child cgroups without it. E1 proves it works on this host (systemd 262, user manager, user-owned tree). Rejected because the failure mode is silent: a systemd reload or version change that flattens non-delegated subtrees empties `tools/` and restores the original stall with no error in any akrogon record. The saving over the pick is literally one `-p` flag.

### Evidence

- Primary doc: `systemd.resource-control` (local man, systemd 262), `Delegate=`: with delegation the manager refrains from manipulating cgroups or moving processes below the unit; the tree below is owned by the unit.
- Observed, E1 versus E2: identical behaviour with and without `Delegate=yes` for mkdir, self-move, inheritance and escape attempts, so the pick is about the guarantee over time, not about making it work today.
- Observed, map E-probes and N-probes: all `Delegate=yes` scopes stopped cleanly with `systemctl --user stop`, so leaf close and `akrogon stop` semantics are unaffected.

### Pitfalls, and what removes each

- Delegation on the seat scope must not leak into the entry gate's assumptions for other scopes: run scopes and guards stay non-delegated, and the gate refuses to act outside the marker's seat scope, so nothing tries to mint tool dirs inside a run scope. Removed by the Q3 gate.

### Not asked by the fork

- Should `startSeat` also verify after scope entry that delegation took effect (the `tools/` dir is creatable), the way `scopeEntry` already verifies scope membership, and fail the seat start if not? A seat that starts without placement silently reopens #157; the fork does not ask whether placement is a start requirement or a best-effort extra.

## Q5 Width

### Pick: everything descended from a tool shell ends at advance; harness-direct children survive by placement

Reason: the kill set is then defined by construction (fork inheritance from a placed shell), and no code ever classifies a process. The old brief's protections are largely preserved for free: codex's `node_repl` and `codex-code-mode-host` and stdio MCP servers are spawned by the harness binary, never enter `tools/`, and survive (P3). The operator sentence ("Leftover seat shells end when the leaf's phase advances") is met without akrogon promising that a tool-spawned daemon is somehow not leftover. One sentence explains the rule to every future seat skill.

Cost: a seat-started `ssh-agent`, dev server, language server or helper-spawned shell that a workflow parked for later phases dies at each advance, with SIGKILL (the only signal `cgroup.kill` sends). Seats must treat tool shells as phase-scoped: anything meant to outlive a phase has to be (re)started after the advance.

### Rejected

- Parent test at spawn (only shells whose parent is the harness or another tool shell get placed). The parent is stable at spawn, so this is not the old census race; it is still rejected. It needs harness identity inside the entry asset (`startSeat` does not know the harness pid before launch, and a comm-name test is a fragile rule wearing a placement costume). A harness that spawns tool shells through an intermediary (a snapshot wrapper shell, a code-mode host) then silently falls out of placement and the stall returns for that harness. And it buys protection for cases that are topology hypotheticals today (F6's `ssh-agent` was a constructed proof; seats use the operator's agent over `SSH_AUTH_SOCK`, not a seat-started one).

### Evidence

- Context (charting proof P3, 2026-11-25): codex holds `node_repl` and `codex-code-mode-host` as direct harness children; claude and pi hold only tool shells. Under placement, the protected set is exactly the harness-spawned set, with no allowlist to maintain.
- Failure record: F6 and F11 are the costs of trying to express width as a read-back rule (orphan equals root; shared process group equals descendant). Width by construction has no read-back.
- Observed, P-claude: claude's own snapshot shells pass through entry too, a reminder that "descended from a placed shell" includes harness plumbing, all of it transient.

### Pitfalls, and what removes each

- A shell spawned by a surviving helper (an MCP server running a bash hook) starts at the scope root, gets placed by the gate, and dies at advance while its parent lives. Accepted under the uniform rule; if a real MCP server is found that parks shell work across phases, this is the point to revisit. Nothing removes it without the rejected parent test.
- Background work the harness itself runs outside tool shells (claude background subagents and workflows) survives the advance by placement, which may or may not match what the operator means by leftover. Not removed here; see the unasked question.

### Not asked by the fork

- Does any current seat workflow deliberately park a tool-spawned process across a phase boundary (a preview server for manual review, a watcher)? The fork asks the rule in the abstract; one observed workflow would change the price of the uniform pick.
- Are harness-internal background tasks (not tool shells) in scope for "leftover" at all if one of them ever masks a seat the way the incident shell did?

## Q6 Seat scope lookup at kill time

### Pick: record the seat scope unit name in the seat record at `startSeat`

Reason: kill time then needs no hc call and no harness liveness. The important case is a harness that died while its tool shells live on: the scope stays populated and namable from the record, so the next advance can still end them. The record is written once by the same code that mints the name (`startSeat` already saves session and address in that moment), and the kill path turns it into a cgroup path under the leaf slice without asking anyone. Cost: one optional field on the seat record. Seats started before this leaf lands have no unit recorded; the unit is recorded at their next `startSeat` (seat replacement) and their shells are simply not killed until then. That honours signpost 6a (no migration step): an absent field is a no-op, not a migration.

### Rejected

- Resolve from hc's harness pid each time (the old design's route via `cgroupOf`). Adds an hc read to every phase move, and fails in exactly the harness-dead, shells-alive case above: with no harness pid there is nothing to resolve, so those shells are never ended by an advance.
- Resolve from the leaf slice directory by unit-name pattern. The slice holds both seats' scopes plus run scopes and guard services. Matching is possible today because the unit embeds the seat name, but it makes the name scheme a lookup key forever, and it overreaches: a scope whose seat was just started by a concurrent dispatch, and is not in the state snapshot commitMove is acting on, would have its first tool shell killed by pattern. The record names exactly the seats the move is about.

### Evidence

- Code: `src/seat.ts:startSeat` generates the unit as `<slice base>-<seatName>-<random>.scope` and records only `{session, address}` per seat in state. `src/scope.ts:sliceCgroup` already turns a slice name into its cgroup path, and `leafSlice` is derivable from repo, slug and home, so unit name to cgroup path is pure string work.
- Code: the lost-seat path in `src/next.ts:dispatchSlot` replaces a seat and `startSeat` overwrites the seat record, which is why an orphan scope from a replaced seat falls out of the record; its shells cannot mask any harness and reconcile stops the slice at leaf close (`src/reconcile.ts`).

### Pitfalls, and what removes each

- The recorded unit may already be gone at kill time (scope emptied and collected). Removed by treating a missing cgroup dir as already-clean success, never an error that touches the committed move.
- Two advances racing the same record both write the same `cgroup.kill` files. Harmless: the write is idempotent, and phase moves serialise on the home lock anyway.

### Not asked by the fork

- Record the unit name or the full cgroup path? The path embeds the user slice layout (`sliceCgroup` owns that derivation today); recording the name keeps one derivation site. The fork phrases it as either.
- Should the orphan scope of a replaced seat get its `tools/` killed when the replacement starts, rather than waiting for leaf close? It cannot mask, so this is hygiene, but `startSeat` is the one moment the old unit is still known from the overwritten record.

## Observations recorded for this exchange (2026-11-25, this host: kernel 7.2.15-5-omarchy, systemd 262, cgroup2fs)

Free probes used own throwaway `probeD2-*` user scopes; all were stopped and verified gone, and `/tmp/akr-probeD2` was deleted. Paid probes ran only through `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/direct` with `timeout 240` inside the argv, one short prompt each.

- N1. Command: write `1` to an unpopulated cgroup's `cgroup.kill`. Result: success. Limit: none beyond this kernel.
- N2. Command: `tools/` holding two populated `t-` children (one with a `setsid` sleeper), write `tools/cgroup.kill`. Result: whole subtree dead, `populated 0`, dirs remain. Cleanup: scope stopped.
- N3. Command: rmdir the killed `t-` dirs, then rmdir a populated one. Result: killed dirs removed immediately; populated refused EBUSY.
- N4. Command: `BASH_ENV=<marker> bash -l -c true` versus `bash -c true` (GNU bash 5.3.20). Result: marker fired in both. Login flavour does not defeat `BASH_ENV` here.
- N5. Command: delegated scope, `tools/` pre-created, `BASH_ENV` entry mints `t-<pid>-<starttime>` from `/proc/self/stat`, moves self, exports the marker. Result: two tool shells got distinct dirs; a nested bash stayed in the parent `t-`; a `setsid` orphan remained as the `t-`'s only member after exit and died from one kill write.
- P-claude (paid). Command: run `6c2792ab-2e88-4748-8dee-f028a0dee0db` (`check probeD-claude-shell: 0`, claude 2.1.332, haiku, effort low), `CLAUDE_CODE_SHELL=<script named bash>` plus `BASH_ENV` marker, one Bash tool call `echo probe-claude-ok`. Result: wrapper accepted and hit for the env probe, snapshot creation (`-c -l`) and the tool call; `BASH_ENV` fired for the same shells; output correct. Limits: one claude version, print mode, no background shell. Cleanup: run scope ended by run-check; claude's snapshot file remains under `~/.claude/shell-snapshots` as in normal use.
- P-codex (paid). Command: run `f1e3b558-cfad-4209-b6e1-ba0461ccf0ff` (`check probeD-codex-shell2: 0`, codex-cli 0.172.0, effort low), `BASH_ENV` marker and a `PATH`-shadowed `bash`, one shell command printing `/proc/self/cgroup`. Result: `BASH_ENV` fired 9 times inside the run scope; the `PATH` wrapper was never hit. A first attempt (run `0025bd50`, check 2) failed on my wrong `-a` flag for `codex exec` and ran no model tool call. Limits: `exec` mode, not an interactive seat; which of the 9 firings was the tool shell itself is not distinguished.
- P-agy (paid attempt, failed). Command: run `6af88556-f608-4dad-aa4b-0b2179329b0b` (`check probeD-agy-shell: 1`), agy 1.5.16 print mode with the same markers. Result: agy demanded OAuth login in the payload context and timed out after 60 s; no tool ran, no entry conclusion. Cleanup: run scope ended by run-check.

...[truncated 6151 chars]