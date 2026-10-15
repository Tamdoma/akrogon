# Draft review D: issue-flow-report

F1 (2) design.md:36 calls the origin parse and `parseListing` reusable. Both are module-private (src/pull.ts:17, regex inline at :44-50) and the query differs (:57 `state=open`, criterion 4 `state=all`). Reuse means extracting and exporting from src/pull.ts, which the owned surfaces (design.md:24-28) do not list. Add src/pull.ts and name the extraction.

F2 (2) design.md:36 "schema gains `created_at`, `state`; pull output unchanged, proven by the existing pull tests". tests/pull.test.ts:10-12 fixtures carry neither field, so required fields turn those tests red and optional fields contradict parse-once. Decide: a second listing schema in the flow report, pull.ts untouched beyond the export.

F3 (1) Criterion 5 (brief.md:16) names tests; shapes.md:289 refuses a criterion naming a test file. The named test also cannot prove it unchanged: tests/command-reference.test.ts:27 holds `timing: '[<slug>|--cohort --since <iso>]'` compared at :35, so the implementer must edit that contract. Reword the proof to the `test` command in `checks` (issues/config.yaml) and add tests/command-reference.test.ts to owned surfaces.

F4 (2) "median fix rounds per leaf" (brief.md:14) is undefined: fix rounds is per issue, summed over leaves (brief.md:6); "per leaf" reads as divided by leaf count or as a median over the group's leaves. (3) It repeats lifecycle data design.md:44 excludes, and `--cohort` already splits on the same marker. Drop fix rounds from the row and the summary; keep leaf count.

F5 (3) Criterion 4 exits non-zero on any carried identity the listing lacks, and readiness.yaml names transferred and deleted issues as a known limit. One such identity makes the whole report unusable, and the only repair is a state.yaml edit under issues/, a step on main. Print that identity as `not in listing` and exit 0; keep non-zero for a failed read. Offline check: carried max akrogon #88 of 89 listed, framework #231 of 257, gaps unverifiable.

F6 (2) design.md:40 compares `created` with the UTC date of `--since`, so the `<iso>` time part is ignored while src/akrogon.ts:157 parses a full datetime for `--cohort`. State that in usage and files.md, or accept a date. Low stakes today: 0 of 11 framework leaves created 10-14 moved before the 15:50Z marker, none created 10-15.

F7 (2) state.ts:74 makes `sources` optional; brief.md:12 says "empty `sources`". Say that a missing field counts as empty.
