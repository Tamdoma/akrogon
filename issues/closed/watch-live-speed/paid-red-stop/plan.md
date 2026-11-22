# Plan: paid-red-stop

Skill-text leaf: one added paragraph inside `skills/lifecycle-rules.md` `## Grant reuse and count lines`. No product code, no new test. Serial-solo: one unit, one wave.

## Decisions

- **D1 · Site.** The rule is appended as one paragraph at the end of `## Grant reuse and count lines` in `skills/lifecycle-rules.md` (the per-skill paths are symlinks to this file). No other section or file is edited. Criterion 1 requires the section, and a paragraph inside an existing section keeps the four-rule count true; a fifth heading would break it.
- **D2 · Text.** The added paragraph, carrying the three corrections verbatim in meaning:

  > Within one grant entry's operation, one paid launch runs before the operation's other paid launches. After a paid launch of that operation goes red, no further paid launch of it runs until a free reproduction of the cause passes after its repair, or the launch is a live-only diagnostic that names an observation no earlier run produced. A diagnostic launch that repeats the known failure without producing its named observation ends further paid launches of that operation under the seat's operator-blocker stop. This changes no count line or repeat-bound rule.

  D2's first sentence covers brief criterion 1's "one paid launch ... runs before its others" and the case's back-to-back cells; the third covers criterion 2; the fourth is criterion 1's "says it changes no count line or repeat-bound rule", preserving the operator's grant-run-count Taken (written rules only, warn and continue past a repeat count).
- **D3 · Diagnostic order.** The diagnostic exception sits inside the same paragraph as the stop, so a seat reads the exception and its stop together; no separate section. The named observation is recorded by the existing count line written before each launch, so the rule adds no recording step of its own.
- **D4 · Merge scope.** No merge-issue text changes. The rule lives in the shared section the merge seat already reads, and merge's rerun (`akrogon verify --attempt <id>`) and known-red run are the same operation's launches under the same bound, so criterion 3's "same stop" follows from D2 unqualified; the merge red-retry paragraph is the same red path, not a competing rule.
- **D5 · Seat-stop naming.** Criterion 2's "seat's operator-blocker stop" resolves per seat: plan and implement `akrogon phase <slug> failed --slot A`; check `failed --slot <A|B>`; merge `failed --slot B`, each recorded in its own record file. The rule text says "the seat's operator-blocker stop" once and the per-skill intro lines already name it.
- **D6 · No mechanical case for wording.** Per the design's locked interpretation (leaf-review-b F9): `tests/docs-links.test.ts` proves links and command references only and stays green if the stop sentence were removed; no text check proves the rule, so criteria 1–3 are proven by review reading the new text against the watch-timer case. No case is added: a `toContain` on the sentence would be an explanatory-prose assertion (LESSONS.md 2026-10-01) and a wording proxy the model-choice line does not cover.

## Read-first paths

- `skills/lifecycle-rules.md` — owned file; `## Grant reuse and count lines` is the edit site.
- `issues/chart/watch-live-speed/forks/disposition.md` lines 42, 60 — Corrections 1–3 item 8, the locked wording to carry.
- `issues/chart/grant-run-count/forks/signposts.md` `## Taken` — 1c/2b: written rules only, warn and continue past a repeat count; D2's last sentence must not narrow it.
- `issues/chart/watch-live-speed/slots/leaf-review-b.md` F9 — why no text check proves the criteria.
- `skills/merge-issue/SKILL.md` lines 75–76 — the red-retry rule the new rule must not contradict.
- `tests/docs-links.test.ts` lines 252–292 — existing skill-text checks whose green must be preserved.

## Interfaces

None. No command, schema, export or config changes. `grants[]` is empty; no covered launch, no count line, no `.env` read. `akrogon status` printed no `Missing:` lines and `env_names: []`; no credential is named by the design.

## Checklist

### Wave 1 — U1 (serial-solo, A implements)

- Owns: `skills/lifecycle-rules.md`. No shared test resource, no prerequisite unit.
- Edit: append the D2 paragraph at the end of `## Grant reuse and count lines`.
- Commit: the doc change on the leaf branch. No test commit precedes it — no criterion test is planned (D6), so the test-before-product order has nothing to order.

## Criteria and proof

All three criteria are model-choice in character per the design's locked interpretation: the choice (does the written rule hold against the case) is read by the reviewing seat, and its record is `skills/lifecycle-rules.md` plus this plan. Proofs below are what the review seat reads and the function checks that run; the rule's runtime obedience by future seats is what stays unproven — no test can prove it, and the design names none.

- **Criterion 1 — section holds the rule, four-rule count and intros stay true, no count/repeat-bound change.**
  - Mechanical part: `git diff "$AKROGON_BASE"...HEAD -- skills/lifecycle-rules.md` shows added lines only and zero removed or modified lines — proves "changes no count line or repeat-bound rule" at the file level. Observation: `git --no-pager diff <base>...HEAD -- skills/lifecycle-rules.md`, size seconds, rerun trigger: any later commit touching the file.
  - Reading part: review seat reads the new paragraph inside `## Grant reuse and count lines` and the file's "four rules" intro against it; four `##` sections unchanged. Record read: `skills/lifecycle-rules.md`, this file.
  - Condition trace (against D2/D4/D5): the conditions the decision can break are (a) paragraph lands outside the named section — the reading catches it since the reviewer checks it sits inside `## Grant reuse and count lines`; (b) wording removes or rewrites the count-line or repeat-bound sentences — the diff check plus review read of the unchanged first paragraph catches it; (c) added heading breaks "four rules" — caught by the same read. No mechanical case exists for (a)/(c) beyond the review read; a deletion-only diff check covers (b). Red evidence at plan: none planned — text presence is shown by the diff itself, not a test.
- **Criterion 2 — a diagnostic that repeats the known failure without the named observation ends further paid launches under the operator-blocker stop.**
  - Reading part only: review seat reads the added paragraph's third sentence and each skill's named operator-blocker stop (plan-issue/implement-issue `failed --slot A`, check-issue `failed --slot <A|B>`, merge-issue `failed --slot B`) and applies it to the case: a 7th identical-error diagnostic naming no new observation stops. Record read: `skills/lifecycle-rules.md`, `skills/*/SKILL.md` intro lines.
  - Condition trace: the decision could break it by (a) naming a different stop or none — review read catches; (b) phrasing the diagnostic exception so it never terminates (missing "ends further paid launches") — review read catches. No mechanical proof exists; a grep for the sentence is exactly the prose proxy rejected in D6.
- **Criterion 3 — merge's red-retry rule and the new rule do not contradict.**
  - Reading part: review seat reads D2's unqualified scope against `skills/merge-issue/SKILL.md` lines 75–76: the merge rerun is one launch of the same operation under the same bound, so a merge-stage paid relaunch after a paid red obeys the same stop; the red-retry is the seat's permitted single retry, and the known-red run is a diagnostic for the cause, not a free relaunch past the stop. No text change in merge-issue.
  - Condition trace: contradiction arises only if D2 says the stop does not apply at merge or if merge's retry paragraph is restated differently — review read of both files catches it. No diff to merge-issue is made.

## Verification

- `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` after the edit — the file-bearing suite that must stay green (links, anchors, symlink checks). Runner `bun test` exists at `AKROGON_BASE`; no new machinery. Failure mode it catches: a link or anchor the edit breaks; it does not prove the rule text (per F9).
- `git --no-pager diff "$AKROGON_BASE"...HEAD -- skills/lifecycle-rules.md` read for added-lines-only — criterion 1's mechanical part.
- No `akrogon verify` is planned at synthesis; the brief names no whole run.

## Notes

- Reusable lesson: none yet; if review confirms this leaf retires a mechanism behind an existing line, the lesson rule applies then.
- Design/brief agreement: no conflict found; Corrections item 8's wording is carried un-narrowed.

## Implementation notes

- 2026-11-20 · Brief criterion 3 requires applying the paid-red rule before invoking any retry or known-red command that can launch paid work on the head or base, including at merge.
