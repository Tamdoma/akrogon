# Signposts angles from B

Evidence: INTAKE.md F1–F6 says Claude keeps an explicit name across `/clear`; the observed unnamed chain began with a new process. `door-reset.ts` only resets and sends a prompt. That distinguishes preserving an existing name from recovering a name already missing.

## Suggested direction questions

- Q1. What outcome counts: (a) preserve explicit names only, (b) preserve explicit names and recover unnamed doors from their current tab, (c) recover historical names from earlier sessions? Recommend (b): it addresses the observed unnamed door without reconstructing history. An explicit session name wins when it differs from the tab. This replaces draft question 1: the operator already requires keeping the previous name; fewer moving parts is an implementation constraint.
- Q2. When the name source changes, which intention wins: (a) keep the session's explicit name until the operator renames it, (b) follow the tab on every handover? Recommend (a). “Usually the name of the tab” does not authorize overriding a deliberately different session name. With Q1(b), the tab supplies the initial missing name only.
- Q3. What reach should this delivery promise: (a) Claude only, (b) every currently supported reset harness? Recommend (a), matching the reported failure and available evidence. Broader support needs independent naming contracts and proof; existing reset support does not establish naming support.
- Q4. What happens when a required name cannot be obtained or restored: (a) stop the handover with an actionable error, (b) continue unnamed and report it? Recommend (a): an unnamed continuation fails the requested outcome. The failure policy must also cover an unnamed door with no usable tab name.
- Q5. Which events must the fix cover: (a) akrogon's chart handovers, (b) handovers plus arbitrary process restarts and operator-issued resets? Recommend (a). The observed loss predates a handover, so explicitly separate recovery on the next handover from prevention of every external restart.
- Q6. What proof spending is permitted: (a) bounded live throwaway sessions plus local tests, (b) local stand-ins only? Recommend (a), because command acceptance and retained names are harness behavior. Agree the spend and launch authority in Needs; the signpost answer alone supplies neither.

## Hard limits

- R1. Restore the harness session name, the identity the operator reads. Renaming only an hc terminal or tab is not equivalent (INTAKE.md F1).
- R2. Preserve an explicit name exactly, including spaces and punctuation. Do not treat a generated session title as the operator's chosen name.
- R3. Retain cancellation on submitted operator input and the fresh session's reset verification. No destructive probes in a real door or supplied consultant; read-only inspection may use existing evidence.
- R4. Stay within the reset helper and its skill contract. Do not introduce a general naming service, persistent name registry, transcript rewrites or changes to unrelated launchers.

## Foreseeable operator-only needs

- N1. Paid live proof: authorize exact harness/model/effort, maximum sessions or spend, and nested launches for isolated test terminals. Purpose: observe command execution and name persistence after a real reset. Existing F3 proves today's Claude behavior, not a future implementation. Declare the holder and authorization record before launching.
- N2. Test account access: reuse an already authenticated local harness if authorized. If the chosen proof lacks authentication or quota, the operator supplies the login or account capacity to that test harness. No new service key is inherently required by this local change.
- N3. Fixture lifecycle: authorize creating and removing only the identified throwaway terminals/tabs and say whether their transcripts/logs may be retained as proof. Keep existing door sessions and supplied consultants untouched.
- N4. Live recovery: if acceptance requires renaming/resetting an existing unnamed door such as t3k, obtain authority for that exact terminal and timing. Prefer isolated proof; the request to implement and test does not select a live door for mutation.

No deployment, publishing, new external account, secret storage, or production resource is inherently needed. Any broader harness scope adds its own launch, access and proof needs before that route is available.
