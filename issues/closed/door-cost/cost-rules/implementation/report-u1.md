# Report U1: door-reset cancel, boundary and unreadable handling

## Changed files and reasons

- `skills/chart-issues/scripts/peer-wait.ts` — extracted the claude transcript glob out of `claudeTurnOpen` as exported `claudeTranscript(session)`; `claudeTurnOpen` calls it. No behavior change (D2).
- `skills/chart-issues/scripts/door-reset.ts` —
  - D1: parent resolves `recordPath` and captures `statSync(path).size` after the identity check, before inline/detached dispatch; failure refuses on stderr (`refused: pane <pane> session record unreadable: <detail>`), exit 1, no log. Boundary reaches the detached child via `DOOR_RESET_BOUNDARY` (new optional configSchema field; `DOOR_RESET_CHILD=1` without it throws); the inline path passes it as a `child()` arg.
  - D2: `recordPath(kind, live, session)` — claude via `claudeTranscript`, codex via `codexRollout` (throws on null), pi via `live.agent_session.value` when `kind === 'path'` (throws otherwise).
  - D3: `operatorInputSeen(kind, path, boundary)` reads `readFileSync(path).subarray(boundary)`, lenient per-line parse via per-kind refined zod schemas; human-origin claude user/queued_command, codex task_started and user messages, pi user messages count; tool results, task-notifications, turn_context, toolResult and other records do not.
  - D4: `waitTurnEnd` takes the child's already-read `live` as its first poll (list read moved to loop end) so the per-poll order is binding → input check → `turnEnded`; input returns `{step:'wait-turn-end',result:'superseded'}`. Recheck gains the input check after its identity re-read, before send: `stop(log,'recheck','superseded')`. Exit 1 as for every non-send stop.
  - D5: child-side record reads (locator, boundary slice, `turnEnded`'s claude/codex reads) are wrapped to log `{step,result:'record unreadable',reason}` at `wait-turn-end` or `recheck` instead of reaching main's catch.

Note on D4 shape: the wait loop's first poll reuses the child's identity read instead of issuing a fresh `agent list`. The committed recheck cases append input on the third list call and require it to land at the recheck, which only holds when poll 1 consumes the child's read; observable results match the contract.

## Tests run

- `akrogon run-check --name u1 -- bun test tests/door-reset.test.ts --timeout=30000 --test-name-pattern '^(?!docs describe)'` → 36 pass, 0 fail, 1 filtered out. `check u1: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-u1-1793012068784-2347050.log`
- `bun test tests/peer-wait.test.ts tests/peer-ask.test.ts --timeout=30000` → 45 pass, 0 fail (peer-wait extraction regression guard).
- `bun run typecheck` → one error in `tests/door-reset.test.ts(244,32)`; present identically at base commit 652d521 (pre-existing, test file is the contract — not touched).
- `prettier --check` on both changed files → clean.

## Known limitations

- The `docs describe the handover entries and footer wording` test stays red by design; its strings are unit U2's.
- Pre-existing typecheck error in the test file (line 244) remains; the suite passes at runtime.
- Window between the recheck read and `agent prompt` remains uncovered, as stated in the design.

## Unverified criteria

None — all U1-owned criteria are green in one run.
