# Direct contract re-check B

Base and reviewed code head: `568556b99236a3463e2eec416a625700e8990b06` (unchanged).
Verdict: **ready**.

Scope: only review-B-4 F1's rollout correction in `forks/writer-gate.md` and the Pitfalls in `CHART.md`.

## F1 resolved

The revised sequence holds migration behind a confirmed live source-home run record before deployment. It keeps that hold through deployment and drainage of pre-deploy akrogon processes. Thus an old command launched during deployment can finish while migration remains deferred, and subsequent launches use the repaired admission barrier. The hold is released only after those old writers have drained. Its own admission precedes the copy, and ending it introduces no further admission.

This removes the interval identified in review-B-4 without suspending leaf launches. The previous post-cutover record-recovery exception is gone. The Pitfalls now describes the same hold, deploy, drain, release and read-back sequence and correctly leaves execution pending with the door.

Verification: read both requested current contract sections and compared their ordering and exclusions with review-B-4 F1. Code is unchanged, so the verification recorded in review-B-3 remains applicable and no tests were rerun. F2 and F3 remain resolved. No outstanding Fixes or Nits in this re-check. This verdict accepts the rollout contract, not completion of the host cutover. No deployment, host mutation, product edits, commits or phase commands were performed.

Last operation: contract-only direct re-check recorded `ready`; F1 resolved.
Next: chart door follows the accepted rollout and records its execution and read-back evidence.
