# Slot B: agent questions

All evidence below was read or supplied on 2026-11-03. Probes are pending. I ran no experiment that types into a terminal or changes agent state.

## Q1. What belongs in Needs-you?

**D1. Pick:** include reported blocked states and identified, unresolved prose questions from idle/done agents. Also show an explicitly reported error as an error, with Open terminal. A finished task alone stays in Agents. The row shows Program icon, agent/tab identity, attention kind and an exact question summary when a producer supplies one. Otherwise show the reported message, labelled as status, with an expandable screen excerpt and its completeness. Cost: unsupported harnesses cannot promise complete prose-question coverage.

**Rejected:** all done/idle agents, because completion is not a question. Blocked-only, because prose questions commonly end a turn normally. Scraping every terminal to decide who needs attention, because screens do not identify question ownership or resolution.

**Evidence:** operator tier: intake **Agent findings**, A5 requests a list only when an agent waits. Better-than-training: `/home/ivan/.config/herdr-app/herdr.d.ts:164` defines done as unseen completion; `:209` exposes reports separately from normalized status. Installed `hc schema`, Status/ReadResult, distinguishes blocked kind from possibly incomplete screen text. The operator's exact prose cannot be reconstructed from a short status field.

**Pitfalls removed:** viewing a done agent must not clear its pending question. Key the question by request identity and clear it on producer resolution or validated lifecycle change. Unknown blocked kind opens the native terminal rather than guessing a permission/question type. **P1** must prove that distinction across supported harnesses.

**Additional question:** are errors and native permission/auth requests part of this same list? My pick includes them with distinct labels and native controls.

## Q2. How should A6 identify options?

**D2. Pick:** a structured pending-question record emitted alongside the normal question. Include core/session, terminal, agent instance, request identity, exact question, groups, labels, reply tokens, selection rules and explicit recommendations. Validate the record once at its boundary. This is reliable for emitted records, not proof that every agent always emits one. Cost: producer integration and lifecycle tests for each supported harness, plus operator agreement to that contract.

For this local implementation, use atomic JSON files under a dedicated per-core question directory, consumed through `readTextFile`/`watchFolder`. A small publisher owns schema validation and atomic replacement. Do not store these in project repositories or akrogon state. This chooses an already-exposed mod interface instead of adding a core-protocol bridge.

**Rejected:** parsing the chart's trailing reply instruction or coded bullets, because the same text can be quoted, historical or still rendering. Harness transcript parsers, because each adds role/session mapping and format maintenance. Using `hc doc.get/set` immediately: versioned documents are suitable storage, but the installed mod API exposes CLI execution, not document RPC/subscriptions, and the installed CLI has no documented doc command. Their existence does not prove an end-to-end producer-to-mod path.

**Evidence:** operator tier: intake **Agent findings** records several reply styles. Better-than-training: chart questions asset **Operator questions and peer exchange** defines prose formatting, not machine identity. Installed `hc schema`, Terminal/ReadResult/doc.get/doc.set/events.subscribe, supplies no message-role or choices model. `/home/ivan/.config/herdr-app/herdr.d.ts:13`, `:16`, `:397` establish program execution, the CLI wrapper and folder watching. No external searches were needed for these installed-interface findings.

**Pitfalls removed:** **P1** must settle publication versus status timing. Core `turn` increments when status *leaves* working, so an agent publishing while working cannot simply stamp its current turn and expect equality after completion. Require a producer lifecycle contract proven against that sequence. Ignore stale records after recovery/exit or a new interaction. A malformed record produces a visible source error, not inferred buttons. Acceptance cases include quoted codes, wrapped/partial output, multiple groups and two simultaneous questions.

**Additional question:** will the operator accept producer integration for all day-one harnesses? Without it, narrow A6 to manually entered replies rather than claim reliable automatic detection.

## Q3. How should replies arrive?

**D3. Pick:** idle prose uses explicit Send and `hc send --json --if idle`, bound to the exact request and terminal. For done, explicitly focus that terminal on Send, then re-read its identity/status/turn and use the idle path only if the question remains current. This intentionally reveals the recipient. Blocked permission/auth and unproven native question menus use Open terminal. A reported blocked question gets inline text sending only after its harness probe proves ordinary text plus Enter is correct. Cost: some answers require native interaction, and the full stale-question guarantee needs more than the current send API.

**Rejected:** unconditional sends to done, because they have no idle guard. Always `--force`, because that can answer approval menus incorrectly. `--raw`, because the installed CLI has no such flag. Retrying on `started:false` or an ambiguous error, because the text may already have arrived.

**Evidence:** better-than-training: installed `hc send --help` and `hc schema`, terminal.send/SendResult. `if` accepts only idle/working. The send waits for typing to pause, has no expected-turn parameter and reports whether working was observed, not whether the intended question was answered. `/home/ivan/.config/herdr-app/herdr.d.ts:164` documents done-to-idle on viewing; manual **Commands** provides explicit terminal focus.

**Pitfalls removed:** **P2** must prove done-to-idle through explicit focus. **P3** must test status/turn changes during the send's quiet wait. A preflight check is not atomic with paste. If the current core allows a stale reply after a new turn, require a core send predicate checked immediately before paste for expected turn and agent instance, or obtain an explicit narrower scope. Do not claim exact-question delivery from client revalidation alone. Preserve the draft on errors, disable duplicate submissions and display the returned send state without calling it an answer acknowledgment.

**Additional question:** is briefly focusing the recipient on Send acceptable? If replies must preserve focus, done handling needs a different proven core capability.

## Q4. Shortcuts and click behavior?

**D4. Pick:** option clicks build an editable draft. Single-choice groups replace their selected token, multiple-choice groups toggle tokens, and free-text notes remain editable. Only Send submits. Add one `elid` shortcut that fills an empty draft with the literal alias. Leave a nonempty draft untouched. Cost: one extra control and a separate Send click.

**Rejected:** click-to-send, because it prevents combined answers and notes. Bulk “all recommended” initially, because recommendation coverage and bulk-selection intent are not settled. Inferring recommendations from words in terminal text, because the producer should state them explicitly.

**Evidence:** operator tier: brief's supplied prompt history records 263 `elid` uses and combined answers with notes. Intake **Agent findings**, A6 requests building a combined answer. Better-than-training: questions asset **Operator questions and peer exchange** explicitly permits free-text answers. These support an editable draft rather than a token-only reply.

**Pitfalls removed:** bind each draft to request identity, never current focus alone. A changed question disables its old Send and preserves text for recovery without attaching it to the new question. **P4** must prove group selection, note preservation, focus switching and new-question invalidation. Do not parse and reformat arbitrary manually edited prose to enforce group rules.

**Additional question:** does the operator want a bulk recommendation shortcut? If yes, use explicit producer recommendations and define whether it replaces existing selections.

## Required probes before handoff

- **P1. Source/lifecycle:** in disposable Claude, Codex, pi and Antigravity sessions, emit one prose question, coded question, native permission/auth request and ordinary completion. Observe `hc get --json`, passive `hc read --json --lines 0`, producer records and mod updates. Include publication while working, done-to-idle, resolution and recovery. Pass: exact pending questions survive viewing, completed tasks do not enter Needs-you, and stale/quoted options never activate.
- **P2. Done delivery:** in a disposable session, focus an identified done terminal using `agent.focus`, re-read it, then submit one test reply with `--if idle`. Pass: intended terminal becomes idle, request identity stays current and the harness receives the intended text once. Run only with A's explicit test authorization.
- **P3. Send race/native controls:** in disposable sessions, exercise working/new-turn/recovery and human typing during send's quiet wait. Test each supported native question separately. Pass: stale replies are refused before paste and no text is routed into an unintended approval control. The current schema does not establish that result. Record any required core change before implementation handoff.
- **P4. Actual mod path:** publish/update/resolve two question files in one running session and one in another, then exercise drafts, focus changes and file errors. Pass: each window shows its own core's records, watches deliver updates without polling, drafts preserve notes and errors remain visible. Also pass `herdr-app check` and inspect the flat layout at narrow width with theme tokens and Program icons.
