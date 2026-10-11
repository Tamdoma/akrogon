# Review A: locked-setting-proof

Base: `c53f6196533289555518577f08907ec9c713721c`
Reviewed head: `9bb3879ad111b49e43e1d51c44067258df7c05f3` (one commit)
Debate: `no` — no positions or rebuttals, expected.

## Findings

None.

## Judgment

- Criterion 1 (rule in the Take operation-proof paragraph): met. The diff adds the sentence planned in D2 verbatim between "…run with the real identity and target." and "Declining a required probe holds the handoff" in `SKILL.md:57`. All three rule elements present: same key/location/value, observed property the decision relies on, different form does not count. One sentence, joined with "and" per D2's recorded resolution of the brief's two-sentence wording against the design's one-sentence cap.
- Criterion 2 (meaning sweep): independently re-run `grep -rniE "prove|proof|probe|counts for|counts only" skills/chart-issues/` and judged every hit. `questions.md:29` and `shapes.md:284` bind operation proofs to the Take rule itself, so the locked-form clause now applies to them. `shapes.md:168` and `:286` list done-criterion proof forms, not operation proofs of locked settings. `SKILL.md:63`/`65` cover fixture and save-operation proofs, not the decision-locked setting's proof form. The dry-run clause at `:57` counts a call only for the property the provider documents, which does not license a different form for a locked setting. No in-scope contradiction; the report's out-of-scope list matches my sweep.
- Design exclusions: no new section, no new proof-record field, no live run, no outside call; only `SKILL.md` changed (verified by `git diff c53f619..HEAD --stat`).
- Report: `implementation/report.md` records changed files/reasons, the quoted sentence, the sweep disposition, all `checks` commands with results and wall times, base and head. `merge_checks` is empty and correctly not run.
- Docs: plan D6 names `docs/guide/chart.md` as containing no operation-proof restatement; verified by grep. No `AREA.md` in the diff; no documented behavior beyond the sentence itself changed.
- Planned tests: none were planned (design locks proof-by-report); `bun test --changed` correctly resolves to zero affected test files. No `Test-Change:` trailer needed — no `src/test-files.ts`-matched path changed.
- Checks: report shows format clean, `bun test` 792 pass / 0 fail, `tsc --noEmit` clean. Doc-only diff; no rerun needed.

## Verdict

`ready`
