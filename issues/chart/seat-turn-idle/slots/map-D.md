# Territory map: slot D (independent)

Repo: akrogon at main 085f2f88. Locks read: seat-turn-idle seed-decision Taken, direct-visible seed-decision Taken, signposts Taken. Low-confidence claims are marked (low).

Cross-chart facts used below. hc 0.1.22 `hc get --json` on live seats (claude t3fp, pi t3hg, own pi t3k8): `status` holds only `{app, state}`; `records` is null; `turn` "goes up each time the status leaves `working`" (hc schema, Terminal); status is the program's own OSC 7501 word, "nothing is translated" (hc schema, Status). Akrogon's `src/hc.ts:terminalSchema` drops hc fields `argv`, `records`, `reported`, `reason`, `status_ms`, and `foreground.name`. Seats run in their own systemd scope inside the leaf slice (`src/seat.ts:startSeat` builds `systemd-run --scope --unit=<sliceStem>-<seatName>-<random8>.scope`; the unit name is not recorded in leaf state). Observed on this host: an idle seat's scope cgroup holds only the agent pid; a working pi seat's scope holds the agent plus its bash-tool chain (bash -> bun).

---

## C1 seat-turn-idle (#157)

### Mechanism (seed cause confirmed, with one correction)

- `src/next.ts:dispatchSlot` delivers only when `seat.status.state` is `idle` or `done`; any other value, including null, returns. The lost-seat path runs only when the seat terminal is missing or `finished`.
- The correction: there is no hc field today that says "turn ended" while status is `working`. The harness itself keeps its OSC word at `working` while its background shell runs (seed observation), `turn` only moves when status leaves `working`, and live `hc get` shows no side record (`records: null`, no `msg`). So "counts as idle" cannot be read off hc; it has to be made true (shell ends, status flips) or inferred elsewhere. The seed's own ending proves the flip: operator killed the loop, prompt delivered within seconds through the existing path.
- Prompt accounting rests on `turn`: `deliver()` in dispatchSlot records `prompted.turn = reply.turn`, and a later pass treats `prompted.turn < seat.turn` as a silent turn end (attempts + 1, redeliver, leaf fails at 3). Sending a prompt while status stays `working` across two agent turns makes that arithmetic count the wrong turn end.
- Reboot variant: seat terminals are `keep: true` (observed), so hc replaces a lost agent with a shell in place. The terminal stays `live`, `status` is null, `foreground` becomes the shell. dispatchSlot returns at the idle gate forever. `next --resume` reaches dispatchSlot fine; only the gate blocks.
- Extra seats' shells: dispatchSlot runs only for the current phase's required slots (`src/next.ts:dispatchLeaf`), so a non-required seat's leftover shell stalls nothing but keeps running.

### Forks

157-D1. How a turn-ended seat becomes deliverable.
- O1 End leftover shells from the dispatch side, then let the existing idle gate work. Condition: seat is `working`, no prompt for the current phase is outstanding for that slot (`prompted[slot]` empty after `src/phase.ts:commitMove` cleared it), and the leaf has no live run record (the `liveRuns()` guard dispatchSlot already uses before counting a silent end). Kill set: every process in the seat's scope cgroup except the agent pid. Breaks/invites: a seat that called `phase` mid-turn and kept working loses that turn's shells (its tool calls fail; it recovers next turn). A non-shell helper child of the agent in the same scope (an MCP or LSP server, if a harness starts one that way) also dies; unobserved for claude/codex/agy mid-turn (low). No new signal, no accounting change. My pick: it is the operator's second sentence doing the work of the first, and it removes the class for every harness at once.
- O2 Infer turn end from the harness transcript (`src/transcript.ts:transcriptFor` already locates claude/codex/pi/agy transcripts; end-of-turn records differ per harness) and deliver while status is `working`. Breaks/invites: per-harness parsers in the dispatch hot path forever; still needs new prompted/turn accounting for a send that lands during `working`; the leftover shell keeps running into the next phase, so O1's sweep is still wanted. Reject.
- O3 Fix the word in hc or the harness. hc reports the program's word untranslated by design, and the harness is not this repo. Out of this repo's reach; not a leaf here.

157-D2. Where the shell sweep runs.
- O1 In dispatch (next/listen pass), outside the seat scope. My pick: the sweeper can never kill itself.
- O2 In `src/phase.ts:commitMove`. Breaks: a seat's own `akrogon phase` process is a descendant of the seat agent inside the seat scope, so the sweep must carve out its own ancestry on the hottest correctness path; commitMove also runs from land and next, mixing callers. Reject.

157-D3. Kill set and signal.
- O1 All scope processes except the agent pid, SIGTERM, then SIGKILL survivors after a short wait on a later pass. Scope membership is the boundary the system already built (`src/scope.ts:sliceCgroup`, `unitPopulated`); run-check payloads live in their own run scopes under the leaf slice and subagent terminals in their own scopes, so neither is hit. My pick, after the harness observation below.
- O2 Only descendants under a shell child of the agent (protects direct non-shell children). Needs a /proc parent walk and a shell-name list; a shell started via `setsid` or a non-shell poller survives and the stall class returns in a thinner form.

157-D4. Rebooted seat (live, status null, foreground is a shell): how declared lost.
- O1 Positive evidence only: `status === null` and foreground program is a shell (needs `foreground.name` or argv basename added to `src/hc.ts:foregroundSchema`). Then take the existing lost-seat path (evidence row, `end()`, `startSeat`). Foreground stays the agent while its bash tool runs (observed on t3hg mid-test), so this does not fire on healthy seats. My pick.
- O2 `status === null` and `reported === false` past a start window (needs `reported` added to the schema). Invites: any harness that never emits OSC status gets its healthy seat replaced every pass until the leaf fails at 3 losses. Reject as the trigger; fine as a second condition.
- Loss charge sub-fork: charge `lost` like the finished path (3 reboots fail the leaf) or replace free like the silent-end path. My pick: charge it. A seat replaced 3 times without a turn is broken whatever the cause, and one code path stays one code path.

### Practitioner questions and lifetime pitfalls

- Q1 Which harnesses keep helper processes as direct children inside the seat scope during a turn? If one does, O1 of 157-D3 kills it at every phase change. Removed by: the observation below landing before handoff; if a helper exists, the kill set becomes "scope minus agent pid minus that harness's recorded helper pids" only with evidence, not by guess.
- Q2 Does the sweep need to run for a seat that is not required in the new phase? It stalls nothing, but the operator rule says shells end at phase advance. Cheapest true reading: sweep any recorded seat of the leaf that is `working` with no outstanding prompt, inside dispatchLeaf's existing seat read, not only required slots.
- Pitfall: a seat's `akrogon run-check` wrapper process sits in the seat scope while its payload runs in a run scope. Sweeping during publish orphans captures. Removed by the `liveRuns()` guard in 157-D1 O1.
- Pitfall: pid reuse between the hc read and the kill. Removed by re-reading the scope's cgroup.procs at kill time and checking the agent pid still heads that scope (cgroup path stays under `/proc/<pid>/cgroup`, the read `src/seat.ts:cgroupOf` already makes).
- Pitfall: `hc get` `pid` vs `foreground.pid`: observed equal on seats; trust `pid` for the agent and verify in the same observation.
- Busy notices already fire at 1h (`src/next.ts:observeBusy`, STALL_MS); they did not save this leaf because nobody looked. No change proposed there.

### Leaves and dependencies

One leaf: dispatch-side sweep (157-D1 O1 + D3 O1) and the shell-foreground lost rule (157-D4 O1). Same files (`src/next.ts`, `src/hc.ts`, maybe `src/scope.ts`), same test fixture. No dependency on other charts; goes first under signposts.

### Observations needed before handoff

- On a live claude seat mid-turn with a background shell: `hc get --json <seat>` (confirm `records`/`msg` carry nothing better), `pstree -p <pid>`, and the seat scope's `cgroup.procs`. Repeat process-tree read for codex, pi, agy seats. This decides 157-D3.
- Kill the background shell by hand once more on such a seat and confirm status flips to `done`/`idle` and `turn` increments (seed says prompt arrived; name the exact words).
- Simulate the reboot case free in the test fixture's real hc core (`tests/hc-fixture.ts` runs a throwaway core with a stand-in agent): kill the agent process in a `keep` terminal, read back `foreground.name`/`argv`, `status`, `reported`, `reason`. This decides 157-D4's exact field.

---

## C2 fresh-leaf-base (#156)

### Mechanism (seed cause confirmed)

- `src/next.ts:ensureWorktree`: an existing path is reused after only same-repo worktree checks; a missing path with an existing `refs/heads/<slug>` checks out that branch; only a missing branch starts from `trackingRef(repo)` (`src/preflight.ts:trackingRef` = local `refs/remotes/<remote>/<default_branch>`). Nothing compares a reused HEAD with the tracking ref. `src/config.ts:base` is `merge-base HEAD <trackingRef>`, so the stale HEAD becomes `AKROGON_BASE`.
- There is no withdraw verb in `src/akrogon.ts`. The orphan survived because nothing owned its removal: `src/reconcile.ts` gives "a worktree the leaf will adopt on dispatch" the leaf's own rules and keeps it for an active leaf, and `removeWorktree` there refuses dirty trees without force. So the fix point is adoption in ensureWorktree, not a withdraw path.
- ensureWorktree runs on every `allocate`, including resumes with live seats; `allocate` already computes `live` and passes it in. `state.worktree` is written by the first ensureWorktree, so "state.worktree unset at entry" marks first adoption of a path or branch.
- `src/preflight.ts:checkBase` never fetches; fetches happen on merge paths (`src/next.ts` merge handling, `src/phase.ts:finishPush`). The local tracking ref can itself be old. The chart scope names "the current tracking ref", so no new fetch is part of this chart; name the residual: fresh means fresh against the local ref.

### Forks

156-D1. What happens at first adoption when the reused branch has no commits of its own (HEAD is an ancestor of the tracking ref) and sits behind it.
- O1 Fast-forward in place to the tracking ref (existing path: ff-only merge; branch only: move the ref, then create as today). Clean tree only proceeds; a dirty tree refuses loudly with the dirty file list. Breaks/invites: keeps the directory and its ignored files (`.env` is rewritten anyway by `writeLeafEnv`); nothing recorded is destroyed. My pick.
- O2 Delete worktree and branch, recreate from the tracking ref. Also deletes ignored leftovers (build caches, scratch), which O1 keeps; two git operations that can half-fail instead of one ref move. Reject.
- O3 Refuse dispatch and make a human fix it. Visible, but every orphan adoption becomes operator work forever; the common case is mechanical. Reject as the default; it remains the dirty-tree outcome in O1.

156-D2. The guard that says "first phase of a fresh handoff".
- O1 `leaf.state.worktree === undefined` at ensureWorktree entry, plus no live seat, plus branch has no own commits. Covers both reuse branches; resumes (worktree already recorded) never move; the direct-route handoff adoption is untouched because that branch carries commits (direct-route growth-stop section requires a partial-labelled commit before handoff). My pick.
- O2 Phase equals `plan.synthesis` as an extra condition. Invites: a leaf recovered back to an early phase with an empty branch and unrecorded worktree gets its base moved under it. The empty-branch condition already makes movement content-free; phase adds nothing. Reject.

156-D3. Dirty reused tree at first adoption.
- O1 Refuse with the porcelain list (same read `src/phase.ts:requireClean` makes). The seed's complaint is exactly silent carry-over of unrecorded edits; refusing makes a person decide once. My pick.
- O2 Fast-forward and carry the dirty files. Recreates the seed defect in a milder form. Reject.
- O3 Reset them away. Destroys unrecorded work silently. Reject.

### Questions and pitfalls

- Q1 Can a leaf ever want an empty branch pinned behind the tracking ref (reproduce-an-old-bug work)? Create path always bases on the tracking ref, and stacked work is built at merge time, not by worktree base. I find no such use in `src/`; if one appears, it needs its own recorded base, not silence here.
- Pitfall: branch checked out in a second worktree (worker `<slug>-u<N>` leftovers use detached/own refs, and phase moves refuse leftover worker worktrees in `src/phase.ts:refuseWorkerWorktrees`). Moving a checked-out branch ref under a live checkout corrupts its HEAD relation; ff-only inside the adopted path fails safe instead, which is another reason for O1 in 156-D1 over ref surgery when the path exists.
- Pitfall: `git merge --ff-only` on a sparse worktree with skip-worktree entries; must be proven in the fixture, not assumed.

### Leaves and dependencies

One leaf, `src/next.ts` only, plus fixture tests. No dependency on other charts; shares `src/next.ts` with C1, so land after C1 to keep rebases trivial.

### Observations needed

- In a scratch repo: create the orphan exactly as the seed did (worktree plus branch, dirty and clean variants, tracking ref moved on), then run the adoption path and show `HEAD`, `AKROGON_BASE` from `akrogon config`, and porcelain. Include the branch-only variant.
- Confirm `git merge --ff-only <tracking>` succeeds in a sparse (`!/issues/`) worktree created by `createSparseWorktree`.

---

## C3 run-check-display (#155)

### Mechanism (seed cause confirmed, wider than the seed shows)

- `src/run-check.ts:constructedEnv` copies only `copied` (HOME, PATH, XDG_CACHE_HOME, FAKE_SYSTEMD_RUN_LOG, AKROGON_HOME) plus repo `env`/`pass_env`, then pins `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`. Display names reach a check only via `pass_env` (schema at `src/config.ts` repo config; `DBUS_SESSION_BUS_ADDRESS` is a reserved name there and cannot be passed).
- `src/scope.ts:runUnitArgv` then explicitly unsets `XDG_RUNTIME_DIR` inside the run scope when the constructed env lacks it, and restores it when present. So today `XDG_RUNTIME_DIR` is cut by design, not by omission. The cut also hides the hc sockets directory and the user bus socket path from checked commands.
- The same constructedEnv feeds verify commands (`src/verify.ts:runOnce` via `checkedRun`), but verify passes run as a systemd service whose env is filtered by `src/verify.ts:passForwarded` in `launchPass`, which does not list `DISPLAY` or `WAYLAND_DISPLAY`. So adding display names to `copied` gives them to direct run-check calls while service-run verify keeps not receiving them. This split is the useful boundary already in the code; it must be proven (below), not assumed.
- This host, observed: `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`, `XAUTHORITY` unset, and the seed's X run worked with `DISPLAY` plus `XDG_RUNTIME_DIR`. Whether `DISPLAY` alone suffices, and whether Wayland-only works, is unobserved.

### Forks

155-D1. Where display access comes from.
- O1 Add `DISPLAY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR` to `copied` for every repo; do not add them to `passForwarded`. Run-check proofs can open windows; merge verify in its service stays display-less. Breaks/invites: any run-check command (including a leaf's ordinary test run) can now open a window on the operator's screen and can reach `$XDG_RUNTIME_DIR/herdr-core` sockets; a GUI-capable test may stop failing headless and start passing for display reasons, or hang on a compositor. The user bus stays cut by the pinned `DBUS_SESSION_BUS_ADDRESS` unless a tool derives the bus path from `XDG_RUNTIME_DIR` itself (low). My pick, because it removes the per-repo rediscovery (this mechanism class already bit twice: #110, #111 in the seed's related reports).
- O2 Per-repo `pass_env` entries (today's mechanism), documented in the headed-proof instructions. Every new repo and every new plan rediscovers it; signposts Taken gives up per-repo knobs. Reject as the whole answer.
- O3 A run-check flag for display. Plans must name it; the failure mode in the seed was exactly a plan naming a bare proof command. Adds a CLI surface to guard forever. Reject.

155-D2. Exact name set.
- O1 The three names above, no `XAUTHORITY` (unset here while X worked; the default authority file lives under HOME, already copied). My pick pending the probe.
- O2 Add `XAUTHORITY` too. Harmless here, wanted on setups that set it; but each copied name is a permanent leak of caller session state into checks. Decide by the probe on this host only; other hosts are out of evidence.

### Questions and pitfalls

- Q1 Should merge verify ever see a display? A headed-only test in `merge_checks` would stay red in the service under O1. If a repo truly needs that, it is a different decision (windows opening during unattended landings). Keep it out; name it in the leaf so the next person does not re-derive it.
- Pitfall: akrogon's own suite runs under run-check; giving its tests the real `XDG_RUNTIME_DIR` could let a fixture touch the real hc core. The fixtures pin scratch runtime dirs (`tests/hc-fixture.ts` header), so the suite staying green is the proof.
- Pitfall: `XDG_RUNTIME_DIR` copied also changes `runUnitArgv` to restore it in nested calls too; both held and nested paths funnel through constructedEnv, so one list change covers both.

### Leaves and dependencies

One leaf: `src/run-check.ts` `copied` plus tests at the boundary (constructedEnv unit read and one run-check env probe through the fake systemd seam). No dependency on other charts.

### Observations needed

- Probe on this host through real run-check with `pass_env` today: `DISPLAY` only; `WAYLAND_DISPLAY`+`XDG_RUNTIME_DIR` without `DISPLAY`; each running the headed Playwright proof or a minimal headed chromium launch. This fixes 155-D2 with evidence.
- Prove the verify split: run `akrogon verify` in a fixture whose check prints its env, and show `DISPLAY` absent inside the pass while present in a sibling run-check.

---

## C4 merge-test-facts (#154)

### Mechanism (seed cause confirmed)

- `src/phase.ts:completeOwner` deletes every plain log under the completing owner (`logFiles` in `src/pack.ts`) before the move to closed. Verify rows keep `log` as a path only.
- Failure names already survive because `src/verify.ts:commandRow` parses the captured output with `src/flaky.ts:failureNames` at capture time. That parser already matches bun's `(fail) name [12.3ms]` lines and discards the duration. Pass lines carry the same `[Nms]` / `[Ns]` suffix (observed in framework logs).
- Timeout fact, observed format in a framework verify log: the `(fail) <name> [<ms>]` line is followed in the same prefixed stream by `^ this test timed out after 300000ms.` Adjacency is per stream; parallel streams interleave by prefix chain (low: assumed stable in bun 1.4.5 output; the parser must attach by stream, not by raw next line).
- Per-command duration exists only outside the row: `src/run-check.ts:checkedRun` measures it into the `check_end` timing row and returns no duration. `VerifyRun` has run-level `start`/`end` only.
- Scale, counted: one framework merge verify log holds 12,056 `(pass)` lines and is 4.1 MB; `verify-runs.jsonl` holds 3,636 rows averaging 735 bytes, and `runOnce` rewrites the whole file at pass end. Storing every test duration in the row grows a row by roughly three orders of magnitude. `timings.jsonl` already holds 108k rows and is read whole by status/report paths, so per-test timing rows move the same problem there.
- Attempt join: `merge-attempts` rows (`src/attempts.ts:appendAttempt`) have no run. One attempt runs verify several times: head run, optional base-verdict run, and a fresh run after each restack (`src/land.ts:landAttempt` loop). A single `run` field on the attempt row cannot name them all. The attempt id already reaches the verify pass: `src/verify-pass.ts` caller record carries `attempt` (from `leafFields` reading `state.batch.attempt`, or `--attempt` in `verifyCaller`); `runOnce` just does not write it into the receipt. Timing check rows already carry `attempt` today (16k rows observed), but under checkedRun run ids, not verify run ids.

### Forks

154-D1. Which test facts get captured into the verify row at `commandRow` time.
- O1 Failures stay `string[]`; add optional `timeouts: string[]` (the failing names whose stream shows the timeout line), optional per-command `ms` (from checkedRun's return), and optional `slowest`: the K slowest named tests of that command as `{name, ms}` including failures, K fixed in code (start 25). Answers both seed questions for the tests that dominate merge time (the cited replay tests at 88–169s sit in any slowest list); row growth is bounded and old rows parse unchanged. Invites: a test that matters later but was never slowest stays unmeasured; that residue is accepted and named. My pick.
- O2 All per-test durations in the row. Rejected by the count above: whole-file rewrite cost and a permanent multi-MB append per merge run.
- O3 Keep merge-scope verify logs at completion (exempt them from the delete, let pack archive them). No parser work, answers unasked future questions too. Breaks/invites: reverses b9fe5027 for the largest logs in the system (4 MB class, several per leaf, every closed leaf since would have kept them); disk growth is the exact pressure another live chart fights. Reject as the default; it is the fallback if parsing proves unstable.

154-D2. The attempt-to-run join.
- O1 Add optional `attempt` to `verifyRunSchema`, written from the pass caller in `runOnce`. Every run of an attempt (head, `compares` base, post-restack) joins; readers filter `attempt = X`. Old rows parse (field optional; schema is strict, so the field must land in schema and writer together). My pick.
- O2 Add `run` (or `runs[]`) to the attempt row. Writers are scattered (`appendAttempt` call sites in land, phase, next), several have no verify run in scope (seat push path finds its receipt by tree lookup and discards which run it was), and an attempt closed before its last verify finishes cannot be amended after append. Reject.

154-D3. Timeout detection scope.
- O1 Bun's exact sentence, attached per stream in the same parse that produces failure names, stored only as the subset list. Other runners' timeouts stay invisible until someone brings a log sample. My pick: framework is the consumer in evidence, and the parser is already bun-shaped.
- O2 A generic "timed out" text scan. Observed false friends: test titles containing "timeout" and command echoes with `--timeout=` both appear in real logs. Reject.

### Questions and pitfalls

- Q1 Who reads `slowest` in code? Nobody needs to on day one; it is evidence for chart work like the seed's. Keep it out of flips/known-red logic so a parse miss can never change a verdict. Failure-adjacent parsing must stay verdict-neutral: if timeout attachment fails, `failures` must be byte-identical to today.
- Pitfall: `(script)` and `(unnamed)` failures have no per-test lines; their timeout status is unknowable from names. `timeouts` simply omits them; the row must not imply "not a timeout".
- Pitfall: rerun rows (`commandRow` rerun branch) replace `log` and `failures` with the rerun's facts while the first run moves under `rerun`. `timeouts`, `ms`, `slowest` must follow the same split or the first run's facts get attributed to the rerun.
- Pitfall: durations print as `[1369.45ms]` and `[15.00s]` (both observed); store integer ms, parse both units, and drop a test whose suffix does not parse instead of guessing.

### Leaves and dependencies

One leaf: `src/flaky.ts` parse extension, `src/verify.ts` schema + commandRow + receipt, `src/run-check.ts` return gains duration. No dependency on other charts. C3 and C5 also touch run-check/verify env and caller code; fields are independent, sequence by file overlap only.

### Observations needed

- Two or three real red framework merge logs (still on disk under open leaves) as parser fixtures: show the timeout line's stream attachment when streams interleave, including the 300000ms case.
- Count `(pass)` lines and distinct names in one merge-scope log (done in this map: 12,056) to keep K honest; recheck on the leaf's own first run.
- Confirm a verify run made by a merge seat (not the land command) carries the batch attempt into the pass caller, by reading one pass record of a live merge leaf.

---

## C5 direct-visible (#153)

### Mechanism (seed cause confirmed)

- `src/status.ts:chartRow` reads only CHART.md stage markers, fork files, and Fog count. Nothing under `<chart>/direct/` or in the `Direct attempt` section (shape in shapes.md section "Direct attempt": branch, worktree, base, head, rounds, push attempts, done/not done, trigger, review files, landed SHA) is read. There is no phase, seat, or broadcast field in that shape today; phase exists only as prose inside `done:`/`not done:`.
- Runs exist but are unattributed: direct verify and run-check calls go through `--holder <chart>/direct`, and `src/run-check.ts:leafTarget` names that caller slug `checkout`. Counted in this repo: 280 verify rows and about 3,000 timing rows carry slug `checkout`; attribution to a chart is possible only through the `log` path prefix `issues/chart/<name>/direct/`. The live run line in status (`src/status.ts:lineText`) therefore shows `checkout · verify`.
- Seats: the door's hc address is already recorded per mode entry (shapes.md, Mode record description). The reviewer B's address is recorded nowhere in the Direct attempt shape; review files (`slots/review-B-<n>.md`) record verdict and reviewed head, not the seat address. The leaf text row's TURN column is derived from state (`waits_on`), and busy state from `busy_since` written by dispatch, so "seats like a leaf" needs a written phase first; live hc reads are not how leaf rows get their facts (status makes no per-leaf terminal reads).
- Broadcast: direct-route step 7 sends it, and the broadcast-issue skill's Send section records no outcome. A leaf instead carries `state.broadcast` with a pending read (`src/status.ts` NOTE `broadcast pending`). For direct work, a door dying between push (step 5) and send (step 7) leaves no pending signal anywhere. The example chart recorded "broadcast delivered" as free prose inside `not done:`.
- Status JSON is a versioned envelope (`schema: 1`, golden fixture `tests/fixtures/status-envelope.json`); `charts` there is the same text rows. Adding fabricated leaf entries to `leaves[]` invents values for roughly twenty `JsonLeaf` fields (seats config, history, gaps) that direct work does not have.

### Forks

153-D1. Where direct phase, seats, and broadcast facts live.
- O1 Three added lines in the Direct attempt section shape: `phase: build|review|repair|merge`, `seats: A <address> B <address>`, `broadcast: delivered <time>` (present only after the send). Written by the door at the existing steps (attempt start, review send, repair rounds, landing steps), parsed by `chartRow` with the same section-reading status already does for Fog and stage. Old charts lack the lines and keep today's row. Invites: a door can forget a phase update and status then shows a stale phase with full confidence; mitigated only by the steps that already force Direct attempt updates (rounds count "kept in Direct attempt so it survives session replacement", direct-route repair bound section). My pick: no new record kind, no new verb, one writer who already maintains this section.
- O2 A machine file `direct/state.yaml` with a zod schema, updated through a new akrogon verb. Stronger parsing, but a second source beside Direct attempt that can disagree with it, plus verb surface to keep forever. Reject unless O1's parsing proves brittle in tests.
- O3 A real leaf state.yaml so inventory and status treat it as a leaf. Invites dispatch, capacity counting, merge queue, input gates, and phase-move guards (`requireGreenReceipt` at check.review in `src/phase.ts:transition`) onto a route whose guards deliberately differ (direct-guards). The operator lock says tracked and shown like a leaf and run by slot A in the door's tab; it does not say dispatched by `next`. Reject.

153-D2. How status shows it.
- O1 The chart keeps its chart row until a Direct attempt section with a `phase:` line exists; then status prints one leaf-shaped row under the repo's leaves (name = branch slug, PHASE = the direct phase word, TIME = section or CHART.md mtime age, TURN = B in review, A otherwise, NOTE composed of `fix rounds n`, `land` in merge, and `broadcast pending` when landed SHA exists without a broadcast line). JSON: extend the chart's entry shape additively (new optional fields on the repo object, e.g. `direct: [...]`), leave `leaves[]` and `schema: 1` semantics for real leaves intact. My pick.
- O2 Synthesize full `JsonLeaf` entries in `leaves[]`. Panels would render invented seats/history; every future JsonLeaf field needs a direct-work answer forever. Reject.

153-D3. Run attribution.
- O1 Change the caller slug for a holder under `issues/chart/<name>/direct` from `checkout` to the chart name, in `leafTarget` (the same path grammar `captureOwner`/`locate` already recognize). New timing and verify rows attribute themselves; the status run line shows the chart; old rows keep parsing and status can still join them by log prefix if it ever needs to. Invites: slug `checkout` remains for generic holders; a chart and a leaf sharing a name would mix rows (chart folders and leaf slugs draw from the same naming pool; collision is possible in principle, none observed). My pick.
- O2 Leave records alone; status joins runs to charts by log path prefix at read time. Works until pack archives the logs, then depends on `locate` resolution in the status hot path. Reject as the only mechanism; it is O1's backfill for old rows if wanted.

153-D4. Broadcast pending.
- O1 Derived: landed SHA present and no `broadcast: delivered` line means pending, shown in NOTE like a leaf. One write after send, no state to forget at push time. A repo without broadcast configured would show pending forever, so the derivation must check `broadcast.discord.webhook_env` in repo config (status already reads repo config). My pick.
- O2 Explicit `broadcast: pending` written at push, flipped at send. One more write on the step most likely to be interrupted. Reject.

### Questions and pitfalls

- Q1 Phase words: operator named build/review/repair/merge; leaf phases are implement/check.review/check.repair/merge. Showing direct words in the PHASE column is honest (different route), but color and sorting keys key off leaf words (`src/status.ts` phase color by prefix). Decide once in the leaf; my pick is the operator's four words, mapped to existing colors by route step.
- Q2 When does the leaf-shaped row disappear? At `Closed`/`Held` markers it must leave the leaf block or a landed chart haunts the board forever; `lastStage` already reads those markers.
- Pitfall: two charts in one repo can hold direct attempts at once (the route only forbids a second attempt on the same chart). Row code must be per chart folder, not per repo.
- Pitfall: the growth-stop lifecycle handoff turns the same branch into a real leaf; from then on the real leaf row must win and the direct row must not double-show. The handoff appends `Handed off`, which O1 in 153-D2 can key on.
- Pitfall: B's address changes across repair rounds (a restarted consultant). The `seats:` line is rewritten at each review send, so status shows the current B, matching the lock's "whichever slot is the reviewer".

### Leaves and dependencies

One leaf, the widest: `src/status.ts` (row + JSON), `src/run-check.ts` (slug), skill text (direct-route steps and shapes.md Direct attempt lines). No hard dependency on C1–C4; signposts puts it last and that is right, because C1 changes what "seat busy" can mean and C3/C4 settle run record shapes this leaf displays. Soft note only: the direct review send waits for B `idle`/`done` (direct-route step 3), the same hc word C1 deals with; this leaf does not change that wait.

### Observations needed

- Run one real direct attempt end to end after the shape change (or stage the files of one by hand) and read `akrogon status` and `akrogon status --json` at build, review, repair, merge, and after Closed.
- Confirm the #148-class broadcast doubt with evidence before building on it: one discord-send run to a configured target from a direct landing, exit status read (the seed marks channel arrival unconfirmed; the fix only needs pending visibility, but the leaf should not assert delivery it cannot see).
- Find the status JSON consumer's tolerance for additive fields (panel side) before extending the envelope; the golden fixture proves the shape is pinned in tests, not what the live panel accepts (low: additive optional fields are probably fine).

---

## Smallest leaf set and order

- L1 C1 seat-turn-idle. L2 C2 fresh-leaf-base. L3 C3 run-check-display. L4 C4 merge-test-facts. L5 C5 direct-visible. One leaf per chart, five total.
- Real dependencies: none logical. Ordering is by file overlap and signposts: C1 before C2 (both `src/next.ts`), C3 before C5 only in the soft sense above, C5 last as the widest.
- Every record change proposed is an added optional field or an added line in an existing section, so old rows, states, and charts keep parsing with no migration.
