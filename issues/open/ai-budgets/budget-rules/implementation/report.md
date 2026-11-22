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
Criterion 4 proof — free invocations, all under `akrogon run-check`, logs in
`implementation/`:

Refusals (each exit 1, refusal line printed, no tier/harness launch in the log):
- `check c4-kinds-unset: 1` — `refusing paid cell: plans 8 sessions, AKROGON_SESSIONS=unset`
- `check c4-kinds-small: 1` — `… plans 8 sessions, AKROGON_SESSIONS=7`
- `check c4-wstop-codex-unset: 1`, `check c4-wstop-agy-unset: 1` — `… plans 4 sessions, unset`
- `check c4-wstop-small: 1` — `… plans 4 sessions, AKROGON_SESSIONS=3`
- `check c4-wconsults-unset: 1`, `check c4-wconsults-small: 1` — `… plans 2 sessions, unset` /
  `=1`
- `check c4-wconsults-nominutes: 1` — ZodError on `AKROGON_SESSION_MINUTES` before any launch
  (deadline-source requirement proven by the parse + `session deadline:` report line)
- `check c4-wlive-{claude,codex,pi,agy}-{root,shell}: 1` — `… plans 2` (root) / `plans 1`
  (shell) `sessions, unset`; `check c4-wlive-pi-root-small: 1` — `… plans 2, =1`

Free cells (start without `AKROGON_SESSIONS`):
- `check c4-wlive-preflight-claude: 0` — harness launch, no prompt, green.
- `check c4-window: 0` — green (22.16 s).
- `check c4-notices: 0` — green (6.55 s).
- `check c4-wlive-standin-root: 1` and retry `check c4-wlive-standin-root-r2: 1` — the cell
  starts and runs ~140 s (proves "starts without it") then fails on the `due=3` tick gap.
  Red-with-no-cause judgment below.

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
