# Plan: lean-exchange

Slot A synthesis for `plan.synthesis`. `state.yaml` has `debate: "no"`, so this plan is built directly from `brief.md`, `design.md` and live inspection of the worktree. The design's binding decisions, leaf architecture and the fork's live herdr probes (readiness.yaml `proofs`) are locked; nothing reopens them.

## Read first

- `brief.md`, `design.md` — locked scope: reading rule, chained pre-prompt waits, session on outcome/restart lines, seat records appended from those lines. Design wins over brief on conflict (none found).
- `skills/chart-issues/assets/questions.md` `## Blind peer exchange` — the peer-ask sentence and the wait/budget rules this leaf edits; the reading-rule block home.
- `skills/chart-issues/SKILL.md` — Open rule's restart paragraph (line ~29) and seat-record paragraph (line ~39); prompt prefixes must stay byte-stable.
- `skills/chart-issues/scripts/peer-wait.ts` — prints every outcome line; `finish()` shape, `readPeerAgent`, `checkIdentity`, `exchange` mutation rules.
- `skills/chart-issues/scripts/peer-ask.ts` — outcome lines pass through unchanged from peer-wait; seeds `exchange` pre-prompt.
- `skills/chart-issues/scripts/peer-restart.ts` — per-seat state lines (`seat`, `pane`, `kind`, `state`), read phase holds the pre-restart `agent list` rows.
- `tests/peer-wait.test.ts`, `tests/peer-ask.test.ts`, `tests/peer-restart.test.ts` — fake-herdr harness pattern; `expectOutcome`/`SeatLine` assertion shapes to update.
- `tests/fake-herdr.ts` — `agent list` emits `agent_session`; `agent start` sets a fresh `session-<n>`; `waitScript` `session`/`dropAgent` entries; `startScript`/`scriptedFailure` hooks.
- `skills/chart-issues/scripts/chart-usage.ts` — USAGE.md producer used by the run report (`calls`, `average context per call`, per-token lines, windows).
- `issues/chart/token-spend/forks/levers.md`, `slots/map-merged.md`, `slots/map-A.md` — the measured A-cost background and transcript-counting precedents (study scripts counted `herdr`/peer calls over assistant content).
- `learnings/LESSONS.md` — applicable: sweep `docs/` prose for a changed rule (2026-09-11); prefer refusal/reason/side-effect assertions over wording (2026-10-01); prove behavioral settings with a real probe (2026-10-02); `AKROGON_HOME` scratch isolation precedent (2026-09-13).
- `docs/guide/chart.md` consultant section (~line 172) — operator-facing prose that must keep describing the same exchange shape.

## Decisions

- **D1 Reading rule (questions.md, `## Blind peer exchange`).** A named paragraph in the peer-exchange section states: a consultant reads process text by named section for the step it is answering, locates a section before reading it, batches independent reads with bounded output, and reads content it already holds at most once per session; unread sections, content changed since it was read, and content lost to compaction may be read, and the full source stays allowed when it is the subject of the work. Named sections only, never line ranges. Scope binds consultants, not A (A's read-once rule already exists at SKILL.md:6). The brief files travel as before; the rule lives in skill text so every exchange brief inherits it.
- **D2 Chained pre-prompt waits (questions.md).** The sentence "Every wait before the prompt…run again whenever it fails with code `timeout`" becomes: for each exchange step A runs `herdr agent wait <paneB> --timeout <T> && herdr agent wait <paneC> --timeout <T> && bun <skill-folder>/scripts/peer-ask.ts <budget> <pane> <return> "<text>" …` in one shell call, so no prompt is sent unless every wait passed; a timed-out wait exits non-zero and the whole chain is rerun. `T`, the sequential 5-second `agent prompt` timeouts and the collection budget together fit under the command timeout the harness gives that call. `herdr agent wait` exit codes are unchanged (fork probe: timeout → exit 1, `&&` stops). peer-ask.ts unchanged in prompting and collection.
- **D3 `session` on outcome lines (peer-wait.ts).** `finish()` gains one field: `session`, the `agent_session.value` `herdr agent list` shows for the pane immediately before the outcome line prints — one extra `agent list` read inside `finish`, after the loop ends and before the line is written (the post-exchange read the design requires; reading only at seed time would print the stale or null pre-prompt session). All current fields keep names, order and values; `exchange` is not touched by the added field and is still copied verbatim into rerun calls. `session` is `null` when the pane shows no `agent_session`. The existing zero-agent row case keeps its error (`No herdr agent on pane`) — the final list read lands on the same code path. peer-ask prints these lines verbatim, so peer-ask outcomes carry `session` with no peer-ask change.
- **D4 `session` on restart lines (peer-restart.ts).** The read phase already captures each seat's pre-restart session id (extend `Agent` read to keep `agent_session?.value`). After the mutate loop, one `herdr agent list` re-read resolves the post-start session per seat. Each emitted seat line gains `session`: the post-start value for a `restarted` seat, `none` when herdr shows no `agent_session` or still shows the pre-restart value (codex keeps the old id until its first exchange), and `none` for `stopped`/`untouched` lines so the door appends only restarted entries with a real session. Exit codes, ordering, refusal and stop behavior unchanged.
- **D5 Seat records (SKILL.md Open).** The restart paragraph's "appended when `herdr agent list` shows its new session" becomes "appended from the `restarted` line's `session` when it is not `none`, and never with a null session". The seat-record paragraph's append rule becomes "the door appends a seat entry from the `session` field of each exchange step's outcome lines and each `restarted` restart line when it shows a session it has not recorded for that seat" — no separate `herdr agent list` read for seat records. `herdr agent list` remains in text only where it does other work (peer-ask seeding inside the script, `paneListed` polling inside peer-restart). The rest of the seat-record paragraph (open time, spans, outside-herdr behavior) is unchanged.
- **D6 Fake fixture support (tests/fake-herdr.ts).** `agent start` gains a per-call `startScript`-style override or a pane seed `startSession`/`staleSession` so a test can produce a start that leaves `agent_session` absent or unchanged (`none` cases). `agent wait`'s `session` entry already sets `agent_session` mid-wait (exists today). No other fixture behavior changes.
- **D7 Test changes (planner-committed, red before product).** `tests/peer-wait.test.ts`: `expectOutcome` gains `session` in the expected object; every existing expectation supplies the session the fake reports at end state (seeds carry it through; `dropAgent` case errors before the final read). New test: outcome `session` is the post-exchange value when it changed during the wait (`exchange.session` stays the prompt-time value → also covers a fresh codex session appearing after the prompt when seeded `session: null`). `tests/peer-ask.test.ts`: outcome expectations gain `session`; new test asserts an outcome line whose `session` is a session set only during the wait. `tests/peer-restart.test.ts`: `SeatLine` type and all seat-line assertions gain `session`; the happy path asserts the fake's post-start `session-<serial>`; new test asserts `session: 'none'` when start leaves the pre-restart session. Each changed test file's commit carries a `Test-Change: <path> <source and reason>` trailer.
- **D8 Live runs (criteria 1–4).** Two autopilot door runs, side by side, same handed item and same seat lineup (A claude, B codex, C pi) with identical argv per seat kind and fresh agent sessions started by herdr at each run's start. Each run: own workspace tab with an A pane plus B/C peer panes (created by the operator-side harness via `herdr pane split` + `herdr agent start`, or the door's own `peer-create.ts` open flow — same outcome either way), own scratch git repo with `issues/config.yaml` so `akrogon` registers it (registered in a per-run `AKROGON_HOME` `config.yaml` so the two runs' `akrogon config` see only their own scratch repo and never touch the real `repos`), own chart folder and USAGE.md. Base run's door pane starts claude with `chart-issues` content at the branch's merge-base read (release checkout or an exported copy of that revision); branch run's door pane starts with `skills/chart-issues/` from the worktree's committed HEAD. Door prompts are the same operator words (autopilot on, handed item, use B and C consultants) given verbatim per run. The handed item is a single small chartable item whose expected chart is one leaf handoff (e.g. a tiny doc/test edit in the scratch repo); the same item is handed to both runs.
- **D9 Run report (`implementation/report.md`, extended or a named sibling artifact).** Records per run: the three harness `--version` outputs, seat argv, `chart-usage.ts` summary + per-seat `calls`/`average context per call`/token lines, totals computed as Σ seats (calls × average context), the two doors' model-call tallies for each exchange step (counted over the A transcript's assistant tool calls: base = `herdr agent wait` calls + `peer-ask.ts` call + any `herdr agent list` seat-record call; branch = one chained call per exchange, reruns itemized), consultants' read calls on each run (assistant tool calls whose target is process text — pi `toolName: 'read'`, claude `Read`, codex shell calls reading files — counted over each consultant session transcript and itemized by path), base-run call counts for the same steps, and the restart/exchange seat-record provenance (which printed line each `seats.yaml` seat entry came from).
- **D10 Timeout exchange (criterion 5).** Outside both measured runs: one peer pane held `working` (a `sleep` or a busy real agent) and one idle peer. The chained call `herdr agent wait <busy> --timeout <short> && herdr agent wait <idle> --timeout <T> && bun peer-ask.ts …` exits non-zero, prints no outcome lines and sends no prompt (visible on the peers' panes and by the absence of prompt output). Rerunning the identical chain after the peer goes idle prompts each peer once and prints each outcome line. Run through `akrogon run-check` for the kept log; targets are the seat's own created herdr panes, torn down after.
- **D11 Skill text placement of sizes.** D2's timeout arithmetic stays a skill-text rule (the brief's (A,B) wording), not a script change; peer-ask's 5-second prompt timeouts are already sequential inside its own call.
- **D12 No changes** to `peer-ask.ts` prompting/waiting logic, `chart-usage.ts`, `peer-create.ts`, `direct-guards.ts`, herdr, harness argv templates, SKILL.md's post-compaction instruction, door-reset (owned by leaf door-reset), rebuttal session type. No new env vars (`env_names: []`); `akrogon status` shows no `Missing:` lines — no credential blockers.

## Interfaces

- `peer-wait.ts` outcome line: `{outcome, pane, file, status, signal, exchange, session}` — `session` added (string or null). Consumers: door prose in questions.md (rerun copies `exchange` verbatim — unaffected), A's seat-record append (SKILL.md D5).
- `peer-restart.ts` seat line: `{seat, pane, kind, state, session}` — `session` added (string or `'none'`).
- `tests/fake-herdr.ts`: `agent start` override for absent/unchanged post-start `agent_session` (D6).

## Waves

### Wave 1

**U1 — skill text (reading rule, chain rule, seat-record rule).** Owns `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, plus the `docs/guide/chart.md` consultant paragraph if the sweep shows it contradicts the new contract. Covers D1, D2, D5 and the prose sweep. Shared test resource: none. Prerequisite: none.

**U2 — session receipts.** Owns `skills/chart-issues/scripts/peer-wait.ts`, `skills/chart-issues/scripts/peer-restart.ts`, `tests/fake-herdr.ts`, `tests/peer-wait.test.ts`, `tests/peer-ask.test.ts`, `tests/peer-restart.test.ts`. Covers D3, D4, D6, D7 implementation (the planner's test commit is already on the branch). Shared test resource: none. Prerequisite: none.

U1 and U2 share one wave: disjoint paths, no shared test resource, no dependency.

### Wave 2

**U3 — live runs, timeout exchange, report.** Owns the run artifacts under `implementation/` (report, retained logs) and nothing in the repo tree. Covers D8–D10 and criteria 1–5 evidence. Shared test resource: the live operator herdr instance and host panes (the only resource of its kind, so this unit cannot parallelize with anything herdr-touching). Prerequisite: U1 + U2 landed — both runs must exercise the final branch text and scripts ("final evidence is valid at the final commit", brief live-run repair scope).

Wave 2 is the leaf's slow run; in-branch fixes found during it stay inside the locked decisions, add no feature, get a fail-first test in the owning code's tests, and rerun both measured runs when skill text or scripts changed (brief live-run repair scope).

## File/criterion checklist

- `skills/chart-issues/assets/questions.md` — reading rule (D1), chained-wait rule (D2). Criterion 3, part of 2.
- `skills/chart-issues/SKILL.md` — restart sentence and seat-record append rule (D5). Criterion 2.
- `skills/chart-issues/scripts/peer-wait.ts` — post-exchange `session` on every outcome line (D3). Criterion 6.
- `skills/chart-issues/scripts/peer-restart.ts` — post-start `session`/`none` on seat lines (D4). Criterion 6.
- `tests/fake-herdr.ts`, `tests/peer-wait.test.ts`, `tests/peer-ask.test.ts`, `tests/peer-restart.test.ts` — D6/D7.
- `docs/guide/chart.md` — checked by sweep; edited only if its peer-exchange/restart prose contradicts D1/D2/D5.
- `implementation/report.md` + retained run evidence — criteria 1–5 report (D9).
- Agent docs: none affected (no AGENTS.md/README documents these mechanics). Human docs: the three files above.

## Done-criteria → proof

| # | Criterion | Proof command | Boundary / what it catches | Size | Rerun trigger |
|---|-----------|---------------|-----------------------------|------|---------------|
| 6a | Every peer-wait outcome line carries the post-exchange `session`; `exchange` and exit codes unchanged; fresh codex session appearing after the prompt is printed | `akrogon run-check --name peer-wait -- bun test tests/peer-wait.test.ts` | Script ↔ fake-herdr; catches missing/stale `session`, `exchange` drift, changed outcomes/signals | seconds | peer-wait.ts, fake-herdr.ts, its test |
| 6b | peer-ask outcome lines carry `session` unchanged from peer-wait | `akrogon run-check --name peer-ask -- bun test tests/peer-ask.test.ts` | peer-ask ↔ peer-wait passthrough; catches dropped/renamed field | seconds | peer-ask.ts, peer-wait.ts, its test |
| 6c | peer-restart prints each `restarted` seat's new session, `none` when herdr shows none or the pre-restart one | `akrogon run-check --name peer-restart -- bun test tests/peer-restart.test.ts` | Script ↔ fake-herdr; catches missing field, pre-restart session printed as new, sessions on non-restarted lines | seconds | peer-restart.ts, fake-herdr.ts, its test |
| 1 | Both live runs complete one handed item under autopilot; branch's Σ seats (calls × avg context) from `chart-usage.ts` < base's | `bun <worktree>/skills/chart-issues/scripts/chart-usage.ts <run>/chart-folder` per run + report tally `Σ calls×avg` compared across USAGE.md files; kept via `akrogon run-check --name live-usage` | Real doors on real harnesses; catches a spend regression the fake cannot see; live output USAGE.md per run | hours | any skill text, script or seat config change after the runs start (rerun both measured runs per brief repair scope) |
| 2 | Branch run: each exchange step whose returns land within the first peer-ask budget costs A one tool call wait-to-collected; no separate `herdr agent list` seat-record call; base run's counts named | transcript tally over each A session file (temporary counting script, method in D9) recorded in report; kept via `akrogon run-check --name a-call-tally -- bun <count-script> <a-session-paths>` | A-side call structure; catches a split chain, a leftover roster read, a missed exchange step | minutes | rerun on final run transcripts |
| 3 | Branch consultants read process text by section and never re-read unchanged held content; consultant read calls shown on both runs | transcript tally of consultant read calls by path on both runs (same counting script family) recorded in report; kept via `akrogon run-check --name consultant-read-tally` | B/C session tool calls; catches whole-file reads of unchanged held content and re-reads | minutes | rerun on final run transcripts |
| 4 | Thinking-reviewer parity: independent findings, dissent, rebuttal disagreements, late corrections, complete chart records, same operator-facing output shape | the reviewer's comparison of the two chart folders, rebuttal files and run logs (no command; evidence is the two runs' records cited in report and review) | Content parity between runs; catches a dropped blind take or changed operator surface | minutes | any rerun of the measured runs |
| 5 | Busy peer's wait timeout: no peer prompted, chained call exits non-zero, rerun prompts each peer once | `akrogon run-check --name chain-timeout -- sh -c '<chained wait && peer-ask call; observe non-zero and no outcome lines; rerun chain; observe one prompt per peer + outcome lines>'` | Live herdr chained semantics; catches prompt-before-waits, a prompt reaching the busy peer, double-prompting on rerun | minutes | rerun on any peer-ask/skill-text change |

No `merge_checks` configured and the brief names none — none added. Configured `checks` (format/test/typecheck) stay the regression gate via `akrogon verify`.

## Risks and notes

- **R1** Post-exchange `session` for a busy peer whose `agent_session` vanished mid-wait: `finish` prints `session: null`; the door records nothing for that line — consistent with "never with a null session".
- **R2** peer-restart's extra `agent list` is inside the script, so the door's call count does not change; the design's saved call is A's separate roster read, not the script's internal read.
- **R3** `session` equality for codex compares ids only; herdr's pre-restart id surviving until first exchange is exactly the `none` case the design names.
- **R4** Base-run parity depends on identical seat argv/models/efforts and fresh sessions; the report records versions and argv so drift is visible rather than hidden.
- **R5** A consultant answering `budget`/`failure` on either run does not invalidate the run; spend and call structure are still measured, and the report marks the step separately.
- **R6** `peer-ask.ts` needs no edit: its outcome lines are peer-wait's stdout passed through; the codex boundary seed and prompt flow are untouched.
- **R7** Scratch repos and per-run `AKROGON_HOME` keep both runs out of the operator's real `config.yaml`/`repos`; cleanup removes the created workspaces/panes, scratch repos and AKROGON_HOME dirs at the end.

## Planned red

New criterion-6 tests are added to the three existing test files plus the fake-herdr support (D6/D7), committed as `a0d9a19` on this branch before any product code with `Test-Change` trailers per changed file. Each new test asserts the new `session` contract and fails on the unmodified scripts because the field is absent; updated expectations in existing tests fail the same way.

Observed red (plan.synthesis), each through `akrogon run-check`:

- `check peer-wait-red: 1` — 30 of 37 tests fail on `toEqual` missing the `session` key (the two new cases included); the 7 error-path tests pass unchanged.
- `check peer-ask-red: 1` — 4 of 8 fail: the new session-during-wait case and the three outcome assertions all miss `session`.
- `check peer-restart-red: 1` — all 9 fail on `session`/`'none'` expectations absent from emitted lines.

Logs under `implementation/check-*-red-*.log` in the leaf folder.
