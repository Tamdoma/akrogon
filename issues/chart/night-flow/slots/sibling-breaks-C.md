# Sibling breaks, slot C

Blind notes. Read 2026-10-11. LC marks a low-confidence claim. Log facts gathered by a read-only subagent over `issues/merge-attempts.jsonl` and `issues/log.jsonl` of both repos, window 2026-10-10 18:00Z to 07:50Z (records end there); I spot-checked every line cited below.

## Count: tonight's merge bounces, sibling versus own defect

Framework: 11 attempts, 4 merged, 4 ejected, 3 held (base red, recording-consumers, `review-B.md:229,258,307`). Akrogon: 6 attempts, 5 merged, 1 red.

- N1 root-influence, attempt line 10, 22:04Z: own defect. Its new guard missed existing suites (`root-influence/review-B.md:93,104,123`). Base was an `add issues` commit.
- N2 root-influence carrying copyfile-install, line 15, 07:14Z: the member's own defect, test file unchanged (`root-influence/review-B.md:188`, `copyfile-install/review-B.md:299-311`).
- N3 check-scratch, line 17, 07:37Z: sibling. Fixtures "violate main's newly landed root-influence contract" (`check-scratch/review-B.md:585`); the attempt started 1.5 s after root-influence merged (`merge-attempts.jsonl:16-17`). A second main-caused red at `:568` (main removed `--no-rebuild`). The leaf also introduced the distinct scratch roots (`:589`), so partly its own design (LC on the split).
- N4 formspark-build-wiring, line 18, 07:44Z: both. F15 typecheck, "required dispose method introduced on current main" (`formspark-build-wiring/review-B.md:481`); F16, F17 are the leaf's own lint errors (`:482-485`).
- N5 akrogon leaf-env-file, line 12, 06:30Z: both. A rebase conflict caused by worktree-store's `storeDir` move, resolved wrongly by the leaf (`leaf-env-file/review-B.md:392-394,420`); the second failure is inherited from base (`implementation/report.md:96`).

So 3 of 8 non-merged attempts involved a sibling's change (N3, N4, N5), none purely; 2 were purely the leaf's own; 3 were a red base. Two of the three sibling cases came within 12 minutes of a sibling landing, after the leaf had waited in merge for hours: check-scratch sat in merge 5h39m (`log.jsonl:2404` 01:46Z to the attempt at 07:25Z) and formspark-build-wiring 2h13m, both behind recording-consumers' base-red hold that lasted 8h57m (`log.jsonl:2384,2413`). The long merge-queue wait is what gave siblings time to land. S1 removes that wait.

Cycle time, merge out to merge back, completed cases: root-influence 15m49s (fix 15m03s, review 0m45s, `log.jsonl:2382-2389`); copyfile-install 32m38s with a check.repair in the middle (`:2414-2424`); akrogon leaf-env-file 17m11s (`A/log.jsonl:751-756`). Of each cycle the review re-check is about one minute; A's repair pass is the cost, 9 to 15 minutes, most of it the fetch, rebase, replay and proof runs that `implement-issue/SKILL.md:78` already requires. check-scratch and formspark-build-wiring did not complete a cycle: both went `merge -> failed` at the cap (`log.jsonl:2419-2420`) and sat until the operator moved them (`:2421-2422`).

## Q1 One change that finds it early and keeps the way back short

### 1. Pick
Every implement-issue pass starts and ends on current main: at the start of `implement` and of every `check.fix`, and again before the handoff proof, A fetches the configured remote and rebases the leaf onto `<remote>/<default_branch>` under the merge-issue solo conflict rule, refreshes `AKROGON_BASE`, and only then runs proof and `checks`. Skill text only, in `skills/implement-issue/SKILL.md`: the sentence already at `:78` for merge-origin repairs becomes the rule for every pass. Nothing changes in `src/`.

Reason. Today a leaf is based on main as of its worktree creation (`src/next.ts:334`, `trackingRef`) and nothing rebases it until the merge seat restacks (`merge-issue/SKILL.md:35`), so a sibling's change is met only at merge, after B's review, in the most expensive seat. With the rule, the sibling's change arrives at the next A boundary and lands in A's own `checks` before handoff (`docs/guide/phases.md:94`), fixed inside the pass with no phase move. The only remaining merge-time exposure is a sibling landing between A's last rebase and the restack, which S1 shortens from hours to the review's minutes. The way back when that still happens is the existing path: `check.fix` already starts with fetch, rebase and replay, and a green replay needs no repair (`implement-issue/SKILL.md:78`), B's re-check is diff-only and about a minute (`check-issue/SKILL.md:67`, `log.jsonl:2388-2389`), and S2 means it never ends in `failed`.

Cost. A rebase conflict at every A boundary is A's work, under a rule A already applies for merge repairs. The pre-handoff rebase adds no check run: proof and `checks` run once, after it, as today. History is rewritten before each review, so A records old base, new base and `git range-diff` in the report the way the solo rule does (`merge-issue/SKILL.md:53`), and B's "prior reviewed head" diff at `check-issue/SKILL.md:67` becomes a range-diff when the base moved.

### 2. Rejected
- O1 B repairs the fit at merge instead of bouncing. Mixes the reviewer into the author role, and N3 was not a fit fix: the leaf's scratch-root design conflicts with the guard, which is a plan correction (S2's shape), not a one-line edit. N4's `dispose` was small, but the rule must hold for both.
- O2 Rebase every running leaf's worktree when a sibling merges. Touches worktrees under running agents, which the operator forbade for main itself (keep-running Taken, "be careful when updating main when other leaves are running"), and still needs a trigger at a moment no seat owns.
- O3 Route merge-origin `check.fix` straight back to `merge`, skipping B's re-check (`src/routing.ts:38`). Saves about a minute per bounce (review 0m45s, 1m08s, 1m20s in the three completed cycles) and drops the only review of A's repair diff and of the replay evidence. Not worth the lost check. See Q5 for the one narrow case where it is.
- O4 Order siblings by blocked-by. Serializes work the Drain rule says to run in parallel (`skills/chart-issues/SKILL.md:45`) and slows the whole tree to avoid a 15-minute cycle.
- O5 Raise `fix_rounds` (the 3 to 8 stopgap in framework `issues/config.yaml`, uncommitted). S2 already removes the cap ending; the stopgap does nothing after S2 and the key keeps bounding direct-route repairs (stop-rules Taken S2). Revert it when S2 lands.
- O6 B rebases at `check.review` start too. Narrows the window by the review's minutes at the cost of B rewriting history before reviewing; the merge restack covers that window already.

### 3. Evidence
- Operator: INTAKE.md framework screenshots source, transcribed, read 2026-10-11 ("This is a problem, probably a big one"; the screenshot's O1 separate counter is a cap variant, foreclosed with the cap by S2).
- Practitioner: `skills/implement-issue/SKILL.md:63,78` (worker worktrees removed before final proof; merge-origin repair fetches, rebases, replays, rebases again), `skills/check-issue/SKILL.md:65-67`, `skills/merge-issue/SKILL.md:35-37,41,47,53,73,90`, `src/routing.ts:27-38`, `src/next.ts:334`, `docs/guide/phases.md:13-18,94,108`, read 2026-10-11.
- Practitioner, records: `framework/issues/merge-attempts.jsonl:8-18`, `framework/issues/log.jsonl:2379-2424`, `akrogon/issues/merge-attempts.jsonl:12-13`, `akrogon/issues/log.jsonl:750-757`, and the review lines cited under N1 to N5, read 2026-10-11.
- Practitioner, origin of `dispose`: `git log -S dispose` in framework shows it entered main in `ecdc13a6d` "fix(recording-drivers): dispose F2 consumers on initialization failure" (2026-10-11T00:01+02:00), a check.fix repair commit answering a B finding, in no brief, plan or design (`formspark-integration/brief.md`, `plan.md`, `design.md` have no `dispose`). Read 2026-10-11.
- Practitioner, origin of the root-state rule: `root-influence/brief.md:7` states "detectRepoRoot refuses when CLAUDE_PROJECT_DIR differs from the git toplevel"; `check-scratch/brief.md` does not mention it; neither `state.yaml` has a blocked-by. Read 2026-10-11.
- Locks: stop-rules Taken S1, S2; failed-exits Taken S4, S5; keep-running Taken W, R; `seat-stall-detection/CHART.md:15-16`; framework `merge-flow/CHART.md:23` (weakening the root-state guard is off route). Read 2026-10-11.

### 4. Pitfalls
- R1 Rebase during delegated waves: workers hold worktrees branched from the leaf. Rebase only at the two boundaries where `implement-issue/SKILL.md:63` already requires every worker worktree removed; never mid-wave.
- R2 `Test-Change:` trailers and the merge `--check` range (`merge-issue/SKILL.md:43`): a rebase keeps commit messages, so trailers survive; a conflict resolution that touches a test file needs its own trailer, same as the solo rule.
- R3 B's diff-only re-check against a rewritten history: A records base, prior head, new head and range-diff (`merge-issue/SKILL.md:53` shape) so B compares ranges, not SHAs. Without that line B re-reviews the whole leaf.
- R4 A conflict A cannot resolve truthfully (both sides true and incompatible) is the S2 plan-problem case, not a `failed`: A notes it in `plan.md` and the leaf continues under the S2 path.
- R5 Fetch failures at a seat boundary: proceed on the last fetched tip and record it, same as self-update's "retried at the next trigger"; never block the pass on the network.
- R6 The window between A's last rebase and the restack never closes. The restack plus `check.fix` path stays, and with S1 and S2 it costs one 10 to 15 minute cycle, no stop.

### 5. Questions this fork does not ask
- Q1a When a merge-origin `check.fix` replay is green after the rebase and A commits nothing (`implement-issue/SKILL.md:78`, "a green replay needs no repair"), should the leaf return to `merge` directly instead of through an empty B re-check? That is the one case O3 is right: no repair diff exists to review. A routing exception for "no commits since the recorded head" would be the only code change.
- Q1b Do we want the same rule for `check.repair` (B's own small repairs in `check-issue`)? Today B commits there without rebasing; I left it out to keep B off history rewrites.

## Q2 Should charting name the siblings a contract binds

### 1. Pick
No new naming rule. Tonight's two rules show why: the root-state rule was in root-influence's brief (`brief.md:7`), so the door could have named check-scratch, but the `dispose` member was invented inside a sibling's repair round from a B finding (`ecdc13a6d`), where no brief or plan could name anyone. With Q1's rule, merge order stops mattering: whichever leaf lands first, the other meets the rule at its next A boundary and fixes to it. Naming would only move the same fix earlier for the half of cases the door can foresee.

What the chart keeps doing: the Drain rule stays as written, only an actual dependency orders work (`chart-issues/SKILL.md:45`). A rule that other leaves' code must meet is not a dependency in that sense: the other leaf can be written to the rule before the rule lands, if it knows it. So the one cheap thing the door already can do, and the brief format already allows, is to state a repo-wide rule in the brief that introduces it in a form other briefs can cite. No ordering, no new section, no duty to enumerate siblings.

Cost. Leaves whose rule the door foresaw still meet it at a seat boundary instead of at planning. One pass of A's rebase and fix, inside the leaf.

### 2. Rejected
- O7 Name siblings in the introducing brief and add "meets <rule>" criteria to theirs. Half the cases are unforeseeable (the `dispose` kind), the foreseeable half is covered by Q1 at the cost of one in-pass fix, and the duty makes every brief a prediction about every open leaf. The operator asked for less complexity.
- O8 Order by blocked-by when a contract adds a rule. Serializes parallel work (Drain rule) and converts a 15-minute cycle into hours of queue wait, which is what tonight's 5h39m merge wait already looked like.
- O9 A repo-wide "contracts registry" file that leaves read at seat start. New artifact, new drift, and main itself is already that registry once A rebases onto it.

### 3. Evidence
- Practitioner: `root-influence/brief.md:7`, `check-scratch/brief.md` (no mention), both `state.yaml:6` (empty blocked-by), `git log -S dispose` result `ecdc13a6d`, `skills/chart-issues/SKILL.md:45,69-75` (contracts prepared from shapes, audited as an implementer; no sibling-naming step), read 2026-10-11.
- Operator: "put them in as systemic fixes" (INTAKE.md screenshots source) and "I don't want more complexity", read 2026-10-11.

### 4. Pitfalls
- R7 A rule stated only in a plan or a repair commit is invisible to charting by design; Q1 is the only net for it. Accept.
- R8 Two parallel leaves that each introduce a rule the other breaks: both meet the other's rule at their next boundary; the second to land pays one cycle. Same as today minus the stop.
- R9 Chart text drift: if a later chart adds sibling naming anyway, it reintroduces ordering by the back door. The Taken should say "no naming, no ordering" in one line so the next door does not re-add it.

### 5. Questions this fork does not ask
- Q2a Does the framework chart merge-flow want check-scratch's scratch-root design revisited as a plan correction (S2 path) rather than fixture edits? `check-scratch/review-B.md:589` says the leaf introduced the distinct roots on purpose; fixing fixtures around the guard may be the wrong side.
