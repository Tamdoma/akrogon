# Brief 1: failed stop machinery (state, routing, CLI, phase)

## 1. Goal

Make `akrogon phase <slug> failed --reason <text> [--slot <A|B>]` a legal immediate stop from every active phase, recording a typed `failure` and clearing live busy fields; make moves out of `failed` skip the clean-worktree check only for `cause: 'blocked'` and remove `failure`. Implements plan decisions D1, D2, D3, D4, D5, D9, D10 and the `transition` half of D6.

## 2. Numbered acceptance criteria

1. `phase <slug> failed --reason x` from `implement` on a dirty worktree exits 0, prints `moved failed`, and the recorded state has `failure: { cause: blocked, phase: implement, slot: B, reason: x }`, the dirty file still exists, `busy_since`/`busy_notified`/`prompted`/`prompted_at` are empty objects, and `tab`/`worktree`/`pane` are preserved.
2. Stops land in `failed` immediately with no phase advance: from `plan.positions` with repo `rebuttal` true and false (each `--slot A`), from `check.review` with `--slot A` while B is unfinished and no verdict given, from `merge` with no `--slot` (A inferred). A stop naming a slot not required (`--slot A` from `implement`) or already in `done` is refused.
3. `phase <slug> implement` from a `cause: blocked` failure succeeds with the worktree still dirty and `failure` removed; the same move from a `cause: attempts` failure refuses with `Uncommitted work`.
4. `failed -> check.fix` succeeds (`moved check.fix`); `failed -> merged` refuses as an illegal move; `phase <slug> failed` without `--reason` refuses; `--reason` on any other destination refuses.
5. A leaf moved to `merged` shows empty `busy_since`/`busy_notified`.
6. Review repair exhaustion at the `fix_rounds` cap records `failure: { cause: 'attempts', phase: 'check.review', slot: <verdict slot>, reason: 'fix rounds exhausted' }`.
7. A state.yaml containing a `failure` object round-trips through `readState`; a `failure` with an unknown key is rejected (strict object).

## 3. Read-first list

- `src/phase.ts` — `transition`, `commitMove`, guards (the file you edit most).
- `src/routing.ts` — `routing` table, `requiredSlots`, `phaseSchema`/`slotSchema`.
- `src/state.ts` — `stateSchema` strict object.
- `src/akrogon.ts` — `phase` options and `phaseCommand` call.
- `tests/phase.test.ts` — test style; the `failed exits by command reset attempts and refuse check.fix` test must be updated because `failed -> check.fix` becomes legal.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`.
- `tests/command-reference.test.ts` and `README.md` — the argument-contract pair.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/state.ts`: add to `stateSchema` an optional strict object
  `failure: z.strictObject({ cause: z.enum(['blocked', 'attempts']), phase: phaseSchema, slot: slotSchema, reason: z.string().min(1), delivery: z.string().optional() }).optional()`.
  Export `type Failure = z.infer<...>` of that object for use in `src/phase.ts`.
- `src/routing.ts`: add `'failed'` to `next` of `plan.positions`, `plan.rebuttal`, `plan.synthesis`, `implement`, `check.review`, `check.fix`, `merge`. Add `'check.fix'` to `failed.next`. `merged.next` stays `[]`.
- `src/akrogon.ts`: add `reason: { type: 'string' }` to the `verb === 'phase'` options; pass `values.reason` as a fifth argument to `phaseCommand`.
- `src/phase.ts`:
  - `phaseCommand(slug, rawPhase, rawSlot, rawVerdict, rawReason)`: parse `rawReason` as `z.string().min(1).optional()`; pass `reason` into `transition`.
  - `transition(repo, leaf, requested, explicitSlot, verdict, reason)`:
    - After the merged-terminal and routing-legality checks, refuse `--reason` misuse: `if (requested === 'failed' && reason === undefined) throw new Error('Failed requires --reason')`; `if (requested !== 'failed' && reason !== undefined) throw new Error('--reason is only valid for failed')`. (Two checks so `reason` narrows to `string` inside the stop path.)
    - Guard the existing rebuttal-destination check with `requested !== 'failed'` so `plan.positions -> failed` is not refused.
    - Stop path, immediately after the existing required-slot/done validation and before `requireClean`: `if (requested === 'failed') { await commitMove(repo, leaf, state, 'failed', slot ?? null, { cause: 'blocked', phase: state.phase, slot: slot ?? required[0], reason }); return; }`. This skips `requireClean`, `requireNoIssueFiles`, `requireNonEmpty`, the verdict requirement, the two-seat barrier and the review destination override, and never touches the worktree. The existing `state.phase !== 'failed'` guard already makes `--slot` optional on restarts; the stop path runs only from active phases where `slot` is validated required-and-unfinished.
    - Skip `requireClean` on restart only for blocked causes: change the clean check to run when `state.worktree !== undefined && !(state.phase === 'failed' && state.failure?.cause === 'blocked')`. `requireNoIssueFiles` still runs for every restart with a worktree.
    - Fix-rounds cap: where `capped` becomes `'failed'`, call `commitMove(repo, leaf, recorded, capped, slot ?? null, capped === 'failed' ? { cause: 'attempts', phase: 'check.review', slot: slot ?? required[0], reason: 'fix rounds exhausted' } : undefined)`.
  - `commitMove(repo, leaf, recorded, to, slot, failure?: Failure)`: in `after`, set `failure: to === 'failed' ? failure : undefined` (removes the record on any move out of `failed`; `Bun.YAML.stringify` drops `undefined` values — verify in a test that no `failure:` key is written after restart). When `to` is `'failed'` or `'merged'`, also set `busy_since: {}` and `busy_notified: {}`. `done`, `verdict`, `attempts`, `prompted`, `prompted_at`, `failed_notified` are already cleared on every move; `tab`, `worktree`, `pane` stay untouched.
- `README.md`: the `phase` row becomes `akrogon phase <slug> <phase> --slot <A\|B> [--verdict <verdict>] [--reason <text>]`; extend its effect text to mention `--reason` declares a stop into `failed`.
- `tests/command-reference.test.ts`: `contracts.phase` becomes `'<slug> <phase> --slot <A|B> [--verdict <verdict>] [--reason <text>]'`. Both must change together or the reference test fails.
- `tests/phase.test.ts`: update `failed exits by command reset attempts and refuse check.fix` — the `check.fix` move now succeeds (`moved check.fix`); rename the test accordingly. Add tests covering criteria 1–6 above, following existing style (`fixture`, `cli`, `leaf`, `yaml`, `readState`, `command` for git). For criterion 6 extend or mirror the existing `fix_rounds: 1` cap test: after `moved failed`, assert `readState(path).failure` matches `{ cause: 'attempts', phase: 'check.review', slot: 'A', reason: 'fix rounds exhausted' }`. For criterion 5, give a `merge`-phase leaf `busy_since`/`busy_notified` values, move it to `merged`, assert both are `{}` (the leaf needs no sources; `completeOwner` will move the container — use a standalone container or assert before/after as existing tests do).
- `tests/state.test.ts`: add the round-trip and strict-rejection assertions for `failure` (criterion 7).

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts` or `src/status.ts` — owned by later briefs; exception: none.
- Do not add herdr calls, notifications, or tab renames — owned by the failure-attention leaf.
- Do not remove or write `failed_notified` — left untouched by design.
- Do not change `logMove` or the log schema — the design adds no log fields.
- Do not weaken or skip existing tests; the only test edit is the `check.fix` expectation plus the contract string.
- Do not commit — B commits after the full suite.
- Return a mismatch with evidence instead of changing a locked decision or an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. `src/state.ts` `failure` schema + `Failure` export (criterion 7 test in `tests/state.test.ts` first: red, then green).
2. `src/routing.ts` next tables (D1).
3. `src/akrogon.ts` + `README.md` + `tests/command-reference.test.ts` contract (D2, D10).
4. `src/phase.ts` `phaseCommand`/`transition`/`commitMove` changes (D3–D6).
5. `tests/phase.test.ts` new tests for criteria 1–6 and the updated `check.fix` test; run the changed-tests command after each file lands.

Advisory size: about 7 files, under 40 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=43ef0f7a7cb8908df33a734bbdee406b1563d408`. Run from the worktree root. B runs the full suite separately.

## 8. Done-when, evidence and report

All criteria verified by the new tests passing under the changed-tests command; pasted command output required. Scenarios use temporary repositories and real git via `tests/helpers.ts`; no real panes, herdr socket or GitHub.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
