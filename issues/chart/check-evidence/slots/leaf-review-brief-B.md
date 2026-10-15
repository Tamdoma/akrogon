# Leaf draft review, slot B

You are slot B in the check-evidence chart (akrogon repo, /home/ivan/Work/infra/akrogon, origin/main f3557d8). The operator approved the handoff: one issue `check-evidence` with four leaves, debate no. A drafted every leaf. Review each draft as the implementer who will build it.

Drafts (read all of them):
- /home/ivan/.claude/jobs/6a0d8d81/tmp/drafts/ISSUE.md
- /home/ivan/.claude/jobs/6a0d8d81/tmp/drafts/{log-reader,close-pack,folder-pack,check-path-print}/{brief.md,design.md,readiness.yaml,state.yaml}

Binding decisions live in the chart forks: /home/ivan/Work/infra/akrogon/issues/chart/check-evidence/forks/{evidence-location,log-coverage,existing-backlog}.md (Taken sections). Rules for leaf contracts: /home/ivan/.claude/skills/chart-issues/assets/shapes.md (sections "Leaf files" and "Preflight and validation") and /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Check, with file:line evidence from the akrogon source:
1. Each done-criterion can be met inside the leaf's ownership and its blocked-by, is observable, and names no test file, assertion or test count.
2. Every binding decision item has a home leaf or an explicit exclusion; nothing decided is changed or dropped.
3. Cross-leaf promises (log-reader's locate/readMember used by close-pack; close-pack's shared pack used by folder-pack) match on both sides.
4. Each named consumer and "Open for the plan" item is real; flag any consumer of a changed state that the drafts miss, and any existing code called reusable whose preconditions do not hold.
5. No leaf touches a path under issues/.

Write only disagreements and gaps, each with evidence and the exact fix you propose, to:
/home/ivan/Work/infra/akrogon/issues/chart/check-evidence/slots/leaf-review-B.md
Write "no disagreements" if you have none. Do not edit the drafts or any other file.
