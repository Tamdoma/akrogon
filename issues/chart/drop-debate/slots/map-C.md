# Map C: drop-debate

Read 2026-10-25. Repo root /home/ivan/Work/infra/akrogon at main 69390138. Installed release `~/.akrogon/current` -> `releases/5b7b2a57` (one commit behind main).

## 1. Forks

### K1. What happens to `debate:` in 1,058 existing `state.yaml` records

`stateSchema` is a `z.strictObject` with `debate: z.enum(['yes','no'])` required (`src/state.ts` `stateSchema`). `repoInventory` defaults to `['open','closed']` and parses every record with `readState` (`src/state.ts` `repoInventory`, `readInventory`). A record that fails lands in `unreadable`, and `ownerScope` sets `blocked` when any record under the owner is unreadable (`src/phase.ts` `ownerScope`), `flowReport` throws on the first unreadable (`src/timing-report.ts` `flowReport`), `statusCommand` throws for the leaf (`src/status.ts` `statusCommand`).

- O1 Delete the key from the schema. Every closed and open record in all 11 repos becomes unreadable. Completion of any owner with a sibling record blocks, `akrogon timing` dies, and the removal leaf's own record (written under the current release, which requires `debate`) blocks its own completion if the deploy lands between merge and `completeOwner`.
- O2 Keep `debate` as `.optional()`, never read, never written by the door template. Old records parse. New records omit it. Precedent: `owner` on `batchSchema` carries a comment "Absent means seat: records written before ..." (`src/state.ts` `batchSchema`).
- O3 Switch to a loose object. Loses the stray-key refusal that `tests/state-inventory.test.ts` (`notes: stray` case) proves.
- O4 Rewrite 1,058 files across 11 repos as record commits, then delete the key. Large, and still needs O2 during the window.

Pick O2. Cost: one line stays with a one-line comment. A later cleanup leaf can do O4 and drop the line, if the operator wants zero trace.

### K2. `plan.positions` and `plan.rebuttal` in `phaseSchema`

`logSchema.from/to` and `timingEventSchema.phase` reuse `phaseSchema` (`src/log.ts` `logSchema`, `src/timing.ts` `timingEventSchema`). `readLog` parses every line and throws on a bad one (`src/log.ts` `readLog`). `akrogon next` calls `readLog` for `visit_start` and the merge queue (`src/next.ts`, the `appendTiming` and `mergeQueue` calls). Live counts: akrogon `issues/log.jsonl` 11 lines, framework `issues/log.jsonl` 24 lines, framework `issues/timings.jsonl` 8 lines name these phases. `readTimings` catches and returns `[]` with a warning, so timings degrade silently; the log does not.

- O1 Drop the two names from `phaseSchema` only. `akrogon next` dies on akrogon and framework at the first old log line.
- O2 Rewrite `log.jsonl` history. It is the move audit; rewriting it changes what `visitOf` counts and what timing reports say.
- O3 `phaseSchema` keeps only live phases, `routing.ts` exports a retired-names list, and only `log.ts` and `timing.ts` parse `from/to/phase` with `live ∪ retired`. State files, moves and `routing` stay live-only, so no leaf can sit in a retired phase.

Pick O3. Cost: one exported enum of two strings and two schema references. Delete with it: the `plan.positions`/`plan.rebuttal` routes and the `failed.next` entries (`src/routing.ts` `routing`), the rebuttal-config guard (`src/phase.ts` `transition`, "Destination contradicts rebuttal config"), the dispatch gate (`src/next.ts`, "Debate leaf skipped its debate"), and their tests (`tests/phase.test.ts` race/stray/pos-true/pos-false cases, `tests/next.test.ts` "debate leaf without positions files", `skills/watch-issues/scripts/observe.test.ts` `plan.positions` fixtures).

### K3. The repo setting `rebuttal`

`repoSchema` is strict with `rebuttal: z.boolean().default(true)` (`src/config.ts` `repoSchema`). All 11 registered repos carry `rebuttal: true` in `issues/config.yaml` (checked each root listed by `akrogon config`). Deleting the schema line makes every repo's config unreadable, so every command fails in every repo until each file is edited.

- O1 Delete the line and edit 11 configs before the deploy. Deploy is automatic from merged main (`docs/reference/releases-and-updates.md` "How checkouts follow main"), so the edits race the deploy and the leaf owns only akrogon.
- O2 Keep `rebuttal` as `.optional()` ignored for this release, stop emitting it in `skills/init-akrogon/SKILL.md` and `docs/reference/config.md`, and record a Pending step: remove the key from the 11 configs, then drop the schema line.
- O3 Keep the tolerated key forever. Dead config surface, against the lean goal.

Pick O2. Cost: one line now plus a two-step follow-up.

### K4. Door handoff question and `Route:` shape

`## Handoff` describes the debate default and the combined route question "lifecycle debate no, lifecycle debate yes, or direct" (`skills/chart-issues/SKILL.md` `## Handoff`, `## Direct route`, `## Autopilot` "handoff review including debate and seats"). Shapes carry `Route: <lifecycle (debate no|yes) | direct>`, the autopilot `route:` line, and the `state.yaml` template with `debate: 'no'` and the `plan.positions` comment (`skills/chart-issues/assets/shapes.md` `## Chart records`, `## Leaf files` state block and its paragraph).

- O1 Route question becomes lifecycle or direct, `Route: <lifecycle | direct>`, template drops `debate`. Autopilot keeps its "always lifecycle" rule.
- O2 Keep the debate word anywhere as a no-op. Invites a door to write the field again.

Pick O1. Cost: wording in three files. Leave `rebuttal` where it means the chart peer round (`skills/chart-issues/assets/questions.md` peer rebuttal, `docs/examples/quick-fix-story.md`); that is a different mechanism.

### K5. Skill and doc surface

Delete `## plan.positions` and `## plan.rebuttal` and the "integrating both positions and any configured rebuttals" clause, and the description line, in `skills/plan-issue/SKILL.md`. Delete the two debate sentences in `skills/check-issue/SKILL.md` `## check.review` (B reads `positions-B.md`; missing artifacts on a `debate: no` leaf). Phase table and start rules in `docs/reference/state-and-phases.md` `## Phases`, rows in `docs/reference/files.md`, `rebuttal` row and sample in `docs/reference/config.md`, `docs/reference/skills.md` plan-issue entry, `docs/reference/limits.md`, `docs/use/write-issues-by-hand.md`, `docs/use/quick-fix.md` route list, `docs/use/plan-work.md`, `docs/start/one-change.md`, `docs/examples/autopilot-story.md`, `docs/pictures/phases.svg` (two phase boxes, three labels), `skills/watch-issues/SKILL.md` seat table, `skills/init-akrogon/SKILL.md` config template. No options here; it is one sweep.

### K6. Handoff contract strengthening

See part 4. Pick: no change to brief.md or design.md.

## 2. Practitioner questions

- Q1 Which readers parse old records? Every inventory path (K1), the move log (K2), and repo config (K3). All three need tolerance in the same release.
- Q2 Any leaf mid-phase? None. Zero open leaves in all 11 repos today, zero records at `plan.positions`/`plan.rebuttal`, zero `failure.phase` naming them (grep over every `state.yaml`). A leaf opened with `debate: 'yes'` between merge and deploy would strand at a phase with no route; the door and the command switch together through the `current` link, so the window is only leaves already open at deploy.
- Q3 Do other repos' records differ? Same shape everywhere; 13 framework, 13 clinique-la-roya and 4 pi-extensions `state.yaml` files without `debate:` are old-format series records under `issues/history/`, which `repoInventory` never visits.
- Q4 Installed vs repo copy? Skills in `~/.claude/skills`, `~/.codex/skills` and `~/.pi/agent/skills` are symlinks into `~/.akrogon/current/skills`; `akrogon` resolves to `releases/5b7b2a57/src/akrogon.ts`. Repo edits do nothing until deploy, and deploy flips command and skills at once. The removal leaf runs its own merge under the old release and may complete under the new one, which is why K1 O2 is required and not optional.
- Q5 Does `akrogon phase <slug> plan.positions` typed by hand still parse? No: `transition` parses the argument with `phaseSchema` (`src/phase.ts`, `phaseSchema.parse(rawPhase)`), which is the right refusal.
- Q6 Does the self-update push the 11 config edits? Only commits touching paths under `issues/` replay and push (`docs/reference/releases-and-updates.md` "How checkouts follow main"); `issues/config.yaml` qualifies, so the K3 follow-up can ride that path.

## 3. Pitfalls over the work's lifetime

- R1 Unreadable records after deploy. Removed by K1 O2 and K2 O3 together; a done-criterion should run `akrogon status` and `akrogon timing` against the real akrogon and framework roots after the change, not a fixture.
- R2 Config refusal in all repos. Removed by K3 O2.
- R3 Grep-shaped done-criterion colliding with the word "rebuttal" that still legitimately names the chart peer round. `learnings/LESSONS.md` 2026-09-11 records this exact collision. Removed by scoping the sweep criterion to the tokens `plan.positions`, `plan.rebuttal`, `debate:`, `rebuttal:` and `positions-`.
- R4 Test fixtures keep writing `debate: 'no'` (`tests/helpers.ts` `leaf`, and eight other test files). With the field optional they still pass, but then no test proves a record without the field parses. Removed by dropping the key from `leaf()` and the fixture objects.
- R5 Watch-issues tests live under `skills/watch-issues/scripts/*.test.ts` and run in the repo `test` check. Removed by including them in the sweep (K2).
- R6 Loss of a second opinion at planning. The chart door already runs consultant seats before handoff (this chart has B, C and D), and every rebuttal in the 15 complete debate records opens with agreement (part 4). Nothing is lost that the door does not already supply.
- R7 The retired-name list in `routing.ts` looks like dead code in a year. One comment naming `issues/log.jsonl` history as the reason keeps it defensible; it is removable only by rewriting logs.

## 4. Handoff format

Answer: no, brief.md and design.md do not need strengthening. Evidence:

- Debate produced no different plans. In all 15 complete debate records (`positions-*.md`, `rebuttal-*.md`, `plan.md` present) the rebuttals open with agreement; `issues/closed/base-red/base-red-exit/rebuttal-B.md` `## Agreement` says "There is no substantive behavioral fork", and its `plan.md` `## Decisions` cites neither position. `plan.md` cites B's position in 8 of 15 and never in 7, after 2,000 to 3,600 words of positions and rebuttals per leaf.
- Debate did not reduce Fixes. Fix verdicts: akrogon debate-yes 3 of 5, debate-no 80 of 237; framework debate-yes 3 of 13, debate-no 308 of 622.
- The Fixes on debate leaves were implementation level, not handoff level: `base-red-exit/review-B.md` F4 (unexpanded base variable), `leaf-temp/leaf-temp-dir/review-B.md` F1 (guide claim mismatch), `akrogon-loop/github/pull-close/review-B.md` F1 and F2 (duplicate close comment, test coupled to prose), framework `capture-transport/session-transport/review-B.md` F6 and F7 (dangling timer, missing planned observation), `skill-rewrite-tooling/slice-boundary-anchors/review-B.md` F1 (report ellipsis), `render-ready-loud/review-B.md` F1 (separator validation). None names a brief or design gap.
- On debate-no leaves, Fix lines that mention the brief or design are 30 of 398 in akrogon and 136 of 2,027 in framework (about 7%); lines mentioning the plan are 43 and 215 (about 11%). The plan-caused ones cluster on proof planning, for example `issues/closed/herdr-session/session-routing/review-B.md` F4 "Planned proof omits criterion 7 ... and criterion 8" and `issues/closed/verify-waste/suite-refusal/review-B.md` F1 and F2 (planned test expectation corrections). That rule already lives in `skills/plan-issue/SKILL.md` `## plan.synthesis` (criterion to observation mapping); a brief or design field would not catch it.
- `## Implementation notes` appended to `plan.md` record implementation-time refinements, not design gaps: `issues/closed/beginner-docs/docs-reference-commands/plan.md` (D12 trailer applicability), `issues/closed/herdr-session/session-routing/plan.md` (rebase-surfaced helper removal, design Q2 corroboration).

The current shape suffices because design.md already carries the locked decisions, the `Open for the plan:` questions and the consumer-per-precondition rule (`skills/chart-issues/assets/shapes.md` `## Leaf files` design block), and plan-issue already requires design over brief on conflict and a proof per criterion. Smallest change if the operator still wants one: none in the contract files; tightening would go into `plan.synthesis` proof rules, which is out of this chart's scope.

## 5. Evidence lines

- E1 operator, `issues/chart/drop-debate/INTAKE.md`, 2026-10-25: 21 yes of 1,058 leaves; remove debate; check handoff strength.
- E2 practitioner, `src/state.ts` `stateSchema`, `readInventory`, `repoInventory`, 2026-10-25: strict schema, closed records parsed by default, failures become `unreadable`.
- E3 practitioner, `src/phase.ts` `ownerScope`, `src/timing-report.ts` `flowReport`, `src/status.ts` `statusCommand`, 2026-10-25: unreadable records block completion, kill timing, fail status.
- E4 practitioner, `src/log.ts` `logSchema`/`readLog`, `src/timing.ts` `timingEventSchema`/`readTimings`, 2026-10-25: phase enum reused; log throws, timings warn and drop.
- E5 practitioner, `issues/log.jsonl` (11 lines), framework `issues/log.jsonl` (24), framework `issues/timings.jsonl` (8), 2026-10-25: retired phase names in live history.
- E6 practitioner, `src/config.ts` `repoSchema`, 11 × `issues/config.yaml`, 2026-10-25: strict repo config, every repo sets `rebuttal: true`.
- E7 practitioner, `src/routing.ts` `routing`, `src/phase.ts` `transition`, `src/next.ts` debate gate, `tests/phase.test.ts`, `tests/next.test.ts`, `skills/watch-issues/scripts/observe.test.ts`, 2026-10-25: full command surface to delete.
- E8 practitioner, `readlink -f $(command -v akrogon)`, `~/.claude/skills`, `~/.codex/skills`, `~/.pi/agent/skills`, `docs/reference/releases-and-updates.md`, 2026-10-25: command and skills deploy together via `current`; release is one commit behind main.
- E9 practitioner, all registered `issues/` trees, 2026-10-25: zero open leaves, zero records at a debate phase, zero failures naming one.
- E10 practitioner, 15 complete debate records under `issues/closed/**` and framework `issues/closed/**`, 2026-10-25: rebuttals converge, plans cite B in 8 of 15, Fix verdicts not lower than debate-no.
- E11 practitioner, `learnings/LESSONS.md` 2026-09-11 line, 2026-10-25: grep-shaped criterion versus verbatim text collision.
- E12 model-knowledge, 2026-10-25: tolerant read of a retired field plus a strict write is the standard way to retire a schema key without a stop-the-world migration.

## 6. Questions this brief does not ask

- Q7 Does the operator want the 11 `rebuttal: true` config lines cleaned (K3 follow-up) or the tolerated key left in place?
- Q8 Is `issues/log.jsonl` history to be kept verbatim (K2 O3) or may it be rewritten?
- Q9 Should the test helper `leaf()` stop writing `debate` so a new-shape record is proven to parse (R4)?
- Q10 Should the chart record `Route:` keep the word lifecycle at all, now that lifecycle has one shape, or become `Route: lifecycle | direct` as proposed in K4?
