# Cutover merged

## Agreed (A,B)
- Old-role leaves finish under the old code, including the swap leaf itself. No migration code, no relabeling.
- Go-live is the local main fast-forward in /home/ivan/Work/infra/akrogon plus the operator's slots.a/b value swap in config.yaml, done together before any new dispatch. Result: a = pi/muse-spark/max, b = codex/gpt-6.1-sol/high.
- "Finished" means merger done too: phase merged alone is not enough because the merger broadcasts after merged.
- Recheck all nine registered repos at cutover time, including repo seat overrides (none today).

## Differs
- (A) Gate: zero unfinished leaves in every registered repo and no leaf tab still open. Then ff + config swap in one sitting. No plugin disable, since hooks with no unfinished leaf dispatch nothing (src/next.ts:735-738) and new leaves only come from an operator handoff.
- (B) Gate plus barrier: `herdr plugin disable akrogon`, stop any /watch-issues job, no manual next/phase, ff + config swap, verify symlinks and effective config, `herdr plugin enable akrogon`, restart watches.

## Rejected (A,B)
- Converting in-flight leaves: needs conversion of done/verdict/prompted/pane records and review artifacts with no role-version field (src/state.ts:35-58).

## Leaf constraint (A)
- The swap leaf must not change config.yaml: operator's uncommitted edit would make ff-only refuse.
