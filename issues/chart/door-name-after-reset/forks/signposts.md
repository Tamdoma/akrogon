# Signposts: door-name-after-reset

Original for the door session opened 2026-11-14T09:49:37Z in door t126 (chart door-name-after-reset). Full autopilot: A answers this round and every fork. Angles merged from slots/signposts-B.md and slots/signposts-C.md. From the latest earlier record (issues/chart/failure-identity/forks/signposts.md) two answers carry over as proposed: fewer parts breaks ties (its 1a) and akrogon only (its 5a). Its 6a (no paid calls) does not carry, because the operator asked for a test.

Settled by the operator's words, not asked: full autopilot, lifecycle route, consultants B (codex) and C (claude fable 5.2 medium), one handed note, "the name has to be the previous name", "test it out".

## Question

1. Which outcome counts?
   - 1a Keep a name the session already has, nothing more.
   - 1b (recommended, A,B,C) Keep a name the session already has, and give a door that has no name of its own the name of its tab. This is the only option that fixes the observed loss (framework door, no name since 2026-11-12).
   - 1c Also rebuild names from older sessions.
   - Steers: where the name is read from, whether the tab is read at all.

2. When the session's own name and the tab name differ, which wins?
   - 2a (recommended, A,B,C) The session's own name. It is the name the operator gave last. The tab only fills a missing name.
   - 2b The tab name, on every reset.
   - Steers: the read order in the helper.

3. Which event must the name survive?
   - 3a (recommended, A,B) The door's own handover reset. A door that lost its name some other way gets it back at its next handover.
   - 3b (C) Every way A becomes a fresh session, including a new process the operator starts.
   - Steers: whether anything outside the reset helper changes.

4. Reach.
   - 4a (recommended, A,B,C) Claude now. Another harness is covered only where a probe shows it has a rename command; the rest is a stated limit.
   - 4b Every harness the reset supports, whatever it costs.
   - Steers: probes, leaf size, the limit text.

5. What happens when the name cannot be read or set?
   - 5a (recommended, A,C) Write one log line and continue the handover. A stopped autopilot run costs more than a missing name.
   - 5b (B) Stop the handover with an error.
   - Steers: the helper's stage rules and its tests.

6. Is the name stored anywhere between sessions?
   - 6a (recommended, A,B,C) No. The helper reads the live session and the tab at each reset, so a rename mid-session is picked up and nothing can go stale.
   - 6b Store it in seats.yaml or the handover entry and replay it.
   - Steers: records, the seat file, fresh A's duties.

7. Proof spending.
   - 7a (recommended, A,B,C) A few short haiku sessions on throwaway terminals to observe real resets, plus local stand-in tests. No real door is touched.
   - 7b Local stand-ins only.
   - Steers: the needs sheet, proofs, grants.

Reply key: `1b 2a 3a 4a 5a 6a 7a`, or numbered free text.

Challenge check: B holds 5b, because a continued handover with no name fails the requested outcome. C holds 3b, because the observed loss came from a new process, not a reset. Hard limits both add, which A adopts: the name is the harness session name the operator reads, never only an hc or tab rename (B R1); "has a name of its own" is read from the session's own record, never from the hc title, which is an auto title on an unnamed session (C L1, B R2); no writes to a transcript file (C L2); slot A only (C L3); the operator-input cancel rule stays (B R3, C L4); no keys into any real door or consultant during proofs (B R3, C L5); no naming service or registry (B R4).

## Taken

A's picks under full autopilot (2026-11-14T09:58:00Z, door t126), not operator words: `1b 2a 3a 4a 5a 6a 7a`. The operator's words that handed the round to A, verbatim: "Full autopilot mode, including the singposts."

Reasons: 1b because the operator said "it's usually the name of the tab" and 1a leaves the observed loss unfixed. 2a because "the name has to be the previous name". 3a over 3b because the reset helper is the only part the door owns at that moment, and 1b already repairs a nameless door at its next handover (C's dissent stands). 4a follows function over form: no promise without an observed rename command. 5a over 5b by the operator's value of speed (B's dissent stands). 6a is removing over adding. 7a follows "test it out".

Account: the session makes the handover reset put the name back, from the session's own name first and the tab name second, on claude, with nothing stored and a logged skip on failure. It gives up covering process restarts the operator makes, other harnesses without a proven rename command, stopping a handover over a name, and any proof on a real door.

## Needs

- N1 paid test launches: short haiku sessions on throwaway hc terminals in the akrogon folder, for A's charting probes. Purpose: observe the real reset and rename on claude. Bound: at most 8 sessions in total, counting each started terminal, the 2 already run at 09:51Z included; each is killed and removed after its probe. Destination: authorization record here. Status: supplied, by the operator's words "Do it on autopliot, and test it out" (2026-11-14, door t126). A reads those words as covering these probes only.
- No other row foreseen: no key, login, file, grant for the leaf, fixture retention or close. The framework door t3k is not touched (it would need its own approval, B N4, C N2).
