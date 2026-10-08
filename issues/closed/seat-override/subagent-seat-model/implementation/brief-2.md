# Worker brief 2: harness-template substitution test

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/subagent-seat-model-u2

## 1. Goal

Implement plan decision D2/D3: prove done-criterion 1 with one new test file `tests/harness-template.test.ts` that reads the real tracked `config.yaml` through `readGlobal()` and asserts the substituted `--settings` argv word.

## 2. Acceptance criteria

1. `tests/harness-template.test.ts` asserts the raw `harnesses.claude` template carries no literal subagent model name inside the `--settings` JSON (check `sonnet`, `opus`, `haiku`).
2. For each sample model `opus` and `claude-opus-5-5` with effort `low`: apply the exact `launch()` chain — `template.replaceAll('{model}', quote(model)).replaceAll('{effort}', quote(effort))`, then `parse` from `shell-quote` validated with `z.array(z.string()).min(1)` — locate the `--settings` argv word, `JSON.parse` it, assert `env.CLAUDE_CODE_SUBAGENT_MODEL === <model>` and `env.CLAUDE_CODE_SUBAGENT_MODEL_FORCE === '1'`.
3. The config comes from `readGlobal()` (imported from `../src/config`) with `process.env.AKROGON_HOME` set to the repo root (`resolve(import.meta.dir, '..')`) inside the test and restored afterward.
4. Expected state on your worktree: the unchanged `config.yaml` still says `sonnet`, so assertion 1 is RED there — run it and paste that red output as deliberate-break evidence. Green is proven by A after the sibling `config.yaml` change lands.
5. `bun test --changed="$AKROGON_BASE" --timeout=30000` — run it; it may run only your file and still be red per criterion 4. Report exactly what it did.
6. `bunx tsc --noEmit` (or `bun run typecheck`) exits 0 — your file must typecheck.

## 3. Read-first list

- `src/next.ts:252-259` — the `launch()` chain being reproduced verbatim (`launch` is not exported; copy the two `replaceAll` calls and the `parse`+`z.array(z.string()).min(1)` validation).
- `src/shell.ts:63-65` — `quote`.
- `src/config.ts:74-85` — `toolRoot`, `globalHome`, `readGlobal`.
- `tests/config.test.ts` and `tests/shell.test.ts` — repo test style (`import { test, expect } from 'bun:test'`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Create `tests/harness-template.test.ts`. It does not spawn herdr, claude, or the akrogon CLI and creates no fixture repo — it is a pure test over the checked-in `config.yaml`.
- Imports: `test`, `expect` from `bun:test`; `resolve` from `node:path`; `parse` from `shell-quote`; `z` from `zod`; `readGlobal` from `../src/config`; `quote` from `../src/shell`.
- Owned paths: `tests/harness-template.test.ts`. Shared test resource: none. Must land before: nothing (its green state requires the sibling `config.yaml` change, which A sequences at pick time).

## 5. Do-not, reasons and exceptions

- Do not edit `config.yaml` or any `src/` file — the template change is another unit; making your test green locally by editing it would fake the proof.
- Do not spawn processes or create temp repos — the real boundary here is the substituted argv, which `parse` exercises directly.
- Do not export or extract a shared substitution helper — `launch()` stays unexported (a locked `index-seats` concern); duplicating two lines is the design's chosen cost.
- Do not set `AKROGON_HOME` globally outside your test body — other files run concurrently.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Restated: exclusions exist because the proof's value is testing the real template through the real substitution chain; any deviation returns a mismatch unless A revises the brief.

## 6. Ordered steps

1. Read the files in section 3.
2. Write `tests/harness-template.test.ts` (criteria 1-3).
3. Run `bun test tests/harness-template.test.ts` — paste the red output showing the no-literal assertion failing against the still-`sonnet` config (criterion 4).
4. Run the section-7 commands (criteria 5, 6).
5. Commit: message `test: claude template subagent model placeholder` (or equivalent). No `Test-Change:` trailer — this is a new file and changes no existing test file.

Advisory size: 1 file, under 8 turns.

## 7. Commands

```bash
AKROGON_BASE=2645d97ed1682185eea4788844f882a541885d24 bun test --changed="$AKROGON_BASE" --timeout=30000
bun run typecheck
bun test tests/harness-template.test.ts
```

Run inside your worktree.

## 8. Done-when, evidence and report

Done when the file is committed, the red run is pasted as evidence, and typecheck passes. Return these filled in:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
