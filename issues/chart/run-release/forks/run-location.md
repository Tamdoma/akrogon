# Run location

## Question
Q1. Where does the installed `akrogon` command run from, so a workspace edit can never go live, block a deploy, or be undone into a "revert": the workspace root as today, a second git checkout moved only by self-update (O1), or one immutable release folder per merged main commit behind a `current` pointer (O1b)?

### Carries
- Operator 2026-10-16: "is there a more elegant solution without the copy? maybe consult with b and c"
- Operator 2026-10-16: "but I can still run everything from the main folder, like what we're doing here?" Answer given: yes; sessions, charts, leaves and records stay in the workspace; only the command's code location moves; an unmerged edit is tried with `bun src/akrogon.ts`.

## Findings
- Opening maps 2026-10-16: [brief](../slots/map-brief.md), [A](../slots/map-A.md), [B](../slots/map-B.md) (codex), [C](../slots/map-C.md) (pi).
- No fix without separate runtime bytes removes the class; warnings, read-only files, hooks and stash/reset guard or risk work (A,B,C). Running committed git blobs directly needs a loader and is more machinery (A,B).
- O1 worktree: simplest, but an editable checkout updated in place; a crash mid-update or a stray edit there can still leave a broken or blocked runtime (B F7, F8; C).
- O1b release folders: not a git checkout, built fully then switched by one pointer flip, rollback is a flip back (C). B calls an installed release artifact the no-checkout variant (B O2, D2).
- Both need: state home out of toolRoot (src/config.ts:195-198) (B F1, C), deploy split from record sync (src/self-update.ts:208-262) (B F3-F4, C), own-repo detection not by path (src/self-update.ts:211) (B F2, C), links repointed (src/install.ts:14-25,:66) (B F5, C), skill steps that resolve src through the `akrogon` path keep working (C).

## Taken
- Operator 2026-10-16: "ok, then whatever you recommend, let's go", given after A recommended O1b.
- Reason: no editable checkout serves execution, the switch is atomic, rollback is one pointer flip.
- Foreclosed: running from the workspace (today); O1 second git checkout; warning or refusal on a dirty root; read-only files; stash or reset during update; compiled single binary (C: skills, plugin and systemd need files on disk, and `process.execPath` is used as the bun interpreter).
