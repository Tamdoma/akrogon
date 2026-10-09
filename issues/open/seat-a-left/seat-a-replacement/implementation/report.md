# Implementation report: seat-a-replacement

## Outcome

Leaf work is complete and fully green. Pass 1 ended `failed` on a red-on-base
`tests/harness-template.test.ts`; the operator chose option (1) and restored
`{model}` in `config.yaml` on main. Pass 2 re-verified everything against the
rebased lane: all C1-C4 proofs pass and the full suite is green, including the
formerly red harness-template tests.

- Base: `3e034dee43f0853446c2ba8f97bb72668ab213dc` (`AKROGON_BASE`; current
  merge-base with main after unrelated merges: `bab3a63e`)
- Committed head: `5cda354` (lane branch `seat-a-replacement`, tree clean)

## Changed files and reasons

- `tests/fake-herdr.ts` (commit `566f7f4`, U1, rebased): parent-relative `right` split
  geometry, `pane swap` by explicit IDs swapping rects and moving tab/pane
  focus like real herdr, `pane layout` rects, focused tab plus `tab focus`,
  `failSwapOnce` flag. New fields optional so old fixtures still parse.
- `src/shell.ts` (commit `d685087`, U2, rebased): `tabSchema` gains optional `focused`
  and `workspace_id` so the focused tab survives parsing. Nothing else reads
  the new fields.
- `src/next.ts` (commit `d685087`, U2, rebased): in `allocate`, only when recorded A is
  absent, recorded B survives, and not on bootstrap: split B right, save the
  new A ID at once, fresh `tab list` for prev focus, one
  `pane swap --source-pane <B> --target-pane <newA>`, conditional
  `tab focus <prev>` on both paths, slug-naming errors, no retry or close.
  A `changed:false` swap is treated as a swap failure through the same path.
  All other branches are untouched; prod never calls `pane layout`.
- `tests/next.test.ts` (commit `5cda354`, U3, rebased): 8 CLI-boundary tests proving
  C1-C4 (positions via `pane layout`, focus via `tab list` state plus call
  log, error text via stderr). No existing expectation changed.

Docs: none affected, per plan. No reusable lesson found.

## Delegation fallback

Config says `implement: subagents`. Four worker spawns (two waves of U1+U2)
each ended with zero tool calls claiming no filesystem or shell access:

- `sa-1` U2: `.../seat-a-replacement-u2--/2026-10-08T21-20-07-673Z_01a11d63-45f9-7756-8422-462b5b02806b.jsonl`
- `sa-2` U1: `.../seat-a-replacement-u1--/2026-10-08T21-20-07-728Z_01a11d63-4630-7756-8422-462dfb858591.jsonl`
- `sa-3` U2 relaunch: `.../seat-a-replacement-u2--/2026-10-08T21-24-16-887Z_01a11d67-1377-7756-8422-462e479d0591.jsonl`
- `sa-4` U1 relaunch: `.../seat-a-replacement-u1--/2026-10-08T21-24-16-912Z_01a11d67-1390-7756-8422-463056d0cc29.jsonl`

Full paths under `/home/ivan/.pi/agent/sessions/`. Delegation is broken in
this environment, so A implemented all three units directly in the lane in
wave order (U1, then U3 tests for red evidence, then U2, commits in
dependency order). Empty worker worktrees were removed.

## Commands run with results

Fail-before (U1 committed, U3 tests written but uncommitted, U2 absent; log `implementation/red-before.log`):

- `bun test tests/next.test.ts --timeout=30000 -t "missing A beside surviving B"`
  → 0 pass, 1 fail (`missing A beside surviving B puts A left of B`, no
  swap call, A right of B).
- `-t "restores operator tab focus"` → 0 pass, 2 fail (expected 1 swap,
  received 0).
- `-t "swap failure keeps"` → 0 pass, 1 fail (`next` exited 0, no error).
- `-t "allocation paths unchanged"` → 3 pass, 1 fail (only the extra-pane
  repair case red; new-tab, bootstrap/B-only, present/reversed guards green
  pre-fix as designed).

Pass-after, pass 1 (all three units landed; log `implementation/green-after.log`):

- `-t "missing A beside surviving B"` → 1 pass, 0 fail (C1).
- `-t "restores operator tab focus"` → 2 pass, 0 fail (C2).
- `-t "swap failure keeps"` → 1 pass, 0 fail (C3).
- `-t "allocation paths unchanged"` → 4 pass, 0 fail (C4).

Pass 2 re-verification, rebased lane head `5cda354` (2026-10-09):

- `-t "missing A beside surviving B"` → 1 pass, 0 fail (C1; `p2-c1.log`).
- `-t "restores operator tab focus"` → 2 pass, 0 fail (C2; `p2-c2.log`).
- `-t "swap failure keeps"` → 1 pass, 0 fail (C3; `p2-c3.log`).
- `-t "allocation paths unchanged"` → 4 pass, 0 fail (C4; `p2-c4.log`).
- `bun run typecheck` → clean, exit 0 (`p2-typecheck.log`).
- `bun run format` → same `src/status.ts` drift only, reverted; my files
  already formatted (`p2-format.log`).
- `bun test --timeout=30000` full suite → 592 pass, 0 fail, 30.1 s
  (`p2-full-suite.log`). The three harness-template tests pass.
- `bun test --changed="$AKROGON_BASE" --timeout=30000` → 566 pass, 0 fail,
  29.1 s (`p2-changed.log`).

No `merge_checks` configured.

Regression (pass 1):

- `bun test tests/next.test.ts --timeout=30000` → 186 pass, 0 fail (with
  U1 only, pre-U2/U3); 194 pass, 0 fail in later full runs.
- `bun run typecheck` → clean (exit 0).
- `bun run format` → my three files already formatted; it reformatted
  unrelated `src/status.ts` (pre-existing drift on base), which I reverted
  to keep the diff minimal. Tree clean after.
- `bun test --changed="$AKROGON_BASE" --timeout=30000` (21 files) → 514
  pass, 3 fail, all 3 in `tests/harness-template.test.ts`.
- `bun test --timeout=30000` full suite → 544 pass, 3 fail, same 3 tests,
  nothing else red. Log `implementation/full-suite.log`. Wall time 27.9 s
  (seconds; no minutes-sized commands this pass).

## Red on base (pass 1, resolved on main)

- Command: `bun test tests/harness-template.test.ts --timeout=30000`
- Base SHA: `3e034dee43f0853446c2ba8f97bb72668ab213dc`
- Leaf log: `implementation/leaf-harness-template.log` (exit 1)
- Base log: `implementation/base-harness-template.log` (exit 1, detached
  worktree at base, deps installed, worktree removed after)

Failing names, identical in both runs:

- `claude template carries no literal subagent model inside --settings`
- `claude template substitutes opus into the subagent model env`
- `claude template substitutes claude-opus-5-5 into the subagent model env`

Tails (both runs): `0 pass, 3 fail`, same assertion lines
(`tests/harness-template.test.ts:26` and `:34`), same received value
`claude-sonnet-5-5` where the test expects no literal / the substituted
model.

Why the base failure explains the leaf failure: the test reads the
checked-in `config.yaml` `harnesses.claude` template and expects the
`{model}` placeholder. Base commit `3e034de` ("add issues") regressed that
line to a hardcoded `claude-sonnet-5-5`, one day after operator commit
`afd078c` ("config: parameterize claude subagent model") parameterized it.
My diff touches none of `config.yaml`, harness templates, `src/config.ts`,
or the test, so there is no touched file or plausible cause in the leaf.

The test's expectation is not wrong: it matches the operator's deliberate
`afd078c` change and the `{model}` substitution contract in `src/next.ts`
`launch()`. Neither the test nor the operator-owned `config.yaml` was
changed here; that choice belongs to the operator.

Operator options to unstick the leaf: (1) restore `{model}` in
`config.yaml` on main (re-apply the `afd078c` line), or (2) if the pin is
deliberate, update `tests/harness-template.test.ts` to match. Then retry
this leaf; its own scope is fully green.

## Known limitations

- Carried from the brief: an operator switching tabs during the
  swap-to-restore window is sent back once; an operator in the leaf tab
  with an extra non-seat pane focused ends with B focused; vertical splits
  and extra-pane swap geometry were not probed live.
- `bun run format` wants to reformat `src/status.ts` (pre-existing drift,
  reverted, not mine).
- `tests/harness-template.test.ts` was red on `AKROGON_BASE` `3e034de` in
  pass 1; resolved on main (operator restored `{model}` in `config.yaml`),
  green in the pass-2 suite run above.

## Unverified criteria

None. C1-C4 each have a passing proof command listed above.
