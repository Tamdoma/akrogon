none

The final shape is buildable as written: every named surface exists (`effectiveConfig` in `src/config.ts`, `setConsultant` in `tests/watch-consult.test.ts`, the minimal config in `docs/start/install.md`), removing the hc-core missing-recipe test leaves `setConsultant` used by the remaining recipe tests, and item 6's gate runs the worktree build's new schema against the real home, which is the one check the installed old-schema command cannot fake.
