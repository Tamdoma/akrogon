# Brief 2: sync/init test updates and operator docs (plan U2)

## 1. Goal

Align the sync/init test surfaces and every affected operator/agent doc with the home worktree store. Covers plan decisions D7, D8 — the code already landed in U1 commits (`worktreeStore` in `src/init.ts` and `src/sync.ts`); you own the tests and docs. Plan: `issues/open/worktree-isolation/worktree-store/plan.md` in the registered root.

Landed facts you build on (verify by reading, do not redo): `repoSchema.worktree_root` is `text.optional()`; `worktreeStore(repo)` returns `expandPath(worktree_root, repo.root)` when set, else `resolve(homedir(), '.akrogon/worktrees', repo.name)`; `src/init.ts` already calls `worktreeStore({ name: repoName, root, config })` for the gitignore check; `src/sync.ts` already uses `worktreeStore(repo)`; `cli()` in `tests/helpers.ts` sets `HOME: f.home`.

## 2. Acceptance criteria

1. `tests/init.test.ts` reflects the optional `worktree_root`: an init whose config omits `worktree_root` writes no worktree line to `.gitignore` (store lands outside the checkout); a config/proposal with a `worktree_root` inside the root still writes `<rel>/`; an absolute or `~/`-rooted `worktree_root` writes no line. The existing `.gitignore` assertion (`'.env\nissues/worktrees/\nissues/seeds/\n.lock\n'` at ~line 13) is updated for whatever config that test now uses — keep the assertion's intent (in-root store gets ignored), do not delete coverage.
2. `tests/sync.test.ts` stays green under the optional field; the parameterized `worktreeRoot` matrix (~line 37, ~171) keeps its meaning.
3. `docs/guide/setup.md` (~line 57): the `worktree_root` bullet states the default (`~/.akrogon/worktrees/<repo name>`), that `~` is home-expanded, and that only a store inside the checkout is gitignored.
4. `docs/guide/cheat.md` (~line 131) and `docs/guide/limits.md` (~line 27): the example worktree path uses the store form `~/.akrogon/worktrees/widgets/export-csv/` with a short "default worktree store" label — same tone as the existing prose.
5. `README.md` (~line 166): `the configured worktree_root` → wording that reflects the resolved store (e.g. `the worktree store when inside the checkout`) — smallest edit that keeps the sentence true.
6. `skills/init-akrogon/SKILL.md` (~line 25): drop `worktree_root: issues/worktrees` from the proposal template — the default is the store.
7. `skills/chart-issues/SKILL.md` (~line 101): `<worktree_root>/<slug>` → `<worktree_store>/<slug>`; `skills/chart-issues/assets/shapes.md` (~line 40): `under worktree_root` → `under worktree_store`.
8. `src/AREA.md` and `tests/AREA.md`: one line each noting sparse leaf/stack worktrees and/or the `guard` verb where the file's own sections fit; skip if no line is actually stale.
9. `bun test tests/init.test.ts tests/sync.test.ts tests/docs-links.test.ts --timeout=30000` and `bun run typecheck` green in your worktree.

## 3. Read-first list

- `tests/init.test.ts`, `tests/sync.test.ts` (whole files; parameter tables at ~37 and ~171)
- `src/init.ts` (~55-70), `src/sync.ts` (~10-35, ~105-120)
- `src/config.ts` `worktreeStore` (~250), `expandPath` (~194)
- `docs/guide/setup.md` (~50-65), `docs/guide/cheat.md` (~125-135), `docs/guide/limits.md` (~20-30)
- `skills/init-akrogon/SKILL.md` (~20-30), `skills/chart-issues/SKILL.md` (~95-105), `skills/chart-issues/assets/shapes.md` (~35-45)
- `README.md` (~150-170), `src/AREA.md`, `tests/AREA.md`
- `~/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

Owned paths: `tests/init.test.ts`, `tests/sync.test.ts`, `docs/guide/setup.md`, `docs/guide/cheat.md`, `docs/guide/limits.md`, `skills/init-akrogon/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `README.md` (one line), `src/AREA.md`, `tests/AREA.md`.
Prerequisites landed: U1 commits on the leaf branch — `worktreeStore`, optional schema, guard composition, helpers `HOME`.
Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not edit `src/*.ts`, `tests/helpers.ts`, or any test file outside your owned list — U3 is reworking worktree-touching tests in parallel; exception: a needed code change returns as a mismatch with evidence.
- Do not rewrite doc sections or add pages — the smallest edit that makes each statement true; exception: a line that is now false is corrected, never left stale.
- Do not touch `skills/implement-issue/`, `skills/check-issue/`, `skills/merge-issue/`, `skills/plan-issue/` — their worktree paragraphs are the base-run leaf's scope; exception: none.
- Do not weaken test assertions — update expectations to the new truth, never drop coverage silently; exception: a genuinely dead test is removed only with the keeping-test named in the report.
- Restated: no src edits, no foreign test files, no rewrites, no base-run scope; mismatches return to A.

## 6. Ordered steps

1. Read owned files and the landed code; run `bun test tests/init.test.ts tests/sync.test.ts --timeout=30000` for a baseline.
2. Update `tests/init.test.ts` and `tests/sync.test.ts`; run both green.
3. Update docs/skills per criteria 3-8; run `bun test tests/docs-links.test.ts --timeout=30000`.
4. `bun run typecheck`; commit with `Test-Change:` trailers for the two test files; report per section 8.

Advisory size: about 9 files and under 35 turns.

## 7. Commands

`AKROGON_BASE=309d742605a0516067840863ffdf3be29b03fc0c bun test --changed="$AKROGON_BASE" --timeout=30000`
plus `bun test tests/init.test.ts tests/sync.test.ts tests/docs-links.test.ts --timeout=30000` and `bun run typecheck`.
(Unrelated failures inside the `--changed` set belong to U3's in-flight test sweep — judge only your owned files.)

## 8. Done-when, evidence and report

Owned tests green with pasted results; every stale doc line corrected; commits carry `Test-Change:` trailers for `tests/init.test.ts` and `tests/sync.test.ts` citing "worktree-store leaf: optional worktree_root, home store default".

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
