# Slot B: signal rebuttal

**D1 — Keep pending ordering proof.** peer-ask.ts:19–24 proves a Herdr working observation, not that Codex has flushed this dispatch's task_started. Codex's effective working rule reads the title spinner (~/.config/herdr/agent-detection/codex.toml:14–20).
I accept the simpler latest-lifecycle-event reader if installed Codex source or a sufficient probe establishes that ordering and excludes a previous turn's completion. The observed 19/18 then 19/19 counts alone do not establish it.
Otherwise bind the reader to this dispatch's task and treat a not-yet-observed start as unknown.

**D2 — Keep identity binding; accept repeated reads.** peer-wait.ts:156 snapshots identity once. A new process/session can occupy the same pane, so its completion cannot prove the prompted session completed.
I accept C's re-read at each grace check, provided it compares with the exchange's expected kind/session and reports replacement explicitly instead of silently switching readers.
The expected identity must also survive budget reruns if replacement detection is promised across those reruns.

**D3 — Keep the requirement for an operator choice; accept C's proposal as that choice.** questions.md:46 currently requires immediate reruns after budget, and peer-wait.ts:155–160,197–200 only limits one invocation.
An explicitly chosen escalation after repeated idle budgets is acceptable if reported as “end signal unproven / wait bound reached,” never peer failure or proof that its turn ended.
Specify the repetition bound, how observation carries across calls, and equal treatment of idle/done. Do not introduce this policy silently inside the leaf.

**D4 — Agree on fixture extensions, keep “no missing machinery leaf.”** The sequence exists at tests/fake-herdr.ts:24–26,50,247–253, but :253 overrides only that response; list at :267–272 reads the unchanged pane and omits authority fields.
I accept extending the existing fixture with persistent status/session/authority transitions and an isolated HOME. tests/peer-wait.test.ts:30 hardcodes fake, and :44–45 inherits process.env.
My disagreement was with “a status sequence is needed” as absent machinery, not with adding these specific fixture capabilities.

## Corrections to Agreed

- **F1 — Item 3 overattributes turn_aborted support to B.** My measured rollout had zero turn_aborted events. I supported matched task_started/task_complete, with abort behavior explicitly unproven (signal-B.md E4). Add abort as a candidate requiring source/probe evidence, not a signal already proven by my notes.
- **F2 — Item 5 is too broad about dead peers.** Endless budgets apply to a still-addressable idle/unknown peer without accepted end evidence. A missing/released peer can produce a non-timeout Herdr error, which peer-wait.ts:164–168,186–188 already propagates and which ends the door wait under questions.md:46.
- **F3 — Item 2 needs the current-incident qualifier.** issues/chart/peer-wait/INTAKE.md:18–22 records older Codex premature-return and harness-timeout failures. I found no recorded Codex/pi failure from the current mid-turn idle mechanism after guarded prompting. That narrower statement is supported.
