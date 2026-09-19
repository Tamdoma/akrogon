# Plan: foreign-leaf-summary

One JSON summary line per repo per invocation for leaves whose parsed `state.repo` differs from the registered key; foreign leaves leave dispatch, cleanup, dependency lookup and `max_active`. All other unreadable causes keep per-leaf lines and conservative capacity.

## Decisions

- D1: `Inventory` becomes `{ leaves: Leaf[]; unreadable: number; unknown: boolean; foreign: { path: string; stored: string }[] }`. In `discover()`, a leaf that parses but has `state.repo !== repo.name` is pushed to `foreign` — no `RepoMismatchError` throw, no per-leaf `report()`, no `unreadable` increment. `RepoMismatchError` stays in `src/state.ts` for `allLeaves()`/`status.ts`/`phase.ts`.
- D2: At the end of `discover()` (after the duplicate-slug pass), if `foreign.length > 0` and `invocation.skipped` lacks key `repo.name`, emit one stderr line via `console.error(JSON.stringify(...))` shaped `{ repo, path, error, count, paths }`: `path` is the first foreign path (keeps `skipSchema` parsing), `count` is `foreign.length`, `paths` is `[{ path, stored }]`, `error` names the registered key and count (e.g. `Foreign leaves in repo "repo": 3 leaves stored under other keys`). Add `repo.name` plus each `${repo.name}/${path}` to `invocation.skipped` — this gives per-repo-per-invocation dedup across the repeated `discover()` calls (sweepAll runs it twice, cleanupRepos once, activeCount once per allocation) and makes `process.exitCode` 1 through the existing `invocation.skipped.size > 0` check.
- D3: `activeCount()` is untouched. Foreign leaves sit outside `leaves` and `unreadable`, so they contribute 0; a repo with malformed leaves still contributes `leaves.length + unreadable`.
- D4: `selectLeaves()` quiet return gains `inventory.foreign.length > 0` next to `unreadable`/`unknown`, so `next <foreign-slug>` exits 1 with only the summary line instead of throwing `Missing leaf`.
- D5: No signature changes elsewhere. `lookup()`, `sweep()`, `cleanupRepos()`, `paneOwners()`, the `tab_closed` owner scan and `dispatchLeaf()` all read `inventory.leaves`, which already excludes foreign leaves. `dispatchLeaf`'s `state.repo !== repo.name` re-check stays as a guard for leaves that flip identity mid-dispatch.
- D6: `src/status.ts`, `src/state.ts`, `src/init.ts`, `src/phase.ts` are not modified.
- D7: `skipSchema` in `tests/next.test.ts` gains `count: z.number().int().optional()` and `paths: z.array(z.object({ path: z.string(), stored: z.string() })).optional()` so tests can assert the new fields; the object stays non-strict so old lines still parse.
- D8: Docs: add one line to `src/AREA.md` non-obvious patterns (foreign leaves are summarized per repo and excluded from capacity) and one row to the `docs/guide/problems.html` table for the summary line. No existing guide prose describes the per-leaf mismatch error.

## Read first

- `issues/open/foreign-leaf-diagnostics/foreign-leaf-summary/brief.md` and `design.md`
- `src/next.ts` — `Inventory`, `report()`, `discover()` (mismatch throw at the `readState` site), `activeCount()`, `selectLeaves()`, `sweepAll()`, `cleanupRepos()`, `nextCommand()` exit-code tail
- `src/state.ts` — `RepoMismatchError`, `readState`, `allLeaves` (unchanged consumers)
- `tests/next.test.ts` — `dispatchFixture`/`next()`/`configure()` (top and ~938), `skipSchema`/`skips()` (~934), mismatch tests (~1098-1140), two-repo `--all` test (~860), capacity test (~1043), merged-cleanup tests (~631, ~882)
- `tests/helpers.ts` — `fixture()`, `leaf()`, `cli()`, `yaml()`
- `tests/fake-herdr.ts` — workspaces `w1`/`w3`, tabs/panes/prompts db
- `src/AREA.md`, `docs/guide/problems.html`
- `learnings/LESSONS.md`

## Interfaces

- `Inventory.foreign: { path: string; stored: string }[]` — populated only by `discover()`.
- Foreign summary line: `{"repo":<registered>,"path":<first path>,"error":<names registered key + count>,"count":<n>,"paths":[{"path":<p>,"stored":<key>}...]}`.
- `Invocation` is unchanged (`skipped: Set<string>`); dedup rides on the `repo.name` key.

## Checklist (ordered)

1. `src/next.ts`: extend `Inventory`, collect foreign leaves in `discover()`, emit the dedup'd summary line, extend the `selectLeaves` quiet return. Criteria 1, 2, 3, 5.
2. `tests/next.test.ts`: extend `skipSchema`; update the `mismatch` branch of the `duplicate|mismatch` loop and the `wrong-key` selection/sweep test (~1098-1140) to the summary shape (`paths` contains the leaf path, `count` 1, `repo` is the registered key, no per-leaf mismatch line). Criterion 5.
3. `tests/next.test.ts` new test — summary shape and dedup: 3 foreign leaves under two stored keys in one repo, `--all` (which discovers repeatedly), assert exactly one summary line for the repo, `count` 3, both stored keys in `paths`, every stderr line still parses with `skips()`, `result.code` 1. Criteria 2, 3.
4. `tests/next.test.ts` new test — capacity: `max_active: 2`, repo `repo` with 5 foreign leaves + 1 healthy `plan.synthesis`, second fixture `g` registered as `other` with 1 healthy leaf (`repo: 'other'` in its state, workspace `w3` covers it); `--all` from `f.home` dispatches both healthy leaves (2 prompts, 2 tabs); foreign `state.yaml` bytes identical before/after. Criterion 4.
5. `tests/next.test.ts` new test — lookup/dispatch exclusion: healthy leaf with `blocked-by: [<foreign-slug>]` is skipped (its own per-leaf line, not dispatched); `next <foreign-slug>` exits nonzero, records no prompt, leaves the file byte-identical. Criterion 5.
6. `tests/next.test.ts` new test — conservative path intact: `max_active: 2`, repo with 1 healthy + 1 malformed (`slug: [`) + foreign leaves; `--all` yields one summary line plus one per-leaf line for the malformed path and zero prompts (contribution `leaves + unreadable` = 2 ≥ `max_active`). Criterion 6.
7. `tests/next.test.ts` new test — foreign merged leaf survives cleanup: dispatch a leaf normally (real worktree, branch, tab), then `saveState` it `repo: 'other'`, `phase: 'merged'` and `renameSync` it under `issues/closed/issue/`; `--all` reports it in the summary, exits 1, and state bytes, worktree dir, branch (`git show-ref`) and tab (`database(f).tabs`) all remain. Criterion 9.
8. `tests/next.test.ts` new test — two repos, two invocations: repos `repo` and `other` each hold foreign leaves; run `--all` twice from `f.home` (outside any checkout); each run prints exactly one summary per repo and exits 1 both times. Criterion 10.
9. `src/AREA.md` + `docs/guide/problems.html`: per D8. Criterion 8.
10. `bun run format`, `bun run typecheck`, `bun test`. Criterion 11.

## Acceptance criteria

Mirror brief done-criteria 1-11 verbatim; the checklist above is the evidence for each. Highlights: exactly one summary line per repo per invocation regardless of discovery count; foreign leaves never dispatched, never cleaned, never counted, never found by `lookup()`; foreign `state.yaml` files byte-identical after every run; exit code 1 whenever a summary was printed; no changes in `src/status.ts`, `src/state.ts`, `src/init.ts`, `src/phase.ts`.

## Verification

- `bun test tests/next.test.ts` — new and updated tests green.
- `bun run typecheck && bun run format && bun test` — full suite.
- Manual sanity: `skips()` parses every stderr line in the new tests, proving the line shape stays machine-readable.

## Known limitations

- `akrogon status` and `akrogon phase` still fail hard on foreign leaves through `allLeaves()` — unchanged by design (criterion 7).
- The summary reprints every invocation; no remembered "already reported" state (chart off-route).
- Importing foreign leaves belongs to the framework repo's `admin-factory-update` leaf, not this one.
- No `docs/guide/` prose described the old per-leaf mismatch error; criterion 8 is satisfied by the `src/AREA.md` line and the new `problems.html` row.

## Operator actions

None — the design names no credentials.
