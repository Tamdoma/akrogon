# Guarantee, slot A notes (written before reading B, C)

## Pick
1a, plus the evidence fork making a raw run worthless as proof. Reason: the host is already safe from raw runs (slice quota keeps half the PC free, leaf stop reaches them), so the remaining harm is speed and flakes for the permit holder, and that harm comes from one instruction gap (undefined "resolved changed-tests command") plus pi's background-and-poll sentence. Fixing the path seats take removes the cause. Cost: compliance stays voluntary; a seat under pressure can still improvise, and the holder pays when it does.

## Rejected
- 1b: covers only the scripts a repo remembers to gate; `bun test <file>` and new scripts stay open, so it is still voluntary, just one layer down. Couples framework scripts to akrogon (manual operator runs start queueing behind leaves; a repo used without akrogon needs a fallback branch). Worth it only if 1a fails again after the instruction fix.
- 1c: reopens permit-release, throttles every legit pane action (builds, single-file tests, the agent itself), and a same-UID seat can re-scope itself, so it is a speed bump, not a fence.

## Evidence
- practitioner/primary: Bazel `--local_test_jobs` and `exclusive` tag gate tests inside the runner every test passes through (limit-boundary Findings, bazel.googlesource.com dffb6ee9, read 2026-10-13). Nothing in Bazel stops a person running the binary by hand; the gate holds because the runner is the normal path.
- primary docs: GitHub Actions `concurrency` groups and Jenkins Lockable Resources serialize jobs at the pipeline step, again only for work the pipeline starts (model-knowledge; no search run this pass).
- primary code: src/config.ts:312-329 wraps printed checks in run-check; src/permit.ts:94-98 nested admission via AKROGON_RUN; seat's first raw run at pi session :47 used the raw form while its brief held the wrapped one.

## Pitfalls
- Writing 1a as if it serializes everything repeats the host-test-load wording problem. Removed by: the limit-boundary residual stated in docs and the chart.
- Instructions alone drift. Removed by: the evidence fork (raw run output is not proof, B treats it as missing) so bypass buys nothing; reopen trigger: a second raw heavy run seen after the fix moves to 1b.
- Fixing only implement-issue:57 leaves worker-protocol, brief-template, check-issue and merge-issue paths. Removed by: one rule stated at every rule location (check-reruns precedent).

## Questions not asked
- Should the reopen trigger for 1b be recorded now (second observed raw heavy run)?
