# Boundary merged notes
## Options
- Paused paths: all four herdr events, plugin startup `--resume`, mergePass after an automatic pass, mergeWake after `akrogon phase`, dependent starts caused by automatic completion (A,B). Running agents untouched; pause never changes phase, queue order or capacity (A,B).
- Manual `next <target>`, typed bare `next`, `--all` run in full with existing dependent and merge cascades; a manual pass grants one pass, never clears pause (A,B).
- Cleanup while paused: (A) freeze everything automatic, including merged-tab close, temp cleanup and owner completion (broadcast, source close); first pass after unpause does them. One rule, cost: merged tabs stay open. (B) keep existing cleanup and owner completion on their current paths, suppress only starts and prompts. Cost: cause must be threaded through completion/dependent paths and cleanup separated from scheduling.
- Manual `--resume`: (B) bypass pause, which needs plugin startup marked as automatic. (A) `--resume` is the plugin's startup command and is not documented for operators (grep docs/guide, skills: no hits), so it is always automatic; operators use `--all`.
## Evidence
- Repo: plugin/herdr-plugin.toml:10,13; plugin/next.sh:3; src/next.ts:1232,1256,1272,1303,1312,1332,618,678,687,1295; src/akrogon.ts:75; src/next.ts:1141 (A,B).
- Kubernetes CronJob `.spec.suspend` (A), Argo CD auto-sync (A), Temporal Schedule Pause (B): automatic stops, manual works, started work continues.
- Astronomer Airflow scheduler write-up 2026-08-31 (B): re-read control state at the scheduling boundary.
## Pitfalls
- Queued event or in-flight merge prep launching after pause: pause command takes the global lock; every automatic launch/prompt point re-reads pause, not only pass entry (A,B; merge sections next.ts:928,981 per B).
- Typed command inside a herdr pane misclassified: classify by event JSON / startup marker, never HERDR_PANE_ID or leaf count (A,B).
- Skipping hooked pass must exit 0 (A).
## Differ
- Cleanup during pause (A freeze all, B keep cleanup).
- Manual --resume bypass (B) vs always paused (A).
