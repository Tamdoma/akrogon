# Plan: observe-paused

Slot A, plan.synthesis. Base `4325f9ce`. The brief and design agree. Acceptance is criteria
C1–C7 below. The discarded product prototypes only exercised the tests. The branch's first
commit, `48f8feda`, is tests and fixtures only. No paid cell ran in planning.

## Read first

- `docs/reference-index.md` → `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`,
  `docs/reference/checks.md`. Read the leaf's `brief.md`, `design.md` and `readiness.yaml`.
- `skills/watch-issues/scripts/observe.ts` and `scripts/repo.ts`: single invocation,
  existing stdout format, and `OBSERVE_AKROGON` seam. `src/hc.ts`: `repoSpace` discovery.
  `src/pause.ts`: `isPaused`, `PauseStateError`. `src/config.ts`: `globalHome`.
- `skills/watch-issues/SKILL.md`: Invocations, Observe, Judge and Consult. `src/next.ts`
  and `tests/pause-next.test.ts`: explicit next ignores pause and unpause can dispatch.
- `tests/hc-observe.test.ts`, `tests/hc-fixture.ts` and `tests/hc-shim.sh`: observe cases
  and discovery log. `tests/watch-timer.test.ts` and `tests/fixtures/watch-{hook,agent}.sh`:
  real hc timer, stand-in task logs and observe marker.
- `tests/e2e/watch-live.e2e.ts`, `tests/e2e/watch-tier.ts`, `src/transcript.ts`:
  tier, turn attribution, and Pi transcript lookup. `tests/e2e/watch-consults-body.ts`
  is the precedent for passing `AKROGON_HOME` to Pi.
- `learnings/LESSONS.md`: keep output outside run-check's deleted TMPDIR
  (2026-11-15/20), run paid checks in the foreground (2026-11-15), and use the
  parent runner's verdict (2026-11-18).

## Decisions

- **D1:** Resolve the repo and space. Call `isPaused(repoKey)` before any stdout. Print
  `session=<name>` then exactly `paused=true` or `paused=false`. Return immediately
  when paused, before `repoInventory`, `leafSeats` or `transcriptFor`. Keep row formats
  and order unchanged. Let the existing script boundary report a pause read error on
  stderr and exit 1. Do not turn an error into unpaused.
- **D2:** Make observe the only read for the start check, accepted due, and every
  re-observation in Judge and Consult. Act only on exit 0 and exact line 2
  `paused=false`. Report paused on exit 0 and `paused=true`. Otherwise report the
  error. In both stopping cases, do not act on any leaf or reuse earlier rows.
  Preserve the existing no-further-mutation rule after a command error. A pause
  after a snapshot takes effect at the next read.
- **D3:** The stand-in hook mirrors D2. It calls `next --all` only when there is also
  a `slug=` row. Tick acceptance and receipt stay before observe. The initial scripted
  start delegates the check to the same hook instead of duplicating logic.
- **D4:** Both recorders use the dedicated executable selected by `OBSERVE_AKROGON`.
  It marks `call observe t=<turn>` and consumes `hold-observe` instead of `hold-status`.
  Tick's `config` uses the non-observe executable, so it cannot add a check marker or
  consume a check hold. The timer fixture separately tags its bootstrap read
  `call observe start` because that read and the first due can share turn 0. The e2e
  recorder preserves flag removal before sleep and the TERM span record.
- **D5:** D4 resolves the marker question. The no-prompt Pi preflight did not prove
  environment propagation to model tools. If live calls omit the marker, examine the
  call log and transcript before any retry. If Pi stripped the override, use the
  locked-means rule to record the failure and a replacement proved in the free tier
  (for example, classify the observe script's parent command in the recorder). Do
  not count tick's config as an observe. If that correction needs a test-file edit
  not authorized in implementation, stop with the evidence and the exact re-plan
  needed. Do not silently change a frozen test or buy another identical run.
- **D6:** Resolve the paused-leaf question by doing the fresh-leaf proof first.
  After an empty due, stage `watch-staged-leaf`. Require its own next accepted
  turn to make the `next` call and record a seat. Then pause and stage a new
  unseated, unblocked `watch-paused-leaf` while already paused, so no earlier turn
  can consume it. Require no `next` and no state change at the paused due. Never
  unpause inside the paid shell cell. Unpause could dispatch without the watcher.
- **D7:** Pass `AKROGON_HOME` from the fixture/tier in both watcher launch paths.
  `observeReady` requires exact `paused=false` in the throwaway repo before launch.
  The Pi shell launch names its session ID so `transcriptFor` can resolve it
  while Pi is still live. Keep the transcript and due-to-turn mapping in tier output.
- **D8:** Update the watch docs to explain the single read and stop rules.
  No change to the manual `status` or `next` commands, other watch behavior,
  consultant leaf-row format, or human pause/unpause behavior.
- **D9:** No credential variable is required (`env_names` empty, no `Missing:`).
  For C6 reuse readiness `grants[0]`: logged-in Pi account, `akr-e2e-watch`
  only, one foreground `watch-live-pi-shell` operation with tier cleanup.
- **D10:** Free proofs first, then the paid shell cell. Start with 2 sessions
  (1 planned plus spare) and 10 minutes (over twice the longest same-name
  green, 233341 ms in `issues/timings.jsonl`). Record grant, budget, session
  IDs, exit/log, transcript and cleanup result in `implementation/report.md`.
- **D11:** Serial-solo A, no workers. The two units depend on the output contract
  and use the same proofs. Tests and fixtures are planner-owned and frozen at
  handoff. Do not add unrelated test or harness work in implementation.

## Waves and file checklist

### Wave 1 / U1: observe output

- Owns `skills/watch-issues/scripts/observe.ts`. Apply D1, C1–C3. No dependency.
- Proof resource: real hc core with the isolated `hcCore` fixture. Run the C1–C3 suite.

### Wave 2 / U2: consume the contract

- Depends on U1. Change `skills/watch-issues/SKILL.md` for C4: start, Observe,
  Judge (merged-leaf and command-error re-observations) and Consult (trigger
  and resume references). Reuse the same guard, preserve Never.
- Change `docs/use/watch-while-away.md` for C7: What each check does and image alt text.
- Change `docs/pictures/watch-loop.svg` for C7: replace the read-status node.
- Change `skills/AREA.md` for C7: observe line explains pause state before inventory.
- No edit to `tests/AREA.md`, `docs/reference/skills.md` or
  `skills/watch-issues/consultant-brief.md`. None states a status step or changes a row.
- Proof resources: isolated real hc timer fixtures, and one cell at a time in
  the named tier (session lock). Only the paid shell proof needs the Pi account.

### Planner-owned files

`tests/hc-observe.test.ts` (C1–C3), `tests/watch-timer.test.ts` and
`tests/fixtures/watch-{hook,agent}.sh` (C4/C5/C7), `tests/e2e/watch-live.e2e.ts` and
`tests/e2e/watch-tier.ts` (C5/C6). Remove status-based markers and old start framing
expectations because their prior behavior conflicts with C1, C4 and C5.

## Verification and red receipts

Receipt paths below are relative to the leaf. Read them with `akrogon log <path>`.
The base is unchanged product code. Separate temporary breaks were discarded.

### C1: unpaused framing and unchanged rows

Run `akrogon run-check --name hc-observe -- bun test --timeout=120000 tests/hc-observe.test.ts`.
Seconds. Rerun on observe, pause, discovery or fixture changes. Compare stdout at the
script boundary with exact headers and the existing leaf/error rows. Empty inventory
and missing `issues/open` both contain just the two lines. Old watchers can still
parse line 1 and rows; they still run their old status step until restarted.

Base red: `implementation/check-hc-observe-red-1795641902510-1729373.log`
(exit 1). Full and empty outputs were missing `paused=false`. Temporary D1 dry run:
`implementation/check-hc-observe-dry-run-1795642105233-1937183.log` (exit 0, all 5 cases).

### C2: paused no-read path and fresh unpause

Same command and rerun trigger. The case `observe skips inventory and seat reads
while paused, then restores the rows after unpause` reads an empty board, adds a
working seat, an unseated leaf and an unreadable entry, pauses through the CLI and
requires exact paused headers, exit 0 and the same shim log as the empty run. The
unpause case moves the unreadable entry aside for the CLI sweep, restores it, and
expects the original rows and `paused=false`. Freshness follows from a read inside
each invocation. No lifecycle command or unpaused snapshot is reused.

Base red: same C1 receipt. Deliberate break D1: keep headers but remove the
paused return, `implementation/check-hc-observe-break-paused-reads-1795642377752-2330272.log`
(exit 1, extra connect and seat get). The shim cannot show filesystem-only reads.
Review the paused branch ordering before `repoInventory`, not just before row printing.

### C3: invalid pause reads

Same command and rerun trigger. Two independent cases write invalid YAML and
a valid YAML key with value `false`. Each asserts nonzero, stdout exactly empty,
and stderr containing that fixture pause path. Base red: both returned 0 in C1's
receipt. Deliberate break D1: print session before reading pause,
`implementation/check-hc-observe-break-partial-stdout-1795642491248-2618717.log`
(exit 1, both errors printed partial stdout).

### C4: start and all re-observations use one fail-closed gate

Run `akrogon run-check --name watch-timer -- bun test --timeout=120000 tests/watch-timer.test.ts`.
Minutes. Rerun on skill, watch scripts, tests or fixture changes. The literal skill
assertion forbids the removed command and requires observe and pause to be named.
Review D2 at every call site: neither a prior valid snapshot nor exit 0 alone
authorizes action. The Judge re-read does not resume mutations after an error.
Consult uses the latest output before resuming. C5 validates mechanical gating,
C6 validates the real watcher. Do not put prose-matching expectations on model output.

Base red: `implementation/check-watch-timer-red-1795642057831-1860599.log` (exit 1,
skill still contains the status command, including the start and first check steps).

### C5: scripted watcher receipt, pause, failure and fresh inventory

Same timer command and rerun trigger as C4, plus the two free tier shapes below.
The start and busy-due cases count reads using the marker, distinct from tick config.
The fresh-due test traverses an empty receipt/check, stages a leaf and requires
`next --all` on the next accepted turn. It then pauses with a fresh leaf and
corrupts the fixture's pause file for the next turn. Each receipt precedes its
observe, each turn has one marker and neither paused nor failed turn calls next.
The paused leaf's state stays unchanged. The fixture is not testing successful seat
delivery here. The shell tier also checks an actual dispatch record.

D3 trace: the branch consumes the current command's exit and line 2 before scanning
for rows. Missing/different line 2 cannot reach next because the equality check
precedes row inspection (base shows exit 0 with missing line 2 classified as failed).
D4 trace: tick and observe use separate markers, and the check line and recorder
count share a turn. D7 trace: a wrong home either cannot discover the fixture repo
or fails the fresh/paused/error sequence using the fixture's file.

Base red: C4 receipt shows the accepted empty due reported failed with missing line 2,
and the start's waiting leaf never got a next call. Temporary D1 dry run:
`implementation/check-watch-timer-dry-run-1795642391361-2332084.log` (exit 0 for
the three targeted timer cases). All 22 timer cases also passed with a temporary
D1 prototype and doc markers: `implementation/check-watch-timer-suite-dry-run-1795642662203-2969405.log`.
The prototype was discarded. Deliberate D3 breaks, each exit 1:

- Ignore fresh rows: `implementation/check-watch-timer-break-fresh-read-1795642498787-2621558.log`
  (staged turn reported empty).
- Act on paused: `implementation/check-watch-timer-break-paused-gate-1795642509273-2650139.log`
  (unexpected `next --all` at paused turn).
- Act on failed: `implementation/check-watch-timer-break-failed-gate-1795642523065-2688310.log`
  (unexpected `next --all` after nonzero observe).

### C6: one real Pi watcher

The shell-shape test `watch live cell: a real harness in the tier` in
`tests/e2e/watch-live.e2e.ts` uses the normal start and tick prompts, the changed
SKILL.md and observe output. It requires one observe at each due through the
paused due, no status, and watcher-turn attribution plus a seat for the leaf
staged after empty. It checks the paused leaf's eligibility before the due and
unchanged state/no next afterwards. D6 prevents both early dispatch and attribution
to unpause. Timer and watcher logs are keyed by hc turn.

Read `pi-paused-turn.json` and `pi-watch-transcript.jsonl` alongside the timer
screen and call log in the tier output. The reviewer verifies that the paused
turn's tool output shows exit 0 and `paused=true`, and that Pi reported paused.
The script checks the record is present, not model wording. Recordings replace
another call for review only when they cover the current skill, commands, output,
prompt and fixture sequence. The mechanical consumer is the e2e turn/call and
state assertions, exercised freely by the shell stand-in. The reviewer consumes
the Pi transcript for the model decision. This does not prove other prompts or
harnesses.

Run from the worktree root. Set `leaf` to the authoritative absolute leaf folder. Use distinct evidence folders per rerun.

```sh
# Run once per shape (shell and root) before the paid cell.
shape=shell
root=$(mktemp -d /var/tmp/wo.XXXXXX)
akrogon run-check --name "watch-live-standin-$shape" -- env \
  AKROGON_E2E_ROOT="$root" AKROGON_E2E_OUT="$leaf/implementation/e2e-standin-$shape" \
  AKROGON_E2E=watch-live AKROGON_E2E_KIND=standin AKROGON_E2E_SHAPE="$shape" \
  WATCH_TICK_SECONDS=10 bun test --timeout=120000 ./tests/e2e/watch-live.e2e.ts \
  --test-name-pattern standin

# Paid under readiness grants[0]. Run in the foreground.
root=$(mktemp -d /var/tmp/wo.XXXXXX)
akrogon run-check --name watch-live-pi-shell -- env \
  AKROGON_SESSIONS=2 AKROGON_SESSION_MINUTES=10 \
  AKROGON_E2E_ROOT="$root" AKROGON_E2E_OUT="$leaf/implementation/e2e-pi-shell" \
  AKROGON_E2E=watch-live AKROGON_E2E_KIND=pi AKROGON_E2E_SHAPE=shell \
  WATCH_TICK_SECONDS=30 bun test --timeout=120000 ./tests/e2e/watch-live.e2e.ts \
  --test-name-pattern "real harness"
```

Sizes: stand-ins about 1–2 minutes, paid about 4–6 minutes. Restart boundary:
one isolated tier run, not an in-place resume. After a paid red, establish a
passing free cause reproduction or name the new observation of a live-only
diagnostic before another paid run. Follow lifecycle budget-stop and fresh-run
rules. If no final check receipt prints, recover the grant-scoped resources and
record absence before rerunning. Inspect `absence.json` on completion.

Free tier base red: `implementation/check-watch-live-standin-red-1795641981123-1815691.log`
(exit 1, `observeReady` saw only the session line). Temporary D1 dry runs:
`implementation/check-watch-live-standin-shell-dry-run-1795642341347-2052251.log`
and `implementation/check-watch-live-standin-root-dry-run-1795642463095-2348161.log`
(both exit 0). The paid proof itself is pending implementation.

### C7: human docs and area index

Same timer command as C4. Rerun on the three docs or the doc assertions changing.
Each test checks its own affected section for observe and pause, without the old
status read. The reviewer checks that steps and diagram describe the same one read.
Base red: C4 receipt. The guide and SVG name the old status read and the AREA
line omits the pause bit.

## Implementation transition

The final test tree typechecked:
`implementation/check-plan-typecheck-1795642625958-2943998.log` (exit 0).
Both fixture scripts passed shell syntax checks.

Re-run criteria on the committed implementation, then the configured `akrogon verify`
receipt for review. Do not run merge checks or any other paid cell. Use review to
confirm backwards row compatibility, no pre-return inventory scan, and the Pi report.

## Implementation notes

2026-11-25, D2/D6: the live transcript's pause report is a model choice, reviewed
for substance. Exit status, line 2, turn attribution and absence of leaf actions
are literal or mechanical contract checks, not wording checks.
