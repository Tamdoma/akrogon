# Brief: foreign-leaf-summary

## What
`akrogon next` classifies a leaf whose parsed `state.repo` differs from the registered key as foreign, separate from unreadable state. Per invocation, each repo with foreign leaves produces one JSON diagnostic line on stderr naming the registered key, the count, and every offending path paired with its stored key, regardless of how many times the repo is discovered in that invocation. Foreign leaves are excluded from dispatch, merged-leaf cleanup, dependency lookup and the `max_active` count. Exit status stays nonzero when foreign leaves were reported. Every other unreadable cause (schema failure, bad depth, duplicate slug, I/O error) keeps its per-leaf line and its conservative capacity treatment. `akrogon init` is unchanged.

## Why
`discover()` reports one line per mismatched leaf (src/next.ts:98-107) and `next` runs on every herdr event, so a consumer repo that inherited 96 framework leaves printed 96 lines per pass (Tamdoma/akrogon#17). Worse, `activeCount()` adds every unreadable leaf to the global total (src/next.ts:255-265), so 96 foreign leaves exceeded `max_active` and silently stopped new allocation in every registered repo.

## Done-criteria
1. `Inventory` in `src/next.ts` carries foreign leaves (path and stored key) apart from `unreadable`; `discover()` places a parsed leaf with `state.repo !== repo.name` there instead of reporting per leaf and incrementing `unreadable`.
2. One stderr JSON line per repo per invocation for foreign leaves, containing the registered key, the count, and each path with its stored key. A test with 3 foreign leaves under two different stored keys and repeated discovery in one `--all` run asserts exactly one such line for that repo and the existing `skips()` parser in `tests/next.test.ts` still parses every line (extend `skipSchema` if fields are added).
3. `process.exitCode` is 1 when foreign leaves were reported, asserted in the same test.
4. Test: `max_active: 2`, one repo holding 5 foreign leaves and one healthy leaf at `plan.synthesis`, a second registered repo with one healthy leaf: both healthy leaves dispatch in one `--all` run. Foreign state files are byte-identical before and after.
5. Test: a foreign leaf is not returned by `lookup()` for `blocked-by`, is never dispatched, and `next <foreign-slug>` fails without dispatching and without changing the file; the existing tests at `tests/next.test.ts:1098-1140` are updated to the new diagnostic shape and still prove no arbitrary dispatch.
6. Test: a malformed `state.yaml` alongside foreign leaves still counts as unreadable and still makes the repo contribute `leaves + unreadable` to capacity, proving the conservative path is untouched.
7. `src/status.ts` and `src/state.ts` are not changed; `src/init.ts` is not changed.
8. `src/AREA.md` and any `docs/guide/` prose describing the per-leaf mismatch error are updated or reported under known limitations.
9. (B) Test: a foreign `merged` leaf under `issues/closed/` with a real fixture worktree, branch and recorded tab is reported and left intact by a cleanup-capable `--all` run: state bytes, worktree, branch and tab all remain.
10. (B) Test: two registered repos each holding foreign leaves, run `--all` from outside any registered checkout twice: each run prints exactly one summary per repo and exits nonzero both times, proving per-repo dedup within an invocation and no suppression across invocations.
11. `bun run format`, `bun run typecheck`, `bun test` pass.
