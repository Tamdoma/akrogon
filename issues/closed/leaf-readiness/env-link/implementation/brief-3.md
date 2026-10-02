# Sub-brief: env-link U3 — tests/next.test.ts criterion proofs

## 1. Goal

Implement the `tests/next.test.ts` checklist of leaf `env-link` (plan criteria 1–5): prove the `.env` symlink behavior and every refusal through `akrogon next` against the fixture repo with fake herdr.

The implementation under test (already landed): `ensureWorktree` calls `linkEnv`, which refuses tracked `.env`, `.env` not gitignored in the worktree or in the registered root, a real file at `<worktree>/.env`, or a link to another target; it creates `<worktree>/.env` as a symlink to `<f.root>/.env` otherwise, keeping an existing correct link and never creating the target. Refusals throw `Refusing .env link at <path>: <reason>`, surface via `skips(result)[0].error`, leave the worktree and branch in place, and prompt no seat. The fixture repo commits `.gitignore` containing `.env`.

## 2. Numbered acceptance criteria (leaf done-criteria 1–5)

1. After dispatch of a new leaf, `lstatSync(<worktree>/.env).isSymbolicLink()` and `readlinkSync` equals `resolve(f.root, '.env')`; after `appendFileSync(f.root/.env, line)`, that line is read back through the link via `readFileSync(<worktree>/.env)`. (Create `f.root/.env` with `writeFileSync` before dispatch.)
2. Reuse: (a) dispatch a leaf, `rmSync` the created link, dispatch again → link recreated; (b) a worktree created beforehand by `git worktree add -b <slug> <path>` in `f.root` with a correct symlink already in place keeps it unchanged (same `readlinkSync` result) across dispatch.
3. With no `f.root/.env` (fixture default), dispatch leaves `lstatSync(<worktree>/.env).isSymbolicLink()` true and `existsSync(resolve(f.root, '.env'))` false — a dangling link.
4. Five refusals, each against `next(f, [slug])`: (a) real file at `<worktree>/.env`, (b) tracked `.env` in the worktree (`git add -f .env` + commit inside a manually-added worktree, since `.env` is gitignored), (c) `<worktree>/.env` symlink pointing at another path, (d) `.env` not ignored in the worktree (rewrite the worktree's `.gitignore` dropping the `.env` line), (e) `.env` not ignored in the registered checkout (rewrite `f.root/.gitignore` dropping the `.env` line). Each asserts: `result.code !== 0`; `skips(result)[0].error` contains the refused path (`<worktree>/.env` for a–d, `resolve(f.root, '.env')` for e) and the reason phrase; the pre-existing path is byte-identical (file content, `readlinkSync`, or still-absent `lstatSync` for d/e); `database(f).prompts` and `database(f).starts` are empty. Cases a–d need a pre-made worktree (`git worktree add -b <slug> <path>`); case e may let dispatch create the worktree and must additionally assert the created worktree still exists, the branch exists (`git show-ref --verify refs/heads/<slug>`), and a follow-up dispatch after restoring `f.root/.gitignore` succeeds and reuses that worktree.
5. Merged-leaf cleanup: dispatch a leaf with `f.root/.env` present, move it to `merge`/`merged` by the existing pattern (`saveState` phase `merge` then `cli(f, ['phase', slug, 'merged'])`, then `next(f, ['--all'])`); assert `existsSync(worktree)` is false and `readFileSync(f.root/.env)` still holds its original content.
6. No test writes or reads a `.env` anywhere outside the fixture tmpdir; all content is synthetic strings.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `tests/next.test.ts` — helpers `dispatchFixture`, `next`, `database`, `skips`, `leaf`, `resetPrompts`; the `` `next dispatches an explicit worktree path` `` test (manual `git worktree add` precedent, ~line 99); the merged-leaf cleanup tests (~lines 1215 and 1234); import block (add `lstatSync`, `readlinkSync` from `node:fs`).
- `tests/helpers.ts` — `fixture()` (commits `.gitignore` with `.env`).
- `src/next.ts` — `linkEnv` for the exact refusal message shape.

## 4. Change list and needed interfaces

- Owned path: `tests/next.test.ts` only. Extend the existing file; add no new test file.
- Depends on wave-1 units (implementation + fixture `.gitignore`), already landed on your base.
- No shared test resource beyond per-test fixture tmpdirs.

## 5. Do-not, reasons and exceptions

- Do not use `existsSync` to assert a link exists — it follows links and misreads the dangling case; use `lstatSync`.
- Do not weaken the refusals into warning-tolerant assertions: code must be non-zero, path and reason must appear in the error, no seat is prompted.
- Do not touch `src/` or `tests/helpers.ts`; if the implementation deviates from section 1, return a mismatch with evidence — a revised brief from A is the only authorization to adapt.
- Do not print or read real `.env` files; fixture content is synthetic strings only.
- Keep refusals realistic prior states (operator-made file, tracked file, stale link, missing ignore rule), per standing design.

Reasons restated: `lstatSync` for links; refusal criteria are exact; scope is `tests/next.test.ts` only and deviations return as mismatch; synthetic `.env` content only; refusals are realistic states.

## 6. Ordered steps

Advisory size: 1 file, under 20 turns.

1. Read the implementation and the named test precedents.
2. Write criterion-1 test (link + read-through-append).
3. Write criterion-2 reuse tests (recreated link; pre-linked worktree unchanged).
4. Write criterion-3 dangling test.
5. Write the five criterion-4 refusal cases — a `for` loop over the lstat-based cases a–d is fine if each keeps its distinct setup; keep case e separate for the reuse follow-up.
6. Write criterion-5 cleanup test.
7. Run the changed-tests command until green; each refusal test should fail if its assertion on path/reason/no-prompt is removed.

## 7. Commands

`AKROGON_BASE=b2c15ec5d2fe889e158934b084dd93cfeafc9f72 bun test --changed="$AKROGON_BASE" --timeout=30000`

Run `bun install` first if `node_modules` is absent in your worktree. If `--changed` selects no file, run `bun test tests/next.test.ts` once.

## 8. Done-when, evidence and report

All criteria proven by tests in `tests/next.test.ts`; the file's suite is green; you committed only `tests/next.test.ts` on the detached worktree HEAD and return the commit id. Report links each criterion 1–5 to its test name.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
