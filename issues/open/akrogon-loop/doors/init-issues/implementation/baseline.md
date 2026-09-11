# Baseline before implementation

C1 failed by functional inspection: the existing 176-line skill directs hand-written repo config, obsolete dependency installation and script stamping, has no installed-command dependency or `init --from` flow, omits current repo settings and base-aware checks, allows grounding none instead of creating an index, and lacks compaction and terminal handoff instructions.

C5 failed: git lists SKILL.md plus ten files in payload/issues/.scripts and scripts/sync-payload.ts, and the skill references their retired paths and config keys.

Worktree status was clean before edits. Command implementation and existing tests already provide proposal validation and init-owned writes, so no command changes are needed.
