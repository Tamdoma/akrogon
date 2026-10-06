# Brief 3: batch phase calls — attempt gate, command-owned push, moves, dissolve (plan U3, wave 2)

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-batch-u3

## 1. Goal

`src/phase.ts` + `src/akrogon.ts` implement the holder interface (plan D5, D6, D7, D10): `--attempt <id>` on `phase`, per-member range checks, the command-owned fast-forward push, ordered member moves, `fresh checks required` restack, `batch dissolved, merge solo`, and stale-attempt refusal. `src/next.ts` (other unit) produces the record and prompts; you consume `leaf.state.batch`.

## 2. Acceptance criteria

1. `akrogon phase <slug> <phase> --attempt <id>` parses; `phaseCommand` takes it through to the batch checks.
2. On a leaf in `merge` with `state.batch`, `--slot B` calls to `merged`, `merged --check` and `check.fix` require the attempt to equal `record.attempt`; mismatch or missing → nonzero refusal naming the stale attempt, nothing changes. Operator `merged`/`check.fix` without `--slot` skips the attempt gate and the `tested_top` gate (the push-and-moves path still applies). `failed` never needs it. A leaf in `merge` with no `batch` behaves exactly as today.
3. `merged --check --attempt`: holder-queue guard stays; then, under the lock, require `applied` and HEAD == `record.top` (non-solo record) — refusal names the expected top. Per member in record order run the existing worktree guards over range `<predecessor>..<member.tip>` where predecessor is `built_on` or the previous member's tip: issue-file check, `Test-Change` trailer check, non-empty check. Then cumulative trailer/issue checks over `record.built_on..HEAD` reuse the existing calls. For `record.solo` skip per-member checks and the HEAD==top rule (B rebased itself); trailer/issue/non-empty checks still run over `target(repo)...HEAD`. Only when all pass plus the existing `transition` guards, save `tested_top = <HEAD sha>` and print `ok`.
4. `merged --attempt`: under the lock, for a non-solo record require `record.tested_top` set and `HEAD === tested_top`; for `solo`, require `tested_top` and `HEAD === tested_top`. Require the holder and every member still `phase === 'merge'` — any member missing `merge` → refuse: `restoreMembers` the still-in-merge members to `head`, clear `batch`, exit nonzero. Then `record.candidate = HEAD`; `git push <remote> HEAD:<default_branch>`:
   - code 0 → move each member still in `merge` in record order via `commitMove(repo, memberLeaf, memberState, 'merged', 'B')`, then `transition` the holder to `merged` (existing path prints `moved merged`; `completeOwner` prints `issue complete`/`epic complete` per completed owner).
   - non-fast-forward (`run` result code ≠ 0 and stderr contains `non-fast-forward` or `[rejected]`) → under the lock set `applied: false`, `tested_top: undefined`, `built_on` stays; release the lock, `git fetch`, `buildStack` onto new `trackingRef` with items `{ slug, base: <pred tip>, head: <member.tip> }` (rebase each member's applied range forward; holder item `{ base: <last member tip>, head: <holder branch tip> }`), treat member conflicts per the conflict path (solo-mark, drop, same attempt), holder conflict → set `applied: true, solo: true, members: []`, then relock, verify attempt + holder still in `merge`, `applyStack`, save `applied: true, top`, print `fresh checks required <new top>`, exit 0, no move.
   - other nonzero push → print the error with cause, exit nonzero, keep `candidate` unset.
   - After any push attempt, if `candidate` is already an ancestor of the fresh `trackingRef` treat as landed (lost reply) and proceed to moves without re-pushing.
5. `check.fix --attempt` with `members.length > 0`: under the lock `restoreMembers` (worktree `reset --hard head` or `update-ref`), set each member `solo: true` via `saveState`, clear `batch`, print `batch dissolved, merge solo`, set `committed = true` so the akrogon.ts finally-hook runs `mergeWake`, and commit NO transition for the holder (it stays `merge`). With `members.length === 0`: existing `transition` to `check.fix`.
6. `merged`/`merged --check`/`check.fix` on a record holder keep working for `mergePass`-produced records including `solo` records; a `merged` call on a `solo` record pushes the worktree HEAD after the `tested_top` gate.
7. `commitMove` gains `solo: to === 'merge' ? recorded.solo : undefined` in the `after` state so `solo` clears on any move out of `merge`; it never clears `batch` (reconcile owns that).
8. The `merged` batch branch does not run `transition`'s checkOnly path; `merged --check` keeps `check` semantics (no move).

## 3. Read-first list

- `src/phase.ts` whole file (`phaseCommand` merge guard at ~line 345, `transition` checkOnly path, `commitMove`, `requireClean`, `requireNoIssueFiles`, `requireTestChangeCitations`, `requireNonEmpty` — generalize these three with a `from`/`to` range parameter so member ranges can reuse them; default `target(repo)`).
- `src/batch.ts` (landed): `buildStack(repo, builtOn, items, holderHead)`, `applyStack(repo, top, members, holder)`, `restoreMembers(repo, members)`, `isAncestor(cwd, a, b)`; `src/state.ts` `Batch`.
- `src/akrogon.ts` phase options block; `src/turn.ts` `mergeQueue`; `src/preflight.ts` `trackingRef`; `src/config.ts` `remote`/`default_branch` keys; `src/shell.ts` `command`/`run`.
- `tests/phase.test.ts:1792-1871` patterns; `tests/helpers.ts` `fixture`, `leaf`, `cli`, `yaml`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

Owned paths: `src/phase.ts`, `src/akrogon.ts`, `tests/batch-merge.test.ts` (new). Also allowed: `tests/phase.test.ts` only if an existing expectation contradicts this design (name the source in the commit trailer). Not owned: `src/next.ts`, `src/batch.ts`, `src/state.ts`, `src/turn.ts`, skills, docs, README — mismatch if needed.

Structure inside `phaseCommand`'s `withLock`, after `findLeaf`:

```ts
const record = leaf.state.batch;
if (leaf.state.phase === 'merge' && record !== undefined && (requested === 'merged' || requested === 'check.fix')) {
  if (slot !== undefined && attempt !== record.attempt) throw new Error(`Stale attempt ...`);
  if (check) { /* criterion 3 */ }
  else if (requested === 'merged') { /* criterion 4: recheck members, push, member moves, then transition(...) */ }
  else if (record.members.length > 0) { /* criterion 5 dissolve */ }
  else { /* existing transition to check.fix */ }
} else {
  /* existing transition call */
}
```

The holder-queue guard (existing `mergeQueue` head check) stays for both branches. Push uses `run` (not `command`) so nonzero codes are inspectable; push target is `<remote> <HEAD>:refs/heads/<default_branch>` with `git rev-parse <trackingRef>` read before push. Fetch uses `command(['git','fetch', remote], repo.root)`; warn-and-continue on failure only for the pre-build refresh, fail the call on failure when a push was refused.

Restack builds from APPLIED tips: item list = `members.map((m, i) => ({ slug: m.slug, base: i === 0 ? oldBuiltOn : members[i-1].tip, head: m.tip }))`, holder item `{ base: last member tip or oldBuiltOn, head: <holder branch tip> }`; conflicts use the same solo-mark/drop loop as `mergePass` (member conflict: mark `solo` under lock, remove from record, rebuild with same attempt; holder conflict: `applied: true, solo: true, members: []`, print `fresh checks required` naming rebase-needed — the holder resolves on its own worktree in B's next pass, and `solo` `merged` pushes HEAD).

`update-ref`-vs-`reset` rule in restores matches `src/batch.ts`.

## 5. Do-not

- No rebase/conflict resolution, no prompt delivery, no state schema changes, no `next.ts`/`batch.ts`/`state.ts` edits — return a mismatch with evidence if you believe one is needed.
- Never `git push --force`; push only the recorded/tested object.
- No clocks/polling; no new deps; no `issues/` files on the branch.
- Do not change `transition`'s non-merge semantics; the `--check` early `ok` return stays for non-batch leaves.
- `tests/batch-merge.test.ts` is new (no trailer); a commit changing `tests/phase.test.ts` needs `Test-Change: tests/phase.test.ts <source and reason>`.
- Return a mismatch instead of weakening a criterion.

## 6. Ordered steps

Advisory: 3 files, under 45 turns.

1. `tests/batch-merge.test.ts` first. Fixture pattern: `fixture()` + `leaf()` for holder + 2 member leaves each with a real branch (helper: `git -C <root> branch <slug>`, `git -C <root> worktree add <tmp>/<slug> <slug>`, commit a file change, record `worktree`), a hand-written `batch` in the holder's `state.yaml` (`yaml()`), then drive the CLI. Cover criteria 2-6 + brief criteria: three-member green push with remote log order and phases (criterion 1), `member failed` mid-run → no push (criterion 4), stale `--attempt` refused + remote unchanged (criterion 6), refused push → `fresh checks required` → second `merged` pushes restacked top (criterion 16), red `check.fix` → `batch dissolved, merge solo` + members restored + `solo` + holder still `merge` + subsequent solo `check.fix` moves it (criterion 3), `issue complete` once for a standalone issue inside the batch with no `epic complete` for an unfinished epic (criterion 10), member that changed a `tests/` file without trailer → `merged --check` refusal names the file (per-member range check).
   Count check runs by a `checks` command that appends to a file, e.g. `checks: { count: 'sh -c "echo x >> $AKROGON_COUNT"  && exit 0' }` with the file read after.
2. `src/phase.ts` + `src/akrogon.ts`.
3. Run commands until green.

## 7. Commands

`AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000`

Also `bun test tests/batch-merge.test.ts tests/phase.test.ts --timeout=30000`. Run `bun install` first.

## 8. Done-when, evidence and report

All criteria green; pasted outputs. Commit on the worker HEAD, return commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
