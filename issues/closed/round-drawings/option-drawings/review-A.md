# Review A: option-drawings

Base `5499e3dab209ccc6fae14c8f4568e62e5c4c15c2`, reviewed head `30b7d7378338f0e2685d9f255cd5cb9f787aee8a`. One commit, two files, docs-only. Verify receipt green on the head (`verify leaf 30b7d737…: green`).

## Criterion read (the prose proof per standing design)

- C1 (reader learns when/where/form/replacement/pre-send): met. The added sentence in "Every round uses this shape" carries the when (visible/followed difference + much easier, none otherwise), the where (one fenced text block, directly after the option bullets, before How to choose), the form (one per option, captioned with the option code, side by side under ~60 columns else stacked), the no-replacement clause and the autopilot clause; the pre-send read sentence now names "any drawing block".
- C2 (template shows one block, renders as one, ≤60 cols): met. ` ```text ` inside ` ```` ` cannot close the outer (info-string fences never close); extraction at the 4-tick fence reaches `Challenge check` (check `c2-template-block: 0`), every block line ≤48 cols (check `c2-block-width: 0`), the block sits after the `- **1b**` bullet and before `How to choose`.
- C3 (autopilot, signposts exception, verbatim keeping): met — "the same rule holds in autopilot rounds", "may carry drawings under the same test", "keeps the chosen option's drawing verbatim beside them".
- C4 (one sentence in plan-work.md): met — one sentence keeping the "much easier" condition.
- C5 (only the two named files): met — check `c5-only-named-files: 0`; diff lists only `questions.md` and `plan-work.md`, tree clean.

## Plan and design conformance

- D1–D7 implemented as planned. D8 resolved correctly (60 governs over the stale 80 in pick 2). D9 fallback taken (drawing named at the read site) — acceptable, recorded in report.
- Exclusions kept: no `src/`, `tests/`, `issues/` change; no image/SVG; SKILL.md untouched.
- No test needed (standing design: no test pins the round shape). No `Test-Change:` trailers required — no test file touched.

## Live surface / doc sweep

- `grep` for "text only" / stale round-shape claims in `docs/` and `skills/`: no contradicting text. SKILL.md delegates the light shape to questions.md (unchanged, still true). `docs/use/autopilot.md` names the signposts round only for mode behavior — not stale.
- No `AREA.md` in the diff; no index or link changes needed (the plan-work.md sentence adds no link, `docs-links.test.ts` unaffected).
- No lessons applied or removed.

## Nits

- N1 — `tests/run-units.test.ts` "a verify pass survives its caller being SIGKILLed mid-check" flaked red inside the first `akrogon verify` (receipt red), then passed targeted (`check retry-sigkill-test: 0`) and in the full suite (`check test: 0`, 1309/0). Recorded `inconsistent` in report.md with both logs; the retry and green-receipt rules are satisfied. Not a leaf defect — the diff is docs-only. If it recurs on main, seed it as flaky; a green retry is not a base-red filing per the review rule.
- N2 — Example drawing: caption `1b` sits one column left of its box's left edge (box at col 26, caption at 25). Cosmetic in a placeholder sketch; the criterion asks only that captions carry the option code, which holds.
- N3 — The rule describes side-by-side vs stacked but the template shows only side-by-side; the prose covers the stacked form, and the criterion asks the template to show "one such drawing block", which it does. Would only become a Fix if a reader could not derive the stacked layout — they can, from the sentence.

## Verdict

`ready` — all five done-criteria read as met, mechanical probes green, verify receipt green on the reviewed head, no Fixes, three nits none of which block.

Requested move: merge.
