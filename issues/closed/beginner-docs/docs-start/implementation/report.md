# Report: docs-start

Base `b72f24d58fa86ce909d3a5a52d750a440e47da37`. Committed head `942e2020e78ca0fc8eb9305cf8f0d5b4f86ef190`.

## Refreshes

- Before the first unit: rebased from base `2c073b38` onto `origin/main` `b72f24d5`. That commit adds issue records only. The head moved from `2c073b38` (no leaf commits yet) to `b72f24d5`.
- At implement end: fetched, and `HEAD..origin/main` is empty, so nothing moved.

## Commits

| Commit | Unit | What |
|---|---|---|
| `06e519cd` | U2 (A) | Removes the README "akrogon log" wording test from `tests/log-reader.test.ts`. It carries a `Test-Change:` trailer citing design fact-ownership Q2. |
| `844279ac` | U1 (worker, picked from `25fc32db`) | `docs/start/what-it-is.md`, `why-it-works.md`, `install.md`, `set-up-a-project.md`, `one-change.md` |
| `942e2020` | U3 (worker, picked from `c83b4bd5`) | Short `README.md`, new `docs/README.md`, `docs/reference/words.md` and `docs/reference/where-things-go.md`, the `docs/reference-index.md` Documentation line, and deletion of all 17 `docs/guide/*.md` |

U2 was done by A because workers edit no tests. Briefs are in `implementation/brief-1.md` and `brief-3.md`.

## Changed files and reasons

- `README.md`: front door with what Akrogon is, who it is for, the what-you-need box, factory-overview.svg, a docs-home link and five daily-job links. It has no command table, install, rollback or counts (D8).
- `docs/README.md`: docs home with start/ in order, then use/, reference/ and examples/ (D9).
- `docs/start/*.md`: ordered explanation with Next links and pictures with alt text (D2–D7).
- `docs/reference/words.md`: 29 terms, each linked to its explaining page (D12).
- `docs/reference/where-things-go.md`: folder purposes, the one-home rule, the link rule, and the rule that a code change updates its page (D11).
- `docs/reference-index.md`: the Documentation line now links `README.md` and `reference/where-things-go.md` (D10).
- `docs/guide/` (17 files): deleted (D13).
- `tests/log-reader.test.ts`: wording-only test removed (D14).

The worker wrote three facts the code way, by the code-wins rule (D1):

1. `install.md` has the reader write `config.yaml` before running install, because `install()` reads the machine config (`src/install.ts`).
2. Self-update from merged work applies only when the Akrogon checkout is registered as `akrogon` (`src/self-update.ts:217`).
3. A harness command must start with the harness name (`launch()` in `src/next.ts`).

## Criterion proofs (all on head `942e2020`)

| Crit | Command | Result |
|---|---|---|
| 1, 2, 4 | `bun test --timeout=30000 tests/docs-links.test.ts` | 8 pass. `check docs-links: 0 .../implementation/check-docs-links-1792770131615-213997.log` |
| 3 | `sh -c "! grep -nEi -f <scratchpad>/scrub.txt docs/start/one-change.md"` (15 patterns built from provenance: org, repo names, keys, root paths, `/home/`, `~/Work`, personal name, UUID, date, story slugs, hex SHA. Never committed.) | no match. `check c3-scrub: 0 .../implementation/check-c3-scrub-1792770131267-213242.log` |
| 5 | `sh -c '! git grep -n "docs/guide" -- . ":!issues" ":!learnings" && test ! -e docs/guide'` | before: exit 1 (`check-c5-guide-refs-before-1792769598903-170796.log`, README:39–55, 59, 84). After: exit 0, `check c5-guide-refs: 0 .../implementation/check-c5-guide-refs-1792770130684-211909.log` |
| 6 | `bun test --timeout=30000 tests/log-reader.test.ts`, plus `git diff origin/main...HEAD --stat -- tests/` | 4 pass (5 before). `check log-reader: 0 .../implementation/check-log-reader-1792770133021-214596.log`. The diff touches only `tests/log-reader.test.ts`, with 6 deletions and none of them runtime. |
| 7 | `sh -c '! grep -nE "\b(19\|20)[0-9]{2}\b" README.md docs/README.md docs/start/*.md docs/reference/words.md docs/reference/where-things-go.md'` | no match. `check c7-no-dates: 0 .../implementation/check-c7-no-dates-1792770130950-212596.log` |
| 1–4, 7 content | B page review against sources and provenance | pending at check.review |

`docs/guide` references cleared before deletion: README.md lines 39–55, 59 and 84 (the old guide list and two install links), and `docs/reference-index.md:7` (`guide/`). After the change, `git grep "docs/guide"` and `git grep "guide/"` outside `issues/`, `learnings/` and `docs/guide/` print nothing. Retired-word scans `tests/hold-retired.test.ts` and `tests/run-permit.test.ts` pass with 15 tests (`check-u3-hold-run-1792770097841-202236.log`).

## Checks

`akrogon verify` on `942e2020` came back green. format passed. test: 1113 tests across 66 files, 0 fail, wall time about 229 s (`check-test-1792770369019-220917.log`). typecheck passed (`check-typecheck-1792770371313-220917.log`).

## Notes

- The new worktree needed `bun install --frozen-lockfile` before `log-reader` ran. The first baseline run failed on a missing `zod`.
- The U3 worker found its detached worktree with files missing from disk (sparse checkout) and ran `git sparse-checkout reapply`. `issues/` stays excluded.
- No new tests, per the design exclusion. This is recorded in `plan.md`.

Known limitations: none known.
Unverified criteria: content accuracy, the no-exercise rule and privacy review (criteria 1–4 and 7, and B's half of 3) belong to B's page review.
