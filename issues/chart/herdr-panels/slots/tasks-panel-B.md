# Slot B: Tasks panel

Evidence date: 2026-11-03. Probes below are pending. This is a read-only panel: no start, stop, pause, retry, pack, merge or Git mutations are added.

## Q1. Rows and grouping

**D1. Pick:** group by repository, retain epic/issue hierarchy within it, and use compact two-line leaf rows. Show slug, exact phase, required/pending seats or command-owned landing, current phase age, dependency/wait label and any attention badges. Expand a row's details to expose attempts, verdicts, delivery errors, failures, source paths and history. Give paused a repo-header badge, stopped a leaf badge, and missing inputs their names plus the existing resolution instructions. Keep failed and broadcast-pending leaves visible, including merged leaves that still need broadcast.

Within each repo, show its producer-ordered merge queue with holder/place and “no merge record.” Keep the full-check admission line separately labelled: it is not the merge queue. Global deployment failure belongs above repo groups. Preserve unreadable-path errors and Unpacked notices with their existing suggested commands as text. Retained-path notices belong in selected-leaf details, matching targeted status. Slow-merge episodes are repo alerts, not evidence that every current merge leaf is slow.

**Rejected:** phase columns across the fleet, which lose repo/owner context and consume narrow-panel width. Attention-only filtering, which hides progressing and deliberately paused work. One “health” color that conflates failure, stop, input gaps and dependency waiting. A generic operation toolbar would expand this fork.

**Evidence:** operator tier: intake **Round 1** requires parity with status; **Round 2** keeps existing interfaces intact. Better-than-training: `src/status.ts:144`, `:222`, `:485`, `:522`, `:541`, `:578`; `src/turn.ts:105` defines queue order; `src/state.ts:115` defines broadcast pending. Measured: global `akrogon status` outside a repo printed 11 empty repos, Unpacked notices and lingua-relay's persisted slow-merge episode. `akrogon status curl-komentari` in lingua-relay printed closed state, retained paths, history and next-start seat configuration.

**Pitfalls removed:** JSON must expose every status category rather than flattening NOTE into one string. Use canonical queue/routing/control logic in the producer. **P1** must cover populated and partially unreadable fleets because today's empty fleet cannot verify this UI. Command-owned merge work and broadcast-only B dispatch need explicit producer roles, not a phase-to-seat table copied into JS (`src/next.ts:1279`).

**Additional question:** does “everything status shows” include the optional `--charts` view? My proposed scope covers the default overview and leaf detail. A chart board needs an explicit answer.

## Q2. Taking too long

**D2. Pick:** all timing meaning and overdue judgments belong in akrogon. Display phase wall age and total leaf elapsed separately. Keep the existing slow-merge judgment unchanged as a distinct alert. For the requested phase redness, recommend an explicitly approved same-repo, same-phase baseline of the last 20 completed, comparable visits, requiring at least five. Reuse the existing comparison policy: elapsed exceeds 1.5 times normal and exceeds normal by at least two minutes. This is a proposed new phase policy, not an existing akrogon capability.

Compare equivalent clocks only. Prefer recorded time with pause/prerequisite/parked/merge-turn waits removed, using the existing timing report's accounting. Call that “recorded active time,” not CPU time. Missing/incomplete measurements mean “normal unavailable,” with neutral color. Suppress overdue claims while paused, stopped or waiting. Historical stopped intervals are not represented in the inspected timing schema, so do not claim those have been subtracted. **P2** must establish a defensible eligible population before enabling phase redness. Cost: a repo/phase can have no usable baseline, and the operator must approve the metric and thresholds.

**Rejected:** UI-side medians and hardcoded per-phase limits, because they create a second lifecycle policy. Applying `decideSlow` directly to live phase age, because it measures completed merge verification runs. Calling the current TIME column phase age: it starts at the first delivered prompt for the leaf. Substituting created date for a missing phase entry would present a different clock as fact.

**Evidence:** better-than-training: `src/status.ts:134`, `:197`; `src/timing.ts:25`, `:94`; `src/timing-report.ts:53`, `:91`, `:126`; `src/verify.ts:171`, `:177`, `:367`. `src/stop.ts:18` stores current stop membership, while the timing schema has no stop/start event. The proposed sample/threshold policy borrows the existing verify policy's constants but changes its population and therefore requires a separate decision.

**Pitfalls removed:** identify current phase visit, including revisits. Expose clock provenance, baseline sample count and unavailable reason. Exclude failed/incomplete visits and avoid mixing seat-driven and command-owned merge timings. The panel only formats producer values. Refresh the snapshot at a bounded interval while visible so a long-running job can become overdue without a filesystem change.

**Additional question:** approve this comparable-history policy, or show age without general phase redness until a meaningful baseline is defined? Existing slow-merge alerts remain available either way.

## Q3. Row click before and after the port

**D3. Pick:** today a row opens its detail in Tasks and explains that its execution target uses old herdr. Do not launch or control old herdr from this panel. After the port, a row with exactly one relevant live local seat focuses that explicit terminal through `agent.focus`. Multiple relevant seats open the detail with separate A/B targets. No live local target opens details with the reason: legacy, another session, stopped, missing or recovered shell. Command-owned landing has details rather than a fabricated agent target. Cost: global visibility does not imply global terminal jumping, and some rows take another click to select a seat.

**Rejected:** cwd/tab-title matching, bare old pane IDs as hc addresses, automatically picking A when B is also active, and opening another session implicitly. Clicking a snapshot must not create/restart execution.

**Evidence:** operator tier: migration intake **How I picture it**, **Open questions** leaves session/slot storage unresolved; current brief locks session-local terminal visibility. Better-than-training: `src/state.ts:95`; `/home/ivan/.config/herdr-app/herdr.d.ts:64`, `:209`. Measured targeted status returned old IDs `w2:t44`, `w2:p8V`, `w2:p8W` for curl-komentari.

**Pitfalls removed:** the producer carries backend/core/session and semantic repo/leaf/seat identity. The mod joins that with live terminal facts and Program icons, validates the foreground agent and revalidates on click. A recovered shell is not a leaf seat merely because its address survives. **P3** must prove two-seat selection, duplicate slugs across repos, recovery and another-session targets after the port. Before it, unavailable navigation is correct behavior, not navigation completion.

**Additional question:** confirm local-session jumps only. Cross-window activation would reopen the migration's unresolved session decision.

## Q4. Default panel

**D4. Pick:** Tasks is the initial panel for a space with no saved panel choice. Preserve every explicit choice thereafter, including closed, Files, Changes and Needs you. Do not force Tasks on focus, refresh, restart or installation. This interprets the original “shown by default” request without repeatedly taking space from the terminal. Cost: existing spaces with a saved choice do not automatically display Tasks.

Keep existing Files/Changes buttons and behavior. A personal tabs clone adds the agreed buttons and initialization policy; it does not redesign the tab bar. Add the Tasks mod to flat's existing panel stack. One integration owner coordinates herdr-setup wiring with akrogon's separately shipped mod.

**Rejected:** “flat is default” as proof Tasks opens by default, changing only stack.active, and overwriting remembered closed panels. The shipped tabs mod explicitly restores panel state and has hardcoded Files/Changes buttons.

**Evidence:** operator tier: intake **Agent findings**, A4 requests Tasks shown by default; **Default layout** selects flat everywhere; **Round 2** preserves existing interfaces. Better-than-training: `/home/ivan/.config/herdr-app/mods/tabs/main.js:17`, `:22`, `:28`, `:80`, `:97`; `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:123` currently starts with a hidden panel and Files active.

**Pitfalls removed:** distinguish absent memory from an explicit closed value. **P4** must prove whether cloning preserves or changes the original mod's localStorage identity and migrate existing panel choices if necessary. Verify current, newly created and subsequently visited spaces across all named sessions. Initialize enabled panels in every session, not only the main home's shared.json. Do not expose Tasks before its mod is installed.

**Additional question:** should existing spaces with no recoverable choice also get Tasks once? My pick treats those as first use, but preserves all recoverable explicit choices.

## Q5. Fleet scope and JSON contract

**D5. Pick:** show every registered repo, current space's matching repo first, then stable alphabetical order. Keep empty repos compact. Match the current space by a producer-supplied canonical checkout/root identity, including linked worktrees; do not infer a repo from its displayed name. Other repos remain visible when the current space is unrelated.

Make fleet scope explicit. Today status inside a registered repo shows only that repo. I recommend an explicit `--all` scope selector shared by text and JSON, with the panel calling `akrogon status --all --json`; this is an additional CLI contract to settle, not an existing flag. Cost: one scope flag. It avoids making JSON formatting silently change scope or relying on an accidental inherited cwd.

**Proposed field list, grouped by purpose:**

- **J1. Envelope:** schema version, generated/as-of timestamp, explicit scope, complete/partial result, structured errors/warnings, and relevant watch roots. JSON-only stdout, diagnostic stderr. A partial scan can retain the CLI's nonzero exit while returning a valid partial envelope.
- **J2. Repositories:** stable registry key, canonical root and checkout identities for space matching, pause state, scan status/errors, ordered owner groups, compact empty state, parked owners and Unpacked notices with suggested command arguments.
- **J3. Leaf overview:** composite repo/slug identity, leaf/plan paths and owner hierarchy, phase/current visit, total elapsed and phase-clock facts with provenance, blockers with resolved labels, stopped/failed state and reason, attempts/fix rounds/verdicts, completion/prompt-delivery facts, and explicit required/pending actors. Include worktree and next-start seats/config sources without claiming those describe the currently running harness.
- **J4. Scheduling:** per-repo merge queue in canonical order, holder/place/no-record marker, command-owned landing state and liveness; separate full-check admission rows with repo/leaf/check/run/state/since/position. Preserve producer eligibility reasons instead of recomputing them in JS.
- **J5. Attention/completion:** missing input kind/name/holder/resolution steps, delivery failures, broadcast-pending metadata, global deployment attempted/active revision/failed step/error, slow-merge episode facts, and bounded recent successful merges. The latter is original A4 scope even though current overview does not list recent merges.
- **J6. Selected-leaf detail:** the structured counterpart of targeted status: state facts, last ten transitions, retained paths/reasons, plan path, next-start seat configurations and sources, broadcast and landing details. Fetch through `status <slug> --json` in the identified repo rather than sending every leaf's history on every fleet refresh. Never key detail requests by slug alone.
- **J7. Timing/navigation:** timing availability/reason, baseline population/count/normal/threshold and assessment timestamp; discriminated legacy/unavailable/hc target records with core/session/terminal and semantic seat identity. The live mod supplies Program icons from validated terminals.

**Rejected:** a bare array of state.yaml contents, JSON wrapping the rendered text table, dropping unreadable repos, parsing raw logs/config in the mod, or placing full timing ledgers and transcripts in the snapshot. No environment values are required.

**Evidence:** better-than-training: `src/status.ts:68`, `:466`, `:506`, `:578`; `src/state.ts:81`; `src/routing.ts:49`; `src/turn.ts:105`; `src/admission.ts:122`; `src/akrogon.ts:46` accepts only the charts flag today. Measured: the same status command showed one repo from akrogon's cwd and all 11 from `/tmp`. Targeted status exposed more detail than the overview. All evidence is local primary code/output, so no external searches were needed.

**Pitfalls removed:** parse the JSON schema once at the mod boundary. Refresh on panel open, relevant watch events and a bounded visible timer, coalescing saves and preventing overlapping scans. Watch metadata changes for registry, pause/stop and admission as well as repo issues. A failure must show stale/unavailable with its reason, not an empty healthy fleet. Surface producer timing-read warnings: `src/timing.ts:82` currently warns and returns an empty list on read failure, which must not be mistaken for valid timing data. **P1/P5** verify parity, error handling, scope and size/runtime limits.

**Additional question:** agree the explicit all-repo scope flag and a bound for recent merges. Neither cwd scope nor the history window should be chosen silently.

## Required probes before handoff

- **P1. Status parity:** build read-only fixtures from existing status tests covering nested owners, paused/stopped/failed/merged-pending-broadcast leaves, missing readiness, prompt errors, Unpacked/retained notices, deploy failure, slow episodes, merge order and full-check admission. Pass: JSON preserves the facts text/detail status exposes, partial failures retain healthy repos, and snapshot generation writes nothing. Relevant existing coverage: `tests/status.test.ts:104`, `:355`, `:491`, `:805`, `:929`, `:1088`, `:1179`; `tests/pause-status.test.ts:31`.
- **P2. Timing audit:** reconstruct representative current/completed/revisited phases from existing logs and timings, including missing records, pauses, waits, stop/resume and seatless merges. Pass: phase/leaf clocks are distinct, missing data stays explicit, and baseline eligibility can be defended. If stopped intervals cannot be accounted for, do not claim complete active-time accounting or enable redness on that premise.
- **P3. Navigation contract:** before port-dependent navigation handoff, demonstrate semantic identity for two seats, two repos sharing a slug, restart/recovered shell and a target in another session. Pass: focus reaches only the intended live local seat and unavailable cases never guess. This probe does not require an old-herdr adapter.
- **P4. Panel memory/install:** in disposable copies of main/infra/personal/mdconsultingny app homes, cover saved Files, Changes and closed choices, no memory, fresh spaces, revisits and restart with the tabs clone. Pass: Tasks defaults only where agreed, existing controls keep their behavior and every session resolves the shipped Tasks mod.
- **P5. Producer-to-mod operation:** measure representative global and detail JSON generation, invoke it through the real mod `exec` path, then exercise registry/control/leaf/admission changes and a failed refresh. Pass: output fits the installed exec bridge's 30-second/8-MiB limits, updates arrive without overlapping scans, and the populated narrow flat panel shows actionable errors and timing labels. Verify with `herdr-app check` and actual in-app interaction. Installed limits: `/home/ivan/.config/herdr-app/herdr.d.ts:10`.
