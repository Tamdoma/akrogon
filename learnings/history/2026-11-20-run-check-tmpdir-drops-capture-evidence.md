# run-check TMPDIR drops capture failure evidence

## Case

In framework leaf repeats-move-to-verify, implement A ran `akrogon run-check --name capture-website-rewrite-1 -- bun .../capture-website.ts --case rewrite` with no `--evidence-root`. The paid capture failed in its first session and printed `failure evidence kept at /var/tmp/akr-1000/6855/cf6ffba4/run-xbf9lE/selected-page-rewrite-b9kL1n/failure-rewrite-.../rewrite`. Once run-check exited, `run-xbf9lE` no longer existed, so the prep session's return and transcript were lost. A second paid attempt with `--evidence-root <scratchpad>` kept them and showed the cause (`PAGE_PLAN_UNSTAMPED`).

## Evidence

- Kept log: framework `issues/open/review-cost-runs/repeats-move-to-verify/implementation/check-capture-website-rewrite-1-1795163211514-1284712.log`, which names the deleted path.
- `ls /var/tmp/akr-1000/6855/cf6ffba4/` after exit listed only another live run dir.

## Learning

Failure evidence a child process promises to keep must live outside any directory the wrapper deletes. A wrapper that scopes TMPDIR per run turns every `os.tmpdir()` "kept" path into a deleted path. For a paid diagnostic run, that costs a second paid run just to see the cause.

Report: https://github.com/Tamdoma/akrogon/issues/145

## Case 2 (2026-11-20, framework leaf local-recording-tie-rerecord)

Implement A ran `akrogon run-check --name capture-local -- bun .../capture-local.ts --case local` with the driver's default evidence root. The run failed at S4 and printed `failure evidence kept at /var/tmp/akr-1000/6855/b411943f/run-lClbWl/local-area-facts-UOvSpJ/failure-local-2026-11-20T11-48-18-413Z`. After exit, `run-lClbWl` did not exist, so the per-session costs in that dir's meta.json were lost. The S4 cause was recovered only from the session transcripts that `claude -p` leaves under `~/.claude/projects/`. Kept log: framework `issues/open/area-facts-rerecord/local-recording-tie-rerecord/implementation/check-capture-local-1795175299634-57131.log`. The grant allowed one invocation, so the run cannot be repeated to see the costs.
