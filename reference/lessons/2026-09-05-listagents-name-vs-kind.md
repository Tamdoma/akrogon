# listAgents returned the kind as the name, so seats could never be found again

What failed: killSeatPane looks up seats by durable name ("akrogon-implementer-0") but listAgents
mapped the multiplexer's `agent` field — the kind, "pi" — as the name. No seat lookup could ever
match, so stale seats would never be killed before respawn.

Root cause: the envelope carries both `agent` (kind) and `name` (given identity) and the reader
picked the wrong one. Found by helper-codex in cross-review before it bit in production.

Fix: 481efc6e — listAgents reads `name`, skips rows without one (agents the multiplexer detected
but nothing here started); the fixture mirrors the real row shape `{name, agent, pane_id}`.

Lesson: when consuming an external CLI's JSON, capture one real response and mirror it verbatim in
the fixture — the fixture had invented a simpler shape, so self-tests passed against a reality
that did not exist. Cross-review by a second agent caught what the author's tests could not.
