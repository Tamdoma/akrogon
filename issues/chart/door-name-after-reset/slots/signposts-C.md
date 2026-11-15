# Signposts angles, slot C

Read: INTAKE.md, door-reset.ts, handover.md, `hc --help`, `hc get t126`. Skipped: SKILL.md, src/hc.ts, src/transcript.ts, all other slot files.

## Challenge to the draft

F5 says the reset is not what drops the name on claude. The loss is a session that has no name of its own (F4: a new claude process on 2026-11-12). A fix that only re-applies "the previous name" inside door-reset.ts changes nothing for a named session and has nothing to re-apply for an unnamed one. Draft Q2 is therefore the whole feature, not a side case. Q5 below decides whether the chart fixes the operator's real case.

## Added direction questions

Q5. Which event must the name survive?
- O1. The handover reset only (the operator's literal words).
- O2. Any way A becomes a fresh session: handover reset, a new claude process, a resumed session. Recommended. F4 shows the new process is the observed loss.
- O3. Process start only, left to the operator's launch command (`claude -n`).

Q6. Who owns the name between sessions?
- O1. Nothing stored. At each reset read the live session: its `custom-title` record if present, else the tab name from the hc `where` label. Recommended. No new state to go stale, and an operator rename mid-session is picked up.
- O2. Store it once in `seats.yaml` (`name:` is already there, null) or the handover entry and replay it.
- O3. Fixed rule: always the tab name, ignoring any session name.

Q7. When the operator's session name and the tab name differ, which wins?
- O1. The session name. Recommended. It is the name the operator gave last.
- O2. The tab name.

Q8. What happens when setting the name fails or the harness has no rename command (F7)?
- O1. Log one stage line and continue the handover. Recommended. A stopped autopilot costs more than a missing name.
- O2. Stop the reset.
- O3. Use a harness-independent place instead (hc `name` or a label). Only worth it if the operator reads that field. Evidence can check what the tab view shows.

Q9. Does the fix repair doors that are already nameless (t3k `c-framework`)?
- O1. Yes, by itself at their next reset. Recommended, and it follows from Q5 O2 plus Q6 O1.
- O2. No, the operator renames those once by hand.

## Notes on the draft questions

- Q1: recommend "the name always comes back". The operator said "has to be the previous name".
- Q2: recommend the tab name. With "none" the framework door stays broken.
- Q3: recommend claude now, other harnesses only where a probe shows a rename command. State the rest as a limit in handover.md.
- Q4: recommend short paid probes on throwaway terminals with haiku, as in F3, plus this door's own next handover as the real proof.

## Hard limits

- L1. "Has a name of its own" is read from the transcript `custom-title` record, never from the hc `title`. An unnamed session's hc title is an auto title (F4) and would be replayed as if the operator chose it.
- L2. Never write to a harness transcript file to set a name. Use the harness's own command or launch flag.
- L3. Slot A only. Consultant terminals are out of scope.
- L4. The name step must not delay or reorder the start prompt in a way that breaks the existing input-check and `superseded` rule. Keys typed into A after the reset are the same risk class as the `/clear` keys.
- L5. No keys typed into any terminal other than this door's A and throwaway probe terminals.
- L6. The result depends on claude keeping `custom-title` across `/clear` (seen on 2.1.323 and 2.1.325). The door's own check after reset should be what notices if a later version stops doing so.

## Operator-only needs

- N1. Paid launches: haiku probe sessions on claude. Codex, pi and agy probes need those logins to be live on this machine.
- N2. Approval before touching t3k (the framework door) for a live proof or a one-time rename.
- N3. The fix reaches running doors only after the installed skill copy is updated. If that is an operator step, say so in the landing note.
- N4. Merge and push follow the normal lifecycle. No new keys or accounts foreseen.
