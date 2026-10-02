# Plan: env-link

`debate: no`; synthesized directly from the locked brief and design.

## Decisions

- D1: `ensureWorktree` calls `linkEnv(repo, path)` at its end on both the new-worktree and existing-worktree paths, before `saveState`. Target is the absolute `resolve(repo.root, '.env')`. (design, binding 1a)
- D2: `linkEnv(repo: Repo, worktree: string): Promise<void>` checks in order: `git ls-files --error-unmatch .env` in the worktree (tracked: refuse), `git check-ignore -q .env` in the worktree and in `repo.root` (either not ignored: refuse), then `lstatSync(resolve(worktree, '.env'))` (absent: `symlinkSync(target, link)`; symlink whose `readlinkSync` equals the target: keep; anything else: refuse).
- D3: `git ls-files` and `git check-ignore` run through `run()`, not `command()`: exit 1 is a verdict, exit 0 the opposite. Any other code throws `CommandError` (same pattern as the `git show-ref` probe in `ensureWorktree`).
- D4: Refusals throw `Error` containing the absolute worktree `.env` path and a reason phrase (e.g. `Refusing .env link at <path>: tracked file`, `: different link target <readlink>`, `: not gitignored`). The existing catch in `dispatchLeaf` reports and skips; the worktree and branch created before the refusal stay and are reused next dispatch via the `existsSync` branch.
- D5: `lstatSync`/`readlinkSync`, never `existsSync`: `existsSync` follows links and would misread the dangling link (criterion 3) as absent and overwrite it. Add `symlinkSync`, `readlinkSync` to the `node:fs` import; `lstatSync` is already imported.
- D6: `tests/helpers.ts` `fixture()` commits a `.gitignore` containing `.env` (write before the existing `git add .`); refusal tests remove that rule deliberately. Repo-root `.gitignore` gains a `.env` line.
- D7: Scope exclusions per design: no `.env.*` handling, no presence check of the target (dangling counts as missing and stays dangling), no seat-prompt or `src/init.ts` changes, no writes through the link. `cleanupMerged`'s `git worktree remove --force` already deletes only the link.
- D8: Open limitation, preserved for review: a registered checkout whose `.env` is not gitignored refuses every dispatch, and `init` does not add the rule; repos initialized later must add `.env` to their own `.gitignore`. Akrogon's own root is fixed by D6.

## Implementation notes

- 2026-10-02: criterion 6's fixture `.gitignore` commit makes the exact-content `.gitignore` assertions in `tests/init.test.ts` stale (they expect only init-generated lines). U2 updates those assertions to include the fixture's `.env` line; no locked decision changes.

## Read-first

- `src/next.ts`: `ensureWorktree`, `allocate`, `dispatchLeaf` catch → `report` → `skipped`.
- `src/shell.ts`: `run`, `command`, `Result`, `CommandError`.
- `src/config.ts`: `Repo` (`name`, `root`, `config`), `worktreeStore`.
- `tests/helpers.ts`: `fixture`, `cli`, `leaf`, `fakeHerdr`, `DispatchFixture` pattern.
- `tests/next.test.ts`: `dispatchFixture`, `next()`, `database()`, `skips()`, and the `next dispatches an explicit worktree path` test (manual `git worktree add` precedent).
- `tests/init.test.ts`: `git check-ignore` usage precedent.

## Interfaces

- `linkEnv(repo: Repo, worktree: string): Promise<void>` — new, in `src/next.ts`, called only from `ensureWorktree`.
- No exported or cross-file interface changes.

## Waves

Wave 1 (independent, disjoint paths):

- U1 `src/next.ts`: add `linkEnv` and its call in `ensureWorktree` per D2–D5.
- U2 `.gitignore`, `tests/helpers.ts`, `src/AREA.md`: root `.gitignore` gains `.env`; fixture commits a `.gitignore` ignoring `.env`; `src/AREA.md` gains one non-obvious-pattern line ("a leaf worktree's `.env` is a symlink to the registered checkout's file; dispatch refuses a real file, tracked path, foreign link or missing ignore rule").

Wave 2 (depends on both wave-1 units):

- U3 `tests/next.test.ts`: new tests per criteria 1–5 below. Owns no other file. No shared test resource: every test builds its own fixture tmpdir.

## File/criterion checklist

- `src/next.ts` (U1) — criteria 1–5 behavior.
- `.gitignore` (U2) — criterion 6, first half.
- `tests/helpers.ts` (U2) — criterion 6, second half.
- `src/AREA.md` (U2) — doc line.
- `tests/next.test.ts` (U3) — criteria 1–5 proofs:

1. Dispatch a new leaf: `lstatSync(<worktree>/.env).isSymbolicLink()` and `readlinkSync` equals `resolve(f.root, '.env')`; create `f.root/.env` before dispatch, `appendFileSync` a line after, and read it back through the link.
2. Reuse: dispatch, `rmSync(<worktree>/.env)`, dispatch again — link recreated; and a pre-made link (`symlinkSync(target, link)` before dispatch) is byte-identical after dispatch (`readlinkSync` unchanged). Reuse dispatches need the leaf state to allow re-prompting (`saveState` clearing `prompted`/`done`, `resetPrompts` helper exists) or use a second leaf whose worktree was made by `git worktree add -b`.
3. No registered `.env` (fixture default): after dispatch `lstatSync(...).isSymbolicLink()` is true and `existsSync(f.root + '/.env')` is false (dangling).
4. Refusal cases, each as its own test against `next(f, [slug])`: worktree `.env` real file; worktree `.env` tracked (`git add`+commit in a manually-added worktree); worktree `.env` symlink to another target; `.env` not ignored in the worktree (rewrite worktree `.gitignore` dropping the `.env` line); `.env` not ignored in the registered checkout (rewrite `f.root/.gitignore`). Each asserts: `result.code !== 0`, `skips(result)[0].error` contains `<worktree>/.env` and the reason phrase, the pre-existing path is byte-identical (or still absent for the ignore cases), `database(f).prompts` and `database(f).starts` are empty. For the created-before-refusal cases make the worktree with `git worktree add -b <slug> <path>` first; one case should also verify a subsequent clean dispatch reuses that worktree and branch.
5. Merge cleanup: dispatch, create `f.root/.env` with known content, move the leaf to `merge`/`merged` per the existing merged-leaf tests, run `next(f, ['--all'])`; assert `existsSync(worktree)` is false and `f.root/.env` still holds its original content.
6. Root `.gitignore` contains a `.env` line; fixture repo commits a `.gitignore` ignoring `.env` (proven implicitly by every passing dispatch test; asserted directly by `git check-ignore -q .env` exiting 0 inside a fixture repo if a dedicated assertion is wanted).

## Docs

- `src/AREA.md`: one line added (U2). `tests/AREA.md`, `docs/reference-index.md`, README/guide: unaffected — no command surface, flag, or doc-visible contract changes.

## Verification

| Criterion | Proof command | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1–5 | `bun test tests/next.test.ts` | regressions in link creation, reuse, dangling, refusals, cleanup | minutes | any edit to `src/next.ts` or `tests/next.test.ts` |
| 6 (root) | `grep -n '^\.env$' .gitignore && git check-ignore -q .env` in the worktree root | missing or malformed ignore rule | seconds | `.gitignore` edit |
| 6 (fixture) | covered by criterion 1–4 tests refusing to run without it | fixture missing the ignore rule | — | `tests/helpers.ts` edit |
| types | `bun run typecheck` | untyped helper, wrong signatures | seconds | any `src/` edit |
| format | `bun run format` | style drift | seconds | any edit |
| suite | `bun test --timeout=30000` (configured `checks.test`) | cross-file breakage from the fixture `.gitignore` commit | minutes | before handoff |

Not a slow-run leaf; `tests/next.test.ts` is the restart boundary — rerun it whole.
