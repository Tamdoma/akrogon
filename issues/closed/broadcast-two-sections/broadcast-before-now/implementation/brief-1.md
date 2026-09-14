# Sub-brief 1: sender schema and tests

## 1. Goal

Two-section broadcast payload in the sender and its test suite. Plan decisions D1, D2, D3.

## 2. Acceptance criteria

1. `messageSchema` accepts exactly `summary`, `before`, `now`; a payload with a `next` key or missing `now` fails validation before any request, covered by tests.
2. `chunks()` renders title, `**Before**`, `**Now**` only; splitting at part boundaries under 2000 chars is unchanged.
3. `cd skills/broadcast-issue && bun test` passes; `bun run typecheck` in the same folder passes.

## 3. Read-first list

- `skills/broadcast-issue/scripts/discord-send.ts` — `Message` interface, `messageSchema`, `chunks()` are the only code touched.
- `skills/broadcast-issue/scripts/discord-send.test.ts` — fixtures and assertions to convert; keep the `run()` harness and boundary pattern exactly.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

`discord-send.ts`:
- `Message`: remove `readonly next: readonly string[]`.
- `messageSchema`: remove `next: bullets`.
- `chunks()`: remove `section('Next', message.next)` from `parts`.

`discord-send.test.ts`:
- `threeChunks`/`threeChunkPayload` become two-chunk equivalents: `before` 1500 chars, `now` 1500 chars; rename or keep names, your call, but every consumer must be consistent.
- `payload` drops the `next` key.
- First test: expected `content` drops the `\n\n**Next**\n- …` block; add an assertion the content does not contain `**Next**`.
- Split test: `long` payload drops `next`; still two requests; bodies[0] starts `## 🧪 Title (<today>)\n\n**Before**`, bodies[1] starts `**Now**`; remove the `**Next**` assertion.
- Validation test: invalid payloads become two-key bodies (empty summary, empty `before`, missing `now`); add one payload carrying a `next` key alongside valid keys; all fail with zero requests.
- Partial-delivery test (two chunks): replies `[success, {500,'busy'}, {429,'primary-secret rejected'}, success, success]`; requests `[c0, c1, c1]` on primary then `[c0, c1]` on secondary; failure `{delivered: 1, failed: 1, unattempted: 0}`.
- Exhaustion loop: `delivered` over `[0, 1]`; replies `[success]*delivered + [rejected, rejected]`; failure `{delivered, failed: 1, unattempted: 1 - delivered}`.
- Recovered-retries test: replies `[rejected, success, rejected, rejected, success, rejected, rejected]`; primary requests `[c0, c0, c1, c1]`, secondary `[c0, c1, c1]`; failures primary `{delivered: 1, failed: 1, unattempted: 0}` on c1, secondary `{delivered: 1, failed: 1, unattempted: 0}` on c1.
- All other tests unchanged.

## 5. Do-not

- Do not touch retry, redaction, env-file reading, target validation, CLI parsing, `section()`, `stamp()`, `chunkSchema` or the `run()` harness: out of scope, and the design forecloses a mechanical readability guard.
- Do not add tests asserting prose wording; assertions cover structure and rendered markers only.
- Do not edit SKILL.md or docs; that is brief-2.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. Edit `discord-send.ts` (criteria 1–2). Run `bun test` in the skill folder and confirm the expected failures are the old three-key fixtures.
2. Edit `discord-send.test.ts` (criteria 1–3). Run `bun test` and `bun run typecheck` in the skill folder until green.

Advisory size: 2 files, under 12 turns.

## 7. Commands

```bash
bun install --cwd skills/broadcast-issue --frozen-lockfile
cd skills/broadcast-issue && bun test
cd skills/broadcast-issue && bun run typecheck
```

## 8. Done-when, evidence and report

Green `bun test` and `bun run typecheck` output pasted. The suite's child-process runs against the stubbed fetch boundary with `requests.jsonl` are the end-to-end artifact.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
