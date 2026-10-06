# Brief U1 — record-only-reuse decision engine and tests

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/record-only-reuse-u1` (detached at lane HEAD `43729a6`). Edit and commit only there.

## 1. Goal

Implement plan.md D1–D6: when the batch push is refused non-fast-forward, the command restacks, evaluates three equality conditions outside the record folders, and prints `reuse` (the green check run stays valid) or `rerun` (fresh checks required). A restack conflict always means `rerun`. Replaces every `fresh checks required` print.

## 2. Acceptance criteria

From the leaf brief's done-criteria (numbers preserved):

1. A record-only commit to `main` during a batch run ends in one check run total and a push. Print: `reuse tested=<T1-sha> pushed=<T2-sha>`; record holds `tested_top=T1`, `candidate=T2` (after the final `merged`), `decision='reuse'`, `built_on=M2`, `top=T2`.
2. A one-line code commit to `main` ends in a second run: prints `rerun tested=<T1> pushed=<T2>`.
3. A `main` commit matching part of a member's change fails condition (i) and reruns (member's commit drops empty on restack so (ii) can still pass — the test asserts `rerun` anyway).
4. A change to `issues/config.yaml` on `main` reruns.
5. A restack conflict, including one in `learnings/history/*`, prints `rerun`, and nothing is pushed until a new check run on the new top is green.
6. Printed line and batch record carry tested SHA, pushed SHA and decision (assert on stdout and `readState`).
7. A second refused push after a `reuse` compares against the original tested main and top: advance main record-only again → `merged` (gate accepts `head===top` on a reuse record) → `reuse tested=T1 pushed=T3`; `record.tested_top` still T1.
8. Same `reuse` decision when `cli` cwd is a new empty subdirectory inside the holder worktree.
- Plus updated existing tests: the refused-push test (~line 283), member-conflict restack test (~line 624), and the `fresh checks required` assertions in `tests/batch-merge.test.ts` and `tests/batch-dispatch.test.ts` match the new lines.

Printed contract (exact, from D6):
- `reuse tested=<T1-sha> pushed=<T2-sha>`
- `rerun tested=<T1-sha|none> pushed=<T2-sha>` — `none` when refused before any `--check`
- `rerun rebase <slug> onto <M2-sha>` — holder-conflict and dirty-holder endings only (same shape as today's `fresh checks required rebase`, word swapped)

## 3. Read-first list

- `src/phase.ts` — `batchCheck` (tested write ~line 414), `batchPush` (slot gate ~451, `candidate: head` ~454, refusal write ~465), `restack` (three print sites ~604/608/634, successful-apply saveState ~570), `finishPush` (lost-reply ~679).
- `src/state.ts` — `batchSchema`.
- `src/batch.ts` — helpers `run`/`command`/`CommandError`/`Result` usage; new diff helpers go here.
- `src/next.ts` — `reconcileBatch` ~line 808: treats `applied && candidate !== undefined` as push-pending and dissolves when the candidate has not landed.
- `tests/batch-merge.test.ts` — `batchFixture`, `soloFixture`, `branchAt`, `remoteTip`, `remoteSubjects`, `stateBytes` (file-local helpers).
- `tests/helpers.ts` — `fixture`, `cli(f, args, cwd, env)`.
- `tests/batch-dispatch.test.ts` ~line 176.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

`src/state.ts`: `batchSchema` += `tested_main: z.string().optional()`, `decision: z.enum(['reuse', 'rerun']).optional()`.

`src/batch.ts`: add two exported helpers.
```ts
export async function equalOutsideRecordFolders(repo: Repo, a: string, b: string): Promise<boolean>
export async function recordConfigEqual(repo: Repo, a: string, b: string): Promise<boolean>
```
Both run `git diff --quiet <a> <b> -- <pathspecs>` via `run` in `repo.root`; code 0 → true, 1 → false, else throw `CommandError`. Pathspecs for the first: `':(top)'`, `':(top,exclude)issues'`, `':(top,exclude)learnings'`; for the second: `':(top)issues/config.yaml'`.

`src/phase.ts`:
- `batchCheck`: write `tested_top`/`tested_main` only when `record.decision !== 'reuse'`. `tested_main` = `git merge-base <head> <trackingRef>` (one `command` call, correct for applied and solo records).
- `batchPush` slot gate: `head === record.tested_top || (record.decision === 'reuse' && head === record.top)`. Refusal write: also clear `tested_main` and `decision` (it already clears `tested_top`, sets `applied:false`, keeps `candidate: head`). `pending.record` passed onward is the pre-clear copy — the decision evaluation reads the originals from it.
- `restack`: add `let conflicted = false`, set it in every `!staged.ok` iteration (member conflict, holder conflict). On `staged.ok`, before the locked apply, evaluate (M1=`record.tested_main`, M2=`builtOn`, T1=`record.tested_top`, T2=`staged.top`):
  - `outsideMain = await equalOutsideRecordFolders(repo, M1, M2)`
  - `outsideTop = await equalOutsideRecordFolders(repo, T1, T2)`
  - `configSame = await recordConfigEqual(repo, M1, M2)`
  - `reuse = outsideMain && outsideTop && configSame && !conflicted && record.tested_top !== undefined && record.tested_main !== undefined`
  Evaluate the diff calls only when the tested fields exist; skip and treat as `rerun` otherwise.
  Inside the existing locked apply saveState: reuse adds `candidate: undefined`, `tested_top: T1`, `tested_main: M1`, `decision: 'reuse'`; rerun adds `tested_top: undefined`, `tested_main: undefined`, `decision: 'rerun'`, `candidate: undefined`. **Never set `candidate` outside `batchPush`** — see reconcile note above; this is the trap.
  After apply: print `reuse tested=<T1> pushed=<T2>` or `rerun tested=<T1|none> pushed=<T2>` as appropriate. The 'rebuild' continue path recomputes; conflict paths print `rerun rebase <slug> onto <builtOn>` and in their locked saveStates clear `tested_top`, `tested_main`, set `decision: 'rerun'`.
- `finishPush`: unchanged (still calls `restack` after the lost-reply check).

`tests/batch-merge.test.ts`: add file-local `advanceRemote(f, files: Record<string,string>): Promise<string>` (detached worktree on `origin/main`, write each file with `mkdirSync(dirname(...))` parents, `git add .`, commit `adv`, `git push origin HEAD:main`, `git worktree remove --force`, return new tip SHA). Update the three stale assertions to the new lines (`/^rerun tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/` where checked first; parse `pushed=` value for the new top; member-conflict test keeps its assertions). New serial tests, one per criterion:
- C1: counter file `resolve(f.home, 'check-count')` appended once before `--check`; advance `issues/open/x/state.yaml` and `learnings/history/y.md`; `merged` → `reuse tested=T1 pushed=T2` (T1 = `record.top`, capture from `readState`/remote); counter still 1; rerun `merged --check` + `merged` (this models B's seat calls — `--check` returns 0 without a counter append) → remote tip = T2; record fields asserted (tested_top=T1, candidate=T2, decision='reuse', built_on=M2).
- C2: same but advance edits `file` → `rerun tested=T1 pushed=T2`; append counter again (seat reran checks), recheck + `merged` lands T2.
- C3: advance writes `file-mem-a` with identical content `'mem-a\n'` → `rerun` (member commit drops empty; the second condition could pass — condition i must force rerun).
- C4: advance commits `issues/config.yaml` (untracked in fixture repo — writing it inside the advance worktree tracks it on main) → `rerun`.
- C5: `batchFixture(f, [...], {}, {'mem-a': 'learnings/history/shared.md'})` then advance commits the same path → member conflict on restack → `rerun`, member dropped to solo and restored, `git show T2:learnings/history/shared.md` has main's content, remote tip unchanged until recheck+push. Also keep the existing member-conflict (`conflict-file`) case working.
- C7: after C1-style reuse, `advanceRemote` record-only again → `merged` again → `reuse tested=T1 pushed=T3`; `tested_top` still T1.
- C8: C1 variant with `cli` called from `resolve(holder.state.worktree!, 'subdir')` created empty via `mkdirSync` — same `reuse` stdout.
- C6: covered by stdout+record assertions inside C1/C2 tests; no standalone test needed.

`tests/batch-dispatch.test.ts` ~line 176: update to `rerun rebase cc onto <sha>`-shaped assertion (it does not run `--check` first on that holder record — assert `toContain('rerun')` and the record's solo shape as today).

## 5. Do-not, reasons and exceptions

- Never write `candidate` in `restack` or `batchCheck` — `reconcileBatch` dissolves a record with `applied && candidate` whose candidate is not on the remote. Exception: none.
- Never compare against `built_on` as "old main" after a first reuse — `built_on` moves to M2; `tested_main` is the invariant. Exception: none.
- Do not weaken existing assertions to keep them passing; update them to the new printed contract and state fields. Exception: none.
- Do not add config knobs, settings, or fixtures beyond `advanceRemote` — record folders are fixed by design. Exception: none.
- Do not touch `docs/` or `skills/` — a second unit owns them after these lines land. Exception: none.
- A mismatch (conflicting requirement, wrong interface, outsized scale) returns to A with evidence instead of a scope change. Exception: a revised brief from A.

Restated: candidate is push-attempt-only; tested_main/tested_top are the comparison invariant; no scope creep; conflicts return as mismatches.

## 6. Ordered steps

1. `src/state.ts` schema keys. 
2. `src/batch.ts` two diff helpers.
3. `src/phase.ts` `batchCheck` conditional tested write, `batchPush` gate + refusal write, `restack` decision and prints.
4. `advanceRemote` helper; update three stale assertions.
5. New tests C1–C5, C7, C8 (test names may name the criterion).
6. Run the changed-tests command; also run `bun test tests/batch-merge.test.ts tests/batch-dispatch.test.ts` fully since the suite is serial and these files changed.
7. Deliberate break: comment out the `recordConfigEqual` conjunct, confirm the C4 test fails, restore.

Advisory size: ~4 source/test files, under 60 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/record-only-reuse-u1
bun install  # if node_modules absent
AKROGON_BASE=43729a61d82935f52739ac727bd7bfcfd100e945 bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/batch-merge.test.ts tests/batch-dispatch.test.ts --timeout=30000
```

## 8. Done-when, evidence and report

All new and updated tests pass; the deliberate break turns the `issues/config.yaml` test red and is reverted; commits land on the worker worktree's detached HEAD; every commit changing an existing test file carries a `Test-Change: tests/<file> <source and reason>` trailer in its final trailer block (new tests added inside existing files cite what was added and that no existing expectation changed). Return:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
