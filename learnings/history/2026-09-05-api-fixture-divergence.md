# The multiplexer fixture disagreed with the installed CLI

What failed: Tests represented agent identity incorrectly, kept closed panes in the pane list, and modeled command submission as an unsubmitted composer. Production behavior and fixture behavior diverged at the same interface.

Root cause: The fake modeled assumptions rather than the installed CLI's responses and resource lifecycle.

Fix: 481efc6e corrected named-agent rows. 5b4db1b1 removes closed panes from the fixture and verifies that failed startup preserves the root. 42a30327 uses native command submission and environment inheritance, removing extra keystrokes and pane-text acknowledgments. Both native operations were verified live before replacing the fixture assumptions.

Lesson: For external interfaces, planning should require a sanitized observed response and one live lifecycle probe. Turn these into fixture contracts covering both fields and mutations. Passing tests against an invented response cannot verify compatibility.

Before designing a handshake or retry loop, check whether the external interface already guarantees the required operation. Prefer that capability over recreating it through shell commands and rendered output. Verify environment inheritance and submission separately from process liveness.
