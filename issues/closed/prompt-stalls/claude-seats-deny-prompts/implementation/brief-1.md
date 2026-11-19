# Sub-brief U1: harnessArgv claude --settings merge and refusals

Worktree: /home/ivan/.akrogon/worktrees/akrogon/claude-seats-deny-prompts-u1

## 1. Goal

Implement plan decisions D1 and D2: `harnessArgv` (src/seat.ts) merges
`permissions.denyInsteadOfPrompting: true` into a claude harness line's `--settings` JSON object,
appends the pair when the line has none, and refuses a line it cannot merge without dropping a
setting. Non-claude harnesses are untouched.

## 2. Numbered acceptance criteria

All in tests/seat.test.ts, already committed on HEAD (a7e928f5); run them to green:

1. Pair-form `--settings <json>`: exactly one `--settings` element at the template's index; its
   value parses to the original object with `permissions.denyInsteadOfPrompting: true` and every
   other key/value kept (`env`, other `permissions` fields, other top-level keys). An explicit
   `denyInsteadOfPrompting: false` comes out `true`.
2. Equals-form `--settings=<json>`: stays one equals-form element at its index, same merge.
3. No `--settings` at all: gains the pair `--settings` `{"permissions":{"denyInsteadOfPrompting":true}}`
   after all template elements and before the appended `--disallowedTools=AskUserQuestion`.
4. Refusals (10 planned cases): `--settings` with no following element; value not a JSON object
   (path, malformed JSON, array, scalar); `permissions` present but not an object (incl. null);
   more than one `--settings`/`--settings=` element; any element exactly `--`. Each throws an
   `Error` whose message contains `claude` and `'<operand>'` (single-quoted operand). The operand
   is: the `--settings` element when its value is missing; the value element when present but
   unusable (`./claude.json`, `{broken`, `[1,2]`, `42`, `{"permissions":["*"]}`, `{"permissions":null}`);
   `--settings` for the multi-flag and mixed-spelling cases; `--` for the bare token.
5. Every non-settings argv element stays unchanged and in original order;
   `--disallowedTools=AskUserQuestion` stays appended once, last. codex/pi/agy argv unchanged.
6. `harnessArgv` keeps its signature `{ kind, argv }` and throws before returning, so no partial
   argv is built on refusal.

## 3. Read-first list

- src/seat.ts — `harnessArgv` at lines 68-82 is the only function to change; consumers
  `startSeat` (line ~225) and `startConsultant` (line ~317) append the task after `harness.argv`.
- tests/seat.test.ts — the committed criteria; `harnesses` const holds the real machine templates;
  `globalConfig(overrides)` swaps a template per case. Read it to see exact message asserts.
- tests/helpers.ts — `fixture()`.
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md — read it.

## 4. Change list and needed interfaces

Owns: src/seat.ts only. No prerequisite chunks; no shared test resource.

Planned shape (plan D1): inside `harnessArgv`, after the `argv[0]` check and before `extra`:

- `settingsAt`: indexes of elements that are `=== '--settings'` or `startsWith('--settings=')`.
- Any element `=== '--'` → throw; `settingsAt.length > 1` → throw (operand `--settings`).
- `settingsAt.length === 0`: `argv.push('--settings', JSON.stringify({permissions:{denyInsteadOfPrompting:true}}))`.
- `settingsAt.length === 1`: resolve the value element (next element for pair form; the `=` suffix
  for equals form; missing next element → throw with operand `--settings`). `JSON.parse` it inside
  a guarded boundary — a parse failure or a non-plain-object result throws the refusal naming the
  operand. Validate the parsed value with zod:
  `z.looseObject({ permissions: z.looseObject({}).optional() })` (zod v4 is a dependency; loose
  keeps unknown keys). A zod failure throws the refusal naming the operand.
- Write back `JSON.stringify({ ...obj, permissions: { ...(obj.permissions ?? {}), denyInsteadOfPrompting: true } })`
  in the same element position, pair or equals spelling preserved.
- Refusal message form (plan D2): `Harness claude: --settings operand '<operand>' <reason>` —
  tests assert only `'claude'` and `'<operand>'` presence; pick clear reasons.
- Keep output through `akrogon run-check --name <label> -- <cmd>`; cite the `check <label>:` line.

## 5. Do-not, reasons and exceptions

- Do not edit tests/seat.test.ts or any other file: a planned test that is red or wrong is a
  mismatch — return it with the failing output and the smallest brief correction, never a test fix.
  Exception: a revised brief from A authorizing the change.
- Do not touch the codex/pi/agy paths or `--disallowedTools` behavior: criterion 5 locks them.
- Do not read or write any file the `--settings` value might name; no temp files: the design
  forbids file reads and requires an inline JSON object — that is why file paths refuse.
- Do not add dependencies, config keys, docs or error classes: plan D1/D2 covers all of it;
  plain `Error` in the file's style.
- Return a mismatch with evidence instead of changing scope or interface; the exception is a
  revised brief from A authorizing that change.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worktree (deps are not installed there).
2. Read src/seat.ts `harnessArgv` and the tests; run the planned tests to see the planned red.
3. Implement D1+D2 in src/seat.ts (criteria 1-6).
4. Run `akrogon run-check --name seat-tests -- bun test tests/seat.test.ts` until green.
5. Run `bun run typecheck`.
6. `git add src/seat.ts && git commit` (feat-style message; no trailer needed — no test file changed).
7. Fill the report lines below and return them with the commit ID and the `check` line.

Advisory size: 1 file, under 12 turns.

## 7. Commands

- `akrogon run-check --name seat-tests -- bun test tests/seat.test.ts` (run-check resolves this
  `-u1` worktree to the leaf's implementation folder automatically).
- `bun run typecheck` after the tests are green.

## 8. Done-when, evidence and report

Green `check seat-tests: 0 <log>` line, clean typecheck, one commit on the worktree HEAD changing
only src/seat.ts. Return:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
