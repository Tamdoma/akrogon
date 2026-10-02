# Review A: env-link

Base: `b2c15ec5d2fe889e158934b084dd93cfeafc9f72`
Reviewed head: `11c6d79805983dd7d4be1058b2dcce5baa9bc07c` (4 commits, clean worktree)

## What was checked

- `git diff b2c15ec..HEAD`: `src/next.ts` (+30: `linkEnv`, call in `ensureWorktree`, two fs imports), `tests/helpers.ts` (fixture commits `.gitignore` with `.env`), `tests/next.test.ts` (+146, 10 tests), `tests/init.test.ts` (2 assertions updated), `.gitignore`, `src/AREA.md`.
- Order verified live: in a scratch repo, `git check-ignore -q .env` returns 1 on a tracked-but-ignored `.env`, so `ls-files` must run first — it does (src/next.ts:282-296).
- `linkEnv` is the only worktree-prep path: `ensureWorktree` is the sole caller of `git worktree add`, called by `allocate` before any tab/pane/seat; refusal throws inside `dispatchLeaf`'s catch → `report` → `skipped`, no seat prompted, worktree kept. Matches the locked design verbatim.
- Refusal messages carry path + reason (`Refusing .env link at <path>: …`); criterion 4's "report the path" reads naturally as the refused path (`<repo.root>/.env` for the registered-checkout case — the target path, where the fix goes).
- No `existsSync`/`statSync` on the link; `lstatSync` handles the dangling case correctly.
- `tests/init.test.ts` updates are exact-content edits only; the custom-worktree-root test correctly untouched (it overwrites `.gitignore` itself).
- AREA.md path listing: all named paths exist from repo root. Guide/`next.md` makes no claim about `.env` handling — no documented behavior turned stale.
- No missing `debate` artifacts expected (`debate: no`).

## Evidence

- `bun test --timeout=30000` at `e8b70b3` (pre-format head): 367 pass, 0 fail, 16 files. Format commit `11c6d79` is whitespace-only on `src/next.ts`/`tests/next.test.ts`.
- `bun test tests/next.test.ts -t ".env"` at head: 11 pass, 0 fail (all new criterion tests).
- `bun run typecheck`: clean. `bun run format`: applied.
- `grep -n '^\.env$' .gitignore` → line 7; `git check-ignore -q .env` → exit 0.
- Scratch-repo probe of `ls-files`/`check-ignore` exit codes: see above.
- Intermediate red run (implementation applied, fixture `.gitignore` not yet): 118 refusals across `next.test.ts` — confirms `linkEnv` fires on every dispatch, then 349/349 after the fixture commit.

## Findings

### Nits

- **N1 — TOCTOU between `lstatSync` and `symlinkSync`** (src/next.ts:298-303). A concurrent process creating `.env` in that window yields a raw `EEXIST` error instead of the `Refusing .env link …` message. Realistic source: a second process writing the same worktree file in the same instant — handcrafted timing only; observed consequence is still a refusal (dispatchLeaf catches, no seat, path unchanged), just an untyped message. Deferred: no data loss, dispatch is retried on the next pass anyway. Promote to Fix if a real concurrent writer to leaf worktrees appears.
- **N2 — leaf branches created before a repo's `.env` ignore rule refuse dispatch until rebased.** The worktree's `.gitignore` comes from the leaf's own branch, so a leaf branched before the rule lands keeps refusing `not ignored by git` even after the registered checkout ignores `.env`. Consequence today: such a leaf stalls on dispatch with a self-describing error; recovery is `git rebase` on the leaf branch. Deferred: this is the locked two-check design verbatim (the fork excluded alternatives), not an implementation defect. Promote only by design change, e.g. checking the tracked `.gitignore` at the merge base instead of the branch's.

## Verdict

`nits` — no Fix-grade defect; all six done-criteria have passing proof on the reviewed head.
