# Final-shape check brief, slot B (fork 1, carrier)

Context: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/08f9bda6-5ef1-4d07-8526-5480cbe29dd6/scratchpad/door/map-merged.md and your rebuttal /tmp/claude-1000/-home-ivan-Work-infra-akrogon/08f9bda6-5ef1-4d07-8526-5480cbe29dd6/scratchpad/door/map-rebuttal-B.md.

Operator rejected 1a (seed-issue reminder per waiting step), verbatim: "I don't understand this, can you explain it? Is this adding complexity? I like to keep my issues clean, and only actual issues"

Operator then chose 1d, verbatim: "1d". Option 1d as presented:
- Config check entries name a repo-owned script (e.g. `test_changed: bun run test:changed`), not an inline command. Leaves may edit code, so a leaf that builds a better check changes the script and it is live when it merges. No config edit is needed later, so nothing is left to remember.
- Framework needs one config edit now to point test_changed at the existing `test:changed` script (fork 2).
- init-akrogon gets one text rule: propose checks as script names, not inline commands.
- Other config edits (env, etc.) can almost always be done by the door during the chart pass, so they do not wait.

Task: one focused check of this final shape before A records it. Return only concrete problems with evidence (path:line), or "no objection". Consider: does it conflict with akrogon's own inline checks (issues/config.yaml run-check/flock wrappers, init-akrogon SKILL.md:47-55 conservative example, any generated run-check wrapping), repos without a script runner, the issues/ lock, and whether the chart-issues "Off route" text still needs a rule for a needed config edit that truly must wait. Keep it short.

Return path: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/08f9bda6-5ef1-4d07-8526-5480cbe29dd6/scratchpad/door/carrier-final-check-B.md
