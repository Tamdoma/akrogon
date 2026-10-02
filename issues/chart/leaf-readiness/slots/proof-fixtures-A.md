# Proof fixtures: A

## Evidence
- I7 (framework emdash-launch implementation/report.md:245-247, review-B.md:277): Cloudflare resources were list-proven deleted, but `ivanjuras/emdash-launch-c8` stayed. It was created by the `gh` login, which lacks `delete_repo` (HTTP 403); the registry PAT cannot see it, and its 404 was not proof of absence. The creating identity could not delete what it made.
- I7: R2 buckets returned 409 until their objects were deleted through the REST object API (report.md:245). The delete path needs the object API, not just bucket delete.
- I12 (emdash-fleet-backup plan.md:34,45 F5/D8): the lock proof put an object under a 30-day lock, so the "throwaway" bucket became undeletable on demand and was retained as the real backup bucket, emptied by a 31-day lifecycle rule. The brief said throwaway; the plan quietly made it retained.
- akrogon today: only the door's probe rule names cleanup ("smallest reversible call on a throwaway target with checked cleanup", skills/chart-issues/SKILL.md:53). Seats have no fixture lifecycle rule.

## Recommendation 1a
Proof resources are disposable by default: the leaf creates them under the grant's ownership marker, deletes them with the same verified identity before its pass ends (including on failure), and proves absence by list read-back with that identity, never by the delete reply. The door's probe proves create and delete for that identity before handoff, so a missing delete scope (I7) is found at charting. A resource that cannot be deleted on demand (lock, retention, minimum billing) is declared retained in the contract with owner, reason and removal date, chosen by the operator at charting. Real locks (production backup buckets) are never relaxed or removed to make a test pass. A fixture's own lock may be removed only if the grant names that operation.

## Options
- 1a as above.
- 1b best-effort cleanup, leftovers reported. Cost: I7/I12 repeat; leftovers have no owner.
- 1c periodic sweeper (cloud-nuke style) instead of per-leaf cleanup. Cost: needs a sandbox account per provider and a new akrogon or operator job; the R2 lock still blocks it.

## Pitfalls
- Same identity for create and delete matters most for GitHub: a fine-grained PAT that can create may lack delete.
- R2 docs say a bucket cannot be emptied while lock rules exist and show how to remove rules. Whether removing a fixture's lock frees already-locked objects is unproven; probe before relying on it.
- Leftover sweeps by name pattern can hit real resources; match the ownership marker plus recorded IDs.

## Research
- practitioner · Gruntwork, Terratest cleanup best practices (terratest.gruntwork.io/docs/testing-best-practices/cleanup/, read 2026-10-02): always run destroy via `defer` even on error, plus a nightly cloud-nuke sweep in a dedicated test account because cleanup sometimes fails. Changed: cleanup on failure, and the sweeper as 1c.
- better-than-training · Cloudflare R2 bucket locks (developers.cloudflare.com/r2/buckets/bucket-locks/, read 2026-10-02): "A bucket cannot be emptied while any bucket lock rules are configured. Remove all lock rules before emptying a bucket." Changed: the fixture-lock pitfall and the retained-resource branch.
- better-than-training · framework report.md:245-247, review-B.md:277, emdash-fleet-backup plan.md:34,45; skills/chart-issues/SKILL.md:53.
