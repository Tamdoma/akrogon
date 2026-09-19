# Implementation report: foreign-leaf-summary

Base: e624357e825e21b38a15c07a435b1ff066c6ba38
Head: 3d4b4b5d9da4f318ce6f9bbc8f4bb1bd5b1f3f37 (branch `foreign-leaf-summary`)

## Repair history

- Rebase onto `origin/main` c8dac2a: `88ca7ee` → `4e2356d` (clean).
- `3d4b4b5` — repair for merge rebase finding: upstream `c8dac2a` added ` leaf=<path>` to dispatch prompts; capacity test now asserts `leaf=${f.root}/issues/open/issue/healthy` and `leaf=${g.root}/issues/open/issue/other-healthy`, matching the sibling pattern at tests/next.test.ts:1163. Post-repair: `bun test --changed` 110/0, `bun test` 228/0, format and typecheck clean.

## Changed files and reasons

- `src/next.ts` — `Inventory` gains `foreign: { path, stored }[]`; `discover()` collects parsed-but-foreign leaves there instead of throwing `RepoMismatchError` per leaf, then emits one dedup'd JSON summary line per repo per invocation (`{repo, path, error, count, paths}`) via `invocation.skipped`, which also drives `exitCode = 1`; `selectLeaves()` quiet return covers `foreign` so `next <foreign-slug>` exits 1 without dispatch. `activeCount()` untouched — foreign leaves contribute 0 by construction. `RepoMismatchError` import dropped (still used by `state.ts`/`status.ts`).
- `tests/next.test.ts` — `skipSchema` gains optional `count`/`paths`; mismatch branch of the `duplicate|mismatch` loop and the `wrong-key` test updated to the summary shape; six new tests: summary dedup across repeated discovery (3 leaves, 2 stored keys), capacity exclusion with two repos (`max_active: 2`, 5 foreign + 2 healthy dispatch), lookup/dispatch exclusion (`blocked-by` on foreign slug, `next <foreign-slug>` fails, bytes unchanged), conservative unreadable path (malformed still counts `leaves + unreadable`), merged foreign leaf survives cleanup (state bytes, worktree, branch, tab intact), two repos × two invocations (one summary per repo per run, exit 1 both times).
- `src/AREA.md` — one non-obvious-pattern line for the foreign-leaf summary.
- `docs/guide/problems.html` — one `table.wrong` row for the summary line.

## Commands run

- `AKROGON_BASE=e624357e825e21b38a15c07a435b1ff066c6ba38 bun test --changed="$AKROGON_BASE"` — 86 pass, 0 fail (worker 1: 80 pass before new tests).
- `bun run format` — clean.
- `bun run typecheck` — `tsc --noEmit` exit 0.
- `bun test` (full suite, as B) — 224 pass, 0 fail, 12 files, 52s.

## Workers

- Worker 1 (`implementation/brief-1.md`): `src/next.ts` change + `skipSchema` + two updated tests. Report verified against diff.
- Worker 2 (`implementation/brief-2.md`): six new tests + two doc edits. Report verified against diff.

## Known limitations

- `akrogon status`/`phase` still fail hard on foreign leaves via `allLeaves()` — locked by criterion 7.
- The summary reprints every invocation; no remembered reported state (chart off-route).
- Foreign-leaf import belongs to the framework repo's `admin-factory-update` leaf.

## Unverified criteria

None. All 11 done-criteria have test or diff evidence.
