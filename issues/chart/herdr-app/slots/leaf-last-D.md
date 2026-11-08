# Leaf last check: D

1. Leaf: `consultant-weights`. File: `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/consultant-weights/brief.md:7-10` and `design.md:108`.
   Problem: the helper must distinguish a changed consultant set (equalize heights) from a restart (keep dragged weights) using only its argument list and the current document. After `hc kill` and `hc rm`, a restarted last consultant and a newly added last consultant can produce the same arguments and document shape, while requiring opposite weight behavior.
   Evidence: the brief requires opposite outcomes at lines 9-10, and the design says the old pane is already dropped at line 108. Seat-letter order does not remove the last-position ambiguity.
   Fix: give the literal interface an explicit set-change/restart input, or a replacement-seat argument, and test a last-seat restart with unequal dragged weights against adding a last seat.

2. Leaf: `herdr-skill`. File: `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/herdr-skill/readiness.yaml:21-28`.
   Problem: cleanup still leaves the runs' transcript histories in place while `retained: []` and `effects` says there are no retention effects. The absence check also requires the whole `trustedWorkspaces` entry count to return to its pre-run value, although cleanup removes only this run's exact entry.
   Evidence: shapes require cleanup of transitive fixture contents or a declared retained resource with owner and removal terms. Another run's live trust entry can make the global-count check fail after correct cleanup.
   Fix: mirror the other paid leaves: remove the runs' transcripts after the report quotes what it needs, and check only that the recorded trust entry is absent and every other entry is unchanged. Or declare the transcripts under `retained:` with the required owner, removal date, cost, exposure and cleanup route.

Verdict: changes needed
