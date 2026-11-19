# Framework door facts for model-judgment (Tamdoma/akrogon#140)

From the framework door t1xr, 2026-11-17. Facts and paths only. `FW` = /home/ivan/Work/infra/tamdoma/framework.

## 1. Seat files

Copied to `issues/chart/model-judgment/slots/framework-review/`:
- `brief.md`: the blind brief sent to B, C and D.
- `B.md`, `C.md`, `D.md`: the three consultant returns.
- `D-rebuttal-brief.md`, `D-rebuttal.md`: D's rebuttal on its X9. D withdrew X9 and proposed the record/choice split, posted as https://github.com/Tamdoma/akrogon/issues/140#issuecomment-6946165494.

There is no A file. The door's own view went straight into the report body of #140 and was never written as a separate seat file. The report's statement "Seat files are kept at the door's scratchpad" is therefore true for B, C and D only.

## 2. Charts since 2026-11-11 where a quality concern did not become a proxy

Searched: the 34 chart folders under `FW/issues/chart/` whose `seats.yaml` `opened` is 2026-11-11 or later. I grepped the forks of 7 likely candidates for model-judgment wording (topic-theme-fit, photo-verdict, humanizer-occurrence-count, rewrite-sibling-check, framework-check-review, ia-revamp, review-records). The other 27 were not read.

Found:
- **topic-theme-fit** (opened 2026-11-11). `forks/fit.md:6`: "1a One model judgment at research time, over the whole network". Theme fit is judged by the model, not by keyword matching. `fit.md:45` cites practitioner sources for moving from rules to one model judgment.
- **ia-revamp provider-marking**. `forks/provider-marking.md:13`: "Marking is model judgment in ... group-terms.md ... `check-groups.ts` checks only memb[ership]". Hire-intent marking stayed a model call, and the script checks function only.
- **ia-revamp signposts S5**. `forks/signposts.md:13,28`: "Scripts count; the model decides with the brief's numbers as named defaults in one place with source; gates check traceability to saved data." Partial: `forks/read-scope.md:18` still fixes a merge rule by count (3+ shared pages merge, 0-1 keep, 2 the model decides).
- **framework-check-review** (opened 2026-11-11). A removal chart: "Named checks that the record shows blocking valid work, guarding nothing or testing wording only stop refusing" (CHART.md Destination). It produced no new proxy.

## 3. #645 and #647

- **#645**: `dev-build-astro/scripts/check-extracted-entries.js` (finalize/coverage) reports 42 findings on correct ecommerce data: bracketed CTA writing notes, composition-literal headings, `[label](href): description` list items, and prose starting "Word:" read as a URL. It blocks: the finalize count is never zero, so `approved-page-data.js save` never runs. The findings are about writer prose formats, so in part it blocks valid model output. Filed from consumer repo Tamdoma/korvat.
- **#647**: `dev-build-astro/scripts/verify-astro-architecture.js` pre-page-gate fails blocking checks 8, 10, 12, 13, 16, 18 and 19 on a correct build. Examples: allowed `set:html={mdInline(...)}`, intended slices, a basename lookup bug, rejected markdown helpers, and pages that don't exist yet before assembly. It blocks `compute-batch-assignments`. These are mostly static pattern checks on model-written Astro code, with a few plain bugs (lookup key, wrong phase).

## 4. Seats and cost in wireframe-skill-revamp

- **Seats.** `FW/issues/open/serp-wireframing/ISSUE.md` front matter: `a: { harness: claude, model: claude-opus-5-5, effort: high }` and `b: { harness: codex, model: gpt-6.1-sol, effort: high }`. The machine default in `akrogon config` is a = pi devin/swe-2-max and b = codex gpt-6.1-sol. The index wins.
- **Phase moves.** `FW/issues/log.jsonl` has one row: plan.synthesis to implement, 2026-11-17T09:24:48Z. fix_rounds is 0 and no review has run yet.
- **Paid capture cases.** Source: `FW/issues/open/serp-wireframing/wireframe-skill-revamp/implementation/report.md`, "Recorded captures" and "Amendment". 5 of 10 were used before the amendment, all exit 1:
  - Case 1 stopped in the driver's `acceptThin` around the THIN_READ residue.
  - Case 2: `acceptThin` found no match because the session dropped the `prep-evidence ` prefix. "The driver matched model wording" (F3).
  - Case 3: the accepted-residue THIN_READ attempt could not close (`LOG_RESIDUE`). It also found a real product bug (IN10), fixed in-branch.
  - Case 4: the prep close was refused for a missing `phase_entered_at` in the capture consumer state. This is a driver issue, not a quality proxy.
  - Case 5 (national): a vendor HTTP 500 and dummy credentials gave a 401, at $0 spent. Unrelated to proxies.
  - Cases 1 to 3 are tied to the THIN_READ gate and driver. In-branch driver fixes landed after cases 1, 2 and 4.
  - After the amendment: 3 re-recordings needed, 2 spare.

## 5. Records that contradict or narrow L1 to L5 and B1 to B3

- **L1/L2 are not universal.** topic-theme-fit and ia-revamp provider-marking met quality concerns and kept a model judgment (section 2). These are charts where the operator or a signpost named the judgment explicitly.
- **L1 locus.** serp-wireframing's own signposts said the model decides (ia-revamp S5 carried into serp-wireframing), yet the forks produced `thin_min_usable_page1` and the more-than-half rule (`serp-wireframing/forks/evidence.md:37,44`). The proxies came at the fork and final-shape step, after a signpost said otherwise. That supports L1/L2 but places them at forks, not at signposts.
- **B1 working at implement.** `report.md` (IN10 line): A declined a reproduction test for a prose fix because "a prose-wording test would check text, not behavior". The existing rule held at implement for a fix with no criterion attached.
- **L4 cost attribution.** Of the 5 paid cases, 2 (cases 4 and 5) failed for reasons unrelated to quality proxies. Not every failed recording counts as L4.
- **Nothing found that contradicts B3** (the operator as the only sensor). The amendment, #389, agent-latitude and writer-checker-rule-source were all triggered by the operator.
