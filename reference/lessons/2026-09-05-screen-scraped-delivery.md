# Delivery and identity built on rendered pane text broke once per rendering quirk

What failed: prompt delivery and identity confirmation parsed the runtime's rendered pane text and
failed three separate times in one day — the status footer read as an occupied composer, a leading
indent broke the identity anchor, and hard-wrapping at seat-pane width split markers mid-token.
Each fix repaired one runtime's rendering and left the next quirk waiting.

Root cause: the transport treated a UI drawn for humans as a machine protocol. Every runtime (and
every pane width) renders differently, so correctness depended on per-runtime screen layout —
redundant adapter logic the multiplexer already replaces with a structured agent state machine.

Fix: layer 1 rewrote `deliver()` to wait for a settled agent state (`agent wait --until idle
--until done`), then submit through `agent prompt --wait`; layer 2 moved identity to a per-attempt
JSON acknowledgment file written by the seat. All pane-text reads left agent delivery; `readAgent`
no longer exists.

Lesson: never read rendered output as protocol when a structured channel exists — take evidence
from the state machine or from files the worker writes. Enforced now: the self-test grep confines
the agent-state signal to the transport module, its fake, and their tests, and the transport
exposes no agent-pane read at all. Proposed, not yet enforced: a preflight check that every
configured runtime can complete the file-acknowledgment handshake before a lane starts.
