Blind notes B: door-address
Sources below read 2026-11-16. No other seat's door-address notes read.

Q1. Address source
Pick: the door's own HC_TERMINAL_ID at each use. Call herdr-consultant-column "$HC_TERMINAL_ID" ..., --save "$HC_TERMINAL_ID" ... and --restart "$HC_TERMINAL_ID" ... from the door's shell. When writing a brief through file tools, read printenv HC_TERMINAL_ID in that pass and embed its resolved literal as the report destination. Resolve again for a new use after a restart/continuation. Treat summaries and seats.yaml as history, never routing authority. Apply the same rule to A's transcript lookup, handover Mode address, door-reset.ts argument and the handover start prompt. Cost: a small instruction correction across the existing address-use rules, with no registry or new helper.

Rejected: recorded address checked against the environment, because the environment already supplies the usable value and the comparison adds state without improving routing. Address from tab title/layout, because those represent presentation and can change. Address from the last incoming hc message, because it belongs to the sender.

Evidence: operator tier, INTAKE Source #138, observed 2026-11-16: live t1xr, stale t1tm, layout fixed by using t1xr, report briefs still targeted t1tm. Better-than-training tier, chart-issues SKILL.md Open already defines being inside hc using HC_TERMINAL_ID and hc get, but column/restart/record rules use an unspecified door address. questions.md Blind peer exchange requires each brief's report step to name that address. assets/handover.md similarly passes an explicit A address to its helper. None names summaries as authoritative.

Pitfalls/removal: never write literal "$HC_TERMINAL_ID" as the consultant's hc send destination. In the consultant's shell it expands to the consultant itself. Freeze the value read from A into that finished brief. Likewise, door-reset.ts runs in a new hc helper terminal, so preserve its explicit target argument resolved by A before helper launch. Reading the helper's own environment would target the helper. Do not edit a brief during its active exchange. Complete outgoing exchanges before the handover as existing rules require.

Missing questions: does this change allow a new terminal to consume an old handover prompt? No. Keep SKILL.md Handover's exact target/mode/transcript checks. A prompt addressed to a different terminal must still fail continuation. Does stale seats.yaml need rewriting? Do not rewrite history. Existing Open already appends a new A record when address/transcript changes, and this fix makes the new lookup use the live address. Do not add an address registry or broaden the change to herdr-setup.

Q2. Tabless rule
Pick: keep the harmless tabless-live-door behavior, but define its precondition explicitly: the helper was invoked with the door's current HC_TERMINAL_ID, within the existing inside-hc contract. Then log the helper's tabless result once and continue. This removes the stale-address case at the caller without changing the external helper or adding another guard. Cost: no promise that an operator-started door always has a tab.

Rejected: make every “door not in a tab” fatal, because a live tabless door can still collect consultant work. Continue after the same message for a recorded or unverified historical address, because #138 proves that can lose both layout and report delivery. Infer a replacement address after the error, because routing should already be explicit before any consultant launch.

Evidence: operator tier, #138's helper failure and wrong report destination. Better-than-training tier, SKILL.md Open already checks hc get "$HC_TERMINAL_ID" for being inside hc, and permits the tabless result. The defect is the unspecified address provenance across its later calls, not a demonstrated defect in the helper's layout algorithm.

Pitfalls/removal: command failures other than the existing tabless case keep their current reporting behavior. Do not claim current doors adopt changed skill text immediately: the fork Carries states it reaches doors at the next release link. Do not weaken existing handover identity or operator-input cancellation checks. Tests should judge that calls/report destinations resolve to the live address despite a stale summary, rather than require one exact prose sentence.

Missing question: what if A changes terminals while consultant work is already outstanding? This report establishes stale routing on a later pass, not live migration of in-flight report destinations. Existing handover collects exchanges before reset. Keep arbitrary mid-exchange terminal migration as a stated limit rather than adding forwarding or mutating active briefs.
