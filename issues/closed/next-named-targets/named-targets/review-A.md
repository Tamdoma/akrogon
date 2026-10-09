# Review A: named-targets

- Base: `4534a569205c3903bcfd56145e74ec8caa4197d5`
- Reviewed head: `f91a268` (4 commits: U1 code, U2 tests, U3 docs, prettier reflow)
- Verdict: **nits**

## Scope checked

Diff `4534a56..f91a268`: `src/next.ts` (+49/-2), `tests/next.test.ts` (+258),
`docs/guide/next.md` (+15), `docs/guide/parts.md` (+6/-1). Judged against plan D1-D9,
brief criteria 1-7, design binding decisions, and `implementation/report.md`.

## Verification evidence

- `bun test --timeout=30000` on `f91a268`: 550 pass, 0 fail, 38.1s (run this pass, A's earlier
  implement pass; re-checked against report).
- `AKROGON_BASE=4534a56 bun test --changed` : 246 pass, 0 fail.
- `bun run typecheck` clean; `bun run format` rewrites only pre-existing `src/status.ts` drift,
  reverted and out of diff.
- `bun test tests/docs-links.test.ts`: 3 pass.
- `Test-Change:` trailers present on both commits touching `tests/next.test.ts`, consistent with
  `src/test-files.ts` rule and cited reasons.
- Break proof recorded in report: all four new-behavior test groups go red with `src/next.ts`
  reverted to base hunk, green with it.

## Design/plan conformance (traced in code)

- D1 path-shadow: `existsSync(folder)` stays the first branch; name branch only runs when input is
  given and the folder does not exist. Verified at `src/next.ts:1229`.
- D2 owners from leaf paths only: `ownerCandidates` derives depth-2/depth-3 ancestors of
  `inventory.leaves` under `issues/open`, deduped by path. No ISSUE.md/EPIC.md read. Closed leaves
  excluded by the `within(leaf.path, openRoot)` pre-filter. Empty folders produce no candidates.
- D3 bare names only: `input.includes('/') || input.includes('\\')` returns undefined before any
  candidate work; slash inputs keep today's missing handling. Leaf search stays exact slug match
  over open+closed inventory.
- D4 one/two/zero: exactly-one returns leaves; two-plus throws inside `selectLeaves`, i.e. before
  `withLock`/herdr/state. Match listing is `kind` + `relative(repo.root, path)` sorted by path.
  Zero falls through to unreadable/unknown/foreign empty-selection and `missingLeafMessage`.
- D5 same-name pairs refuse: issue+leaf and epic+issue covered by candidates with no
  same-leaf-count shortcut; tests T4 prove all four shapes with `calls(f)` empty and state bytes
  unchanged.
- D6 repo identity: `commonDirectory` resolution untouched.
- D7 closed owners: closed names never candidate (pre-filter); closed folder still path-selectable
  via the `within` branch; test `closed owner name` proves both halves.
- D8 test boundary: all proof at CLI level against isolated fixture repos + fake herdr; assertions
  on dispatched slugs, `calls`, exit codes, state bytes, absence of worktrees/lock/log — not prose.
- D9 docs split: only target-form text in `next.md` and same-name path example in `parts.md`;
  README contract untouched.

## Doc page check

Opened `docs/guide/next.md` and `docs/guide/parts.md` (both changed). Claims verified against code:
name forms dispatch owner leaf sets; refusal lists kind+repo-relative path; same-name issue/leaf
pair needs the folder path (`issues/open/export-csv/export-csv` matches the file's own diagram);
existing-folder shadow statement matches D1. `docs/reference-index.md` names neither file; no
`AREA.md` exists in the repo.

## Behavior notes (not findings)

- Duplicate leaf slugs (unreadable-class, reported by `discover`) now refuse as 2 leaf matches
  under a bare name where today the slug filter would select both. Consistent with "every collision
  refuses"; no existing test relied on the old dispatch (the duplicate test at
  `tests/next.test.ts:1330` exercises `--all` sweep, still green).
- The `?? inventory.leaves.filter(slug === input)` fallback after `resolveName` is reachable only
  for inputs containing a path separator, preserving today's exact-slug behavior for a stored slug
  that literally contains a slash. Redundant-looking but behavior-preserving; fine.

## Findings

### Fixes

None.

### Nits

- N1 (kind label ordering): a top-level folder that holds both direct leaves (depth-2) and
  nested-issue leaves (depth-3) is recorded once in `ownerCandidates`, so its `kind` in a refusal
  message depends on discovery order (`issue` vs `epic`). Deferred: no such layout exists in-repo
  or in the fixture space, selection result is unaffected (all open leaves under the folder select
  either way), and the report already records it as a known limitation. Promoted to Fix if a real
  repo creates that mixed layout and an operator-visible refusal mislabels it.
- N2 (duplicate-slug-by-name refusal has no dedicated test): the new refusal covers the
  two-leaves-one-slug shape without a case asserting it. Deferred: duplicate slugs are already an
  unreadable-class defect reported by `discover`, the existing `--all` regression test guards the
  sweep path, and the design names only the four tested shapes. Promoted by a reported operator
  confusion or a slug-uniqueness relaxation.
