# Merged notes: restore (A, B, C)

## Agreed
- A cold-restored herdr shell cannot be fixed in place. Restore and resume build the shell env with an empty extra list (herdr/src/app/agent_resume.rs:230, herdr/src/persist/restore.rs:518-528, herdr/src/app/api.rs:538), and the snapshot stores no placement env (herdr/src/persist/snapshot.rs:85-110). So the bus cut, TMPDIR and AKROGON_BASE are lost, and boxing it later leaves Chrome escaping (A,B,C).
- Adopting restored trees is rejected. It is the live migration seat-scope foreclosed (A,B,C). Resume also drops akrogon's harness flags: bare `pi --session` / `codex resume` (herdr/src/agent_resume.rs:129-147) (C).
- Recovery goes through the normal allocate path: fresh panes with placement env, boxed before any agent starts (A,B,C).
- The live handoff path (imported runtimes, herdr/src/persist/restore.rs:529-535) keeps the same process, scope and env. It needs validation only, not recreation (B,C).
- herdr 0.9.1 has only one global switch, `session.resume_agents_on_restore`, default true, and no per-tab or per-pane opt-out (herdr/src/config/model.rs:243-256, restore.rs:783-789) (A,B,C).
- Cost: the seat's conversation context is lost on each cold restart. Phase, worktree and artifacts remain, and dispatch reprompts from artifacts (A,B,C).
- `--resume` already runs at plugin startup (plugin/herdr-plugin.toml:10-11, src/next.ts:1552-1568) (B).

## Disagreements
1. Mechanism.
   - A,C: akrogon's allocate ensure step closes a recorded leaf pane whose shell akrogon did not box, and the existing repair split or new-tab path recreates it. Per-pane close (C). No herdr change.
   - B: a herdr prerequisite adds a per-tab cold-restore opt-out, set at tab creation, so herdr never starts a shell or resume in a leaf tab. akrogon `--resume` then recreates the tab, and recreates the repo workspace when herdr dropped it for having no tabs (herdr/src/persist/restore.rs:401-403, src/next.ts:450-452). Closing after launch is too late as a boundary.
2. Window between restore and the first akrogon pass. A resumed seat is live, unboxed, with the bus reachable.
   - A: the operator sets `resume_agents_on_restore = false`, so the window holds only an idle bare shell. The operator's own agents also stop auto-resuming.
   - C: leave it on. A resumed seat idles until prompted (model-knowledge, to be proven). The global toggle is an optional operator preference, and akrogon must work either way.
   - B: the global toggle is unscoped and still needs recreation, so it is rejected.
3. Detection. A: any recorded pane shell not in its own akrogon scope is lost. C: close only when both the cgroup is foreign and the bus cut is missing from /proc/<pid>/environ. An uncertain read means skip this pass, never close.

## New questions
- QR1 Native conversation continuity: is restarting the seat from artifacts acceptable (B)? All seats assume yes.
- QR2 How often is herdr restart cold vs handoff (C)?
- QR3 Record why a pane was closed where the operator looks (C).
