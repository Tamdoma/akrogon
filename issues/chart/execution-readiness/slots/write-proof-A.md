# write-proof, slot A, 2026-09-28

## Findings
- The skill treats measurement as optional. questions.md:54 "Offer a prototype only for a named uncertainty ... a choice to proceed or settle it without measurement"; SKILL.md:51 "small optional prototypes explicitly chosen as measurements". Nothing requires proof of an operation a brief names. SKILL.md:53 requires credentials listed by name and absent ones filled "before dispatch", not before handoff.
- #20: the chart probed GHL with GET only and recorded "I added the permission" unverified; `locations/customFields.write` was missing and reached implement (INTAKE.md:11-15).
- The operator-placed probe (probe-ghl-scopes.ts:18-30) proves the two writes by POST 201 then DELETE with the leaf's own token from .env. It reads events only (:32-33), prints non-2xx without failing (:19, :26), and deletes a hardcoded field id (:34-35). Good shape of evidence, not a reusable recipe.
- Working precedent, 2026-09-19: the noninteractive-leaf-execution fork recorded "Measurements (operator request: prove the API during charting)" with the literal command and JSON response for `herdr notification show` and `herdr tab rename` (git show 648b6eb^:issues/chart/noninteractive-leaf-execution/forks/push-notification.md). That is the proof format that worked.
- Operator correction 2026-09-19 widens scope: every external command or API a leaf contract names, not only writes. So local CLIs outside the repo (herdr, pi, gh) count too.

## Q1 recommendation
A: For every external operation a brief names (API method+path or CLI command), the chart records a real call made with the identity the leaf will use (the consumer .env credential), the literal command and response, and the date, under the fork's Findings as a Measurement. Writes are proven by the smallest reversible call: create then delete, a provider dry-run/validate endpoint, or a test target. A write with no safe probe holds the handoff until the operator names a safe target. Consequence: needed credentials must be in .env before handoff, not before dispatch (SKILL.md:53 changes). Reason: a GET or a scope listing does not prove a write; #20 shows the cost.
Alternatives: B scope introspection or GET counts (cheaper, is what failed in #20). C operator may waive an operation as unproven with a recorded reason (unblocks irreversible ops, reopens the #20 hole).

## Q2 recommendation
A: The charting agent runs the probes during the chart pass, as scratch measurements discarded afterwards; an existing consumer probe may be run instead. The operator is present to add a missing scope and re-run. Reason: a probe leaf means an unproven scope reaches a seat, which the destination forbids, and leaf branches carry code only.

## Pitfalls
- A 2xx on create with a failed delete leaves residue in a live account: the probe fails and names the residue.
- Use a throwaway name prefix (probe-ghl-scopes.ts uses `zz_probe_`) so residue is findable.
- akrogon learns no service APIs (Off route); the rule lives in skill prose and the handoff audit, not in `akrogon preflight`.
