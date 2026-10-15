# Slot B: turn-end signal notes

Read-only investigation, 2026-10-15. No peer was prompted, stopped, replaced or focused. No other slot's return was read. Herdr skill used for read-only inspection. Akrogon source references below are relative to `/home/ivan/Work/infra/akrogon/`. `H` means `/home/ivan/Work/infra/herdrdev/herdr/`.

## Q1. Scope and evidence for current harnesses

**D1. Exclude agy-specific integration work from this delivery. Keep the generic false-end problem in scope, but do not claim a reproduced current Codex/pi incident.** `akrogon config` now lists claude, codex and pi only, as the brief says. That removes the currently requested agy seat, not support for all future or manually supplied harnesses: installed Herdr still lists agy among its supported kinds, and peer-wait reads the live agent kind directly rather than checking akrogon's harness config (peer-wait.ts:94–108).

The practical remaining outcome is: a screen-derived idle/done state must not by itself prove that a missing peer answer will never arrive. The tradeoff is extra waiting where no trustworthy turn-end evidence exists. No agy parser or upstream Herdr agy patch is needed to achieve that generic behavior.

**E1. Tier 1, supplied incident.** INTAKE.md and learnings/history/2026-10-15-peer-wait-antigravity-idle.md describe two false failures for agy, followed by a complete 69 KB return. They explicitly say Codex did not hit that incident. The brief reports every current Codex/pi exchange returned done, with no failure. I found no supplied record showing current Codex or pi becoming idle inside a still-open turn because of long tools, silent thinking or subagents. A manifest's susceptibility is not a recorded reproduction.

**E2. Tier 3, Codex detection actually in use.** `herdr agent explain w8:pNQ --json` reports the local override `/home/ivan/.config/herdr/agent-detection/codex.toml`, version 2026.08.28.1, shadowing cached remote version 2026.10.11.1. It reports `screen_detection_skipped: false` and matches `osc_title_working`. The live override's :14–20 detects a braille spinner in the OSC title, :70–77 also detects the visible Working/esc-to-interrupt text, and :79–89 calls any other nonempty title idle unless it contains the spinner or Action Required. Those rules classify presentation, not root-turn completion or outstanding children. The bundled manifest at H/src/detect/manifests/codex.toml is not the effective manifest on this host.

The installed `/home/ivan/.codex/herdr-agent-state.sh:15–17,51–53,78–81` handles SessionStart/session identity only. It does not publish working/idle lifecycle state. Herdr's full-lifecycle authority list at H/src/detect/mod.rs:283–292 includes pi and excludes codex. Thus an installed Codex integration does not make its idle status authoritative turn-end evidence.

**E3. Tier 3, pi detection actually in use.** `herdr agent explain w8:pPY --json` reports `screen_detection_skipped: true` with `full_lifecycle_hook_authority`, no evaluated screen rules, and working. `herdr integration status` identifies the installed pi hook as v9 at `/home/ivan/.pi/agent/extensions/herdr-agent-state.ts`. That live file, rather than the older bundled asset, is the useful source: :229–240 limits reporting to the TUI root and restores active state from `ctx.isIdle()` after reload; :243–250 publishes working on agent_start; :253–259 publishes idle only on agent_settled when `ctx.isIdle() === true`. :191–198 keeps working while agentActive is true, except an explicit blocked request. This is stronger evidence than the bundled pi manifest's Working... string (H/src/detect/manifests/pi.toml:7–13). Long tools or silent screen output alone do not clear agentActive. Detached child work that the root has already settled while leaving unfinished is a different contract; this hook is not a universal detached-subagent counter.

**E4. Tier 3, a real Codex turn-end record exists.** I inspected lifecycle metadata only from this slot's rollout, `/home/ivan/.codex/sessions/2026/10/15/rollout-2026-10-15T17-28-58-01a1402e-4c09-7ba1-8e9b-cdd7b70dff76.jsonl`. At the read there were 19 task_started and 18 task_complete events. Lines 1082 and 1170 pair the prior leaf-review turn's start/end with turn_id `01a14144-1907-72c3-9dda-a3b8cd27fcb5`. Line 1172 starts this investigation's still-open turn, `01a14151-abd3-7852-9616-8713175d7b30`. These events carry turn_id/root_turn_id. This proves the installed harness emits usable start/end metadata. It does not prove the handling of abort, truncated writes, session replacement or every subagent mode.

**E5. Tier 1 historical Codex incident, different cause.** issues/chart/peer-wait/INTAKE.md:18–22 records an idle match immediately after prompting and a separate harness wait timeout in September. :42–44 attributes those to missing start confirmation and unbounded waits. Today's peer-ask.ts:21 guards the start with `--wait --until working --timeout 5000`. Do not relabel that older incident as proof that current Codex becomes idle midway through a confirmed turn.

**Rejected:** an agy-only patch leaves the same generic assumption for new screen-detected harnesses. Declaring Codex/pi currently broken overstates the evidence. Declaring the whole defect impossible because agy is unconfigured overstates what config and screen detection guarantee.

## Q2. What to do on idle without a return

**D2. Pick (b): use affirmative end evidence where proven, and treat its absence as unknown rather than ended.** Keep existing Claude behavior in scope as the already-supported case. For pi, only trust idle/done as a turn-end signal when the current peer is the same session and Herdr confirms the active full-lifecycle hook authority. For Codex, use the matching root task_complete after the dispatched task_started, not the last completion anywhere in the session. For another harness or unavailable end evidence, wait within the existing budget instead of inventing failure from idle. This choice needs the specific proof cases in Q4 before handoff.

Keep the existing non-timeout Herdr error, blocked, return-file and budget behavior. A nonempty fresh return remains successful even while the peer is still working, as already covered by peer-wait.ts:178–179 and tests/peer-wait.test.ts:94–98. Do not add an extra mandatory end-of-turn wait after the artifact exists.

| Option | Benefit | What it breaks or invites |
|---|---|---|
| **O1. Never fail on non-Claude idle/done, only wait out each budget** | Small generic change. Does not turn a presentation lull into failure. No transcript adapters. | A living peer that really finished without its file can wait forever across repeated budgets. questions.md:46 requires immediate reruns after budget, so the cost is not necessarily “one budget.” pi's useful end signal is discarded. |
| **O2. Proven end evidence per harness — pick** | Separates an open root turn from a finished missing-answer turn and preserves prompt failure reporting. pi can reuse Herdr's existing hook authority instead of parsing pi transcripts. | Adds version-sensitive metadata parsing for Codex and identity/correlation requirements. An unproven new harness must remain unknown, not fall through to false. Missing or delayed events may keep waiting. |
| **O3. Continue the universal ten-second idle/done failure** | Bounded detection of a finished missing-answer peer without extra metadata. | Still treats screen classification as proof of a completed task. Existing agy incident demonstrates the failure class. Ten seconds of the same guess does not strengthen the source of the signal. |
| **O4. Fix agy detection upstream now** | Could improve agy's presentation status. | agy is not the current seat. Upstream Herdr work was outside the prior peer-wait chart (issues/chart/peer-wait/CHART.md:15), and screen patterns still would not establish a portable root-turn contract. |

**R1. Previous-turn completion mistaken for this answer.** peer-wait currently snapshots only kind/session once (:156), after peer-ask's prompt confirmation. A transcript adapter must identify the task associated with this dispatch, including a start that may not yet be flushed when polling begins. A prior task_complete is insufficient. Bind the expected session and task across the prompt/wait handoff rather than relying on “last event is complete.” If a shared dispatch record is proposed, spell out its lifetime and replay behavior before leaf writing.

**R2. Session replacement inside a wait.** readPeerAgent currently runs once, while a pane ID can host another process/session later. Check identity again before an end verdict, using metadata returned by agent wait/get. A changed session must be an explicit identity error or separately authorized replacement, not an automatic declaration that the old turn ended or a switch to the new transcript. The return path must remain unique for the exchange. Do not re-prompt automatically.

**R3. Missing evidence turned into a negative boolean.** `turnOpen` currently returns false for every non-Claude kind (:130–133). Model open/ended/unknown separately in the proposed contract. Missing task events, an unrecognized kind or absent hook authority must not silently become “ended.” Genuine I/O/Herdr errors must retain useful diagnostics rather than success-shaped outcomes.

**R4. An endless sequence of budgets.** Budget is only a per-invocation timeout, not a total exchange deadline. Preserve that distinction in the operator's choice. Unknown state can still wait indefinitely under the existing door rule. Do not silently invent a total timeout in the leaf. A real exited/replaced peer or Herdr error can end the wait independently.

**Question not yet settled:** how does the selected Codex adapter bind its task_started to this specific dispatch across peer-ask and a later manual peer-wait rerun? The observed event fields exist, but the current three-argument peer-wait interface carries no turn identity. That mechanism should be fixed before an implementer is asked to promise accurate end detection.

## Q3. `done` is not process exit

**D3. Do not make done fail while equivalent idle keeps waiting. They are the same underlying state with a UI-seen flag.** H/src/app/agent_view.rs:391–404 maps `(Idle, false)` to Done and `(Idle, true)` to Idle. H/src/app/api_helpers.rs:104–105 has the same mapping. The installed Herdr skill explicitly documents this. Merely focusing a tab must not change whether peer-wait declares an unfinished answer failed.

A process exit can produce an idle transition, but the converse is false. H/src/pane/agent_detection.rs:303–312 maps an observed exit to internal Idle; H/src/pane.rs:800–806 allows exit handling even when lifecycle hooks normally own the state. H/src/app/api.rs:1914–1953 exercises a pi exit and checks a released-agent event with final_status Idle, not an exclusive Done signal. The common agent-presence code later clears an absent process (H/src/pane.rs:935–965). `agent get` resolves the current occupant (H/src/app/api/agents.rs:25–32), and a missing target maps to agent_not_found (H/src/app/agents.rs:287–294). These mechanisms apply to Codex and pi; neither has a special stable public “process exited = done” contract.

**Consequences:** while the exit transition is visible, idle or done alone still cannot distinguish exit from a live settled harness. Once the occupant is gone, agent lookup/wait may error. Keep peer-wait's existing non-timeout error propagation (:164–168, :186–188). That already lets a dead/missing peer stop the door without redefining done. If explicit exit-event handling is wanted, that is a separate affirmative signal and needs its own verified call/schema.

No current peer was terminated for this investigation. The exit account above is source/test evidence, not a live exit reproduction. The local H checkout is at 1b1470b60f5bd6d2ed18e30657e6136dade885ab with local edits; I do not claim it identifies the exact installed binary build. Installed CLI and integration observations take precedence, and the skill agrees with the source on idle/done semantics.

## Q4. Proof calls and test machinery

**P1. Read-only calls already run successfully under HERDR_ENV=1, installed Herdr 0.9.1:**

```sh
herdr --version
herdr agent get w8:pNQ
herdr agent get w8:pPY
herdr agent explain w8:pNQ --json
herdr agent explain w8:pPY --json
herdr integration status
herdr agent wait w8:pNQ --timeout 100 --until working
herdr agent wait w8:pPY --timeout 100 --until working
```

Both wait calls returned working with current session metadata. Pi's wait result included `screen_detection_skipped: true`; Codex's explain result named its effective override. These are real calls with the same local-user identity the leaf will use. No cleanup was needed. They prove command shape, active identity and detection authority at the sample, not an end transition, missing-file failure or process exit.

**P2. Before handoff for O2, prove the selected end adapter on ordinary completed turns.** After the current peer finishes, rerun `herdr agent get w8:pNQ` and `herdr agent explain w8:pNQ --json`, and read the matching task_complete from the exact rollout named in E4. Do the corresponding `herdr agent get w8:pPY` and `herdr agent explain w8:pPY --json` after pi settles. Record the same session identity, hook authority, task ID where applicable, observed terminal status and file availability. No new prompt is needed merely to observe completion of an already-authorized turn. If an exact prompt/end binding is chosen, its actual command and metadata handoff need a real probe before claiming that mechanism proven.

**P3. A live missing-answer or exit probe is additional work, not performed here.** If the contract names a live exit criterion, use a disposable proof peer, then run `herdr agent get <proof-pane>` and `herdr agent wait <proof-pane> --timeout 1000` after its authorized exit, recording the error/transition and cleanup. Resolve that placeholder from the created pane's response. Do not stop either existing peer. The chosen policy does not need to infer exit from done, so a new process-control test harness is unnecessary just to fix that false premise.

**P4. The claimed missing status-sequence machinery already exists.** tests/fake-herdr.ts:24–26 defines per-wait status and sleepMs, :50 stores a waitScript array, :247 shifts its next entry, :251 appends a return file, and :253 returns its scripted status. tests/peer-wait.test.ts:20–34 already accepts that sequence, :84–98 uses delayed/file-producing waits, and :125–145 checks budget bounds. The Findings' “one status per pane” claim is stale. The current fake's scripted status is a response override, not a persistent pane mutation, and it bypasses its --until matching, so sequence fixtures must specify intended responses honestly.

**P5. Use existing tests and fixtures for the behavioral cases.** Cover idle and done inside an open/unknown turn followed by a return, authoritative end without a file, previous-turn completion, identity replacement, unknown harness, blocked precedence and budget exhaustion. tests/peer-wait.test.ts:104–119 currently expects universal idle/done failure and must change to the selected policy. Existing setup hardcodes agent `fake` (:30); O2 needs parameterized kind/session/authority data and temporary rollout fixtures. If replacement is in the criterion, add the narrow fake metadata transition needed for it. These are extensions to existing fixture data and local tests, not a missing runner, pool, dispatcher or factory prerequisite. No new machinery leaf is justified by status sequences.

**P6. Keep the proof honest.** A deterministic fake proves the waiter's decisions for supplied signals. It cannot prove that a real harness emits those signals around every long tool or subagent. Pair those tests with the live/installed-source evidence above, and state the remaining limitations. No live Codex/pi false failure was reproduced in this pass.
