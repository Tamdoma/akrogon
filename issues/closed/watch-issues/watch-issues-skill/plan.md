# Plan: watch-issues-skill

New skill `skills/watch-issues/` giving the operator an opt-in Claude Code cron watch over `issues/open`. Synthesis is direct: `debate: "no"`, so this plan integrates the brief and locked design only. No brief/design conflicts found.

## Decisions

- D1 — Repo key resolution: `observe.ts <root>` runs `akrogon config` with `cwd=<root>`, parses the YAML, and reads the `repo` field. `repo: none` or a non-zero exit is a hard error. Each leaf's `state.repo` must equal that key; a mismatch exits non-zero naming the leaf path, stored key and registered key (mirrors `RepoMismatchError` semantics in `src/state.ts`).
- D2 — Herdr injection: `observe.ts` resolves the herdr binary from `process.env.OBSERVE_HERDR ?? 'herdr'`. Tests point it at a fixture script; production never sets it. This is the "command path injectable" the design requires.
- D3 — State schema: `observe.ts` declares its own zod `strictObject` schema with the same field names as `src/state.ts` (slug, phase, repo, `blocked-by`, attempts, done, `fix_rounds`, pane, `busy_since`, `busy_notified`, failure optional). The skill is a separate package and cannot import `src/`; duplicating field names is the design's explicit choice. Legacy `priority`/`slot`/`failed_notified` keys are stripped before parsing, same as `readState`.
- D4 — One `herdr agent list` call per run, parsed as `{ result: { agents: [...] } }` (verified live: each agent has `pane_id`, `agent`, `agent_status`, `agent_session`, `cwd`). Non-zero exit or non-JSON stdout exits non-zero naming the cause. A recorded pane absent from the list prints `-` for its status; a seat with no recorded pane prints `-` for the pane.
- D5 — Line format per leaf, one line, stable field order: `slug=<slug> phase=<phase> attempts=A<n>,B<n> blocked=<comma-list|empty> A=<pane|->/<status|->[+HhMMm] B=<pane|->/<status|->[+HhMMm] notified=<seats-with-busy_notified|empty>` and, for `phase=failed`, ` failed=<cause>@<phase> delivery=<value|-> reason="<reason>"` or ` failed=unknown` when no failure record exists. Busy age is `now - busy_since[seat]`; no `busy_since` means no age suffix. The test pins this format; SKILL.md documents it verbatim.
- D6 — Judgment lives in SKILL.md prose, not in `observe.ts`. The script is read-only inventory; the agent applies the rules. SKILL.md carries the required-seat table copied from `src/routing.ts`: plan.positions A+B, plan.rebuttal A+B, plan.synthesis B, implement B, check.review A+B (A only when `fix_rounds > 0`), check.fix B, merge A; merged/failed none. "Unfinished" means not in `done`.
- D7 — Recovery bound is computed by the agent from `issues/log.jsonl` (record shape in `src/log.ts`: `ts, repo, slug, from, to, slot, ...`). Filter to this repo and slug in order; a `failed -> P` record whose next record for that slug is `P -> failed` is one unproductive cycle; two consecutive cycles end recovery (notify-only). Missing or malformed log means unknown, so notify-only. SKILL.md states this algorithm exactly; no helper script.
- D8 — `akrogon phase <slug> <failure.phase>` needs no `--slot`: from `failed`, `requiredSlots` is empty and `transition` accepts the move (`src/phase.ts`). All akrogon commands run with `cwd=<root>`; `akrogon next --all` from `<root>` is repo-scoped.
- D9 — Package files mirror `skills/broadcast-issue`: `package.json` named `@akrogon/watch-issues` with `zod`, `@types/bun`, `typescript` and `test`/`typecheck` scripts; `tsconfig.json` copied; `bun.lock` produced by `bun install --cwd skills/watch-issues`.
- D10 — Install coverage: `src/install.ts` enumerates `skills/` dynamically, so `watch-issues` links with zero code change. Extend `tests/install.test.ts` with one assertion that the enumerated `skills` array contains `watch-issues`, satisfying criterion 4's "existing install test extended".
- D11 — Criterion 1 reading: `bunfig.toml` scopes root `bun test` to `tests/`, so `observe.test.ts` runs under the skill's own `bun run test` (criterion 2). Criterion 1 is satisfied by the root suite staying green plus the skill suite covering the listed fixtures. No `bunfig.toml` change; it is outside owned files.
- D12 — No ledger, no snapshot script, no state writes. Notification dedup relies on `failure.delivery: shown` plus this fire's own `shown` response; after a lost context carry a notice may repeat — accepted (design Q6, Excluded).

## Read-first

- `brief.md`, `design.md` (leaf folder) — contract and binding decisions.
- `issues/chart/watch-issues/forks/watch-policy.md`, `forks/seat-loops.md` — verbatim operator answers behind every rule.
- `src/state.ts` — `stateSchema`, `failureSchema`, `readState` legacy-key stripping.
- `src/routing.ts` — `phaseSchema`, `requiredSlots` incl. the `fix_rounds > 0` check.review rule.
- `src/shell.ts` — `paneSchema`, `{result: ...}` herdr envelope, `run`/`CommandError` conventions.
- `src/next.ts` — what `next` guards (busy seat skip, prompt grace, attempt charging on the event pass).
- `src/phase.ts` — `transition` from `failed`, `announceFailed` writing `failure.delivery`, `completeOwner` moving merged leaves to `issues/closed`.
- `src/log.ts` — `log.jsonl` record fields.
- `src/config.ts` — `effectiveConfig` `repo:` field, `AKROGON_HOME`.
- `src/install.ts`, `tests/install.test.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts` — install enumeration and fake-command fixture conventions.
- `skills/broadcast-issue/` (all four files + scripts) — skill-local package convention.
- `learnings/LESSONS.md` — relevant: `z.string().min(1)` accepts whitespace (use `.trim().min(1)`); `bun -e` argv shift; scratch `AKROGON_HOME` verification pattern.

## Needed interfaces

- `akrogon config` (cwd=`<root>`) → YAML, `repo` field.
- `herdr agent list` → `{result:{agents:[{pane_id, agent, agent_status, ...}]}}`.
- `herdr agent read <pane> --lines 80` (busy seat) / `--lines 60` (post-esc confirm per design; one read, the design's two numbers stand: 80 for judgment, the confirm read reuses the pane surface).
- `herdr agent send-keys <pane> esc`; `herdr agent wait <pane> --timeout 10000`; `herdr agent prompt <pane> "<text>"`.
- `herdr notification show "<title>" --body "<reason>" --sound request` → `{result:{shown, reason}}`.
- `akrogon next <slug>`, `akrogon next --all`, `akrogon phase <slug> <phase>` — all cwd=`<root>`, never under a Bash timeout.
- Claude Code `CronList` / `CronCreate` / `CronDelete`; job identity is the exact prompt string `/watch-issues tick <root>` (root quoted when it holds spaces), schedule `*/20 * * * *`, recurring.
- `issues/log.jsonl` — append-only move records, read for the recovery bound.

## File checklist (ordered)

1. `skills/watch-issues/package.json` — mirror broadcast-issue (D9).
2. `skills/watch-issues/tsconfig.json` — mirror broadcast-issue.
3. `skills/watch-issues/scripts/observe.ts` — D1–D5. Read-only; exits non-zero naming the cause on unreadable/invalid state, repo mismatch, or herdr failure; never prints an empty inventory as success.
4. `skills/watch-issues/scripts/observe.test.ts` — fixture trees: waiting; mixed A working / B idle; busy with and without `busy_notified`; failed `blocked`; failed `attempts`; legacy failed without a failure record; merged still under open. Fake herdr via `OBSERVE_HERDR` (D2). Cases: documented line per leaf; missing pane prints `-` status; unreadable state, schema-invalid state, wrong-repo state, non-zero herdr, non-JSON herdr each exit non-zero naming the cause.
5. `skills/watch-issues/bun.lock` — `bun install --cwd skills/watch-issues`.
6. `skills/watch-issues/SKILL.md` — frontmatter `name: watch-issues` plus an operator-invocation description; sections: Invocations (three forms, zero/one/several job behavior, Claude-Code-only refusal in one sentence when CronCreate is absent, start never creates a job when its own check already satisfies the stop rule), Observe (script under Bash timeout, `agent read` when warranted, log.jsonl for the bound), Judge (one rule per case: waiting → `next <slug>` or `next --all`; merged-under-open → one `next`, report error if it stays; failed human-prerequisite or `unknown` → notify when not shown, never recover; failed otherwise → re-read state, all required seats of `failure.phase` idle/absent, cycle count from log, two consecutive unproductive → notify-only, else `phase` then `next`; busy → 80-line read per busy seat judged against the brief, loop/off-scope/hung evidence → esc, `agent wait --timeout 10000`, pane read confirming idle + empty input + same session else notify, one corrective prompt naming evidence/target/next-step and a looping subagent by name for the parent; mid-turn steer only when tools visibly complete; same seat looping next fire → notify, never a second esc; insufficient evidence → say so, no action; command error from `next`/`phase` → re-run observe, report, no further mutation this fire), Stop (empty readable open tree or every leaf human-blocked-and-shown → CronList, delete the one exact-prompt job; several matches reported, none deleted), Never list (kill process, close pane, second esc per seat per watch, `phase failed`, edit state.yaml/worktrees/issues, open `.env`, answer a seat, create a job from a tick, Bash timeout on `next`/`phase`), Reply (≤5 lines per fire). Required-seat table (D6) and recovery-bound algorithm (D7) included verbatim.
7. `tests/install.test.ts` — add `expect(skills).toContain('watch-issues')` (D10).
8. Implementation report — recorded walk-through (criterion 5): scratch `AKROGON_HOME`, fixture config rewritten to scratch paths, every herdr call routed to a fake, cron simulated by invoking tick rules by hand. Scenarios: failed-attempts leaf recovered; same leaf failing again from the same phase recovered a second time; third identical failure notify-only; progress between failures resets the count; failed-blocked leaf never recovered; mixed A working / B idle dispatches B; looping seat in a fake pane transcript yields esc → wait → read → prompt once and a notification on the next fire; empty open tree reaches the stop rule.

## Acceptance criteria

1. Root `bun test` green; skill `bun run test` green covering every fixture and negative case in item 4 (D11).
2. `bun run typecheck` in `skills/watch-issues` green; `bun install --cwd skills/watch-issues --frozen-lockfile` succeeds.
3. SKILL.md carries every rule listed in item 6, followable without this chart.
4. `bun test tests/install.test.ts` green with the new assertion; scratch-HOME install links `watch-issues` into all four harness roots.
5. Walk-through evidence in the report covers all eight scenarios in item 8.

## Open limitation

Notification dedup beyond the context carry does not exist: the skill cannot write `failure.delivery`, so after a lost context carry a human-prerequisite notice may repeat. Accepted by design Q6; do not add a ledger to fix it. Real CronCreate/CronDelete behavior is operator-verified on first use, not by this leaf.

## Dependencies

None. `seat-prompt-delivery` changes what a pass does on delivery failure; this skill only calls `next` and reads the failure record, so no ordering is required.

## Credentials

None named by the design; no env check required.

## Implementation notes

2026-09-19:

- `akrogon config` is also injectable in `observe.ts` as `OBSERVE_AKROGON` (default `akrogon`), same pattern as `OBSERVE_HERDR`, so unit tests need no PATH shim. Both names are documented in SKILL.md's Observe section.
- Pane reads use `--lines 80` everywhere. The design's Observe section says 60 for a warranted read while the busy rule and brief say 80; 80 satisfies both call sites with one number. Recorded for review.
- `observe.ts` validates leaf depth (2 or 3 under `issues/open`) and rejects duplicate slugs, mirroring `validateLeafDepth`/`allLeaves` in `src/state.ts`; both surface as non-zero exits naming the cause.
- `notified=` prints the comma-joined seats with a `busy_notified` timestamp (empty when none); `blocked=` prints the comma-joined `blocked-by` list (empty when none).
- The walk-through's fake herdr is purpose-built under the scratch area (not `tests/fake-herdr.ts`, which lacks `agent list/read/send-keys/wait`); the artifact records the script path and every call.
