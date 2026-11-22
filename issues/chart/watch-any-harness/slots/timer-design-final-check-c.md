# Final-shape check: timer-design (slot C)

1. **Item 3 `[C]` contradicts lock `2a` (`forks/signposts.md` `## Taken`):**
   - Evidence: Lock `2a` requires that a tick *never* reaches a terminal after its agent exited or another program replaced it, permitting a stated limit only for in-conversation resets (`/clear`, `/new`); `src/hc.ts` (`follow`) already exposes `hc events --terminal <watcher>` for `finished`/`lost`/`status:null`/`foreground` changes.
   - Consequence: Accepting a draft-held send landing in a bare shell or replacement program — and declining `hc events` abort — violates lock `2a`; the claimed mitigation ("a new agent gets the tick as its first prompt and stops the watch") also fails when the successor is a shell or non-agent program. Abort in-flight sends on `hc events` or get operator approval to relax `2a`.

2. **Item 2 ancestor walk cannot run inside the `hc run --bg` child:**
   - Evidence: `hc run --bg` spawns the child under `herdr-core`'s holder (`hc --skill` § Status, recovery, and cleanup), not as a Linux OS descendant of the watcher's tool shell, so walking `/proc` ancestors inside the background timer never reaches the watcher terminal's root `t.pid`.
   - Consequence: Pinning `{pid, procStart}` fails unless Item 2 explicitly splits a synchronous `start` step inside the watcher's tool shell (which walks its own `/proc` ancestors) from the `hc run --bg` timer loop receiving `{pid, procStart}` as arguments.

3. **Item 8 `[C]` contradicts lock `5a` (`forks/signposts.md` `## Taken`):**
   - Evidence: Lock `5a` limits changes to the `watch-issues` skill folder plus small reuse of `src/` helpers; `src/install.ts` (`planSkillLinks`) links every directory under `skills/` into every listed root.
   - Consequence: Adding `.gemini/config/skills` edits `akrogon install` outside the skill folder and exposes all akrogon skills (not only `watch-issues`) to `agy`; flagging it only at pass-end under autopilot records a contract exceeding `5a` without operator approval.
