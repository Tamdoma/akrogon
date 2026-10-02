# Intake: framework-temp-owners

## Scope
Destination framework: every framework test and browser runtime writes temp under the effective TMPDIR, keeps nested socket paths within the Linux limit, and removes its temp only after its child processes exit.

## Provenance
- Operator: 2026-10-02 split of the temp-release note; source text lives in [temp-release INTAKE](../temp-release/INTAKE.md).

## Agent findings
- F3 (B): page-measure.mjs:312 and browser-core cdp-core.mjs:67-70,118-121 nest `browser-core-<targetId>.sock` under `page-measure-XXXXXX` under tmpdir: 121 bytes under today's leaf path, over Linux's 107.
- (B): simple-banner.test.ts:25-32 and route-fidelity.test.ts:88-98 (offer-join worktree) hardcode `/tmp/bc-sb-` and `/tmp/bc-rf-` to dodge that limit.
- F6 (B): page-measure.mjs:323-326 kills the browser and removes its folder without waiting for exit.
- Depends on temp-release leaf-path for the final path budget.
