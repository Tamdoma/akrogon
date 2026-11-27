# Implementation Report: charting-fixes

## Commits and branch state

- `AKROGON_BASE`: `8025b594104c6dbc1d83dc35060c50887b8e6d06` (`origin/main`)
- Committed `HEAD`: `9a7402bf4464d812163e3dd4e1b4dcfd312c867a`
- Branch refresh: ran `git fetch origin && git rebase origin/main` before Wave 1 and after Wave 1 landed; `origin/main` did not move (`prior_base=8025b594104c6dbc1d83dc35060c50887b8e6d06`, `new_base=8025b594104c6dbc1d83dc35060c50887b8e6d06`, `prior_head=9a7402bf4464d812163e3dd4e1b4dcfd312c867a`, `new_head=9a7402bf4464d812163e3dd4e1b4dcfd312c867a`).
- Commit chain on `charting-fixes`:
  1. `86eae17b77ffb6239d8827cb6ad9d502514f0bbd` — `test: em-dash guard for README, docs markdown and SVG pictures, red on base` (planning commit)
  2. `7c315f74` (cherry-picked from u1 `263a98bddfccde0ab684e83be9f60bcfb1641900`) — `docs: remove em dashes and expand consultant examples in charting guide`
  3. `cacff1ca` (cherry-picked from u2 `abe6607bd887d0c199ce87cccdb76d87698e94d6`) — `Remove em dashes from reference docs`
  4. `9a7402bf4464d812163e3dd4e1b4dcfd312c867a` (cherry-picked from u3 `b5fb112e388f913d8b04d105b1feaa3c2ae92250`) — `Remove em dashes from start and use docs`
- Worker worktrees (`charting-fixes-u1`, `charting-fixes-u2`, `charting-fixes-u3`): all removed via `git worktree remove`.

## Changed files and reasons

### Test file (planning commit `86eae17b`)
- `tests/docs-em-dash.test.ts` — disk-reading em-dash guard scanning `README.md`, `docs/**/*.md` recursively, and `docs/pictures/**/*.svg` recursively for U+2014 and `&mdash;`/`&#8212;`/`&#x2014;`, plus isolated temp-tree negative/freshness/line-terminator cases (Criteria 1 & 3).

### Unit u1 — Charting guide and docs home (`7c315f74`)
- `docs/README.md` — rewrote lines 21–22 naturally to remove 2 em dashes (Criterion 1).
- `docs/guide/04-a-charting-session.md` — expanded the opening consultant example on line 22 to name slots B and C with harness, model, and effort (Criterion 2); added the slots sentence directly below the opening code block leaving line 35 intact (Criterion 2); rewrote lines 25, 43, 44, 64, 78, 83, and 88 naturally to remove 9 em dashes (Criterion 1).
- `docs/guide/05-signposts.md` — rewrote lines 9, 17, 35, 54, 91, and 107 naturally to remove 7 em dashes (Criterion 1).
- `docs/guide/06-charting-mode.md` — expanded all 3 consultant-starting examples on lines 35, 54, and 75 including singular `Use consultant B.` (Criterion 2); rewrote lines 7, 16, 17, 19, 28, 42, 63, 75, 82, 84, and 97 naturally to remove 13 em dashes (Criterion 1).
- `docs/guide/07-build-route.md` — rewrote lines 15, 24, 33, 49, 59, and 75 naturally to remove 7 em dashes (Criterion 1).
- `docs/guide/08-hand-off.md` — rewrote lines 10, 41, and the `##` heading on line 47 naturally to remove 4 em dashes (Criterion 1).

### Unit u2 — Reference docs (`cacff1ca`)
- `docs/reference/checks.md` — rewrote lines 52, 63, 69, 85, 95, and 147 naturally to remove 11 em dashes while preserving `(script)` and math `−`/`×` (Criterion 1).
- `docs/reference/commands.md` — rewrote lines 44, 47, and 54 naturally to remove 8 em dashes while preserving single-line table rows and `Invocation` contracts (Criterion 1).
- `docs/reference/config.md` — rewrote line 68 naturally to remove 2 em dashes while preserving the table row (Criterion 1).
- `docs/reference/files.md` — rewrote lines 28, 71, 73, 95, and 99 naturally to remove 15 em dashes while preserving `(script)` and the `verify-runs.jsonl` row with `` `timeouts` ``, `` `durations` ``, and `` `attempt` `` (Criterion 1).
- `docs/reference/limits.md` — rewrote line 17 naturally to remove 1 em dash (Criterion 1).
- `docs/reference/skills.md` — rewrote lines 16 and 46 naturally to remove 3 em dashes (Criterion 1).
- `docs/reference/state-and-phases.md` — rewrote lines 18 and 36 naturally to remove 2 em dashes while preserving the table row (Criterion 1).
- `docs/reference/words.md` — rewrote line 29 naturally to remove 2 em dashes (Criterion 1).

### Unit u3 — Start and use docs (`9a7402bf`)
- `docs/start/what-it-is.md` — rewrote line 12 naturally to remove 2 em dashes (Criterion 1).
- `docs/start/why-it-works.md` — rewrote line 25 naturally to remove 1 em dash (Criterion 1).
- `docs/use/a-working-day.md` — rewrote line 10 naturally to remove 2 em dashes (Criterion 1).
- `docs/use/autopilot.md` — rewrote lines 21 and 25 naturally to remove 4 em dashes (Criterion 1).
- `docs/use/plan-work.md` — rewrote lines 24, 32, 34, and 56 naturally to remove 8 em dashes (Criterion 1).
- `docs/use/watch-while-away.md` — rewrote lines 7 and 43 naturally to remove 4 em dashes while preserving `claude`, `codex`, `pi`, and `agy` on line 7 (Criterion 1).

No other files were modified (`README.md` and `docs/pictures/*.svg` already held 0 em dashes; no agent doc or excluded section of `04`–`08` was touched).

## Done-criteria verification and command results

### Criterion 1 — Zero em dashes remain; natural rewrites without dash substitutes
- **Mechanical proof** on commit `9a7402bf4464d812163e3dd4e1b4dcfd312c867a`:
  - Command: `akrogon run-check --name em-dash-guard -- bun test tests/docs-em-dash.test.ts`
  - Result: `2 pass, 0 fail` (11 expect() calls)
  - Log: `check em-dash-guard: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-em-dash-guard-1795786898010-696730.log`
- **Model-choice reading (rewrite quality / no dash substitutes)**: A inspected the complete `git diff origin/main...HEAD -- docs/` line by line across all 20 files and confirmed every changed sentence was genuinely rewritten with standard punctuation and zero `" - "`, `"--"`, or en-dash substitutes (all `--` occurrences in added lines are pre-existing CLI flags such as `--holder`, `--charts`, `--json`, `--sha`, `--attempt`, `--known-red`, `--slot`, `--check`). Final reading belongs to slot B.

### Criterion 2 — Full consultant examples on `04`–`08` and `docs/README.md`; slots sentence on page 04
- **Inspection proof** on commit `9a7402bf4464d812163e3dd4e1b4dcfd312c867a`:
  - Command: `akrogon run-check --name consultant-examples-check -- rg -n 'chart-issues|consultant|slot [BCD]' docs/guide/04-a-charting-session.md docs/guide/05-signposts.md docs/guide/06-charting-mode.md docs/guide/07-build-route.md docs/guide/08-hand-off.md docs/README.md`
  - Result: exit `0`; confirms all 4 consultant-starting examples (`04:22`, `06:35`, `06:54`, `06:75`) use `Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.` (singular `slot B` on `06:75`), zero other consultant-starting examples exist on `05`, `07`, `08`, or `docs/README.md`, and `04:25` holds `While charting, consultants sit in slots B, C, D, and a Lifecycle task later gets its own fresh slot B (the reviewer).`
  - Log: `check consultant-examples-check: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-consultant-examples-check-1795786898129-696453.log`
- **Model-choice reading**: slot B reads `docs/guide/04-a-charting-session.md` through `08-hand-off.md`, `docs/README.md`, and `git diff 8025b594...9a7402bf`.

### Criterion 3 — Guard test fails on an em dash and passes on delivered tree; deliberate break shown red
- **Deliberate break** on top of `9a7402bf4464d812163e3dd4e1b4dcfd312c867a` (temporarily appended `Deliberate break — em dash check.` to `docs/README.md`, then reverted with `git checkout -- docs/README.md`):
  - Command: `akrogon run-check --name em-dash-deliberate-break -- bun test tests/docs-em-dash.test.ts`
  - Result: exit `1` (`1 pass, 1 fail`): failed `(fail) README, docs markdown and docs pictures hold no em dashes` reporting `"docs/README.md:70: Deliberate break — em dash check."`
  - Log: `check em-dash-deliberate-break: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-em-dash-deliberate-break-1795786897909-696583.log`
- **Delivered tree green proof** after reverting the break on `9a7402bf4464d812163e3dd4e1b4dcfd312c867a`:
  - `check em-dash-guard: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-em-dash-guard-1795786898010-696730.log` (`2 pass, 0 fail`)
  - Rerun stability (`--rerun-each=5` via changed-tests command on `9a7402bf`): `check pick-u3-changed-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-pick-u3-changed-tests-1795786859062-695723.log` (all 5 runs green)

### Criterion 4 — No other wording changes beyond Criteria 1 and 2; destination `checks` pass
- **Diff scope**: `git diff --stat 8025b594...9a7402bf` shows `21 files changed, 166 insertions(+), 70 deletions(-)` — exclusively `tests/docs-em-dash.test.ts` and the 20 em-dash Markdown files (no excluded edits to `04`–`08` tab section, previous/next links, or embeds; no edits to `README.md`, `docs/pictures/*.svg`, or agent docs). Slot B reads the diff to confirm.
- **Destination `checks` via `akrogon verify`** on commit `9a7402bf4464d812163e3dd4e1b4dcfd312c867a`:
  - Command: `akrogon verify` (wall time: `109s`)
  - Result: `verify leaf 9a7402bf4464d812163e3dd4e1b4dcfd312c867a: green` (exit `0`)
  - Kept logs:
    - `verify setup: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-setup-1795786907763-697094.log`
    - `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-format-1795786910646-697094.log`
    - `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-typecheck-1795786913327-697094.log`
    - `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-test-1795787016277-697094.log`

### Worker and per-pick targeted check logs folded in
- `u1`:
  - `check u1-em-dash: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-u1-em-dash-1795786741531-692097.log`
  - `check u1-docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-u1-docs-links-1795786748037-692327.log`
  - `check pick-u1: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-pick-u1-1795786858740-695399.log`
- `u2`:
  - `check u2-em-dash: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-u2-em-dash-1795786798822-693838.log`
  - `check u2-consumer-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-u2-consumer-tests-1795786799809-693926.log`
  - `check pick-u2: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-pick-u2-1795786858893-695560.log`
- `u3`:
  - `check u3-em-dash: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-u3-em-dash-1795786760742-692679.log`
  - `check u3-consumer-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-u3-consumer-tests-1795786768158-692933.log`
  - `check pick-u3-changed-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-pick-u3-changed-tests-1795786859062-695723.log`

## Known limitations and unverified criteria

- **Known limitations**: none known.
- **Unverified criteria (model-choice readings for slot B)**:
  - Criterion 1 prose quality: confirming each changed sentence was rewritten naturally without dash substitutes is slot B's reading of `git diff 8025b594...9a7402bf`.
  - Criterion 2 prose completeness: confirming every consultant-starting example on `docs/guide/04`–`08` and `docs/README.md` names each slot with harness, model, and effort and that page 04 holds the slots sentence is slot B's reading.
  - Criterion 4 diff scope: confirming no unrelated wording changes exist beyond Criteria 1 and 2 is slot B's reading of the diff.
