# Opening map: drop-debate (seat D)

Base: akrogon `main` at 69390138, read 2026-10-25. Scope per `issues/chart/drop-debate/INTAKE.md`: remove `plan.positions`, `plan.rebuttal`, the `debate` state field, the repo `rebuttal` setting, and the door's debate question; decide if the brief/design handoff needs strengthening for direct synthesis.

## 1. Forks

### D1. Old `debate:` keys in live `state.yaml` files

`stateSchema` in `src/state.ts` is a `z.strictObject`, so deleting the field makes every existing leaf unreadable, open and closed (`repoInventory` in `src/state.ts` parses both areas).

- O1 Strip the key on read (delete `debate` before the strict parse in `readState`, `src/state.ts`). Breaks nothing; the next `saveState` writes the leaf clean. Invites nothing, because new leaves never write the key once `## Leaf files` in `skills/chart-issues/assets/shapes.md` drops it. Cost: about 3 lines plus one test.
- O2 Keep `debate` as an accepted optional field forever. Invites the door and hand-written leaves to keep writing it, and every future reader must explain a dead field. This is how removed fields never die.
- O3 Migrate all files (1,058 leaves across 11 registered repos, per INTAKE). Rewrites closed history in 11 repos the leaf does not own, for zero behavior gain over O1.

Pick: O1. Self-cleaning on next save is the smallest permanent end state.

### D2. Old phase names in historical records

`phaseSchema` in `src/routing.ts` is shared by four readers: `state.phase` and `failure.phase` (`stateSchema`, `failureSchema` in `src/state.ts`), `from`/`to` in `logSchema` (`readLog` in `src/log.ts` parses the whole `issues/log.jsonl`), and `timingEventSchema` in `src/timing.ts`. Dropping the two phases from the one enum breaks `readLog` on the first old line (measured today: 11 such lines in akrogon, 32 framework, 10 blepsis, 12 across two other repos, in `log.jsonl`/`timings.jsonl`), which then breaks every command that reads the log.

- O1 Split the enum: a live `phaseSchema` without the two phases for routing and moves, and a historical enum (every phase ever written) for `logSchema`, `timingEventSchema`, and `failureSchema.phase`. Breaks nothing historical. Invites one risk: a new writer accidentally using the historical enum. Naming it `historicalPhaseSchema` and using it only in those three schemas contains that.
- O2 Rewrite the JSONL logs in every repo. Destroys timing and move history, touches repos outside the leaf, and must be repeated for any missed copy.
- O3 Keep both phases in the live enum with no routing. Impossible without weakening the types: `routing` in `src/routing.ts` is `Record<Phase, Route>`, so a phase with no route needs a fake route.

Pick: O1. Cost: one extra enum and three schema swaps. Note `src/timing-report.ts` already groups by `event.phase.startsWith('plan.')`, so historical timing rows keep working under O1.

### D3. A leaf sitting at `plan.positions` or `plan.rebuttal` when the new release installs

This includes a leaf failed from those phases (its `state.phase` is `failed`, recoverable via `routing.failed.next` in `src/routing.ts`, which today lists both phases) and an in-flight seat that finishes by calling `akrogon phase <slug> plan.rebuttal` (`phaseSchema.parse` in `src/phase.ts` will reject the retired name). Measured today: 0 open and 0 parked `state.yaml` files in all 11 registered repos, so this fork is about the install moment, not a current record.

- O1 Map on read in `readState` (`src/state.ts`): `plan.positions`/`plan.rebuttal` become `plan.synthesis` with `done` cleared (synthesis requires slot A alone per `routing` in `src/routing.ts`; a carried `done: [A]` would trip "Slot already recorded" in the move function in `src/phase.ts`), attempts kept. A then writes the plan, with any existing positions files readable as ordinary leaf files. Breaks: a B seat mid-rebuttal gets its finishing move refused and stops, which is the correct end for a retired pass. Cost: about 5 lines plus a test; deletable once no repo can hold the old values, though it is harmless if it stays.
- O2 Refuse loudly and make the operator hand-edit `state.yaml`. Strands the leaf in the unreadable bucket of `readInventory` (`src/state.ts`) in the meantime, and the operator edit must also know to clear `done`, which the error must then spell out.
- O3 Two-release drain: keep routing one release, remove the next. Doubles the work and the test matrix to protect a state measured at zero instances.

Pick: O1. Mapping an orphaned state to its nearest live state is the standard practitioner move; stranding records is the failure this removal must not create.

### D4. Old `rebuttal:` keys in repo `issues/config.yaml`

`repoSchema` in `src/config.ts` is also `z.strictObject`. All 11 registered repos carry `rebuttal: true` today, and `skills/init-akrogon/SKILL.md` (its sample repo config) writes it for new repos. Deleting the field with no compat breaks `readRepo` in `src/config.ts` for every repo at once, including repos whose owners never touch this leaf.

- O1 Strip the key on read, same mechanism as D1, in `readRepo` (`src/config.ts`); `akrogon config` output (`effectiveConfig`, `src/config.ts`) then stops printing it. Delete the sample line from `skills/init-akrogon/SKILL.md` in the same change so new repos never write it.
- O2 Edit the 11 config files as part of the leaf. Each is a separate repo and commit the leaf cannot land; any missed or future-restored copy breaks that repo's every command.
- O3 Keep the field accepted and ignored. Same dead-field cost as D1 O2, plus `src/phase.ts` keeps a `repo.config.rebuttal` reader with no live destination.

Pick: O1. Same cost shape as D1.

### D5. One leaf and one release, or split code, skills, and docs

The installed command and skills are not the repo copies: `akrogon` resolves to `~/.akrogon/current` and the skill folders under `~/.pi/agent/skills` and `~/.agents/skills` are symlinks into that release (`ownedRoots` logic in `src/install.ts`). Splitting the work creates a window where the installed `skills/plan-issue/SKILL.md` sections `## plan.positions` and `## plan.rebuttal` tell a seat to call phases the installed binary rejects, or the reverse.

Pick: one leaf, one release, containing all of: `src/routing.ts`, `src/state.ts`, `src/config.ts`, `src/phase.ts` (the rebuttal-destination check), `src/next.ts` (the debate-leaf positions guard), `src/log.ts`, `src/timing.ts`; `skills/plan-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `skills/watch-issues/SKILL.md` (required-seats line), `skills/init-akrogon/SKILL.md`; the docs in D8; and the tests below. Cost: a larger single diff to review. Test cost is the real one: the two-slot race tests in `tests/phase.test.ts` use `plan.rebuttal` as their generic A+B phase and must move to `check.review`, the only other A+B phase, which carries verdict logic the race tests must now satisfy; `tests/next.test.ts` loses its debate-guard test; `tests/helpers.ts` and the several fixtures writing `debate: 'no'` drop the key. `skills/watch-issues/scripts/observe.test.ts` has a `plan.positions` fixture to replace.

### D6. Keep the name `plan.synthesis` or rename to `plan`

Renaming repeats D2 and D3 for a phase every live leaf starts at, and invalidates every log line naming `plan.synthesis` (far more than the debate lines). Pick: keep `plan.synthesis`. Cost: the name slightly overstates what happens with no positions to synthesize. That cost is one word; the rename cost is a second migration.

### D7. Shape of the door-question removal

Pick: delete, do not replace with a new question.

- `skills/chart-issues/SKILL.md` `## Handoff`: remove the debate recommendation and election from the handoff review.
- `skills/chart-issues/SKILL.md` `## Direct route`: the combined route question becomes lifecycle or direct (2 options, not 3).
- `skills/chart-issues/SKILL.md` `## Autopilot`: remove debate from the list of answers A gives itself.
- `skills/chart-issues/assets/shapes.md` `## Chart records`: `Route:` line becomes `<lifecycle | direct>`; `## Leaf files`: the sample `state.yaml` loses `debate` and always starts at `plan.synthesis`.

Explicit non-target: the chart-level consultant exchange (blind notes, merge, disagreement-only rebuttal in `skills/chart-issues/assets/questions.md` and `## Take` in `skills/chart-issues/SKILL.md`) is not leaf planning debate and stays. A grep-driven deletion of the word "rebuttal" would damage it; the leaf's change list must name files, not the word.

### D8. Debate artifacts and docs after removal

- Closed leaves keep their `positions-*.md` and `rebuttal-*.md` files untouched: they are history, and `docs/reference/files.md` rows for them can say "only in leaves closed before the removal" or be deleted with the files left unexplained. Pick: delete the rows; the files' own headers explain them.
- `skills/check-issue/SKILL.md` `## check.review` tells B to read its own `positions-B.md`/`rebuttal-B.md` first when they exist. Pick: delete that instruction in the same release. Cost: a leaf mapped under D3 loses B's prior position at review, which lands it exactly where the 98% debate-no leaves already are. Keeping the sentence invites B to treat orphaned files as live input on new leaves where a stray file name could appear.
- Docs to update in the same leaf: `docs/reference/state-and-phases.md`, `docs/reference/config.md`, `docs/reference/skills.md`, `docs/reference/files.md`, `docs/reference/limits.md`, `docs/use/plan-work.md`, `docs/use/quick-fix.md`, `docs/use/write-issues-by-hand.md`, `docs/start/one-change.md`, `docs/examples/autopilot-story.md`, and `docs/pictures/phases.svg` (hand-edited SVG text, no generator found in the repo). History-shaped text (`docs/examples/quick-fix-story.md` chart rebuttal, `learnings/history/**`) stays untouched.

## 2. Practitioner questions

- Q1. Which schemas are strict, and what exactly rejects what after the field deletions? (`stateSchema`, `repoSchema`, both `z.strictObject`; D1 and D4 answer with strip-on-read. A plain field deletion with no strip is a total outage, not a deprecation.)
- Q2. What historical stores name phases outside `state.yaml`: `issues/log.jsonl` (`logSchema` in `src/log.ts`), `issues/timings.jsonl` (`timingEventSchema` in `src/timing.ts`), and `failure.phase` inside old states? All three must keep parsing (D2).
- Q3. Can a seat be running old skill text against the new binary at install time, and what does its finishing `akrogon phase` call do? (Yes; `phaseSchema.parse` in `src/phase.ts` rejects the retired destination and the pass ends. D3 makes the leaf itself recoverable by A instead of stranded.)
- Q4. What about parked leaves, which no inventory of `open`/`closed` shows? (`isParked` in `src/state.ts` finds folders without parsing state; a parked debate leaf surfaces only at unpark. Measured 0 parked today; D3's read-time map covers the future case with no extra code.)
- Q5. Who rewrites the other 10 registered repos' records: 1,058 `state.yaml` files and 11 `issues/config.yaml` files with `rebuttal: true`? (Nobody, under D1/D4 strip-on-read. Any answer requiring cross-repo file edits needs 11 landings this leaf cannot make.)
- Q6. When does the repo skill copy become the live skill? (At release install: `~/.akrogon/current` plus symlinked skill roots, per `src/install.ts`. So "merged to akrogon main" and "live on this machine" are different moments; the chart handling this removal should record which one the done-criteria prove, and whether a rollback (`akrogon rollback`) to the previous release still parses states written after removal. Under D1, a rolled-back binary requires `debate` present, so a leaf cleaned by a post-removal `saveState` breaks under rollback. Is that accepted, or must rollback safety delay the self-cleaning?)
- Q7. Which tests use the retired phases as generic machinery rather than testing debate itself? (`tests/phase.test.ts` two-slot races. Their move to `check.review` is the hidden cost of this removal and belongs in the plan's wave sizing.)
- Q8. Does anything count or group by phase prefix and silently change meaning? (`src/timing-report.ts` first-plan grouping by `plan.` prefix survives; `skills/watch-issues/SKILL.md` required-seats table and `skills/watch-issues/scripts/observe.ts` output name phases as strings and need the table updated, not code logic.)

## 3. Pitfalls over the work's lifetime

- R1. Total command outage on first run after install, from strict schemas rejecting `debate:`/`rebuttal:` keys present in every repo. Removed by D1 + D4 strip-on-read, proven by a test that reads a state and a repo config still carrying the old keys.
- R2. `akrogon status`/`timing`/`next` failing on old log lines months later, in a repo nobody migrated. Removed by D2's historical enum, proven by a fixture `log.jsonl` line with `to: plan.positions` still parsing.
- R3. A stranded leaf at a retired phase, discovered at unpark or after a failed recovery, blocking its issue with an opaque Zod error. Removed by D3's read-time map to `plan.synthesis`.
- R4. Rollback to the pre-removal release breaking on self-cleaned states (missing required `debate`). Removed only by an explicit operator answer to Q6: either accept it (rollback then needs the key re-added to open leaves) or keep writing `debate: 'no'` for one release. My pick: accept and record it, because open-leaf count at any moment is small and the fix on rollback is mechanical. This is the one place strip-on-read has a real lifetime cost.
- R5. Over-deletion: removing the chart-level consultant rebuttal, or words in `learnings/history/**` and closed-leaf artifacts, by grepping "debate|rebuttal". Removed by D7's explicit file list and non-target statement in the leaf design.
- R6. A hand-written leaf (per `docs/use/write-issues-by-hand.md`) or an old chart draft under `issues/chart/*/slots/` still emitting `phase: plan.positions`, failing late with a confusing message. Partly removed by updating that doc in D8; fully removed by D3, which maps even a newly written old-shaped state to synthesis. Note this makes D3's map live input handling, not just upgrade handling.
- R7. Review losing B's pre-implementation position as attention-focusing input (`## check.review` in `skills/check-issue/SKILL.md`). Accepted in D8; the same focusing already happens at chart level for named-peer charts (see section 4), and check.review stays a blind A+B review either way.

## 4. Handoff format: does brief.md/design.md need strengthening?

Answer: no change to the brief/design shape is needed for direct synthesis. One optional one-line change exists, and it belongs in `plan.md`'s shape, not in brief.md or design.md. Evidence:

1. Debate did not measurably improve first-pass outcomes. Leaves with `fix_rounds > 0` in `state.yaml`: akrogon closed, debate-yes 3/5 (60%) vs debate-no 55/215 (26%); framework closed, debate-yes 4/13 (31%) vs debate-no 334/622 (54%). The samples are tiny and point in opposite directions, so they support "no detectable effect", not "debate helps" or "debate hurts". Counted 2026-10-25 over depth-2/3 leaves under `issues/closed` in both repos.
2. The Fixes in both groups are implementation and proof defects judged against the plan, not wrong plan architecture. Debate-yes examples: `issues/closed/akrogon-loop/github/pull-close/review-B.md` F1 (duplicate close comment on retry) and F2 (tests pinned to serialization order); `framework/issues/closed/capture-transport/session-transport/review-B.md` F6 (leaked 35-second timer) and F7 (criterion's late-reply outcome unobserved); `framework/issues/closed/skill-lane-rebuild/batch-model/batch-skills/review-A.md` F1 to F3 (implementation not producing the planned handoff fields). Debate-no examples of the same class: `issues/closed/verify-waste/member-receipts/review-B.md` F1 to F3 and `issues/closed/verify-waste/suite-refusal/review-B.md` F1 to F3. A better brief or design does not prevent this class; check.review exists to catch it, and did.
3. Debate demonstrably improved a plan at least once, and the mechanism matters: in `framework/issues/closed/capture-transport/session-transport/`, `rebuttal-B.md` F1 to F5 (retry predicate must key on an explicit returned envelope, silence deadline must anchor on answers, shutdown must be bounded) became `plan.md` decisions D3 to D8. That value is "a second seat reads the live code against the locked design before the plan exists". The handoff already has that mechanism where it counts: `## Handoff` in `skills/chart-issues/SKILL.md` makes leaf writing a mandatory peer exchange on named-peer charts (each peer reviews each draft brief/design as an implementer, disagreements carried into the design), and the design shape in `skills/chart-issues/assets/shapes.md` `## Leaf files` already forces owned surfaces, literal interfaces, exclusions with owners, and a consumer (file and function) for every altered state or precondition, with anything unresolved written as an `Open for the plan:` question that `## plan.synthesis` in `skills/plan-issue/SKILL.md` must answer as a plan decision. That `Open for the plan:` path is in real use: 27 of 198 akrogon closed-leaf `design.md` files carry it. Removing leaf debate removes a second, later copy of a check the door already runs earlier.
4. The clearest plan-caused Fix in the debate-no sample is a completeness miss the current shapes already prohibit, so it argues for enforcement, not new shape: `issues/closed/concurrent-checks/worker-test-duty/review-B.md` F1 records that the plan's change list and the design's owned-file list both omitted `skills/AREA.md` and a Standalone paragraph. `## Leaf files` in `shapes.md` already requires owned surfaces in the design, and `## plan.synthesis` already requires the checklist to name every affected agent and human doc. The leaf broke an existing rule; adding another rule does not fix that failure mode, and `check.fix` repaired it in one round (the built-in plan-correction path appears in 12/215 akrogon debate-no closed leaves and 36/622 framework ones, by report/review text search).
5. The election did not even guarantee the mechanism ran: 2 of the 13 framework debate-yes leaves have no positions or rebuttal files, and `framework/issues/closed/browser-cdp-setup/browser-core-launch/plan.md` states the plan was synthesized directly because no artifacts existed despite `debate: yes`. The current `src/next.ts` guard postdates those leaves, but the record shows direct synthesis already carried elected-debate leaves without incident.

Smallest change if the operator wants the one visible loss covered: `## plan.positions` in `skills/plan-issue/SKILL.md` required each seat to state a "simpler alternative"; `## plan.synthesis` does not require A to state the simpler alternative it rejected. Add one sentence to `## plan.synthesis` requiring `plan.md` to name the simplest alternative considered and why it loses. That is a plan-issue change only: no brief/design shape change, no new file, no new phase. I rate it optional, because the chart forks already record rejected alternatives before handoff, but it is the cheapest way to keep the one synthesis-visible habit debate enforced.

What the implementer consumes confirms no gap: `## Shared context` in `skills/implement-issue/SKILL.md` works from `plan.md`, `design.md`, and current review findings, with the plan's read-first list supplying worker context. Nothing in implement-issue reads positions or rebuttals, so removal changes nothing downstream of `plan.md`.

## 5. Evidence lines

- E1. Tier: operator. Source: `issues/chart/drop-debate/INTAKE.md` (operator words, 2026-10-25). Date read: 2026-10-25. Finding: remove the handoff debate question and leaf planning debate entirely; assess handoff strengthening; seats B, C, D as consultants.
- E2. Tier: better-than-training (counted from live records). Source: INTAKE agent findings, recount spot-checked by seat D over `issues/closed` in akrogon and `/home/ivan/Work/infra/tamdoma/framework/issues/closed`. Date read: 2026-10-25. Finding: debate elected on 21 of 1,058 leaves (2%); akrogon 5 yes of 220 closed at leaf depth, framework 13 yes of 635.
- E3. Tier: better-than-training (live source). Source: `src/state.ts` (`stateSchema`, `readState`, `repoInventory`), `src/config.ts` (`repoSchema`, `readRepo`, `effectiveConfig`), `src/routing.ts` (`phaseSchema`, `routing`), `src/phase.ts` (rebuttal destination check, requested-phase parse), `src/next.ts` (debate positions guard), `src/log.ts` (`logSchema`, `readLog`), `src/timing.ts` (`timingEventSchema`). Date read: 2026-10-25. Finding: both record schemas are strict; one shared phase enum feeds live state, failure records, the move log, and the timing log; naive deletion breaks parsing of existing records in that order.
- E4. Tier: better-than-training (measured on this machine). Source: all 11 registered repos from `akrogon config`, `find` over `issues/open` and `issues/parked`, grep over `issues/log.jsonl` and `issues/timings.jsonl`, and `readlink -f $(command -v akrogon)`. Date read: 2026-10-25. Finding: 0 open and 0 parked leaves anywhere today; retired phase names present in 5 repos' JSONL logs (65 lines total); every repo config carries `rebuttal: true`; the installed binary and skills resolve into `~/.akrogon/releases/<sha>` via `~/.akrogon/current`, not the repo checkout.
- E5. Tier: better-than-training (closed-leaf record sample). Source: `state.yaml` `fix_rounds` plus `review-A.md`/`review-B.md` for all 18 debate-yes closed leaves in akrogon and framework and a recency sample of debate-no leaves with fixes (paths in section 4). Date read: 2026-10-25. Finding: fix rates show no consistent debate advantage; Fixes in both groups are implementation/proof class; one clear case (session-transport) where rebuttal findings changed plan decisions, through a mechanism the chart door already runs at handoff.
- E6. Tier: better-than-training (live process text). Source: `skills/plan-issue/SKILL.md` (`## Shared context`, `## plan.positions`, `## plan.rebuttal`, `## plan.synthesis`), `skills/chart-issues/SKILL.md` (`## Handoff`, `## Direct route`, `## Autopilot`), `skills/chart-issues/assets/shapes.md` (`## Chart records`, `## Leaf files`), `skills/chart-issues/assets/standing-design.md`, `skills/check-issue/SKILL.md` (`## check.review`), `skills/implement-issue/SKILL.md` (`## Shared context`, `## implement`). Date read: 2026-10-25. Finding: direct synthesis already has full instructions and is the 98% path; implement-issue consumes only plan, design, and findings; check-issue is the only downstream reader of debate artifacts.
- E7. Tier: practitioner (model knowledge applied to E3/E4). Source: standard state-machine migration practice. Date read: 2026-10-25. Finding: when removing states from a running machine with persisted records, map orphaned records to the nearest live state on read and keep historical logs parseable under a widened historical type; never require editing every persisted record across deployments you do not control in the same change. This is the basis for D2 and D3.

## 6. Question this brief does not ask

Q9. Should `plan.synthesis` keep producing its criterion tests and red-first evidence in the same pass after debate removal, unchanged? Today the pass that writes `plan.md` also writes and runs the new tests (`## plan.synthesis` in `skills/plan-issue/SKILL.md`), so with debate gone, a leaf goes from handoff to committed red tests with exactly one seat (A) having read the live code in the lifecycle, unless the chart named peers. The brief asks whether the handoff contract needs strengthening; the sharper question is whether the door's mandatory peer leaf-review (`## Handoff` in `skills/chart-issues/SKILL.md`, currently only "when peers are named") becomes the only pre-plan second reading, and whether the operator wants that exchange to be the default recommendation for large leaves now that leaf debate no longer offers a later one. I ask it because the answer changes door behavior, while the removal itself does not depend on it.

Most important: remove debate in one release with strip-on-read for both old keys, a historical phase enum for logs and failures, and a read-time map from the two retired phases to `plan.synthesis`; change nothing in the brief/design shape.
