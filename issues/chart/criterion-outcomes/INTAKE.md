# Intake: criterion-outcomes

## Scope

A wrong or base-red proof command in a leaf contract is corrected inside the lifecycle without an operator stop, while the operator-approved outcome stays fixed.

Part of a six-chart pass opened 2026-10-18 over seeds #102-#108; sibling charts: paid-proof-bounds, merge-stacks, owner-completion, state-unknown-keys, criterion-outcomes, sync-identical-ignored. No dependency between them.

## Provenance

- GitHub: Tamdoma/akrogon#105
- Operator: 2026-10-18 chart-issues invocation
- Operator: 2026-10-18 split round answer

## Source: operator 2026-10-18 invocation

> Let's check all of the issues that were pulled and chart them out. Use slot b and c consultants that are already active. We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code.

## Source: operator 2026-10-18 split round

> 1a | 2a | 3a | 4a

Round answered 2026-10-18: 1a fold #103 and #108 into one chart; 2a order #107, #104, #103+#108, #102, #105, #106; 3a leave the two flaky tests out; 4a no framework replay-resume chart now.

## Source: Tamdoma/akrogon#105

# Done-criterion command already red at base still stops a leaf for the operator (recurrence of #47)

Source: Tamdoma/akrogon#105
URL: https://github.com/Tamdoma/akrogon/issues/105

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

Leaf `registered-rule-loading` (issue `stray-rule-loading`, framework) was charted at 07:58Z on 2026-10-18 and moved to `failed` (blocked@check.fix, slot A) at 08:13Z, after two review/fix rounds.

Done-criterion 4 named a literal shared-process command:

```
bun test .claude/hooks/tests/engine.test.ts .claude/hooks/tests/rule-pipeline-order.test.ts .claude/hooks/tests/failure-path-close.test.ts
```

That command has the same 9 failures at base `5319be650` and at head `9762505ff`. The failures come from module-scope state leaking between two sibling test files that the leaf does not own. The repo's own runner, `hooks:selftest`, uses `bun test --isolate`, and with it all three files and `hooks:verify` pass. Seat A recorded a "human-only blocker" and asked the operator to amend the criterion (`implementation/report.md:32-41`).

The operator changed the criterion to `--isolate` and resumed the leaf, which cost about 25 minutes plus an operator round trip.

## Location

- Charting: how chart-issues writes done-criteria commands.
- check-issue: handling of a criterion command that is red at base. The known-red path in `skills/check-issue/SKILL.md:69` covers checks during check.review.

## Reproduction

Chart a leaf whose done-criterion names a test command that is already red on base for a cause outside the leaf. Seen here, and earlier in #47 (`framework:verify` red at base).

## Expected behavior

A criterion command that is red at base is either caught before handoff or settled through the lifecycle without stopping the leaf for the operator.

## Urgency

Medium. Each case costs one or two review/fix rounds plus an operator stop, and it can repeat on any leaf that names a literal test command. Workaround: the operator edits the criterion and resumes with `akrogon phase <slug> check.fix`.

## Suspected cause

Supported hypothesis:

- **Main condition:** nothing checks a criterion's literal command against the base when the contract is written. The command here was not the repo's runner (`--isolate`), and it was red at base before the leaf existed.
- **Contributing condition:** the known-red step (`check-issue/SKILL.md:69`) applies to red checks in check.review. A done-criterion that names the red command is treated as a wrong criterion, which only the operator can change.

Whose view: agent. The reporter saw the failure and asked for a systemic fix.

Files read:
- leaf `brief.md` and `implementation/report.md`
- `package.json:8` (`hooks:selftest` uses `--isolate`)
- akrogon checkout `skills/check-issue/SKILL.md:69`
- `skills/chart-issues/SKILL.md` (grep only)
- #47

Not inspected:
- What closed #47.
- The chart preflight steps in full.

Related reports:
- Tamdoma/akrogon#47 (closed): the same class, a done-criterion command red at base attributed to base. This is a recurrence after it was closed.
- Tamdoma/akrogon#50 (closed): seats cannot tell new failures from base failures. Related.
- Searched Tamdoma/akrogon, all states, limit 8, with "criterion red at base", "known-red criterion" and "done-criteria command base".

## Agent findings

Opening map merged with attribution: issues/chart/paid-proof-bounds/slots/map-merged.md, sections for #105.
