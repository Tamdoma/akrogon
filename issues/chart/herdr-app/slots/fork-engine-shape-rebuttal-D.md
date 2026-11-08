# Rebuttal engine-shape: slot D

Two disagreements; the rest is fairly merged.

1. Q3, hand-run phase is misattributed to me as a reason for 3b. In my notes the listener, not phase-direct dispatch, covers hand-run phase moves, and I asked whether a hand run of `akrogon phase` from a plain shell should auto-dispatch at all or stay manual until `next`. The merged 3b builds hand-run phase in as a covered case and my question is missing from "Questions the fork did not ask". This changes 3b's scope: operator-run phase could unexpectedly start agents and place panes. My reasons for 3b were turn-end latency and hc status gaps (codex question, backgrounded Claude), not hand runs. Related missing question of mine: whether phase, mergeWake, landedWake, and event wakes unify into one detached wake mechanism.

2. Q2, my pick gives `pull --all` a home and the merged text leaves it only as an open detail. My listener start runs `pull --all` then `next --resume` (plugin order), with the cadence question being whether pull should stay on every listener start or move to once per boot. As merged, the listener bullet runs only the catch-up pass, so the plugin's startup pull is unhomed until someone answers the open detail. The fork should present a default (mine: pull at start) against the once-per-boot alternative, not drop pull from the pick.
