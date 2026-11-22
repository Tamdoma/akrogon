# Leaf review: watch-any-harness (slot C)

1. **`watch-timer/brief.md` § Done-criteria #2 contradicts `watch-timer/design.md` § Binding decisions item 6:**
   - Evidence: `design.md` item 6 locks that `start` claims the timer name *before* its immediate check and, when one verified timer is already live, *"start reports it and starts nothing"*. `brief.md` #2 instead requires *"A second start while a verified timer is live runs its check, reports that timer and starts none."*
   - Consequence: Implementer cannot satisfy both; running a check on a duplicate start reintroduces double-acting on leaves. Rewrite #2 so a duplicate start runs no check and reports the live timer.

2. **`watch-timer/brief.md` § Done-criteria omits two use cases of today's Claude watch (lock 6a "no regressions"):**
   - Evidence: `skills/watch-issues/SKILL.md` § Invocations specifies (a) *"A paused check still runs the CronList and creation step: creation is not an act on a leaf"* (start while paused still arms the timer), and (b) *"A compaction summary before the tick means the conversation was not cleared"* (compaction must not trigger first-prompt stop); § Never also forbids creating a watch from a tick. None is required by #1–#11 (#8 covers only a paused tick; #7 covers `/clear`/`/new` without compaction; #6 omits "starts no timer").
   - Consequence: Paused-start and post-compaction behavior can regress without failing any criterion. Add paused-start to #8/#11, compaction-not-cleared to #7/#10, and "starts no timer" to #6.

3. **`watch-timer/design.md` § Leaf architecture ("Reused helpers, preconditions checked") states wrong preconditions for `src/hc.ts` `run` and `terminals`:**
   - Evidence: In `src/hc.ts`, `run` never passes `--rm` and only passes `--no-notify` when `parent.outlive` is `true` (which adds `--outlive-parent`, breaking parent-exit cleanup), whereas item 2 requires `hc run --bg --no-notify --rm` without `--outlive-parent`; `terminals`/`terminal` parse with `terminalSchema`, which strips top-level `argv` and exposes only `foreground.argv`, whereas item 6 requires the terminal's own top-level `argv`.
   - Consequence: Violates `shapes.md` § Leaf files ("existing code is called reusable only when its preconditions were checked against the changed state"); implementer must call `hc` directly / parse raw JSON or mark `src/hc.ts` extensions as `Open for the plan:`.

4. **`agy-skill-link/design.md` § Leaf architecture names the wrong consumer file and misses an existing doc:**
   - Evidence: `src/self-update.ts` (not `src/release.ts`) imports and calls `planSkillLinks`; `docs/start/install.md` already lists the four skill roots (`~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills`).
   - Consequence: Naming `src/release.ts` misdirects the implementer, and leaving `docs/start/install.md` out of owned surfaces risks stale install documentation.

5. **`watch-timer/readiness.yaml` § `proofs` does not reach pre-existing key parts required by `watch-timer/brief.md` #1, #7, #11 (`shapes.md` § Preflight and validation):**
   - Evidence: P10 puts *"foreground of a harness's own tool children not observed"* in `limits` and P4 puts *"harness process identification inside the tool shell not observed"* in `limits`, yet #1/#7 depend on both (design item 3 exits if `foreground.pid` is not a descendant of the pinned harness); P6 observed `codex /new` *losing* a tick sent 3 s later and never observed a post-`/new` tick reaching `codex` or `pi`, yet #7/#11 require first-prompt stop on both.
   - Consequence: Under `shapes.md` § Preflight and validation, the audit refuses criteria whose pre-existing key parts rest only on proof `limits` or an unobserved/failed path; prove or bound these behaviors before handoff.
