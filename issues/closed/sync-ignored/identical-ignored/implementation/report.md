# Implementation report: identical-ignored

Serial-solo run (plan waves hold one unit each); A implemented everything directly. No sub-briefs, no worker worktrees.

## Commits

- Base: `21422a68` (origin/main unchanged at refresh; no rebase needed)
- `4b16b98` `test(sync): identical ignored adoption and refusal cases` — red-first tests on the frozen plan tests
- `d818f81` `fix(sync): exempt ignored paths identical to an incoming entry` — product change + doc line

## Changed files and reasons

- `src/sync.ts` — `integrate`'s ignored block: incoming names now come from `git ls-tree -r -z` (mode/type/id per path, NUL-delimited, literal paths); replayed names split into their own `Set`; directory closures computed per incoming/replayed set; the filter became an async map with one exemption — a candidate whose only overlap is an exact incoming blob entry, with no exact/ancestor overlap against replayed paths, not a directory of any integrated path, and locally identical: same type and executable bit by `lstatSync` (`120000` symlink, `100644`/`100755` by owner-exec bit) and same blob id (`git hash-object --no-filters` for files, `git hash-object --stdin` of the readlink text for symlinks). `localId` helper added. `moveCheckout` untouched per D3.
- `docs/guide/install.md` — refusal wording qualified to *differing* ignored operator paths (planned doc update).
- `tests/sync.test.ts`, `tests/self-update.test.ts` — planned criterion tests (wave 1 commit `4b16b98`); a trailing-whitespace prettier fix folded into `d818f81` with `Test-Change` trailer.

## Bug found and fixed during implement

- Ancestor loop iterated from the path itself, so every exact incoming entry self-collided (all five T1 paths refused). Fixed by starting the ancestor walk at `dirname(absolute)`; exact hits are handled explicitly by `replayed.has(absolute)` and the entry lookup.
- Test-side: the self-update test seeded `collide/tool` before `chmod`, so the incoming blob was `100644` against a `100755` clone file — a correct refusal, not a product bug. Seed chmod reordered before `git add`; amended into `4b16b98`.

## Commands and results

All output kept through `akrogon run-check`; logs under `implementation/`.

| Proof | Command | Commit | Result |
|---|---|---|---|
| c1 sync | `bun test -t 'adopts identical' tests/sync.test.ts` | `d818f81` | `check c1-sync-adopts: 0` (`check-c1-sync-adopts-1792430640330-2243265.log`) — criterion 1 sync route green |
| c1 self-update | `bun test -t 'adopts identical' tests/self-update.test.ts` | `d818f81` | `check c1-self-update-adopts: 0` (`check-c1-self-update-adopts-1792431873698-3258699.log`) — criterion 1 behind-only route green (rerun after whitespace fix) |
| c2 | `bun test -t 'differing only' tests/sync.test.ts` | `d818f81` | `check c2-differs: 0` (`check-c2-differs-1792430661856-2287813.log`) — all 5 deltas refuse |
| c3 | `bun test -t 'refuses an identical ignored' tests/sync.test.ts` | `d818f81` | `check c3-replayed: 0` (`check-c3-replayed-1792430662283-2291508.log`) — all 3 replayed shapes refuse |
| c4 | `bun test -t 'mixed ignored batch' tests/sync.test.ts` | `d818f81` | `check c4-mixed: 0` (`check-c4-mixed-1792430662689-2295044.log`) — refusal names only `collision-diff` |

Red-first runs at `21422a68` are recorded in `plan.md` (c1 both routes, c4 red; c2/c3 green at base).

`akrogon verify` on `d818f81`: format 0, test 0 (1083 pass / 0 fail), typecheck 0 → `verify leaf d818f81b: green` (`check-format-…-2698605`-era logs; receipt in `issues/verify-runs.jsonl`). One earlier verify on `0ef07da` went red on a prettier whitespace nit in `tests/self-update.test.ts`, fixed and folded into `d818f81`.

## Limitations

- Design-locked known limits stand (race between hash and move; checkout conversions can write differing bytes after raw-equal exemption). No mechanism added for either.
- No credentials needed; `env_names: []`. No operator blockers.

## Unverified criteria

None. All four done-criteria green on `d818f81`.
