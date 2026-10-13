# Implementation report: serial-plan-solo

Base: `9bc0346619815947983df36c13329f695c371c6b` (origin/main at implement; rebase was a no-op, already up to date).
Head: `df88689` — `implement-issue: run single-unit-wave plans serial-solo under delegated config`.
Mode: `implement: subagents` with a one-unit plan, run serial-solo per D3: no sub-briefs, no worker worktrees, A implemented directly.

## Changed files and reasons

- `skills/implement-issue/SKILL.md` — owns the rule. Implement section: with `subagents` config and every wave in the final `plan.md` holding exactly one unit, the run is serial-solo and A implements itself in wave order whatever the serial reason; its repair passes keep delegating. The next paragraph reads "a run without delegation — `inline` config or serial-solo —". The overlap item reads "delegated runs only (never serial-solo)" with "a run without delegation waits for the run". The check.fix section keeps delegated repair waves and now names a leaf that implemented serial-solo so "in delegated mode" cannot be read as excluding it. Front-matter `description` names the serial-solo path.
- `skills/implement-issue/worker-protocol.md` — boundary sentences: a leaf delegated implement run exists only when at least one wave holds two or more units; a serial-solo run has no workers, sub-briefs or worker worktrees; a regrouped plan that puts every unit in its own wave is serial-solo too.
- `skills/AREA.md` — the mode bullet now lists inline, bounded workers and serial-solo, with the same boundary and the repair-pass carve-out.
- `docs/guide/phases.md` — the implement-issue paragraph states the same rule for operators ("inline, serial-solo or delegates"; repair passes keep delegating).
- `skills/plan-issue/SKILL.md` — one appended sentence at the end of the wave-rules paragraph naming the outcome (serial-solo, A implements itself) while keeping the per-unit record of why serial order exists. No other change in the file (diff inspected).

## Criterion evidence

1. **Four files state the rule; none still requires delegating an all-single-unit plan.** `grep -c "serial-solo|every wave holds exactly one unit|every wave in the final"` returns SKILL.md:4, worker-protocol.md:2, AREA.md:1, phases.md:1. Reading each file: every remaining delegation statement is conditioned on a wave holding two or more units or names a repair pass (which keeps delegating by design). `grep "delegate them to subagents|write one sub-brief per unit" skills/ docs/` hits only inside the corrected context and unconditional standalone/repair text, which the brief leaves unchanged. No file still mandates workers for a serial plan.
2. **plan-issue wave rules unchanged except one cross-reference.** `git diff 9bc0346..HEAD -- skills/plan-issue/SKILL.md` shows a single appended sentence in the wave-rules paragraph, no other hunk; the sentence itself records the serial reason (prerequisite, shared path, shared test resource), so plans keep stating why each unit is serial.

## Commands run

| Command | On | Result | Wall time |
| --- | --- | --- | --- |
| `git fetch origin && git rebase origin/main` (refresh) | uncommitted tree | Already up to date; no rebase movement | seconds |
| `akrogon run-check --name 'test_changed'` | `df88689` | exit 0 — "5 changed files, but no test files are affected" | seconds |
| `akrogon run-check --name 'format'` | `df88689` | exit 0 — prettier, all files unchanged | seconds |
| `akrogon run-check --name 'test'` | `df88689` | exit 0 — 843 pass / 0 fail, 44 files | ~105 s |
| `akrogon run-check --name 'typecheck'` | `df88689` | exit 0 — `tsc --noEmit` clean | seconds |

Run logs under `implementation/`: `check-test_changed-*.log`, `check-format-*.log`, `check-test-*.log`, `check-typecheck-*.log` (the `-17918437…` files are this pass's final runs; the earlier `check-*-17918433/34` logs are the plan.synthesis baseline runs, also green).

## Known limitations

- Proof of the new rule is text review plus the existing suite, per the standing design (skill-text leaf; no test pins delegation wording). The first real leaf whose plan is all single-unit waves is observed through the worker-timing record at the door, not here.
- `brief-template.md` was deliberately untouched: its "a delegated leaf writes brief-1.md…" wording describes delegated runs, and the design's owned-file list excludes it. If reviewers read it as still mandating briefs for a serial-solo plan, that is a scope call for review, not a missed edit.
- Unverified criteria: none. Both criteria are proven above.
