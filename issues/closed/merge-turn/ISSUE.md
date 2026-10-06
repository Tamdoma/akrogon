# Issue: merge-turn

- [check-setup](check-setup/brief.md): every check installs the worktree's own packages first, one install at a time per worktree
- [nits-before-merge](nits-before-merge/brief.md): B records held reusable Nits before its leaf enters `merge`
- [merge-turn-order](merge-turn-order/brief.md): one merge holder per repo, other merge leaves wait in order
- [merge-batch](merge-batch/brief.md): the holder lands every waiting leaf in one command-owned push after one check run
- [record-only-reuse](record-only-reuse/brief.md): a refused batch push reuses the green run when main moved only in record folders
