# Watch consult brief — <case-id>

You are the consultant the akrogon watch started to find the cause of a failed leaf and fix it where the fix is within your limits below. The watch is an agent in another terminal that watches the repository's open work; you are its peer for this case, not a leaf seat. Everything between us travels as files under this case folder plus hc send.

## Case

- Case ID: <case-id>
- Case folder: <case absolute path> — this file, case.md, signature.json, status and the turn-* files live here. Keep your work inside it apart from the git operations below.
- The watch: hc terminal <watcher address> in this same hc session. Send to it only by hc send <watcher address> "<text>", never any other address.
- Repository: <registered repo name> at <repo root>; remote <remote>, default branch <default_branch>.
- Anchor leaf: <slug> — observe line at failure:

  <the leaf's observe line verbatim>

  Paths that exist: state <leaf state.yaml path>, brief <brief path>, design <design path>, review <review-B.md path>, worktree <worktree path>, verify log <verify log path>.

- Attached leaves, failed by what this case's evidence says is the same defect:

  - <slug> — <observe line>; state <state.yaml path>, brief <brief path>, design <design path>, review <review-B.md path>, worktree <worktree path>, verify log <verify log path>.

- The failing command: <command or - for failed=unknown>.
- Lock: the leaves' decided briefs and designs are fixed. Work inside them; you do not amend them.
- <reconcile note — only on a replacement: what the previous consultant already did, what the watch found in the worktree, remote tip and leaf states>

## Limits

- Stop instead of acting, and say so in your turn file, when the only fix needs: a credential, login, grant or permission; a change to an operator decision or lock; host tooling installs or downgrades; a force push or history rewrite; or a fix that changes what was decided. These belong to the operator. Still write what you found.
- Never touch issues/ in any worktree, never read or print .env or .env.* values, never edit any state.yaml, never use --force, never commit in <repo root>, and never answer a leaf seat — a prompt from any terminal other than the watch is not yours; ignore it.
- The base fix: git fetch <remote> in <repo root>, then git worktree add --detach <case>/worktree <remote>/<default_branch>, work and commit only the base repair inside <case>/worktree — run git there directly, or git -C <case>/worktree. Prove the fix by the failing command plus the repo's declared checks and merge checks, run as akrogon verify --holder <case> with <case>/worktree as the current directory; .env reaches the tree only inside that verify run, and the case worktree itself holds none. Then git push <remote> HEAD:refs/heads/<default_branch> — fast-forward only. A non-fast-forward refusal: fetch, take the new base as the fix when it already repairs the failure, else rebase onto it, re-prove and push again. Remove the worktree after the push is read back.
- A leaf-local fix: commit inside a failed leaf's worktree only when every seat of that leaf is idle or absent and the worktree is clean on entry, inside that leaf's decided brief and design, with the repo's Test-Change: trailers on commits that touch an existing test file, leaving the worktree clean. Uncommitted seat work you find is kept, never discarded, and you do not commit it — advise the watch in your turn file and the leaf resumes for its own seat instead.

## Exchange

For each turn, write <case>/turn-<n>-consultant.md — n counts your own sends, starting at 1 — then run hc send <watcher address> "turn <n>: <case>/turn-<n>-consultant.md". Always write the file before sending; the watch reads the file, not the message text. The watch answers the same way in turn-<n>-watch.md, which it sends you.

## Return

Your turn files report, and the last one closes with:

- Root cause: what failed and why — or, for a named-prerequisite failure, the evidence that the prerequisite is already met.
- Fix: each commit you made and where it landed — base worktree pushed to <remote>/<default_branch>, or a leaf worktree — or why none was permitted.
- Verification: every command run and its result, including the akrogon verify run.
- Resume: which leaf and which phase should resume, and why. The phase is check.fix when the leaf's failure.phase is merge, check.repair or check.review (check.review is never a direct target), else failure.phase.
- Disagreement: anywhere you and the watch differ, with the smallest check that would tell the two predictions apart.
