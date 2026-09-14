# Plan: broadcast-before-now

## User intent

Cut the completed-issue broadcast from three sections (`Before`, `Now`, `Next`) to two (`Before`, `Now`) and retarget the writing rules at non-developer readers. The sender schema, its tests, the skill text and the merge guide example all move together. Implemented in `/home/ivan/Work/infra/akrogon/issues/worktrees/broadcast-before-now` on branch `broadcast-before-now`.

Slot B synthesized this plan on 2026-09-14 from `brief.md`, `design.md`, `state.yaml` and the live worktree. State is `plan.synthesis`, `debate: no`; no positions or rebuttals exist for this leaf.

## Decisions

### D1. Schema accepts exactly `summary`, `before`, `now`

In `skills/broadcast-issue/scripts/discord-send.ts`, drop `next` from the `Message` interface and `messageSchema`. The strict object already rejects unknown keys, so a payload carrying `next` fails validation before any request, and a payload missing `now` fails the required-key check. Keep `summary` trim 1–200 and both lists non-empty. No other validation changes: retry, redaction, env-file reading, target validation and CLI stay untouched.

### D2. Title and chunking unchanged, two rendered parts

Keep `## 🧪 <summary> (<MM/DD/YY>)` exactly. `chunks()` builds three parts: title, `section('Before', …)`, `section('Now', …)`; the `Next` part is removed. The boundary-joining reduce and the 2000-character `chunkSchema` guard are unchanged, so a long message still splits at section boundaries, now across at most two chunks.

### D3. Tests keep behavioral coverage with two-chunk fixtures

In `discord-send.test.ts`, replace `threeChunks`/`threeChunkPayload` with two-chunk equivalents (`before` 1500 chars, `now` 1500 chars) and update the default `payload` to the two-key body. Adjust the multi-chunk scenarios:

- Partial delivery: replies `[success, 500, 429, success, success]`; requests `[c0, c1, c1]` on primary then `[c0, c1]` on secondary; failure `{delivered: 1, failed: 1, unattempted: 0}`.
- Exhaustion loop over `delivered` in `[0, 1]` (was `[0, 2]`): replies `[success]*delivered + [rejected, rejected]`; failure `{delivered, failed: 1, unattempted: 1 - delivered}`.
- Recovered retries: replies `[rejected, success, rejected, rejected, success, rejected, rejected]`; primary failure `{delivered: 1, failed: 1, unattempted: 0}` on chunk 1, secondary failure `{delivered: 1, failed: 1, unattempted: 0}` on chunk 1.
- Split test: keep the `long` payload minus `next`; expect two requests, first starting `## 🧪 Title (<today>)\n\n**Before**`, second starting `**Now**`.
- Validation test: replace `next`-keyed invalid payloads with two-key bodies; add a case carrying a `next` key and a case missing `now`, both failing with zero requests.
- First test: expected content drops the `**Next**` block; add `expect(content).not.toContain('**Next**')`.

### D4. Readability rules live in skill text, not the sender

`skills/broadcast-issue/SKILL.md` "Context and message" section: two sections; `Before` is always present and names what was missing when the work is an addition; `Now` states what is better about the system, not what code changed; the headline after the repo name is one plain sentence a non-developer understands. Forbidden items gain file names, command names, code identifiers and unexplained acronyms alongside the existing jargon, internal paths, model names and test statistics. Replace the per-shipped-part scaling rule with: scale detail to what a broad-audience reader needs, merge parts when that reads better, keep small issues to a few short bullets, never drop a shipped outcome the reader would care about. The JSON example carries `{"summary","before","now"}` only. No mechanical readability guard in the sender.

### D5. Guide example shows the two-section shape

In `docs/guide/merge.html`: metric `3 / sections: before, now, next` becomes `2 / sections: before, now`; the `<pre>` example drops the `**Next**` block; the paragraph after it replaces the per-part scaling sentence with the readability scaling rule. No other guide pages change.

## Read-first list and observed gaps

- `issues/open/broadcast-two-sections/broadcast-before-now/brief.md` and `design.md`: binding scope and locked operator decisions.
- `skills/broadcast-issue/SKILL.md`: "Context and message" section and JSON example are the owned prose.
- `skills/broadcast-issue/scripts/discord-send.ts`: `Message`, `messageSchema`, `chunks()` are the only code touched.
- `skills/broadcast-issue/scripts/discord-send.test.ts`: fixtures and assertions to convert; the `run()` harness and boundary pattern stay as-is.
- `docs/guide/merge.html` lines ~60–76: metric, example block, surrounding paragraphs.
- `docs/reference-index.md` and `learnings/LESSONS.md`: grounding resources; no lesson blocks this leaf.

No gaps. `skills/merge-issue/SKILL.md` and `README.md` name the broadcast without its shape and stay untouched.

## Execution checklist

- [ ] A1. Update `discord-send.ts`: remove `next` from `Message` and `messageSchema`, remove the `Next` part from `chunks()`. Basis: D1, D2. Verify: `bun run typecheck` inside `skills/broadcast-issue/` passes.
- [ ] A2. Update `discord-send.test.ts` per D3. Basis: D3. Verify: `bun install --cwd skills/broadcast-issue --frozen-lockfile` then `bun test` inside `skills/broadcast-issue/` passes; the `next`-key and missing-`now` payloads fail with zero requests; the first test's rendered content starts `## 🧪 `, contains `**Before**` then `**Now**`, and contains no `**Next**`.
- [ ] A3. Rewrite the SKILL.md "Context and message" paragraphs and JSON example per D4. Basis: D4. Verify: the text states both section rules, the headline rule, the extended forbidden list and the new scaling rule; the example body has exactly `summary`, `before`, `now`.
- [ ] A4. Update `docs/guide/merge.html` per D5. Basis: D5. Verify: `grep -rn '\*\*Next\*\*' skills docs README.md --exclude-dir=node_modules` returns nothing.
- [ ] A5. Confirm no file under `issues/` changed on the leaf branch: `git status --porcelain issues/` empty and `git diff` names none.

## Dependencies and acceptance

No dependencies; all four surfaces are edited in one pass. Skill-local install (`bun install --cwd skills/broadcast-issue --frozen-lockfile`) precedes its tests because root `bun test` does not cover the skill folder.

End-to-end verification is the existing suite: it spawns the sender as a child process against a stubbed fetch boundary and records requests to `requests.jsonl`, which is the real-invocation artifact the design requires. No browser, auth or secrets are involved; tests use fake webhook URLs in a temp env file.

Done when all six done-criteria in `brief.md` hold: skill tests and typecheck pass, the rendered message has the two-section shape with no `**Next**`, SKILL.md carries the new writing rules and two-key example, merge.html matches, the `**Next**` grep is empty, and nothing under `issues/` changes.

## Addendum log

2026-09-14, slot B: synthesized directly because `debate: no`. No design choice reopened.
