# Design: direct-leaf

## Binding decisions, verbatim

### Seed decision, from forks/seed-decision.md

#### Operator decision (Ivan Juras, 2026-11-23)

- Direct-route work is tracked like a lifecycle leaf, run in the charting door's current tab (not a new tab) by the current charting slot A, with whichever slot is the reviewer.
- `akrogon status` shows it exactly like a lifecycle leaf: its phase (build, review, repair, merge), its seats and its runs.
- It broadcasts on landing like a lifecycle leaf.

seed decision from Tamdoma/akrogon#153, taken at import on 2026-11-24, not asked, decided by ivanjuras

Reason: not stated. Alternatives: not stated.

### Signposts, from forks/signposts.md

A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

### Direct leaf, from forks/direct-leaf.md

A's pick under full autopilot, 2026-11-25, not operator words: 1a, 2a, 3a, with the final-check corrections.

Binding decisions:

1. Record. A direct attempt is a real leaf at `issues/open/<chart-slug>/<slug>/`, a standalone issue whose owner folder is named after the chart (the chart link survives completion by name), with ISSUE.md (no seat index lines), brief.md, design.md and readiness.yaml written by the door. `state.yaml` gains one optional field `direct: true`; old states parse unchanged (signposts 3a, 6a).
2. Create verb. `akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...`, run by the door inside hc after it writes ISSUE.md, brief.md, design.md and readiness.yaml under `issues/open/<owner>/<slug>/`. First run (no `state.yaml` there): finds the one open folder `<slug>` holding those files and no state, refusing zero or several; refuses when the owner folder holds any other leaf folder, when an owner of that name exists under `issues/closed` or `issues/parked`, when the slug is taken by another open or closed leaf, or outside hc; runs the leaf base check and leaf temp setup, creates the unlocked sparse worktree at `worktree_store/<slug>` with the leaf env, and writes `state.yaml` through the schema with `direct: true`, `phase: implement`, `created` = the full ISO timestamp of the run, `sources` from `--source`, `worktree`, `frozen: {}`, `frozen_cited: []`, `seat.A` = caller and `seat.B` = named reviewer, each with the one live hc session that holds the address (refusing zero or several). Rerun (state present with `direct: true`, any phase): rewrites `seat.A` and `seat.B` only, clears `delivery_error` for a slot whose address changed, never touches the worktree, branch, `sources` or `prompted`. A state without `direct` is refused. The direct route therefore needs the door inside hc: a named eligibility change.
3. Drop verb. `akrogon direct-drop <slug> --chart <chart folder>` ends an unmerged direct attempt outside `merge`: it refuses a non-direct leaf, a leaf in `merge` or `merged`, and an existing `<chart folder>/direct/<owner>`; under the owner lock and capture hold owner completion uses, it stops live runs the way `stop` does (cancel, slice and record-unit stops), removes the worktree and branch, and moves the owner folder into `<chart folder>/direct/` so review, plan, report and run logs stay with the chart. Used for abandon (then `Held`) and for growth stop to lifecycle, whose handoff uses a fresh slug.
4. Seats. Never `tab`, never `akrogon.leaf` labels. For a direct leaf the command never allocates, starts, ends or prompts a seat or charges attempts or losses (`dispatchLeaf` seat steps, `phaseWake`, `dispatchSlot`, `allocate`; `seatCommand` refuses), never kills a recorded seat (`endSeats`, `closeLeaf`, `closeMergedTab`, `endFinishedSeats`, `stopLeaf` seat kill: these find seats by `akrogon.leaf` labels, which direct seats never carry, so the absent labels are the guard and an explicit `direct` check goes only where a path reads `state.seat` refs), and never counts it toward `max_active` (`activeCount`: the label branch already excludes it, the worktree branch gets an explicit check). `dispatchLeaf` still runs busy observation (by the recorded refs, without the repo's own hc place), merged owner completion and merge handling. `stop --all` includes active direct leaves. Reconcile keeps an unfinished direct leaf's `leafTemp`. Rename paths stay inert by the absent `tab`. Added at leaf writing (A, 2026-11-25): the shell sweep at phase advance delivered by seat-shell-kill's tool-cgroup-kill leaf (in `plan.synthesis`, not on main; it replaced seat-turn-idle/shell-sweep on 2026-11-25) never runs on a direct leaf's seats, since it would end the door's and reviewer's own shells; this leaf is therefore blocked by tool-cgroup-kill.
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

## Standing design

/home/ivan/.akrogon/releases/085f2f88c3a1920732e10afbc0bad190cf32d540/skills/chart-issues/assets/standing-design.md (reached through ~/.claude/skills/chart-issues). Interpretation for this leaf:

- Every done-criterion is mechanical command behavior with one right answer (state fields, phase moves, refused moves, which terminals receive a call, status cells), proven by free own tests at the real boundary: the `akrogon` CLI in a temp repo with the existing real throwaway hc core in tests/hc-fixture.ts (the harness tests/hc-teardown.test.ts, tests/next.test.ts and tests/phase.test.ts use) and the fake GitHub in tests/fake-gh.ts for source closes. No paid model launch, no live run, no new machinery.
- "Untouched" is observed through the fixture's recording hc shim and the terminals' own state (alive, same turn, no labels added), never by counting log lines.
- Each new refusal and each skip shows one deliberate break turning its test red. For the label-guarded kill paths the break is labelling a direct seat `akrogon.leaf=<slug>` (the test then sees the terminal ended); for the shell sweep and `activeCount`'s worktree branch it is removing the explicit `direct` check.
- Skill and doc text (criterion 10) is read by the reviewing seat against the binding decisions; no test matches its wording. tests/direct-guards.test.ts and the three direct-guards cases in tests/receipt-gates.test.ts are deleted with the script, and the direct-landing expectations in tests/docs-links.test.ts are replaced by the new flow's, each deletion naming its reason (the door's landing steps are removed; land's own gates are tested elsewhere).
- No test keeps a hand-copied list of the kill or close paths; the seats-untouched test drives the commands that reach them.

## Leaf architecture

Owned surfaces: src/state.ts (`stateSchema` `direct`), src/akrogon.ts and src/usage.ts (`VERB_OPTIONS`, usage lines) for the two verbs, a new src/direct.ts (create, rerun and drop), src/routing.ts (slots for a direct leaf), src/phase.ts (`transition` direct repair-to-merge rule, `commandMerged` broadcast gate), src/next.ts (`dispatchLeaf`, `phaseWake`, `dispatchSlot`, `allocate`, `seatCommand`, `observeBusy`, `broadcastPass`, `activeCount`), src/reconcile.ts (`broadcastInProgress`, `reconcileHost` slice keep, leaf temp keep), src/stop.ts (`stopCommand` `--all` filter; the run-stop sequence the drop verb reuses), the tool-shell kill site delivered by tool-cgroup-kill, src/status.ts (start time, seat detail), src/timing-report.ts (`visitGaps` from both its single-slug and cohort callers), their tests; tests/command-reference.test.ts and tests/cli-help.test.ts for the verbs; tests/receipt-gates.test.ts and tests/docs-links.test.ts for the removed landing; the skill and doc files in criterion 10; deletion of skills/chart-issues/scripts/direct-guards.ts and tests/direct-guards.test.ts.

Interfaces (literal):

- `stateSchema` gains `direct: z.literal(true).optional()`. Old states parse unchanged.
- `akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...`: reads `HC_TERMINAL_ID` for A; finds each address by probing every live hc session (`sessions`, `terminal`) and refuses on zero or more than one match; finds the leaf folder by scanning `issues/open/*/<slug>` for one folder holding the door's four files; first run when that folder has no `state.yaml`, rerun when it has one with `direct: true`. Refusals as in binding decision 2.
- `akrogon direct-drop <slug> --chart <chart folder>`: refusals as in binding decision 3; holds the owner `.lock` and the enclosing capture hold as `completeOwner` does, and stops live runs by `stopLeaf`'s sequence (`cancelLeafRuns`, slice and record-unit stops) without its seat kill.
- Review prompt the door sends B: check-issue's `check.review` task for the leaf, plus `worktree=<path>` and `base=<ref>` (B's consultant cwd is the repo root, per src/seat.ts `launch`) and the door's hc report line.

Consumers of changed state:

- `requiredSlots` and `historicalSlots` (src/routing.ts): read by `transition`, `leafJson` `waits_on`, dispatch and `refuseEnclosingCompletion`, and by `visitGaps` from log-built visits; each caller gets the direct flag from the leaf's state (open or closed).
- `seat.A`/`seat.B` with their own sessions: read by `observeBusy`, `broadcastPass` and `broadcastInProgress` through `terminal(ref.session, ref.address)`, never through the repo session's terminal list or `ownPlace`; `reconcileHost` passes no repo terminal list for a tabless leaf, so its slice keep for a merged direct leaf follows the same read.
- `busy_since`: carried across moves by `commitMove`, printed by status `note` for either seat; the busy writer clears the non-required slot.
- `state.broadcast` (`commandMerged`): read by `broadcastPending`, `broadcastPass`, `broadcastInProgress`; all read presence only, so the configured-target gate changes no reader. Existing land and broadcast tests whose repos configure no target get a target.
- `state.sources`: read by `completion`, `completeOwner` (`closeSources`, broadcast `sources`) and `flowReport`; written once by the create verb.
- `state.frozen` `{}`: read by `moveGuards` and `requireFrozenCitations`; with an empty record every added test file needs a citation, as at a lifecycle `plan.synthesis -> implement` freeze.
- `state.created` (full ISO timestamp): read by the new direct start for TIME, `first_prompt` and `total_ms`, and by timing-report's date slice.
- `state.worktree`: read by `leafTarget` (src/run-check.ts) and `verifyCaller` (src/verify.ts) for run attribution, unchanged.
- Shell sweep (tool-cgroup-kill leaf): runs at a committed phase move over the moved leaf's seat scopes that hold `tools/`, which only `startSeat` creates; a direct leaf's seats are skipped by an explicit check. Added at re-chart (seat-shell-kill, 2026-11-25): the plan confirms whether a direct seat can ever hold `tools/` before adding the check.

Exclusions: direct-route eligibility apart from the hc requirement (skills/chart-issues/SKILL.md `## Direct route`), owned by the chart door; lifecycle routing, seats and broadcast for non-direct leaves, unchanged except the configured-target broadcast gate; no command wake to the door; no change to land, the merge queue or its gates; no labels on direct seats.

Open for the plan: the start function's name and where status and timing-report share it; whether the create verb's base check and leaf temp setup reuse `allocate`'s prelude or call `checkBase` and `ensureLeafTemp` directly.
