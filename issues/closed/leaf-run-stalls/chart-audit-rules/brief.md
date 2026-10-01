# Brief: chart-audit-rules

## What
Two rules in the chart-issues handoff contract (`skills/chart-issues/assets/shapes.md`):
1. A done-criterion may cite only a command in the destination's blocking `checks` or a test or run the leaf itself adds (its own tests, end-to-end evidence, real outside calls and live runs that standing-design.md allows). A leaf needing a larger repo-wide command gets that command added to `checks` first, after a prerequisite makes it pass. The audit refuses a criterion citing a repo-wide command outside `checks` (C D4).
2. For every `blocked-by` entry, the door writes into the dependent's brief (What or Why) the output it consumes, as an audit duty with no new template field (C D6). When that output is a part the producer could merge with its own proof, the door proposes that part as a prerequisite leaf. No count or size trigger, and no recorded reason for a kept bundle.

## Why
Tamdoma/akrogon#47: framework leaf emdash-conversion cited `bun run framework:verify` (brief.md:26), which is not in framework's blocking `checks`. Sibling leaves merged red into main, the leaf could never meet its criterion, and it cost review and fix rounds overnight. The same criterion recurs in emdash-kit, emdash-content-fixes and emdash-launch, and framework LESSONS.md:38 (2026-09-13) records the class.
Tamdoma/akrogon#45: charting never looks from the dependent's side at what it consumes, so a producer's separately mergeable part is never proposed as its own leaf.

## Done-criteria
1. The implementer-audit paragraph (`shapes.md:170`) states rule 1 with the prerequisite route and the audit refusal. The template placeholder (`shapes.md:132`) names only the two allowed proof kinds (C D5).
2. The implementer-audit paragraph (`shapes.md:170`) states rule 2, keyed on `blocked-by` and the consumed output, with no count, size or duration trigger.
3. The spine paragraph (`shapes.md:172`) and `skills/chart-issues/SKILL.md:41` are unchanged.
4. Every configured blocking `checks` command passes, including the resolved changed-tests command. (B,C)
