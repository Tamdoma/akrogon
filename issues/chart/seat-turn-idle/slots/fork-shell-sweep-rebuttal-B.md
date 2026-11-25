# Rebuttal: shell-sweep merged notes, slot B

## Q1

**Disagreement 1 — "notice-only" overstates the residual stall; the wake problem guts both options as written.**

The merged cost line for option a says a post-advance tail shell and a masked silent end "stay notice-only (1 h busy notice)". Verified against `src/listen.ts` (listenCommand, 2026-11-25): passes are enqueued only on `turn`, `blocked`-status, `finished` and `lost` events, plus retries of failures. There is no timer anywhere — no `systemctl --user` timer exists for akrogon on this machine either (checked 2026-11-25). A masked frozen seat emits no events: turn never advances, status never changes, terminal never finishes. On an otherwise quiet machine no dispatch pass ever runs, which means `observeBusy` never runs either — the 1-hour busy notice itself never posts. The residual case is not notice-only; it is silence-only, permanent, and invisible. That is the exact failure class this chart exists to remove (signposts 5a: unattended stalls first).

The same fact cuts the other way, and the merged notes do not record it: the delivery-time sweep in option c inherits the identical wake problem. A quiet-period sweep "runs only when an unrelated pass happens" is not a minor cost — on a quiet machine, the machine most likely to be running unattended overnight with one stalled leaf, there are no unrelated passes, so the sweep never fires. As written, c's second half is dead code exactly where it matters most.

Concrete consequence if the point stands unqualified: the chart closes believing the stall class is handled while the masked-silent-end variant (documented behavior — LESSONS.md line 57 shows seats ending turns without reporting is a recurring pattern) remains a permanent silent stall, and whichever sweep is built cannot run when needed. Any honest version of either option requires one bounded listener addition: a periodic wake (interval in the same order as the quiet period). It is one timer in `listenCommand`, inside the existing mechanism — but it must be in the leaf design, not discovered missing after the sweep ships.

**Disagreement 2 — D's quiet period of "a few minutes" is economically backwards, and "from phase entry" is the wrong clock.**

A few minutes is shorter than ordinary genuine turns. Seats routinely run 10-60 minute turns, and background shells during them are legitimate, common work (watchers, dev servers, poll loops that will be killed at turn end by the harness). Indistinguishability is agreed fact: nothing separates a genuine working turn from a masked ended one. So a few-minutes sweep fires on real work constantly, killing in-use shells on most long turns. The false-positive cost is small per occurrence but the frequency makes it a tax on every long turn, forever. The correct trade is the other direction: the stall is permanent, so recovery latency of 30-60 minutes costs nothing against infinity, while pushing the false-positive rate toward zero. "From phase entry" is also wrong because prompts are delivered throughout a phase (redeliveries after silent-end counts): the clock must start at the most recent delivery or at `busy_since` onset, not at phase entry. Concrete consequence if D's numbers stand: the fix converts a rare permanent stall into a frequent small corruption of healthy work.

**Concession, recorded for accuracy, not a disagreement with the outcome:** A is right that the advance sweep fires in the incident itself — the intake's Observation section shows the leaf moved implement → check.review at 18:07 with the shell already running, so the sweep at that advance kills the loop and the mask never forms. My notes' in-phase framing was wrong for the incident. What survives of my position is only the silent-end variant above, which the merged cost line already half-concedes.

**No disagreement** with: sweep after the save with warn-not-fail, failed/merged sweeping too, rejection of dispatch-only on the phase-call race.

## Q2

**No disagreement.** Shell-program processes with their trees, caller-ancestry sparing, run-check spares, pid re-checks, TERM-then-KILL, the timing row. On the one sub-fork (shells anywhere in the scope vs direct harness children) I hold "anywhere in the scope, matched by comm" — the two-level bash wrapper chain in the census (bash → bash → bun, all inside the seat scope) makes direct-child parentage an implementation detail of one harness version — but this is inside the merged option, not a rejection of it.

## Q3

**No disagreement with the pick.** One correction to the Open questions section:

The open question "turn keep off for seats" is listed with "who sets keep: true is unknown". Probed 2026-11-25, throwaway terminals: a `keep: true` terminal whose program is killed externally resurrects as a live bare shell; a terminal without `--keep` killed the same way goes `finished` — the existing lost-seat path handles it with no new detection at all. So the keep-off direction is verified in its central premise, not speculative: it would make Q3's detection machinery unnecessary. What the open question still needs is the reason seats are keep at all — nothing in akrogon passes `--keep` (`src/hc.ts:run` builds no such flag; grep of src shows no writer), so the true value comes from herdr-core or herdr-app defaults, outside this repo. Consequence if the question is dropped rather than answered: the leaf builds bare-shell detection that a one-flag change would have made dead code, and the keep behavior stays an unowned accident — the next herdr update can change it silently in either direction.
