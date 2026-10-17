# Implementation report: usage-spans

Branch `usage-spans`, base `30030e6` (origin/main), head after implementation `c7309ce` (post-verify prettier fixup `c7309ce`, 3-line format-only diff).

## Changed files and reasons

- `tests/chart-usage.test.ts` (commit `7b9b668`, corrected `b608935`) — seven planned criterion tests plus corrected expectations citing real output; `assistant messages` assertions renamed to `calls`.
- `tests/fixtures/chart-usage/` (commit `7b9b668`, `b608935`) — new `claude/claude-spans.jsonl`, `codex/rollout-tur.jsonl`, `pi/pi-A.jsonl`, `pi/pi-zero.jsonl`, `pi/pi-nousage.jsonl` and README entries.
- `skills/chart-issues/scripts/chart-usage.ts` (worker commit `071a2b9`, A repair `e8c95c1`) — spans schema and validation, half-open effective windows, per-harness calls (`claude` whole-session group placement, codex `token_usage_record` mode with cumulative fallback, pi reader), `calls`/`average context per call`/`calls unavailable` output, span-clipped minutes, `legacy window` vs `window` line.
- `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md` (worker commit `fceb4ee`) — span lifecycle, seats.yaml shape, `calls`/`average context per call` and pi measurement prose.

## Worker returns folded in

- W1 (`2cb7052`, cherry-picked as `071a2b9`): implemented the script; returned a mismatch on three planned tests — wrong expected values (my arithmetic/structure errors), corrected in `b608935` citing its real output; two script defects found alongside (in-span group formation, horizon-bound reply ends) repaired in `e8c95c1`.
- W2 (`94b2a14`, cherry-picked as `fceb4ee`): prose landed, all three files updated, no test commands per brief.

## Commands run

- `check spans filter records: 1` — planned red before product code (window line and calls absent).
- `check invalid spans: 1`, `check claude calls: 1`, `check token_usage_record: 1`, `check cumulative-only: 1`, `check pi calls: 1`, `check calls unavailable: 1` — planned reds before product code (logs beside this report).
- `check corrected-criteria-red: 1` — corrected tests shown red on worker code (g3 gap leak).
- `check chart-usage-after-repair: 1`, `check chart-usage-after-repair2: 1`, `check chart-usage-v3: 1`, `check chart-usage-v4: 1` — intermediate repair iterations (expectation corrections and the `turnEnd`/`userMsgs` fixes).
- `check chart-usage-v5: 0` — `bun test tests/chart-usage.test.ts`: 19 pass, 0 fail.
- `check savings-base-red: 0`, `check savings-fresh: 0`, `check savings-usage-windows: 0` — live runs below.
- `bunx tsc --noEmit`: clean. `bunx prettier --check` on the three doc files: clean (worker's pre-existing shapes.md note verified identical on base).

## Criterion proofs

- C1/C2 (spans, calls, pi, cumulative, mixed, invalid, zero, boundary): `bun test tests/chart-usage.test.ts` — 19 pass (`check chart-usage-v5: 0`).
- C3 (prose): three files updated in `fceb4ee`; `spans`, `legacy window`, `calls`, `average context per call`, `pi` present in each required surface.
- C4 (savings check, informative only): fixed script run on copied `seats.yaml` files under `/tmp/usage-savings-k5F6/` (nothing written under `issues/`); `CLAUDE_CONFIG_DIR`/`CODEX_HOME` unset (operator defaults). Results below.

## Savings check (criterion 4, observational — no cause or quality claim)

Side-by-side per seat × chart. Sessions: A `c954dd5e-b178-44b7-8495-f725d95b59e5` (claude) in all three charts; B `01a148d2-b706-7d93-acd8-744c86365e07` (base-red), `01a1494d-b330-73d0-9833-6c8428d3c16b` + `01a14954-bb53-7350-bfb4-c0afd7e62302` (fresh-consultants) + `01a14962-9a70-7fe1-bb05-da800735f574` (usage-windows); C `01a14117-bea6-728a-9455-0db743e0cf11` (base-red), `01a1494d-bde8-74a5-9041-360d1f55f1dc` (fresh) + `01a14962-a839-7667-92b2-696f0093a0ee` (usage-windows).

| Seat | Chart | Window / spans | Calls | Avg context per call | Input | Cache read | Output | Working min |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | base-red | legacy `08:17:04→09:04:40` | 110 | 137772 | 220 | 14856427 | 109394 | 42.2 |
| A | fresh-consultants | `10:07:32→10:22:40` | 36 | 163863 | 72 | 5810570 | 48182 | 15.1 |
| A | usage-windows | `10:22:40→10:35:45` | 37 | 122009 | 74 | 4389971 | 38047 | 13.1 |
| B | base-red | legacy `08:17:04→09:04:40` | 77 | 145342 | 11191306 | 10918272 | 39829 | 20.8 |
| B | fresh-consultants | `10:07:32→10:22:40` | 30 | 78334 | 2350031 | 2240768 | 11825 | 9.0 |
| B | usage-windows | `10:22:40→10:35:45` | 18 | 62104 | 1117870 | 1040896 | 7231 | 3.3 |
| C | base-red | legacy `08:17:04→09:04:40` | 59 | 80713 | 308376 | 4453716 | 42208 | 16.9 |
| C | fresh-consultants | `10:07:32→10:22:40` | 39 | 84560 | 141471 | 3156352 | 23784 | 7.3 |
| C | usage-windows | `10:22:40→10:35:45` | 41 | 63108 | 139797 | 2447616 | 24602 | 6.8 |

Change in average context per call `100 * (new / base-red - 1)`:

- B, fresh-consultants: **-46.1%**; B, usage-windows: **-57.3%**
- C, fresh-consultants: **+4.8%**; C, usage-windows: **-21.8%**

base-red is a legacy shared window (one `opened→until` span covering every chart of that pass). fresh-consultants carries the shared opening map in its first and only span. These figures are observational: the charts differ in size, the windows are per-chart and the numbers show context per call, with no cause or quality claim.

## Final verification

`akrogon verify` on committed head `c7309ce`: format/test/typecheck all exit 0 — `verify leaf c7309ce43d3a04f0d9f5df182a33091186c0905f: green`. Receipt logs: `check-format-*`, `check-test-1792235889227-*.log` (1027 pass, 0 fail), `check-typecheck-1792235891290-*.log`. Criterion file: `check chart-usage-final: 0` (19 pass).

## check.fix (2026-10-17)

B's check.repair repaired the shared F1 (cumulative codex gap increments, `482229b`) and F2 (operator turns crossing a span start, `5f93974`). The two findings handed to A landed in `check.fix`:

- F3 (B): the legacy window was `[opened, until]` via `untilMs + 1`; brief C1 and the design require `[opened, until)`. Product fix `bed019d` removes the `+1`; test corrections in `80bbb14` set the until-boundary assertion to `calls 0` and drop the at-until group from `claude calls` (now 5 calls / 9360 / 10030, hand-counted).
- F4 (B): brief C2's error-with-nonzero-usage case was untested. `80bbb14` adds a 10:15 nonzero error assistant to `pi/pi-A.jsonl`; calls 5, average context per call 2602, tokens hand-counted. Deliberate-break proof: `check f4-nonzero-error-red: 1` (skipping all error assistants fails the case). Green: `check f3-f4-green2: 0` (21 pass).

Savings rerun on the final code with the same scratch copies and `until` values: `check savings-rerun: 0`; every seat's calls and average-context figure is unchanged. The legacy change only shifts the printed window line's end.

Final verification: `akrogon verify` on `bed019d` is green — see `verify leaf` output below.

## Known limitations

- pi `message.usage` presence validates whole-session (stricter than the in-span-only check the plan named; test 7's record sits outside the span, so both readings pass).
- `% change` for A omitted per the criterion (B and C only).

## Unverified criteria

None.
