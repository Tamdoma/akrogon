# Implementation report: merge-covers-key

Outcome: implementation complete, all done-criteria verified. Pass ends `failed`
because `checks.test` and `checks.test_changed` are red on base
(`tests/harness-template.test.ts`, 3 tests), with no cause in this leaf's diff.
Same command red at base SHA, comparison established below. This is a stop,
never a handoff.

Base: 3e034dee43f0853446c2ba8f97bb72668ab213dc
Head: fb75a94cb51aa5471316182d9563dcc969f1b759

## Changed files and reasons

- `src/config.ts` (U1, ba25b02): added `merge_covers: z.array(text).default([])`
  after `merge_checks`, a `superRefine` refusing unknown names and non-empty
  covers with empty `merge_checks`, and a repo-name prefix on `readRepo` parse
  errors that keeps the original error type.
- `src/init.ts` (U1, ba25b02): compute root and repo name before proposal parse,
  same type-preserving repo-name prefix on parse errors.
- `tests/config.test.ts` (U1, ba25b02): new cases for default `[]`, output
  presence, unknown-name refusal, empty `merge_checks` refusal, and
  setup-passthrough. No existing expectation changed.
- `skills/merge-issue/SKILL.md` (U2, ea5cb59): stack and solo sentences run
  every `checks` command not named in `merge_covers`, then every `merge_checks`
  command. One clarifier that red runs and reruns reuse the same filtered set.
- `docs/guide/merge.md`, `docs/guide/setup.md`, `skills/init-akrogon/SKILL.md`
  (U3, fb75a94): merge lead states the skip rule, setup gains a `merge_covers`
  bullet, init proposal template gains `merge_covers: []`.

Execution note: config says `implement: subagents` and three worker briefs were
written (`implementation/brief-1.md` to `brief-3.md`), but all three workers
ended with zero tool calls and no file access
(transcripts under the `merge-covers-key-u1/u2/u3` session logs). Delegation was
impossible in this environment, so A implemented all three units inline in the
lane in plan order. Worker worktrees were removed empty; no cherry-picks.

Repair note: the first `readRepo` wrap rethrew a new plain `Error`, which broke
`scanRepo` in `src/status.ts` (it allowlists `ZodError`/`SyntaxError` by type)
and regressed `tests/status.test.ts`. Fixed by prefixing the message on the
original error and rethrowing it, preserving type and `code`. Amended into
ba25b02. Fail-before: `incomplete repositories` failed in leaf, passed at base.
Pass-after: passes in leaf.

## Commands run with pasted results

Artifacts: `implementation/logs/` in the leaf folder holds every log below.

- `bun test tests/config.test.ts --timeout=30000` (C1, C3, C5 output): 21 pass,
  0 fail. Fail-first: default set to `["test"]` turned the default test red
  (1 fail), restore turned green. Refine disabled turned the refusal test red
  (1 fail), restore turned green.
- Fixture execution (C2, C4): `sh implementation/logs/c2-c4.sh`, exit 0, 0.05 s.
  All six merge scenarios wrote only `keep.marker` + `merge.marker` on green
  and rerun, red on failing keep, `drop.marker` absent in all six. Full checks
  side wrote both `keep.marker` and `drop.marker`. Log: `c2-c4.log`.
- `grep -n merge_covers skills/check-issue/SKILL.md skills/implement-issue/SKILL.md`
  (C4): no hits, exit 1. Both passes unchanged.
- `grep -c merge_covers docs/guide/merge.md docs/guide/setup.md` (C5): 1 hit
  each. Stale-rule sweep of remaining `every \`checks\`` hits: all describe
  implement/check passes or setup wrapping, correctly unchanged.
- `bun test tests/docs-links.test.ts`: 3 pass, 0 fail.
- `bun run format`: exit 0. Note: it also reformats the unrelated
  `src/status.ts` (pre-existing drift); reverted, not committed.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000` (checks.test): 539 pass, 3 fail, exit 1, 32.9 s.
  Log: `checks-test.log`.
- `bun test --changed=$AKROGON_BASE --timeout=30000` (checks.test_changed):
  427 pass, 3 fail, exit 1, 22.7 s. Log: `checks-test_changed.log`.

## Base-red comparison (the failed stop)

- Command: `bun test tests/harness-template.test.ts --timeout=30000`
- Leaf log: `implementation/logs/base-compare-leaf.log`, exit 1, 0 pass 3 fail.
- Base log: `implementation/logs/base-compare-base.log`, exit 1, 0 pass 3 fail.
  Base worktree removed with `git worktree remove --force` before the outcome.
- Failing names, identical both sides:
  - `claude template carries no literal subagent model inside --settings`
  - `claude template substitutes opus into the subagent model env`
  - `claude template substitutes claude-opus-5-5 into the subagent model env`
- Tails: test expects no `sonnet`/`opus`/`haiku` literal in the `--settings`
  JSON and `{model}` substitution; tracked `config.yaml` carries the literal
  `claude-sonnet-5-5`. Cause: committed config and committed test disagree at
  base. No touched file or plausible cause in this leaf's diff: the leaf never
  edits the harness template, `readGlobal`, or `config.yaml`, and the failure
  is identical with the diff absent.
- Why base explains leaf: same file, same 3 tests, same assertion text, same
  exit status. Failing names match exactly.
- Not fixed here: neither the test expectation nor the config value contradicts
  the brief or a real source I can cite, so the one-expectation fix clause does
  not apply. Owner decides which side is right.

## Known limitations

- Plan limitations stand: coverage is declared, never inferred; merge skip
  proof is manual fixture execution, no automated test reruns the six paths.
- `bun run format` reformats the unrelated `src/status.ts` on every run;
  pre-existing drift, left untouched.

## Unverified criteria

- None. C1-C5 all verified with passing proof above. The blocker is checks red
  on base, not an unverified criterion.
