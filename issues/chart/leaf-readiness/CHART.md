# Chart: akrogon

## Destination
No leaf stops mid-run on a missing key, scope, file or approval: every external input is declared and confirmed before dispatch, the operator supplies all gaps in one pass, and seats record any remaining blocker without tripping permission rules, with no wider secret exposure.

## Forks taken
- [Readiness contract](forks/readiness-contract.md): each leaf carries a contract the door writes; `akrogon next` refuses dispatch on absent or empty inputs; `status` lists all gaps.
- [Key creation](forks/key-creation.md): operator creates outside-account keys in one batch before handoff; a leaf stores keys for things it creates itself, declared up front.
- [Key sheet](forks/key-sheet.md): door shows one sheet of exact steps before proofs; steps stored in each leaf's contract and printed by `status` for later gaps.
- [Env source](forks/env-source.md): akrogon links the registered checkout's `.env` into each leaf worktree; writes go to the real file.
- [Live change grant](forks/live-change-grant.md): one scoped grant per leaf, recorded at charting before mutating proofs, confirmed at handoff; seats reuse it and never widen it.
- [Proof fixtures](forks/proof-fixtures.md): disposable by default, cleanup identities and absence read-back proven at charting; retention only by prior agreement with owner and date; real locks never weakened.
- [Blocker record](forks/blocker-record.md): operator removes the command-text deny and permits the narrow producer save per harness; skills permit declared use, by-name checks and the producer save; blockers use existing `phase failed --reason`.
- [Save route](forks/save-route.md): producer contract names its save operation; door proves it on disposable data, checks the real target's controls and real revocation; approval plus proof is the permission; no allow entries or guard change.

## Open forks

## Fog
None.

## Off route
- Write the existing `failure` record into log.jsonl: direct, no fork; joins the handoff as its own leaf.
- Current emdash epic inputs, user settings and cleanup ownership in framework: operator steps, not leaves.
- `.env.example` vs secret-env index drift, deploy-accounts registry content, R2 retention design: consumer repo framework.

## Prerequisites
- Remove `Bash(* .env*)` from ~/.claude/settings.json and confirm merge checks can read `.env.example` (owner: operator): completed 2026-10-02, evidence in [blocker-record](forks/blocker-record.md) Findings.
- Registered repos ignore `.env` before env-link refuses unignored ones: pi-extensions ff98f0b, lingua-relay cdfab58, blepsis 90e325e (operator, 2026-10-02); akrogon's own line is env-link's work.

Handed off 2026-10-02
