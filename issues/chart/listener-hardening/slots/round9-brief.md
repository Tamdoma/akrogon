# Round 9 (door A): review the link-hints implementation

Review commit f9a3c60 on branch feat/link-hints in the herdr-setup worktree /tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/hs (`git show f9a3c60`). It implements round8 with your answers folded in (round8-B.md, round8-C.md).

Changes from the round8 plan, check them: (1) noise and wraps are handled by keeping only paths that exist on this computer (one `sh` loop through `exec`), with each row's matches plus matches running across a row end (row trimmed at its end, next row trimmed at its start) as candidates; (2) a URL is joined across rows only when its row is within 8 columns of the width, and then replaces its first half; (3) remote panes list URLs only; (4) cwd null keeps only absolute and ~ paths; (5) the old per-open existence check is gone since the list only holds existing files.

Already done: `bun test` 154 pass/0 fail; `herdr-app check mods/link-hints` passes; a dry run on door A's real screen found 8 candidates and kept 2, including a path Claude Code wrapped with its indent.

Look for concrete defects only: wrong match or missed link on real screens (try `hc read --json <t>` on live terminals), the popup not getting keys, a crash path, a wrong open command, the `sh` call (quoting, many args), keys.json, README. Read-only: do not press keys in the window or open the overlay. Write `round9-<letter>.md`: verdict ready or changes needed, findings with file:line. Reply with the path.
