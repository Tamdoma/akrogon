# Correction for the watch-timer plan seat (chart door A, 2026-11-20, operator: "do it and fix")

Commit 777aa3b0 repoints the operator's real `~/.gemini/config/skills/watch-issues` link at the leaf during agy cells. That breaks the leaf contract:

- brief.md criterion 13: "no change to operator-home skill links or other home files beyond the harness trust and session records the grant names"; agy loads the leaf copy "through the tier root's `.agents/skills/watch-issues`".
- design.md Corrections, Writes: "No ... operator-home skill link ... A needed home change is the operator-blocker stop."
- readiness.yaml grants[1] effects: "no skill link or other home file changed".

The commit's premise, "agy reads user skills at ~/.gemini/config/skills, never .agents/skills", contradicts Probe P1 (issues/chart/watch-live-speed/forks/disposition.md, readiness.yaml proofs): with `<cwd>/.agents/skills/herdr` present, agy `/skills` listed the workspace copy and omitted the `~/.gemini/config/skills` copy.

Do:
1. Revert 777aa3b0's link handling (a new commit with its `Test-Change:` trailer citing this note) and load the leaf copy for agy through `<tier root>/.agents/skills/watch-issues`.
2. If agy in the tier does not list that copy, prove it with one free no-prompt `/skills` read in the tier root (record the screen), then take the operator-blocker stop. Do not change any home file.

The door restored the link to `/home/ivan/.akrogon/current/skills/watch-issues` at the time of this note.
