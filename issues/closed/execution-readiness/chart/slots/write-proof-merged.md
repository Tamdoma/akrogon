# write-proof merged, 2026-09-28 (A merged; tags (A) (B) (A,B))

## Findings
- (A,B) Measurement is optional today (questions.md:52-54, SKILL.md:51). Credentials are listed and filled "before dispatch" (SKILL.md:53), never proven by a call. The handoff audit has no operation proof (shapes.md:164-170).
- (A,B) #20: GET-only probing plus "I added the permission" let `locations/customFields.write` reach implement (INTAKE.md:11-15).
- (A,B) probe-ghl-scopes.ts proves field and calendar create/delete with the leaf's .env token (:18-30), only GETs events (:32-33), prints failures without failing, and deletes a hardcoded id (:34-35). Evidence shape, not a pass gate.
- (B) So the reported "all three scopes confirmed" is not supported for events.write by the supplied script: HighLevel maps event GET to `calendars/events.readonly` (github.com/GoHighLevel/highlevel-api-docs docs/oauth/Scopes.md).
- (A,B) Precedent 2026-09-19: noninteractive-leaf-execution recorded literal command and response for `herdr notification show`, `herdr tab rename` and pi `--exclude-tools` (648b6eb^: forks/push-notification.md, forks/ask-tool-availability.md).
- (B) Practitioners: Toby Clemson (Thoughtworks, consumer-driven contract tests test only what the consumer uses), Rosanne Ussery (Slack, least-privilege scope-to-method audit per identity), Pact "can-i-deploy" (evidence tied to version and environment). They agree: prove the consumer's actual operations in the target context. None treats a scope list as proof.
- (B) Provider dry-runs prove only what they document: AWS EC2 DryRun proves permission, the IAM simulator can differ from live; RFC 7662 introspection reports scopes, not that an operation works.

## Recommendations
- Q1 (A,B) Every external operation a brief names (API method+path, CLI command, launch flag) gets a real call with the leaf's identity, recorded with command, inputs, identity reference (no secrets), version, date, observed result, cleanup result and limits. Writes use the smallest reversible call on a disposable target with verified cleanup. No sufficient safe probe holds the handoff. Consequence (A,B): needed credentials must be in .env before handoff, not only before dispatch.
- Q2 (A,B) The charting agent runs it during the chart pass; consumer scripts may be run, scratch code discarded, findings kept. A probe leaf puts the unproven operation in a seat.
- Q3 (B, new) A provider-native dry-run/validate counts only for the property it documents, under the real identity and resource; remaining assumptions need their own evidence.

## Disagreement carried to operator
- (A) Waiver: may the operator mark an operation unproven with a recorded reason and still hand off (for writes that cannot be undone, e.g. sending a message)? (B) No: declining a probe holds the handoff or narrows its scope.
