# Brief 2: run-check closed/closing refusal and reconcile keep (unit U2)

## 1. Goal

Make `checkedRun` in `src/run-check.ts` refuse targets under a closed or closing owner at start and again right before publish, keeping the captured `out.log`; make `src/reconcile.ts` report a refused run folder as kept (plan decisions D3, D4).

## 2. Numbered acceptance criteria

1. `bun test tests/close-pack.test.ts -t 'run-check refuses'` passes, covering all of:
   - `run-check --leaf <path under issues/closed>` exits non-zero naming `closed`, command output absent.
   - `run-check --leaf <open leaf>` whose owner holds `.closing` exits non-zero before the command runs (marker file absent, `implementation/` not created).
   - A run whose leaf merges mid-command (the command runs `akrogon phase <slug> merged`) exits non-zero with stderr naming the run root's `out.log`, `out.log` holds the pre-close output, `refusal.json` sits in the surviving run root, `.owner` is gone, `issues/open/<owner>` is not recreated, and `readKept` after `akrogon next` reports the run root kept with a non-empty reason.
   - `run-check --holder <issues/chart/<chart>/direct>` still succeeds.
2. `bun test tests/run-check.test.ts` stays green.
3. `bun test tests/reconcile.test.ts` stays green.

## 3. Read-first list

- `src/run-check.ts` `checkedRun` — run root, `.owner`, `spawnLogged`, publish block (`mkdirSync(target)` + `copyFileSync`), `finally rmSync(runRoot)`.
- `src/evidence.ts` — `locate(recorded, cwd, repo)` returns `{ ownerDirs, member }` or null: three dirs `[open, closed, parked]` for owner areas, ONE dir for `issues/chart/.../direct`.
- `src/reconcile.ts` — scratch sweep over `leafTemp` run folders: `refusal.json` handling goes beside the existing `.owner` branches; `keep(path, reason)` is the reporting channel; `readKept(repo)` reads the written report.
- `tests/close-pack.test.ts` test 'run-check refuses...' — exact expected artifacts (`refusal.json` containing the slug, `out.log` named in stderr).
- `tests/reconcile.test.ts` run-root cases (~line 205).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/run-check.ts`, `src/reconcile.ts`. No prerequisites; nothing shares these paths this wave.

In `src/run-check.ts`:

```ts
export class PublishRefusedError extends Error { /* names target, owner state, out.log */ }
```

- Helper (small function, e.g. `closingOwner(target, repo)`): `const t = await locate(target, repo.root, repo)`; `t === null || t.ownerDirs.length === 1` → not refused (chart holder or outside `issues/`). Otherwise `open = t.ownerDirs[0]`, `closed = t.ownerDirs[1]`:
  - early rule: `existsSync(closed)` or `existsSync(resolve(open, '.closing'))` → refuse.
  - late rule: `!existsSync(open)` or `existsSync(closed)` or `existsSync(resolve(open, '.closing'))` → refuse.
- Early check: in `checkedRun`, before `mkdtempSync`. Throw `PublishRefusedError`.
- Late check: inside the `withAdmission` callback, immediately before `mkdirSync(target, { recursive: true })` — i.e. after `spawnLogged` returned and stdout/stderr were echoed. On refusal: `writeFileSync(resolve(runRoot, 'refusal.json'), JSON.stringify({ reason }))` where reason names the target and the owner state; `rmSync(resolve(runRoot, '.owner'))`; set a `refused` flag the outer `finally` reads to skip `rmSync(runRoot)`; throw `PublishRefusedError` whose message names `join(runRoot, 'out.log')`. Do not `mkdirSync(target)`, do not `copyFileSync`, do not append `check_end`.

In `src/reconcile.ts`, in the run-folder loop before the `!existsSync(ownerFile)` branch: if `refusal.json` exists in the run root, `keep(runRoot, 'publish refused: ' + reason)` reading `reason` from the file (`z.object({ reason: z.string() })` or a plain JSON parse with the same tolerance the `.owner` parse shows — mirror existing style); on parse failure keep with `'publish refused'`. `.owner` is already absent on that path.

## 5. Do-not, reasons and exceptions

- No tests written or edited — `tests/close-pack.test.ts` is committed; a wrong or red planned test is a mismatch returned to A.
- Do not touch `src/pack.ts`, `src/phase.ts`, `src/sync.ts`, `src/init.ts`, `src/evidence.ts` — owned by sibling units or another leaf; a needed change there is a mismatch.
- Do not refuse chart-direct targets even when a `.closing` sits there — held disagreement resolved per evidence-location Taken item 4 (explicit chart holders stay allowed); the criterion requires acceptance.
- Do not remove the run root on refusal — the captured `out.log` must survive reconcile.
- `verify`'s `mkdirSync(caller.target)` before `checkedRun` is untouched.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change. These exclusions exist because sibling units own sibling files and the plan locks the interfaces; the only exception is a revised brief from A.

## 6. Ordered steps

1. Add the refusal helper and `PublishRefusedError` to `src/run-check.ts`; wire early and late checks (criteria 1a–c).
2. Add the `refusal.json` keep branch to `src/reconcile.ts` (criterion 1c tail).
3. Run the targeted tests (section 7); repair only within owned paths.

Advisory size: about 2 files and under 10 turns.

## 7. Commands

From the worker worktree root:

- `bun install --frozen-lockfile` first.
- `bun test tests/close-pack.test.ts -t 'run-check refuses'`
- `bun test tests/run-check.test.ts`
- `bun test tests/reconcile.test.ts`

## 8. Done-when, evidence and report

All criteria in section 2 green; commits on the worktree HEAD; report cites `akrogon run-check` lines (`akrogon run-check --name <label> -- <cmd>` keeps output; `akrogon log <path>` reads a cited log) for every test command run. Changing an existing file matched by `src/test-files.ts` requires a `Test-Change:` trailer; your owned paths include none — write and edit no test.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
