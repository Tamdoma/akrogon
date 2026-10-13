# Leaf draft review (slots B and C)

Drafts: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cf0be9e3-21db-4a2f-9248-8cab8e0d5f5b/scratchpad/door/drafts/akrogon/leaf-speed/ (timing-events, timing-readout, serial-plan-solo) and /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cf0be9e3-21db-4a2f-9248-8cab8e0d5f5b/scratchpad/door/drafts/framework/leaf-speed/ (test-changed-shared-files, flaky-test-fixes). Each leaf has brief.md, design.md, readiness.yaml, state.yaml.
Charts: /home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/ and /home/ivan/Work/infra/tamdoma/framework/issues/chart/leaf-speed/ (forks hold operator answers; latest: `1a | 2a | 3a`, then `4a |` for flaky-tests).
Rules: /home/ivan/.claude/skills/chart-issues/assets/shapes.md (Leaf files, Preflight and validation audit) and /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Task: review each draft as the implementer who must deliver it. Return disagreements only, per leaf, with evidence (path:line, command, number): a criterion that cannot be met in the leaf's ownership, a wrong hook point or file, a missing binding decision, a criterion naming a test file, assertion or test count, a merge_checks citation, an untestable or vague criterion, a missing prerequisite, a split that should differ. Slot B also: any disagreement with recording flaky-tests 4a as written in its fork. Read-only on all repos and drafts. Under 700 words.

Write to exactly /home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/slots/leaf-review-X.md with your slot letter for X.
