# Brief: operation-proof

## What
The chart-issues skill requires, before handoff, one real recorded call for every external operation a leaf brief names (API method and path, CLI command, launch flag), made with the identity the leaf will use, and holds the handoff when any operation lacks one. Needed credentials must be in the consumer's gitignored `.env` before handoff. The existing optional measurement stays optional for exploration and is distinguished from this required proof.

## Why
The chart that produced Tamdoma/akrogon#20 probed GHL with GET calls only and recorded "I added the permission" unverified, so the missing `locations/customFields.write` scope was discovered by an implement seat (#20 item 5, #19 preflight paragraph).

## Credentials
None. The leaf edits skill prose only.

## Done-criteria
1. The operation-proof rule is defined once in skills/chart-issues/SKILL.md Take; Handoff and the relevant assets reference it at their enforcement points instead of restating it. The rule states: per operation, a real call with the leaf's identity, recorded in the fork with command, inputs, identity reference without secret values, version, date, observed result, cleanup result and limits; writes via the smallest reversible call on a throwaway target with checked cleanup; a provider dry-run or validate call counts only for what the provider documents it proves; no safe sufficient probe holds the handoff or narrows scope; no waiver.
2. SKILL.md's credential sentence (currently "so the operator fills them before dispatch") requires the needed credentials in the consumer `.env` before handoff so the probes can run.
3. skills/chart-issues/assets/shapes.md Preflight refuses the handoff when a brief names an external operation with no recorded proof, and the implementer audit checks it.
4. skills/chart-issues/assets/questions.md Optional measurement says it covers exploration only and never replaces required operation proof; declining a required probe holds the handoff.
5. Each rule keeps one canonical definition; cross-references in Handoff, the preflight audit and Optional measurement enforce it without restating it.
6. The implementation report records an audit of three cases against the edited rule: a sufficient real probe, a limited provider dry-run, and an unproven or declined operation, each reaching the outcome the rule requires, and confirms every link in the three edited skill files resolves. The configured `checks` commands pass as regression checks.
