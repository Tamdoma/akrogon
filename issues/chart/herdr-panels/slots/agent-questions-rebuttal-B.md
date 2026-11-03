# Slot B rebuttal

Evidence date: 2026-11-03. “Installed” is better-than-training evidence; B's recommendations are inferences from it.

- **F1. Click-time revalidation is not a settled delivery guarantee.** B explicitly required P3: the core can wait for typing to pause before pasting, and its API has no expected-turn predicate. A new interaction can occur after the UI check. Restore the send-race probe and its consequence: a proven final-write guard or an explicitly narrowed promise. Installed: `hc schema`, terminal.send; B notes **Q3. How should replies arrive?**, **Required probes before handoff**.

- **F2. The agreed identity/draft rule misattributes B.** B keys records by core/session, terminal, agent instance and request identity. On a new question, disable old Send but preserve the draft for recovery. Do not delete typed notes. Also, publication while working precedes the turn increment on leaving working, so `(terminal, turn)` alone can reject a newly published question. Done-to-idle on viewing must not resolve it. Installed: `hc schema`, Terminal.turn; `/home/ivan/.config/herdr-app/herdr.d.ts:164`; B notes **Q2. How should A6 identify options?**, **Q4. Shortcuts and click behavior?**.

- **F3. B's structured-source position should win for reliable A6.** An explicit reply-key line can itself be quoted or historical. Anchoring a grammar does not establish assistant authorship or current-question identity. Screen fixtures can disprove a parser but cannot supply those missing boundaries. Require an identified producer record, or settle the reduced promise explicitly. Installed: `hc schema`, Terminal/ReadResult; `/home/ivan/.config/herdr-app/herdr.d.ts:209`. This is inference from the exposed data, not a measured universal parser failure.

- **F4. “Only published questions unless blocked” drops B's error rows.** B includes explicitly reported errors, labelled Error with Open terminal, and asks the operator to settle their inclusion. Installed: `hc schema`, Status.state includes error; B notes **Q1. What belongs in Needs-you?**.

- **F5. Explicit Send cannot be both unanimous and bypassed by Ctrl+click.** B rejects the bypass because combined selections and notes need review. B's `elid` shortcut fills an empty draft only and preserves nonempty text. Preserve these distinctions. Operator tier: supplied reply examples include combined answers and notes; B notes **Q4. Shortcuts and click behavior?**.

- **F6. The rendering probe is misattributed.** B proposed testing explicit `agent.focus` followed by an identity/status read and guarded send, not whether rendering `agents()` marks done as viewed. Keep B's P2 as a separate pending operation proof. Installed: `/home/ivan/.config/herdr-app/herdr.d.ts:164`; B notes **Required probes before handoff**, P2.
