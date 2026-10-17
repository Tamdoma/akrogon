# Review A: expiring-time-rule

Base: `c55432b7c93b9e6269f4748d6b36b80af9248688`
Reviewed head: `483c693771e83aa46aa074c7576bc3e3b5beb1b3` (sole commit `483c693`, clean worktree)

## Diff scope

One line in `skills/plan-issue/SKILL.md` (the criterion-test paragraph): rule sentence inserted after "…a case may extend an existing test file.", and `, since main is green by the receipt gate,` removed from the `run-check` sentence. Matches plan.md D1/D2 exactly; no other file touched; design exclusions respected (no src, no lint, no audit, no tests).

## Criterion verification

- Criterion 1: `grep -c "injects the time or computes its expected value" skills/plan-issue/SKILL.md` → `1`; sentence sits inside the paragraph beginning "With `plan.md` written" (line 69). Sweep `grep -rn "as calendar time advances\|injects the time\|computes its expected value" skills/ docs/` outside that file → empty: no other skill restates it.
- Criterion 2: `grep -rn "receipt gate" skills/ docs/ tests/ src/` → only `tests/AREA.md:19`, which names `tests/receipt-gates.test.ts` — the receipt-gate feature, not the removed claim. The criterion-test paragraph no longer contains "main is green by the receipt gate"; the sentence remains grammatical.
- `akrogon verify` green on `483c693` (format, 994 tests, typecheck; report cites `implementation/check-test-1792228431662-697459.log`).

## Docs

No documented behavior changed. `docs/guide/phases.md:80` describes the synthesis flow without the removed clause and without the new rule; no stale claim. `skills/AREA.md` carries no copy of either text. Consumers (`check-issue`, `implement-issue`, `merge-issue`) name `test-proof-rules` only — verified, no copy drift.

## Test judgment

No tests required: design's standing-design interpretation for this leaf says proof is reading the changed paragraph, "No vanity tests". The prose-assertion lesson (2026-10-01) supports refusing wording-coupled tests. No `Test-Change` trailers needed; none present (no file matching `src/test-files.ts` changed).

## Findings

No Fix.

Nit — rule wording variant: the committed sentence says "would stop holding as calendar time advances" (brief phrasing) while the design's verbatim was "would expire as calendar time advances". Semantically identical and both carve-outs match; criterion 1's "states the rule" is met and no consumer parses wording. Deferred because two near-identical phrasings existing across brief/design/text is drift risk only, not a defect today. Promotes to a Fix if a future reader could argue the carve-out scope changed — it did not ("stay valid" ≡ "unaffected").

## Verdict

`nits`
