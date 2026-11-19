# Design: claude-seats-deny-prompts

## Binding decisions, verbatim

### Signposts (issues/chart/prompt-stalls/forks/signposts.md)

Question, options and challenge check:

1. Tie-breaker.
   - 1a (recommended, A) Remove a prompt class at its source where existing authority allows, so the prompt never appears or turns into a denial the seat can correct (B Q2: correct the command before approving the original), and the watch confirms what is left.
   - 1b Watch confirming only.
   - Steers: #139's route and how much the watch must handle.

2. What counts as delivered (B Q1).
   - 2a (recommended, A,B) A seat in reach never waits on a non-dangerous prompt while the operator is away: every prompt class still able to appear on a supported harness is either removed (proven) or confirmed by the watch (proven). Notification alone does not deliver #135. An outside setting the watch needs to act is a delivery prerequisite (needs row), not a follow-up.
   - 2b Prevention plus notification is enough.
   - Steers: #135's done claim, needs rows, which harnesses the chart claims.

3. Reach.
   - 3a (recommended, A) Agent edits stay in akrogon; a change outside it (Claude Code user settings for the watch session, hc) is exact text the operator applies, as a needs row.
   - 3b Agent edits outside akrogon too.
   - Steers: needs rows, where permission text lives.

4. What the watch may confirm (B D2).
   - 4a (recommended, A,B) A prompt whose exact action the watch read on screen, inside the seat's brief and recorded grants, and outside a dangerous class: destructive outside the leaf's worktree or scratch or with an uncertain target (an unguarded variable path counts as uncertain, B Q2), outward-facing (push, publish, send), paid beyond a grant, credentials, history rewrite. Dangerous or unreadable prompts get one notice and stay. New grants, spend and every decision the operator kept stay operator-only; a row's label alone does not decide it.
   - 4b Anything the watch judges safe.
   - 4c Nothing (today).
   - Steers: the watch skill's Never list and its new confirm rule.

5. Which tabs.
   - 5a (recommended, A) Leaf seats of the watched repo only. Operator-started chart doors stay the operator's: a door's approval rows are operator-only by the chart skill, and a door's own harness prompts are the operator's session's oversight.
   - 5b Seats and chart doors that belong to the watch's delegation (B D1).
   - Steers: watch scope, #135's N11b case.

6. Proof spending (B L2).
   - 6a (recommended, A,B) Free local proofs first (a stub Anthropic API proved interactive claude behavior at cost 0 on 2026-11-16). Support is claimed only for a harness and path with observed detection, permitted answer delivery, resumed work and a durable record. Paid sessions only for what only the real model or classifier shows, under needs row N1.
   - 6b Paid real sessions for every claim.
   - Steers: proofs, grants, the needs sheet.

Reply key: `1a 2a 3a 4a 5a 6a`, or numbered free text.

Challenge check: B flips 5 to 5b (D1): the intake names chart doors and the earlier chart already left them out. A keeps 5a. The one door case in #135 (N11b) was an approval row, which only the operator may answer, so the watch could not answer it under 5b either. Its loss by scroll-away is already handled by the needs-sheet late-find notice (`akrogon notice --attention`) from the chart skill. A watch pressing keys in the operator's own session's oversight prompt is what the classifier denied. B's dissent stands. Hard limits adopted (B L1): no forced delivery (`hc send --force`), no classifier evasion, no blanket future approvals, no answer to an unidentified or stale prompt; re-check terminal identity, the requested action and existing authority immediately before acting; every confirmation leaves a durable record.

Taken:

A's picks under full autopilot (2026-11-16T20:20:00Z, door t126), not operator words: `1a 2a 3a 4a 5a 6a`. The operator's words that handed the round to A, verbatim: "Full autopilot mode, including the signposts."

Reasons: 1a is removing over adding: a prompt that never appears needs no watcher, no outside permission and no judgment at 3 a.m. 2a is the operator's "keep everything moving" taken literally, with B's point that a notice alone leaves the stall. 3a keeps agent edits reviewable in one repo. 4a is the operator's "if it's not that dangerous", with the dangerous classes named so the watch is not inventing them. 5a keeps the operator's own sessions under their own oversight. 6a is speed and price, with B's limit on what a stub proves.

Account: the session removes prompts at their source first, makes the watch confirm only the safe prompts still left on proven harnesses, keeps approvals and the operator's own sessions with the operator, and pays only for what a stub cannot show. It gives up watch confirmation in chart doors and any confirmation the watch cannot prove end to end.

Applies here: 1a (remove at source), 2a (removed with proof for the harnesses in use), 3a (edit in akrogon only), 4a (an uncertain rm target is dangerous, so it is never approved), 5a (leaf seats; door-created consultants share `harnessArgv`, while operator-started doors and the watch session are untouched), 6a (free proofs; none paid). The hard limits apply unchanged.

### Fork stall-removal (issues/chart/prompt-stalls/forks/stall-removal.md), Taken with its final-shape corrections

A's picks under full autopilot (2026-11-16T20:18:00Z, door t126), not operator words.

1. Q1: 1a. `harnessArgv` (src/seat.ts) makes every claude seat run with `permissions.denyInsteadOfPrompting: true` in its single `--settings` object. Reason: it removes the whole class of mid-turn prompts at the source, top level and subagents alike, turning the indefinite wait into a denial whose text names the safe rewrite (P2, P5). It never approves an uncertain removal (signposts 1a, 4a), and a repo test covers it the same way on every machine (3a). Rejected: 1b per machine and untested; 1c guidance that does not stop the class; 1d runs removals whose target may be empty. Side effects accepted: AskUserQuestion (already removed), EnterPlanMode and ExitPlanMode leave the seat's tool list, and MCP elicitation is cancelled. Seats start in bypass mode, never plan mode. The landed `--disallowedTools=AskUserQuestion` stays, untouched (B).
2. Q2: transform the parsed argv. One `--settings <v>` or `--settings=<v>` whose value is a JSON object gets `permissions.denyInsteadOfPrompting` set to true. Every other key is kept, and an explicit false is overridden. One flag is emitted in its original place and spelling. No `--settings` appends `--settings {"permissions":{"denyInsteadOfPrompting":true}}`. A value that is not a JSON object (a file path, malformed JSON, an array), more than one `--settings`, or a bare `--` token in the claude line throws a named error at launch naming the harness and the operand. There is no file read and no temp file. Reason: no silent drop of either setting, and today's line is one inline JSON object (P3, P5). Standing dissent (B D1): take the last of several `--settings` flags rather than refuse. A refuses because claude itself silently ignores the earlier ones, so refusing surfaces the operator's mistake instead of keeping it. Standing dissent (B D2): insert before a template's `--` rather than refuse. A refuses because no line has one and refusing costs one check, while insertion would also move the landed `--disallowedTools` flag.
3. Q3: 3a, with a recorded scope decision (B D3's second route). The completion claim covers mid-turn prompts on seats launched by akrogon for the harnesses repo slots use today: claude (no class left under Q1, P5), codex (`-a never`, `codex --help`) and pi (no permission mode and its only dialog tool excluded, inside the inventory boundary in Findings). Out of the claim, recorded under Off route: startup dialogs (workspace trust, project MCP approval), which neither report describes, which the docs name as outside the setting, and which `firstTask`'s start proof reports as a start that never begins work. Also out of the claim: agy, which no slot uses, and later harness versions. No watch keys, so no classifier rule (N2), no paid proof (N1) and no confirmation journal. The watch's "Answer a seat" stays in Never, and the landed one-notice-per-blocked-episode path stays for anything unforeseen. Reason: signpost 2a holds for every prompt class that can appear mid-turn on a harness in use. A watch confirm path would serve no class that remains (1a, removing over adding). Standing dissent (B D3): the startup classes need removal or a proven consumer before #135 closes. A closes #135 because its two observed seat prompts (a tool permission prompt and AskUserQuestion) are both removed. Its door case (N11b) is excluded by signpost 5a and was an approval row only the operator may answer.

Final-shape check (slots/stall-removal-final-check-B.md), A's corrections 2026-11-16, both adopted as B proposed them. Each narrows a statement or a refusal the picks already make and adds no mechanism, so there is no further check; the leaf review sees them.

- Correction to Findings, pi inventory (B F1). A grep of `~/.pi/agent/extensions` (installed top-level extensions, 2026-11-16) for `ctx.ui.confirm|select|input|custom` finds dialogs in four places. tamdoma-request-user-input is the `request_user_input` tool, the only one a model turn can call, and the machine pi line excludes it. tamdoma-subagents/ui.ts holds the dashboard, steer and worker-settings pickers, all taking `ExtensionCommandContext`, so they are operator commands. tamdoma-context-usage has the `/context` command, and tamdoma-active-shells has the alt+s shortcut. None is reachable from a running turn. Boundary: project-local pi extensions in a consumer repo, which pi's `-a` trusts, are outside the inventory and outside the claim (a stated limit beside agy).
- Correction to Q2 (B F2): inside the settings object, an absent `permissions` becomes a new object holding the key. An existing `permissions` object keeps its other fields. Any other `permissions` value (null, array, string, number, boolean) is refused with the same named launch error.

Exclusions with owners: the watch skill (skills/watch-issues) does not change, and "Answer a seat" stays in its Never list (Q3). implement-issue guidance does not change (Q1 rejected 1c). The machine harness line in `~/.akrogon/config.yaml` does not change and stays the operator's (Q1 rejected 1b). Startup dialogs (workspace trust, project MCP approval), agy, project-local pi extensions and later Claude Code versions are outside this leaf's claim (Q3 and its correction; Off route in CHART.md). The landed blocked-seat notice in src/next.ts is unchanged.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest sufficient test at the `harnessArgv` boundary, the function that builds the real argv from the real machine template. That is a unit test in the repo's existing bun test runner, using the existing fixture helpers the current tests/seat.test.ts already uses. No machinery is built. New behavior shows one deliberate break turning its test red: for example, appending a second `--settings` instead of merging makes criterion 1's single-flag and env-kept checks fail. A criterion's test asserts on the parsed JSON value (keys and values), never on the JSON string's byte form. A test reads the template it builds from the same verbatim copy the existing tests keep, with no hand-copied list from another file. Claude Code's own behavior with the merged flag (deny instead of prompt, in subagents, env kept) is a pre-existing key part, observed at charting (readiness `proofs`, fork Findings P5). No live claude session is part of this leaf's proof, and no paid call is needed. No auth, secrets or backend are touched.

## Leaf architecture

Owned surfaces: `harnessArgv` in src/seat.ts and its tests (today in tests/seat.test.ts). No other source file needs to change.

Literal interface: `harnessArgv(global, config)` keeps its signature and its `{ kind, argv }` result. For `config.harness === 'claude'` the returned argv is the parsed template with the merge applied, followed by `--disallowedTools=AskUserQuestion` as today. The merge works on the parsed argv elements produced by `parse(line)` (shell-quote), never on the template string. The settings value written back is `JSON.stringify` of the merged object, as one argv element. It is not shell-quoted, since argv goes to `hc run` as an array. The key path is exactly `permissions.denyInsteadOfPrompting` with the boolean `true`. With no `--settings` in the template, the pair `--settings`, `{"permissions":{"denyInsteadOfPrompting":true}}` goes after the template elements and before the AskUserQuestion suffix (A,B). Inside the settings object, an absent `permissions` becomes `{ denyInsteadOfPrompting: true }`, and an existing `permissions` object keeps its other fields.

Refusals (criterion 4): a claude argv throws before any terminal starts when any of these holds. The element after `--settings` is missing. The value of either spelling does not `JSON.parse` to a plain object. The object's `permissions` is present but not a plain object. More than one element is `--settings` or starts with `--settings=`. Any element is exactly `--`. The message names the harness (`claude`) and the offending operand. Validate the parsed JSON with a zod schema at this boundary (a plain object whose `permissions`, when present, is a plain object), since the template is external data.

Consumers of the changed argv, both through `harnessArgv`: `startSeat` (leaf seats, src/seat.ts) and `startConsultant` (door-created consultants, src/seat.ts). Both append the task after `harness.argv`. Order relies on this: the merged `--settings` stays where the template put it, and the task stays last.

State or precondition changed: a claude harness line with a second `--settings`, a file-path `--settings`, a non-object `permissions` or a `--` now refuses at launch. Today's machine line (one inline JSON object without `permissions`, no `--`) is unaffected. Open for the plan: how a throw from `harnessArgv` surfaces in an `akrogon next` dispatch and in `akrogon seat`, compared with the existing "Missing harness template" throw in the same function, and whether the existing path already reports it to the operator without retry loops. Reuse that path. Add no new handling unless the plan finds it swallowed.

Open for the plan: whether to throw a named error class (src/ already defines several, such as `SeatIndexError` in src/config.ts) or a plain `Error` like the existing missing-template throw. Follow the file's existing style unless a consumer distinguishes them.

Stated limits: this proves argv construction. That Claude Code 2.1.325 honors the merged key in interactive sessions and subagents is the charting proof's (readiness `proofs`). A later Claude Code that drops or renames the key would bring the prompt back with no akrogon change, and this leaf does not detect that.
