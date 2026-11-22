# Plan: consultant-seat

Slot A plan synthesis, 2026-11-21. Sources: `brief.md` (done-criteria 1-5), `design.md`
(fix-and-config items 6-7 verbatim under `## Taken`, leaf architecture, exclusions), chart
proofs P1-P3 (`issues/chart/watch-consultants/forks/fix-and-config.md`, `readiness.yaml
proofs`), live surfaces below. `readiness.yaml grants: []`, `env_names: []` — no grant or
credential blocker; every proof is a free `bun test` run.

Open-for-the-plan items from the design are settled at D1 (`globalSchema.slots` readers) and
D5 (`startConsultant` naming). Consult-loop and fix-and-config open items outside items 6-7 are
excluded to leaf watch-consults / failed-merge-resume per `## Exclusions`.

## Read-first paths

- `src/config.ts` — `globalSchema.slots` (strict a/b today), `superRefine` harness check,
  `indexSchema`, `repoSchema`, `indexSeats`, `seats()`, `effectiveConfig`.
- `src/akrogon.ts` — `case 'seat'`: positional branch first, then `HC_TERMINAL_ID`, letter and
  recipe parsing, `requireRepo`, `repoSpace`, `startConsultant`.
- `src/seat.ts` — `startConsultant` (launch under caller, labels, tab pick, `firstTask`,
  `agyTask`, `announce`), `harnessArgv`, `startSeat`.
- `src/hc.ts` — `consultantName`, `seatName`, `run` (parent/outlive → `--parent`/`--outlive-parent`),
  `docGet`, `repoSpace`.
- `src/usage.ts` — `VERB_OPTIONS.seat`, `verbFlags`, `helpText`.
- `tests/helpers.ts` — `fixture`, `cli`, `yaml`, `leafTempRoot`; `tests/hc-fixture.ts` —
  `hcCore`, `setSeat`, `Terminal`, `tasks`, `shortStartProof`; `tests/stand-in.sh` — harness
  modes incl. `trust`; `tests/hc-shim.sh` — the run-line log.
- `tests/config.test.ts` — machine/repo/index slot refusals; `tests/door-exchange.test.ts` —
  `seat --slot` under a real core; `tests/hc-start.test.ts`, `tests/cli-help.test.ts`,
  `tests/command-reference.test.ts` — the unchanged-behavior set (criterion 5).
- `docs/reference/commands.md` seat row (held to `contracts.seat`); `docs/reference/config.md`
  `slots` row and machine example.
- `learnings/LESSONS.md` — no lesson bears on this leaf.

## Decisions

- D1 — `globalSchema.slots` gains optional `consultant: slotConfigSchema.optional()`. The
  `superRefine` harness check covers `a`, `b` and `consultant`; a consultant harness missing
  from `harnesses:` adds an issue with `path: ['slots', 'consultant']` so the refusal names the
  key. `repoSchema.slots`, `indexSchema` and `indexSeats` stay exactly a/b (criterion 2).
  Open-for-the-plan settled: every reader of `global.slots` is enumerated — `seats()`
  (config.ts, reads `.a`/`.b`), `effectiveConfig` (config.ts, spreads then overwrites
  `slots`), `init.ts` (writes it back whole), `src/next.ts:755`, `src/seat.ts:262`,
  `src/status.ts:94,776,565` (all through `seats()`). None iterates the keys, so a `consultant`
  key can never be treated as a leaf seat; the key's placement under `slots:` holds
  (fix-and-config item 6).
- D2 — `effectiveConfig` keeps the recipe in the printed `slots`: `slots:` becomes
  `{ ...(global.slots.consultant === undefined ? {} : { consultant: global.slots.consultant }),
  a: resolved.a, b: resolved.b }` inside a repo, and `global.slots` outside one. The printed
  object never carries `source` (existing test asserts it).
- D3 — `src/usage.ts` `VERB_OPTIONS.seat` gains `watch-consultant: { type: 'boolean' }`; strict
  parsing accepts only that spelling.
- D4 — `src/hc.ts` gains `watchConsultName(prefix): \`${prefix}-watch-consult\`` beside
  `consultantName`. No length folding: the name is `prefix` (2 chars) + 13 fixed chars.
- D5 — `src/seat.ts`: the shared launch moves to a private `launch(global, repo, space, caller,
  spec, task)` where `spec = { name, labels }` holds the akrogon labels (`herdr.*` labels are
  derived from the caller's tab inside `launch`). `startConsultant` keeps its signature and
  delegates with `consultantName(prefix, letter)` / `akrogon.seat: letter`. New
  `startWatchConsult(global, repo, space, caller, recipe, task)` delegates with
  `watchConsultName(prefix)` and labels `akrogon: '1'`, `akrogon.repo`, `akrogon.watch-consult:
  repo.name` — never `akrogon.leaf`, never `akrogon.seat`. No copy of the launch or proof
  logic; the `agy` trust path (`agyTask`, `firstTask`, `announce`) is shared.
- D6 — `src/akrogon.ts` `seat` case order for `--watch-consultant`: (1) positional args →
  refused naming the conflict; (2) `--slot`, `--harness`, `--model`, `--effort` set → refused
  naming the conflict and the flag; (3) `HC_TERMINAL_ID` empty/unset → refused naming the
  conflict (outside an hc terminal); (4) `readGlobal()`, `global.slots.consultant` missing →
  exit non-zero naming `slots.consultant` in `<resolved globalHome>/config.yaml`; (5)
  `requireRepo`, `repoSpace`, `startWatchConsult` with the recipe and optional `--task`;
  `outcome === 'failed'` → exit 1. Refusals happen before any `hc` call, so a refused
  invocation provably starts nothing; the recipe check precedes `repoSpace` for the same
  reason. `--slot` form unchanged.
- D7 — `docs/reference/commands.md` seat row gains `\| --watch-consultant [--task <text>]` as a
  third alternative and one sentence for the recipe source and name;
  `tests/command-reference.test.ts` `contracts.seat` gains the same alternative verbatim.
  `docs/reference/config.md`: the `slots` row states `a` and `b` are required seats and
  `consultant` is an optional recipe of the same shape read only from the machine file, whose
  harness must be in `harnesses:`; the machine example gains a commented-or-shown
  `consultant` line; the `slots front matter` section states `consultant` is refused there.
- D8 — `--task` stays optional on `--watch-consultant` (D5 shares `startConsultant`'s
  task-or-address contract). Criterion 3 tests use `--task` only; a task-less call printing
  the address is shared-launch behavior, not separately cased.
- D9 — hc's live-name uniqueness enforces one watch consultant per prefix per session; no
  akrogon-side check (proof: hc `name_taken` refusal, `readiness.yaml` proofs).
- D10 — Test placement: new file `tests/watch-consult.test.ts` for criteria 3-4 (real-core
  `hcCore` + `cli`); new `describe`-level tests appended to `tests/config.test.ts` for
  criteria 1-2 (no core needed). `tests/command-reference.test.ts` is a contract file, edited
  under D7, committed with the tests.

## Waves

Wave 1 — two units, disjoint owned paths:

- U1 `src/config.ts`, `tests/config.test.ts` — D1, D2 (criteria 1, 2 and the config half that
  U2's fixture needs).
- U2 docs + contract — `docs/reference/commands.md`, `docs/reference/config.md`,
  `tests/command-reference.test.ts` (D7). Shares no owned path with U1; its contract text is
  fixed by D7 independent of code order.

Wave 2 — one unit (its tests load a fixture config holding `slots.consultant`, which needs
U1's schema landed; the code paths it exercises are disjoint from U1's but the test harness
depends on them):

- U3 `src/usage.ts`, `src/hc.ts`, `src/seat.ts`, `src/akrogon.ts`,
  `tests/watch-consult.test.ts` — D3-D6, D8, D9 (criteria 3, 4).

Not serial-solo: wave 1 holds 2 units → worker dispatch per implement-issue.

Shared test resource: U3's real `hcCore` throwaway session and the stand-in harnesses
(`fake`, `agy` in `trust` mode) under `tests/stand-in.sh`. No other wave touches hc cores.

Docs affected (one line each): `docs/reference/commands.md` (U2), `docs/reference/config.md`
(U2). Agent docs: `skills/chart-issues/SKILL.md` unchanged (the `--slot` form it cites is
unchanged); `skills/watch-issues/` is the watch-consults leaf's scope, not this leaf's. No
other doc is affected.

## Criterion → proof map

| # | Observation (boundary, before → after, failure caught) | Command | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | `akrogon config` on a fixture home: `slots.consultant {harness: fake}` → exit 0, parsed stdout shows `slots.consultant` (inside repo and outside). Harness not in `harnesses:`, missing `model`/`effort`, blank `model`/`effort` → exit non-zero, stderr names the key. Catches: strict-schema drop of the key, dropped print in `effectiveConfig`, missing superRefine arm. | `akrogon run-check --name plan-criteria -- bun test --timeout=30000 tests/config.test.ts` | ~15 s | src/config.ts slots/print paths |
| 2 | `slots.consultant` in `issues/config.yaml` → `akrogon config` non-zero naming `consultant`; `slots.consultant` in `ISSUE.md` front matter → `seats()` throws `SeatIndexError` naming the file and `consultant`. Catches: the key leaking into repo/index slot schemas. | same command | ~15 s | repoSchema, indexSchema |
| 3 | Real `hcCore`, caller terminal `<prefix>-wc-door` via `hc run`: `akrogon seat --watch-consultant --task <t>` → exit 0, one live terminal named `<prefix>-watch-consult`, parent = door, labels `akrogon=1`, `akrogon.repo=<repo>`, `akrogon.watch-consult=<repo>`, no `akrogon.leaf`, shim `run` line shows `--parent <door>` without `--outlive-parent`, `core.tasks` = `[<t>]` (argv) and `['ENTER', <t>]` for the agy-trust recipe (task by send after the trust dialog). stdout prints the address. Catches: wrong name, `--slot`-label reuse, missing task delivery, outlive regression. | `akrogon run-check --name plan-criteria-hc -- bun test --timeout=30000 tests/watch-consult.test.ts` | ~1-2 min | akrogon.ts seat case, seat.ts launch |
| 4 | No recipe: `--watch-consultant --task <t>` under the caller → non-zero naming `slots.consultant` and `config.yaml`, `core.terminals({akrogon:'1'})` stays empty. Recipe set: `+<slug> A` positional, `+--slot`, `+--harness`, `+--model`, `+--effort`, and `HC_TERMINAL_ID` unset each exit non-zero naming the conflict; terminals still empty (refusal precedes any hc call). Catches: fallthrough into `startConsultant` letter parsing, recipe read after launch, missing terminal guard. | same command | ~1-2 min | seat case refusal order |
| 5 | `akrogon seat --slot` consultants under a real core start, deliver and label as before; the leaf-seat `seat <slug> A` suite, `--help`/unknown-flag behavior and the docs contract stay green with no test edits. | `akrogon run-check --name plan-regress-a -- bun test --timeout=30000 tests/door-exchange.test.ts tests/hc-start.test.ts` and `--name plan-regress-b -- bun test --timeout=30000 tests/cli-help.test.ts tests/command-reference.test.ts tests/seat.test.ts` | ~3 min | seat.ts shared launch, usage.ts |

Model-choice readings: none — no criterion decides a model's choice or binds model text.

## Breakable-condition cases

Each condition a decision can reachably break gets a case at the boundary where the decision's
state lives (the CLI process / the hc core), plus its plan-stage red.

- C1a (crit 1, D1): `consultant` harness absent from `harnesses:` — the superRefine arm for `a`/`b`
  cannot reach it; case asserts refusal naming `slots.consultant`. Plan-stage red: schema has no
  `consultant` key at all (unrecognized key → also refused today for the wrong reason). Deliberate
  break for the refusal cases: accept `slots.consultant` but skip its harness check, so the cases
  fail on the missing refusal rather than the missing key. Recorded below.
- C1b (crit 1, D2): resolved-slots print inside a repo must not drop `consultant` — case asserts
  the parsed key inside the fixture repo, not only outside it.
- C2a (crit 2, D1): repo and index slot schemas must keep refusing `consultant` — plan-stage red:
  temporarily add `consultant: slotConfigSchema.optional()` to `repoSchema.slots` and
  `indexSchema.slots`; both cases then pass the config parse and fail. Discarded before the test
  commit.
- C3a (crit 3, D6): `outlive: false` — the shim `run` line must carry `--parent <door>` and never
  `--outlive-parent` (a `--slot`-style copy that passes outlive would keep the consultant alive
  past the watcher). Same case family.
- C3b (crit 3, D5): labels — `akrogon.leaf` must be absent and `akrogon.watch-consult` present; a
  letter-label (`akrogon.seat`) leak is asserted by exact-label equality (labels map compared
  wholesale minus the conditional `akrogon.transcript`, matching hc-start's shape).
- C4a (crit 4, D6): refusal order — missing-recipe is checked before `repoSpace`/launch; case runs
  the refusal under a live core and asserts zero `akrogon=1` terminals, so any fallthrough that
  reached `hc run` fails it.
- C4b (crit 4, D6): each conflicting flag refused before the letter parse — `z.parse(values.slot)`
  on `--watch-consultant` alone would throw `undefined`, a ZodError not the named conflict; cases
  assert the conflict text and the flag name.

## Plan-stage test sequence

1. Write `tests/watch-consult.test.ts` and the config.test.ts additions; update
   `command-reference.test.ts` + docs (contract text is test-side, committed in the tests commit).
2. Show each new test red through `akrogon run-check --name <label> -- bun test ...`:
   - criteria 3, 4: red naturally (flag unknown to `VERB_OPTIONS.seat`).
   - criterion 1: red naturally for accept/print cases; deliberate break (D1 shape accepted, no
     harness arm) for refusal cases.
   - criterion 2: deliberate break (`consultant` accepted in repo/index schemas) → red.
   Discard the breaks before the test commit; record each failing output beside its criterion
   below.
3. Commit the tests on the `consultant-seat` branch before any product edit
   (`Test-Change:` trailers where a commit adds cases to an existing test file).
4. `akrogon phase consultant-seat implement --slot A`.

## Plan-stage red evidence

Logs under `implementation/`; read back with `akrogon log <path>`.

- Criteria 3, 4 — `check plan-criteria-hc: 1 .../check-plan-criteria-hc-1795285326391-213664.log`:
  4 pass / 5 fail in `tests/watch-consult.test.ts`. Every case's `akrogon seat
  --watch-consultant ...` exits 1 with `unknown flag --watch-consultant` (VERB_OPTIONS.seat has
  no such flag). Passing cases are the conflict refusals, which today fail for the same wrong
  reason and re-fail correctly after implement.
- Criteria 1, 2 — `check plan-criteria: 1 .../check-plan-criteria-1795285334912-218644.log`:
  6 fail. `config loads and prints a machine slots.consultant recipe`: exit 1, `unrecognized_keys
  consultant` at path `slots`. The five refusal cases exit non-zero but on
  `Unrecognized key: "consultant"`, not the named refusal (e.g. missing-model case lacks `model`
  in stderr).
- Criterion 1 deliberate break (`slots.consultant` accepted, no harness arm) —
  `check plan-criteria-break: 1 .../check-plan-criteria-break-1795285348826-223709.log`:
  `whose harness is not in harnesses` fails with exit 0 where refusal was expected (the break
  parses), and the print case fails on `slots.consultant` absent from `akrogon config` output
  (D2's spread not yet present). Both tests catch the violation; break discarded.
- Criterion 2 deliberate break (`consultant` accepted in `repoSchema.slots` and
  `indexSchema.slots`) — `check plan-criteria-break2: 1 .../check-plan-criteria-break2-1795285355277-228866.log`:
  `slots.consultant in the repo issues/config.yaml` and `in ISSUE.md front matter` both pass the
  parse and fail their refusal assertions. Break discarded before the test commit.
- Criterion 5 baselines green: `check plan-regress-a: 0
  .../check-plan-regress-a-1795285368568-234878.log` (door-exchange + hc-start, 13 pass) and
  `check plan-regress-b: 0 .../check-plan-regress-b-1795285359148-232726.log` (cli-help,
  command-reference, seat, 30 pass). Re-run both after implement.
- Tests committed ahead of product code: `8fa6fb9d`.

## Known limitations

- A task-less `--watch-consultant` launch (prints the address, no start proof) is shared
  `startConsultant` behavior and not separately cased.
- The `name_taken` refusal for a second live `<prefix>-watch-consult` is hc's own behavior
  (chart proof in readiness.yaml), not re-tested.
- Live paid `agy`/`codex` recipes are the watch-consults leaf's grant (N1/N2); this leaf's
  proofs use the stand-in harness only.

## Implementation notes

- Refusal messages the committed tests pin: each `--watch-consultant` conflict error must contain
  the literal `--watch-consultant` plus the offending token (`--slot`, `--harness`, `--model`,
  `--effort`, or the positional value e.g. `some-leaf`); the outside-hc error must contain
  `--watch-consultant` and `HC_TERMINAL_ID`; the missing-recipe error must contain
  `slots.consultant` and `config.yaml`. The repo/index refusal text is Zod's `Unrecognized key:
  "consultant"` (contains `consultant`).
- `tests/watch-consult.test.ts` reads the `run`-prefixed line of `core.shimLog` containing
  `<prefix>-watch-consult` and asserts `--parent <caller>` present, `--outlive-parent` absent;
  the door terminal is plain `bash -c 'exec cat'` (no status events needed — parenting only).
- The agy case uses `harness: agy` + `model: trust`; `setConsultant` adds the `agy --model
  {model} --effort {effort}` template to `harnesses` so `harnessArgv`'s `argv[0] === 'agy'`
  check holds, and asserts `tasks == ['ENTER', task]` (trust dialog then send).
