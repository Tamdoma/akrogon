# Signposts: fresh-worktree-setup

Verbatim copy; the original lives in issues/chart/seat-turn-idle/forks/signposts.md.


Original for the door session opened 2026-11-24T22:57:50Z (handed list: Tamdoma/akrogon#153, #154, #155, #156, #157). Copies live in fresh-leaf-base, run-check-display, merge-test-facts and direct-visible.

## Question

1. Where should each fix live?
   - 1a (recommended) In the mechanism that fails, so the failure class cannot happen again (run-check passes what a headed browser needs, a reused leaf worktree starts from the tracking ref, delivery reads the turn's end).
   - 1b Beside it: a config entry, a doc line or a guard that warns.
   - Steers: every chart's design pick; the lesson lines for #155 and #156 retire only under 1a.
2. How should each fix be proven?
   - 2a (recommended) Free tests at the real boundary (temp git repos, the real CLI, a fake or real local hc) plus charting probes; a paid model launch only where no free test reaches the behavior.
   - 2b Live seat runs as the main proof.
   - Steers: every done-criterion, run time and cost.
3. What records may a fix add?
   - 3a (recommended) Extend existing records (verify-runs rows, attempt rows, leaf records, status rows) with the smallest field; no new record kinds.
   - 3b A dedicated new record per need.
   - Steers: #154 (timeouts, durations, attempt join), #153 (how direct work is tracked).
4. How many leaves per chart?
   - 4a (recommended) One leaf per chart unless a part is independently checkable and useful alone.
   - 4b Split by sub-mechanism.
   - Steers: every handoff tree and dispatch load.
5. In what order are the charts taken?
   - 5a (recommended) seat-turn-idle (#157), fresh-leaf-base (#156), run-check-display (#155), merge-test-facts (#154), direct-visible (#153): unattended stalls first, broadest change last.
   - 5b Seed number order (#153 first).
   - Steers: which work reaches dispatch first.
6. Must old records keep reading after a change?
   - 6a (recommended) Yes: existing state, rows and charts keep parsing with no migration script.
   - 6b A one-time migration is allowed.
   - Steers: #153, #154, #156 schema changes.

## Taken

A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

## Needs

- N1 pending: the operator commits the uncommitted lesson writes in the akrogon checkout (`learnings/LESSONS.md` line "leaf worktree kept at a stale base" and the untracked `learnings/history/2026-11-24-leaf-worktree-stale-base.md`, plus the modified `learnings/history/2026-11-24-run-check-drops-display.md`). Purpose: the fresh-leaf-base leaf must remove that lesson line in its own diff (lesson rule Retire), which needs the line on main. Consumer: fresh-leaf-base leaf handoff only. Source: lesson rule Home clause ("the write is left for the operator to commit"), checked 2026-11-24. Destination: akrogon main. Done: `git log origin/main --oneline -- learnings/history/2026-11-24-leaf-worktree-stale-base.md` prints a commit.
- 2026-11-25 correction to N1 (A, run-check-display chart): a second consumer, the run-check-display leaf `caller-display` handoff. That leaf appends an `Applied` line to `learnings/history/2026-11-24-run-check-drops-display.md`, whose uncommitted case 2 in the akrogon checkout would conflict with it when the main checkout's sync runs `git rebase --autostash` (`src/sync.ts`). Status unchanged: pending. Done for this consumer: `git status --short learnings/history/2026-11-24-run-check-drops-display.md` prints nothing and the case-2 section is on origin/main.
- N1 supplied 2026-11-25T07:07:36Z: operator "done" in door t126 after committing the lesson files; verified `git log origin/main --oneline -- learnings/history/2026-11-24-leaf-worktree-stale-base.md` prints 99552b73 and `git status --short learnings/history/2026-11-24-run-check-drops-display.md` prints nothing.
