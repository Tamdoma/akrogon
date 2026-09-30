# Brief: guarded-peer-wait

## What
Replace the peer wait sentence in `skills/chart-issues/assets/questions.md` (Blind peer exchange paragraph, the sentence starting "For each named peer, use the supported herdr interface") so slot A confirms a prompted peer started working, and waits for it in bounded, repeated herdr waits before and after the prompt, never in one wait that outlives the harness command timeout.

## Why
Tamdoma/akrogon#44: `herdr agent wait` right after `herdr agent prompt` matched the peer's pre-prompt idle state and returned before the return file existed, and a no-timeout wait on a 6-minute peer turn outlived Claude Code's Bash limit (120000 ms default, 600000 ms max) and surfaced as a failure although the peer had answered.

## Done-criteria
1. The paragraph states, in the chart's taken wording or an equivalent: wait until the peer pane is idle; prompt with `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`; any non-zero exit of that prompt (`agent_prompt_stalled`, `agent_blocked`, `timeout`) is reported to the operator with herdr's error and the peer is never re-prompted automatically; every wait on a peer, before and after the prompt, is `herdr agent wait <pane> --timeout <T>` with T below the command timeout the harness gives that call, run again whenever it fails with code `timeout`; a peer reaching `blocked` goes to the operator; after the prompted turn finishes, A reads the specified return file and reports a missing file as a peer failure.
2. The next sentence, "Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer.", is unchanged.
3. `grep -rn "without a timeout" skills docs README.md` prints no line about peer waits.
4. The configured `checks` (`bun run format`, `bun run typecheck`, `bun test`) pass.
