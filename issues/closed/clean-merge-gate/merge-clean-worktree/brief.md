# Brief: merge-clean-worktree

## What
Every time the command prompts the merge seat (B) for a merge attempt, in both `attempt=<id> top=<sha>` and `attempt=<id> solo` form, it first removes the holder worktree's empty untracked folders: folders that contain no file at any depth, found by walking the worktree, including an empty folder inside an untracked folder that also holds a file. It never removes a file, never enters `.git` or ignored paths (no `-x`), and works whether or not the worktree has uncommitted changes. The removal runs where the worktree is known to exist (after the merge dispatch has ensured it); a leaf with no worktree has nothing to remove. (A,B,C)

`skills/merge-issue/SKILL.md:41` and `:51`, where B runs the gate "on `HEAD` in the worktree", gain one clause saying the command removed empty untracked folders first and ignored files remain. (C)

## Why
Tamdoma/akrogon#63. Framework commit `264cc2f5b` proves a test depended on two folders the commit did not hold, and the pushed main `2ccc39534` failed on a clean checkout, bouncing 3 attempts. The old worktree was not inspected, so the exact cause of its green run is unproven (B); empty leftover folders are the class that can hide such a failure. Git never reports empty folders (`git status --porcelain` is empty with them present), so the existing dirty check (src/batch.ts move()) cannot see them, and the gate runs "on HEAD in the worktree" (skills/merge-issue/SKILL.md:41,51).

## Done-criteria
1. A holder worktree holding empty untracked folders (at the root, under a tracked folder, and `untracked-parent/empty-child/` beside `untracked-parent/keep.txt`) is prompted for merge with those folders gone, in both top and solo form. Shown failing before the change. (B,C)
2. Untracked files, folders that contain any file, ignored paths (for example `.temp/` and `node_modules/`) and tracked content are byte-identical before and after the prompt.
3. A worktree with uncommitted tracked changes and untracked files still loses only its empty untracked folders and keeps every change.
4. A failed removal stops that merge prompt with the folder path and error, and the turn is not dispatched with the folder still present. A leaf with no worktree is prompted as today. (C)
5. skills/merge-issue/SKILL.md:41 and :51 state that empty untracked folders were removed before the gate and ignored files were not. (C)
6. The blocking `checks` pass.
