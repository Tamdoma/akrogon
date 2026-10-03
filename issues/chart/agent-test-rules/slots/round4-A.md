# Round 4 map A

## Diagnosis
- The chart door is told to write tests into criteria. shapes.md:134 (chart-issues/assets): a done-criterion is a "concrete check ...: a command in blocking checks, or a test this leaf adds". So briefs name test files, line ranges and assertions.
- TMPDIR proves it. issues/closed/leaf-temp/leaf-temp-dir/brief.md:15 criterion 6: "No test in the suite creates anything under the real /var/tmp/akrogon-<uid> ... a test asserts the fixture root was used." The worker turned that into `!tmp.startsWith('/var/tmp/akrogon-')` (175b862), which fails whenever the seat's own inherited TMPDIR lives there. The criterion dictated a proof, the proof was brittle, and nobody could change it (plan:65, implement:75, check:55).
- Criteria 1-2 of the same brief name `tests/next.test.ts:1784-1814` and "at most 62 bytes for a 10-digit uid". Test design done at charting.
- Because criteria = tests, every bad test is a locked requirement. That is the whole problem class.

## Recommendation O1: criteria state outcomes, never proofs
- shapes.md:134 changes to: a done-criterion states an observable outcome (what a user, consumer or command sees), never a test file, assertion or test count. Charting writes less, not more.
- plan.synthesis already maps each criterion to its proof command (plan-issue:61). Proof choice lives there only, under 5a/7a.
- check.review judges a test by "does it catch the failure of the outcome" (check:51 already says this). check:55 "scenarios a criterion names always block" stays, now naming outcomes, not test shapes.
- A bad test is then just a bad proof. Any seat may fix it under the Q1 rule (cite the outcome it serves, show it still fails on the broken behavior per 7a). No return, no recorded-correction protocol, no new phase.
- The coding agent can't shrink its target: the outcome text is in brief.md under issues/, which seats cannot edit on the leaf branch (src/phase.ts:254-259 rejects issues/ diffs). Only proofs move, and B reviews proofs against the fixed outcome.
- Deletes: test-shaped content from criteria; the need for any "criterion correction" rule. Adds: one wording change in shapes.md:134 and the audit line at shapes.md:252.

## Other options
- O2 Proofs owned by a different seat than the code (B writes acceptance tests from outcomes before A codes). Strong independence (Stack), but adds a phase and doubles test work.
- O3 Mechanical check at `akrogon phase`: changed pre-existing test files must each be cited in the report. Enforces Q1, does not fix bad criteria. Belongs to K1 Q2.
- O4 Recorded corrections + B check (rejected by operator).

## Pitfalls
- Vague outcomes ("works well") give review nothing to judge. The outcome must still be observable and specific; only the proof moves out.
- Some outcomes are a number by nature (62-byte path limit for sockets). A number that is the outcome stays; a number that is a test detail goes.
