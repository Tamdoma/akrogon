# Readiness contract

## Question
Q1. Should each leaf carry a structured readiness contract that `akrogon next` checks before it starts a seat?

### Carries
- F1: the door's prose credential and operation-proof rule (a72fa61, 2026-09-28) predates the emdash charts and did not prevent mid-leaf stops.
- Standing design: every secret lives in the consumer repo's gitignored `.env`; no vault or broker.

## Findings
- (A,B) Contract recommended. A: env names and required files, presence only. B: also identity and target per proof, proof references and granted live changes, no live calls from code.
- B rebuttal R3: each proof must name the identity and target it used; a changed identity, target or operation invalidates it; the dispatch presence check consumes the audited contract and does not itself prove scopes or approval.
- Research: better-than-training · GitHub Docs, Reuse workflows (https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows, read 2026-10-02) · a reusable workflow declares required secrets and GitHub rejects a caller that does not supply them before jobs run.
- Pitfalls: a name check cannot prove scopes; revocation after dispatch still fails mid-leaf; an input produced by a prerequisite leaf names that producer instead of blocking dispatch.

## Taken
2026-10-02, operator: `1a`

Each leaf carries a readiness contract written by the door: env names with the repo whose env holds them, required files, granted live changes, and proof records naming the identity and target used. `akrogon next` refuses dispatch while any declared input is absent or empty, and `akrogon status` lists every gap across open leaves. akrogon makes no live calls. Reason: the prose-only rule already failed (F1); gaps should cost a status line, not seat hours.

Foreclosed: 1b, prose plus a stricter door audit only.

Correction 2026-10-02, operator, verbatim: "This should be general, not for Cloudflare or GitHub only. Every time a leaf needs something I need to know up front."
Applies as: the contract is provider-neutral and covers every need of any kind (keys, scopes, files, hostnames, approvals, values produced by other leaves); all of it is visible to the operator before handoff.
