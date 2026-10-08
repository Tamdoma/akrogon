# Eligibility rebuttal C (disagreement only)

1. B's "allow with carried gates" rests on `gaps()` being callable without `state.yaml`. That is true for `inputs` only: `gaps()` iterates `readiness.inputs` and nothing else (src/readiness.ts:103-121). It gives no check for `grants`, `produces` or `retained`, so the "carried gates" for those three would be prose in a chart brief, with no command, no `Missing:` line for B to read and no `akrogon status` view of created IDs or leftovers. Concede the narrow case: `inputs` alone could be allowed with the door running the SKILL.md:80 presence check before implementation and B rerunning it at review. Keep the refusal for `grants`, `produces` and `retained`, where no mechanical gate exists outside the leaf record. If the round offers B's option, it should be scoped to `inputs`, not all four sections.

Everything else: none.
