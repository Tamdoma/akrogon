# Round 14 B

## Q1: ab97c2ed

Verdict: ready. Attended handover creates the next chart's CHART.md before launch (`skills/chart-issues/SKILL.md:159`). Autopilot supplies its INTAKE.md/CHART.md variant before the same launch (`:151,153`). Shapes `:53–54` record the handover and do not launch another helper. I found no valid path requiring the launcher to create a missing parent directory.

There is no mkdir in the helper, transcript helper or resolver. The chart workflow still creates the intended chart folder and its signposts copy (`SKILL.md:159`), and tests create their fixture folders. The launcher creates no additional directories. Direct shell checks confirmed stdout/stderr capture in an existing chart and failure without directory creation for an absent parent. `tests/door-reset.test.ts`: **9 pass / 0 fail**.

## Q2: existing harness facts

The operator's addendum supersedes the neutral-proof/hc alternatives. Keep the per-harness facts and add agy.

| Piece | Location | Required difference or removable restriction |
| --- | --- | --- |
| Supported kinds and reset word | door-reset.ts:15,20,113 | Commands differ. Add agy rather than remove the table. |
| Operator-input records | door-reset.ts:25–46,93,103–107 | Formats differ. Agy needs a SQLite step cursor/query instead of a JSONL byte boundary. |
| Assistant-reply records | door-reset.ts:51–57,125–137 | Formats differ. Agy needs a SQLite query after its nonce-bearing user step. |
| Live transcript discovery | src/transcript.ts:42–59,102–158 | Native storage differs. The agy shared-DB answer at :155–156 is insufficient conversation identity. |
| Reset candidates and nonce lookup | src/transcript.ts:164–176,209–220 | Agy needs per-conversation DB candidates and SQL, not `.jsonl` filtering/raw file reads. |
| Kind inferred from path | src/transcript.ts:226–231 | Extend recognition to agy's conversation DB shape. Never recognize its shared summaries DB as one conversation. |
| Fresh-session continuation and documented support | SKILL.md:161,163,165,167 | Add agy to the command/input descriptions and support list. Distinct conversation paths remain a valid continuation check. |

Today the skill keeps agy/unknown harnesses in the same session (`SKILL.md:167`). Directly invoking the helper with agy's discovered summaries DB stops at `unsupported harness` (`door-reset.ts:90–91`), before reset keys. An undiscoverable harness stops earlier at `transcript unknown` (`:88–89`). This limit also existed in the herdr-era helper (`af28d63e^`, kinds/reset table :26–27, input table :39–63, recordPath :108–116).

## Agy reset and identity

Use **`/clear`**, with `/new` as its alias. The [official CLI reference](https://antigravity.google/docs/cli/reference#core-slash-commands) documents the conversation reset. Installed 1.5.3 independently confirms it: `clearCommand.Execute` at `0xa203080` schedules `Execute.func1` at `0xa20f2a0`, which calls `Manager.NewConversation`; its Name returns `clear`, and Aliases returns `new`.

This is a local conversation switch, not a model invocation. The binary derives OSC status from store state (`termstatus.Derive`, `0xa26f320`) rather than explicitly wrapping this command in a model turn. I have **not established the exact work/idle OSC sequence** without a live reset. Do not require an agy reset counter increment. The existing reply proof plus fresh idle read already avoids depending on that sequence.

There are **65 per-conversation SQLite databases** under `~/.gemini/antigravity-cli/conversations/<conversation-id>.db`. Use that real path for `session` and `akrogon.transcript`, not the shared `conversation_summaries.db`, a synthetic URI or a generated JSONL export.

For seat discovery, inspect agy's existing `/proc/<pid>/fd` presence lock: `<app-data>/presence/<id>.lock` maps to `<app-data>/conversations/<id>.db`. Binary evidence: `Manager.startStreaming` calls `acquireConversationPresence`; that method (`0xa17ce00`) releases the prior presence and acquires the current one. `presence.Acquire` (`0x9302840`) opens/locks the file, and Release closes it. The native lock files also exist on disk. Use a unique seat-owned lock, not the newest DB or the mere existence of an old lock file. This mapping is statically supported but was not verified against a live agy process here. `ANTIGRAVITY_CONVERSATION_ID` also exists in the binary, but that alone does not establish that the parent process environment refreshes after reset.

## Native records and queries

Inspected `conversations/4b6c381a-bcf9-473e-bdef-1242be06e7b9.db` read-only:

- `trajectory_meta(trajectory_id TEXT PRIMARY KEY, cascade_id TEXT, trajectory_type INTEGER, source INTEGER)`. **cascade_id**, not trajectory_id, matches the conversation filename.
- `steps(idx INTEGER PRIMARY KEY, step_type INTEGER, status INTEGER, has_subtrajectory NUMERIC, metadata BLOB, error_details BLOB, permissions BLOB, task_details BLOB, render_info BLOB, step_payload BLOB, step_format INTEGER)`.
- User prompt: **step_type 14**. Planner/assistant response: **15**. Completed status: **3**. Payloads are protobuf BLOBs, not JSON. These enum numbers are confirmed by the binary's protobuf descriptors at offsets 110713594, 110713627 and 110709849 respectively.

In each candidate conversation DB, this finds a nonce-bearing user step and its conversation:

```sql
SELECT m.cascade_id, s.idx
FROM trajectory_meta AS m CROSS JOIN steps AS s
WHERE s.step_type = 14
  AND instr(s.step_payload, CAST(:code AS BLOB)) > 0;
```

Capture `COALESCE(MAX(idx), -1)` before waiting for old A's turn. Operator input exists when `step_type = 14 AND idx > :boundary`. After locating the nonce's user idx, warm-up proof is:

```sql
SELECT EXISTS (
  SELECT 1 FROM steps
  WHERE step_type = 15 AND status = 3 AND idx > :prompt_idx
);
```

Still require a fresh hc idle/done state after that proof and a conversation path different from pre-reset. Tested against existing data: the selected code occurs in user step 4, with completed assistant steps 5 and 7. The shared DB has `conversations_fts.user_body/agent_body` and can locate historical text, but its search index is unnecessary for authoritative handover checks. Read live SQLite with WAL visibility, not `immutable=1`; immutable was sufficient for this historical inspection.

## Consumers and smallest change set

1. **A1: src/transcript.ts:155–156,164–176,209–231.** Replace the shared-DB answer with the unique presence-derived conversation path. Add agy recognition and SQL nonce lookup using existing native DBs. Keep the returned value an actual file path. No export files or new directories.
2. **A2: door-reset.ts:15–57,88–107,125–137.** Add agy `/clear` and SQLite input/reply handling. Use a step-index boundary for agy, preserving the existing JSONL handling for the other three. Reuse one native reader/query implementation rather than duplicating SQLite logic between discovery and the helper.
3. **A3: SKILL.md:161,165,167 and existing reset tests.** Document agy support and test native-shaped SQLite records, changed conversation identity, intervening user input, and an assistant response that does not echo the nonce. Keep the original three harness cases.

`src/log.ts:43,62` and prompt timing (`src/next.ts:430`, `src/timing.ts:31`) **store** the path and do not parse its target. `observe.ts:75–76` only resolves it and checks existence. The chart transcript helper (`scripts/transcript.ts:12`) prints it. These accept a real per-conversation DB path without schema changes.

Two downstream readers remain format-specific: `watch-issues/scripts/log-tail.ts:432–458` reads UTF-8 lines and parses JSON, so a SQLite path fails; `chart-usage.ts:118–119` rejects agy, and `:94–103,556–561` parse/dispatch only the three JSONL formats. Full agy log-tail/usage support needs native step/tool and generation-metadata decoding. That is separate from the minimal handover addition. Until implemented, retain the existing explicit unreadable-log/screen and partial-usage behavior rather than claim agy is measured.

No live agy reset, input or label writes. No implementation edits. Test resources removed.
