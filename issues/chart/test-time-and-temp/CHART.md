# Chart: akrogon

## Destination
Seats spend test time only on failures their leaf owns, and every leaf's temp files live on disk under one owned folder that is removed when the merged leaf's tab closes.

## Forks taken
- [check-proof](forks/check-proof.md): 1a no runner, 2a one same-mode base run when the diff explains nothing and red on base fails the leaf, 3a plan-issue adopts the chart's no-whole-suite rule
- [leaf-temp](forks/leaf-temp.md): `/var/tmp/akrogon-<uid>/<slug20>-<hash12>` exported as TMPDIR, deleted when the merged leaf's tab closes, 7-day expiry by the operator's tmp-sweep

## Open forks

## Fog

## Off route
- Framework contracts and config (legacy `framework:verify` and whole-dir criteria in emdash-conversion, emdash-kit, emdash-content-fixes, emdash-launch; duplicate `checks`; selftest hang; browser-core shared profile; fixture `node_modules` copies; framework#113, #115): framework destination. emdash-launch is next to hit a red `framework:verify`.
- Post-merge main health runs and auto-seeding of base red (#50 anticipation): no owner and no shown value.
- OS-wide /tmp sweeps for sessions akrogon does not run: operator backstop (#49 says so).
- Leaked worker worktrees in framework `issues/worktrees/` (emdash-content-fixes-uR1, -uR2, emdash-conversion-ufix-b): separate cleanup bug, not temp.
- Pre-existing merged-tab close without waiting for B idle (`src/next.ts:744-753`, B final check R1): existing behavior, separate intake.
- Per-leaf temp size in `akrogon status`, phase-end temp wipe, park/close temp hooks (#49 items 2, 3 partly, 5): see leaf-temp findings.

Handed off 2026-10-01
