# Guarantee, merged notes (A, B, C)

Sources: slots/guarantee-A.md, -B.md, -C.md. Intake now includes the 14:38 second report (workers also run test:changed raw; 3 raw runs beside the holder; slice capped at 16 of 32 cores, host 86% idle at 14:40).

## Options
- 1a instructions + long-run path, residual written (A pick). Reason: the host half stays free under the slice cap; harm is holder speed and flakes, caused by an undefined "resolved changed-tests command" and pi's background-and-poll sentence. Cost: still voluntary. Rejected by B,C as the whole fix: the seat had the wrapped form in its brief-4.md:63 and still ran raw (B,C); it re-accepts the residual limit-boundary foreclosed (B,C); timeout pressure is permanent (C). All three keep 1a's wording work as a component (A,B,C).
- 1b gate the named heavy entry points (B,C pick). Reason: every working serialization gate sits where the work launches (Bazel exclusive, GitHub concurrency, GitLab resource_group, Jenkins Lockable Resources, Buildkite concurrency gates) and the raw `bun run test:changed` is exactly the path seats improvise. Cost: framework destination, per-repo enrollment, compositions and single files stay ungated (B,C).
  - Gate form differs: B refuse an unadmitted call and print the full permitted command (simplest, no changed run semantics); C re-enter through run-check (convenient, but root checkout throws "No leaf worktree matches cwd", src/run-check.ts:134, needs --holder or a chosen root behavior).
  - Token: never trust AKROGON_RUN presence; akrogon validates it against the live holder (B; src/permit.ts:65-68,93-97 already does).
  - akrogon absent (CI, fresh clone): run free (C) vs explicit contract, never silently ungated under akrogon (B).
- 1c per-run scope + throttled panes: rejected (A,B,C). Quota throttles, does not queue (systemd.resource-control); reopens permit-release; throttles agents and builds; same-UID seat can make its own scope (T7).
- PATH shim, UID separation: rejected (A,C named; B: universal interception is a different trust model).

## Evidence
- Bazel exclusive "ensuring that no other tests are running at the same time ... Remote execution is disabled ... Bazel doesn't have control over what's running on a remote machine" (C, bazel.build/reference/be/common-definitions, 2026-10-13): exclusion holds only where the gate controls launch.
- Buildkite, Jason Jacob, Concurrency Gates (B, 2020/2024): admit the whole run, keep internal parallelism; assumes the scheduler controls participating jobs.
- framework heavy paths: test:changed -> run-test-changed.ts (package.json:11, CLI :447-449, spawnSync lanes with inherited env), hooks:selftest -> run-with-checkout-guard.ts (:8), framework:verify -> run-with-root-state-guard.ts (:171); cheap (:167) and verify:core (:168) are bun compositions with no script file (B,C).
- Second report (operator 14:38): two raw runs were implement-issue workers, per worker-protocol.md:11 and brief-template.md:37.

## Pitfalls and removals
- Unvalidated token opens a bypass: central validation in akrogon, cases absent/empty/stale/unrelated/valid (B).
- Nested deadlock or double admission: one admission per outer run, proven by a nested probe under a held permit (B,C).
- Incomplete coverage / enrollment drift: an inventory of gated entry points named in the contract, residual (lanes, compositions, single files) written in the lock (B,C); optional guard test (C).
- Overclaim: the guarantee sentence names entry points, not the host (A,B,C).
- 1b raises queue demand: every former raw run, workers included, now waits behind 12+ min holders with no wait bound; long-run path and queue visibility must land with or before it (C; A adds: worker waves would serialize host-wide).

## Open questions
- Refuse or re-enter (B Q3, C PF1).
- Coverage: framework test:changed only, a framework inventory, or all registered repos (B Q2, C Q-c).
- Behavior without akrogon or at the root checkout (B Q5, C Q-b).
- Should workers run changed tests at all, or only A's printed run (A, from second report).
- Permit count once raw demand joins the queue (C Q-e).

## Slot differences
- A 1a vs B,C 1b.
- B refuse vs C re-enter.
