# Needs you: agents waiting on the operator (A5, A6)

## Question

Q1 which agents appear; Q2 where answer options come from; Q3 how a reply is sent to a `blocked` agent; Q4 what the option buttons do; Q5 where it lives; Q6 how a Codex question is found while hc reports `working`.

### Carries

Round 1: panels live in herdr-setup; flat is the default layout.

## Findings

Seat notes `slots/agent-questions-{A,B,C,D}.md`, merged `slots/agent-questions-merged.md`. Probes 2026-11-03 (INTAKE "Probes"): a mod's `hc(["send", ...])` types into its own session's terminal; Claude Code and Antigravity report `blocked` with `kind: question` or `permission`; `hc send --force` works for Claude Code (typed text is the answer) and is unsafe for Antigravity (Enter picked the highlighted first option); Pi prints its question and ends `done`, answered by a plain send; Codex shows its question while hc reports `working`, answered by a plain send.


Proof, 2026-11-03, operator's local user `ivan`, herdr-app 0.1.12, hc 0.1.17, Claude Code 2.1.317 (haiku), Codex 0.166.0, Pi 1.5.0, Antigravity 1.4.12. Target: throwaway session `probe2`. Commands: a throwaway mod calling `hc(["ls","--json"])` and `hc(["send","t1","echo FROM_MOD_PROBE"])` (typed into t1; `hc ls` from a mod sees only its own session); `exec("akrogon",["status"])` (exit 0, ~370 ms); `hc run --bg --no-parent --name pq-<harness> -- <harness> "<ask Pick a color: Red/Blue with your question tool>"` for each harness; `hc get <t> --json`; `hc read <t> --lines 0`; `hc send <t> "2"` (refused for blocked Claude: "t2 is blocked (question)"); `hc send --force <t> "2"` (Claude: typed answer "2", replied Blue; Antigravity: picked Red, wrong); `hc keys t4 enter` (Antigravity folder trust); `hc send t5 "Blue"` (Codex, answered while hc reported `working`); `hc send t3 "1-B"` (Pi, answered after `done`). Cleanup: `hc kill` of t2-t5, session stopped and deleted. Limits: one question shape per harness, default models; permission and auth prompts other than Antigravity's folder trust were not exercised.

## Taken

Operator, verbatim: "1a | 2a | 3a | 4a | 5 - draw it so I can see it. I like the way the terminal area is done here. I don't want to change that main part. I want it all to be under the new pane like what Files and Changes are today." Then, after the drawing: "I don't want to be complicating the existing interfaces. I like what they are today."

- 1a: Needs you lists agents stuck on a prompt (`blocked`, with hc's `kind`) and every top-level agent that finished (`done`), each with its last lines and a reply box. Sub-agents appear only when blocked. A row with a half-written reply stays until sent or its turn advances.
- 2a: options come from the agent's visible screen (`hc read --lines 0`); buttons only when the last reply has 2+ options sharing a number, a "(recommended)" mark, or a "Reply `1a 2b`" line; a "load the rest" button reads history once when question 1 scrolled off. Done-criterion: real saved screens from claude, codex, pi and agy as fixtures, zero false buttons.
- 3a: finished agents get plain `hc send`; `blocked` with `kind: question` gets `hc send --force` only where a per-harness probe proved it (Claude Code), otherwise the button opens the agent (Antigravity); permission and auth always open the agent. Re-check terminal, state and turn right before sending; refuse on change.
- 4a: option buttons fill an editable draft, Send submits; "Recommended" fills every recommended pick; "elid" sends "elid" at once.
- Q5: Needs you is a right-panel view beside Files and Changes; the terminal area and the left Agents list stay as they are.
- Q6, operator, verbatim: "ok, do a | push". herdr-core should report a Codex question as `blocked`; Needs you adds no title parsing. Until then a Codex question shows only in its terminal. Reported through `herdr-app feedback`. Foreclosed: reading Codex's "Action Required" title.
