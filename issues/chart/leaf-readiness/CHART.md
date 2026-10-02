# Chart: akrogon

## Destination
No leaf stops mid-run on a missing key, scope, file or approval: every external input is declared and confirmed before dispatch, the operator supplies all gaps in one pass, and seats record any remaining blocker without tripping permission rules, with no wider secret exposure.

## Forks taken
- [Readiness contract](forks/readiness-contract.md): each leaf carries a contract the door writes; `akrogon next` refuses dispatch on absent or empty inputs; `status` lists all gaps.
- [Key creation](forks/key-creation.md): operator creates outside-account keys in one batch before handoff; a leaf stores keys for things it creates itself, declared up front.
- [Key sheet](forks/key-sheet.md): door shows one sheet of exact steps before proofs; steps stored in each leaf's contract and printed by `status` for later gaps.

## Open forks
- [Env source](forks/env-source.md): symlink the registered `.env` into the worktree, or pass its path.
- [Live change grant](forks/live-change-grant.md): approval recorded once at chart time as named targets and operations.
- [Proof fixtures](forks/proof-fixtures.md): disposable proof resources, real locks untouched.
- [Blocker record](forks/blocker-record.md): akrogon presence command, or reconcile the user deny rule.

## Fog
None.

## Off route
- Write the existing `failure` record into log.jsonl: direct, no fork; joins the handoff as its own leaf.
- Current emdash epic inputs, user settings and cleanup ownership in framework: operator steps, not leaves.
- `.env.example` vs secret-env index drift, deploy-accounts registry content, R2 retention design: consumer repo framework.
