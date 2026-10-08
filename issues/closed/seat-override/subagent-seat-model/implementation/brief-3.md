# Worker brief 3: live claude proof run

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/subagent-seat-model-u3

## 1. Goal

Execute plan decision D4 / done-criterion 2: one real non-interactive Claude Code run built from the launch argv of the changed `config.yaml` template, proving a general-purpose subagent runs the seat's model (`opus`). You produce evidence artifacts, not a branch commit.

## 2. Acceptance criteria

1. The argv is built by substituting `{model}`=`opus`, `{effort}`=`low` into the worktree's `config.yaml` `harnesses.claude` template using the exact `launch()` chain: `template.replaceAll('{model}', quote('opus')).replaceAll('{effort}', quote('low'))` then `parse` from `shell-quote` — do it inside a `bun -e`/`bun` script importing `quote` from the worktree's `src/shell.ts`; never hand-type the command.
2. `claude --version` output is recorded before the run.
3. The run executes the built argv plus `-p "<prompt asking for one general-purpose subagent>" --output-format stream-json --verbose --forward-subagent-text --max-turns 6 --max-budget-usd 1` from a scratch `mktemp -d` directory (not the worktree), and exits 0.
4. Full stdout is saved verbatim to `/home/ivan/Work/infra/akrogon/issues/open/seat-override/subagent-seat-model/implementation/proof-run.jsonl`.
5. `/home/ivan/Work/infra/akrogon/issues/open/seat-override/subagent-seat-model/implementation/proof-run.md` contains: the full command (as one copyable argv, e.g. `JSON.stringify(argv)` output), the date (UTC), the `claude --version` string, the exit code, and every stream-json row with `type=="assistant"` and non-null `parent_tool_use_id` reduced to `{type, parent_tool_use_id, model: .message.model}` — one line each.
6. At least one such row exists and every one reports `message.model` starting with `claude-opus`.

## 3. Read-first list

- `config.yaml` line 12 in your worktree (the changed template — already contains `{model}`)
- `src/next.ts:252-259` (the substitution chain) and `src/shell.ts:63-65` (`quote`)
- `/home/ivan/Work/infra/akrogon/issues/open/seat-override/subagent-seat-model/readiness.yaml` (the grant: ≤5 runs total for this leaf, $1 cap per run, no `--bare`, operator Claude Max login only)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- No files change on the branch — no commit. Outputs are the two leaf-folder artifacts above plus your returned report.
- Suggested prompt word: `Use the Agent tool exactly once to launch a general-purpose subagent that computes 2+2, then report its answer.` (Any equivalent wording asking for one general-purpose subagent is fine.)
- To filter rows, `jq` or a `bun -e` JSON parse of `proof-run.jsonl` both work.
- Owned paths: none on the branch. Shared test resource: the operator's Claude Max login / Anthropic API — you are the only consumer. Depends on: the wave-1 `config.yaml` commit, already landed in your worktree.

## 5. Do-not, reasons and exceptions

- Do not pass `--bare` — it makes the run report "Not logged in" (recorded limit in readiness.yaml).
- Do not run more than once — the grant bounds this leaf to 5 runs total and a prior probe already consumed some; a failed run returns the failure as evidence, not a retry.
- Do not omit `--max-budget-usd 1` or `--forward-subagent-text` — the cap is a grant bound and the flag is what emits `parent_tool_use_id` rows.
- Do not run interactively, do not write any settings file, do not touch `.env` files, do not print or capture credential values anywhere.
- Do not hand-construct the argv — the proof's value is that it is the launch argv; any deviation returns a mismatch unless A revises the brief.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Restated: every exclusion protects either the grant bounds or the proof's authenticity; violations invalidate the evidence.

## 6. Ordered steps

1. `claude --version`, record the string (criterion 2).
2. `bun -e` (or a scratch `.ts` in the scratch dir — never inside the worktree's tracked files) that imports `quote` from the worktree `src/shell.ts` and `parse` from `shell-quote`, reads `config.yaml` via `Bun.YAML.parse(readFileSync(...))` or `readGlobal` with `AKROGON_HOME` pointed at the worktree, builds the argv per criterion 1, prints `JSON.stringify(argv)`.
3. `cd "$(mktemp -d)"`, run the argv as `Bun.spawn`/direct invocation with the appended flags, tee stdout to `proof-run.jsonl`, capture exit code (criteria 3, 4).
4. Write `proof-run.md` per criterion 5 and check criterion 6.
5. Nothing to commit.

Advisory size: 0 repo files + 2 leaf artifacts, under 12 turns (the model call itself takes minutes; wait on its exit, never a sleep-then-read).

## 7. Commands

Your changed-test command (expected to run nothing — you commit no files):

```bash
AKROGON_BASE=2645d97ed1682185eea4788844f882a541885d24 bun test --changed="$AKROGON_BASE" --timeout=30000
```

The proof run itself is specified in section 6.

## 8. Done-when, evidence and report

Done when `proof-run.jsonl` and `proof-run.md` exist at the leaf folder with the required contents and the run's exit code is 0 (or a nonzero exit is returned as evidence). Return these filled in:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
