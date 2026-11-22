# Signposts: ai-budgets

Original, held in issues/chart/ai-budgets. Angles from slots/signposts-B.md and slots/signposts-C.md (2026-11-22).

## Question

S1 What stays the operator's, and what moves to the seats? O1 split: the operator approves authority once (accounts, operations, effects, stop line, one ceiling) and seats own every count under it (recommended). O2 seats own everything. O3 keep per-leaf grants and automate only renewals. Steers: the grant record shape, the needs sheet, check-issue operator actions.
S2 Which operations may a seat budget for itself? O1 paid model launches on logged-in accounts plus local writes with a proven cleanup; outside live changes, destructive, public, billing, DNS, a new identity or target keep per-leaf approval (recommended). O2 also reversible live changes on throwaway outside targets. O3 everything a grant covers today. Steers: what the standing authority covers, which leaves still need a needs-sheet row.
S3 What form does the never-re-approved limit take? O1 one standing operator-set ceiling on the machine, counted by the machine, in prompted sessions with a per-session time limit (recommended). O2 one ceiling per door session on the needs sheet. O3 no number, seats judge and review audits. Steers: config shape, where counting lives, dollars versus sessions.
S4 At the ceiling, what wins? O1 the budget: stop with one notice, the operator raises the ceiling once (recommended). O2 unblocking: warn and continue. Steers: the only operator stop left.
S5 Who judges "enough proof"? O1 the seat running the proof decides on recorded evidence and the other-model reviewing seat reads that choice; floor: the property was seen green at least once on the current model-facing inputs or the change cannot reach it, and a red caused by product behavior never passes (recommended). O2 same with no floor. O3 fixed run counts. Steers: lifecycle-rules, standing-design fresh-call line, check-issue fresh-run Fixes.
S6 Replace or add? O1 replace: repeat counts and renewal ceremony leave `grants[]` and the prose, one ceiling check comes in (recommended). O2 add an auto-renew layer. Steers: every leaf design; diff must remove more rule text than it adds.

Ranked priorities proposed: (1) no budget blown and no irreversible effect, (2) no per-leaf operator stop, (3) fewer rules than today, (4) proof stops at sufficient evidence.

## Taken

A's picks under full autopilot, 2026-11-22 (signposts: A), never operator words:

- S1 O1 (B,C). Reason: the four watch-consults approvals differ only in the session count; the authority text was copied unchanged four times.
- S2 O1 (B,C). Reason: every stop in the intake was a paid session count; O1 cannot cause a loss its cleanup does not undo.
- S3 O1 (B,C). Reason: subscriptions have no per-call price, so sessions and minutes are the unit; O2 keeps one stop per session; O3 leaves nothing to guard. The numbers are the operator's (Needs N2); A proposes a default only.
- S4 O1 (B). Reason: below the ceiling a raise needs nobody; the ceiling is the single operator stop left and it guards "not blowing any of the budgets".
- S5 O1 (B,C). Reason: standing-design already makes sufficiency the model's choice; the floor stops "failed on budget" from covering a real red. The operator's "If something failed, but there is enough proof already that it will pass, and it only failed because of the budget restraint, then just make it pass" is the case it serves. A wording-only finding never needs a fresh run (operator, watch-consults, 2026-11-22).
- S6 O1 (B,C). Reason: the operator asked to lean toward removing redundancies; O2 keeps every rule that caused the stops.
- Ranking taken as proposed.

Gives up: per-leaf operator review of each paid count, and fixed run counts as proof. Prioritizes: one standing ceiling, seat judgment on recorded evidence, fewer rules.

Session charts: [ai-budgets] only; no drop.

## Needs

- N1 pending: standing authority approval in the operator's own words — paid model launches on the logged-in harness accounts on this host (claude, codex, pi, agy), local writes (session records, trust entries, hc core state, throwaway folders) removed after each run, stop line: no other account or provider, no outside write. Purpose: lets seats launch inside the ceiling without per-leaf grants. Destination: `~/.akrogon/config.yaml` (shape set by the config fork) after the leaf lands. Consuming leaves: none of this chart's (they prove with free checks); it gates activation only. Done: `akrogon config` shows it.
- N2 pending: the ceiling numbers. A's conservative proposal for a one-word yes: at most 20 prompted sessions per day across all repos on this host, each ending within 15 minutes. Purpose: the one budget seats cannot pass. Destination and done as N1.
- Keys: none. Paid budget for charting this chart: none foreseen (B R9, C).
