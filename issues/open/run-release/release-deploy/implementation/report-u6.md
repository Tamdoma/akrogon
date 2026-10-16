# Report u6 — deploy resume: links before flip, unfinished-deploy retry, status visibility

Commit: 883e609 fix: deploy links before flip and resume interrupted deploys

## Changes

- src/self-update.ts: deployStage order is now fetch, resolve, done-check, hold, build, links, flip, reload, record. Done-check requires readDeployRecord() to return ok:true with commit === sha; otherwise previous === sha becomes a resume that skips only the hold check. links passes resolve(releasesDir(), sha) as planSkillLinks listRoot while sourceRoot stays currentLink(). writeDeploySuccess receives record?.commit as previous on resume. fetch/resolve split and DeployStepError mapping unchanged.
- src/install.ts: planSkillLinks gains optional fourth param listRoot (default sourceRoot) used for skill enumeration. The same check is guarded by existsSync(link.source). The dangling-link sweep now probes targets inside sourceRoot/skills against listRoot/skills so links to skills absent from the new release are removed before the flip.
- src/release.ts: deployRecordSchema.previous gains .default(null) so records written without the key parse. writeDeployFailure carries existing.commit forward via a conditional spread. Success record replaced-stamping unchanged.
- src/status.ts: dropped deploy.attempted !== active from the deploy-failed overview condition.

## Checks

- check conflicting-directory: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-conflicting-directory-1792122875444-3595657.log
- check interrupted-deploy: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-interrupted-deploy-1792122878320-3597041.log
- check deploy-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-deploy-tests-1792122892762-3599241.log (52 pass, 0 fail)
- check format: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-format-1792122899163-3613369.log
- check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-typecheck-1792122901039-3614203.log

## Deviations

- The brief limits listRoot to the enumeration readdirSync; the sweep also probes it, because links now run pre-flip and the 'every link resolves through current' test requires stale current/skills/* links to be removed. Without probing the new tree, a removed skill's link still resolves into the old release and survives.
- deployRecordSchema.previous gained .default(null): the interrupted-deploy test writes a failure record without a previous key, and readDeployRecord must parse it (return null-record semantics would hide the failure and skip the resume).
- bun run format reformatted tests/install.test.ts (prettier reflow of the newly added expects); reverted with git checkout so only the four scoped files changed.
