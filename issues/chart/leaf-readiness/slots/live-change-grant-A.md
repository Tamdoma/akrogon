# Live change grant: A independent

## Evidence
- emdash-launch design required the live launch (framework issues/open/emdash-cms/emdash-build/emdash-launch/design.md:143,148: real backend mutations, "the live launch stays"). The seat still treated Cloudflare, R2, GitHub and domain mutation as not authorized (review-B.md:254-258, review-A.md:114) and waited about 8 h (INTAKE I6). Requiring a live run in a design was not read as permission to mutate.
- The Claude Code harness tells every Claude seat to confirm hard-to-reverse or outward-facing actions "unless durably authorized or explicitly told to proceed without asking". A design sentence is not an explicit authorization, so a careful seat stops. The fix is an explicit authorization record, not looser seats.
- The operator's eventual grant named a target (retained r10 or a fresh fixture), operations (provider and domain mutations), cleanup (Worker, domain, D1, R2, KV, repo, Builds triggers plus old residue) and a stop line (human GitHub sign-in, client invite) (review-B.md:256, report.md:226). That is the shape a grant needs.
- Cleanup then failed on missing `delete_repo` scope (review-A.md:156): a credential gap, already covered by key-sheet.

## Recommendation 1a
The door records a live-change grant per leaf in its contract, approved by the operator at the handoff review: account identity name, target resources or a name pattern for leaf-created fixtures, allowed operations including cleanup, stop line (what stays human), and expiry (leaf closes). Phase skills state that an operation inside the contract's grant is authorized and needs no further question. Anything outside it (new target, different mutation, production resource not named) is an operator action recorded by the blocker-record mechanism.

## Options
- 1a per-leaf grant in the contract, approved at handoff review.
- 1b one chart-level grant covering all leaves. Cost: broader than any single leaf needs; a leaf can act on another leaf's targets.
- 1c keep per-run approval. Cost: the 8 h wait repeats.

## Pitfalls
- A grant naming "the account" is too broad; name resources or a fixture prefix.
- Production targets (a live client domain) should be named singly, never by pattern.
- The grant does not supply credentials or scopes; key-sheet does.
