# Design: check-path-print

## Binding decisions, verbatim

### Log coverage
From [log-coverage.md](../../../chart/check-evidence/forks/log-coverage.md).

Operator, 2026-10-15: `1a | 2a | 3a`. Chart direct logs are packed when the chart ends, by one command the door runs, with a status warning for an ended chart holding loose logs. Every kept command output goes through `akrogon run-check`, which prints the saved path; skills stop telling seats to copy logs. No guard against stray logs; the close-time pack takes them.

Reason: every log has one writer and one naming rule, and every folder ends clean (operator, worktree-cleanup: "I want all folders to be clean of junk and leftover files").

Foreclosed: committing chart direct logs plain; ignoring them and keeping them on this host only; a hook in chart-usage.ts plus a sync pass as the trigger; allowing purposeful hand-saved extra logs; a filename or duplicate-content guard at phase moves.

Final shape, verbatim:
  7. The `runCheck` CLI wrapper (src/run-check.ts:143), not `checkedRun`, prints `check <name>: <exit> <kept path>` to stderr, starting on a new line (B,C). tests/check-names.test.ts:26 and tests/run-check.test.ts:428 match whole stderr and change with it (C).
  8. Skills: a seat keeps command output only through `akrogon run-check --name <label> -- <cmd>` and cites the printed path, pasting at most a short excerpt into Markdown. Exempt: printed check commands and `akrogon verify`, which already keep logs (C); `akrogon phase ... merged`, which moves its own owner (B); coordination commands (fetch, push), whose errors are quoted in the report as text (C). On the direct route the holder is the absolute `<chart>/direct` path, and check-issue SKILL.md:101 allows those logs (C). Standalone implement-issue has no registered repo and is outside this rule (C). Lines: implement-issue SKILL.md:25,38,65,80, worker-protocol.md:29, brief-template.md:43; check-issue SKILL.md:18,67,69,83,85,101; merge-issue SKILL.md:18,41,53,55,75; plan-issue SKILL.md:69; chart-issues SKILL.md:85,114,121 (C).
  9. No guard refuses stray logs.


Excluded here: items 1-4 and 6 belong to [close-pack](../close-pack/brief.md) and [folder-pack](../folder-pack/brief.md); item 5 belongs to [log-reader](../log-reader/brief.md). In item 8's line list, the chart-issues lines :85, :114 and :121 append end markers and keep no command output; they go to folder-pack alone, which adds the pack step there (C). The direct-route holder rule is covered by the implement-issue and check-issue lines in the list. Item 9 needs no code.

Evidence location and existing backlog decisions are excluded: they cover where logs live and how old logs migrate, not how seats keep output.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, here an `akrogon` invocation or exported function over a temporary repo and temporary `AKROGON_HOME`/`HOME` with the existing test helpers (tests/helpers.ts). No bug fix is in scope. New behaviour shows one deliberate break turning its test red. No new test machinery: no runner, pool or fixture factory is built. No live model or outside call is part of any criterion, and no live run. Secrets, auth and UI lines of the standing design do not apply.

## Leaf architecture

Owned surfaces:
- `runCheck` in src/run-check.ts (the CLI wrapper), not `checkedRun`: after `checkedRun` returns `{ code, log }`, write `check <name>: <code> <log>` to stderr, preceded by a newline only when the command's last stderr byte was not a newline. `checkedRun` writes `result.stderr` itself and returns only `{ code, log }`, so it may grow its return with whether stderr ended in a newline, which `verify` ignores (C).
- Skill lines from the item 8 list: implement-issue SKILL.md:25,38,65,80, worker-protocol.md:29, brief-template.md:43; check-issue SKILL.md:18,67,69,83,85,101; merge-issue SKILL.md:18,41,53,55,75; plan-issue SKILL.md:69. Each also names `akrogon log <path>` as how a cited path is read (evidence-location Taken item 8, moved here from log-reader so one leaf edits each line) (C). Line numbers are from origin/main f3557d8; the plan re-reads them.

Consumers of the changed state:
- `checkedRun`'s other caller, `verify` in src/verify.ts, does not print through `runCheck` and sees no change (B,C).
- tests/check-names.test.ts:26 and tests/run-check.test.ts:428 match run-check's whole stderr; their expectation changes with the new line (a false expectation deleted with its reason, per standing design).
- Seats and scripts that parse run-check stderr: none known. Open for the plan: confirm with a search of `skills/` scripts.

Exclusions: the resolver and reader skill lines (log-reader); packing, `.closing`, run-check refusal and ignore lines (close-pack); `akrogon pack`, status listing and the door's pack step (folder-pack).
