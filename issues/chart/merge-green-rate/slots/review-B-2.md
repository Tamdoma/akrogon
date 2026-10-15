# Direct review B: repair round 1

Base: `fb236ec070366b16ccae5f45ac3857615a0574aa`
Reviewed head: `dba0c5c4890fc480a194e5cd43a1554b1e2abe10`
Verdict: **ready**

Reviewed only the repair diff and direct/report.md's Repair round 1 entry against review-B-1.md. The repair changes one documentation sentence and adds the requested commit trailers. No runtime code or tests changed.

- **F1 resolved.** dba0c5c has both exact-path Test-Change trailers in its final trailer block. The command-reference trailer cites the approved flaky argument contract. The receipt-gates trailer cites the planned check.repair → merge case and states existing expectations are unchanged. Both match the previously reviewed changes.
- **N1 resolved.** docs/guide/files.md:98 now describes observed inconsistency and explicitly leaves test/code/external-input causality unresolved. It presents lines as intake candidates, consistent with the sensor and operator-confirmation rule.

No new Fixes or remaining Nits.

Verification: ran the real direct-guards command through `akrogon run-check --holder <chart>/direct --name review-B2-direct-guards`. It passed clean-tree, issue-file, citation and nonempty-branch checks, then correctly refused the missing green merge receipt for dba0c5c. Run `93291d3b-0d9b-4b0b-b822-93b983ef26a5`, exit 1; runner log is in direct/. This confirms F1 is repaired. The receipt is the chart door's final landing verification step after review, not a new repair defect. Before push, A still runs `akrogon verify --holder <chart>/direct` and direct guards on the exact landing head.

Earlier green test evidence remains applicable because no runtime/test/helper inputs changed. No suite rerun was needed for this wording/trailer repair. Reviewed HEAD and clean worktree confirmed. No code edits, commits, pushes or phase moves. Only this review artifact and runner-generated evidence were written.
