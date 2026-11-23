# Map C: paid-budget (`Tamdoma/akrogon#152`)

## 1. Inventory (file:line → action under locks)

- **Code (change/keep):**
  - `src/config.ts:24,31-40` (`globalSchema` `paid_budget`, `strictObject`): **keep optional & ignored** in R1 so existing `~/.akrogon/config.yaml` (N1) does not crash on deploy/rollback; remove in R2 after key deletion.
  - `src/config.ts:133-134` (`AKROGON_SESSIONS`/`AKROGON_SESSION_MINUTES` reserved in `repoSchema`): **keep** (prevents repo config forging/shadowing).
  - `src/budget.ts:7-88` (`rowSchema`, `readLedger`, `reserve`): **change** — drop `paid_budget` check (`:56-58`) and rolling 24h ceiling refusal (`:60-75`); keep `budget.lock` + strict append-only `budget.jsonl` log, adding optional `name` and `minutes`.
  - `src/run-check.ts:219,318,335-336,349-352`, `src/akrogon.ts:329`, `src/usage.ts:66`: **change** — keep `--sessions <n>`, add optional `--minutes <m>` (generous default, e.g. `30`), export `AKROGON_SESSIONS`/`AKROGON_SESSION_MINUTES` to the reserved command only (not in `copied` at `src/run-check.ts:41-49`).
  - `src/state-home.ts:17` (`budget.jsonl`), `src/admission.ts:90-93,262-263` (`nested` full-run queue), `src/config.ts:25` (`max_active`): **keep** (ledger + host-overload safety caps).
  - `tests/e2e/tier.ts:43-49` (`reservedSessions`), `tests/e2e/watch-consults.e2e.ts:153-159` (`AKROGON_SESSION_MINUTES` deadline), `tests/e2e/{kinds,watch-stop,watch-live}.e2e.ts`: **keep** (per-test guards).
- **Skills & docs (change):**
  - `skills/lifecycle-rules.md:7-11` (`## Grant reuse and paid sessions`): drop ceiling `failed` stop & `paid_budget`; seat sets `--sessions`/`--minutes` generously from past runs and raises on budget failure with no operator; keep product-red brake (`:9`) and fresh-call floor (`:11`); keep operator grants only for non-money hazards (outside accounts, destructive/public/billing writes).
  - `skills/check-issue/SKILL.md:31,69`: `:31` drop *"or the ceiling"* from operator blockers; `:69` keep checking every paid run has a `budget.jsonl` row and explained activity, treating seat-raised reruns as normal (not a Fix).
  - `skills/chart-issues/SKILL.md:12,49`, `skills/chart-issues/assets/autopilot.md:9`, `skills/chart-issues/assets/shapes.md:367-383`: drop `paid_budget` needs-sheet row and chart wait; `by: standing` grant covers paid harness launches and nested runs (lock 3b) without citing `config.yaml paid_budget`.
  - `docs/reference/{limits.md:25,config.md:33,53-57,88,commands.md:51,files.md:107-111,checks.md:50}`, `docs/use/{autopilot.md:21,37,plan-work.md:32}`, `src/AREA.md:5,14`: update to match.

## 2. Concrete budget failure & raise/rerun loop

- **What fails today when a budget is too small:**
  1. Session cap hit: `tests/e2e/tier.ts:43-49` prints `refusing paid cell: plans <P> sessions, AKROGON_SESSIONS=<N>` and exits `1` before starting sessions.
  2. Minute cap hit: `tests/e2e/watch-consults.e2e.ts:153-157` throws `watch-consults exceeded its <M>-minute session deadline` (exit `1`), or `bun test --timeout` kills a progressing run.
  3. Any repo test checking `AKROGON_SESSIONS` / `AKROGON_SESSION_MINUTES` printing an explicit budget/deadline refusal.
  - **Not a budget failure:** product assertions, missing credentials, crashes, or a zero-progress hang (still governed by the red-launch brake at `skills/lifecycle-rules.md:9`).
- **Raise & rerun:** seat parses `<P>` (if printed) or doubles the tight bound (`--sessions` and/or `--minutes`, matching any runner `--timeout`), notes the bump + reason in its pass record, and reruns `akrogon run-check` directly — no operator approval, no `failed` stop.

## 3. Making the first guess precise

- Today `~/.akrogon/budget.jsonl` (`src/budget.ts:7-13`) stores only `{at, repo, slug, run, sessions}` (currently 3 live rows for `framework/geo-pages-own-stem`: `8, 8, 1`) — missing check `name`, `minutes`, `duration_ms`, and `exit`.
- `issues/timings.jsonl` (`src/run-check.ts:448-454`) already records `{kind: 'check_end', slug, run, name, exit, duration_ms}` per repo, joinable by `run`.
- **Smallest read surface:** append optional `name` and `minutes` to `budget.jsonl` rows at start, and add one small read-only command (`akrogon budget [--repo <r>] [--name <n>]`, ~25 lines) that reads `budget.jsonl`, joins `issues/timings.jsonl` by `run`, and prints recent paid runs (`repo`, `slug`, `name`, `sessions`, `minutes`, `duration_ms`, `exit`). Seats read it once before guessing generously.

## 4. Failure modes & migration hazards

- **Runaway reruns on a dead hang:** blindly raising `--minutes` on a hung test wastes time/sessions; prose must require evidence of forward progress before raising a deadline and stop after 2–3 raises without progress.
- **Review audit (`skills/check-issue/SKILL.md:69`):** must accept multiple `budget.jsonl` rows for the same check when earlier rows hit a budget failure and the seat raised/reran; only unreserved or unexplained paid sessions stay a Fix.
- **Strict schema breaks:**
  - `src/budget.ts:7` `rowSchema` is `z.strictObject` — new fields (`name`, `minutes`) must be `.optional()` so existing 5-field rows in `~/.akrogon/budget.jsonl` still parse.
  - `src/config.ts:24` `globalSchema` is `z.strictObject` and this host's `~/.akrogon/config.yaml` currently sets `paid_budget` — deleting it in one release breaks every command on deploy.
- **Nested runs (3b):** `AKROGON_SESSIONS`/`AKROGON_SESSION_MINUTES` are not in `copied` (`src/run-check.ts:41-49`), so a nested `run-check` passes its own `--sessions`/`--minutes` and succeeds with no ceiling or approval block.

## 5. Recommended shape & open forks

**Fewest-parts shape:** (1) remove ceiling enforcement in `src/budget.ts` while keeping `paid_budget` accepted-and-ignored in `src/config.ts`; (2) add optional `--minutes <m>` (default `30`) to `run-check` and log optional `name`/`minutes` in `budget.jsonl`; (3) add read-only `akrogon budget` joining `budget.jsonl` + `timings.jsonl` by `run`; (4) update `lifecycle-rules.md`, `check-issue`, `chart-issues`, and `docs/`.

**Open forks:**
1. **F1 — `paid_budget` in `globalSchema`:** (a) delete now (breaks hosts carrying the key) vs (b) accept-and-ignore in R1, delete in R2. **Pick: (b).**
2. **F2 — Minutes control:** (a) `--minutes <m>` flag with generous default (`30`) vs (b) fixed constant with no flag. **Pick: (a)** — lets seats raise minutes on a deadline hit without code edits.
3. **F3 — Past-run lookup:** (a) `akrogon budget` joining `budget.jsonl` + `timings.jsonl` by `run` vs (b) also writing end-of-run `duration_ms`/`exit` into `budget.jsonl` vs (c) raw `budget.jsonl` reads only. **Pick: (a)** — zero extra post-run lock/write, gives seats exact historical durations/exits.
4. **F4 — Dead-hang brake on raises:** (a) prose rule in `lifecycle-rules.md` (require progress, cap at 2–3 raises) vs (b) hard cap in `run-check`. **Pick: (a)** — avoids adding another artificial cap.
