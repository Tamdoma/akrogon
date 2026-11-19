# Leaf review brief, slot B

You are slot B. Review the drafted leaf as the implementer who must build it. Drafts (a copy of A's scratchpad): /home/ivan/Work/infra/akrogon/issues/chart/model-judgment/slots/leaf-drafts/ (ISSUE.md, model-choice-rule/brief.md, design.md, readiness.yaml, state.yaml). Check them against the live rule files they edit and the chart's forks under /home/ivan/Work/infra/akrogon/issues/chart/model-judgment/forks/.

Reading rule (binds every consultant): read process text by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text you were pointed to. In this chart the rule files listed in the intake's Location are the subject of the work, so reading them in full is allowed.

Return disagreements only, each with evidence (file and section) and the exact fix: a criterion you could not fulfil within ownership, a binding decision with no home, a site the design misses, a done-criterion that is itself a proxy or a repo-health claim, a consumer the change breaks (for example tests/run-units.test.ts literals), or anything under the current plan-issue/check-issue text that would make this leaf fail its own lifecycle. Say "no disagreement" when none. Under 40 lines.

Write to /home/ivan/Work/infra/akrogon/issues/chart/model-judgment/slots/leaf-review-B.md, then run:
hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/model-judgment/slots/leaf-review-B.md"
