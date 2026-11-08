# Rebuttal containment: slot D

One pick change from A's proof; no misattribution.

Q2: I withdraw move-after-start and switch to the wrap. My pick rested on systemd-run remaining as a parent wrapper so hc's `pid` would be systemd-run, not the harness; A's live proof on systemd 262 shows `--scope` registers the scope and execs in place with the same pid. With that gone, the wrap is strictly better than my move: the box exists before the harness runs (today's invariant, which the move broke for a short window), every child inherits it, `hc kill` and the session resolver still see the harness pid, and `adoptShell`, the busctl call, and the 50 ms poll loop can be deleted instead of adapted. My gating probe (does moving a pid out of hc-hold break the holder) is no longer needed; the merged wrapper probes replace it.
