# Report: coverage-audit

Serial-solo implement (one wave, one unit per plan.md). Base `1c444c6b3d4f65d82fb8162ca45b277b2a1df8d9` (= `AKROGON_BASE`), committed head `5499e3dab209ccc6fae14c8f4568e62e5c4c15c2`. Text-only leaf: no code, no tests (standing design: no test pins new prose); proofs are repeatable reads of the written artifact per plan.md.

## Changed files

- `skills/chart-issues/SKILL.md` "Take": the operation-proof paragraph rewritten into one general rule (D1–D6) — a proof counts only for the property it observed, which `limits` records; dry-run and locked-setting specifics folded in; every pre-existing key part (clause resting on something existing before the leaf builds) observed at charting by the smallest call reaching it, free before paid, within the one operator-approved paid test budget; split clause for an existing checker accepting new output; every observation a `proofs` entry with `limits`; the cut rule replaces "the handoff is held and scope is not narrowed" (declined or impossible probe cuts the contract at the review, naming the cut and its landing — prerequisite leaf, design exclusion or Off route entry — removing the proof obligation and dropping the operation from What; a cut removing the chart's useful outcome parks under the existing non-grant approval wait, never answered by A); "no waiver" kept.
- `skills/chart-issues/SKILL.md` "Handoff" (D7): one sentence beside the live-run line — a per-leaf key-part line listing each pre-existing key part with the `proofs` entry that reached it and anything cut with its landing, information only; plus the next-release-link statement when the chart changes the door's own skill.
- `skills/chart-issues/assets/shapes.md` "Preflight and validation" (D8): the implementer audit gains the per-criterion step naming the proof or charting observation that reached each pre-existing key part, refusing the handoff when one rests only on a proof's `limits` or on no proof; the existing missing-proof refusal stays; final sentence now names both refusals.
- `skills/chart-issues/assets/questions.md` "Optional measurement" (D9): "Declining a required probe holds the handoff under the Take operation-proof rule" replaced by the cut rule; "never replaces required operation proof" kept.
- `docs/use/plan-work.md` "Review the handoff" (D10): one sentence naming the new per-leaf review line.

Commit `5499e3da` "chart door: require observed proof for pre-existing key parts before handoff" — no `Test-Change:` trailer, no test files touched.

## Done-criterion proofs

All run on head `5499e3da` through `akrogon run-check` in the leaf worktree.

| Criterion | Command | Result |
|---|---|---|
| 1 | `sed -n '/^## Take/,/^## Handoff/p' skills/chart-issues/SKILL.md` | `check criterion-1: 0` — printed paragraph carries the general rule (proof counts only for the property it observed, `limits` records), both folded specifics, the key-part clause rule with smallest call/free-before-paid/approved paid test budget, the split clause, and every-observation-`proofs`-entry recording |
| 2 | `sed -n '/^## Take/,/^## Handoff/p' … && ! grep -rn "scope is not narrowed" skills/chart-issues/` | `check criterion-2: 0` — proof-before-handoff rule, cut rule with three named landings, obligation removal, What drop, non-grant park, "no waiver" kept; "scope is not narrowed" absent |
| 3 | `sed -n '/^## Preflight and validation/,$p' skills/chart-issues/assets/shapes.md` | `check criterion-3: 0` — audit paragraph names the proof per pre-existing key part and refuses limits-only/no-proof; the missing-proof refusal stays in the same section |
| 4 | `sed -n '/^## Handoff/,/^## Direct route/p' skills/chart-issues/SKILL.md` | `check criterion-4: 0` — per-leaf key-part review line beside the live-run line, information only; release-link statement present |
| 5 | `sed` of "Optional measurement" + "Review the handoff" `; ! grep -rn "Declining a required probe holds the handoff" skills/chart-issues/` | `check criterion-5: 0` — "never replaces required operation proof" kept, declining-probe sentence replaced by the cut rule, docs page names the new line |
| 6 | `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` | `check criterion-6: 0` — exactly `docs/use/plan-work.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`; `src/`, `tests/`, `issues/` untouched |

Worked-example application (criterion 1/3, judgment on the written text): `fixture-weave-recorder`'s `proofs[0]` observed batch dispatch and cleanup while `limits` disclaimed "the copy judgment session, finalize or verify acceptance"; criterion 1's "the real verify reports no finding" is a clause resting on an existing checker's verdict — under the new Take rule it needed a charting observation (split: existing fixture + current verify checks observed at charting, acceptance of the new output left to the leaf), and under the new shapes audit the handoff is refused because verify acceptance rested only on a proof's `limits`.

Log paths:
- `implementation/check-criterion-1-1793794272984-3106051.log`
- `implementation/check-criterion-2-1793794275642-3106405.log`
- `implementation/check-criterion-3-1793794277163-3106770.log`
- `implementation/check-criterion-4-1793794278535-3106996.log`
- `implementation/check-criterion-5-1793794283233-3107363.log`
- `implementation/check-criterion-6-1793794285532-3107631.log`

## Checks

`akrogon verify` on committed head `5499e3da`: **green** — format, test (1309 pass / 0 fail), typecheck; log `implementation/check-test-1793794364022-3108005.log`.

## Known limitations / unverified criteria

- New handoffs only (signpost 5a): already-handed leaves are not re-checked.
- Written guidance to the door seat only (signpost 1c): no command enforces the rule; a door misreading prose can still hand off a gap.
- Docs hits outside `plan-work.md` mention the review without restating the proof rule and stay unchanged per the design inventory.
- Paid overspend past an approved bound remains possible with a warning (signpost 2b), owned by chart grant-run-count.
- All six done-criteria proven; none unverified.
