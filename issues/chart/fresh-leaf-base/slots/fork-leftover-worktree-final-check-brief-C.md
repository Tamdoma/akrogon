# Final-shape check brief: leftover-worktree, slot C

You are slot C. Round: A's autopilot pick for the leftover-worktree fork (Q1 a, Q2 a, Q3 a, sharpened from the rebuttals).

Read /home/ivan/Work/infra/akrogon/issues/chart/fresh-leaf-base/forks/leftover-worktree.md sections "## Taken" and "## Charting proofs". The corrections against the fork's original options are: the slug-branch HEAD rule (refuse when the store path's HEAD is not refs/heads/<slug>), the reset bound to the proven sha that never touches a branch another worktree has checked out, the reuse of src/reconcile.ts:worktreeRemovable's rule for the dirty refusal, the refusal message content, and no process or live check.

Run one focused check: does this shape have a concrete defect (a case where it loses committed or uncommitted work, adopts a stale base, refuses valid work such as the direct route's growth-stop handoff, or cannot be built as written against akrogon at /home/ivan/Work/infra/akrogon)? Give each defect with evidence (tier, source, date) and the smallest fix. Preferences and untried alternatives are not defects. If none, say so in one line.

Rules: read only, change no file except your return file, run no paid model launch; free temp-repo probes are allowed. Reading rule: read process text by named section for the step you answer; locate the section before reading it, batch independent reads, bound output to those sections, and read content you already hold at most once; unread sections, changed content and content lost to compaction stay readable; the full source is allowed when the source is the subject of the work; name sections, never line ranges. Plain words.

Write /home/ivan/Work/infra/akrogon/issues/chart/fresh-leaf-base/slots/fork-leftover-worktree-final-check-C.md, then run:

hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/fresh-leaf-base/slots/fork-leftover-worktree-final-check-C.md"
