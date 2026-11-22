# Opening Map: ai-budgets — Slot C

## 1. Forks that change the outcome

1. **Standing ceiling location & shape (`src/config.ts` `globalSchema`, `effectiveConfig`)**
   - **O1 (Rec):** Optional `standing_budget` block in `globalSchema` (`~/.akrogon/config.yaml`): `approved: { by, date, answer }`, standing scope (`accounts`, `operations`, `effects`, `stop_line`), `sessions_per_day` (positive int), `session_minutes` (positive int), surfaced by `effectiveConfig`. Matches S1/S3 and Needs N1–N2; gives real operator provenance for harness auto-mode classifiers.
   - **O2:** Add per-repo overrides in `repoSchema`. Breaks S3 ("one standing ceiling on the machine") and invites fragmented caps across repos.
   - **O3:** Separate `~/.akrogon/budget.yaml`. Splits config surface, adds another file to `state-home.ts` `copiedEntries`, and misses `akrogon config` display.

2. **Where counting happens & how the host-wide daily total is known (`src/run-check.ts` `runCheck`/`checkedRun`, `src/config.ts` `globalHome`)**
   - **O1 (Rec):** Host-wide append-only ledger (`budget.jsonl`) in `globalHome()`, guarded by a host `flock` and gated in `runCheck` via an explicit paid-session flag (e.g. `--sessions <n>`). Before launch, sum today's sessions (UTC day or rolling 24h — sub-choice); refuse if `used + n > sessions_per_day`, reserve `n` on start, optionally reconcile down if the runner reports fewer actually prompted, and export `AKROGON_SESSION_MINUTES` to the child env in `constructedEnv`. Works across repos, parallel leaves, and chart-door `--holder` probes without trusting seat-written totals. Risk: depends on accurate `--sessions` declaration (review still catches gross mismatches in kept logs).
   - **O2:** Instrument `akrogon seat` only. Misses direct CLI/API harness calls in consumer repos (akrogon orchestrates non-akrogon repos too).
   - **O3:** Aggregate seat-written count lines from `report.md`/`review-B.md`. Violates S3 ("counted by the machine"), races across concurrent leaves, and preserves count-line ceremony (violates S6).

3. **What replaces `grants[]` repeat counts & `approved` (`src/readiness.ts` `grantSchema`, `shapes.md` `### readiness.yaml`)**
   - **O1 (Rec):** Discriminated/dual `grantSchema` (`authority: 'standing'` vs `'operator'`, or `approved` omitted on standing entries). Standing entries hold ONLY leaf-specific safety metadata (`targets`, `fixtures` with `cleanup`/`absence_check`, `operations`, `effects`, `stop_line`) with NO repeat counts and NO `approved` block — seats never edit `readiness.yaml` to self-raise (avoiding auto-mode classifier blocks) and never write `approved.by: operator`. Conservative initial estimates live in `plan.md`/handoff prose; actual usage is gated by Fork 2. Non-standing external grants keep `approved`.
   - **O2:** Add a separate top-level `standing_runs[]` key in `readinessSchema` and keep `grants[]` strictly operator-only. Cleanest classifier boundary, but adds schema surface (5 -> 6 keys) and ripples into `shapes.md` and tests.
   - **O3:** Config-only (omit standing runs from `readiness.yaml`). Breaks per-leaf `fixtures[].cleanup` and `absence_check`, which abandoned-capture recovery (`run-check.ts` `abandonedCaptures`, `docs/reference/checks.md`) requires for `$HOME` trust/session cleanup.

4. **Open leaves with legacy `readiness.yaml` (`src/readiness.ts` `readinessSchema`, `src/status.ts` `leafGaps`, `src/turn.ts` `blockDetail`/`eligibility`)**
   - **O1 (Rec):** Accept existing operator-approved `grantSchema` entries unchanged (union or optional fields, matching `parseRepoConfig`/`withoutKey` precedent in `src/config.ts`). Zero breakage on already-open leaves in consumer repos during rollout.
   - **O2:** Strict breaking schema swap. Crashes `scanRepo` (`status.ts`) and skips leaves in `dispatchLeaf` (`next.ts`) for every consumer repo with an open legacy leaf.

5. **Absent standing ceiling in `~/.akrogon/config.yaml`**
   - **O1 (Rec):** Fall back cleanly to per-leaf operator grants: `runCheck --sessions` refuses standing launches with a pointer to `~/.akrogon/config.yaml`, and chart door falls back to per-leaf Needs-sheet grants. Safe for fresh installs and test fixtures (`tests/readiness.test.ts` `global()`).
   - **O2:** Hard block all paid runs with no per-leaf fallback. Forces setup but breaks ad-hoc repos without global config.
   - **O3:** Built-in default ceiling. Violates S1/S3 ("numbers are the operator's") and trips safety classifiers.

6. **Single owner for S5 sufficiency rule & floor**
   - **O1 (Rec):** Put the operational S5 rule + floor ONCE in `skills/*/lifecycle-rules.md` (which every lifecycle seat loads via `## Shared context`) beside the retained red-repro gate; `standing-design.md` states the charting principle and points to it, while `implement-issue` and `check-issue` cite it without restating.
   - **O2:** Put the rule only in `skills/chart-issues/assets/standing-design.md`. Lifecycle seats only read it indirectly via `design.md`, risking drift or missed enforcement during `check.review`.

7. **Removals in `autopilot.md` and `SKILL.md` files (S6 net-deletion discipline)**
   - **O1 (Rec):** Remove repeat-count bounds, warn-and-continue overruns, renewal wording, seat count-line bookkeeping, review count-reconciliation audits, and per-leaf needs-sheet/park stops for standing-covered paid/local runs; keep `autopilot.md`'s self-limit guard (protects autopilot's own switch/bounds) and `lifecycle-rules.md`'s red-repro gate (one paid launch first; after red, no rerun without passing free repro or named live-only diagnostic).
   - **O2:** Keep count lines as optional telemetry. Violates S6 and invites `check.review` to drift back into auditing counts.

## 2. Affected surfaces & removable redundancy

- **Code:** `src/config.ts` (`globalSchema`, `effectiveConfig`), `src/readiness.ts` (`grantSchema`, `readinessSchema`), `src/run-check.ts` (`runCheck`, `checkedRun`, `constructedEnv`), `src/akrogon.ts` (`case 'run-check'`), `src/usage.ts`, `src/status.ts` (`statusCommand`, `jsonRepo` — optional budget line), `src/state-home.ts` (`copiedEntries` if ledger lives in `globalHome()`), new `src/budget.ts`. (`src/turn.ts` `blockDetail`/`eligibility` and `src/next.ts` `dispatchLeaf` only read `gaps()` — unchanged if legacy `readinessSchema` stays valid.)
- **Skills (heavy redundancy to cut):**
  - `skills/{check,implement,merge,plan}-issue/lifecycle-rules.md` (`## Grant reuse and count lines` — 4 byte-identical copies): delete repeat-count, warn-and-continue, unknown-prior-use, and count-line prose; keep red-repro gate + non-standing grant stop + add S5 sufficiency floor & machine-ceiling stop.
  - `skills/chart-issues/SKILL.md` (`## Open` needs-sheet paragraph, `## Take` proof & grant paragraphs, `## Handoff` grant confirmation): drop per-leaf paid budget/probe waits and repeat-count/renewal rules for standing-covered runs.
  - `skills/chart-issues/assets/autopilot.md`: drop per-leaf grant/paid-probe park for standing-covered calls; keep non-standing grant waits and autopilot self-limit guard.
  - `skills/chart-issues/assets/standing-design.md` (recorded-output & model-choice paragraphs): align fresh-call trigger with S5 sufficiency floor (wording-only/non-reaching changes need no fresh call).
  - `skills/chart-issues/assets/shapes.md` (`### readiness.yaml`): replace repeat-count `bounds` example with standing vs operator grant shapes.
  - `skills/check-issue/SKILL.md` (`## Shared context` operator-only rule, `## check.review` live-proof/count-audit paragraph, `## check.repair`): remove count-line & overrun audit; bound `Operator actions` to ceiling hit or non-standing permissions; judge sufficiency under S5's model-choice Fix bar.
  - `skills/implement-issue/SKILL.md` (`## Shared context`, `## implement`, `## check.fix`) & `skills/plan-issue/SKILL.md` (`## Shared context`): remove grant count-line and worker paid-count bookkeeping.
- **Docs & tests:** `docs/reference/{limits,files,checks}.md`, `docs/use/{autopilot,plan-work,watch-while-away,quick-fix}.md`, `tests/{readiness,chart-shapes,config,run-check,command-reference}.test.ts`, `src/AREA.md`, `tests/AREA.md`.

## 3. Practitioner questions & lifetime pitfalls

- **Pre-charge vs. actual prompted sessions:** If a test dies in setup before prompting, pre-charging worst-case wastes ceiling; if it loops past `--sessions`, pre-charging undercounts. Reserve worst-case under lock before launch, allow optional post-run actual-count reconciliation (never dropping below 0; worst-case stands on crash/kill).
- **Day-boundary spikes & timezone:** Calendar UTC day is deterministic and matches `timing.ts` ISO timestamps, but allows 2× ceiling across midnight; rolling 24h prevents boundary spikes. Pick explicitly in Fork 2.
- **Ceiling notice deduplication (S4):** Parallel leaves hitting the ceiling together could emit N attention notices unless ceiling-hit notices deduplicate per day (matching `noticeId` patterns in `src/next.ts` `observeBusy`).
- **Lock ordering:** Any new `budget.lock` in `globalHome()` must never nest inside `admission.lock` in an inconsistent order (take and release around the fast ledger check/append before `withAdmission`).
- **Test isolation (`AKROGON_HOME`):** Ledger MUST resolve through `globalHome()`, never `~/.akrogon`, so tests never read or burn the operator's real daily budget.
- **4-copy `lifecycle-rules.md` drift:** Add a fast unit test asserting all four `skills/*/lifecycle-rules.md` copies stay byte-identical.
- **Per-session vs. whole-command timeout:** `session_minutes` is per session (N2: 15m), while one `run-check` may run sequential sessions; export `AKROGON_SESSION_MINUTES` rather than blindly killing a multi-session run at 15m.

## 4. Proposed leaf split (only real dependencies)

1. **`budget-core`** (no prereq) — `config.ts` `standing_budget` schema + `effectiveConfig`; `readiness.ts` standing/legacy `grantSchema`; `budget.ts` + `run-check.ts` host-wide locked ledger, `--sessions` gate, ceiling refusal/deduped notice, `AKROGON_SESSION_MINUTES` env; `status.ts` daily budget readout; `state-home.ts` migration entry.
   - *Free checks:* Unit/CLI tests with isolated `AKROGON_HOME`: `globalSchema` with/without `standing_budget`; legacy + standing `readinessSchema`; concurrent locked counting, rollover, ceiling refusal + single notice, absent-ceiling refusal, `akrogon config`/`status` output.
2. **`budget-skills`** (`blocked-by: [budget-core]`) — Updates all skill files (`lifecycle-rules.md` ×4, `chart-issues` SKILL/assets, `check-issue`, `implement-issue`, `plan-issue`) and affected `docs/` + `AREA.md` with net prose deletion (S6). Depends on `budget-core` because `tests/chart-shapes.test.ts` parses `shapes.md` against `readinessSchema` and skills cite the landed CLI flag & config keys.
   - *Free checks:* `tests/chart-shapes.test.ts` (standing + operator examples parse), 4-copy `lifecycle-rules.md` equality test, `tests/command-reference.test.ts`, full `akrogon verify`.

## 5. External operations needing real observation before handoff

- **None.** All work is local TypeScript, Zod schemas, `flock` file I/O, CLI flags, and Markdown skills/docs; zero external APIs or paid calls are needed to chart or prove either leaf. (Operator N1–N2 config activation in `~/.akrogon/config.yaml` happens once after `budget-core` lands.)
