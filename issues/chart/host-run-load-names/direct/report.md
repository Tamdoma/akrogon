# Direct report: host-run-load-names

Base 68a3076d43851a0d3b750680e69fa6dfe07679d7, head 135a8029 (34e6ce39 test, 9bec9b99 fix and docs, 7d8595ab test for B F1, 135a8029 matcher fix).

Changed files:
- src/run-check.ts: `fullRun(config, name, argv)` replaces `repo.config.full.includes(name)`. Full when the name is listed, the whole argv equals a listed check's command, or the argv is `sh -c <script>` whose script ends with that command as its own step (after start, `;`, `&`, `|` or a newline) or as a nested `sh -c '<command>'` body. Argument boundaries are kept, so a test filter naming the command stays light (B F1).
- tests/run-permit.test.ts: one new case (Test-Change trailer on 34e6ce39).
- docs/reference/config.md, docs/reference/checks.md, src/AREA.md (40 lines).

Proofs (akrogon run-check, holder direct/):
- red-first2 on 68a3076d + test: new case fails, renamed run does not wait (check-red-first2-1792858824592-3136637.log).
- targeted on 9bec9b99: run-permit 17 pass 0 fail (check-targeted-1792858866535-3170589.log). Prettier on src tests skills/chart-issues/scripts clean, typecheck clean.
- red-filter on 9bec9b99 + 7d8595ab: B F1 case red, the filter run queued until the 75 s timeout (check-red-filter-1792859218499-3548101.log).
- targeted2 on 135a8029 code: run-permit 17 pass 0 fail, prettier and typecheck clean (check-targeted2-1792859241195-3602787.log).
- Incident command `flock ... && akrogon guard own-modules && sh -c 'bun run framework:verify'` matches; `bun run framework:verify:cheap` and `bun run framework:verify -- --only x` do not (bun -e regex check).
- Verify on 9bec9b99 stopped by A (head changed) while waiting in the line.
- full verify on 135a8029: running.

Known limits: a command changed after the full command (extra flag) still runs light (operator-accepted R2).
