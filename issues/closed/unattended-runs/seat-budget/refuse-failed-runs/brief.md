# Brief: refuse-failed-runs

## What

`akrogon run-check` and `akrogon verify` refuse to start a new leaf- or worker-scoped child while the leaf's phase is `failed`. The phase is read before admission and again, freshly from state.yaml, right before the child spawns. Each refusal exits non-zero before any child process starts, prints the refusal on stderr and appends one `check_refused` timing row. Holder and checkout runs are not affected. Runs accepted before the leaf failed finish as today.

## Why

Report Tamdoma/akrogon#136. On 2026-11-15 the framework leaf keyword-research-skill was failed at 21:36:56Z, and its still-running seat launched three more paid captures through run-check (21:41Z to 21:46Z). Each run only recorded `phase: failed` in its timing row.

## Done-criteria

1. A run-check or verify stage started for a leaf (worktree cwd or `--leaf`) or for one of its workers while the leaf phase is `failed` starts no child process. It exits non-zero and prints "Refusing run-check <name> for leaf <repo>/<slug>: the leaf is failed (<reason>). Stop work on this leaf; the operator recovers it with akrogon phase <slug> <failure.phase>." When the state has no failure record, it prints "(failure record unavailable)" in place of the reason and names no recovery phase.
2. A run that was waiting for admission when the leaf moved to `failed` is refused the same way when admission lets it through, before its child spawns.
3. Every refusal in criteria 1 and 2 appends one `check_refused` row (slug, run, name, scope, phase, optional unit and attempt) to `issues/timings.jsonl`, which `readTimings` parses.
4. A run whose child already spawned before the leaf moved to `failed` finishes and publishes as today. A run whose resolved caller is not a leaf or worker (the checkout holder target, which carries no phase) is never refused for a leaf phase. A verify that reuses a green receipt or joins a live pass starts no child, and stays as today (stated limit).

Criteria 1 to 4 are proven by the leaf's own tests at the CLI boundary (the real run-check and verify commands with a fake child). Criterion 2's test turns red under one deliberate break (the late phase read removed).
