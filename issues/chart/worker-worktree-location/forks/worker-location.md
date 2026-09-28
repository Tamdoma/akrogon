# Worker worktree location

## Question

### Q1 · Where does an implement worker worktree live: at the registered root's `<worktree_root>/<slug>-u<N>` beside its leaf, or nested at `<lane>/<worktree_root>/<slug>-u<N>` (current protocol)?
### Q2 · Is a corrected skill rule enough, or does akrogon get a CLI that allocates worker worktrees?
Reshaped 2026-09-28: what soft deterministic push, short of an allocator command, makes a seat use the Q1-A path?
### Q3 · A worker retained at the old nested path when the rule changes: finish it where it is, or relocate it first?

### Carries
- skills/implement-issue/worker-protocol.md:11, current rule and its reason.
- Lock: stuck-seat-recovery restart-hung-seat Taken: no confirm dialog in any session, watch-issues Never list unchanged, no clocks, polls or watchdogs.

## Findings
- 2026-09-28 map (A,B): `../slots/map-merged.md`, rebuttal `../slots/map-rebuttal-B.md`. Accepted rebuttal: the rule explicitly favors nesting ("inside pi's parent root"); create-peer-panes deviated after reading it (T1:48, listed the registered store T1:49-50, created the sibling T1:53) with no recorded reason. Ignore coverage of the store comes from init (src/init.ts:51-60), not from placement.
- The confirm that made nesting necessary is gone: pi-extensions seat-subagent-freezes merged (same-repo admission, no dialog).
- Operator 2026-09-28 verbatim: "1a | 2 - I'm leaning toward A,  but Can we make a soft deterministic push something that doesn't require the whole machinery but still nudges or pushes the agent to do this. Some kind of a script that activates or something. Think about it. Consult with B. | 3a"
  - Q1-A answered: workers at registered root + `worktree_root` + `<slug>-u<N>`, one absolute path used for create, spawn, inspect and remove, started from the leaf's committed HEAD. Foreclosed: nested with `<lane>` defined (B).
  - Q3-A answered: a worker retained at the old nested path finishes where it is; only new workers use the new path; no occupied folder is deleted to match naming. Foreclosed: relocating retained workers (B).
  - Q2 reshaped: a soft deterministic push that is less than an akrogon allocator command but more than prose alone. Research pending (A, B).
- Q2 reshaped research 2026-09-28: slots/q2-A.md, slots/q2-B.md, merged slots/q2-merged.md, rebuttal slots/q2-rebuttal-B.md (none).

## Taken
Operator 2026-09-28 verbatim: "1a | 2 - I'm leaning toward A,  but Can we make a soft deterministic push something that doesn't require the whole machinery but still nudges or pushes the agent to do this. Some kind of a script that activates or something. Think about it. Consult with B. | 3a", then on the question "2 - Is this the simplest solution? I just want to make sure it's not adding another complexity or a big failure point.", then "2b, let's go."
- Q1-A: a new delegated leaf worker lives at registered root + `worktree_root` + `<slug>-u<N>`, beside its leaf, started from the leaf's committed HEAD. One absolute path is used unchanged for create, spawn, inspect and remove. Reason: one meaning of `worktree_root` everywhere, and the pi confirm that justified nesting is gone. Foreclosed: nested with `<lane>` defined (B).
- Q2-B: `akrogon config` prints the resolved absolute store as a derived key, like `AKROGON_BASE`, and worker-protocol.md names the worker path from it. `worktree_root` in config output stays as configured. Reason: the defect was a relative value read two ways, and an absolute value removes the second reading with one line and one test and no new failure point. Start commit and caller checkout were never wrong in the transcripts. Foreclosed: creator script (A) as a new failure point solving unobserved problems, prose only (C) as no push.
- Q3-A: a worker retained at the old nested path finishes where it is. Only new workers use the new path. No occupied path is deleted or reused to match naming. Foreclosed: relocating retained workers (B).
