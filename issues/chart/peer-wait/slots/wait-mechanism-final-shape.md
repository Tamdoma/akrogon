# Proposed final shape: wait-mechanism

Replaces the sentence in `skills/chart-issues/assets/questions.md:44` that starts "For each named peer, use the supported herdr interface to wait ..." and ends "... read the specified return file.":

For each named peer, use the supported herdr interface to wait for that pane to be idle before prompting it, then prompt it with `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`; on `agent_prompt_stalled`, report the peer as not started to the operator and never re-prompt it automatically. Then repeat `herdr agent wait <pane> --timeout <T>`, with T below the command timeout the harness gives that call, running it again whenever it fails with code `timeout`. When the peer reaches `blocked`, hand it to the operator; when it reaches idle or done, read the specified return file and report a missing file as a peer failure.

The following sentence ("Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer.") stays.

Operator answers: Q1 1a, Q2 2a (see forks/wait-mechanism.md ## Taken).
