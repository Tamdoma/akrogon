# Brief: leaf review, chart proof-limits-handoff, slot B

Review the draft leaf as the implementer who will build it: /home/ivan/Work/infra/akrogon/issues/chart/proof-limits-handoff/slots/handoff/akrogon/proof-coverage/ISSUE.md and /home/ivan/Work/infra/akrogon/issues/chart/proof-limits-handoff/slots/handoff/akrogon/proof-coverage/coverage-audit/{brief.md,design.md,readiness.yaml,state.yaml}. Check: each done-criterion can be met inside the owned surfaces; every binding decision in forks/proof-coverage.md "Taken" (including "Final-shape check, adopted") has a home in the brief or an explicit exclusion; nothing forces a guess; criteria are observable and name no test file or count. Return disagreements only, with evidence (path and section), or one line saying none.

Reading rule: read process text by named section, bounded output, content you already hold at most once; sections you have not read, changed content and content lost to compaction stay readable; name sections, never line ranges.

Do not edit any file except the return file.

Return: write /home/ivan/Work/infra/akrogon/issues/chart/proof-limits-handoff/slots/leaf-review-B.md, then run:

hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/proof-limits-handoff/slots/leaf-review-B.md"
