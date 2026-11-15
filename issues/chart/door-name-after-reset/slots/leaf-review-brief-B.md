# Brief: leaf review, slot B

You are slot B. Review these draft leaf files as the implementer who will receive them, and return only disagreements with evidence (a criterion that cannot be met within ownership, a missing or wrong interface, a binding decision without a home, a claim the code contradicts), or "no disagreement". Under 40 lines. Start no agents, type no keys, change no file except your return file.

Drafts:
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/60966401-82eb-4ba7-b48c-aafd6669305a/scratchpad/leaf/ISSUE.md
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/60966401-82eb-4ba7-b48c-aafd6669305a/scratchpad/leaf/brief.md
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/60966401-82eb-4ba7-b48c-aafd6669305a/scratchpad/leaf/design.md
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/60966401-82eb-4ba7-b48c-aafd6669305a/scratchpad/leaf/readiness.yaml

Decisions they must carry: /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/forks/name-restore.md (section Taken) and /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/forks/signposts.md (section Taken). Code: /home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/door-reset.ts, src/hc.ts, src/transcript.ts, tests/door-reset.test.ts, tests/door-agent.ts, tests/hc-fixture.ts. Shape rules: /home/ivan/.claude/skills/chart-issues/assets/shapes.md sections "Leaf files" and "Preflight and validation"; /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Reading rule: read process text (skill files) by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work. Name sections, never line ranges.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/slots/leaf-review-B.md, then run:

hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/slots/leaf-review-B.md"
