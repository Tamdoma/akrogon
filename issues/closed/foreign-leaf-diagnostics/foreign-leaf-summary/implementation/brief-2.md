# Brief 2: new foreign-leaf tests + docs

## 1. Goal

Implement plan checklist items 3-9 for leaf `foreign-leaf-summary`: the new tests proving summary dedup, capacity exclusion, lookup/dispatch exclusion, conservative unreadable path, merged-foreign cleanup survival, and two-repo/two-invocation behavior, plus the two doc updates. Brief 1 already landed the `src/next.ts` change, `skipSchema` fields (`count`, `paths` optional) and the two updated mismatch tests — build on that, do not restructure it.

## 2. Numbered acceptance criteria

1. Summary shape and dedup test: one repo with 3 foreign leaves under two different stored keys (e.g. two with `repo: 'other'`, one with `repo: 'third'`); a single `next --all` run (which calls `discover()` repeatedly) prints exactly one summary line for that repo with `count` 3 and all three `{path, stored}` pairs in `paths`; every stderr line still parses through `skips()`; `result.code` is 1.
2. Capacity test: `configure(f, { max_active: 2 })`; repo `repo` holds 5 foreign leaves plus one healthy `plan.synthesis` leaf; a second fixture `g` is registered as `other` (`configure(f, { repos: { repo: f.root, other: g.root } })`, `leaf(g, ..., 'plan.synthesis', { repo: 'other' })`); one `next --all` from `f.home` dispatches both healthy leaves (2 prompts, 2 tabs); every foreign `state.yaml` is byte-identical before and after.
3. Lookup/dispatch exclusion test: a healthy leaf with `blocked-by: ['<foreign-slug>']` is skipped (per-leaf line naming the missing dependency, no prompt for it); `next <foreign-slug>` exits nonzero, records no prompt, and leaves the foreign `state.yaml` byte-identical.
4. Conservative path test: `max_active: 2`; repo holds 1 healthy + 1 malformed (`writeFileSync(state.yaml, 'slug: [')`) + several foreign leaves; `--all` prints one summary line plus one per-leaf line for the malformed path and zero prompts — the repo contributes `leaves + unreadable` = 2 ≥ `max_active`.
5. Foreign merged leaf survives cleanup: dispatch a leaf normally so it has a real worktree, branch, tab and recorded panes; then `saveState` it with `repo: 'other'` and `phase: 'merged'` and `renameSync` its folder under `issues/closed/issue/`; a cleanup-capable `--all` reports it in the summary, exits 1, and state bytes, worktree dir, branch (`git show-ref --verify refs/heads/<slug>` still resolves) and tab (`database(f).tabs` still contains it, no `tab close` in `calls(f)`) all remain.
6. Two repos, two invocations: repos `repo` and `other` (second fixture `g`) each hold foreign leaves; run `next --all` twice with `cwd` `f.home` (outside any registered checkout); each run prints exactly one summary line per repo (two lines total per run) and exits 1 both times.
7. `src/AREA.md` gains one line under `## Non-obvious patterns` noting foreign leaves are summarized once per repo and excluded from capacity/dispatch.
8. `docs/guide/problems.html` gains one `<tr>` in the `table.wrong` table covering the foreign-leaves summary line: what you see (one JSON line naming the repo, count and paths), what it means (leaves stored under a different repo key, e.g. inherited from another repo), what to do (nothing automatic — they are never dispatched, cleaned or counted; move or fix them by hand). Match the existing row style.
9. `bun test --changed="$AKROGON_BASE"` passes with all new tests green.

## 3. Read-first list

- `tests/next.test.ts` — `skipSchema`/`skips()`/`configure()`/`resetPrompts()` ~934-948, updated mismatch tests ~1098-1140, two-repo `--all` pattern ~860-880 (`const g: Fixture = await fixture()` + `configure(f, { repos: {...} })`), merged-cleanup patterns ~631-700 and ~882-930, malformed-state pattern ~1043-1077.
- `tests/helpers.ts` — `fixture()`, `leaf(f, slug, phase, extra, container)`, `cli()`, `yaml()`.
- `tests/fake-herdr.ts` — db shape `{ panes, tabs, workspaces, prompts, starts }`, workspaces `w1`/`repo` and `w3`/`other`, `tab close` removes tab+panes.
- `src/next.ts` — the landed foreign handling (read it first; do not modify unless a test exposes a defect — then return a mismatch).
- `src/AREA.md`, `docs/guide/problems.html` (the `table.wrong` rows ~lines 60-72).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `tests/next.test.ts`: six new tests per criteria 1-6, placed near the existing skip/mismatch tests (~after line 1140). Reuse `dispatchFixture()`, `leaf()`, `configure()`, `next()`, `skips()`, `database()`, `saveDatabase()`, `calls()`, `readState`/`saveState`, `readFileSync`, `renameSync`, `mkdirSync`, `existsSync`, `command`/`run` — all already imported or defined in the file.
- Foreign leaf recipe: `leaf(f, slug, phase, { repo: 'other' })` — `leaf()` defaults `repo: 'repo'`; overriding it makes the leaf foreign to fixture `f`.
- Summary line shape (landed in brief 1): `{ repo, path, error, count, paths: [{ path, stored }] }`; `skips()` parses it since `count`/`paths` are optional fields on the non-strict schema.
- `src/AREA.md`: one line under `## Non-obvious patterns`.
- `docs/guide/problems.html`: one `<tr>` in `table.wrong`.

## 5. Do-not, reasons and exceptions

- Do not modify `src/next.ts` unless a test exposes a real defect — then return a mismatch with the failing output, do not patch around it in the test.
- Do not modify `src/state.ts`, `src/status.ts`, `src/init.ts`, `src/phase.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts` — locked or shared surfaces; the leaf brief forbids the first four and helper changes would affect every test.
- Do not weaken assertions to make tests pass — e.g. do not drop the byte-identical or `git show-ref` checks.
- Do not add tests beyond criteria 1-6 — the plan's checklist is the contract.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Restated: production code and shared helpers are read-only here, assertions stay strict, scope stays at the six tests plus two doc edits; conflicts return as mismatches.

## 6. Ordered steps

1. Read the landed `src/next.ts` foreign handling and the updated mismatch tests. Write the criterion-1 test (summary shape/dedup) and run it red-then-green if it fails against landed code — if red, that is a mismatch to report, not to fix.
2. Write criterion-2 capacity test; run it.
3. Write criterion-3 lookup/dispatch exclusion test; run it.
4. Write criterion-4 conservative-path test; run it.
5. Write criterion-5 merged-foreign cleanup test; run it.
6. Write criterion-6 two-repo/two-invocation test; run it.
7. Edit `src/AREA.md` and `docs/guide/problems.html` per criteria 7-8.
8. Run the full changed-tests command once more; paste results.

Advisory size: 3 files, under 30 turns.

## 7. Commands

```sh
AKROGON_BASE=e624357e825e21b38a15c07a435b1ff066c6ba38 bun test --changed="$AKROGON_BASE"
```

## 8. Done-when, evidence and report

All 9 criteria hold; the changed-tests run is pasted and green; each new test asserts an observable contract (line counts, exit codes, prompts, bytes on disk, git refs, tab records), not wording. Scenarios use temporary repos and the fake herdr boundary — no real panes or sockets.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
