# E2E transcript: role-swap C9

Rerun: bash implementation/e2e-script.sh (uses lane CLI at /home/ivan/Work/infra/akrogon/issues/worktrees/role-swap/src/akrogon.ts with a scratch AKROGON_HOME).

```
SCRATCH=/tmp/role-swap-e2e.aoZotS
$ phase demo implement --slot A
moved implement
exit=0
$ phase demo check.review --slot A
moved check.review
exit=0
$ phase demo check.fix --slot A --verdict ready
recorded
exit=0
$ phase demo merge --slot B --verdict fix
moved check.fix
exit=0
$ phase demo check.review --slot B
195 |   )
196 |     throw new Error('Destination contradicts rebuttal config');
197 |   const required: readonly Slot[] = requiredSlots(state.phase, state.fix_rounds);
198 |   const slot: Slot | undefined = explicitSlot ?? (required.length === 1 ? required[0] : undefined);
199 |   if (state.phase !== 'failed' && (slot === undefined || !required.includes(slot)))
200 |     throw new Error('A required --slot is missing or invalid');
                    ^
error: A required --slot is missing or invalid
      at transition (/home/ivan/Work/infra/akrogon/issues/worktrees/role-swap/src/phase.ts:200:15)
      at <anonymous> (/home/ivan/Work/infra/akrogon/issues/worktrees/role-swap/src/phase.ts:283:11)
      at withLock (/home/ivan/Work/infra/akrogon/issues/worktrees/role-swap/src/state.ts:151:18)
      at async phaseCommand (/home/ivan/Work/infra/akrogon/issues/worktrees/role-swap/src/phase.ts:280:9)

Bun v1.4.2 (Linux x64)
exit=1
--- state unchanged by refusal? ---
UNCHANGED
$ phase demo check.review --slot A
moved check.review
exit=0
$ phase demo merge --slot B --verdict ready
moved merge
exit=0
$ phase demo merged --slot B
moved merged
issue complete e2e
exit=0
--- closed? ---
/tmp/role-swap-e2e.aoZotS/repo/issues/closed/e2e/demo/state.yaml
--- log ---
{"ts":"2026-09-29T20:50:00.047Z","repo":"e2e","slug":"demo","from":"plan.synthesis","to":"implement","slot":"A","attempts":{"A":0,"B":0},"fix_rounds":0,"verdict":{},"head":"6b369a8a0c599329b2bece87da9da969ad8dc950","diff":"","session":null}
{"ts":"2026-09-29T20:50:00.092Z","repo":"e2e","slug":"demo","from":"implement","to":"check.review","slot":"A","attempts":{"A":0,"B":0},"fix_rounds":0,"verdict":{},"head":"6b369a8a0c599329b2bece87da9da969ad8dc950","diff":"","session":null}
{"ts":"2026-09-29T20:50:00.170Z","repo":"e2e","slug":"demo","from":"check.review","to":"check.fix","slot":"B","attempts":{"A":0,"B":0},"fix_rounds":1,"verdict":{"A":"ready","B":"fix"},"head":"6b369a8a0c599329b2bece87da9da969ad8dc950","diff":"","session":null}
{"ts":"2026-09-29T20:50:00.252Z","repo":"e2e","slug":"demo","from":"check.fix","to":"check.review","slot":"A","attempts":{"A":0,"B":0},"fix_rounds":1,"verdict":{},"head":"6b369a8a0c599329b2bece87da9da969ad8dc950","diff":"","session":null}
{"ts":"2026-09-29T20:50:00.296Z","repo":"e2e","slug":"demo","from":"check.review","to":"merge","slot":"B","attempts":{"A":0,"B":0},"fix_rounds":1,"verdict":{"B":"ready"},"head":"6b369a8a0c599329b2bece87da9da969ad8dc950","diff":"","session":null}
{"ts":"2026-09-29T20:50:00.341Z","repo":"e2e","slug":"demo","from":"merge","to":"merged","slot":"B","attempts":{"A":0,"B":0},"fix_rounds":1,"verdict":{},"head":"6b369a8a0c599329b2bece87da9da969ad8dc950","diff":"","session":null}
```
