# tool-cgroup fork notes — slot B

Evidence tier key used below: T1 = live probe on this host (systemd 262,
kernel 7.2.15, cgroup v2) in throwaway units, 2026-11-25, recorded in the
probes list at the end. T2 = source reading (pinned upstream or local
binary). T3 = inference from T1/T2. Dates are probe/read dates.

## Q1 — Granularity and the caller

**Pick: b.** One `shells/` cgroup per seat; commitMove starts a detached
helper outside the seat scope that waits for the caller's tool shell to
exit, then writes `shells/cgroup.kill`; other seats are killed immediately.

Reason: it is the only option that satisfies both halves of the contract
at once — the tool call returns normally *and* no shell of the advancing
phase survives. The wait-for-exit helper is not a selection mechanism: it
watches one pid (the caller shell, read once from the akrogon process's
own /proc chain or env-passed pid) and then performs the same atomic write
used for every other seat. Waiting on a pid with `kill -0` polling or
`tail --pid`-style blocking is trivial and, unlike the old design, the
cost of a read error is a delayed kill, never a wrong victim.

Cost: one extra process per phase commit, a wait primitive, and a
backstop decision for a caller shell that never exits (agent pathology:
`bash -c 'while :; do …; akrogon phase …'`). The backstop can be a plain
timeout after which the helper kills anyway — bounded, and it only
affects a turn that was never going to end cleanly regardless. Also the
helper must itself be placed outside the kill set: start it in the leaf
slice directly or in `keeper/`-style placement outside `shells/` — one
line of placement, same machinery as everything else.

**Rejected a** (per-tool-shell cgroups, spare the caller's own): the
spared `t-<id>` leaks background children started in the same tool
command for the whole next phase — and those are exactly the masking
shells of the incident (claude stays `working` while one lives, so the
advanced-to seat's prompts stall behind a dead phase's leftovers). The
design re-creates the incident shape in miniature at every phase
boundary. Per-shell cgroups also multiply placement bookkeeping
(per-spawn unique ids) for no benefit, since the kill granularity that
matters is the seat, not the shell.

**Rejected c** (kill including the caller's shell): correct on hygiene
but spends harness behavior on it. The tool call dies mid-return; the
harness either reports a killed call the model may retry (retry errors
with already-moved, burning tokens and confusing the seat) or handles it
fine because the turn was ending anyway — and which of those happens is
per-harness, unproven, and exactly the kind of behavioral dependency this
chart should not buy when option b avoids it for the price of a pid wait.
c remains the fallback if b's helper proves fragile in the pilot.

Evidence:
- T1: cgroup.kill on a populated child cgroup is atomic against an
  actively forking/reparenting tree; zero survivors (probe 2, 2026-11-25).
  The helper's write is the same write as the immediate case — no new
  mechanism.
- T1: membership in a cgroup is by process, not lineage — once the
  caller shell exits, whatever it orphaned stays in `shells/` and dies in
  the same write (probe set, 2026-11-25). So b leaks nothing that a
  doesn't leak worse.
- T2: claude P1 carry — background shells keep hc status `working` and
  delivery stalls; that is why the a-leak is disqualifying rather than
  cosmetic.
- T3: harness tolerance of a killed in-flight tool call is unproven for
  all four harnesses; that uncertainty is a cost of c, not of b.

Pitfalls:
- Helper dies before its write (host pressure, crash) — the caller seat's
  shells survive indefinitely. Removed by: the *next* phase advance
  sweeps everything anyway (shells/ is still there), so the failure is
  bounded to one phase, same magnitude as the locked-in residual. Do not
  build retry machinery for this.
- Pid reuse of the caller shell's pid while the helper waits — the
  helper could wait on an unrelated process. Removed by: bounded wait
  (timeout backstop), which makes reuse a delay, not a hang. (pidfd would
  remove it exactly, at the cost of a less portable primitive — the
  timeout is enough because correctness never depends on the wait.)
- Helper waiting on the wrong pid because the chain was read late.
  Removed by: commitMove reads its own /proc/self ancestry once, at
  commit time, before spawning the helper — a placement fact about
  itself, not a selection inference about others.
- New shells spawned in the tiny window between the caller shell's exit
  and the helper's write die — this is contract-conformant (the turn
  ended at advance), not a pitfall; name it so review doesn't flag it.

Questions the fork does not ask:
- Where exactly is the helper placed so that reconcile's slice-stop and
  the sweep both treat it correctly (leaf slice root processes can't
  exist per no-internal-process when controllers are delegated — but a
  `systemd-run` unit in the leaf slice can, or `keeper/`)? One sentence
  in the brief should fix the helper's unit placement.
- Should the same helper shape serve moves committed from outside any
  seat (operator direct, merge batch)? There there is no caller shell at
  all — immediate kill, no helper. Presumably yes and trivially, but the
  fork's text is written as if the caller always exists.

## Q2 — akrogon's own processes

**Pick: a.** Every akrogon CLI process that starts inside a tool cgroup
moves itself out before doing anything.

Reason: it removes the analysis instead of performing it. Under b,
someone must reason, for every akrogon command now and forever, whether
being killed mid-execution corrupts state: `run-check` writes verdict
rows and admitted records, `next` writes prompt/dispatch state, `pull`
mutates intake state, future commands unknown. That analysis is exactly
the class of reasoning the old leaf kept failing at — per-case argument
about which kills are safe. Uniform migration makes the answer structural:
akrogon processes are never in the kill set, full stop, so no command's
mid-write death is possible by sweep. It is also less code: one
unconditional migration block in the CLI entrypoint, no per-command
decision tree. The cost is near zero — probed: reading /proc/self/cgroup
plus one write, both idempotent, microseconds.

Cost: migration is process-local, so akrogon's *children* (the flock
child inside a run unit, subprocesses it spawns before migrating) are
not covered by the parent's move. In practice run-check spawns systemd-run
after the writer has migrated, and the flock child lives in the run unit,
not the seat scope — but the brief should state the rule as "akrogon
migrates at entry, before spawning anything," which makes the ordering
part of the contract.

**Rejected b** (only the run-check writer moves): leaves every other
command in the kill set. `next` killed mid-dispatch-write is the same
corruption class as the writer — partial state with no repair path. To
accept b you must prove for each command that mid-death is safe; that
proof is per-command, unaudited, and silently invalidated by the next
command anyone adds. b is the guard-not-remove shape, against signpost 1a.

Evidence:
- T1: migration out of a child cgroup into a sibling is one write,
  idempotent, reversible, no error when repeated (probe E, 2026-11-25).
- T1: reading /proc/self/cgroup identifies exact membership including the
  `shells` leaf (trivially observed in all probes).
- T2 (prior session, run-check.ts/admission.ts reading): the writer holds
  admission.lock and writes multiple files in sequence — mid-write death
  is genuinely corrupting, not cosmetic. Under a, this correctness
  property no longer depends on sweep timing at all.

Pitfalls:
- Migration runs outside a seat scope (operator terminal, merge batch,
  non-seat contexts) — must no-op cleanly. Removed by: the guard already
  needed for Q3 (act only when the process sits in the cgroup named by
  the akrogon env marker); same guard serves both.
- Migration of a *shell*-invoked akrogon (the common case) leaves the
  parent shell behind in shells/ — correct and intended (that's Q1), but
  note that the tool call's fate is Q1's question, not Q2's.
- If the migration write fails (scope stopped underneath, permissions
  changed), akrogon must not silently continue in the kill set. Removed
  by: fail loudly at startup — a migration failure means the environment
  is broken in ways the rest of the command can't trust anyway.

Questions the fork does not ask:
- Does the migration rule apply to akrogon processes inside *run units*
  (they never sit in shells/ since payload shells don't migrate — should
  be a no-op by the guard, but the brief should say the guard is by
  cgroup membership, not by env presence alone, since env propagates into
  run units via parentEnv)?

## Q3 — Harness entry

**Pick: a.** One akrogon-owned wrapper, wired per harness kind in
startSeat, acting only when its process sits exactly in the seat scope
root named by the akrogon env marker.

Reason: one mechanism with per-harness wiring *configuration* beats
per-harness mechanisms. The wrapper logic is written once, tested once
(free tests, signpost 2a — real cgroups in tests, verified possible), and
the per-harness part is data: which env var or PATH entry carries it.
Option c multiplies mechanisms (claude prefix semantics unproven, pi
extension loading a code file into the agent runtime, each with its own
quoting/ordering/escaping contract); every divergence is a coverage hole
that fails silently — a shell that escapes placement is invisible until
the masking incident recurs. Option b is dead on evidence: claude's
binary actively strips and refuses BASH_ENV — it is not merely
unreliable, it is adversarial to that vector.

Cost: the wrapper must be correct for both invocation shapes — as a
sourced BASH_ENV script (pi, codex) and as an executed shell binary
(claude `CLAUDE_CODE_SHELL`, agy PATH-shim). One artifact can serve both
if written carefully (a script that migrates then, when executed as a
shell replacement, execs the real bash with the original argv). The exec
path must preserve exact argv including `-c`/`-lc` semantics — testable
free. And the guard must be exactly right: act only in the seat scope
root, because harness infrastructure shells (MCP servers spawned via
shells, helper scripts) and nested shells must not be mis-placed… —
though note nested tool shells inheriting shells/ membership need no
migration at all (already in the kill set, correct). The guard's real
work is distinguishing the harness-direct first shell from harness
infrastructure in the same root cgroup; that distinction deserves one
explicit test per harness in the brief.

**Rejected b**: claude strips/unsets BASH_ENV and carries code paths that
refuse to run commands when it is set (binary strings: `unset BASH_ENV`,
the exclusion regex `^(BASH_ENV|ENV|SHELLOPTS|…)`, `!j_("BASH_ENV")`
gates). Dead for claude, hence dead as the single mechanism.

**Rejected c**: claude's CLAUDE_CODE_SHELL_PREFIX semantics are unproven
(prepend vs wrap vs quoting, whether cloud/marked hooks bypass it — the
binary mentions hooks running "WITHOUT your CLAUDE_CODE_SHELL_PREFIX",
implying some execution paths escape it); pi's extension API injects code
into the agent process, a heavier trust and versioning surface than a
passive env var; codex has no native hook at all, so c degrades into a +
wrapper-for-codex anyway. c is strictly more mechanisms for less certain
coverage.

Evidence:
- T2: claude binary 2.1.332 strings extraction (2026-11-25, prior
  session): BASH_ENV sanitization and refusal gates; CLAUDE_CODE_SHELL
  exists as a supported env var (appears in the binary's env-var table
  `CLAUDE_CODE_SHELL:()=>DI`); shell resolution reads SHELL and prefers
  bash/zsh.
- T2: pi source (earendil-works/pi, read 2026-11-25): bash tool spawns
  `bash -c` with the harness's inherited env; getShellEnv passes the
  process environment through. BASH_ENV reaches pi tool shells.
- T2: codex source (openai/codex, read 2026-11-25): shell detection via
  passwd pw_shell (bash here), `-c`/`-lc` exec; shell_environment_policy
  `inherit` defaults to `All` — environment passes through, so BASH_ENV
  reaches tool shells unless filtered; no shell-path override exists,
  which is why BASH_ENV is the only vector for codex.
- T1: bash reads BASH_ENV in `-c`, `-lc` and script invocations on this
  host; /bin/sh (bash in POSIX mode) reads neither BASH_ENV nor ENV when
  non-interactive (probes, 2026-11-25). This is why agy needs the PATH
  shim if it truly spawns sh — env vars cannot reach a POSIX-mode sh.
- T1: placement is writable without any privilege or Delegate (probes).

Pitfalls:
- Silent non-coverage: the wrapper failing to fire for a harness shape
  produces no error anywhere — shells just escape. Removed by: positive
  verification in the pilot per harness (observe a tool shell's cgroup
  membership in shells/), plus the sweep could log how many pids it kills
  per seat — a seat whose sweeps always kill zero while the seat is
  active is a signal worth one warning line, but no extra machinery
  beyond the count the timing row can carry.
- Harness infrastructure shells (MCP servers spawned through a shell,
  harness update/install scripts) landing in shells/ and dying at the
  first advance. Removed by: the root-exact guard plus per-harness
  spawn-shape verification in the pilot; where a harness provably spawns
  infrastructure through the same shell path, that harness's wiring needs
  the narrower vector (claude's CLAUDE_CODE_SHELL applies to the tool
  shell, not to MCP spawn commands, per how the harness resolves them —
  verify once in the pilot).
- argv corruption in the exec path (dropped `-c`, re-splitting). Removed
  by: free test asserting `bash -c 'echo hi'` semantics through the
  wrapper byte-for-byte.
- `CLAUDE_CODE_SHELL` naming a wrapper *named bash* in a directory — if
  claude validates the shell path (the binary mentions verifying absolute
  paths outside writable scope), naming matters. Removed by: the fork
  already specifies "wrapper named bash"; one pilot observation confirms.
- Run-check payload shells inherit BASH_ENV via parentEnv and would
  migrate into the *seat's* shells/ if the guard were env-only. Removed
  by: the root-exact cgroup guard (payload shells sit in the run unit's
  cgroup, not the seat scope root, so no migration — this is why the
  guard must be cgroup-membership-based, not env-presence-based).

Questions the fork does not ask:
- What happens on harnesses spawning tool shells through an intermediate
  (codex's observed node_repl / codex-code-mode children — if the shell
  is spawned by the helper rather than the harness main process, the env
  still inherits, but has anyone verified the helper doesn't sanitize
  env? one free local codex run answers it).
- zsh: absent here, but claude prefers zsh where installed — on a host
  with zsh, does the wiring still place shells? (BASH_ENV is meaningless
  to zsh; CLAUDE_CODE_SHELL names the wrapper regardless of zsh
  preference, which is another small point for the a shape.)

## Q4 — Delegation

**Pick: no Delegate property.** Create child cgroups without it.

Reason: user-manager scopes already delegate cgroupfs write access to the
user — probed directly: cgroup.procs `-rw-r--r-- ivan`, cgroup.kill
`--w------- ivan`, mkdir of child cgroups, migration, and kill all work
as ivan in plain scopes with no properties. Delegate=yes is not a cost
here, it is a non-action: adding it changes nothing measurable on this
host (probed: subtree_control stays empty, scope type stays domain, root
processes coexist with populated child cgroups either way). Since it buys
nothing, KISS says don't carry it; and since akrogon runs under the user
manager in every supported configuration, the older-systemd insurance
argument is weak — and if some systemd version ever requires it, the
failure is loud and immediate (mkdir EACCES at first placement), not a
silent corruption, so the flag can be added when a real host demands it.

Cost: none measurable. The rejection of the alternative costs nothing
either.

**Rejected** `-p Delegate=yes`: zero observed effect on user scopes
(probe D) — it neither enables needed writes (already present) nor
changes subtree_control. A no-op property in every unit definition is
small but real cost: it invites future readers to believe delegation is
load-bearing and to fear removing it, and on system-mode or older systemd
it *does* change controller delegation semantics (subtree_control
population can interact with the no-internal-process constraint on the
scope root). YAGNI.

Evidence:
- T1: probe series 2026-11-25 — all placement, migration, and kill
  operations succeeded in plain `--user --scope` units with no Delegate.
- T1: probe D (2026-11-25) — Delegate=yes scope: subtree_control empty,
  cgroup.type domain, mkdir/migrate/root-join all succeed identically to
  the non-Delegate probes. No observable difference.
- T3: systemd documentation says Delegate= controls controller delegation
  for the unit; user managers already own their cgroup subtree, which
  matches the observed no-op.

Pitfalls:
- Future systemd version changing user-scope delegation defaults. Removed
  by: the loud-failure property — placement failure is a startup error,
  not silent corruption; the fix (add the property) is one line when a
  real host needs it.
- Someone later assumes Delegate is required and cargo-cults it into new
  unit creation. Removed by: one sentence in the brief recording the
  probe result.

Questions the fork does not ask: none — this question is settled by
probe.

## Q5 — Width

**Pick: wide.** Everything descended from a tool shell ends at advance;
harness-direct children survive by placement (they sit in the scope root
or keeper placement, never in shells/).

Reason: width is what placement gives you for free — it is the *narrow*
option that costs, because distinguishing "shells whose parent is the
harness or another tool shell" requires a parent test, and a parent test
is selection inference: snapshot reads of a mutating process table,
exactly the class the old leaf died of (F1's orphan-drop was a parent-
test failure). Under wide placement the question never arises: whatever
is in shells/ dies, whatever is not, lives; membership was decided once,
constructively, at spawn. The collateral consequences are contract-
conformant, not defects: a seat-started ssh-agent or dev server *is*
leftover seat process state, the leaf's phase ended its legitimacy, and
restarting it next phase is one command. The charter's phrasing targets
"shells", but the mechanism kills shell *trees* — the operator should see
this named explicitly rather than discover it in review.

Cost: harness helpers spawned lazily through a tool shell (rather than
directly) would land in shells/ and die — but probed harness behavior
shows infrastructure (node_repl, codex-code-mode) as harness-direct
children in the scope root (live census, 2026-11-25), so in practice this
cost is hypothetical; where it materializes, the harness respawns the
helper or the wiring gets adjusted. Also: an agent intentionally
detaching long-lived infrastructure (a tunnel it wants to survive the
phase) loses it — that is the contract working as intended, but the brief
should say so in operator-facing terms.

**Rejected** narrow/parent-test: reintroduces per-process inference at
spawn or kill time; the parent test has races (parent exits between read
and test — reparenting reshapes the tree mid-decision, the F1 shape), it
must be re-evaluated as the tree mutates, and it protects nothing the
contract cares about. It is complexity spent to preserve processes the
operator's decision already condemned.

Evidence:
- T1: cgroup.kill on shells/ kills the entire membership tree regardless
  of parentage — orphaned/reparented members die in place because
  membership is per-process (probe 2, 2026-11-25).
- T1: live census of real seats (2026-11-25): codex seat holds
  node_repl ×2 and codex-code-mode as direct children of the codex
  process in the scope root; pi seat is a single process in the root.
  Infrastructure does not sit inside tool shell trees on the deployed
  harnesses.
- T2/carry: old review F1 — parent-test inference is where orphan drops
  came from.
- T3: the operator decision's wording ("leftover seat shells end")
  legitimately reads as shell trees; whether ssh-agent-style daemons are
  in or out is a judgment the operator should confirm, since wide kills
  them.

Pitfalls:
- Agent workflows that legitimately need a process to outlive a phase
  (long compile, tunnel). Removed by: nothing — this is intended; if the
  operator wants exceptions, that is a new contract, not a sweep feature.
  The notes should flag this as the one place the wide reading could
  surprise the operator.
- ssh-agent specifically: seats may depend on agent-forwarded git auth
  across phases if the agent started ssh-agent itself. Removed by:
  environment design, not sweep width — the seat environment should
  provide auth that does not depend on seat-spawned daemons (the
  operator's shell already carries ssh-agent outside the scopes).
- A harness that spawns infrastructure *through* a tool shell would have
  it killed. Removed by: pilot verification per harness (same probe that
  verifies placement coverage); none observed in the deployed harnesses.

Questions the fork does not ask:
- Should the operator confirm the wide reading explicitly? The fork
  frames width as a mechanism question, but it is partly a contract
  question — "shells" vs "anything a tool shell started". One line in the
  operator round.

## Q6 — Seat scope lookup

**Pick: record the unit name in the seat record at startSeat.**

Reason: startSeat already *knows* the unit name — it constructs it
(`akrogon-l<hash>-ak-<leaf>-<slot>-<nonce>.scope`) and hands it to
systemd-run. Recording what you already know is zero inference and zero
IO. Every runtime-resolution alternative re-derives at kill time what was
known exactly at spawn time, and each derivation channel has its own
failure shape: hc's harness pid requires the harness to be alive
(reboot/crash cases — exactly when you most need the sweep to still work
— have no live harness to resolve from); leaf-slice directory enumeration
works but requires filtering non-seat units and joining against seat
records anyway, so it is strictly more steps than reading a field you
wrote. The record is already extended per signpost 3a's existing-records
reading — one string field, no migration (6a: seats that predate the
field fall back to enumeration or are simply old enough to be irrelevant
— the brief can pick, but the field is right going forward).

Cost: one field in the seat record, plus a defined answer for seats
recorded before the field existed (treat missing field as "resolve by
name construction from leaf+slot+nonce if nonce is recorded" — the nonce
is already in the record since it is in the unit name construction —
actually then even the fallback is exact, not enumeration).

**Rejected** resolve-each-time from hc's harness pid: fails when the
harness is dead — crash loops, post-reboot states, the exact dirty cases
where leftover shells most need killing. Selection-by-liveness is the
old design's shape.

**Rejected** resolve-each-time from the leaf slice directory: workable
but strictly dominated — it enumerates, filters, and joins to reconstruct
a fact that was exact at spawn. It remains as the natural fallback for
pre-field records, not as the primary mechanism.

Evidence:
- T2 (prior session, seat.ts reading): the unit name is constructed in
  startSeat from leaf hash, leaf slug, slot, and nonce — deterministic,
  known before systemd-run runs.
- T1: systemctl list-units output shows live units exactly matching the
  constructed pattern (2026-11-25) — name construction and reality agree.
- T1: scope cgroup paths nest under `akrogon.slice/akrogon-l<hash>.slice`
  (live systemctl show, 2026-11-25) — so directory derivation is possible
  but requires the same leaf-hash knowledge the record already holds.
- T3: sweep-after-crash is a real case (hc keep recovery shapes, P2
  carry) — dead-harness states must not make the sweep unresolvable.

Pitfalls:
- Record written before systemd-run actually starts the unit — a failed
  start leaves a recorded name for a nonexistent scope. Removed by:
  cgroup.kill write failure is already warn-and-continue per the error
  policy; a missing scope kills nothing and warns once.
- Unit names embed the nonce; if the nonce generation ever changes, old
  records still carry their exact unit name — the field is immune to
  scheme drift, which is precisely its advantage.

Questions the fork does not ask: none material.

## Probes performed for this exchange (all free, all in throwaway units, cleaned up)

- Probe D (2026-11-25): `systemd-run --user --scope -p Delegate=yes` —
  subtree_control stays empty, cgroup.type domain, mkdir of child cgroup
  succeeds, migration into child succeeds, migration of another process
  into the populated-root scope succeeds. Delegate=yes is a no-op for
  every operation this design performs.
- Probe E (2026-11-25): self-migration write repeated into the same
  cgroup — no error, process unaffected; round-trip migration shells →
  keeper → shells succeeds. Migration is idempotent and reversible.
- (Carried from the map session, same day, same host: atomicity of
  cgroup.kill under live forking; writability without Delegate;
  cross-cgroup migration; EBUSY on slice-root migration; systemctl stop
  recursively cleaning hand-made child cgroups; BASH_ENV firing for
  bash -c/-lc/script and not for POSIX sh; live seat census showing
  harness helper placement.)
