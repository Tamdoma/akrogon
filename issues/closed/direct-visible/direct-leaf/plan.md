# Plan: direct-leaf

Brief and design agree; no conflict found. `debate` does not apply (design is locked charting output). This synthesis answers the design's `Open for the plan` items as decisions D2, D6, D7, D11, D12, D13, D14, D15, D16, fixes the start-marker reading as D9, and derives the test constructions the proof lines demand. Research artifacts backing the decisions: `implementation/research-reconcile.md`, `implementation/research-skills.md`, `implementation/research-tests.md`, `implementation/research-timing-status.md` in this leaf folder, with the test-writer validation reports `implementation/report-test-writer-{1,2,3,4}.md`.

## Decisions

- **D1** State marker: optional `direct: z.boolean().optional()` on the state schema in `src/state.ts`, written only as `direct: true`. Nothing else in the schema changes; `direct` rides through every `commitMove`/`saveState` untouched, including `merged`. `readiness.yaml` is never written by the create verb (the door already wrote it).
- **D2** Verbs land as `akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...` and `akrogon direct-drop <slug> --chart <chart folder>`, both in `VERB_OPTIONS`/`VERB_USAGE` in `src/usage.ts` with per-verb help rows, dispatched in `src/akrogon.ts`. `--source` is the first repeatable flag in the codebase: use `util.parseArgs`'s native `multiple: true` on the option entry — standard library behavior, no new parsing machinery — and extend the `VERB_OPTIONS` typing to allow it. `tests/command-reference.test.ts` enforces exact row equality and holds a hard-coded argument contract per verb (L10-42): U1 must add the two contract entries in that test file itself, with a `Test-Change:` trailer citing brief item 1/2 (the verbs' existence is the cited outcome). `direct`'s implementation lives in a new module `src/direct.ts` (create + drop + shared probes); `akrogon.ts` stays a thin dispatcher per the existing verb pattern. (Answers `Open for the plan` 1: own verb. The verb's rerun branch covers the merged-leaf seat rewrite the merged-rerun alternative existed for.)
- **D3** `akrogon direct` create flow, in order, any failure refusing with the original error and writing nothing partial (each step runs only after all refusal checks pass):
  1. Refuse unless `HC_TERMINAL_ID` is set and `terminal()` probes it live (caller is inside hc). The caller's session is the `HC_TERMINAL_ID` terminal's own session, discovered by probing the caller address across `sessions().live` exactly like the reviewer probe.
  2. Scan `issues/open/*/<slug>` in the registered checkout: exactly one folder match, it holds `ISSUE.md` + `brief.md` + `design.md`, and no `state.yaml` — otherwise this is the rerun path (D4) or a refusal. Refuse when the owner folder (`issues/open/<owner>/`) holds any other leaf folder with a `state.yaml` (direct leaves are one-per-chart).
  3. Probe the reviewer address across `sessions().live` with `terminal(session, address)`: exactly one live session resolves it, else refuse (zero: no live session; more than one: ambiguous). Probe errors other than not-found refuse with the error.
  4. `checkBase(repo, true)` (fresh head, remote required per preflight norm), `createSparseWorktree(repo, worktreePath, base, { branch: slug })`, `writeLeafEnv` (exported from `src/next.ts`, `live` false — same correct-env decision startSeat makes for not-yet-live seats), `ensureLeafTemp(repo, slug)` for the log path's parent, `saveState` with `phase: implement`, `created` full ISO (`new Date().toISOString()`), `sources` in the order given, `frozen: {}`, `seat.A`/`seat.B` the resolved refs, `env_names` `repo.config.env`, no `tab`, `direct: true`, `repo`/`slug` and the schema defaults for the rest. No setup run, no worktree lock: `createSparseWorktree` already creates unlocked worktrees and the design's enumeration names no setup step; A runs setup itself when its work needs it, exactly as the old direct route had the door do.
- **D4** Rerun semantics: when the scan finds `state.yaml` with `direct` true (in `issues/open/`, or in `issues/closed/` for a merged leaf), the verb rewrites only `seat.A` and `seat.B` (both re-probed live), and for each slot whose stored address or session changed, deletes that slot's `delivery_error` key. `sources`, `prompted`, `created`, `phase` and every other field stay verbatim; no worktree or branch is created or recreated. A rerun whose scan finds `state.yaml` without `direct` refuses (`<slug> is not a direct leaf`).
- **D5** `akrogon direct-drop`: refuses unless the leaf is direct (any open phase except `merge`, or failed-but-never-merged), not merged, and `<chart>/direct/<slug>` does not already exist. Then: `cancelLeafRuns(repo, slug)` + the leaf-slice `systemctl stop` + per-run scope stop sequence factored out of `stopLeaf` into a shared exported helper in `src/stop.ts` (e.g. `stopLeafWork(repo, slug, slice)` — stopLeaf calls it too; direct-drop skips only the seat-ending and the `stopped.yaml` record); `git worktree remove --force` + `git update-ref -d refs/heads/<slug>` (the work is deliberately being abandoned or carried in the report, so force is the correct semantics; failures refuse with the git error before the move); finally `rename` the owner folder `issues/open/<owner>/` to `<chart>/direct/` so the leaf folder lands at `<chart>/direct/<slug>` beside `ISSUE.md`. No seat, terminal, tab, sweep or stopped record is touched.
- **D6** Slots: `requiredSlots(phase, rounds, direct?)` and `historicalSlots(phase, rounds, direct?)` in `src/routing.ts` gain a defaulted `direct = false` third parameter. Direct mapping: `implement`/`check.fix`/`check.repair`/`merge`/`failed` → `['A']`; `check.review` → `['B']` at every round; `plan.*`/`closed` keep the lifecycle mapping (a direct leaf never occupies them, so the value is irrelevant but total). Lifecycle output is byte-identical for every existing caller because the default is false. Every caller that has the leaf's state passes `state.direct === true`: `next.ts` (dispatch/capacity/waits), `phase.ts` (both uses), `status.ts` (`waits_on`), `timing-report.ts` (`historicalSlots` call inside `visitGaps` — threaded from the leaf inventory, see D12). (Answers `Open for the plan` 5: both functions take the flag, per the design text.)
- **D7** `check.repair → merge` for direct leaves in `src/phase.ts`: the existing condition is extended, not replaced — lifecycle leaves keep today's exact acceptance. For a direct leaf the move is accepted only when `merge_exit.reason === 'red'` and `merge_exit.top` equals the leaf branch's current head (the unedited-return proof); every other direct `check.repair → merge` refuses with the move illegal. Both branches are one condition composition in the same guard; no second call site. (Answers the brief item 5 mechanism.)
- **D8** `commandMerged` in `src/phase.ts` sets `broadcast` only when the repo configures at least one target: `repo.config.broadcast` is present and its `discord.webhook_env` list is non-empty. This is configuration presence only — no `process.env` evaluation: the command never reads webhook URLs today (verified: `webhook_env` appears nowhere in src outside the config schema; the broadcast-issue skill consumes the env vars at send time), and the design's words are 'configures at least one target'. Whether the URL is set is the skill's runtime concern, not the recording gate. When the gate passes, the completed owner is non-null for every leaf kind. Consequence per the design's consumers note: existing broadcast-positive tests whose fixture repos configure no target must be given a target — `tests/green-merge.test.ts` (the 'completing push hands off exactly one broadcast seat' test), `tests/batch-dispatch.test.ts` and `tests/session-routing.test.ts` broadcast cases, and any other test asserting `state.broadcast` presence or `broadcast-issue` prompts (U5 owns this sweep; each edit carries a `Test-Change:` trailer citing the design line). Negative control: `tests/green-merge.test.ts:185`'s `broadcast` undefined assertion already matches the gated behavior for a config-less repo and stays unchanged.
- **D9** Start-of-attempt: one exported helper in `src/status.ts`, e.g. `leafStart(state, started: Map<string, number>): number | undefined` — direct leaves return `Date.parse(state.created)`, lifecycle leaves return `started.get(state.slug)`. Every consumer of `started.get(slug)` in `src/status.ts` (TIME cells in the leaf table, JSON `first_prompt`, merges-table `total_ms`, stopped/kept leaf rows) routes through it. `state.created` stays a plain string in the schema; `flowReport`'s `created.slice(0, 10)` already tolerates the full ISO form. JSON shape unchanged: `first_prompt` stays `z.number().nullable()`, it simply carries creation time for direct leaves. The status-detail seats block for a direct leaf prints the recorded seat refs (`<session>/<address>` per slot) instead of the next-start seat recipe lines; the JSON `seats` block is untouched.
- **D10** `observeBusy` in `src/next.ts` gains a direct branch: seat discovery uses the recorded refs — `terminal(ref.session, ref.address)` per slot, no `place`, no labels, no `akrogon.repo` session assumption — with not-found/any-error treated as unobservable for that seat (no busy write, no throw: a dead door terminal must not wedge the engine). Only the current phase's required slots are written into `busy_since`; every non-required slot's `busy_since` is cleared even when its terminal is working. Blocked/stall notice records are never written for direct seats (they are shared terminals; notice files would misfile them as leaf seats). `dispatchLeaf` skips, for direct leaves only: `checkBase`, `repoSpace`/`place`, `leafSeats` discovery, `allocate`, `dispatchSlot`, `endSeats` — the pass reduces to the busy observation. The `activeCount` fallback branch treats direct leaves as unseated: a direct leaf's worktree neither counts as `seated` nor joins the unfinished-count, in both the worktree-scan and the count expression.
- **D11** No explicit shell-sweep check is added (answers `Open for the plan` 3, resolved negative). `sweepToolCgroups` enumerates `*.scope` directories containing `tools/` inside the leaf slice. `tools/` is created only by `startSeat`'s bootstrap, and the placement entry acts only inside a seat scope whose env carries `AKROGON_SEAT_CGROUP`. Direct leaves never start seats and their run scopes are created by `run-check`, which never creates `tools/`. The sweep therefore structurally enumerates nothing for a direct leaf, in every phase move — a guard cannot be broken because there is no guard, only absence of mechanism. Criterion 3's seats-untouched test covers phase moves end to end; the design's "deliberate break" for this bullet is answered by the seating-break variant below it (mislabeled seats do end — that break is meaningful and implemented, see criterion 3).
- **D12** `src/timing-report.ts`: the leaf inventory lookup threads `direct` into `visitGaps`. Direct visits suppress `prompt` gaps and the round-0 `check.review` `seat_done` gap entirely — not by slot-list trickery but by explicit kind filter, because direct seats are never prompted so the gap kind is meaningless regardless of rounds. `check_end` pairing is unchanged: direct runs are real runs and an unmatched `check_end` still surfaces. The merged-leaf `total_ms` cell comes free from D9.
- **D13** Reconcile (`src/reconcile.ts`): (a) `broadcastInProgress` gains a direct branch — for a direct leaf it probes `terminal(state.seat.B.session, state.seat.B.address)` directly instead of scanning the passed live list, returning in-progress when the probe fails (terminal gone or unreadable: keep, matching the `live === null` semantics) or B is neither idle nor done; (b) the temp-sweep chain gains an explicit keep for unfinished direct leaves (placed before `dropChecked`, mirroring the worktree chain) since no seat pane ever has the worktree as cwd and `livePaneInside` can never protect them — failed direct leaves are excluded from this keep exactly as failed lifecycle leaves lose their temps today; (c) nothing else changes: `sliceKeepReason`'s `tab === undefined && !finished` branch already covers unfinished direct slices, merged-after-broadcast slices drop through the existing null path, `endFinishedSeats`/`closeTabOf`/`closeMergedTab` already no-op on direct leaves because `leafSeats` is label-based and `tab` is undefined, and `akrogon close`/`park`/`unpark` need no direct branch. (Answers `Open for the plan` 4 partially; the remainder is D10/D11.)
- **D14** Broadcast turn (`src/next.ts` `broadcastPass` + `src/turn.ts` advance context): for a direct leaf, no `allocate` and no `dispatchSlot`; the pass probes `terminal(state.seat.B.session, state.seat.B.address)`. Probe failure or a working/attention/unset status → send nothing, leave `broadcast_pending` true (the slice/temp/worktree keeps in D13 hold the leaf in place). Status `idle` or `done` → `send` the same broadcast prompt text lifecycle leaves get, record `prompted.B`; send failure records `delivery_error.B` and retries follow the existing settle rules (a turn advancing past the prompt clears it; a re-failed send re-records it). This is the minimal delta: the lifecycle path is untouched and the direct path is one probe + one send. (Answers `Open for the plan` 6: yes, B's turn must advance — see criterion 8's construction; with B working the send must NOT happen, so no queuing trick is possible; the test's "ends B's turn" is a real end-of-turn on the stand-in.)
- **D15** Skill rewrite shape (answers `Open for the plan` 2): `skills/chart-issues/SKILL.md`'s direct section is rewritten in place into the leaf-lifecycle flow — door writes `ISSUE.md`/`brief.md`/`design.md`/`readiness.yaml`, runs `akrogon direct <slug> --reviewer <address>`, implements in the created worktree as slot A, sends to review with `akrogon phase <slug> check.review --slot A` per round, handles the `failed` stop when the task grows, and `akrogon direct-drop` when the operator abandons it. The direct bullet in `assets/shapes.md` is rewritten (a direct chart writes real leaf files under `issues/open/<chart-slug>/<slug>/`). `assets/direct-route.md` and `scripts/direct-guards.ts` are deleted; `tests/direct-guards.test.ts` is deleted; the direct-guards cases in `tests/receipt-gates.test.ts` are deleted — precisely: one dedicated test at L308 plus the direct-guards invocations embedded in the two merge-gate tests at L152-181 and L228-276, whose remaining merge-gate assertions stay; the direct-landing expectations in `tests/docs-links.test.ts` are deleted or retargeted at the surviving docs. `implement-issue`'s direct form is rewritten: `implement-issue <slug> slot=A phase=implement leaf=<folder>` — the leaf form, since a direct leaf IS a leaf; the standalone-direct paragraph is replaced by one short note that chart-door direct work uses the leaf form with the folder `akrogon direct` created. `check-issue`/`broadcast-issue`/`plan-issue`/`watch-issues` mentions shrink to what the leaf flow makes true. `docs/reference/commands.md` gains full `direct`/`direct-drop` rows in the same pass as the verbs (U1), because `tests/command-reference.test.ts` enforces row sync mechanically; `docs/use/quick-fix.md`, `README.md` factory section and `docs/README.md` lines are rewritten in the docs unit.
- **D16** Test construction choices: (a) direct-leaf fixtures for pure state/phase tests are written directly with the `yaml` helper (`leaf()` + rewrite `state.yaml` adding `direct: true`, ISO `created`, seat refs) — no dependency on the create verb; (b) `hcFixture`-based tests use real cores and stand-in terminals; the door/reviewer terminals are spawned with `core.hc(['run', ...])` and `adopt`ed per the `tests/door-exchange.test.ts`/`tests/next.test.ts` precedent (`tests/charting.test.ts` does not exist — corrected during test writing); (c) cross-session seats use a second `hcCore` in the same fixture (F10 precedent); (d) the duplicate-reviewer-session refusal uses a symlinked second socket name for the same core under `XDG_RUNTIME_DIR/herdr-core/` — `sessions()` lists both names as live and both resolve the address; (e) `max_active` is set to `1` through the global-config `configure()` pattern of `tests/next.test.ts` (`settings.yaml`/`renderSettings` do not exist — corrected during test writing); (f) the unreadable-session fallback construction uses a second registered repo with no core at all (its `repoSpace` refusal is the natural unreadable case), per research-timing-status.md.
- **D17** New test files only, one per criterion cluster — no existing test file is modified by the criterion tests, so no `Test-Change` trailer is needed for them; the files are inside the branch diff when the implement move records `frozen`. Files: `tests/direct-create.test.ts` (criteria 1+2), `tests/direct-seats.test.ts` (criterion 3), `tests/direct-active.test.ts` (criterion 4), `tests/direct-timing.test.ts` (criterion 5), `tests/direct-runs.test.ts` (criterion 6), `tests/direct-phases.test.ts` (criterion 7 routing/citations part), `tests/direct-land.test.ts` (criteria 7 landing part + 8), `tests/direct-drop.test.ts` (criterion 9). Criterion 10 needs no new test: it is enforced by the existing `tests/command-reference.test.ts`/`tests/cli-help.test.ts` machinery once the verbs exist (proof command is those existing files). The skill/prose deletions in U6 touch existing test files (`receipt-gates.test.ts`, `docs-links.test.ts`) and carry `Test-Change:` trailers citing the brief lines that remove the door-landing route.

- **D18** `stop --all` selection (`src/stop.ts:99-104`) is `(tab !== undefined || batch !== undefined) && phase !== 'merged'` at base, which excludes every direct leaf since none ever has a tab. Selection gains `|| state.direct === true` for unfinished direct leaves: the operator meaning of `--all` is everything in flight, `stopLeaf` already works correctly on direct leaves (label-based `endSeats` no-ops, slice/run stops apply), and the merge-batch condition already covers the one in-flight merge case. `akrogon stop <slug>` by name is unaffected (selection is by slug). Criterion 3's test asserts only exit 0 for `stop --all` with presence-only lifecycle records — no test change needed, but U1/U3's implementation must not regress the selection for tabbed leaves.

## Open limitation

None beyond the design's recorded residuals (kill-chain internals, shell sweep visibility, mid-turn slaughter race). They stay as recorded in the design and are not re-litigated here.

## Read-first

- `src/state.ts` — schema, `saveState`, `readState`.
- `src/routing.ts` — `requiredSlots`/`historicalSlots`, phase/slot types.
- `src/akrogon.ts` + `src/usage.ts` — verb dispatch, `parseArgs` strictness, `VERB_OPTIONS` shape, `verify-pass` hidden-verb precedent.
- `src/next.ts` — `dispatchLeaf` structure, `observeBusy`, `activeCount`, `allocate`/`capRefusal`, `writeLeafEnv`, `createSparseWorktree`, `broadcastPass`, `dispatchSlot` send/record mechanics.
- `src/phase.ts` — `moveGuards`/`requireFrozenCitations`, `commitMove` (kill sweep, tab rename), `commandMerged`, `closeSources`, `greenReceipt`.
- `src/reconcile.ts` — `sliceKeepReason`, `broadcastInProgress`, `leafSeats`/`endSeats` label dependence, temp sweep chain ordering, `closeTabOf`/`endFinishedSeats`.
- `src/stop.ts` — `stopLeaf` sequence to factor.
- `src/turn.ts` — `mergeQueue`, `runBatch`/`holding` shapes.
- `src/status.ts` — `starts()`, TIME cells, `leafJson`/`first_prompt`, merges `total_ms`, detail seats block, `leafSeatRefs` (label-based — direct seats need the refs, not this).
- `src/timing-report.ts` — `visitGaps`, leaf inventory construction, kind filter points.
- `src/hc.ts` — `sessions()`, `terminal()` probe, `HcError`/`errorKind` (`not_found`), `send`/`advance`.
- `src/run-check.ts` — `leafTarget` attribution (no change needed; read to confirm).
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`, `greenReceipt`, `holding` patterns.
- `tests/hc-fixture.ts` — `hcFixture`, `hcCore`, `core.hc`/`adopt`/`delivered`, stand-in terminal spawning, second-core precedent (`tests/next.test.ts` `otherRepo`/`core.link`).
- `tests/green-merge.test.ts` — the holding/land drive `tests/direct-land.test.ts` replicates.
- `tests/timing-report.test.ts` — visit/gap fixture construction to copy.
- `research-*.md` in the worktree — the four investigation reports with exact line references.

## Interfaces

- State: `direct: true` optional boolean on `state.yaml`.
- `akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...` — stdout prints the leaf folder path and worktree path (one line each, labeled), exit non-zero with the refusal on stderr otherwise.
- `akrogon direct-drop <slug> --chart <chart folder>` — `<chart folder>` is the chart folder path as chart-issues knows it (`issues/chart/<chart-slug>` or the operator-facing folder); the owner folder moves to `<chart folder>/direct/`.
- `requiredSlots(phase, rounds, direct?)` / `historicalSlots(phase, rounds, direct?)` — defaulted third param.
- `leafStart(state, started)` exported from `src/status.ts`.
- `stopLeafWork(repo, slug)` (name may vary) exported from `src/stop.ts` — the run/slice stop sequence without seat teardown.
- `writeLeafEnv` exported from `src/next.ts`.

## Waves

Wave 1 holds U1 alone: every later unit's tests and some units' product code assume the state schema accepts `direct` and the create verb exists. Wave 2 parallelizes the three disjoint behavior units. Wave 3 is the broadcast delta, which edits `next.ts`/`phase.ts`/`reconcile.ts` after wave 2. U6 (skills/docs) is wave-parallel with U1 because its paths are fully disjoint and `tests/command-reference.test.ts`/`cli-help` rows for the new verbs are owned by U1, not U6.

- **W1 — U1** Verbs and state: `src/state.ts` (`direct` field), `src/direct.ts` (create + drop + probes), `src/akrogon.ts` (dispatch), `src/usage.ts` (VERB_OPTIONS/VERB_USAGE/help rows), `src/next.ts` (export `writeLeafEnv`), `src/stop.ts` (factor `stopLeafWork`, direct-drop uses it; `stopLeaf` itself unchanged — label-based `leafSeats` already ends nothing for direct; plus the D18 `stop --all` selection extension), `docs/reference/commands.md` (the two verb rows, owned here so `command-reference.test.ts` stays green the moment the verbs exist). Makes `tests/direct-create.test.ts` and `tests/direct-drop.test.ts` pass.
- **W1 — U6** Skills and prose docs: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, delete `skills/chart-issues/assets/direct-route.md` + `skills/chart-issues/scripts/direct-guards.ts` + `tests/direct-guards.test.ts`, edit `tests/receipt-gates.test.ts` + `tests/docs-links.test.ts` (drop the direct-guards/landing cases), rewrite the direct mentions in `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `docs/use/quick-fix.md`, `README.md`, `docs/README.md` (the agent-facing direct-route flow and the hc report line, design item 10). U6 does NOT edit `docs/reference/commands.md` — U1 owns that file whole (both the new rows and the prose corrections inside it), so wave-1 cherry-picks cannot conflict on it. Disjoint from U1 otherwise: U6 touches no `src/` and no test file U1 touches.
- **W2 — U2** Phase routing: `src/routing.ts` (both functions), `src/phase.ts` (`requiredSlots` call sites, the `check.repair → merge` direct condition, `commandMerged` hasTargets gate), `src/timing-report.ts` (direct threading + gap suppression). Makes `tests/direct-phases.test.ts` pass; `tests/direct-timing.test.ts` is jointly owned by U2 (gap suppression) and U4 (start-time surface) — it goes green only with both wave-2 units landed, which is fine because the wave completes before verification.
- **W2 — U3** Engine pass and capacity: `src/next.ts` (`observeBusy` direct branch, `dispatchLeaf` skips, `activeCount` fallback direct exclusion, `requiredSlots` threading), `src/reconcile.ts` (temp-sweep unfinished-direct keep, `broadcastInProgress` direct probe). Makes `tests/direct-seats.test.ts` and `tests/direct-active.test.ts` pass. (`broadcastInProgress` here is only the probe correction; the send path is U5.)
- **W2 — U4** Status surface: `src/status.ts` (`leafStart` + all consumers, detail seats block for direct, `waits_on` threading). Makes the status assertions inside `tests/direct-create.test.ts`/`tests/direct-timing.test.ts`/`tests/direct-seats.test.ts` complete; no test file of its own.
- **W3 — U5** Broadcast turn and landing: `src/next.ts` (`broadcastPass` direct branch), `src/status.ts` (`scanRepo`/`leafJson` inclusion of closed broadcast-pending leaves — see Implementation constraints; small and disjoint from U4's wave-2 edits because it touches the scan filter, not the start/seats surfaces), the existing-test target sweep of D8 (`tests/green-merge.test.ts`, `tests/batch-dispatch.test.ts`, `tests/session-routing.test.ts` broadcast-positive cases gain `webhook_env` in their fixture config, each edit with a `Test-Change:` trailer citing the design's consumers note), `src/turn.ts` if the merge queue needs no change it is not edited — verification only, plus `tests/direct-land.test.ts` green (criteria 7 landing + 8 all live here). Depends on W2 because it composes with the phase routing, the reconcile keeps and `commandMerged`'s gate.

Docs affected: `docs/reference/commands.md` (U1 rows), `skills/*` + `README.md` + `docs/use/quick-fix.md` + `docs/README.md` (U6), `src/AREA.md` one line for `src/direct.ts` (U1). `tests/AREA.md` gains the new test file names (U1–U5 as they land, whoever adds the file owns the line).

## Done-criteria -> proof

Each criterion's proof command is one `bun test` invocation (runner exists at base) run through `akrogon run-check`. Red outputs are recorded under `## Red evidence` from the plan-time runs. Size and rerun triggers per criterion.

### Criterion 1 — create verb shape, seats, worktree, env, no tab, status visibility

Condition coverage (decision × condition):

- Every refusal writes nothing (D3 ordering: all refusal checks before any write): covered — each refusal case asserts no state.yaml, no worktree, no branch after the call. A create that writes before refusing fails these.
- Caller session is the caller terminal's own session, not the repo session (D3.1): covered — the reviewer probe runs across `sessions().live` and the happy path asserts seat refs carry the probed session; a lookup confined to the repo session fails in fixtures where the door sits in a different session, and the cross-session seating of criterion 3 exercises it end to end.
- Reviewer ambiguity vs absence (D3.3): covered — dead-reviewer and duplicated-socket cases are separate tests.
- Rerun detection by state presence, not folder presence (D4): covered — the not-a-direct-leaf refusal (state without `direct`) and the rerun cases share the scan but diverge in outcome; both pinned.
- Env written for a not-yet-live seat (D3.4, `live` false): traced — the `.env` content assertion passes only with the seat env vars absent, and `writeLeafEnv`'s `live` parameter is the single control; no second path exists.
- No tab, no lock, no setup (D3): covered — explicit `tab` absence in raw yaml, unlocked-worktree assertion; setup non-execution is traced (the verb never invokes it — no test can distinguish a skipped setup in fixture time, and the design fixes the enumeration).

Test: `tests/direct-create.test.ts`. Construction (hcFixture):

- Folder setup: `issues/open/chart-x/fix-alpha/` with `ISSUE.md`, `brief.md`, `design.md` written by the test (no `state.yaml`); a door terminal (stand-in `cat`) spawned in the fixture core and adopted; a reviewer terminal likewise.
- Happy path: `cli(f, ['direct', 'fix-alpha', '--reviewer', '<reviewer-address>'], env with HC_TERMINAL_ID=<door-address>)` — note: the verb resolves the caller's session by probing, so the test env needs `XDG_RUNTIME_DIR` pointing at the fixture runtime (already the fixture default for cli). Asserts: exit 0; `state.yaml` exists with `direct: true`, `phase: implement`, `frozen: {}`, full-ISO `created` (parses, contains `T`), `sources` absent/empty, `seat.A.address` = door, `seat.B.address` = reviewer, both sessions the fixture session, no `tab` key, `env_names` matching the fixture config env; the worktree exists at the recorded path, `git -C <wt> rev-parse --abbrev-ref HEAD` is `fix-alpha`, base matches `checkBase`; no lock file in `.git` worktree metadata (`git worktree list` / `git -C <wt> config` — assert `git worktree lock` state absent); `.env` written in the worktree with the fixture's tracked content; `akrogon status --json` lists the leaf with phase `implement` (status reads the created state).
- `--source` variant: two `--source` flags in order; assert `sources` array order preserved.
- Refusal matrix (each: non-zero exit, stderr names the reason, and no state.yaml/worktree/branch exists after): (a) no `HC_TERMINAL_ID` in env; (b) `HC_TERMINAL_ID` a dead address; (c) no folder for the slug; (d) two owner folders each holding the slug without state (ambiguous); (e) folder already has `state.yaml` without `direct` (not a direct leaf); (f) owner folder holds a sibling leaf folder with `state.yaml`; (g) reviewer address dead in every live session; (h) reviewer duplicated via the symlinked-socket construction (D16d).
- Rerun: after creation, `akrogon direct fix-alpha --reviewer <new-reviewer's-address>` succeeds; assert seats rewritten, everything else verbatim. Seed `delivery_error` on both slots and `prompted`/`sources` first: rerun changing only the reviewer clears `delivery_error.B` and keeps `delivery_error.A`; `sources`/`prompted` byte-identical. Rerun on a merged leaf: hand-move the owner folder to `issues/closed/` with `phase: merged` in state, remove worktree+branch first, then rerun — assert seats rewritten and no worktree/branch recreated.
- Red at planning: verb unknown — usage error exit.

Proof command: `akrogon run-check --name direct-create -- bun test tests/direct-create.test.ts --timeout=120000`. Size: minutes. Rerun trigger: any change to `src/direct.ts`, `src/akrogon.ts`, `src/usage.ts`, `src/state.ts`, `src/next.ts`.

### Criterion 2 — rerun rewrite-only semantics

Folded into `tests/direct-create.test.ts` (the rerun block above): one scenario proves rewrite-only, delivery-error clearing per changed slot, source/prompted preservation, and the merged-leaf no-recreate case. Same proof command and size as criterion 1. The proof lines in the brief are satisfied because criterion 2's behaviors are unreachable without criterion 1's creation.

### Criterion 3 — seats never touched, no tab, cross-session busy

Condition coverage:

- No terminal of the leaf's seats is ended/renamed/sent/killed across moves, stops and passes (D10 skips + label-based teardown): covered — `seatsUntouched()` runs after every step, pid-pinned, plus the shim-log targeting filter. The mislabel break proves the detection wiring is live (without it every negative assertion could be vacuous).
- `akrogon stop`/`stop --all` still stop the leaf's work (D5 factoring): covered — `stopped.yaml` records the stop while terminals survive.
- Busy recorded for required slots across sessions (D10): covered — the reviewer lives in core 2; an observe confined to the repo session can never see it.
- Non-required slots never accumulate busy state (D10 clearing): covered — the clearing pass starts from seeded `busy_since` on both slots so the assertion cannot pass vacuously.
- No blocked/stall notices for direct seats (D10): covered — notice files asserted empty after passes where a working seat would normally trigger them.
- No `akrogon.leaf` labeled terminal is ever created for the direct leaf (D3/D10): covered — asserted in both cores after every step.
- Kill sweep never reaches direct seats: traced, no case — D11's structural argument (no `tools/` can exist without `startSeat`); the phase-move steps of this test exercise the sweep on every move with the seats asserted alive, which is the observable end state.

Test: `tests/direct-seats.test.ts` (hcFixture, two cores). Construction:

- Door terminal: plain `cat` stand-in in core 1, adopted. Reviewer: a second stand-in in **core 2** (cross-session seat). A lifecycle leaf `lc` with real labeled seats exists in the same repo as the control.
- Direct leaf created via D16a fixture state (or the verb; either), seat refs pointing at the two terminals.
- Sequence follows the legal move graph (implement → check.review → check.repair → check.fix → check.review), asserting after every step (both terminals live, same pid, `renames(f)` empty for them, shim log has no `send`/`end`/`kill` targeting them): `phase fix-alpha check.review --slot A` (after greenReceipt + citations), `phase fix-alpha check.repair --slot B` (B hands findings), `phase fix-alpha check.fix --slot A` (round counted), `phase fix-alpha check.review --slot A` (A returns the fix), `phase fix-alpha check.repair --slot B` again (round 1 — exercises the every-round B rule end to end); `cli(f, ['stop','fix-alpha'])` (assert `stopped.yaml` records the leaf — stopping must still work), `unstop` equivalent (delete record) then `cli(f, ['stop','--all'])` with a second leaf also stopped; `cli(f, ['next','--repo',...])` passes; a reconcile pass. Assert no `akrogon.leaf=fix-alpha` labeled terminal exists in either core at any point.
- Busy recording: terminals report working via the stand-in `fake --model work` OSC statuses — A's terminal for the implement-phase assertion, B's (cross-session) for the review-phase assertion. Assert both. Then clear A to idle while still implement and make B working: after a pass, `busy_since.A` is undefined and `busy_since.B` stays undefined (B not required in implement — non-required clearing). Assert no files under `issues/blocked/` or `issues/stalls/` appeared from these passes.
- Mislabel break (the meaningful deliberate break): label the door terminal `akrogon=1 akrogon.repo=<repo> akrogon.leaf=fix-alpha akrogon.seat=a` via `hc label` (test-only, simulating the regression where something mislabels it), run `cli stop fix-alpha`, assert the terminal IS ended — proving the test wiring can detect seat teardown. Remove the labels / use a fresh terminal for the rest.
- Red at planning: schema rejects `direct` — fixture state unreadable, every pass errors.

Proof command: `akrogon run-check --name direct-seats -- bun test tests/direct-seats.test.ts --timeout=120000`. Size: minutes. Rerun trigger: `src/next.ts`, `src/reconcile.ts`, `src/stop.ts`, `src/phase.ts`.

### Criterion 4 — max_active never counts a direct leaf

Condition coverage:

- Label branch never counts: traced — no labeled terminal can exist for a direct leaf (criterion 3), so `countTerminals` is structurally 0; the available variant pins the outcome end to end.
- Fallback worktree-scan exclusion (D10): covered — the fallback variant (repo2 session unreadable) reds when the exclusion is reverted; recorded as a deliberate-break obligation in Red evidence.
- Fallback unfinished-count exclusion: covered by the same variant — repo2 holds only the direct leaf, so either counting path alone hits the cap of 1.
- Lifecycle leaves still count in the fallback: traced — the lifecycle branch is untouched; existing capacity tests cover it.

Test: `tests/direct-active.test.ts` (hcFixture). Construction:

- `max_active: 1` in fixture settings (D16e). Repo 1 (the fixture repo) holds one unfinished direct leaf (any phase) and one lifecycle leaf `lc` in implement needing a seat.
- Available variant: place resolves (repo session live). `cli next` → the lifecycle leaf's A seat is started (`setSeat`/delivered evidence or the seat terminal exists with `akrogon.leaf=lc`); no `capacity` wait row in the leaf log and no capacity refusal text in output. Control assertion without the direct leaf present is unnecessary — the brief requires the outcome with the direct leaf active.
- Fallback variant: second registered repo `repo2` with its own fixture repo on disk, holding exactly one direct leaf unfinished, and **no core** for its session (`repoSpace` unreadable → fallback branch). Same `max_active: 1`. `cli next` for repo1 → lifecycle leaf still seats, no capacity wait. On base code (or without the direct exclusion) repo2's fallback count is 1, the cap is hit, and repo1's leaf waits on capacity — the red state.
- Deliberate break check: temporarily reverting the worktree-scan exclusion (`!leaf.state.direct` in `activeCount`'s fallback) turns the fallback variant red — recorded at planning since the whole test is red there.
- Red at planning: schema/dispatch missing.

Proof command: `akrogon run-check --name direct-active -- bun test tests/direct-active.test.ts --timeout=120000`. Size: minutes. Rerun trigger: `src/next.ts`.

### Criterion 5 — TIME from creation, no visit gaps, runs counted

Condition coverage:

- TIME/`first_prompt`/`total_ms` all derive from creation for direct leaves (D9): covered — three separate consumers asserted (text cell, JSON field, merges total).
- Lifecycle leaves unchanged: covered — the control leaf row pins the blank-TIME shape and the visit-gaps control pins both gap kinds.
- `check_end` pairing unaffected (D12): covered — the unmatched-check-end case yields exactly one gap.
- Runs counted: covered — the attributed run pair renders in the report lines.
- The ISO `created` never breaks date-slicing consumers: traced — `flowReport`'s `slice(0,10)` is prefix-correct for both forms; no other consumer parses it as a date-only string.

Test: `tests/direct-timing.test.ts`. Construction (copies `tests/timing-report.test.ts` fixture patterns):

- Direct leaf with `created` a full ISO timestamp T0. No prompt timings exist. `cli status` (text) → the leaf row's TIME cell reflects now−T0 (assert non-empty/` Xm` shape against a T0 minutes in the past — the lifecycle leaf control row without prompts shows blank). `cli status --json` → `first_prompt` equals `Date.parse(T0)` exactly; `waits_on` correct for the phase.
- Merge total: seed the leaf as merged with a close row at T1; the merges table `total_ms` equals T1−T0 (not null).
- Visit gaps: construct the leaf's state/log/timings exactly like the `visitGaps` test precedent — visit_start/visit_end rows plus prompt/wait rows absent for direct seats. Assert `visitGaps` output (via the timing report command `cli timing` or the exported function per the existing test's import pattern) contains no `prompt`-kind and no `seat_done`-kind gap for the direct leaf, while a control lifecycle leaf with the same shape does produce them. Then add a `check_end` row whose `check_start` is missing: exactly one `check_end`-kind gap for the direct leaf — pairing detection intact. Include one real run pair (start+end) attributed to the leaf: the merged/started-runs line counts it, per the brief's runs-counted clause.
- Red at planning: schema rejection + gaps not suppressed + first_prompt null.

Proof command: `akrogon run-check --name direct-timing -- bun test tests/direct-timing.test.ts --timeout=120000`. Size: seconds–minutes. Rerun trigger: `src/status.ts`, `src/timing-report.ts`.

### Criterion 6 — run attribution from the worktree

Test: `tests/direct-runs.test.ts` (hcFixture for the worktree; patterned on `run-attribution` tests). Construction:

- Direct leaf with its real worktree (created through `createSparseWorktree` in the test or via the verb). From inside the worktree: `cli(f, ['run-check','--name','dcrun','--','sh','-c','true'], cwd=worktree)` — assert exit 0, `check dcrun: 0` line printed, run record `leaf` field is the slug, timings rows carry the slug, receipt/log published under the leaf temp `implementation/`. Same for `cli(f, ['verify'], cwd=worktree)` when the fixture's checks are trivial — or the lighter `run-check`-only construction if verify cost is high (verify shares `leafTarget`, so one path proves attribution; assert the `verify` path by reading `verifyCaller`'s shared use — no, assert behaviorally: run `verify` too, the fixture checks are the standard fast ones per existing run tests).
- Repo-root control: same command from the repo root attributes no leaf (existing behavior, guards the attribution didn't turn greedy).
- Red at planning: worktree/state unreadable.

Proof command: `akrogon run-check --name direct-runs -- bun test tests/direct-runs.test.ts --timeout=120000`. Size: minutes. Rerun trigger: `src/run-check.ts`, `src/verify.ts` — neither is planned to change; this test is a contract proof, so a red here means an unintended regression.

### Criterion 7 — phase routing, citations, landing

Condition coverage:

- B-only review at every round including 0 (D6): covered — `waits_on` pinned at rounds 0, 1, 2 across the legal sequence; round-0 is the case lifecycle behavior would violate.
- `check.repair → merge` only unedited after red (D7): covered — four shapes (no exit, conflict exit, red exit with moved head refused; red exit at head accepted). The head-moved case is the one a reason-only check would miss.
- Citations fire with `frozen: {}` (D-design item): covered — the added-test-file case; shim-validated against base so the construction is known-correct.
- Legal-graph enforcement unchanged for direct leaves: covered — the illegal-move matrix and wrong-seat refusals.
- Merge/landing identical to lifecycle: covered — direct-land T1 pins remote tip, owner close, source close and attempt row shape against the same assertions green-merge uses.

Two files.

`tests/direct-phases.test.ts` (pure fixture, no hc needed beyond terminal refs): legal direct sequence green end to end, following the legal move graph — implement → `check.review` (A's implement-end move) → `check.repair` (B hands findings) → `check.fix` (A) → `check.review` (A's fix return) → `check.repair` (round 1) → `check.fix` → `check.review` → `merge` — each asserted exit 0 and `waits_on` correct per round (B alone in `check.review` at every round; A in implement/check.repair/check.fix); illegal moves refused with exit non-zero and the existing refusal text shape: `implement → merge`, `implement → check.fix`, `implement → failed` without `--reason` then accepted with, `check.repair → merge` in each disallowed shape (no `merge_exit`; `merge_exit.reason` `conflict`; `merge_exit.reason` `red` but head moved since), `check.review` round-0 moved by `--slot B` refused (the every-round B rule — wait: round-0 `check.review` for direct requires B, so moving INTO check.review is A's implement-end move, legal; the refusal case is `check.fix`-end or `check.repair`-end moves attempted by the wrong slot's phase rules — construct per the existing requiredSlots tests: assert `waits_on` and the `phase` command's seat validation refusal when the move's required seat doesn't match), `merge → anywhere` by hand. Citations: commit in the leaf worktree adding a test file without `Test-Change:` → `check.review` move refused naming the citation; amend/add trailer → accepted. Frozen editing: `frozen: {}` never blocks edits, but added test files are never in the frozen record so the citation guard fires for them exactly as it does at planning time (verified in `requireFrozenCitations`: the `A`-status branch keys off absence from `frozen`, not its emptiness) — this is precisely the brief's 'implemented with the same frozen-citation enforcement' reading.
- `check.repair → merge` accepted shape: `merge_exit` written `{reason:'red', top:<head>}` with head unchanged → exit 0, phase merge.

`tests/direct-land.test.ts` (hcFixture, `holding(f)` replication per research-tests §6c): direct leaf in `merge` phase with the batch/holding construction; `cli next` drives the land; assert remote tip fast-forwarded, `akrogon land` output identical in shape to lifecycle, `state.phase` `merged`, `closeSources` evidence via fake-gh for the leaf's sources (seed `sources` with a fake issue), owner folder moved to `issues/closed/…`.
- Red at planning: schema rejection; direct repair-merge rule absent; hasTargets gate absent.

Proof commands: `akrogon run-check --name direct-phases -- bun test tests/direct-phases.test.ts --timeout=120000` and `akrogon run-check --name direct-land -- bun test tests/direct-land.test.ts --timeout=120000`. Size: minutes each. Rerun triggers: `src/phase.ts`, `src/routing.ts` (phases); `src/turn.ts`, `src/phase.ts`, `src/next.ts` (land).

### Criterion 8 — broadcast gating, targeting, holds, cleanup ordering

Condition coverage:

- Gate on configuration, uniform across leaf kinds (D8): covered — four quadrants (direct/lifecycle × target/no-target); the lifecycle no-target control is the case that reds when the gate is dropped (deliberate-break obligation recorded).
- Prompt to recorded B only when idle/done (D14): covered — the working-hold case asserts nothing is sent and the holds survive; the idle case pins the exact prompt text fields.
- No allocation/no new terminal (D14): covered — terminal address set pinned before/after, no `akrogon.leaf` labels.
- Send failure recorded and retried by the settle rules (D14): covered — `delivery_error.B` presence/absence across the failure, the frozen turn (no resend), and the advanced turn (exactly one retry).
- Sweep order: temp/worktree/slice survive until the broadcast settles, owner rests in closed throughout, B never ended: covered — existence assertions across the hold, then sweep assertions after settle with B still live.
- Cross-session correctness: the probe/send go through `seat.B.session` — covered by the construction (the reviewer terminal is only addressable through its own core; a repo-session lookup finds nothing and the test reds).

In `tests/direct-land.test.ts` (same file, own cases):

- With `webhook_env` configured in the fixture repo config (and the env var set): after the direct land, `state.broadcast` is recorded non-empty. Without any `webhook_env` (separate fixture): no `broadcast` key after land. Lifecycle control in the no-target fixture: also no `broadcast` key (the gate is configuration, uniform).
- B idle: stand-in reviewer terminal reports idle; after the merged pass (`cli next`), `delivered()` to B contains the broadcast prompt text; `prompted.B` recorded.
- B working: stand-in reports working; pass sends nothing; `status --json` `broadcast_pending` true; the leaf temp, worktree and slice survive a reconcile pass (`kept` evidence or existence asserts). Then end B's turn (stand-in `fake` turn end / `advance`), run the pass: the prompt is sent now, and after the broadcast-turn settle the worktree/temp/slice are swept while the owner folder rests in `issues/closed/`.
- Send failure construction: per research-tests §6h — B's session shim unavailable or the send refused; assert `delivery_error.B` recorded, keeps hold; then B's turn advances past and the retry succeeds, error cleared.
- Red at planning: no broadcast machinery for direct at all — everything red.

Proof command: same `direct-land` invocation as criterion 7. Size: minutes. Rerun trigger: `src/next.ts`, `src/reconcile.ts`, `src/phase.ts`, `src/turn.ts`.

### Criterion 9 — direct-drop

Condition coverage:

- Runs stopped before removal (D5 ordering): covered — the cancel assertion plus systemctl stop evidence; a drop that skipped the stop leaves live units and fails the assertions.
- No stopped.yaml record (drop is not a stop): covered — explicit absence assertion.
- Refusals write nothing: covered — every refusal case asserts nothing moved/removed.
- Owner moved whole, including owner-level ISSUE.md and the leaf's logs: covered — `<chart>/direct/ISSUE.md` and `<chart>/direct/<slug>/state.yaml` assertions.
- Seats/terminals untouched: covered — terminal assertions, same wiring as criterion 3.

Test: `tests/direct-drop.test.ts`. Construction:

- Direct leaf in implement with a live run: start `run-check` detached from the worktree (`spawnCheck` pattern) or seed a live run record + fake units per research-tests §6i; assert the record/scope exists.
- `cli(f, ['direct-drop','fix-alpha','--chart',chartFolder])` → exit 0; assert: the run record is canceled, `systemctl stop` hit the leaf slice and the run scope (fixture systemctl log), the worktree path is gone, `git branch --list fix-alpha` empty, `<chart>/direct/fix-alpha/state.yaml` exists alongside `<chart>/direct/ISSUE.md` (moved with the owner), `<chart>/direct/plan.md`-style artifacts absent (never created — no assert needed), the leaf no longer appears in `status`, and `stopped.yaml` has NO record (drop is not a stop). The door/reviewer terminals untouched.
- Refusals (each non-zero, nothing moved/removed): non-direct leaf; leaf in `merge` phase; merged leaf (in closed); destination `<chart>/direct/` already existing; missing `--chart`.
- Red at planning: verb unknown.

Proof command: `akrogon run-check --name direct-drop -- bun test tests/direct-drop.test.ts --timeout=120000`. Size: minutes. Rerun trigger: `src/direct.ts`, `src/stop.ts`.

### Criterion 10 — command surface and docs honesty

No new test file. Proof: `akrogon run-check --name direct-cmdref -- bun test tests/command-reference.test.ts tests/cli-help.test.ts --timeout=120000` (existing runner on existing files, extended by U1's rows) plus the repo-wide grep proof for dead references: `! grep -rn "direct-guards" skills docs src tests --include='*' | grep -v Binary` run as a shell assertion recorded in the report (the delete must be total), and `tests/docs-links.test.ts` green covers the doc-link honesty. Size: seconds. Rerun trigger: `src/usage.ts`, `src/akrogon.ts`, docs/skill edits.

## Red evidence

Recorded at plan time on the leaf branch before any product code exists, worktree `/home/ivan/.akrogon/worktrees/akrogon/direct-leaf`, base commit `e3ec4b02`:

Command: `bun test tests/direct-create.test.ts tests/direct-drop.test.ts tests/direct-seats.test.ts tests/direct-active.test.ts tests/direct-timing.test.ts tests/direct-runs.test.ts tests/direct-phases.test.ts tests/direct-land.test.ts --timeout=120000`

Result: **41 tests, 1 pass, 40 fail** in ~4 s. The same red was then reproduced through the plan's own proof commands, each a direct `akrogon run-check` invocation from the leaf worktree at commit `a985e124` (the test commit), every one exiting 1 with the log published into the leaf folder:

- `akrogon run-check --name direct-create -- bun test tests/direct-create.test.ts --timeout=120000` → exit 1, `implementation/check-direct-create-1795625040417-770004.log` (12 fail: unknown flag `--reviewer`).
- `akrogon run-check --name direct-drop -- bun test tests/direct-drop.test.ts --timeout=120000` → exit 1, `implementation/check-direct-drop-1795625044933-775542.log` (6 fail: unknown flag `--chart`).
- `akrogon run-check --name direct-seats -- bun test tests/direct-seats.test.ts --timeout=120000` → exit 1, `implementation/check-direct-seats-1795625041140-771414.log` (3 fail: strictObject `Unrecognized key: "direct"`).
- `akrogon run-check --name direct-active -- bun test tests/direct-active.test.ts --timeout=120000` → exit 1, `implementation/check-direct-active-1795625041585-772307.log` (2 fail: schema rejection).
- `akrogon run-check --name direct-timing -- bun test tests/direct-timing.test.ts --timeout=120000` → exit 1, `implementation/check-direct-timing-1795625041822-773048.log` (3 fail: schema rejection / unsuppressed gaps).
- `akrogon run-check --name direct-runs -- bun test tests/direct-runs.test.ts --timeout=120000` → exit 1, `implementation/check-direct-runs-1795625042112-773370.log` (2 fail + the intentional passing control: schema rejection at leafTarget).
- `akrogon run-check --name direct-phases -- bun test tests/direct-phases.test.ts --timeout=120000` → exit 1, `implementation/check-direct-phases-1795625045221-776177.log` (6 fail: schema rejection).
- `akrogon run-check --name direct-land -- bun test tests/direct-land.test.ts --timeout=120000` → exit 1, `implementation/check-direct-land-1795625045597-776701.log` (6 fail: schema rejection at first `cli next`).

The full-suite red before splitting, for the record: **41 tests, 1 pass, 40 fail** in ~4 s. The single pass is `the same run from the repo root attributes no leaf` — the intentional regression control pinning existing non-direct attribution. Every other test is red for exactly the two missing-mechanism reasons:

1. **Schema rejection**: the strictObject state schema has no `direct` key, so any engine read of a direct state fails with `Unrecognized key: "direct"` / zod `unrecognized_keys: ["direct"]`. This reds every test in direct-seats, direct-active, direct-timing, direct-phases, direct-land, and direct-runs (leafTarget cannot read the leaf).
2. **Unknown verb**: `akrogon direct`/`akrogon direct-drop` do not exist, so every test in direct-create and direct-drop reds on `unknown flag --reviewer`/`--chart` parse errors. Refusal tests carry an anti-vacuous assertion (`stderr must not match /Usage|unknown flag/`) so they cannot pass on the parse error alone.

Because the schema/verb wall masks downstream behavior, the writers validated construction with throwaway shims (direct key stripped, lifecycle-adapted slots): the legal move sequence, receipt/citation plumbing, busy choreography, land drive, two-leaf landing sequence, stand-in turn arithmetic, and run-record seeding all run green against real machinery minus the direct behavior — the tests are not accidentally red for fixture reasons. The validation evidence is in `implementation/report-test-writer-{1,2,3,4}.md` in the leaf folder.

Deliberate-break demonstrations the implement pass must still perform and cite (violations that would not otherwise manifest once product code lands):

- Criterion 4 fallback exclusion: temporarily revert the `!leaf.state.direct` exclusion in `activeCount`'s fallback scan/count; `tests/direct-active.test.ts` fallback variant must turn red.
- Criterion 8 hasTargets gate: temporarily drop the gate in `commandMerged`; `tests/direct-land.test.ts` no-target cases (T1/T3) must turn red.
- Criterion 5 gap suppression: temporarily drop the direct kind filter in `visitGaps`; `tests/direct-timing.test.ts` must turn red.

## Answers to the design's `Open for the plan`

1. **Start function's name and where status and timing-report share it**: `leafStart(state, started)` lives in and is exported from `src/status.ts` (D9). Verification during synthesis showed `src/timing-report.ts` has no consumer of leaf start times at all — its visit/gap logic works from the log and timings rows — so there is nothing to share; the design's 'share' premise covers only the status consumers (TIME cells, `first_prompt`, merges `total_ms`), which all route through the one function. Timing-report's direct work is the gap suppression (D12), independent of start times.
2. **Create verb base/temp: reuse `allocate`'s prelude or call directly**: call `checkBase` and `ensureLeafTemp` directly (D3 step 4). `allocate`'s prelude is inseparable from place resolution, label-based seat discovery, capacity, the busy path and — critically — `leafTab` minting and `saveState` with a tab, every one of which a direct leaf must never do. There is no reusable middle slice; extracting one would refactor lifecycle machinery for a two-line caller, which the signpost on fewest moving parts forbids.

## Implementation constraints discovered while writing the tests (binding on implement)

- **Closed-but-broadcasting leaves in status**: at base `scanRepo`'s JSON leaf list filters to `issues/open` only, while broadcast-pending leaves already rest in `issues/closed` (the owner moves at landing). Criterion 8's `broadcast_pending: true` assertion therefore requires `scanRepo`/`leafJson` in `src/status.ts` to include closed leaves whose `broadcastPending(state)` is true. This is U5's surface, uniform for all leaf kinds (lifecycle leaves benefit identically). Text-table rows are unaffected.
- **`MoveCommittedError` in pure fixtures**: a committed move into `failed` throws post-commit when no hc session exists; tests assert stdout `moved failed` plus committed state, not exit 0. Implement must not 'fix' this — it is existing move semantics.
- **Cancelled runs**: `cancelLeafRuns` sets `cancel: true` on live records; it never writes `state: 'cancelled'`. direct-drop assertions key on `cancel: true`.
- **Fake vs real systemctl**: the fake exits 5 stopping a never-loaded unit where real systemd exits 0; tests seed leaf slices as loaded in the fake db. `stopLeafWork` must not treat a slice-stop failure as excusable beyond what `stopLeaf` already does.
- **Owner folders carry their own `ISSUE.md`** (chart shape, e.g. `issues/open/direct-visible/ISSUE.md`); the create scan must not treat owner-level plain files as leaf content, and direct-drop moves the whole owner folder including it.
- **`--chart` is passed repo-relative** (`issues/chart/<chart>`), matching the `akrogon pack` precedent; missing `--chart` must be a usage error naming `--chart`.
- **Cross-session addressing**: addresses collide across cores/sessions, so the busy probe, broadcast probe and send must always go through the recorded ref's own session — never the repo session. The tests pin this with a reviewer in a second core.
- **Send failure shape**: the broadcast send failure surfaces as an `HcError kind=unavailable` from the shim; `delivery_error.B` recording must tolerate that shape. Tests assert presence/absence of the key, not the error code.

## Notes for implement

- Workers never write tests; the test files listed in D17 already exist on the branch, red, committed at planning. A unit that finds one of its criterion tests red on fixed code returns mismatch, except the explicit test-correctness exceptions in the implement-issue skill.
- `direct-create.test.ts`'s use of the real verb means U1 makes it green; units U2–U5 must not edit it. Test files are owned per-wave as listed; cross-wave edits to a test file are forbidden except through the skill's own correction rules.
- The `deliberate break` demonstrations the brief demands for tests written at planning: at planning the whole suite is red because the mechanism does not exist (schema rejection, unknown verb), which is the honest red; where a condition's violation would NOT otherwise manifest once product code lands (the criterion-4 fallback exclusion, the criterion-8 hasTargets gate), the red evidence section records the temporary-revert demonstration the implement pass must perform and cite.

## Implementation notes

- 2026-11-25: Document the door's wait for broadcast delivery and the reviewer's turn to end before reuse or restart, including the reviewer replacement path, as required by design decision 14.

## Plan corrections (check.fix round 1, 2026-11-25)

B's initial review handed seven Fixes to A. Each correction below cites the design or brief line the
plan misread; the locked design is unchanged. Executable check for each corrected rule: the new or
corrected CLI cases in the named test files, run through `akrogon run-check` per criterion.

- **C-D3 (corrects D3, contradicting parts only)** — Design 2 requires the create validation of the
  documented draft: `ISSUE.md` at owner level (`issues/open/<owner>/ISSUE.md`, the standalone shape)
  and `brief.md`/`design.md`/`readiness.yaml` inside the leaf folder — D3 wrongly demanded ISSUE.md
  inside the leaf and omitted readiness.yaml. Design 2 also requires refusing creation when an owner
  of the same name exists under `issues/closed` or `issues/parked` and when the slug is taken by any
  open or closed leaf at any depth (nested epic leaves included) — D3's scan covered only depth two
  and checked no owner collision. Rerun scanning keeps the depth-two shape (a direct leaf is always
  its owner's direct child). Executable check: the new refusal cases in `tests/direct-create.test.ts`.
- **C-D5 (corrects D5)** — Design 3: the drop destination collision check is `<chart>/direct/<owner>`
  (the owner child), never the `direct/` parent — charting-probe captures already live in `direct/`,
  so the parent routinely exists on a normal abandon. The move runs under the owner `.lock`
  exclusive hold with the enclosing-capture refusal, the way `completeOwner` coordinates with
  capture writers, and the phase eligibility read is re-validated under the global state lock so a
  concurrent review-to-merge cannot advance past it. Executable check: the new drop cases in
  `tests/direct-drop.test.ts` with chart captures present.
- **C-D14 (corrects D14's settle reading)** — Design 13: `delivery_error.B` follows dispatchSlot's
  settlement rule exactly — one send per turn, and once B's turn advances past the refused turn the
  delivery is resettled as delivered at the original turn (`prompted.B` recorded with that turn, the
  error cleared). There is no resend: the resettle is terminal, because a late-arriving send cannot
  be told from a lost one and duplication is worse. The planned direct-land test's retry expectation
  contradicts design 13 and is corrected under it (trailer cites the design line). Executable check:
  the corrected direct-land settlement case.
- **C-D13 (corrects D13's probe reading)** — Design 13: `broadcastInProgress` releases cleanup once
  B's turn passes the prompted turn *or B is gone*. The implement read of "probe failure is
  in-progress" inverted the release for a gone reviewer; absent is release, while an hc error with a
  live socket stays in-progress (transient). Turn comparison uses `prompted.B.turn` when present.
  Executable check: the cross-session cleanup cases in `tests/direct-land.test.ts`.
- **C-new-D19 (F2)** — Design 4: `seatCommand` refuses a direct leaf before any allocation
  (`<slug> is a direct leaf: its seats are the recorded terminals, never managed`). Executable
  check: the CLI refusal case in `tests/direct-seats.test.ts` with no terminal created.
- **C-new-D20 (F5)** — Brief items 4/8: a closed broadcast-pending leaf stays visible in the plain
  `akrogon status` table while the handoff pends (the operator's normal view carries the pending
  NOTE); the JSON `group` of a closed leaf is computed against its own area, never parent-navigation
  segments. Executable check: the post-landing status assertions.
- **C-new-D21 (F6)** — Criterion 5/design 6: the timing-report cohort counts a direct leaf's start
  at creation, so direct visits are cohort members exactly as lifecycle visits are. Executable
  check: a direct visit present in the cohort output without prompt/seat_done gaps.
- **C-new-D22 (F8)** — Design 2/13: the rerun's read-modify-write serializes under the global state
  lock (`<home>/.lock`, the same lock phase moves and dispatch take), re-resolving the leaf and
  re-reading the state inside it so only the two seat refs change against current content.
  Executable check: the concurrent-write regression case.


## Plan correction (check.fix round 2, 2026-11-25)

- **C-D13a (F9)** — Criterion 8 and design decisions 13–14 distinguish an undelivered broadcast from an acknowledged turn. Keep worktree, temp and slice while the broadcast is pending, without probing B for cleanup. After acknowledgement, keep the existing recorded-turn and absent-reviewer release rules. A missing B before acknowledgement must leave the attempt ready for `akrogon direct --reviewer` and `akrogon next`. Executable check: the replacement-reviewer case in `tests/direct-land.test.ts`, including hold through the replacement's broadcast and release at its end.
