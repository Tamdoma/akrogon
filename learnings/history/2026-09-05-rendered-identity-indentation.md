# A rendered identity reply was present but not parsed

What failed: A live probe received and answered the identity prompt, but the parser reported no identity.

Root cause: The parser required `IDENTITY` at column one. Pi rendered the reply with a leading space that synthetic replies did not contain.

Fix: a5dfd0c3 accepts leading whitespace and tests the captured reply layout.

Lesson: Treat rendered terminal text as an external format. Create-issue verification for terminal parsers should require observed snapshots, including indentation and narrow layouts. Separate evidence that a prompt arrived from evidence that its response parsed correctly.
