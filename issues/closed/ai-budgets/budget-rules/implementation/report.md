# Implementation report: budget-rules

Base `d8957dad` (AKROGON_BASE, = origin/main at implement). Committed head `c46ca96c`.
Branch `budget-rules`: `5e749414` tests → `c8fa95d2` u1 → `aae1884b` u2 → `aa2d75aa` u3 →
`75068275` u5 → `f3181752` u4 → `c46ca96c` guard-order fix.

## Changed files and reasons

- `skills/lifecycle-rules.md` — `## Grant reuse and count lines` renamed `## Grant reuse and
  paid sessions`; count-line/warn-past-bound/unknown-prior-use sentences removed; added the
  standing scope, `--sessions <n>` reservation with n+reason in the record file, the kept
  red-launch paragraph, the ceiling `failed` stop, and the moved fresh-call trigger with the
  floor (criterion 1; u1).
- `skills/chart-issues/{SKILL.md,lifecycle-rules.md(new symlink),assets/{standing-design,
  shapes,autopilot}.md}` — door reads the shared rules (fifth link, record file = fork's
  `## Charting proofs`, stop = Needs wait); needs sheet drops paid-launch grants; Take probes
  reserve with `--sessions` under `paid_budget`; `by: standing` grant entries are door-written;
  standing-design keeps replay and points the fresh-call trigger at lifecycle-rules; shapes
  example gains a second (standing) grant entry; autopilot waits on the `paid_budget` row
  (criteria 2-3; u2).
- `skills/{check-issue,implement-issue,plan-issue}/SKILL.md`, `skills/AREA.md`,
  `skills/watch-issues/consultant-brief.md`, `skills/mine-issues/SKILL.md` — all references
  renamed; check-issue audit reads `budget.jsonl` rows against recorded n; recorded-output
  citations split replay (standing-design) vs trigger (lifecycle-rules); implement-issue worker
  sentence is now a reservation sentence; `check.review`/`check.repair` operator-only and
  Shared-context lines updated (criterion 2; u3).
- `docs/reference/{limits,checks,files}.md`, `docs/use/{autopilot,plan-work}.md` — operator
  supplies `paid_budget` once; `--sessions` exports `AKROGON_SESSIONS`/`MINUTES`;
  `budget.jsonl`/`budget.lock` rows; needs-sheet prose drops per-launch approvals
  (criterion 2; u4). `docs/use/{watch-while-away,quick-fix}.md` verified — no changed-rule
  text, no edit.
- `tests/e2e/tier.ts` (+4 e2e files) — `reservedSessions(planned)` guard inside paid test
  bodies: kinds 8, watch-stop 4, watch-consults 2, watch-live root 2 / shell 1; watch-consults
  takes its deadline from `AKROGON_SESSION_MINUTES` and prints the taken deadline; free cells
  (`watch-preflight`, `standin`, `window`, `notices`) untouched and unreachable by the guard
  (criterion 4; u5 + order fix `c46ca96c`).
- `tests/{docs-links,chart-shapes}.test.ts` — planned cases committed at plan.synthesis
  (`5e749414`, each `Test-Change:` trailer).

## Commands run and results

Criterion 3 proof (the `test` check): final green inside `akrogon verify` below.
Criterion 4 proof — free invocations, all under `akrogon run-check` in the leaf worktree
(`/home/ivan/.akrogon/worktrees/akrogon/budget-rules`), run on head `c46ca96c` unless noted;
`L` below is `<leaf>/implementation`, logs in `implementation/` as `check-<name>-*.log`:

```sh
L=/home/ivan/Work/infra/akrogon/issues/open/ai-budgets/budget-rules/implementation
```

Refusals (each exit 1, refusal line printed, no tier/harness launch in the log):
- `check c4-kinds-unset: 1` — `refusing paid cell: plans 8 sessions, AKROGON_SESSIONS=unset`
  `akrogon run-check --name c4-kinds-unset -- env AKROGON_E2E=kinds AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4-XXXXXX) AKROGON_E2E_OUT=$L/c4-kinds bun test ./tests/e2e/kinds.e2e.ts`
- `check c4-kinds-small: 1` — `… plans 8 sessions, AKROGON_SESSIONS=7`: same argv with
  `AKROGON_SESSIONS=7` prefixed and `--name c4-kinds-small`
- `check c4-wstop-codex-unset: 1`, `check c4-wstop-agy-unset: 1` — `… plans 4 sessions, unset`:
  `akrogon run-check --name c4-wstop-<kind>-unset -- env AKROGON_E2E=watch-stop AKROGON_E2E_KIND=<codex|agy> AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4-XXXXXX) AKROGON_E2E_OUT=$L/c4-wstop bun test ./tests/e2e/watch-stop.e2e.ts`
- `check c4-wstop-small: 1` — `… plans 4 sessions, AKROGON_SESSIONS=3`: same argv, kind `codex`,
  `AKROGON_SESSIONS=3` prefixed, `--name c4-wstop-small`
- `check c4-wconsults-unset: 1`, `check c4-wconsults-small: 1` — `… plans 2 sessions, unset` /
  `AKROGON_SESSIONS=1 AKROGON_SESSION_MINUTES=15`:
  `akrogon run-check --name c4-wconsults-<case> -- env [<var>=<v> ...] AKROGON_E2E=watch-consults AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4-XXXXXX) AKROGON_E2E_OUT=$L/c4-wconsults WATCH_TICK_SECONDS=15 bun test ./tests/e2e/watch-consults.e2e.ts`
- `check c4-wconsults-nominutes: 1` — ZodError on `AKROGON_SESSION_MINUTES` before any launch
  (deadline-source requirement proven by the parse + `session deadline:` report line): same
  argv with `AKROGON_SESSIONS=2` and no `AKROGON_SESSION_MINUTES`
- `check c4-wlive-{claude,codex,pi,agy}-{root,shell}: 1` — `… plans 2` (root) / `plans 1`
  (shell) `sessions, unset`: one loop
  `for k in claude codex pi agy; do for s in root shell; do akrogon run-check --name c4-wlive-$k-$s -- env AKROGON_E2E=watch-live AKROGON_E2E_KIND=$k AKROGON_E2E_SHAPE=$s AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4-XXXXXX) AKROGON_E2E_OUT=$L/c4-wlive-$k-$s WATCH_TICK_SECONDS=30 bun test --timeout=30000 ./tests/e2e/watch-live.e2e.ts --test-name-pattern 'real harness'; done; done`
- `check c4-wlive-pi-root-small: 1` — `… plans 2, AKROGON_SESSIONS=1`: same argv, kind `pi`,
  shape `root`, `AKROGON_SESSIONS=1` prefixed, `--name c4-wlive-pi-root-small`

Free cells (start without `AKROGON_SESSIONS`):
- `check c4-wlive-preflight-claude: 0` — harness launch, no prompt, green:
  `akrogon run-check --name c4-wlive-preflight-claude -- env AKROGON_E2E=watch-preflight AKROGON_E2E_KIND=claude AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4f-XXXXXX) AKROGON_E2E_OUT=$L/c4-preflight WATCH_TICK_SECONDS=30 bun test --timeout=30000 ./tests/e2e/watch-live.e2e.ts --test-name-pattern 'preflight'`
- `check c4-window: 0` — green (22.16 s):
  `akrogon run-check --name c4-window -- env AKROGON_E2E=window AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4f-XXXXXX) AKROGON_E2E_OUT=$L/c4-window bun test ./tests/e2e/window.e2e.ts`
- `check c4-notices: 0` — green (6.55 s):
  `akrogon run-check --name c4-notices -- env AKROGON_E2E=notices AKROGON_E2E_HANDLER=$HOME/.config/herdr-app/mods/session-status/notices.js AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4f-XXXXXX) AKROGON_E2E_OUT=$L/c4-notices bun test --timeout=600000 ./tests/e2e/notices.e2e.ts`
- `check c4-wlive-standin-root: 1` and retry `check c4-wlive-standin-root-r2: 1` — the cell
  starts and runs ~140 s (proves "starts without it") then fails on the `due=3` tick gap:
  `akrogon run-check --name c4-wlive-standin-root[-r2] -- env AKROGON_E2E=watch-live AKROGON_E2E_KIND=standin AKROGON_E2E_SHAPE=root AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4f-XXXXXX) AKROGON_E2E_OUT=$L/c4-standin WATCH_TICK_SECONDS=10 bun test --timeout=30000 ./tests/e2e/watch-live.e2e.ts --test-name-pattern 'standin'`.
  Red-with-no-cause judgment below.
- Base comparison run (head `d8957dad`, detached worktree `/var/tmp/akr-c4-base`, removed after):
  `akrogon run-check --holder $L --name c4-standin-base -- env AKROGON_E2E=watch-live AKROGON_E2E_KIND=standin AKROGON_E2E_SHAPE=root AKROGON_E2E_ROOT=$(mktemp -d /var/tmp/akr-c4f-XXXXXX) AKROGON_E2E_OUT=/tmp/c4-standin-base WATCH_TICK_SECONDS=10 bun test --timeout=30000 ./tests/e2e/watch-live.e2e.ts --test-name-pattern 'standin'`
  — same argv as the head standin runs except `--name`, `--holder` and `AKROGON_E2E_OUT`, so
  the failure attribution compares equivalent runners.

2026-11-22 re-check record (slot B repair pass, source before `eb9817eb` commit): B's
`check-repair-c4-*` logs rerun the same matrix on the repaired e2e files using
`bun --no-env-file test` under `run-check --name repair-c4-<case>` with `AKROGON_E2E_ROOT`
under the run's `TMPDIR`; 17 exits of 1 including the missing-minutes case — see
review-B.md `## 2026-11-22 check.repair` `Targeted verification`.

Whole-suite receipt: `verify leaf c46ca96c49cbaf5cecbd10cb164adc900e59e3d5: green`
(1335 pass; format 0, typecheck 0, test 0 —
`check-test-1795369826060-2185505.log`).

## Red-check judgment (record file)

- `c4-wlive-standin-root`: red with no cause in the leaf diff (`git diff $AKROGON_BASE...HEAD`
  touches only the paid third test + `tier.ts` helper in `tests/e2e/watch-live.e2e.ts`; the
  failure is inside the standin second test's `sentTurn` helper, untouched). One same-command
  retry (`-r2`) red the same way → own completed base run at `d8957dad` in a detached worktree
  (`check c4-standin-base: 1`) fails the identical wait (`due=3` never sent after the `due=2`
  hold). Judgment: same failure on base; filed through seed-issue's Lifecycle filing as
  https://github.com/Tamdoma/akrogon/issues/150.
- `akrogon verify` ran three times before the green receipt: run 1 (14 timeout fails) and run 2
  (338 fails) were degraded by a second overlapping verify I had started and by another repo's
  concurrent suite (host load ~76); run 3 still red with 17 timeouts at load ~50; after load
  dropped below ~20 the clean run went 1335-green. All are real test titles, no leaf cause —
  consistent with the 2026-11-08 hc-leak lesson's timeout signature; not filed (recovered
  green, `inconsistent` class). `verify --known-red` judged `fail` on the degraded head log,
  which the subsequent clean green supersedes.

## Known limitations

- `paid_budget` is absent from `~/.akrogon/config.yaml` on this host (operator adds it once
  session-ceiling is installed, per design 5'). No proof needed it: criterion-4 invocations
  inject `AKROGON_SESSIONS` via `env` inside the checked command; `constructedEnv` never
  copies it from the caller.
- The watch-consults deadline's *value* is unproven (observing it tick needs a paid session);
  proven: the deadline is sourced from `AKROGON_SESSION_MINUTES` (unset refuses before launch;
  taken value is printed). Recorded in plan.md.
- The standin cell remains red on base (issue #150); criterion 4's "starts without it" is
  proven by the cell running ~140 s before the unrelated tick failure.
- A worker used a transient `git stash`/`git stash pop` to verify prettier warnings pre-date
  its edits (standing rule violation); stash list verified empty afterward, no state lost.

## Unverified criteria

None. Criteria 1-2 are reviewing-seat readings by design (recorded as the plan's model-choice
reading under `## Implementation notes`); criterion 3 is green under `test`; criterion 4's
matrix is above.

## Worker returns (folded)

- u1 `ae9dc4d2` → lane `c8fa95d2`: section rewrite; `seat texts` red as planned.
- u2 `1defdbb3` → lane `aae1884b`: door surfaces + symlink; u2-links/u2-shapes/u2-format green.
- u3 `ddabc41c` → lane `aa2d75aa`: seat skills; `seat texts` still red (planned); u3-format red
  on pre-existing prettier issues in files it did not touch (watch-issues scripts,
  mine-issues lines) — outside the configured format scope (`src tests
  skills/chart-issues/scripts`), which is green.
- u5 `bc1ce68f` → lane `75068275`: guard + deadline; refusal shown; typecheck/format green.
- u4 `97c4b569` → lane `f3181752`: docs pages; u4-links green; u4-format red on pre-existing
  docs warnings (`commands.md`, `config.md`, `files.md` — same on creation commit; files.md's
  new table is prettier-clean; `docs/` is outside the configured format scope).
- A's repair `c46ca96c`: `reservedSessions(2)` moved before the minutes parse in
  watch-consults so an unset `AKROGON_SESSIONS` hits the named refusal first.

## 2026-11-22 check.fix

Reviewed head `c46ca96c`; slot B repaired F1–F6 through `eb9817eb` (see review-B.md). Handed
to A and completed:

- **F3 remaining** `61aec1dc`: design 4′ leaves `approved.date` undefined while
  `paid_budget` is absent yet forbids handoff waiting on the key. The standing entry now
  writes `date: "pending"` while the key is absent (truthful state; no approval date
  invented) in `skills/chart-issues/SKILL.md` and `assets/shapes.md`; plan.md
  `## Implementation notes` records the resolution.
- **F7**: the criterion-4 section above now carries the full run record — exact
  `run-check` argv per cell (env, `--test-name-pattern`, `--timeout`, `--name`), the
  shared head `c46ca96c`, and the base comparison run on `d8957dad` in
  `/var/tmp/akr-c4-base` with the equivalent argv called out; B's post-repair
  `check-repair-c4-*` rerun is cross-referenced.

Refresh: prior base `d8957dad` (head `eb9817eb` + `61aec1dc`) → rebased onto current
`origin/main`; new base and head recorded below after the rebase.

### Refresh result

Prior reviewed base `d8957dad`, prior reviewed head `c46ca96c`; B's repair head `eb9817eb`.
check.fix pass refreshed the branch: handed-off base `9c6ae0db739efcde19edff0d1b173da0ab7b234d`
(= new AKROGON_BASE), handed-off head `f08d7e9c` (A's `61aec1dc` replayed; rebase applied all
18 commits with no conflicts).

### check.fix verification

- `verify leaf f08d7e9c: green` (1350 pass, `check-test-1795372456484-1510778.log`).
- Two earlier verify attempts on this head were load/flake reds: 11 × 15 s timeouts in
  `next.test.ts` hc-fixture tests (`check-test-1795371443293-4020516.log`) and 1 agy
  door-reset flake (`check-test-1795371881299-607506.log`). Each narrow rerun passed:
  `check fix-narrow-next: 0`, `check fix-narrow-next2: 0`, `check fix-narrow-reset: 0`
  (logs beside this file). No leaf cause — the diff is prose plus e2e guards, none of
  which these tests reach. Final green receipt stands.
