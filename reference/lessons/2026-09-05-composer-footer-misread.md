# Delivery blocked: the runtime's status footer was read as composer text

What failed: after seats finally registered, no prompt was ever delivered — every dispatch ended
no-identity with zero sends. clearComposer read the pane's trailing line, saw the runtime's status
footer (`~/Work/infr...`, `$0.000 (sub...`, truncated to pane width), judged the composer occupied,
failed to clear it with esc, and refused to send.

Root cause: composerText assumed "last non-blank rendered line = composer". The pi TUI draws a
status footer below the composer box, so the assumption held for the fixture but not the real
screen. First-draft fix (filter footer-shaped lines globally) was wrong too — it exposed the
transcript as false composer text; caught by the new regression test and independently by
helper-codex (F5).

Fix: composerLine parses the bounded composer region between the last two horizontal-rule lines,
with the old trailing-line fallback for runtimes that draw no box; regression tests use the real
captured footer shape.

Lesson: anything that parses a rendered TUI must be written from a captured real snapshot, not an
imagined one, and the capture belongs in the self-test. Screen-scraping heuristics fail silently
at narrow pane widths — test the truncated render, not just the wide one.
