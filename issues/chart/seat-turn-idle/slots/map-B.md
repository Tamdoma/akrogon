# Territory map: five akrogon charts — slot B

Independent map, written blind. Citations are file:line in /home/ivan/Work/infra/akrogon at the session's main. Facts marked (probed) come from live probes I ran in throwaway hc terminals during this mapping; facts marked (binary) from reading the pi and claude binaries.

## Cross-cutting observations that reshape several charts

1. herdr-core passes OSC 7501 status through verbatim and does not compose it with child processes (probed: terminal with live backgrounded children, including disowned/setsid ones, kept `status.state: done`, `turn` advanced). The `working` mask in the incident is composed inside the claude harness, not in hc. hc's schema exposes `records` — "Other 7501 records by id" — and `foreground` (pid/argv/cwd of the foreground process-group leader).
2. The mask has a precise shape (probed live, claude 2.1.331 haiku): while a turn-started background shell lives, root status is `{state: working, msg: "1 shell still running"}` and `records` holds one entry per shell keyed by shell id (`{state: working, title: <shell title>}`). When the shell dies — even killed externally, with no claude involvement — the root flips to `done`, `turn` advances, `records` clears. claude notices shell deaths on its own.
3. Injecting a prompt into the masked state is processed cleanly as a new turn (probed: second prompt executed, file written, `turn` advanced). claude accepted the input mid-"working" and worked it.
4. Decisive negative fact: a genuinely working turn is indistinguishable from a masked ended turn through hc (probed: model mid-work with a live background shell shows the identical triple — root `working`, same `msg` shape, per-shell records). No hc field separates "agent busy, shell running" from "agent done, shell running". `foreground` does not help: the harness process is always the foreground leader in both states.
5. pi does not mask (binary: its program-status-reporter keys strictly off agent-loop events — `agent_start` → working, assistant `message_end`/`agent_settled` → done/idle — with no shell-awareness anywhere). pi emits no per-id records. So the masking defect is claude-specific today; codex unknown (unobserved).
6. Seat shells are direct children of the harness root process (probed: `bash` wrapper pid parented to the claude pid, inside the seat's systemd scope under `akrogon-l<hash>.slice`). The seat's unit is `<slice minus .slice>-<seatname>-<rand4>.scope` (src/seat.ts:70-71), discoverable exactly from `/proc/<seatpid>/cgroup` since seats.yaml records the hc address and hc exposes the pid.
7. `constructedEnv` (src/run-check.ts:70-88) is shared by `run-check` and `verify` (checkedRun src/run-check.ts:343), so one env fix covers both. It copies only `HOME, PATH, XDG_CACHE_HOME, FAKE_SYSTEMD_RUN_LOG, AKROGON_HOME` plus repo `env`/`pass_env`, pins `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` (an explicit cut, so no dbus fallback path exists), and never carries `DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY` or `XDG_RUNTIME_DIR`. hc terminals do inherit the session display (probed: WAYLAND_DISPLAY survived through a two-layer hc spawn). The systemd scope re-passes `XDG_RUNTIME_DIR` only when present in the client env (src/scope.ts:70-77), so copying it in constructedEnv is sufficient end to end.
8. Lifecycle leaf rows in `akrogon status` come only from scanning `issues/open` (src/status.ts:259, 443-445); chart rows render only fork counts, stage, age (src/status.ts:476-486, header at 379). Runs under `--holder` are recorded with leaf slug `checkout` (src/run-check.ts:213) — unjoinable to any chart. `--leaf` already exists and reads any leaf folder path (src/run-check.ts:181-184).
9. Verify receipt rows are z.strictObject (src/verify.ts:58-102); attempt rows carry no verify/run key (src/attempts.ts:76-90). The live admission record already carries `attempt` (src/run-check.ts:355) — the writer has the join key in hand and drops it at finalization. Bun prints per-test `[<ms>]` on both pass and fail lines; the flaky parser's regex already matches but discards the duration group (src/flaky.ts:31).

---

## Chart 1: seat-turn-idle (#157)

### Mechanism as it is today

Seed confirmed in effect, relocated in cause. The stall chain: `dispatchSlot` delivers only when the seat's root status is `idle` or `done` (src/next.ts:617-618). `observeBusy` (src/next.ts:159-225) records `busy_since` and posts a notice after 60 min (STALL_MS src/next.ts:157) but never acts. Silent-end counting (src/next.ts:543-560) fires only when the terminal itself finished; turn-end counting (src/next.ts:640-668) fires only when `seat.turn` advances past the prompted turn. A masked seat defeats all three at once: root status never leaves `working`, turn never advances, terminal never finishes — the leaf waits forever, exactly the incident. The seed implies the masking is a property of the seat/hc layer; probes relocate it: herdr-core passes status verbatim, and claude itself holds root at `working` while a background shell lives. Note the intake's `records` reading was absent in the incident record — my probes show records are the mask's fingerprint; whether they appeared in the incident is unverified but irrelevant to the fix shape.

### Material finding the door must weigh against the decision

The decision's first clause — "a seat whose agent turn has ended counts as idle for prompt delivery even when a background shell it started is still running" — presumes the ended turn is distinguishable. Probe fact 4 says it is not: genuine work and masked-end are the same hc surface. Implementing the clause literally means delivering into states that may be genuine work. This is a fact-with-consequence the chart must carry, not a re-argument of the decision: the question becomes which realization of the decision's intent survives it.

### Forks

**F1 — How "counts as idle" is realized.**

- O1: Treat root `working` + only shell-id records as idle-eligible and deliver anyway, relying on claude's input queueing (probed safe in the ended state). Breaks/invites: a mis-timed injection into genuine mid-generation work queues a duplicate or out-of-phase prompt; turn accounting (prompted.turn vs reply.turn) then miscounts silent ends; the detection leans on claude's record-emission shape, which is undocumented and version-driftable; pi seats never show this shape so the rule is dead code for them (harmless); codex unknown. If claude's queueing interleaves rather than serializes, this corrupts seats — the single load-bearing unknown.
- O2: Never deliver into `working`; instead end the mask — when delivery is due and root is `working` with only shell records, kill the seat's leftover shells first, let the harness report truthfully (`done`, turn advances — probed), then deliver through the unchanged path. This reads the decision's two clauses as one mechanism: shells end at the earliest phase progression akrogon controls. Breaks/invites: if the seat was genuinely working, its foreground shell dies mid-write — a corrupted half-applied edit in the worktree and a broken turn; mitigated because genuine work rarely presents as shell-records-only for long, but not eliminated (a long foreground test run looks exactly like this — hmm: a foreground Bash call is itself a shell child of the harness! This is the sharpened risk: O2 cannot distinguish "leftover background shell" from "foreground shell of a live tool call" either. The records may differ — per-shell records appear for background tasks; foreground tool calls emitted no records in probes — but that is one probe, one version).
- O3: Detect turn end outside hc status entirely — scrape the seat's screen (hc screen/msgs) for the harness's turn-end surface. Breaks/invites: TUI output is the most volatile surface of all; reject on signpost 1a.

Pick: O2 restrained by a quiet-period gate — kill-then-deliver only when root shows shell-records-only working AND turn has not advanced for a bounded interval, because it keeps the delivery invariant intact (never inject into `working`) and ends the shell, which the decision wants ended anyway. O1 is the fallback if probes prove queueing is strict serialization. This fork is the chart's core round.

**F2 — Where shell-ending attaches.**

- O1: In `commitMove` (src/phase.ts) on every phase advance, both seats — the decision's literal text. Covers the seat-reuse-across-phases leak (seat replacement already kills the whole terminal, src/next.ts:561-596).
- O2: Additionally at delivery time per F1-O2.
- O3: Harness-side hook/config so claude reaps its own shells at turn end. Root-causest, but harness-specific, version-drifted, unproven to exist.

Pick: O1+O2 combined — they are one code path (enumerate and end a seat's leftover shells) invoked at two moments.

**F3 — Kill precision.**

- O1: Shell-shaped direct children of the harness root (probed topology). Spares MCP servers and other infra children; misses detached grandchildren, which do not mask anyway.
- O2: All non-root processes in the seat scope. Catches everything; risks killing harness infrastructure (MCP servers, code-mode hosts) the next phase needs — invites session corruption.
- O3: Shell children plus their process trees. Covers `bash -c` wrapper chains; still misses double-forked detaches.

Pick: O1+O3 merged: direct shell children of the harness root, killed with their trees. The unmasking only requires the harness-tracked shell to die; detached orphans do not mask (the record dies with the tracked shell).

**F4 — interaction with #153 (cross-chart).** If direct-route leaves advance phases through the same machinery in the door's own tab, the kill logic must not enumerate the door terminal's consultant/harness processes as "seat shells". Either the kill targets only harness-root shell children in agent seats (consultants are separate hc terminals, not children of the door's harness root — needs verification) or door-driven leaves are exempt. Record as a design constraint on this leaf, not a blocker.

### Practitioner questions

1. Does input injected into claude mid-generation queue strictly, or interleave/corrupt? (decides F1-O1 viability)
2. Do codex seats mask? If not, is this claude-only by construction?
3. Do foreground tool-call shells emit per-id records like background ones, or only background tasks? (decides whether records distinguish leftover shells from live work)
4. Is the `msg` grammar stable ("1 shell still running" / pluralization / version)? — relevant only if any design reads it; prefer records-presence.
5. Does killing a tracked background shell mid-generation break claude's session state?

### Pitfalls over the work's lifetime

- Killing a live foreground shell corrupts work or the worktree — removed by the quiet-period gate plus record-shape check, and by doing it at phase advance when the seat should be idle.
- Killing MCP/infra children breaks the seat for its next phase — removed by F3 precision.
- Version drift in claude's emission shape — mitigated by keying on `records` presence and root state only, never on msg text; a drift degrades to today's stall, not to corruption.
- A shell started in the merge phase or by the merge slot itself — merge runs in the merge terminal, not the seat; out of scope, confirm at charting.
- Delivery timing rows (appendTiming) already exist; reuse them, no new record kinds (signpost 3a).

### Leaves and dependencies

One leaf (signpost 4a). No hard dependency on other charts; the F4 constraint informs #153 and is already satisfied by signpost order (this chart first).

### Outside operations/facts needing real observation before handoff

- Paid (one claude launch, smallest): injection behavior mid-generation; foreground-shell record emission; kill-of-tracked-shell effect on session health. Codex masking if codex seats are in scope.
- Free: `hc get` fields (`records`, `foreground`, `turn` semantics) — done in this mapping, but the leaf's done-test must re-probe them in a throwaway hc terminal as regression evidence; `/proc/<pid>/cgroup` seat-unit resolution; systemctl stop of a probe scope.

---

## Chart 2: fresh-leaf-base (#156)

### Mechanism as it is today

Seed confirmed exactly. `ensureWorktree` (src/next.ts:283-317): if the path exists it validates only that it is a worktree root of the same repo; if missing, it checks `refs/heads/<slug>` and checks out that branch as found — only a missing branch starts from `trackingRef(repo)`. No freshness check anywhere. `base()` (src/config.ts:468) is `git merge-base HEAD <trackingRef>`, so the stale HEAD becomes the leaf's recorded base, and `writeLeafEnv` then binds AKROGON_BASE to it. Uncommitted files are never examined — they silently join the new attempt (lesson file learnings/history/2026-11-24-leaf-worktree-stale-base.md, incident: 1271 commits behind, dependency missing, four dirty files from a withdrawn attempt).

### Forks

**F1 — Which reuse is valueless.**

- O1: A slug branch with zero own commits (`git rev-list <trackingRef>..<slug>` empty — tip is ancestor of or equal to the tracking ref). Carries no recorded work by construction, so moving it to the tracking ref loses nothing committed.
- O2: Any reuse below a freshness threshold (N commits behind). Invites guessing; a leaf legitimately based behind main is normal mid-life. Reject.
- O3: Always recreate the worktree/branch on any fresh handoff. Destroys nothing committed but deletes uncommitted work indiscriminately, including a paused leaf's real WIP.

Pick: O1 — the zero-own-commits test is exact, cheap and never wrong about committed work.

**F2 — The dirty tree.**

- O1: Refuse dispatch, name the files, wait for the operator. Breaks/invites: an unattended stall — the exact failure class signpost 5a prioritizes removing.
- O2: Evidence-then-reset: record the diff and untracked file list into the leaf's records, then `git reset --hard` + clean before first use, but only when F1-O1 holds (zero own commits — dirt then is abandoned-attempt debris, since any serious attempt commits). 
- O3: Plain reset/clean with no record. Repeats the original sin (unrecorded loss) in reverse.

Pick: O2, gated strictly on zero-own-commits. Residual risk the operator must accept: a leaf stopped mid-turn before its first commit has real uncommitted work that this destroys (preserved only as a diff record). That edge is narrow and the evidence record bounds the loss. If the door weighs it differently, O1 is the honest alternative and the stall cost is one operator action.

**F3 — Where enforced.**

- O1: Inside `ensureWorktree` itself, every dispatch — single choke point, idempotent for normal leaves (a leaf with own commits or a clean fresh branch is a no-op).
- O2: Only at handoff-write time. Misses re-handoffs and reused branches created by other paths.
- O3: A reconcile pass. Second mechanism doing the first mechanism's job — signpost 1a rejects.

Pick: O1. Also covers the branch-exists-worktree-missing path (src/next.ts:296-303), which checks out the stale branch today.

### Practitioner questions

1. Can a zero-own-commits branch with a dirty tree ever be live WIP rather than debris? (the stopped-mid-turn edge — decide the gate)
2. Does sparse non-cone checkout affect `git status` cost or dirt detection in large repos?
3. Must a rebase-in-progress or merge-in-progress state in the reused tree refuse rather than reset?
4. Does anything else ever intentionally create the slug branch before first dispatch (the direct route uses chart slugs, not leaf slugs — confirm no collision)?

### Pitfalls

- Destroying real uncommitted work — removed by the zero-own-commits gate plus the evidence record.
- Resetting while a git operation is in progress in the tree — detect and refuse.
- Race: old processes still writing in the worktree at re-creation — seats are gone before dispatch by construction, but a leftover shell (#157!) could hold the tree; the two charts interact here — ordering 5a already lands #157 first.
- Lesson retirement: the LESSONS.md line and history file must be removed by this leaf's diff — blocked on needs-sheet row N1 (operator commit to main), already recorded.

### Leaves and dependencies

One leaf. No chart dependency; N1 is an operator need, not a chart.

### Observations before handoff

All free: every behavior provable with temp git repos and the real CLI (signpost 2a). No outside service.

---

## Chart 3: run-check-display (#155)

### Mechanism as it is today

Seed confirmed. `constructedEnv` (src/run-check.ts:70-88) copies the fixed list plus repo `env`/`pass_env`; `DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY`, `XDG_RUNTIME_DIR` never survive. The bus is cut explicitly to `/nonexistent`, so no fallback-to-default-bus interaction exists even if `XDG_RUNTIME_DIR` is later passed. The scope re-passes `XDG_RUNTIME_DIR` when present in client env (src/scope.ts:70-77), so copying in constructedEnv reaches the payload end to end. The lesson's user-side workarounds (pass_env, inline env) exist but the intake and signpost 1a fix the mechanism. Note the threat-model fact that collapses the main objection: test payloads run as the same user who owns the session — any same-user process can already read `~/.Xauthority` and open the display; the env scrub is hermeticity, not confinement, so passing display variables widens no real attack surface.

### Forks

**F1 — Which variables.**

- O1: The session display set as a unit: `DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY`, `XDG_RUNTIME_DIR` — copied when present in the client env, absent otherwise. Wayland needs the dir/socket pair together; X11 needs DISPLAY (+XAUTHORITY when set nonstandard).
- O2: DISPLAY/WAYLAND_DISPLAY/XAUTHORITY only, withholding XDG_RUNTIME_DIR as too wide (user-manager socket, pipewire). Breaks/invites: makes WAYLAND_DISPLAY useless (the socket lives in that dir) while half-supporting X11 — a confusing partial mechanism.
- O3: Repo opt-in via existing pass_env. That is the status-quo workaround; signpost 1a refutes it as the fix.

Pick: O1 — terminal parity as the mechanism's contract: a check sees the display session the way a terminal does, while the bus stays explicitly cut.

**F2 — Liveness validation.**

- O1: Copy as-is. A stale DISPLAY fails the same way it fails in a terminal — consistent semantics, no new failure modes.
- O2: Probe sockets, warn or refuse when dead. Adds a probe mechanism whose own failure modes need maintaining; hermetic reproducibility argument cuts both ways.

Pick: O1.

**F3 — Regression surface.** Do any existing checks depend on display being absent (headless-assuming snapshot tests)? Free-repo scan plus the destination's own suite as the proof. Not a fork, a done-criterion input.

### Practitioner questions

1. On this machine's session, does headed Chromium under run-check pass with DISPLAY alone, or is XDG_RUNTIME_DIR required? (free probe — decides whether O1's full set is load-bearing or vestigial)
2. Does anything in akrogon's own or client repos' suites change behavior when WAYLAND_DISPLAY appears (toolkits preferring wayland and failing differently)?
3. ssh-forwarded DISPLAY (localhost:10.0) — dead var when copied, harmless? confirm no worse failure than terminal behavior.

### Pitfalls

- Copied dead variables in stale environments — accepted as terminal parity.
- Wayland/X11 pair inconsistency — removed by copying the set as a unit.
- Secret-material creep: future vars added to the copy list must stay display-scoped; the forbidden list (injection vectors) stays untouched.
- Lesson retirement: learnings line 60 + history file removed in the leaf's diff (already committed per the lesson history — verify).

### Leaves and dependencies

One leaf, no dependencies.

### Observations before handoff

Free, on this machine: real headed browser launch under `akrogon run-check` with the copied set (positive), without (negative — already evidenced in lesson logs), and the akrogon suite green with display present (regression).

---

## Chart 4: merge-test-facts (#154)

### Mechanism as it is today

Seed confirmed on all three legs. (1) Attempt rows (src/attempts.ts:76-90) carry no verify-run key; verify receipts (src/verify.ts:58-102) carry no attempt key — yet the live admission record already has `attempt` in hand at write time (src/run-check.ts:355) and drops it at finalization. (2) Command rows record name/exit/log/failures only; no durations, no per-test entries. (3) Plain logs are deleted at completion (b9fe5027; completeOwner in src/phase.ts), so nothing can be re-parsed post hoc — facts must be captured when the row is written. Bun prints `[<ms>]` on pass and fail lines alike; the flaky parser regex already matches the duration group and discards it (src/flaky.ts:31-33).

### Forks

**F1 — Shape of per-test facts (signpost 3a: extend, don't create).**

- O1: Additive optional `tests` array per command row: `{name, ms, outcome}[]` covering passing tests too — the merge-load median need requires pass durations. Row size grows (hundreds of tests × ~60 bytes); jsonl ledger stays append-only and old rows parse untouched (optional field, strictObject satisfied for old rows by new code; note old binaries will reject new rows — acceptable under forward-only releases, worth one chart round line).
- O2: Change `failures` from strings to objects `{test, ms, timed_out}`. Breaks the existing field's type — new code must union-parse old rows forever, and flaky.ts consumers change shape. Heavier for less information (no pass durations).
- O3: Durations only for failures. Misses the median-of-merge-loads need entirely.

Pick: O1, with the timeout question answered inside it (F2).

**F2 — Timeout classification.**

- O1: Parse Bun's timeout output form and mark `timed_out` per test — requires observing what Bun actually prints for a timeout (free: a temp bun test with a tiny timeout). Unknown output stays absent, never guessed.
- O2: Infer timeout from `ms >= configured timeout`. Requires knowing per-test timeouts (configurable, default 5s); fragile inference layered on data we can simply read.
- O3: Don't classify. Fails the intake's core question.

Pick: O1 after the free observation; if Bun's output proves ambiguous, fall back to recording raw ms only and saying so in the leaf — an honest cut, not a silent gap.

**F3 — The join key.**

- O1: Optional `attempt` field on the verify receipt row. Writer-side trivial (already in hand); join becomes exact for every attempt-driven verify; absent for non-attempt runs (leaf-scope, direct, reprobes) — correctly, since no attempt exists.
- O2: Time-window joining. The intake itself refutes this (7 of 73 red attempts unjoinable).
- O3: Put the verify run id into the attempt row instead. Same information, but the attempt row is written at attempt end while verify rows finalize inside the attempt — the receipt side is where both keys coexist. O1 is the natural direction.

Pick: O1.

### Practitioner questions

1. How do rerun rows shape per-test entries (same test failing then passing in one command's retry) — keyed how?
2. Non-Bun commands (vitest in other repos) simply lack the field — is absence semantics clean for the flaky/merge consumers?
3. Ledger growth over years — jsonl rows with full pass lists; acceptable, or cap to failures+slowest-N? (I lean full: medians need the population; size is text-compressible and small next to logs.)
4. Do strictObject schemas anywhere else consume these rows (flaky.ts reads `failures`) — audit all readers before extending.

### Pitfalls

- Parser brittleness across Bun versions — mitigated by pinned-format tests in the leaf and absent-not-error parsing.
- Recording wrong facts is worse than none — timeout classification only for observed formats.
- Schema strictness rejecting old rows in mixed-version fleets — release ordering; note it, don't engineer around it (signpost 6a constrains new-reading-old, which additive optional fields satisfy).

### Leaves and dependencies

One leaf, no dependencies.

### Observations before handoff

Free: Bun's timeout output format (temp test), Bun's pass/fail duration line formats (existing suite logs), all readers of verify rows audited in-repo.

---

## Chart 5: direct-visible (#153)

### Mechanism as it is today

Seed confirmed. The direct route writes no leaf files by design (skills/chart-issues/assets/direct-route.md; docs/use/quick-fix.md "No leaf files are written"). Consequently: `akrogon status` leaf rows scan `issues/open` only (src/status.ts:259, 443-445) — nothing to find; the chart row renders only forks/stage/age (src/status.ts:476-486). Runs under `--holder` record leaf slug `checkout` (src/run-check.ts:213), unjoinable to the chart even in the ledger. Broadcast: skills/broadcast-issue/SKILL.md already names "the chart door after a direct landing" as a trigger, but direct-route.md never invokes it and no leaf contract exists to source its content. The decision requires exact leaf-parity tracking: phase, seats, runs in status; broadcast on landing; work in the door's current tab.

### Forks

**F1 — What direct work becomes.**

- O1: The door writes real leaf state records (state.yaml in the `issues/open` grammar, minimal valid) at direct start and drives phases through the existing enum — the decision's build/review/repair/merge map 1:1 onto implement/check.review/check.repair/merge (src/routing.ts:35-39), so no schema change. Status renders it exactly like a leaf for free; runs join once `--leaf` is used (F3). What it does NOT write: the contract ceremony (ISSUE.md, design, readiness) — "tracked like a leaf", not "becomes a leaf"; the route keeps its defining skip. Risk: hand-written minimal state.yaml that fails schema validation poisons repo-wide inventory reads (readInventory failures surface in `akrogon next` for the whole repo) — the writer must validate against stateSchema before write, proven by free tests.
- O2: Display-only: extend status.ts to parse the CHART.md "Direct attempt" prose section and synthesize rows. Violates the "exactly like" reading in substance (no real phase records, prose parsing fragile, duplicated rendering logic); signpost 1a rejects mechanism-by-display.
- O3: Full lifecycle leaf with contract ceremony. Re-ceremonizes the route out of existence — the route's purpose is skipping that ceremony for small settled work.

Pick: O1 — real records, no new record kinds (signpost 3a), no phase enum change, minimal ceremony added.

**F2 — Dispatch suppression.** A state.yaml in `issues/open` is discovered by `akrogon next`, which would try to seat agents and inject phase prompts into the door's own tab — chaos.

- O1: Optional state field marking the leaf door-driven; `next` skips dispatch (still shows in status, still completes on merged).
- O2: Reserved owner-folder prefix excluded from dispatch. Convention-based exclusion is invisible in the record itself — the next reader cannot tell why it is skipped.
- O3: Record seats as the door/consultant terminals and let dispatch vacuously "succeed". Dispatch would still inject prompts. Broken.

Pick: O1 — explicit, in the record, 6a-compatible (optional field).

**F3 — Runs attribution.** Charting probes currently use `--holder` (records leaf `checkout`).

- O1: Switch the direct protocol to `--leaf <chart leaf folder>` once records exist — leafTarget already supports arbitrary leaf paths (src/run-check.ts:181-184). Zero new machinery; same switch for the landing verify (`verify --leaf` exists).
- O2: Extend holder records with an identity field. New field for a problem the existing flag already solves.

Pick: O1. This is a protocol/skill-text change plus charting-probe verification, not machinery.

**F4 — Broadcast.** Gap is protocol, not machinery: broadcast-issue already defines the chart-door trigger. The direct route gains a step: on landing, run the broadcast per the skill, sourcing content from the chart records. Confirm at charting what broadcast-issue reads (whether it needs a leaf contract or accepts the chart folder — determines whether a thin adapter is needed). Thin fork, fold into leaf design.

**F5 — Phase-advance driver.** `commitMove` is today invoked by the reporting harness inside seats and by lifecycle machinery. For door-driven leaves the door runs `akrogon phase` itself — verify the external-advance path is supported/unchanged. Also the #157 interaction (chart-1 F4): phase advances in the door tab must not shell-kill the door's consultants.

### Practitioner questions

1. What exactly does readInventory do with a minimal state.yaml missing contract-adjacent fields — which fields are required vs defaulted? (decides the minimal valid write)
2. Where do `akrogon close` of sources, `akrogon pack` of the chart's direct/ logs, and the Held/Closed markers interact with the new records — does pack expect leaf folders? (pack.ts:432-438 already special-cases chart direct logs)
3. What happens on a mid-route stop (Held) — what terminal state do the records take so status never shows a phantom-running leaf?
4. Does reconcile treat a door-driven leaf's terminals (unlabeled door tab) as foreign/lost? leafSeats matches `repo/slug/<slot>` labels (src/next.ts:436-472) — the door tab will never carry those labels; the suppression flag must cover seat-observation paths too, not just prompt dispatch.

### Pitfalls

- Double-driving (listener injecting into the door tab) — removed by the suppression flag covering all seat-touching paths.
- Schema-invalid hand-written state poisoning repo scans — removed by validate-before-write plus free temp-repo tests.
- Phantom state after abandon/hold — removed by explicit terminal states written at stop time.
- The chart door crashing mid-route leaves a live-looking leaf — same class as any leaf whose seat dies; the suppression flag must not suppress failure visibility in status.

### Leaves and dependencies

One leaf. Soft ordering dependency: lands last (signpost 5a) because broadest; inherits the #157 kill-precision constraint (chart-1 F4). No hard blocker.

### Observations before handoff

All free: write a minimal state.yaml in a temp repo copy and run `akrogon status`/`next` against it; `run-check --leaf` and `verify --leaf` on a chart holder path; broadcast-issue input inspection; pack behavior on chart direct logs.

---

## Summary of leaf shape

Five charts, five leaves, signpost order #157 → #156 → #155 → #154 → #153. Only cross-chart coupling: #157's shell-kill precision must anticipate #153's door-driven phase advances, and #156's lesson retirement waits on needs-sheet row N1 (operator commit). Everything else is independent and parallelizable in principle, though 5a's ordering stands.

The single sharpest finding of this map: for #157, hc gives no signal that separates a masked ended turn from a genuinely working one — they are byte-identical surfaces. Every design for the decision's first clause is a bet on either injection-queueing safety or kill-first unmasking. I recommend the chart round be built around that fact.
