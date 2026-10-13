# Restore

## Question
Q1. herdr resume starts a saved seat in a fresh shell before akrogon can adopt it. Should akrogon leaf panes be excluded from herdr resume, with akrogon redispatching after a herdr restart, or should akrogon adopt the restored tree after the fact?

### Carries
- Depends on seat-scope.
- Source: slots/seat-scope-B.md E7, slots/seat-scope-rebuttal-C.md. herdr/src/app/agent_resume.rs:219-246,264-281.

## Findings
Round 2026-10-13, notes slots/restore-{A,B,C}.md, merge slots/restore-merged.md, rebuttals slots/restore-rebuttal-{B,C}.md.
- A cold-restored herdr shell loses akrogon's placement env (bus cut, TMPDIR, AKROGON_BASE): herdr/src/app/agent_resume.rs:230, herdr/src/persist/restore.rs:518-528, snapshot stores no env (snapshot.rs:85-110). Boxing it later cannot fix that. Resume also drops akrogon's harness flags (herdr/src/agent_resume.rs:129-147).
- Settled among seats: no adoption of restored shells. The allocate ensure step closes a recorded leaf pane whose shell is positively outside its own akrogon scope, per pane, and the existing repair split or new-tab path recreates it before any start or prompt, including busy-seat paths (src/next.ts:604-612). An unreadable check skips the pass, never closes (A,C, B accepts if resume is off).
- Detection is one signal, the scope. C dropped its environ check: a shell inside its own scope was created by akrogon with the env. B holds that both scope and bus cut should be checked.
- Live handoff (imported runtimes, herdr/src/persist/restore.rs:529-535) keeps process, scope and env and only passes the check.
- herdr 0.9.1 has one global switch, `session.resume_agents_on_restore`, default true (herdr/src/config/model.rs:243-256). No per-tab opt-out exists. B's per-tab herdr prerequisite was withdrawn as the costliest option, conditional on the global switch.
- Open for operator: turn resume off globally (A,B) or leave it on (C). If left on, a resumed leaf seat sits unboxed with the bus reachable until the first akrogon pass, which `--resume` runs at plugin startup (plugin/herdr-plugin.toml:10-11).
- Cost either way: seat conversation is not auto-resumed after a cold restart, dispatch reprompts from artifacts.

## Taken
1b, operator 2026-10-13, replacing an earlier 1a the same day. Reason: the operator still needs their own agent tabs to auto-resume after a herdr restart. "Maybe 1b first" leaves 1c (herdr per-tab opt-out) as a possible later chart, not part of this one.
- herdr `resume_agents_on_restore` stays at its default, true. No herdr config change.
- The allocate ensure step closes a recorded leaf pane whose shell is positively outside its own akrogon scope, per pane, and the existing repair split or new-tab path recreates it before any start or prompt, busy-seat paths included. An unreadable check skips the pass and never closes.
- Detection is the scope alone (A,C). B's dissent that the bus cut should also be checked is carried to the leaf design.
- Live handoff runtimes pass the check unchanged.
- Accepted residual: between a cold restore and the first akrogon pass (`--resume` at plugin startup, plugin/herdr-plugin.toml:10-11), a resumed leaf seat sits unboxed with the bus reachable. The operator does not type into reopened leaf tabs before akrogon replaces them.
- Foreclosed in this chart: 1a (resume off), adopting restored shells. 1c goes to Off route.
- Proof done 2026-10-13 (proofs.md T3): after a cold restart herdr resumed the seat with the same pane id, outside its scope and without the bus cut, and the seat ran nothing before a prompt. Replacement by the startup akrogon pass is an L2 done criterion. The check must match the pane's own scope name, not any path under akrogon.slice.
