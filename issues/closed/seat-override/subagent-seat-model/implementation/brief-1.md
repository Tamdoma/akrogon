# Worker brief 1: claude template model placeholder

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/subagent-seat-model-u1

## 1. Goal

Implement plan decision D1: in the tracked machine `config.yaml`, the claude harness template pins subagents to `sonnet`; replace that literal with the `{model}` placeholder so every claude seat's subagents run the seat's model.

## 2. Acceptance criteria

1. `config.yaml` line 12 reads `"CLAUDE_CODE_SUBAGENT_MODEL":"{model}"` (inside the `--settings` JSON of the `claude:` harness line).
2. `"CLAUDE_CODE_SUBAGENT_MODEL_FORCE":"1"` is unchanged on that line.
3. No other line of `config.yaml` changes; `git diff` shows exactly one changed line.
4. `bun test --changed="$AKROGON_BASE" --timeout=30000` exits 0 (the change is a YAML value, expected to run no tests; a zero exit counts).

## 3. Read-first list

- `config.yaml` (the only file you edit; line 12 is the target)
- `src/next.ts:252-259` (how `launch()` substitutes `{model}` and `{effort}` — confirms the placeholder spelling)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `config.yaml`: one-word edit inside the single-quoted YAML scalar. The template is YAML single-quoted, so the embedded JSON stays double-quoted. Final line:

```yaml
  claude: 'claude --model {model} --effort {effort} --settings ''{"env":{"CLAUDE_CODE_SUBAGENT_MODEL":"{model}","CLAUDE_CODE_SUBAGENT_MODEL_FORCE":"1"}}'' --dangerously-skip-permissions'
```

- Owned paths: `config.yaml`. Shared test resource: none. Must land before: nothing.

## 5. Do-not, reasons and exceptions

- Do not touch any other file, line, harness, or the `FORCE` value — scope is the one placeholder substitution.
- Do not "fix" the YAML quoting style — the single-quoted form with doubled `''` is the file's existing convention and the doubled quotes are required escaping.
- Do not reformat the file.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Restated: exclusions above exist to keep the diff to exactly one word-substitution line; any deviation returns a mismatch unless A revises the brief.

## 6. Ordered steps

1. Read `config.yaml` line 12.
2. Apply the one-word edit so the line matches the target above (criterion 1, 2, 3).
3. Run the command in section 7 (criterion 4).
4. Commit on the worktree HEAD: message `config: parameterize claude subagent model` (or equivalent). No `Test-Change:` trailer — `config.yaml` is not a test file and no existing test file changes.

Advisory size: 1 file, under 6 turns.

## 7. Commands

```bash
AKROGON_BASE=2645d97ed1682185eea4788844f882a541885d24 bun test --changed="$AKROGON_BASE" --timeout=30000
```

Run it inside your worktree. If `--changed` runs nothing, `bun test --timeout=30000` is not required — note it in the report.

## 8. Done-when, evidence and report

Done when the committed diff is the one-line substitution and the command exits 0. Return these filled in:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
