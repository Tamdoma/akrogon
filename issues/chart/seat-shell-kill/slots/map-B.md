# Seat-shell-kill territory map — slot B

## 0. What the contract must hold

From intake, locks, the old fork, and the failure evidence, the load-bearing
requirements, ranked:

1. Leftover seat shells end when the leaf's phase advances. This is not only
   hygiene: claude's delivered-proof (P1 in the old review) shows a shell left
   alive keeps hc reporting the seat working, which blocks prompt delivery to
   slots of the next phase. The sweep *is* delivery infrastructure.
2. The selection must not race the tree it selects from. The leaf died because
   every selection built on /proc-and-cgroup snapshots of a concurrently
   mutating tree. F1, F2, F3, F6, F8, F11, F12 are all instances of one class.
3. Run-check writers must not be killed mid-write. The writer records are the
   state the merge gate reads; partial or missing rows corrupt lifecycle state
   in a way retries cannot repair.
4. Harness processes must survive the sweep, or the seat dies mid-phase.
5. Bare-shell recovery (hc respawning a dead terminal as a shell) counts as a
   lost seat. Uncontested in round 3; orthogonal mechanics, small surface.
6. Residuals accepted by the seed decision: shells started *after* the phase
   call in the same turn, and turns that end with no phase call at all, are
   out of scope. F1-residual names the periodic wake as a separate-chart
   candidate. I do not re-open this, but the chosen design should not make
   that future chart harder.

## 1. Platform facts I verified live on this host (systemd 262, kernel 7.2.15, cgroup v2)

These are probe results, not documentation citations. Each was reproduced in
throwaway `systemd-run` scopes under user.slice.

**P-a. `cgroup.kill` is atomic against a live forking tree.** I ran a shell
that forked children continuously inside a scope (12 concurrent members at
the moment of the write, new ones appearing every few milliseconds).
`echo 1 > cgroup.kill` killed every member including ones forked during the
write; zero survivors, verified by scanning all of cgroupfs for the probe
binary. This is a single kernel write, not a signal loop: there is no
enumeration, no per-pid delivery, no window. F1's class (orphan drops),
F3's class (non-atomic signalling), F6 (untested kill), F8 (async pipe
misdelivery), and the `kill -0` liveness test all cease to exist because the
mechanism they belonged to ceases to exist.

**P-b. User scopes and service cgroups are writable as ivan with no
`Delegate=` anywhere.** cgroup.kill is `--w------- ivan`, cgroup.procs is
`-rw-r--r-- ivan` in every scope I created with plain `systemd-run --user
--scope`, and in my own hc terminal's service cgroup. A process inside the
scope can mkdir child cgroups and migrate processes between them. This
matters twice over: no systemd property changes are needed, and the
experimental tests for the real `cgroup.kill` write can run inside any akrogon
dev/test shell that itself sits in a user-owned cgroup (I verified mkdir works
inside my own hc service cgroup). F4/F5/F7's "the kill path cannot be tested
in tests" is solved by the platform, free.

**P-c. Cross-cgroup migration works and is the natural escape hatch.** A
process can write its own pid (or another same-user pid) into a sibling
cgroup's cgroup.procs. An emptied scope goes inactive and its unit unloads
within a second — cgroup membership is mutable state, and any design that
reads membership as a roster is reading a moving target. Migration into a
scope *root* works even when the root has populated child cgroups (verified).
Migration into a *slice* cgroup root fails with EBUSY because systemd
enables domain controllers in slice subtree_control (no-internal-process
constraint). So the migration target for spared processes must be a child
cgroup inside the seat scope, e.g. `<scope>/keeper`, or the scope root —
never the leaf slice.

**P-d. `systemctl stop` recursively removes hand-created sub-cgroups.** I
created `<scope>/shells` by hand inside a scope, stopped the scope, and the
whole subtree vanished cleanly. Reconcile's slice-stop path needs no changes
for hand-created children.

**P-e. A scope unit whose root cgroup.procs is empty stays active as long as
a child cgroup has members** — systemd counts descendants. And scope-root
cgroup.kill is transitive into child cgroups. So "kill the whole scope"
kills harness + everything; "kill a child cgroup" kills exactly that child's
members, sparing siblings. The kill granularity is exactly the cgroup tree
we choose to maintain.

**P-f. `BASH_ENV` fires for `bash -c`, `bash -lc`, and bare `bash script.sh`
(all non-interactive invocations) on this host's bash.** Not for interactive
shells. `/bin/sh` here is bash in POSIX mode, and in POSIX mode it reads
*neither* `BASH_ENV` *nor* `ENV` for non-interactive shells (probed) — sh-
invoked shells escape both interposition variables entirely.

## 2. Harness shell-spawn mechanics (per harness, source-verified)

**pi (deployed as slot A here).** `getShellConfig` prefers `/bin/bash`
(exists here), spawns `bash -c` with `env: env ?? getShellEnv()` — the
harness's own environment, inherited. So `BASH_ENV` set in the seat scope
environment reaches every pi tool shell. Additionally pi supports a proper
extension API: `createBashTool(cwd, { spawnHook: ({command, cwd, env}) =>
... })` rewrites the command before execution, loadable with `pi -e
./ext.ts`. Two independent interposition routes. Masking: pi does not track
background children for status; it waits on the shell exit not on pipe EOF
(#11613 fix) and only kills tracked shell trees when the pi *session* exits.
So pi seats do not mask delivery the way claude does — the sweep remains
hygiene plus delivery-proof for whatever harness does mask.

**codex (deployed as slot B here).** Rust binary; shell detection reads the
passwd entry (`pw_shell`), ivan's is bash. Executes via `bash -c` or `-lc`.
No shell-path override config exists; `allow_login_shell` only. Environment
policy: `shell_environment_policy.inherit` defaults to `All` — the harness
environment passes through to tool shells (source-read, worth a free
empirical confirm). If unfiltered, `BASH_ENV` reaches codex shells. Since
`bash -lc` also reads BASH_ENV (probed), the login-shell default does not
matter.

**claude.** Resolves bash/zsh/sh, prefers zsh on darwin, bash elsewhere,
honors the SHELL env var. **The binary actively sanitizes BASH_ENV**: it
carries `unset BASH_ENV`, an exclusion regex `^(BASH_ENV|ENV|SHELLOPTS|...)`,
an unsandboxed-exec-inlet classifier naming BASH_ENV/LD_PRELOAD/NODE_OPTIONS,
and code paths that *refuse to run commands* when `BASH_ENV` is set
(`!j_("BASH_ENV")` gates). `BASH_ENV` as the interposition vector is dead
for claude — not merely unreliable, adversarially removed. What claude does
offer: `CLAUDE_CODE_SHELL_PREFIX`, an env var that wraps/prepends every Bash
tool command (the binary contains `shell_prefix` handling in command
construction). If the prefix is prepended inside the command string, a prefix
that self-migrates the executing shell (`echo $$ > .../shells/cgroup.procs`)
tags every claude tool shell regardless of shell flavor. Exact prefix
semantics (prepend vs wrapping, quoting, ordering relative to the user's
command) need one extraction pass or one paid probe. There is also a
`shellPath` provider concept in the binary; `SHELL` env may influence tool
shell selection — worth one look.

**agy.** Strip-obfuscated binary; strings show `/bin/sh` usage and SHELL env
reads. If it spawns `/bin/sh`, POSIX-mode bash reads nothing — agy tool
shells escape all env interposition unless akrogon sets `SHELL=/bin/bash` in
the seat environment (in which case bash + BASH_ENV applies, if agy honors
SHELL). This is the weakest-known harness and needs one binary inspection
pass before the brief is written. agy is not in this repo's operator config
(pi + codex are), but akrogon supports it.

**zsh is not installed on this machine.** Not a current coverage hole;
flagged only because claude prefers zsh where present.

## 3. The shape of the solution space

The old design's failure is one sentence: *selection is inference over a
snapshot of a mutating tree*. Every review round patched the inference and
the inference re-broke. The design space splits on one axis: do we select
victims at kill time at all?

**The alternative the platform hands us: make membership explicit before the
fact, then kill indiscriminately.** cgroup.kill on a dedicated cgroup is
selection-free. The entire problem reduces to one question: *how do shells
get into the tagged cgroup, and how does everything we must spare stay out?*
That is a placement problem, and placement problems have constructive
answers where selection problems only have race-prone inference.

### Design S — tagged shells cgroup (my primary)

- At seat launch, the seat scope carries two hand-made child cgroups:
  `shells/` and `keeper/` (created lazily with `mkdir -p` semantics by
  whoever needs them first; creation is idempotent and owned by akrogon
  inside the scope).
- Tool shells self-migrate into `shells/` at spawn, via the strongest
  available per-harness interposition: BASH_ENV shim for pi and codex (and
  agy if SHELL can be forced to bash), CLAUDE_CODE_SHELL_PREFIX for claude.
  The shim line is one `echo $$ > $AKROGON_SHELLS_CG/cgroup.procs` guarded
  to no-op outside seat scopes, so it is harmless anywhere else.
- `akrogon` CLI processes self-migrate out of `shells/` into `keeper/` at
  startup when they find themselves inside it (read /proc/self/cgroup, one
  write). This single rule covers run-check writers (no mid-write kill —
  the *process* is out before it does anything, so the F2 class is gone
  without any census or admission-lock involvement), akrogon phase itself,
  and every other akrogon invocation, uniformly.
- Sweep at commitMove: after each move record saves, for every recorded
  seat in order (current seat last), write 1 to `<seat scope>/shells/
  cgroup.kill` and append the timing row before the write. Failure warns,
  move stands (existing error policy).
- The caller shell question (below) is the one real cost center.

### Design R — kill the whole scope and restart the harness

Kills everything with zero placement machinery (scope-root cgroup.kill is
transitive, no interposition needed at all). Rejected on inspection:

- The caller problem becomes existential: the caller harness is inside the
  kill set, so `akrogon phase` cannot survive its own commit, and no
  in-process code can restart a harness whose terminal it is dying inside.
  The restart would need an external re-launcher with full session-resume
  semantics per harness, i.e. a second orchestrator. That is strictly more
  machinery than placement.
- Mid-turn other-seat shells lose not just shells but their harness —
  destructive where S is rude. In the check.review round-0 case (A and B
  concurrent), the first committer would kill the other seat's harness
  mid-review. Hardly defensible.
- MCP servers and harness helpers restart every phase boundary; some
  harnesses treat MCP death as session-fatal.

R's one true advantage — zero per-harness coupling — does not survive its
costs. Include it in the chart's forks for completeness; recommend against.

### Design S2 — no interposition: baseline census + kill scope root (fallback)

If per-harness interposition proves unworkable for a harness we must
support: at seat start, after scopeEntry/firstTask, census the scope's
existing {pid, start_time} pairs as keepers. At sweep, migrate verified
keeper pids + akrogon processes into `keeper/`, then cgroup.kill the scope
root (transitive — but there is no shells child cgroup here, so root kill =
everything not migrated). Properties:

- No per-harness anything. Uniform across all four harnesses and future
  ones.
- Still kills every lazily-spawned harness helper not in the census
  (codex's node_repl / code-mode host if they appear after the census;
  MCP servers started mid-phase). Bounded collateral: the harness either
  respawns them or degrades. This is the design's real risk and it is a
  per-harness behavioral question anyway — the census timing problem is
  the same class of unknown as interposition coverage, just relocated.
- PID reuse is handled by start_time verification; a baseline member that
  execs into a shell is a small escape hatch.
- systemd-run client processes transiently in the scope (run-unit
  migration) would die mid-migration — payload never starts, writer alive,
  record consistency holds, but the run-check fails spuriously. Narrow
  timing hole; needs the systemd-run client itself to migrate early or the
  sweep to spare `systemd-run` comms — and comm-based sparing is selection
  inference creeping back in. This hole is small but real, and S doesn't
  have it.

S2 is a legitimate fallback fork, not the recommendation: it trades small
per-harness shim work for ongoing helper-culling damage and a systemd-run
hole, and its complexity lives at sweep time instead of at placement time.

### Rejected outright

- **Freeze-then-kill** (cgroup.freeze + enumeration): pure overhead;
  cgroup.kill is already atomic. Two-phase commits are how the old design
  died.
- **prctl subreaper + SIGKILL loop on the harness**: not atomic against a
  forking loop, same class as pkill. The old review's own verdict applies.
- **systemd unit properties (ExecCondition, ExecStopPost, watchdogs,
  Delegate=)**: nothing in the unit model fires at akrogon phase advance;
  systemd knows nothing about phases. Delegate= is unnecessary anyway per
  P-b (adding `-p Delegate=yes` anyway is one cheap flag of insurance for
  older systemd, worth one line in the brief).
- **PATH-shim binaries for bash/sh**: claude resolves `/bin/bash` by
  absolute path; shims only catch PATH resolution. Dead as primary;
  harmless as defense-in-depth but adds a moving part.
- **Killing by reading run records' pid/boot_id** (the census direction):
  that is the old design's inference in a trench coat.
- **hc-level masking instead of killing**: locked out by the operator
  decision. Not re-opened.

## 4. The caller-shell question — the one genuine fork inside Design S

`akrogon phase` runs as a grandchild of a tool shell that lives in
`shells/`. The sweep must not kill the state writers — solved by akrogon
self-migration. But the caller *shell* is still in `shells/`, and the
harness is waiting on it. Options:

**C2 — spare nothing but akrogon processes.** akrogon migrates itself out,
commits, writes rows, writes kill. The parent tool shell dies at the kill
write; the harness observes the tool call as killed/failed. Costs: the
model sees a failed phase call and may retry (retry errors "already moved"
— noise, burn) or, per the harness, may never see the result because the
turn was ending anyway. Gains: nothing ever accumulates in keeper/ — every
sweep is total, shells/ is empty after, reparented orphans land in the
scope root and are shell-tree fodder for the *next* sweep only if a shell
re-adopts them... actually no: orphans reparent to the harness and stay in
`shells/` membership-wise only if they were in shells/; a shell's
background children are in shells/ and die in the same kill. Nothing
escapes. Hygiene is absolute.

**C1 — spare the caller chain.** At sweep time, walk /proc up from
getppid() to the harness, migrate each ancestor found inside `shells/`
into `keeper/`, then kill. The tool call completes cleanly. Costs: (a) the
walk is a small snapshot read, but note carefully — it is *placement*, not
selection: the cost of a mid-walk exit is a process we failed to spare,
never a wrong kill, so the race window is failure-degraded, not
correctness-critical; (b) accumulated members of keeper/ are sweep-immune
forever: if a spared caller shell exits mid-turn leaving orphaned
background children, those orphans reparent but *stay in keeper/* (cgroup
membership survives reparenting) and no future sweep touches them. That
is a containment leak exactly in the incident's shape. Mitigation exists —
sweep `keeper/` of all *other* seats, or re-migrate keeper members of the
calling seat back into shells/ once the phase call completes (impossible:
the sweep ends before the shell exits) — each mitigation adds machinery
that reintroduces timing. The leak is small (requires the caller shell
itself to orphan shell children) but it is the old failure shape wearing a
smaller coat.

My read: **C2 is the better default, and it is closer to the contract**
("leftover seat shells end when the phase advances" makes no exception for
the caller's shell). The tool-call-killed noise is real but cosmetic, and
the harness's turn is ending at that moment regardless. C1 is the fallback
if the noise proves to break harness behavior in the pilot (e.g. a harness
that hard-errors the session on a killed in-flight tool call — unproven
either way; that is exactly what a paid pilot probe answers). The chart
should carry this as a named fork with the behavioral risk stated, not
bury it.

One more wrinkle either way: the sweep order must be other-seats first,
own seat last, rows before kills — so that even if the akrogon process
somehow dies mid-sweep, the recorded move and other seats are already
handled. And commitMove must sweep on every move including failed/merged
terminal moves (hygiene) — no reason to exempt them.

## 5. Pitfalls the brief must name

- **Interposition coverage is per-harness and unproven for three of
  four.** pi: BASH_ENV proven by source reading, spawnHook as backup.
  codex: BASH_ENV probable (inherit:All default), unproven. claude:
  BASH_ENV is adversarially stripped — CLAUDE_CODE_SHELL_PREFIX semantics
  unknown, one extraction or probe needed. agy: /bin/sh suspicion, needs
  inspection. A shim that does not fire is a *silent coverage hole* —
  shells escape the sweep with no error anywhere. The brief must demand a
  positive verification (the shim leaves a marker/observable effect) in
  the pilot for each harness, not just absence of failure.
- **BASH_ENV collision with the harnesses' own uses**: if a harness (or a
  repo's own tooling) sets BASH_ENV for its own purposes, akrogon's shim
  and theirs fight. Mitigation is trivial (the shim file can source a
  pre-existing BASH_ENV target, or the env value can point at akrogon's
  file which chains) but must be named.
- **Non-bash tool shells escape the shim.** `sh -c` invocations (agents do
  this), explicit `/bin/zsh`, scripts with other interpreters' shebangs
  that then spawn shells. Each is a coverage hole in shells/ placement.
  This is the honest residual of Design S: placement is opt-in at spawn
  time via the shell binary's own startup behavior. The sweep still
  improves strictly on today (the hole is smaller than the incident), and
  escaped shells still die at slice-stop when the leaf closes — but the
  brief must not claim totality. One mitigation: the PATH-shim layer for
  `sh` specifically, since /bin/sh-as-bash reads nothing.
- **The admission-lock stall and the census races (F2, F9–F12) die with
  their machinery.** The brief should say so explicitly: run-records keep
  their existing meaning for admit/reap/verify; nothing in the sweep reads
  them anymore. Signpost 3a honored — the records are not extended, they
  are simply no longer consulted by the sweep.
- **cgroup path derivation**: seat scopes live at `.../akrogon.slice/
  akrogon-l<hash>.slice/<unit>.scope` (verified live — note the extra
  `akrogon.slice` layer that scope.ts's leafSlice naming implies). The
  sweep needs unit names; they are deterministic from leaf + slot + nonce
  in seat.ts's naming, or enumerable from the leaf slice's cgroup
  directory. Prefer enumeration of the leaf slice directory filtered to
  recorded seats — no naming-coupling, no guessing.
- **D-state/uninterruptible processes**: cgroup.kill does not reap a
  process in uninterruptible sleep instantly. The sweep must be write-and-
  forget (no wait under any lock) — which it naturally is.
- **systemd_gcunit**: empty scopes unload; shells/ and keeper/ vanish with
  the scope at stop (P-d). No leak. But note mkdir-race: two processes
  creating shells/ concurrently — mkdir EEXIST is fine, use it.
- **claude's command sandbox**: claude has a sandbox mode that affects
  what shell commands can do (its strings mention sandboxed accounts
  unsetting BASH_ENV). Whether a sandboxed claude tool shell can write to
  cgroupfs at all is unknown. Seats here run with full permissions, but
  the brief should note sandboxed-harness configurations as a coverage
  limit.
- **A shell that never exits as the phase-calling command itself** (agent
  writes `bash -c 'while true; ... akrogon phase ...'`): the caller chain
  in shells/ means the looping shell dies with the sweep under C2, and
  survives only the call under C1. Either way `akrogon phase` ran and the
  move committed; this is an agent-behavior pathology, not a design hole.
  Worth one line so review doesn't rediscover it as a "finding".
- **firstCommit/secondCommit (two-record moves)**: the sweep runs per
  record commit; in two-record moves the first commit sweeps while the
  sibling seat is still being awaited. The other seat's shells die — same
  as any concurrent case, consistent, but the brief should say the sweep
  fires on every record commit, not once per move-pair.
- **Signpost 2a (free tests)**: real cgroup.kill semantics are testable
  free in any akrogon test shell because user cgroups are writable (P-b) —
  tests can create a scope, populate shells/ with real sleep processes,
  run the sweep, assert the processes are gone. The old leaf's fake-cgroup
  test debt (F4/F5/F7) has no reason to survive.
- **hc probes are pi/codex-relevant, not claude-relevant, in this repo's
  deployment** — but claude is a supported harness and other repos may use
  it. Charting proofs should cover claude if the grant allows; the brief
  decides what the implementation leaf must re-verify per signpost 2a.

## 6. Forks I would put to the chart

1. **Kill mechanism**: cgroup.kill on a tagged child cgroup (recommended,
  this is close to forced by the evidence) vs scope-root kill with restart
  (R) vs baseline census + root kill (S2) vs keep-inferring (rejected —
  but the operator should see it named as rejected, not silently absent).
2. **Placement mechanism** (inside Design S): per-harness interposition
  matrix — BASH_ENV shim where viable, CLAUDE_CODE_SHELL_PREFIX for
  claude, spawnHook for pi as alternative, SHELL forcing for agy. The
  fork: uniform-env-only (BASH_ENV everywhere it reaches, accept claude
  escaping until prefix semantics are proven) vs full-matrix. I recommend
  full-matrix but staged: implement the shim generic mechanism once,
  configure per-harness env injection in the harness launch config
  (akrogon.yaml harness env), so coverage is data, not code.
3. **Caller-shell fate**: C2 (spare akrogon processes only — recommended)
  vs C1 (spare the chain, accept keeper accumulation). Behavioral risk
  both ways; the pilot decides, but the default should be C2.
4. **Residual acceptance**: the F1-residual periodic-wake seed is already
  locked out. The new residual to state explicitly is shim-escaped shells
  (non-bash tool shells) — smaller than the old residual, and slice-stop
  still bounds their lifetime to the leaf's life.
5. **Bare-shell lost seat**: orthogonally specified, small; no fork
  needed, but it shares zero machinery with the sweep — say so, so the
  leaf doesn't entangle them.

## 7. What I would probe before writing the brief

Free (no model cost):
- Verify codex tool-shell env inheritance empirically in a local codex
  non-interactive run (`codex exec` equivalent) — print BASH_ENV from a
  tool call. If codex passes it, the two deployed harnesses are fully
  covered by one shim file.
- Extract CLAUDE_CODE_SHELL_PREFIX semantics from the binary (one pass
  over the already-located shell-prefix construction code).
- Inspect agy's shell spawn strings once more, focused on argv construction
  around `/bin/sh`.
- Check whether hc's working/idle signal for pi seats is pi-reported
  (OSC 7501) or child-count — determines whether pi even has a masking
  mode. Source read of pi's status reporting plus hc's reader.

Paid (small, justified):
- One claude seat pilot: background shell, seat completes its phase, watch
  the sweep kill it and hc flip idle, observe how claude reports the
  killed caller-shell tool call (C2 noise question answered directly).
- One codex seat pilot same shape — also answers codex's masking question
  (does codex count background shells as ongoing work?) which is genuinely
  unknown.
- Pi pilot optional: pi provably does not mask; hygiene-only verification
  can be a free local pi run if pi supports offline/noop models — else
  fold into the first real pi seat run in the implementation leaf's
  dogfood.

## 8. Bottom line

The old leaf kept failing because selection-over-snapshots cannot be made
race-free; every fix round was proof. The platform provides atomic kill
with zero selection (cgroup.kill) and user-level cgroup placement with
zero privilege or configuration (no Delegate needed). The entire design
problem collapses into a placement problem — getting shells into a tagged
cgroup at spawn and keeping writers out — and placement is constructive:
it either works observably or fails loudly at the boundary, per shell, at
spawn time, instead of silently mis-selecting at kill time. The residual
risks move from "wrong victim chosen in a race" (unbounded, invisible) to
"some shell escaped tagging" (bounded, probe-able, and still bounded by
slice-stop at leaf close). That is the right trade and I expect any
independent reading of the same evidence to land within one fork of it.
