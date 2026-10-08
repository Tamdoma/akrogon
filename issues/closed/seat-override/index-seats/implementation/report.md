# Implementation report: index-seats

## Changed files and reasons

- `src/config.ts` — tightened seat fields to `trim().min(1)` + no-quote regex used by machine, repo and index schemas; `SeatIndexError` (`.file`); `indexSeats` front matter reader (`---` first line, `Bun.YAML.parse`, strict `{slots:{a?,b?}}` with `slots` required); `indexSlots` ancestor scan (open over closed; depth-2 `ISSUE.md`; depth-3 `ISSUE.md` then `EPIC.md`; nearest seat wins); `seats(global, repo, leafPath?)` returns `{a, b, source}`; `effectiveConfig` prints leaf-resolved `{a,b}` when cwd's toplevel realpath equals a leaf's recorded `state.worktree` (`allLeaves` via dynamic import to avoid the config→state→park→config cycle).
- `src/next.ts` — `launch` and the pre-allocation `seats()` take `leaf.path`; malformed indexes and unknown harnesses fail before tab/worktree allocation.
- `src/status.ts` — `walk` stores `seatSources` per leaf; `SeatIndexError` joins `scanRepo`'s caught set (path set to the index file → `unreadable` line + exit 1); `note()` appends `seats <basename>`; detail prints `Seats for the next agent start:` + `{a,b}` YAML with per-seat `source` after the `History:` block (must sit there — an existing test parses everything before `History:` as state YAML).
- `docs/guide/cheat.md`, `docs/guide/files.md` — front matter block and resolution order, one place each.
- `tests/config.test.ts` — blank/quote rejection at machine+repo levels; index resolver unit matrix; managed-worktree config (root/subdir/linked/outside); malformed-index config exit; required `slots` cases.
- `tests/next.test.ts` — EPIC.md override with per-seat fallback, ISSUE.md beating EPIC.md and repo `slots.b`, standalone ISSUE.md override (recorded `herdr agent start` argv); malformed-index refusal loop asserting no tabs/panes/starts/worktree.
- `tests/status.test.ts` — detail seats block, NOTE marker present/absent, overview unreadable + detail non-zero on malformed index.

## Commands run

| Command | Result | Wall time |
| --- | --- | --- |
| `bun run format` | clean (2 quote-normalized lines committed separately) | seconds |
| `bun run typecheck` | clean | seconds |
| `bun test --timeout=30000` | 529 pass / 0 fail (24 files) | 27.3s |
| `bun test --changed=$AKROGON_BASE --timeout=30000` | 422 pass / 0 fail | 21.8s |
| `bun <worktree>/src/akrogon.ts status` (real repo) | all leaves parse; no `seats` marker (no index front matter present) | seconds |
| `bun <worktree>/src/akrogon.ts status index-seats` (real repo) | prints seats block with machine-config sources | seconds |

Deliberate-break evidence: U1's quote/blank cases and U3's criterion-1 test (`epic-a` expected, `strong-a` launched) and U4's detail-block test each failed before their code change and pass after.

## Commits

- Base: `2645d97ed1682185eea4788844f882a541885d24`
- `aa5fa6e` feat: resolve seats from ISSUE.md/EPIC.md slots front matter (U1)
- `4d714da` docs: show slots front matter override for ISSUE.md and EPIC.md (U2)
- `a38ba80` fix: require slots key in index front matter per locked schema (A's repair of a worker deviation: `slots` had `.default({})` making it optional; the locked schema requires it)
- `7abd4bc` feat: resolve next dispatch seats through leaf index (U3)
- `4be9e4e` feat: report next-start seats in status detail and mark index seats in overview (U4)
- `372a06e` style: format worker test lines
- HEAD: `372a06e`

## Criterion map

1. Recorded argv for epic/issue/standalone index seats — `tests/next.test.ts` new tests.
2. Malformed-index non-zero exits naming index path across next/status/config — malformed matrices in all three test files.
3. `config` leaf-worktree resolution vs root/linked/outside — `tests/config.test.ts` managed-worktree test.
4. Detail seats block + `seats <basename>` NOTE — `tests/status.test.ts` + live `akrogon status index-seats` above.
5. No-front-matter indexes unchanged; all existing leaves parse — `tests/config.test.ts`/`status.test.ts` no-front-matter cases + live `akrogon status` on the real repo.
6. `cheat.md`/`files.md` document block and order; `docs-links.test.ts` green inside the suite run.

## Known limitations

- A per-leaf B seat does not govern a merge carried by another holder's B (design-preserved batching rule).
- `source` names the `config.yaml` the running binary reads (`globalHome()` = `toolRoot` when `AKROGON_HOME` is unset): a worktree-resident binary reports the worktree's own `config.yaml`, while the installed binary reports the registered root's — the file each actually uses, so the claim stays true.
- A malformed index marks its whole repo `unreadable` in the status overview (existing leaf-level failure containment), exit 1, naming the index path.

## Unverified criteria

None.
