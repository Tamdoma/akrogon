# watcher rebuttal, C (2026-11-06)

Attributions to C are correct. One disagreement, two short positions.

1. B and D dropping the cron. The direction (signposts, read as) forbids "polling loops, no sleeps or timed waits standing in for a signal". The 20-minute check does not stand in for a signal: a seat looping inside one turn, or codex waiting on its own question, changes neither status nor turn, so hc has no event to give; the only signal would be a transcript write, which is B's own replacement. That replacement wakes a paid Claude check on every tool call of every seat of the repo (coalescing bounds duplicates, not the number of quiet periods), reads harness files instead of hc, and still needs a timer for screen-only seats; D's "a check may arm a one-shot recheck" is a timer under another name. Signpost 4a binds "pretty much the same what we have now" for the watcher; the cron is that. The improvement the operator asked for is the wake for the events hc does see, which all five add. Keep the cron.

2. B's one `hc keys esc` instead of `hc interrupt`: no disagreement on the rule (one stop per seat per watch), only on the key. The leaf seats are agents that report status, so `interrupt` has a known app; if probe P1 shows it presses ctrl+c for any configured harness, the skill text names `hc keys <t> esc` for that kind, decided by the probe, not kept as a fallback.

3. D's question, one watcher per repo or per hc session: per repo, as today. The skill is invoked at a `<root>`, its label is `akrogon.watch=<repo>`, and a session with several repos gets several watchers only if the operator starts them; the listener sends to the label of the repo whose leaf raised the event, so nothing changes with more repos in a session.
