# Review B: operation-proof

Base: `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`
Reviewed head: `f984c8ae83156b31aaa5502abab4b02a0c96f360` (matches report head; worktree clean, head ahead of base, no `issues/` paths in diff).

Blind review: peer review not read. No debate artifacts exist or are expected (`debate: no`).

## Scope check

Diff is exactly the three owned files: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/assets/questions.md` (7 insertions, 5 deletions). No `AREA.md` in the diff, so no area-path listing applies. No src, test, docs, README, config or standing-design change, matching the design exclusions (no src change, no new verb, no service recipe). No new test file, correct per standing design (no vanity tests) and plan D7.

## Criterion verification (live greps, not reading only)

- C1 (brief 1, 5): all eight canonical elements present in the Take paragraph (SKILL.md:53): every external operation, identity reference without secret values, cleanup result, smallest reversible, throwaway target, dry-run counts-only, holds handoff, no waiver. "cleanup result" appears only in SKILL.md, so the single-definition rule holds; Handoff (SKILL.md:63), shapes and questions each carry one cross-ref without a field list.
- C2 (brief 2): credential sentence requires keys in the consumer `.env` before handoff so probes can run; `grep "before dispatch" skills/chart-issues/` has no match.
- C3 (brief 3): shapes.md:166 refuses a brief-named operation with no recorded proof under the Take rule; shapes.md:168 audit checks that refusal. Both additive, no existing sentence reworded.
- C4 (brief 4): questions.md:54 states exploration-only, never replaces required proof, and declining a required probe holds the handoff; sandbox sentences intact.
- C5 (brief 6 audit): report walks I2 (proceed), I3 (partial credit) and I4 (hold, no waiver) to the required outcomes against the quoted rule lines.
- C6 (brief 6 links and checks): the three SKILL.md asset links resolve to existing files; questions.md has zero links; the five shapes.md `forks/<slug>`-style links are template placeholders, correctly listed as exempt. Report records full suite 306 pass / 0 fail, typecheck exit 0, format unchanged exit 0.

Started from the changed behavior and opened the describing doc page: docs/guide/chart.md Handoff claims (named-not-pasted credentials, no timing statement) stay valid, so no documented behavior changed and no human-doc edit was needed. The D8 sweep hits (setup.md, README.md) are unrelated dispatch-timing lines, correctly left alone.

Report gaps: none material. Base, head, pasted command results, worker returns, limitations and unverified criteria (none) are all present. Checks were not rerun: no code change, evidence complete, diff unchanged since the report.

## Findings

- N1 (Nit): the Handoff cross-ref (SKILL.md:63) reads "Audit the proposed contracts as an implementer and the Take operation-proof rule", which parses as auditing two objects. Reason: the intent is auditing against the rule, so "as an implementer against the Take operation-proof rule" would state it directly. Wording preference only; the reference works and nothing is restated, so this cannot open repair.

## Verdict

`nits` — all done criteria met with evidence; one non-blocking wording Nit.
