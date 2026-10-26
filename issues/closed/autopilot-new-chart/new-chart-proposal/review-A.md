# Review A: new-chart-proposal

Base: a58b90f (origin/main at review). Reviewed head: 16c28b2e. Diff: `git --no-pager diff "$AKROGON_BASE"...HEAD` — three files, +6/−2, exactly the brief's named files.

## Verification evidence

- `check docs-links: 0` (implementation/check-docs-links-1793034618951-3141963.log) — 8 pass; covers links/anchors under `docs/`; the autopilot.md edit adds no link, still green.
- `check diff-scope: 0` (implementation/check-diff-scope-1793034621274-3142306.log) — output listed only `docs/use/autopilot.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md` (criterion 7).
- `akrogon verify` receipt `verify leaf 16c28b2eeb3f42cc0d3742bd8606bf835ee848be: green` — format, test (1212 pass), typecheck on fresh checkout.
- First docs-links run red on missing `zod`; fixed by configured `setup`, not a diff cause — consistent with the retry/judgment rule, recorded in report.

## Criterion check (prose read against the diff)

1. SKILL.md new paragraph states all three trigger conditions, "judged with the research the chart already did", the recorded-only/prerequisite-leaf/map-split guardrails, the existing-chart branch (no proposal, `wait:` names it, resumes on written leaves with yes-path ordering, taken next when handed and runnable else move on) and the handed-list precedence clause. Criterion met.
2. Wait list gains the proposal as "an operator approval that is not a grant" — the existing "approval, need or prerequisite" trio (Drain, spans, Handover, mode persistence) then covers it with no new wait kind, matching the locked decision. Paragraph carries park-on-statable, findings recorded, no further fork, nothing created before yes, Destination frozen while waiting, consultant agreement never answers. Met.
3. Fixed question verbatim: `chart <X> on its own (yes) or bring it into <waiting chart> (no)?`. Yes path: `changed list` entry, same-run charting, resume after leaves, `blocked-by` when same repo. No path: resume, scope as forks/prerequisite leaves, Destination rewrite, verbatim no recorded. Other words stay valid. Met.
4. Cross-repo sentence compares against the dependent leaf's destination repo (the cross-repo.md correction), uses one `wait:` line naming every `<repo>/<leaf>` with the `issues/closed/` landed check, resumes on the operator's next message, no cross-repo `blocked-by`, no timer. Met.
5. shapes.md `- proposal:` line holds all five fields, one line per proposed destination, beside `wait:` and still a `- ` item (cannot parse as a marker; `src/status.ts lastStage` invariant holds). Met.
6. autopilot.md bullet names a needed new chart in plain words with the yes and no effects; "Read the record" names new-chart proposals. Met.
7. Diff scope proven green above.

Decisions vs plan: D1-D12 all reflected; no locked decision weakened. The wait-list sentence and new paragraph sit where D2 placed them; each fact stated once (the fixed question lives in SKILL.md and the guide bullet quotes it for the operator — the guide is the human-facing projection, acceptable, and criterion 6 requires the bullet show the yes/no effects which the quote supplies).

Doc sweep: no `AREA.md` changed; grep confirmed no other `docs/` or skill page states the chart wait list, so no stale-copy defect. `tests/chart-shapes.test.ts` parses only the readiness.yaml example — unaffected.

## Findings

Fixes: none.

Nits: none.

## Verdict

ready
