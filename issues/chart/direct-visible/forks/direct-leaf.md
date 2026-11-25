# Direct leaf: what record, who lands, how seats and broadcast run

## Question

Q1. What record carries a direct-route attempt so `akrogon status` shows it like a lifecycle leaf?
- Q1a. A real leaf under `issues/open/<owner>/<slug>/` whose `state.yaml` carries one optional field marking it door-run: its seats are the door's and the reviewer's existing terminals, and the command never starts, prompts, renames, closes or kills them. One akrogon verb creates it (folder, worktree, state at `implement`). Status, run-check, timings, log, land and broadcast then read it as they read any leaf.
- Q1b. Added lines in CHART.md `## Direct attempt` (phase, seats, broadcast) that status renders as a leaf-shaped row. Runs are attributed by the holder path.
- Q1c. A chart-local machine file `<chart>/direct/state.yaml` with its own reader in status.

Q2. Who lands a direct attempt?
- Q2a. The command: a ready review moves the leaf to `merge`, and the existing merge queue and land run verify, gate, push, close sources, move the owner to `issues/closed` and record the broadcast. direct-route.md landing steps 5 to 9 and `skills/chart-issues/scripts/direct-guards.ts` are removed.
- Q2b. The door keeps its landing steps and only records the phase and the landing in the record.

Q3. How do the seats and the landing broadcast run without a new tab?
- Q3a. The record holds A = the door's terminal and B = the reviewer's terminal. The command observes busy on them like any seat and sends the broadcast prompt only to the recorded B while it is idle or done, never starting a seat or opening a tab. The door rewrites B when the reviewer changes.
- Q3b. The door sends the broadcast itself and marks it sent through a command. The recorded seats are for display only.

### Carries

Lock (seed decision, forks/seed-decision.md `## Taken`, operator answer):

- Direct-route work is tracked like a lifecycle leaf, run in the charting door's current tab (not a new tab) by the current charting slot A, with whichever slot is the reviewer.
- `akrogon status` shows it exactly like a lifecycle leaf: its phase (build, review, repair, merge), its seats and its runs.
- It broadcasts on landing like a lifecycle leaf.

Signposts (forks/signposts.md, A's picks under full autopilot): 1a fix in the mechanism that fails; 2a free tests at the real boundary, a paid launch only where nothing free reaches; 3a extend existing records with the smallest field, no new record kinds; 4a one leaf per chart unless a part is useful alone; 6a old records keep reading with no migration.

Operator instruction (door message 2026-11-24, INTAKE.md): "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."

Out of this fork: direct-route eligibility (`skills/chart-issues/SKILL.md` `## Direct route`, autopilot excluded) is unchanged; #153 asks for tracking, status and broadcast only.

Related: shared opening map /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/map-merged.md `## direct-visible (#153)`; the seat-turn-idle chart (#157, handed off) changes how seat busy is read.

## Findings

Exchange files: slots/fork-direct-leaf-{A,B,C,D}.md (blind), -merged.md, -rebuttal-{B,C,D}.md, -final-shape.md, -final-check-{B,C,D}.md. Code read on akrogon main 085f2f88, 2026-11-25.

- Agreed (A,B,C,D): Q1a real leaf with one optional field, Q2a the command lands, seats recorded by `{session, address}`, never `tab`, never leaf labels on the door or reviewer. Merged evidence and pitfalls in slots/fork-direct-leaf-merged.md.
- Rebuttals settled: B-only review at every round for a direct leaf (A,B,C; D wanted an A self-attestation, rejected as a false review record); broadcast recipient B (B,C,D; A moved: `broadcastPending`, `broadcastInProgress` and the broadcast prompt are all B-shaped); plan and report in the leaf folder (B,C,D; A moved: `leafTarget` and status already point there); TIME `-` is a defect against the lock (B,C,D).
- Final-shape check corrections (B,C,D), all adopted into Taken: stale `busy_since` survives moves (`commitMove`) so non-required slots must be cleared (B,C,D); empty `frozen: {}` gives lifecycle-exact citations at zero cost (B; confirmed `requireFrozenCitations` src/phase.ts flags added test files absent from `frozen`); deleting the owner on abandon destroys review and run evidence and has no lock or slice stop (B,C,D); `delivery_error.B` needs lifecycle's settlement rule (B,C); rerun must never recreate a worktree on a merged leaf (C,D); first run needs `checkBase` and `ensureLeafTemp` (C); `stop --all` filters on `tab`/`batch` and would skip a direct leaf (C); reconcile drops `leafTemp` for a tabless leaf with no live slice (C); `dispatchLeaf` keeps `observeBusy`, merged `completeOwner` and merge handling (C,D); timing-report `visitGaps` uses log-built visits with no direct marker (C,D); JSON `seats` is schema 1 (C,D); B's consultant cwd is the repo root, so the review prompt must carry `worktree=` and `base=` (C,D); edited `check.repair -> merge` by the author skips independent review (C,D); the in-turn wait needs an active step (C,D); empty `webhook_env: []` passes a presence gate (C,D); same slug for a growth-stop handoff merges old log rows into the new leaf (C); outside-hc refusal is an eligibility change (D); a B gone after the broadcast prompt started cannot be resent without clearing `prompted` (D).

## Taken

A's pick under full autopilot, 2026-11-25, not operator words: 1a, 2a, 3a, with the final-check corrections.

Binding decisions:

1. Record. A direct attempt is a real leaf at `issues/open/<chart-slug>/<slug>/`, a standalone issue whose owner folder is named after the chart (the chart link survives completion by name), with ISSUE.md (no seat index lines), brief.md, design.md and readiness.yaml written by the door. `state.yaml` gains one optional field `direct: true`; old states parse unchanged (signposts 3a, 6a).
2. Create verb. `akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...`, run by the door inside hc after it writes ISSUE.md, brief.md, design.md and readiness.yaml under `issues/open/<owner>/<slug>/`. First run (no `state.yaml` there): finds the one open folder `<slug>` holding those files and no state, refusing zero or several; refuses when the owner folder holds any other leaf folder, when an owner of that name exists under `issues/closed` or `issues/parked`, when the slug is taken by another open or closed leaf, or outside hc; runs the leaf base check and leaf temp setup, creates the unlocked sparse worktree at `worktree_store/<slug>` with the leaf env, and writes `state.yaml` through the schema with `direct: true`, `phase: implement`, `created` = the full ISO timestamp of the run, `sources` from `--source`, `worktree`, `frozen: {}`, `frozen_cited: []`, `seat.A` = caller and `seat.B` = named reviewer, each with the one live hc session that holds the address (refusing zero or several). Rerun (state present with `direct: true`, any phase): rewrites `seat.A` and `seat.B` only, clears `delivery_error` for a slot whose address changed, never touches the worktree, branch, `sources` or `prompted`. A state without `direct` is refused. The direct route therefore needs the door inside hc: a named eligibility change.
3. Drop verb. `akrogon direct-drop <slug> --chart <chart folder>` ends an unmerged direct attempt outside `merge`: it refuses a non-direct leaf, a leaf in `merge` or `merged`, and an existing `<chart folder>/direct/<owner>`; under the owner lock and capture hold owner completion uses, it stops live runs the way `stop` does (cancel, slice and record-unit stops), removes the worktree and branch, and moves the owner folder into `<chart folder>/direct/` so review, plan, report and run logs stay with the chart. Used for abandon (then `Held`) and for growth stop to lifecycle, whose handoff uses a fresh slug.
4. Seats. Never `tab`, never `akrogon.leaf` labels. For a direct leaf the command never allocates, starts, ends or prompts a seat or charges attempts or losses (`dispatchLeaf` seat steps, `phaseWake`, `dispatchSlot`, `allocate`; `seatCommand` refuses), never kills a recorded seat (`endSeats`, `closeLeaf`, `closeMergedTab`, `endFinishedSeats`, `stopLeaf` seat kill: these find seats by `akrogon.leaf` labels, which direct seats never carry, so the absent labels are the guard and an explicit `direct` check goes only where a path reads `state.seat` refs), and never counts it toward `max_active` (`activeCount`: the label branch already excludes it, the worktree branch gets an explicit check). `dispatchLeaf` still runs busy observation (by the recorded refs, without the repo's own hc place), merged owner completion and merge handling. `stop --all` includes active direct leaves. Reconcile keeps an unfinished direct leaf's `leafTemp`. Rename paths stay inert by the absent `tab`. Added at leaf writing (A, 2026-11-25): the shell sweep at phase advance delivered by seat-turn-idle's shell-sweep leaf (in `check.fix`, not on main) never runs on a direct leaf's seats, since it would end the door's and reviewer's own shells; this leaf is therefore blocked by shell-sweep.
5. Busy. Every recorded seat is read by address; `busy_since` is written only for the current phase's required slots and cleared for the others. No blocked or stall notice for a direct leaf (the door is a shared terminal).
6. TIME. One start function for a direct leaf reads `state.created` and feeds text TIME, JSON `first_prompt` and the merges table `total_ms` alike. No `prompt` timing row is written. Timing report reads `direct` from the leaf's state (open or closed) and raises no missing-prompt or `seat_done` gap for direct visits.
7. Seats display. `akrogon status <slug>` shows the recorded seat terminals for a direct leaf in place of the next-start recipe. JSON keeps schema 1 unchanged.
8. Landing (Q2a). The merge queue and land run land a direct leaf unchanged. Removed: direct-route.md steps 5 to 9 except the chart tail (pack, landed SHA, `Closed`), and `skills/chart-issues/scripts/direct-guards.ts`. The door's two-log known-red judgment goes; land's cover and the check.repair red rule replace it.
9. Slots. For a direct leaf `check.review` requires only B at every round and `check.repair` requires A; every other phase is unchanged. The slot function takes the direct flag from the leaf's state at every caller, the timing report included.
10. Flow. implement: the door as A writes `<leaf>/plan.md` and `<leaf>/implementation/report.md`, runs plain `akrogon verify` in the worktree, moves `check.review`. review: the door sends B the check-issue `check.review` task for the leaf with `worktree=`, `base=` and its hc report line; B records `--slot B --verdict`. On `fix` the leaf enters `check.repair`, the door moves `check.fix`, repairs and moves `check.review`; B re-checks. A land exit in `check.repair`: the door returns an unedited red leaf to `merge` (head equals the red top), or moves `check.fix`, resolves, writes the refreshed SHAs and range-diff basis into `implementation/report.md`, and B re-checks. On a direct leaf `transition` accepts `check.repair -> merge` only when `merge_exit.reason` is `red` and the head equals `merge_exit.top`; every other `check.repair -> merge` is refused, so a `fix` verdict always passes through `check.fix` and B's re-check.
11. Wait. The door stays in its turn while the leaf is in `merge`, rechecking at a bounded interval and running `akrogon next <slug>` at each check so a dead land unit relaunches; on re-entry after a lost turn the door reads the leaf first and runs the tail on `merged`.
12. Frozen. `frozen: {}` at creation gives lifecycle-exact citations: every added test file needs a `Test-Change:` trailer. Runs from the worktree are attributed to the leaf slug and its `implementation/` folder by the existing `leafTarget` and `verifyCaller`, and status shows them as for any leaf.
13. Broadcast (Q3a). `commandMerged` records `state.broadcast` only when the repo configures at least one broadcast target (every leaf, one rule). For a direct leaf `broadcastPass` never allocates or dispatches: it reads `seat.B`, sends the existing prompt when B reads idle or done, records `prompted.B` on a started send, and follows `dispatchSlot`'s settlement rule for `delivery_error.B` (one send per turn, resettled as delivered once B's turn advances). `broadcastInProgress` reads B by its recorded session and address (not the repo session's terminal list) and releases cleanup once B's turn passes the prompted turn or B is gone.
14. Consultant reuse. Before reusing or restarting B after a landing, the door waits until `broadcast pending` clears and B's broadcast turn ends; if B is gone or stays busy before the prompt, the door reruns the create verb to point `seat.B` at a live idle consultant and runs `akrogon next <slug>`.
15. Skills and docs in the same leaf: skills/chart-issues/assets/direct-route.md, skills/chart-issues/SKILL.md `## Direct route` and handoff lines, skills/chart-issues/assets/shapes.md Direct attempt shape, skills/implement-issue/SKILL.md direct form, skills/check-issue/SKILL.md direct review, skills/broadcast-issue/SKILL.md chart-door sender, skills/plan-issue/SKILL.md direct proof-command rule, skills/watch-issues/SKILL.md required seats, skills/AREA.md, docs/use/quick-fix.md, docs/reference/commands.md.

Reasons: one leaf record reaches every reader with no second renderer (3a, 6a); one merge engine replaces the prose landing (removing over adding); B-only review records only reviews that happened; B is the broadcast ack the code already has.

Rejected: 1b (second renderer, no TIME, no JSON leaf, runs stay `checkout`); 1c (new record kind, against 3a); 2b (two landing engines racing the queue); 3b (no proof of send, the #153 doubt).

Pick against recommendation: A's blind notes sent the broadcast to the door and left the plan location open; both moved to the peers' answer.

Leaf-review corrections (B,C,D, 2026-11-25) folded into items 2, 3, 4, 10, 12 and 13: sources input, owner and twin rules, timestamp `created`, drop refused in `merge` with live-run stops, label paths already excluded, the repair-to-merge rule, cross-session B for cleanup.

Accepted limits: the author A judges alone that an unedited red return is not its own cause, checked only by land's rerun and cover; a B killed after its broadcast prompt started loses the broadcast, since `prompted.B` is never cleared.

Standing dissent: D holds a two-slot round-0 review with an A attestation. C holds a command wake to the door in place of the in-turn wait. D holds the `check.repair -> check.fix` hop staying B's step.
