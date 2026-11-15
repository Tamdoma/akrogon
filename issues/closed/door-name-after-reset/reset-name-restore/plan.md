# Plan: reset-name-restore

Slot A synthesis, 2026-11-14, base d44920b8. Sources: brief.md, design.md (signposts `1b 2a 3a 4a 5a 6a 7a`, name-restore `1a 2a 3a` + adopted C correction), readiness.yaml proofs. No brief/design conflict. No credentials: design names none and `akrogon status` shows no `Missing:` lines. No grants, no paid or live operation anywhere in this leaf: claude's real behavior was proven at charting (readiness.yaml) and every leaf proof runs the stand-in.

## Read-first

- `skills/chart-issues/scripts/door-reset.ts` — the helper being extended; its stages, `step`/`stop` logging, `send`/`waitFor`/`transcriptRecords` usage.
- `tests/door-reset.test.ts` — the leaf's only proof surface; `STAGES`, `inputs`, `turnOf`, `logged`, `reset`, `exited` helpers to reuse.
- `tests/door-agent.ts` — the claude/codex/pi/agy stand-in; gets `/rename` handling and name carry on `/clear` (fixture work, committed with the tests).
- `src/hc.ts` — `send` (`{started, status, turn}`), `waitFor` (starts from a snapshot, so a wait on idle alone can return on the pre-rename state), `docGet` (tabs as `{id, name, terminals}`), `repoSpace` result shape.
- `src/transcript.ts` — `transcriptRecords(pre, from)`, `TranscriptRecord`.
- `skills/chart-issues/assets/handover.md` — the doc the stage is described in.
- `tests/hc-fixture.ts` — `HcCore.rpc` (`doc.get`/`doc.set`), `recordedDoc` (repo space ships `tabs: []`; each test writes its own tab).
- `issues/chart/door-name-after-reset/forks/name-restore.md` — probes P3–P7 the decisions rest on.

## Decisions

- **D1 (answers open Q1, the name source).** After `input-check` logs `none` and only when `kind === 'claude'`, the helper parses `transcriptRecords(pre, 0)` values with `z.object({type: z.literal('custom-title'), customTitle: z.string()})` and keeps the `customTitle` of the last matching record. A last match whose `customTitle` is blank counts as no name of its own (locked C correction); earlier records are not consulted. Design says "the pre-reset transcript"; this plan reads the whole file (offset 0). A name read only past the boundary would be a record written after the helper started — not the session's own name — and the kept test appends its titles before `reset()` so such a read fails it.
- **D2 (answers open Q2/Q3, send then wait).** With no name of its own, the helper calls `docGet(session)` once, at that moment, and takes `space.tabs.find(t => t.terminals.includes(a))?.name`, where `space` is `space.space` of the already-resolved `SpaceResolution`. A found name that is not blank (`trim() !== ''`) and holds no control character is sent verbatim as `/rename ${name}` through `send(session, a, ...)`; `sent.started === false` gets one `keys` `enter`, as the start prompt does. The helper then waits `waitFor(session, a, t => gone(t) || (idle(t) && t.turn > sent.turn), env.DOOR_RESET_TURN_BOUND_MS)`: the turn count must pass the one the send answered (`send` answers the terminal's counter before the turn completes — charting saw answer 1, done at 2), and `idle` alone cannot suffice because `waitFor`'s opening snapshot still shows the pre-rename state. `null` → `stop('name', 'turn open')`; `gone` → `stop('name', 'identity changed')`; reached → `step('name', 'sent', {name})` and the reset keys run as today.
- **D3 (bound).** The rename wait reuses `DOOR_RESET_TURN_BOUND_MS` (default 600_000): a rename is a turn like any other, the turn-end wait already uses it, and the "still open at the bound" semantics are identical. No new env knob.
- **D4 (log line).** One `name` line per handover, between `input-check` and `reset-keys`: `{step:'name', result:'kept', name}`, `{step:'name', result:'sent', name}`, `{step:'name', result:'skipped', reason}`, and the stop results `turn open` / `identity changed`. The three skip reasons, verbatim strings also used in handover.md: `harness is not claude`, `no tab lists A or its name is blank`, `name holds a control character or line break`.
- **D5 (control characters).** `/[\x00-\x1f\x7f-\x9f]/` on the candidate name — covers line breaks, tabs and C0/C1 controls, the class `hc send` could deliver verbatim into claude's command line. Check order: harness → own name (kept) → tab lookup → blank → control → send.
- **D6 (thrown errors).** The name stage catches nothing (locked C correction): a throw from the record parse, `docGet`, `send`, `keys` or `waitFor` lands in the log via the launch wrapper's `2>&1`, the process exits non-zero and nothing more is typed — today's failing path.
- **D7 (stand-in).** claude stand-in gains: a `renameTurn(input)` branch for `input.startsWith('/rename ')` (checked before `input === resetLine`), writing `{type:'custom-title',customTitle:<name>}` and `{type:'agent-name',agentName:<name>}` records to the current transcript, storing the name, running as an ordinary self-ending turn (`busy` up, `status('working')`/`status('idle')`, `turnEnd` line), with a `/rename hold…` name holding on `<out>/release` exactly as `hold` first tasks do. On `/clear` in `switch` mode the new transcript's first record is `custom-title` carrying the stored name. No stored name → no record (the kept case leaves nothing to carry).
- **D8 (test-side tab).** A new `addTab(run, name)` in the test file does `core.rpc('doc.get'…)`, sets `spaces.find(s => s.id === <repo space id>).tabs` to one tab `{id, name, type:'row', root:{children:[{content:{terminal:run.a}}]}}` via `core.rpc('doc.set', {name:'herdr-app', value, version})` — the same doc calls the helper's `docGet` then reads. Blank-name and control-name cases pass `''` / `'Tab\tName'`.
- **D9 (waves).** Serial-solo: the wave math leaves one unit per wave (see checklist) — implement A runs the plan itself, no workers.

Condition check per decision before criterion tests: the conditions each decision can reachably break, the case that fails on the violation, and the recorded red (below beside each criterion). `waitFor`'s snapshot return is the one non-obvious break path — covered by D2's `t.turn > sent.turn` term and its break run.

## Checklist

Fixture work committed with the tests (plan pass): `tests/door-agent.ts` (D7), `tests/door-reset.test.ts` (new tests + `addTab` + `STAGES` + `Step`/`stepSchema` `name`/`reason` fields + cancel-test tab setup).

Implementation waves (corrected 2026-11-14 at implement open: the earlier three-unit split contradicted D9's serial-solo call for no gain; the doc edits belong to the same change):

- **Wave 1, U1** — `skills/chart-issues/scripts/door-reset.ts` (the `name` stage per D1–D6 and the header comment's stage description), `skills/chart-issues/assets/handover.md` (the stage description and limits per criterion 6), `tests/AREA.md` (one line noting the stand-in's `/rename` turn and name carry). Prerequisite: the committed tests at 790e1050.

Docs touched: `skills/chart-issues/assets/handover.md` (stage description and limits), `tests/AREA.md` (stand-in line). No other agent or human doc names these internals — `skills/chart-issues/SKILL.md` links handover.md without enumerating stages; `src/AREA.md` unaffected.

## Done-criteria → proofs

Runner for every criterion: `bun test --timeout=60000 tests/door-reset.test.ts` (the configured `test` shape narrowed to the leaf's file; the file's own helpers keep logs). Plan runs go through `akrogon run-check`; implement-end proofs rerun the same command.

### C1 — claude door with its own name: no rename, reset and start prompt as today, `name` line `kept` with the last name.

- Test: `claude: a session with its own name logs name kept and sends no rename` — appends two `custom-title` records to the pre transcript before `reset()`, asserts `name: {result:'kept', name:'c-Last Name_2'}`, inputs `['hold first task','/clear',start]` (no `/rename`), all post-task inputs not busy, fresh transcript ≠ pre.
- Observation: helper on the real hc test core; before state = transcript holding `first-name`/`c-Last Name_2` titles; after = kept log + unchanged input sequence. Product failure caught: a helper that renames a named session or logs the wrong record.
- Command: `akrogon run-check --name c1-kept -- bun test --timeout=60000 -t 'own name logs name kept' tests/door-reset.test.ts`. Size: seconds. Rerun trigger: any change to the name stage or stand-in.
- Condition checks: (a) wrong record read — the case itself fails if any but the last title is logged (red run recorded below); (b) rename sent despite an own name — same test asserts no `/rename` input (red run recorded below); (c) own name read only from past the boundary — titles appended pre-launch fail under a boundary-offset read (traced: D1's offset-0 read is the decision under test; the case catches it).

### C2 — no own name in a named tab: `/rename <tab name>` sent, reset only after the rename turn ends, new transcript carries the name exactly, `name` line `sent`.

- Test: `claude: a session with no name in a named tab gets the tab name sent and the reset waits for the rename turn` — appends a blank `custom-title` (blank counts as none), `addTab(run,'C Tab_4')` (capital, space, `_`), asserts `name: {result:'sent', name:'C Tab_4'}`, inputs `[task, '/rename C Tab_4', '/clear', start]`, the `/clear` input follows the rename's `turnEnd` in `inputs.jsonl` and is not busy, and the fresh transcript's first record is `custom-title` `C Tab_4`.
- Observation: the inputs ledger and the fresh transcript are the real consumers — the log line alone is not the proof. Product failure caught: reset typed into an open rename turn (the glue case), wrong or missing rename, name lost across `/clear`.
- Command: `akrogon run-check --name c2-sent -- bun test --timeout=60000 -t 'no name in a named tab' tests/door-reset.test.ts`. Size: seconds. Rerun trigger: any change to the name stage, the wait, or the stand-in.
- Condition checks: (a) reset before the rename turn ends — the `turnEnd`-before-`/clear` plus `busy:false` assertions; deliberate-break run B records it red; (b) blank `customTitle` treated as a name (would log `kept`) — the case itself fails; (c) `waitFor` returning on the pre-rename snapshot — same assertions, run B.

### C3 — skips: non-claude harness, no tab or blank tab name, control character in the name — handover completes, `skipped` with the reason, no rename input.

- Tests: (a) the existing stage-order `test.each` now asserts the `name` step — `claude`: `skipped`/`no tab lists A or its name is blank` (fixture doc ships no tabs); `codex|pi|agy`: `skipped`/`harness is not claude`; (b) `test.each` two new cases, `addTab` with `''` and `'Tab\tName'`, asserting `skipped` + reason and inputs `[task,'/clear',start]`; (c) `noswitch` test asserts the same `name` skip step.
- Observation: log reason verbatim + input sequence on the real core. Product failure caught: a skip that still renames, a wrong reason, a handover aborted by a skip.
- Command: `akrogon run-check --name c3-skips -- bun test --timeout=60000 -t 'name stage logs skipped' tests/door-reset.test.ts` plus the stage-order and noswitch runs under the criterion-1 file command. Size: seconds each.
- Condition checks: (a) blank tab name renamed — the `''` case; (b) control-character name sent — the `\t` case; (c) non-claude reading the tab or sending — stage-order asserts inputs stay `[task, reset, start]` per kind; (d) `docGet` throwing on a kept session — traced: D5 check order reads the tab only when the own name is absent, so kept never calls it.

### C4 — rename turn still open at the bound: no reset and no start prompt typed, stop logged, exit non-zero.

- Test: `claude: a rename turn still open at the bound stops the helper before the reset` — tab `hold Door`, `DOOR_RESET_TURN_BOUND_MS=3000`; asserts log ends `['started','wait-turn-end','input-check','name: turn open']`, inputs `[task, '/rename hold Door']`, terminal finished (`--rm` gone-or-finished is the observable non-zero proxy today's `turn open` test already uses).
- Observation: helper log + inputs ledger. Product failure caught: reset typed into the held rename turn; a helper that hangs past its bound.
- Command: `akrogon run-check --name c4-bound -- bun test --timeout=60000 -t 'still open at the bound' tests/door-reset.test.ts`. Size: seconds.
- Condition checks: bound ignored or `waitFor` replaced with a fixed sleep — the case fails red at the bound; `send`'s answered turn compared against the wrong baseline (`t.turn >= sent.turn` would return on the snapshot) — same red.

### C5 — operator input after the helper started cancels: neither rename nor reset sent.

- Test: extends the existing cancel test — `addTab(run,'c-akrogon')` before `reset()`, so the unnamed claude would rename if the stage ran before or despite `input-check`; asserts the log stops at `input-check: superseded` and inputs hold only `['hold first task']`.
- Observation: unchanged boundary (transcript records past the helper's boundary), one new fixture input (the tab). Product failure caught: rename sent despite a superseding operator input — the new clause the old test did not cover.
- Command: `akrogon run-check --name c5-cancel -- bun test --timeout=60000 -t 'cancels the reset' tests/door-reset.test.ts`. Size: seconds. Green on the unmodified base by design (cancel precedes the new stage); its value is the post-feature clause — traced, no violation can exist at planning, so no red is owed.
- Condition check: name stage ordered before `input-check` — break run D sends the rename despite the operator record and the test goes red.

### C6 — handover.md states the stage, source order, no storage, the three skip reasons, the bound stop, thrown-error ending, claude-only.

- Proof: the committed `handover.md` diff reviewed against those seven statements; `git diff d44920b8...HEAD -- skills/chart-issues/assets/handover.md` produces the artifact, the judgment is human/review (prose is not mechanically provable). Size: seconds. Rerun trigger: any edit to that section.
- Condition checks: none reachable by code — covered by review.

## Plan-run record

Tests committed at 790e1050 red-first for the missing behavior. Condition reds were produced by a temporary full implementation of the stage plus one violating edit each, then `git checkout` restored the script to base (fixture files stay committed).

- `check c2-break-nowait: 1 implementation/check-c2-break-nowait-1794651660303-2780446.log` — stage present, rename wait removed: C2's ordering assertion fails red (`turnEnd` never lands between `/rename` and `/clear`). Guards C2 condition (a)/(c).
- `check c1-break-ownname: 1 implementation/check-c1-break-ownname-1794651670150-2789109.log` — own-name branch disabled: C1 fails red (`skipped` instead of `kept`, and a rename would be sent when a tab existed). Guards C1 conditions (a)/(b).
- `check c5-break-order: 1 implementation/check-c5-break-order-1794651676491-2790621.log` — name stage moved before `input-check`: the cancel test fails red (`/rename` sent despite the superseding record). Guards the C5 condition.
- `check c4-bound-base: 1 implementation/check-c4-bound-base-1794651758916-2800631.log` — C4 red on base for missing behavior.
- `check c-suite-base2: 1 implementation/check-c-suite-base2-1794651771646-2802230.log` — full file on base: 11 red / 5 green, every red inside the intended set (stage-order rows ×4, label-transcript test and noswitch test on the STAGES update, kept, sent, two skipped-name cases, bound stop). No red outside the leaf's new expectations.
- `check tsc-prepass: 2 implementation/check-tsc-prepass-1794651646980-2777761.log` — plan-pass typecheck aid during the temp implementation; not a criterion proof. `bun run typecheck` is clean on the committed test files.

The C3 skip cases have no separate violation run: on base they fail for missing behavior, and each skip reason is a single `if` the case names directly (blank tab name → `''` case, control char → `\t` case, non-claude → stage-order rows). C5's green-on-base is by design and recorded at C5.

## Operator blockers

None. No grant, no env value, no live session, no paid call is needed by plan or implementation.
