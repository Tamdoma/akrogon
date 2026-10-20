# fresh-run-need notes, slot A (written before reading B and C)

Pick: one replay rule for every leaf, not only chain triggers. Model and outside stages replay output recorded from one real run. A fresh paid run happens only when the leaf changes what the model sees or how it is called (prompt, model, settings, tools, output shape, outside call), or when an outside change makes the recording unreliable, and then it is one real call that re-records. A repair to downstream code (parsers, page writers, plumbing) reruns against the recording. Reason: standing-design already states this rule but scopes it to "a chain trigger" (one leaf's output consumed by another leaf). Inside a leaf, implement-issue's rerun rule ("rerun each done-criterion proof whose test, proof command or inputs ... changed since its last green run") treats every touched file as an input of the live run, so each small fix forces a full paid replay. hub-child-links criterion 4 ("One full replay on the plumbing fixture writes topic_hub and topic_cluster pages") tests plumbing, not model behavior. A recording would prove it. Only its model pin proof ("proves the Opus 5.5 medium pin only") needed a real call, once. Cost: the leaf needs a recording first, so the first real run must save stage outputs. If the runner cannot replay from saved output, that is missing machinery and goes to a prerequisite leaf per standing-design, and the framework's replay runner has no resume or replay flag (`run-satellite-live-replay.ts`: only --case, --case-file, --limit-minutes, --evidence-dir).

Changes:
- standing-design "A chain trigger is ..." bullet: lift the replay sentence out of the chain-trigger scope so it covers every model or outside stage a proof runs. The chain-trigger bullet keeps only what is specific to chains (consumer's own suite, no merge needs a live run). One rule, one place.
- implement-issue end-of-implementation rerun sentence and the check.fix "supply passing proof for every done-criterion" sentence, check-issue check.repair rerun sentence: for a proof with a recorded model stage, a changed input that is not model-facing reruns the replay, not a fresh run. Better: say nothing new there and let the standing-design rule decide, if the plan names each criterion's recording and rerun trigger (plan-issue already requires "a rerun trigger" per criterion).
- plan-issue plan.md rule: the rerun trigger for a model-stage proof names the model-facing inputs only.
- Delete: nothing in code. The "slow run is any live run" wording stays.

Rejected: keep fresh runs and rely only on the grant bound from limit-mechanism. The bound stops the bleeding but each allowed attempt still costs about 13M input tokens for plumbing that a recording proves.
Rejected: ban live model proofs entirely. A prompt or model change needs one real call, or the leaf ships an untested prompt.
Rejected: cheaper model for reruns. Changes the behavior under test and still pays.

Evidence:
- operator, 2026-10-19: told charting to use `claude -p` because the framework runs inside Claude Code; wants far fewer test tokens.
- better-than-training: skills/chart-issues/assets/standing-design.md chain-trigger bullet and cheapest-sufficient bullet; skills/implement-issue/SKILL.md rerun sentence after the last unit; skills/plan-issue/SKILL.md plan.md rule ("a size ... and a rerun trigger"); read 2026-10-19.
- intake: hub-child-links reached live-replay-10, replay-cases live-run-12, about 13M input tokens per run, pattern "small fix, rm -rf .temp/satellite-live-replay, full rerun" (INTAKE.md Observation).
- practitioner: record/replay (VCR cassettes, golden files) is the common way to test code around LLM calls; real calls kept for prompt or model changes. Training knowledge only here, no source fetched yet; B and C searched.

Pitfalls:
- A recording goes stale silently: re-record on any model-facing change and on outside change, never hand-patch (already in standing-design).
- A seat calls a downstream fix "model-facing" to justify a fresh run: the plan's rerun trigger names the model-facing inputs, so the call is checkable.
- No replay support in the framework runner: prerequisite leaf, not a seat improvising one mid-pass.
- A recorded replay is labelled real: standing-design already says a stage labelled real that fakes its result does not count.

Question the fork does not ask: which open framework leaves need their criteria rewritten from "one full replay" to "replay from recording plus one real call", and is that a framework chart or part of this one?
