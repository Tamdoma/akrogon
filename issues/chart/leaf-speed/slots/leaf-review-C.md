# Leaf draft review C (disagreements only)

## timing-events

- D1: `wait` start/end has no reliable hook. `pauseCommand` only toggles a repo set (`src/pause.ts:58-63`), `dispatchLeaf` returns waiting repeatedly (`src/next.ts:688,724-741`), and `mergeQueue` is a pure computation also used by read-only status (`src/turn.ts:81`). No dedupe state, no end trigger without a later dispatch, no event for leaves created while paused, and criterion 4 omits the promised merge-turn wait.
- D2: the phase-visit id has no owner or storage. Prompt, `seat_done` and check events must agree on it, but `src/state.ts` has no visit field and the design neither owns that file nor states a derivation rule. The initial plan phase has no `log.jsonl` entry row to derive from.
- D3: check attribution is incomplete. `leafTarget` resolves only the main worktree or an active base run (`src/run-check.ts:79-91`), not worker worktrees `<slug>-u<N>`, and the event fields do not mark a base-run counterpart check. Worker checks can be absent and base checks counted as leaf check time.

## timing-readout

- D1: criterion 1 cannot add up the initial plan visit. Nothing records phase entry, and a leaf's first `log.jsonl` row is normally its exit from plan synthesis. Plan waiting and elapsed are unknown, not zero. Overlapping wait reasons also need a union or priority rule before “add up” is testable.
- D2: the cohort can print before it is decidable. Criterion 3 does not require complete timing, does not make an unmerged leaf younger than 24 h `insufficient`, and gives failed leaves no numeric F while requiring each F printed. It also does not define whether `red`, `ejected` and culprit outcomes all count as ejections.
- D3: expected-event inventory needs a “not yet expected” rule. A running check legitimately lacks `check_end`, `failed` has no required prompt (`src/routing.ts:37-50`), and re-check review is B-only when `fix_rounds > 0` (`src/routing.ts:53-55`), so it expects no paired `seat_done`.

## serial-plan-solo

- D1: criterion 1 says no remaining text requires delegating an all-single-unit plan, but owned surfaces omit `skills/AREA.md:23`, which still says delegated mode runs each wave whole with workers. Own that line or narrow the criterion to the three named files.
- D2: the brief extends the rule to repair passes over the repair grouping (brief:4). The copied binding decision covers only final-plan waves (design:9). A parallel plan with an all-singleton repair grouping is decided by the brief, not the fork. Record the extension as binding or remove it.

## test-changed-shared-files

- D1: criterion 2's “exactly the scripts whose references reach it” conflicts with always-selection: subset selection adds `always` owners (`run-test-changed.ts:124-127`; 12 entries in `test-changed-ownership.json`). State “mapped plus always”, or change that path.
- D2: the generated-file bullet (brief:8) has no done-criterion and no source-mapping mechanism. A generated file changed without its sources in the same diff cannot select what its source change selects.
- D3: exact reachability needs a dynamic-reference rule. Existing graph code follows only `bun run` names (`contracts-verify.ts:935-957`), while scripts read through directory walks and computed paths (`contracts-verify.ts:250,342,721`). The brief never says unresolved or glob references fail the check or select all.
- D4: the reference check's blocking home is missing. The design excludes `framework:verify` composition and does not own `package.json` or `contracts-verify.ts`; no package script names `run-test-changed.test.ts` today (grep of `package.json`). Criterion 4 also freezes no attempt IDs: B's file gives counts for 26 ranges, and new solo attempts keep arriving.

## flaky-test-fixes

- D1: criterion 1 is not recordable as written. “20 consecutive runs” is the session/test count the audit refuses in a done-criterion (`shapes.md:289`), with no shared resource forcing serial order and no slow-run final-proof rule (`shapes.md:291`).
- D2: parts of the inventory are already fixed on main: deploy-core has its 120 s deadline (`deploy-core.test.ts:1394`) atop a9253998a's 30 s floor; session-trace waits for the exit code since caf930e8a (`session-trace.ts:111-114`); the spawned-child timeout was raised in 7100f918c (`scratch-writer-isolation.test.ts:606`). Separate “verify already fixed” from open causes, with exact units instead of grouped labels.
- D3: criterion 3 lets the leaf finish with an unfixed unit whose cause was not found if it passes the repeated runs. That contradicts the binding “fixes the named randomly failing units by cause” (`flaky-tests.md:17`) and sets no investigation bound or acceptance rule.
