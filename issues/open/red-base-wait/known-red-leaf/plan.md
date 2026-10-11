# Plan: known-red-leaf

Debate off (`debate: "no"`); synthesized from the brief and the locked design. `base-run` and `test-proof-rules` are both landed at `AKROGON_BASE` 64f27d0.

## Decisions

- **D1 — `--compare` flag.** `akrogon phase` gains a repeatable `--compare <file>` (parseArgs `compare: { type: 'string', multiple: true }`), passed through `phaseCommand` into `transition` as `compareFiles: string[]`. It is refused when `requested === 'failed'` or `state.phase === 'merge'` (the merge paths belong to `known-red-merge`). Every other legal move may carry it, including `--check` (validation runs, effects do not).
- **D2 — Comparison record schema** (`src/compare.ts`, zod, YAML under the `leaf=` folder):
  `command: string[]`, `cwd: string`, `scope: string`, `material: string` (provenance), `leaf_revision: sha`, `log: path`, `run: {complete: true | cause}`, `retry: {log: path, complete: true | cause, outcome: pass|fail}` (single field; a second retry is unrepresentable), `state: inconsistent|compared`, and on `compared` only `counterpart_revision: sha` + `base: {log: path, complete: true | cause}` (discriminated union makes a compared record without counterpart unrepresentable; `inconsistent` means green retry and forbids counterpart fields). `units[]`: `{runner, file, name, own_criterion?: true, leaf: {outcome: pass|fail|missing, log}, retry: {outcome: pass|fail|missing, log}, base: {outcome: pass|fail|missing, log} (compared only), verdict: known-red|new|unverified}`.
- **D3 — Validation** `validateComparisons(repo, leaf, state, slot, worktree, files, requested)` inside `transition` beside the existing guards (after `requireTestChangeCitations`, before the `checkOnly` early return and before `commitMove` resets `prompted_at`). Function only, each refusal naming the field or file: parses, schema-valid states, no blank required field, every named log file exists, file resolves under `leaf.path`, `leaf_revision` equals `git rev-parse HEAD` in the worktree, exactly one `retry`; and for `compared`: `counterpart_revision === await base(repo, worktree)` and `base.log` equals the `log` of a `readBaseRuns(repo)` line with `leaf`/`slot` matching, `start > state.prompted_at[slot]` (absent `prompted_at` refuses), `base === counterpart_revision`, `command` equal to the record's `command`, and `end`+`exit` recorded. When `requested ∈ {implement, check.review, merge}`, every unit verdict must be `known-red` and no unit may carry `own_criterion` (requested, not final destination, is enough: on check.review a `fix` verdict forces `check.repair`, so the record-time destination is exact).
- **D4 — Red record** (`src/red-record.ts`): append-only JSONL at `issues/red-records.jsonl` beside `issues/merge-attempts.jsonl`. Events `opened` (id, unit identity, provenance, `first_seen` = counterpart revision, at, file), `notice` (id, `{shown, reason}` result or error), `resolved` (id, resolving revision, at, file). Active entries are a fold over events. `applyComparison` runs inside the global lock `phaseCommand` already holds — never a nested `withLock` — and re-reads before writing: a `known-red` unit with no active entry for its identity+provenance appends one `opened` and yields a notice request; an active match joins silently. A unit whose `base.outcome === 'pass'` resolves an active entry only when `isAncestor(entry.first_seen, counterpart) || entry.first_seen === counterpart` (`git merge-base --is-ancestor`). Notification happens in `phase.ts` via the existing `herdrCall` shape (`notification show <repo> red on base: <unit> --body <command> --sound request`); its result or error is appended as a `notice` event, warn on failure, no retry. `applyComparison` returns the opened entries so `phase.ts` keeps the only herdr reference (no import cycle).
- **D5 — Effect timing.** Effects apply only on real moves, inside the same global lock: on the recorded path after `saveState`, on the committed path after `commitMove` returns. `--check` validates without applying.
- **D6 — `base-run.ts`.** `baseRunSchema` gains `log: z.string().optional()`; `baseRun` computes `<leaf>/implementation/base-<id>.log` before appending the record and writes `log` on the line (the landed line lacks it). `run-check` and readers tolerate older lines without `log`.
- **D7 — Status.** `src/status.ts` prints each active entry — `red: <unit name> (<runner> <file>) <command...> first-seen <sha> notice <shown|failed: <reason>|pending>` — on the slug view after the `held:` line and on the board view under the repo header. The `held:` lines are untouched (`known-red-merge` owns them).
- **D8 — Skill/doc text.** Rewrite the base-red paragraph in `skills/implement-issue/SKILL.md` (today :38) and `skills/check-issue/SKILL.md` (today :65) to: write the record file after the first run, one retry same command/args/scope/configuration, green retry → `inconsistent`, red retry → `akrogon base-run --base "$AKROGON_BASE" -- <command>`, per-unit verdicts, logs under `<leaf>/implementation/`, pass records as `--compare <file>` on the phase move; drop `failed --reason "<command> red on base <sha>"` for a completed comparison, keep the `incomplete base run` stop, drop B's fix of a test red on base, route a wrong expectation in the leaf's own criteria to A's `test-proof-rules` correction; `check-issue`'s "Failed `checks` commands always block" gains the known-red-record exception (today :59). Pointer lines `implement-issue:61`, `:74`, `check-issue:87` keep pointing at the rewritten rule. `plan-issue` `plan.synthesis` gains one sentence: a planned test's intended red is never compared; other failures take the same rule. `docs/guide/phases.md` :94 and :102 base-red sentences rewritten; `skills/AREA.md` :27 reworded; `README.md` :134 row and `tests/command-reference.test.ts` contract gain `[--compare <file>]`; `src/AREA.md` and `tests/AREA.md` updated.
- **D9 — Limit kept.** A same-code flaky unit can resolve and reopen, costing one notice per flip; the record only dedupes notices (B's held F1, A/C ancestry rule).

## Read-first

- `src/phase.ts` (`transition` :228-330, `phaseCommand` :894+, hold-notice shape :979-999, `MoveCommittedError` :122)
- `src/base-run.ts` (schema :23-42, `readBaseRuns` :49-55, record write :128-138, completion rewrite :170-190)
- `src/akrogon.ts` (options map :11-38, phase dispatch :60-85)
- `src/status.ts` (slug view :336-357, board repo block :380-390)
- `src/config.ts` (`base` :273, `worktreeStore`), `src/state.ts` (`prompted_at` :98, `withLock` :204), `src/attempts.ts` (JSONL record pattern :75), `src/hold.ts` (global record pattern)
- `tests/helpers.ts` (fixture/leaf/fakeHerdr/fakeAkrogon), `tests/phase.test.ts` (transition style, `herdrCalls`), `tests/base-run.test.ts` (real `akrogon base-run` drive)
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/AREA.md`, `docs/guide/phases.md`
- `learnings/history/2026-10-10-red-main-hold-stale-clear.md` (revalidate inside the lock)

## Interfaces

- `compare.ts`: `comparisonSchema`, `type Comparison`, `validateComparisons(repo, leaf, state, slot, worktree, files, requested): Promise<Comparison[]>` — throws `Error` naming the field/file.
- `red-record.ts`: `redEventSchema`, `type RedEntry`, `redRecordsPath(repo)`, `readRedRecords(repo)`, `activeRed(repo)`, `applyComparison(repo, leaf, slot, file, record): Promise<RedEntry[]>` (opens only; returns entries needing notice), `resolveComparison(repo, file, record, gitdir): Promise<void>`, `appendNotice(repo, id, result | {error})`.
- `phase.ts`: `transition(..., compareFiles: string[])`; `phaseCommand(..., rawCompare)`; validation before `checkOnly` return; `applyComparison`/`resolveComparison` + notice loop after move decision; `isAncestor` helper already exists (merge stack code).
- `status.ts`: `redLines(repo)` shared by slug and board views.

## Waves

### Wave 1
- **U1 — record modules.** Owns `src/compare.ts` (new), `src/red-record.ts` (new), `src/base-run.ts` (schema `log` field + record line writes it). No dependency; lands first so U2 can import.

### Wave 2
- **U2 — wiring.** Owns `src/akrogon.ts` (flag + pass-through), `src/phase.ts` (`transition`/`phaseCommand` signatures, validation call, effect + notice application), `src/status.ts` (entry lines), `README.md` (:134 row), `src/AREA.md`. Depends on U1. Shared test resource: none beyond the committed `tests/compare.test.ts` which its product code turns green.
- **U3 — docs.** Owns `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/AREA.md`, `docs/guide/phases.md`, `tests/AREA.md`. No code dependency; shares a wave with U2 on disjoint paths.

Affected docs: `README.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `docs/guide/phases.md`. `docs/reference-index.md` and `tests/docs-links.test.ts` unaffected (no new pages or anchors).

## Criterion proof map

| # | Criterion | Proof command | Catches | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | valid records move like green; no base-red `failed` | `bun test tests/compare.test.ts` | move refused, entries lost, wrong phase | minutes | src/compare, src/phase change |
| 2 | per-field refusals naming field/file | `bun test tests/compare.test.ts -t refusal` | silent accept, bad message | seconds | schema/validation change |
| 3 | new/unverified/own-criterion refused to implement, check.review, merge | `bun test tests/compare.test.ts -t verdict` | wrong destination admitted | seconds | D3 rule change |
| 4 | open+notice once, join silent, notice stored apart | `bun test tests/compare.test.ts -t record` | duplicate entry or notice, missing notice record | seconds | red-record change |
| 5 | resolve only on base pass, same provenance, ancestor rule; partial; recurrence new entry+notice | `bun test tests/compare.test.ts -t resolve` | stale-close class, wrong provenance close, lost recurrence | minutes (rebases) | red-record/ancestor change |
| 6 | reread+compare inside the existing lock | code inspection + resolve tests (entry newer than evidence stays active) | nested `withLock` deadlock, stale decision | — | lock path change |
| 7 | `akrogon status` prints unit, command, first-seen, notice result | `bun test tests/compare.test.ts -t status` | missing or malformed line | seconds | status change |
| 8 | skill files carry retry/compare/`--compare`, drop the red-on-base `failed` stop, keep incomplete stop, known-red exception | `bun test tests/red-docs.test.ts` | retired stop survives, missing rule | seconds | skill text change |
| 9 | sweep: no pre-merge seat stop/wait/fail-on-base-red or base-result reuse; out-of-scope hits listed | `bun test tests/red-docs.test.ts` + sweep report below | leftover stop text | seconds | skills/docs change |

`checks` (format, typecheck, test, test_changed) also run per the repo config; the new tests above are the leaf's own proofs. No criterion needs `merge_checks` or a live run; no new proof machinery.

### Sweep report (criterion 9)
Stop/wait/fail-on-base-red or base-reuse lines found in `skills/` and `docs/`: all rewritten by U3. Out-of-scope hits owned by `known-red-merge` (kept, listed): `skills/merge-issue/SKILL.md:73` (merge base-run + `--red-on-base` hold), `docs/guide/merge.md:29` (same), `README.md:134` `--red-on-base` clause (merge flag), `skills/implement-issue/SKILL.md:78` (merge-bounce check.fix replay), `src/AREA.md` hold line. `skills/check-issue/SKILL.md:97` direct-route line inherits the rewritten rule, not edited itself.

## Committed tests (red-first, this planning pass)

- `tests/compare.test.ts` (new): happy-path moves with a real `akrogon base-run`, `test.each` refusal cases, verdict-destination cases, record/notice dedupe + failed-notice, resolve/older-revision/provenance/partial/recurrence, status lines, `--check`, `--compare` on `failed`/merge refused.
- `tests/red-docs.test.ts` (new): skill text + sweep assertions.
- `tests/base-run.test.ts` (edited): assert the record line carries `log` equal to the printed path.
- `tests/command-reference.test.ts` (edited): `phase` contract gains `[--compare <file>]`.

Commit trailers: `Test-Change: tests/base-run.test.ts <case added, no existing expectation changed>` and `Test-Change: tests/command-reference.test.ts <contract updated for --compare>`.

Recorded intended reds (full suite `bun test --timeout=30000`, 756 pass / 32 fail, every failure in the four files above):

- C1/C4/C5/C7 and `--check`/`--compare` guards (criteria 1,4,5,7): all 26 `tests/compare.test.ts` cases fail with `TypeError: Unknown option '--compare'` from `src/akrogon.ts:40`, or assert the missing red record/status output; the status case shows `unit one` absent from `akrogon status` output.
- C2 (refusals): each `test.each` refusal case fails identically on the missing flag; each also asserts `stderr` does not contain `Unknown option`, so the per-field refusal must land to turn green.
- C3 (verdict-destination): the `new`/`unverified`/`own_criterion` refusals and the admitted `check.fix` move fail on the same missing flag.
- C8/C9: `tests/red-docs.test.ts` fails on `'--compare'` absent from `skills/implement-issue/SKILL.md` and `skills/plan-issue/SKILL.md` `plan.synthesis`, `--compare|known-red` absent from `docs/guide/phases.md`/`README.md`, and the retired `/one base run at \`AKROGON_BASE\`/` stop still present in `skills/AREA.md`.
- Command contract: `tests/command-reference.test.ts` fails `README covers every dispatched command` — the README row lacks `[--compare <file>]`.
- Base-run record line: `tests/base-run.test.ts` fails `expect(run.log).toBe(logPath)` — the landed schema carries no `log` field.

`bun run format` (write-mode check) reformats two unrelated pre-existing files (`src/status.ts` `phaseColor`, `skills/chart-issues/scripts/peer-wait.ts`); reverted here and left for implement, where the format check applies the same rewrite.

## Implementation notes

2026-10-11, refinements decided during implement:

- Unit `file` accepts an empty string for stage-level units whose verdict comes from a run stage, not a file.
- `own_criterion` units are refused only on moves toward `implement`, `check.review`, `merge` (D3's stated rule); when admitted on `check.repair`/`check.fix` they still never open red-record entries — `applyComparison` skips them for opens and resolves alike.
- Effects apply on both accepted paths (recorded and committed); `--check` validates only.
- Notice title format: `<repo> red on base: <unit name>` with `--body <command> --sound request`, reusing the hold-notice `herdrCall` shape.
- `applyComparison` resolves before it opens within one record, so a unit can never self-resolve.
- Comparison files must resolve under `leaf.path` (the `leaf=` folder); refusal names the file.

## Notes

- Brief/design: no conflicts found.
- No credentials named by the design; `akrogon status` `Missing:` lines are empty.
- No slow runs; no restart boundaries needed.
- `akrogon base-run` in tests runs `akrogon guard ancestors && akrogon guard own-modules` inside the base checkout; fixtures run it via `fakeAkrogon` PATH exactly as `tests/base-run.test.ts` does.
