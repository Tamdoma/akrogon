# Targeted checks missed an aggregate-suite constraint

What failed: The watchdog's first commit passed its own tests and TypeScript but failed the full reconciler suite because a diagnostic named the multiplexer outside the transport module.

Root cause: Local behavior checks did not cover repository-wide architectural assertions.

Fix: 9d8cbbef removed the redundant diagnostic prefix. The full suite then passed independently, alongside watchdog tests and TypeScript.

Lesson: Before publishing machinery changes, run the containing suite as well as targeted tests. Keep exit status attached to the command being verified. Check the final combined tree after peer edits, then observe a real startup. Each check establishes a different claim.

Second instance, published measurements: a build-log timing entry attributed a ~3 h plan to the codex harness by summing all attempts of the item, when only the last attempt ran on codex (the harness switch landed between attempts) and took ~25 min; it also claimed a delivered plan was discarded, based on a commit whose subject said "chunk files" but whose tree held none. Peer review caught both.

Extension of the lesson: a published measurement is a claim like any other and needs its own verification. Join each number to the exact attempt record and the configuration active at that attempt's launch, and establish what a commit delivered from its tree (`git show --stat`), never from its subject.
