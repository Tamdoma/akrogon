# Opening map brief, slot C

You are consultant slot C for a chart-issues door (slot A in pane w8:pNP) running on the akrogon repo /home/ivan/Work/infra/akrogon. Work blind: do not read other slots' maps. Write nothing in the repo; only write your return file.

## Reading rule
Read process text by named section for the step you are answering: locate a section before reading it, batch independent reads in one call with bounded output, read content you already hold at most once per session. Unread sections, changed content and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when citing process text. Source code is the subject here, so read code freely.

## Intake (read verbatim, all seven)
/home/ivan/Work/infra/akrogon/issues/seeds/110-akrogon-run-check-gh-api-on-a-private.md
/home/ivan/Work/infra/akrogon/issues/seeds/111-under-akrogon-run-check-maestro-stops.md
/home/ivan/Work/infra/akrogon/issues/seeds/112-under-akrogon-run-check-in-command.md
/home/ivan/Work/infra/akrogon/issues/seeds/113-akrogon-verify-setup-fails-with-missing.md
/home/ivan/Work/infra/akrogon/issues/seeds/114-akrogon-verify-stops-on-every-gljive.md
/home/ivan/Work/infra/akrogon/issues/seeds/115-akrogon-verify-refuses-every-gljive.md
/home/ivan/Work/infra/akrogon/issues/seeds/116-next-leaves-an-untracked-extra-pane-in-a.md

## Live surfaces
src/run-check.ts, src/scope.ts, src/guard.ts, src/verify.ts, src/config.ts, src/next.ts (allocate, ensureWorktree, createSparseWorktree), src/batch.ts, src/reconcile.ts, docs/guide/setup.md, skills/init-akrogon/SKILL.md, learnings/LESSONS.md, issues/closed/ (earlier designs, e.g. worktree-isolation), tests/.
Locks: none yet. Operator values: simplest, most elegant fix; reduce code before adding; keep code lean; remove a problem class rather than guard a case.

## Task
Produce your own territory map:
1. Consolidate: which reports share a root cause or are duplicates; group them into charts (one destination outcome each).
2. Per group: the material forks (real choices that change the outcome), each with options, your pick and reason, and what each option could break or invite later. Prefer options that delete code or a mechanism over ones that add a guard.
3. Practitioner questions and pitfalls (e.g. why constructedEnv is an allowlist, why the D-Bus bus is cut, whether systemd-run --expand-environment=no exists on the installed systemd, whether the checkLocation guard is still needed, why allocate saves tab before panes).
4. Evidence lines with tier (better-than-training = inspected code with path:line, or tool docs/man pages; model-knowledge only with failed searches), and anything surprising.
Keep it compact: under 120 lines.

Return file (exact path, write it when done): /tmp/claude-1000/-home-ivan-Work-infra-akrogon/f254b4d3-ac0a-4455-aec0-366ac6ba64c7/scratchpad/map/map-C.md
