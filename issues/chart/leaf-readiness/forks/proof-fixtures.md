# Proof fixtures

## Question
Q1. Are proof fixtures disposable by default, with their full cleanup (identity per step and authenticated absence read-back) declared and proven before handoff?

Q2. May a fixture stay after its proof only by agreement before creation (owner, date, cleanup route), with real backup locks never weakened?

### Carries
- [readiness-contract](readiness-contract.md): taken 1a.
- Intake P7: cleanup blocked by missing `delete_repo`, R2 409 and an R2 lock.
- F6: operation inventory includes transitive and cleanup calls.
- [live-change-grant](live-change-grant.md): taken 1a; the grant already names leaf-created fixtures by account, purpose, ownership marker, naming rule and count, with created IDs linked to the leaf before change or deletion. This fork decides fixture lifetime and cleanup, not consent.

## Findings
- Round files: slots/proof-fixtures-A.md, slots/proof-fixtures-B.md, slots/proof-fixtures-merged.md, slots/proof-fixtures-rebuttal-B.md. B rebuttal R1-R4 applied.
- (A,B) I7: the `gh` login created `ivanjuras/emdash-launch-c8` but could not delete it (no `delete_repo`, 403); the registry PAT's 404 did not prove absence (framework emdash-launch report.md:72,245-247, review-B.md:277). Removed later only by an unplanned transfer to the org (:315). R2 buckets returned 409 until objects were removed first (:245,313).
- (A,B, B R4) I12: a nominal throwaway bucket took on a known 30-day retention from its lock proof and was kept by design (fleet-backup plan.md:34,45, report.md:62). Cloudflare: lock rules prevent emptying, so the 31-day expiry alone does not prove disposal.
- (A,B) Q1 recommend 1a: disposable by default; contract names cleanup sequence, identity per step (creator by default, another only if declared and proven), and authenticated read-back; door probes a small create/use/delete cycle; passes record IDs and clean up on success and failure; absence proven by provider-appropriate authenticated read-back with visibility shown first (B R3); leftovers are a blocker with IDs and next step. 1c account sweeper rejected by both: sweepers assume dedicated test accounts (Gruntwork, HashiCorp).
- (A,B) Q2 recommend 2a: retention only by agreement before creation, with owner, date, cost, cleanup route and reason; never after a cleanup failure; real backup locks never weakened. Retention cannot satisfy a deletion criterion or waive operation proof; no safe sufficient proof holds the handoff (B R2). When the proof promises the real retention duration, keep it; a shorter test lock proves only what it proves; lock-rule removal is not a proven cleanup route (B R1, A agrees).
- Research: Gruntwork Terratest cleanup, testing environment, test stages (terratest.gruntwork.io, 2026-10-02); HashiCorp Sweepers (developer.hashicorp.com, 2026-10-02); Cloudflare R2 bucket locks and delete buckets (developers.cloudflare.com, 2026-10-02); GitHub REST delete repository; skills/chart-issues/SKILL.md:53; src/state.ts:35-58; src/next.ts:614-621.

## Taken
2026-10-02, operator: `1a | 2a`

Q1 1a: proof fixtures are disposable by default. Before creation the readiness contract names the cleanup sequence (transitive resources, contents and config included), the identity for each step (the creating identity by default, another only when declared and proven before handoff), and the authenticated read-back proving absence. The door's probe proves a small create/use/delete cycle with those identities at charting. Each pass records created IDs under the live-change grant and runs cleanup on success and failure. Absence is proven by provider-appropriate authenticated read-back with visibility shown first, never by a delete reply. Leftover disposable resources are a blocker recorded with IDs, error, owner and next step.

Q2 2a: a fixture stays after its proof only by agreement before creation, with purpose, resources, an accepting owner, removal date, cost and exposure, cleanup identity and route, and why the proof needs it alive. Pass artifacts label agreed-retained resources apart from still-to-delete ones. A cleanup failure never becomes retention afterward. Real backup locks and retention are never weakened. Retention cannot satisfy a deletion criterion or waive operation proof; no safe sufficient proof holds the handoff. When a proof promises the real retention duration it keeps it; lock-rule removal is not a proven cleanup route.

Reason: creation access did not bring delete access (I7), and a nominal throwaway took on a 30-day lock (I12); both surfaced mid-leaf.

Foreclosed: 1b operator cleanup after each proof; 1c account-wide sweeper (live accounts, not dedicated test accounts); 2b no retention.
