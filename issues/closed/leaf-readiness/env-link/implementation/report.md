# Implementation report: env-link

Base: `b2c15ec5d2fe889e158934b084dd93cfeafc9f72` (AKROGON_BASE)
Head: `11c6d79` on branch `env-link`

## Changed files and reasons

- `src/next.ts` — new `linkEnv(repo, worktree)` called at the end of `ensureWorktree` on both new and reused worktree paths before `saveState`. Checks in locked order: `git ls-files --error-unmatch .env` (tracked → refuse), `git check-ignore -q .env` in worktree then `repo.root` (not ignored → refuse), `lstatSync` (absent → `symlinkSync` to `resolve(repo.root, '.env')`; same-target link → keep; else refuse). Refusals throw `Refusing .env link at <path>: <reason>`; non-0/1 git codes throw `CommandError`.
- `tests/helpers.ts` — `fixture()` commits `.gitignore` containing `.env` so dispatch tests exercise the happy path.
- `tests/next.test.ts` — 10 new tests proving done-criteria 1–5 (see below).
- `.gitignore` — repo root gains `.env` (akrogon's own checkout was not ignoring it; without it the new refusal would block akrogon's own dispatch).
- `src/AREA.md` — one non-obvious-pattern line documenting the link + refusal contract.
- `tests/init.test.ts` — two exact-content `.gitignore` assertions updated to include the fixture's `.env` line (implementation note in plan.md; no behavior change).

## Done-criteria → evidence

1. Link created, read-through append → `a dispatched worktree links .env to the registered checkout and reads appended lines`.
2. Reuse: deleted link recreated → `dispatch recreates a deleted .env link in a reused worktree`; existing correct link untouched → `a pre-linked worktree keeps its .env link unchanged across dispatch`.
3. No registered `.env` → dangling link, no target → `without a registered .env the worktree gets a dangling link and no target is created`.
4. Refusals → `next refuses an .env link over real file | tracked file | stale link | unignored` (path + reason, byte-identical prior state, no prompts/starts) and `next refuses to link .env not ignored in the registered checkout, keeps the worktree, and reuses it after the ignore rule returns` (worktree + branch kept, reused on next dispatch).
5. Merged cleanup → `merged leaf cleanup removes the worktree and leaves the registered .env untouched`.
6. Root `.gitignore` `.env` line → `grep -n '^\.env$' .gitignore` → `7:.env`; `git check-ignore -q .env` → exit 0. Fixture commits `.gitignore` with `.env` → asserted transitively by every passing dispatch test.

## Commands run (all on lane HEAD)

- `AKROGON_BASE=b2c15ec… bun test --changed="$AKROGON_BASE" --timeout=30000` → 359 pass, 0 fail, 13 files (~10s).
- `bun test --timeout=30000` (configured `checks.test`) → 367 pass, 0 fail, 16 files, wall 11.9s.
- `bun run typecheck` (`checks.typecheck`) → clean (~1s).
- `bun run format` (`checks.format`) → applied; cosmetic diff committed as `11c6d79`.
- `grep -n '^\.env$' .gitignore` + `git check-ignore -q .env` → line 7, exit 0.

## Workers

- U1 `src/next.ts` → `c5257e9` cherry-picked as `81b2c1d` (wave 1).
- U2 `.gitignore`/`helpers.ts`/`AREA.md`/`init.test.ts` → `a925960` cherry-picked as `32ad6eb` (wave 1).
- U3 `tests/next.test.ts` → `d996b7e` cherry-picked as `e8b70b3` (wave 2, ran at base `32ad6eb`).
- Mid-landing check: with only U1 applied, `bun test tests/next.test.ts` showed 118 refusals — confirmed `linkEnv` fires on every dispatch; green again after U2.

## Known limitations

- Repos initialized without `.env` in their `.gitignore` now refuse dispatch; `akrogon init` does not add the rule (locked scope — preserved as plan limitation D8). Operator adds `.env` to the checkout's `.gitignore`.
- `readlinkSync` comparison is exact-string; a relative link to the same file refuses by design (design decision, verbatim).
- `.env.*` files are not linked (locked exclusion).

## Unverified criteria

None.
