# Worker report: sub-brief 1, install-split (plan U1, wave 1)

Commit: 9dd1acd6550efc5b408ed22110a80a1df3ca802a

## Changed files and reasons
- src/install.ts — split skill/executable link reconciliation out of install() into planSkillLinks(home, sourceRoot) (returns { links, conflicts }, prunes dangling owned links first, creates nothing) and applySkillLinks(links) (the mkdir+symlink-if-absent loop). Exported Link type. install() composes them in the same phase order: readGlobal → plan (compute links → prune → compute conflicts) → print rm -r lines and throw on conflicts → applySkillLinks → herdr calls. Observable behavior unchanged.

## Tests run
- bun test tests/install.test.ts --timeout=30000 → 15 pass, 0 fail, 332 expect() calls.
- AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000 → "1 changed file, but no test files are affected", 0 tests selected. The changed-mapper does not associate src/install.ts with tests/install.test.ts; the install suite was verified with the explicit command above.
- bunx tsc --noEmit → clean.

## Known limitations
- None known.

## Unverified criteria
- None. All acceptance criteria verified: exact signatures exported, install() phase order preserved, tests/install.test.ts untouched and green.
