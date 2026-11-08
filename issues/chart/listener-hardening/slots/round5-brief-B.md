# Round 5 (B only): review the tab-order fix in herdr-setup

Operator: new leaf tabs must open at the end of the tab line, not in between; changes live in herdr-setup; B reviews.
Your earlier review of the panel-bar draft (scratchpad review-B.md) found: (1) the board layout uses the shipped `tabs` mod, so no policy ran there; (2) per-view `seen` sets could reorder tabs. The draft is dropped.

New version: worktree `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/hs`, branch `fix/tabs-at-end`, one commit on origin/main: `git -C <worktree> show HEAD`.
- The rule moved to `mods/session-status` (in both `layouts/flat.json:162` and `layouts/board.json:116`).
- Known tab ids live in `shared("herdr-setup.tabs.seen")`, which herdr.d.ts documents as persisted ("Reads a value every mod can see (persisted)"); one window per session app home, so one list per session. Set only when the id set changes, to avoid a render loop.
- Pure rule in `mods/session-status/tabs.js` with 8 tests; herdr-setup suite 143 pass, 1 skip; `herdr-app check mods/session-status` passes.

Write `issues/chart/listener-hardening/slots/round5-B.md` in /home/ivan/Work/infra/akrogon: concrete defects only, path:line, then `Verdict: ready` or `Verdict: changes needed`. Reply with the path.
