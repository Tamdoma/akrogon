# Fork: fix-place

## Question

Where does the fix for #164 go?

- O1 tests/tool-entry.test.ts only. Fixes one test; checks in any repo still get the agy seat PATH.
- O2 tests/isolation.ts. Fixes akrogon's own suite on every route; other repos' checks and land still leak.
- O3 constructedEnv in src/run-check.ts drops `<homePath()>/tool-entry` from PATH, with one helper extracted from realBash in src/tool-cgroup.ts. Every checked run (run-check, verify, land, setup) in every repo. (A,B,C recommend)
- O4 change agy wiring or the wrapper. Widest reach, touches every live tool shell, needs a paid live agy proof.

Off route either way: direct `bun test` from a seat shell (B F6) and realBash baking the host wrapper into scratch homes (B F5), seeded as one report.

Sources: slots/map-a.md, map-b.md, map-c.md, map-merged.md, rebuttal-b.md, rebuttal-c.md.

## Taken

Operator 2026-11-27: "1 o3". O3 taken: constructedEnv drops <homePath()>/tool-entry from PATH via one helper extracted from realBash. F5/F6 seeded as one report.
