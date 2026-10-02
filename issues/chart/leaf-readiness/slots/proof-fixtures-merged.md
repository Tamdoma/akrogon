# Proof fixtures: merged A + B

## Evidence
- (A,B) I7, framework emdash-launch implementation/report.md:72,245-247: the `gh` login created `ivanjuras/emdash-launch-c8` but lacked `delete_repo` (403); the registry PAT could not see it, and its 404 was not proof of absence (review-B.md:277).
- (A,B) R2 buckets returned 409 until their objects were removed through the object API (report.md:245); final cleanup removed all 20 objects before the bucket (:313).
- (B) The c8 repo was finally removed by transferring it to the org with its existing admin credential and deleting it with the org credential, with no scope added (report.md:315). An unplanned transfer was the workaround.
- (A,B) I12, emdash-fleet-backup plan.md:34,45 (F5/D8): the lock proof put an object under a 30-day lock, so the "throwaway" bucket could not be deleted on demand and was quietly kept as the real backup bucket.
- (A,B) akrogon today: only the door probe rule names cleanup (skills/chart-issues/SKILL.md:53); state has no fixture field (src/state.ts:35-58); akrogon cleanup removes local worktrees only (src/next.ts:614-621).

## Q1 disposable by default, full cleanup proven before handoff
- 1a (A,B): fixtures are disposable unless Q2 retains them. Before creation the contract names the cleanup sequence (transitive resources, contents and config included), the identity for each step, and the authenticated read-back proving absence. Cleanup uses the creating identity by default; a different identity is allowed only when declared and proven before handoff (B). The door's probe proves a small create/use/delete cycle with those identities, so a missing delete scope shows up at charting (A,B). Each pass records created IDs under the grant and runs cleanup on success and failure; absence is proven by list read-back, never by the delete reply (A,B). Leftover disposable resources are a blocker with IDs, error, owner and next step (B).
- 1b (B): operator cleans up after the proof, with steps listed up front. Keeps delete off the leaf credential but repeats the I7/I12 operator dependency.
- (A, dropped) 1c periodic account sweeper: both reject; sweepers assume dedicated test accounts, and these are live accounts with domains and backups (Gruntwork testing environment; HashiCorp Sweepers).

## Q2 retention only by agreement before creation
- 2a (A,B): a fixture may stay only when the contract names purpose, resources, an owner who accepts it, a removal date, cost and exposure, the cleanup identity and route, and why the proof needs it alive. Pass artifacts label agreed-retained separately from still-to-delete. A cleanup failure never becomes retention after the fact. Real backup locks and retention are never weakened to make cleanup pass (A,B).
- 2b (B): no retention; work needing a real retention test holds until lawful cleanup.

## Disagreement
- Fixture lock removal. (A) a fixture's own lock rule may be removed when the grant names it; R2 docs say a bucket cannot be emptied while lock rules exist and show how to remove rules. (B) remove a test-only lock rule only after retention expires; a shorter test lock is allowed when the property under test permits. Neither is probed: whether removing a rule frees already-locked objects is unknown.

## Research
- operator · INTAKE P7/I7/I12; taken readiness-contract, key-sheet, env-source, live-change-grant.
- practitioner · Gruntwork Terratest, Cleanup, Testing environment, Iterating with test stages (terratest.gruntwork.io, read 2026-10-02) (A,B): always destroy on error via defer; nightly cloud-nuke only in a dedicated test account; saved stage IDs allow deliberate reuse.
- practitioner · HashiCorp, Terraform provider Sweepers (developer.hashicorp.com/terraform/plugin/testing/acceptance-tests/sweepers, read 2026-10-02) (B): resources leak despite teardown; sweep only development accounts, in dependency order.
- better-than-training · Cloudflare R2 Bucket locks and Delete buckets (developers.cloudflare.com/r2, read 2026-10-02) (A,B); GitHub REST delete repository needs admin and delete permission (docs.github.com, read 2026-10-02) (B); framework report.md:72,245-247,313-315; fleet-backup plan.md:34,45; skills/chart-issues/SKILL.md:53; src/state.ts:35-58; src/next.ts:614-621.
