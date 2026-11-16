# blocked-prompts, slot A notes (blind)

Q1 pick: remove the claude question tool through the machine harness line, matching pi's existing exclusion: append ` --disallowedTools AskUserQuestion` to the claude template in ~/.akrogon/config.yaml, as exact text the operator applies (signpost 2a, needs row N2). Its effect under `--dangerously-skip-permissions` needs one real observation (paid, N1). Rejected: akrogon code appending per kind (moves config into code, against the pi precedent).

Q2 pick: the controller, not the watch. `observeBusy` (src/next.ts) sends an attention notice at once when a seat's hc status is `blocked`, naming repo, slug, seat, kind and msg when present, cleared when the seat leaves blocked (the existing busy-notice pattern). No keys pressed: no evidence that skip-permissions seats show permission prompts (C L7). The watch is unchanged; its Never list stays. Rejected: watch answers safe prompts (needs a danger classifier and an outside permission rule; signposts 1a, 3a); controller auto-enter (unproven screens).

Q3 pick: chart doors are out of reach (Off route): an operator-started session's prompts are the operator's, and autopilot doors already send a notice when they park.

Evidence: hc schema Status (kind: permission, question or auth, blocked only), free probe 2026-11-16 in the fork Carries; src/listen.ts wakes on blocked; src/next.ts observeBusy STALL_MS.
