# Merged notes: stuck-repair

Sources: stuck-repair-A.md, -B.md, -C.md, 2026-10-19.

## Options

- Move the six wave-2 issue folders into `issues/closed/satellite-plan-fit` once, as a door step on framework main, with existing commands only (A,B,C). Keep the owner name so all 757 recorded log paths stay valid (A,B,C). One EPIC.md listing all eight issues; delete the open EPIC.md and the empty open folder (A,B,C). `akrogon pack issues/closed/satellite-plan-fit` folds the 708 loose logs into the archive (89 members, 0 name overlap) (A,B,C). Close #282 and #285 with `akrogon close <source> --by pool-parity` and read back CLOSED (A,B,C). Stage only satellite paths; never touch timings.jsonl or verify-runs.jsonl (B,C). Let the next reconcile remove pool-parity's worktree and tab; no manual removal (A,B,C). Cost: one hand-merged index and a one-time manual append that must not be copied (A,B,C); the closed folder is edited after closure (C).
- Rename to a new name and rewrite recorded log paths (rejected A,B,C): 757 paths in two tracked files that are dirty from other work, wave-1 records share the prefix, leaf record files cite the old path (C), and it waits on the code leaf.
- Rename the closed wave-1 folder instead (rejected C): same breakage on wave 1.
- Reopen the closed owner into open, then complete (rejected B): moves closed material twice.
- Wait for the code leaves and retry (rejected A,C): the guard and the destination throw keep it stuck.
- Close #282/#285 by hand only (rejected C): leaves status wrong and logs unreadable.
- Add append support or weaken the guard (rejected B): contradicts owner-reuse 1a.

## Evidence

- #282 and #285 OPEN, #281/#284/#292/#294 CLOSED, pool-parity merged (A,B,C); pool-parity merged last, so its completion threw before closeSources (A,C).
- The #103 leaves in the intake are already closed with sources CLOSED (A,B,C).
- 708 + 49 recorded wave-2 log paths carry the owner name (A,B,C); 61 lifecycle log records do not (B).
- Today `akrogon log` on a wave-1 recorded path fails because the open twin hides the closed archive (C, live probe).
- Only overlap between the two folders is EPIC.md (B,C). Wave-2 logs are git-ignored; open owner tracks 73 files, closed 22 (C).
- `pack`, `close`, packFolder verification and `.closing` recovery exist at akrogon HEAD (A,B,C) and in the installed release (C).

## Pitfalls

- Pack while the empty open folder exists: remove it first, pack after (A,B,C).
- Interruption mid-move: B records a manifest and byte comparisons and resumes from it; C relies on the `Unpacked:` status line and rerunnable pack.
- Staging the dirty tree: explicit satellite paths only, read `git diff --staged --stat` (B,C).
- Pack tracked-vs-index check: A said stage before packing; B shows the check covers tracked `.log` paths only and none are tracked, so staging is not a pack prerequisite. Withdrawn.
- Another session runs `next` mid-repair: check no active run first; no lock exists (C).

## Where slots differ

- Order of source closing: B closes #282/#285 first and stops if closure fails; A and C close after the move and pack.
- Timing: A and B repair now. C asks whether to keep the twin stuck as a live proof of the code leaves. A: under owner-reuse 1a the guard refuses the twin and completeOwner's throw stays, so the fixed code never completes it; it cannot serve as a live proof.
- Announcement: B asks whether wave 2 gets the normal team message; C notes a retry would not announce either (`justMerged=false`). Wave 2 was never announced.

## Rebuttals

- B: holds closing #282/#285 first, matching completeOwner's order, so a failed close leaves the layout intact. Staging-before-pack pitfall is wrong (applied). Tag corrections applied.
- C: holds closing last: the GitHub comment is the one step that can't be undone, so post it only after the local repair is verified; a failed close then leaves two rerunnable commands. No manifest: `git mv` and git status already show what moved, and packFolder already checks bytes. Withdraws the keep-as-live-proof question.
