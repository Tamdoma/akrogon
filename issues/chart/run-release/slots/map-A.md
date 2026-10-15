# A independent note
Recommend O1 as a git worktree (shares objects, no history copy), detached at origin/main, moved only by self-update. Root keeps records and edits.
Alternatives:
- Rule only / warning on dirty root: guards, still breaks.
- chmod src read-only in root: fragile, git checkout fights it, agents can chmod back.
- bun global install from github: also a copy, adds a network install step to every deploy.
- Run code from git objects (git show/archive at run): slow, no node_modules.
- Records out of root into own worktree, code edits in root allowed: same two jobs, swapped.
Risks: toolRoot/own detection (self-update.ts:211) assumes root==tool; skill symlinks point at root skills/ (install.ts); node_modules must exist in the run worktree.
