# tool-cgroup rebuttal — slot B

## The extra question first: does Q1-a's same-command survivor stall the advanced-to phase?

Yes, when the survivor is a shell (or whatever a harness counts as ongoing
work) — and the stall is circular. Seats are hc terminals that persist
across a leaf's phases (next.ts `dispatchSlot`: a live idle seat is
prompted again; only missing/finished/lost seats are restarted). The
advanced-to phase therefore prompts the *same terminal* the survivor is
masking. Delivery requires hc to report the seat idle. While the survivor
lives, the seat never goes idle, the prompt never lands, the phase never
advances — and "the next advance bounds it" never comes. The circle closes
exactly as the original incident did; only leaf close breaks it. So:

- **Breaks delivery**: survivor is a live shell or harness-tracked
  background task in a seat that is reused (the normal case), any harness
  with claude's masking behavior, and plausibly others (unproven).
- **Does not break delivery**: survivor is a non-shell untracked daemon
  (ssh-agent shape), or the shell is short-lived, or the harness does not
  count it (pi provably does not). Then it is hygiene-only, bounded at
  leaf close.

The one thing that softens this: the survivor requires the background
launch and the phase call *in the same tool command*. The common incident
shape — background shell started in an earlier tool call — dies in that
earlier tool's `t-` cgroup, which is not spared. Under a, the residual
hole is narrow but, when it fires, unbounded.

## Point 1 — Q1: a (A,C,D) against b (B). Keep or change?

**Change to a-with-the-deferred-caller-kill, i.e. adopt a's granularity
and keep b's timing for the caller's own `t-`.** If the merged fork
forces a strict either/or, I stay with b, because a-as-written carries a
certain leak with an unbounded stall and b's worst case is a rare bounded
one. But the honest position after reading the merge: granularity and
timing are orthogonal, and the best shape is a's granularity plus b's
helper for the caller cgroup only.

What changed my view:

- **D N5 removes the center of my objection.** Orphaned children die in
  their shell's own `t-` because membership is per-process; nested bash
  stays in the `t-` it was born in. The kill granularity is correct per
  shell *without* any cross-cgroup tracking, and the only spared cgroup is
  the caller's one — a strictly smaller leak surface than I credited a
  with. Combined with the same-command requirement, the common incident
  shape is dead under a.
- **Minting is cleaner than I assumed.** The entry mints `t-<pid>-
  <starttime>` at spawn, reuse-proof by construction (D), empty dirs
  rmdir-able (N3: populated EBUSY means cleanup is trivially safe). The
  bookkeeping cost I charged a with mostly evaporates — the id is free at
  the moment of migration.
- **b's helper is not as cheap as I wrote.** D correctly prices it: a
  spawn or bus call under the home lock per move, plus the wait plus the
  backstop. That machinery runs on the hot path of every phase commit in
  the system.

What does not change: the survivor stall above is real under pure a, and
"the next advance bounds it" is circular for reused seats. A never
answered that circularity; the merged file's cost line ("survives one
advance") understates it — it survives until it dies, and while it lives
there is no next advance for that seat.

The deciding observation: the helper under the hybrid is *one pid wait
and one write, outside the lock's critical section, identical in kind to
b's* — but under the hybrid it only ever handles the caller's single `t-`
(all other seats already killed synchronously), so its failure mode
shrinks to exactly the pure-a leak: if the helper dies, you get a's
behavior, never worse. Hybrid strictly dominates pure a (same machinery
minus the certain leak) and strictly dominates pure b (the helper no
longer gates total hygiene, only the caller cgroup). The one reason that
should decide the fork: **adopt per-shell granularity (a's evidence N1–N5
is strong), and do not spare the caller's `t-` forever — kill it deferred;
if the operator rules the helper out entirely, then a-as-written is
acceptable only with the stall risk named in the operator round, because
its trigger is rare and the alternative costs a process on every commit.**

## Point 2 — Q3 wiring: per kind (A,B,C) against D's added BASH_ENV base layer

**Change to D.** The deciding observation is D's paid probe: claude
2.1.332 ran tool calls with BASH_ENV set and firing — the stripping and
refusal gates C and I read in the binary did not engage in that
configuration. Behavior beats string inference, so the cost I feared
(claude breaking under BASH_ENV) is unproven rather than established, and
confined to configurations differing from the probe. Against that, the
benefit is real and structural: this design's worst failure is the
*silent* escape — a shell outside the kill set produces no error anywhere.
A second independent placement channel on a harness where both are
observed firing is cheap insurance for exactly the worst failure mode,
plus generic coverage for future bash-using harnesses before per-kind
wiring exists. One caveat the handoff should carry: the BASH_ENV layer
must be verified non-interfering per harness in the pilot (claude's gate
condition is unobserved — possibly sandbox mode), and the base layer is
redundancy, never a substitute for the per-kind wiring.

## Point 3 — Q4: Delegate (A,C,D) against none (B)

**Change to Delegate=yes.** What changed my view: I went to systemd v262
source to test the flatten claim (free observation, recorded below).
Verdict: the documented `Delegate=` contract ("the service manager will
refrain from manipulating control groups or moving processes below the
unit's control group") is the only ownership guarantee that exists. In
cgroup.c, recursive trimming of a unit's subtree happens at unit stop/
inactive (`unit_prune_cgroup`, `unit_remove_subcgroup`, manager shutdown)
— I found no code path that flattens sub-cgroups of a *live* unit, reload
included. So the specific flatten scenario is not backed by a mechanism I
could find in v262. But that is a negative result about today's code, not
a contract: without Delegate, our sub-cgroups live in manager-owned
territory by the documentation's own framing, and any future systemd
behavior there is legitimate. The property costs nothing measurable
(probe in my notes: no observable effect on user scopes — though note
that same probe means it also does not populate subtree_control, so the
controller side is irrelevant anyway; what we are buying is purely the
documented ownership promise). A documented guarantee at zero cost beats
an undocumented behavior that happens to hold today. My original "fail
loudly when a host needs it" argument inverts: the failure mode Delegate
protects against is *silent* emptying of `tools/`, which is precisely the
kind that does not fail loudly.

Free observation recorded: read of systemd v262 `src/core/cgroup.c`
(2026-11-25, raw.githubusercontent.com mirror of github.com/systemd/
systemd tag v262): cgroup trimming of unit subtrees occurs in
`unit_prune_cgroup` (inactive/stopped units), `unit_remove_subcgroup`
(client-requested, requires delegation), and `manager_shutdown_cgroup`.
No flatten-on-reload or realize-time prune of live unit sub-cgroups
found. `Delegate=` per systemd.resource-control(5) establishes subtree
ownership.

## Point 4 — Q6: enumerate (A,C) against record (B,D)

**Change to enumerate.** A's filter answer removes my objection. I had
argued against enumeration as naming-scheme inference; the merged filter
is not that — "scope inside the leaf slice that has a `tools/` directory"
is structural evidence of participation in the kill design, not a name
pattern. Run scopes never match (no tools/ minted there — the root-exact
guard confines minting to seat scope roots), guard services never match.
And D's concession stands: recording is exact but blind to orphan scopes
of replaced seats — hygiene holes bounded only at leaf close — and the
enumeration reaches them for free because they carry the same structural
marker. What settled it beyond that: enumeration is not inference over a
mutating tree in the old design's fatal sense. The kill is atomic per
cgroup; a scope appearing or vanishing mid-enumeration is either swept in
this pass or the next advance or leaf close — the cost of a race is a
bounded delay, never a wrong victim. That was the actual test the old
leaf kept failing, and enumeration passes it. Recording the unit name at
startSeat is still worth keeping as a fallback-free *addition* only if it
is free — but as the mechanism, enumeration is stateless, migration-free,
and replacement-proof, which is signpost 3a (fewest moving parts) read
correctly.

## Evidence still missing before handoff

- pi end-to-end: I have nothing beyond what the merge carries; source-
  level evidence is strong (inherited env, bash -c), and the residual is
  a pilot observation, not a design input. No free observation needed —
  a pi tool shell's cgroup membership can be read off any live pi seat
  once the implementation exists; verifying it before then requires a
  paid run and the design does not depend on the answer.
- agy: no conclusion possible without auth. One free observation the
  handoff can use: since P-agy could not reach a tool, the agy wiring
  (PATH shim vs SHELL forcing) should be decided by whichever is less
  machinery rather than by evidence — and I note the PATH shim serves a
  POSIX-sh spawner that no env var can reach, so if agy truly spawns sh,
  the shim is the *only* channel, not one of two.
- claude/codex exact final env shape: covered by my Point 2 caveat — the
  pilot must confirm the BASH_ENV layer does not trip claude's gate in
  the exact deployed configuration (the binary's refusal condition is
  unobserved; sandbox mode is my guess at one trigger).
