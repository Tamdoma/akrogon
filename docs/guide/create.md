# Create

A report is not a ready task. Before agents build CSV export, they need a brief that says what to build and how to judge it.

## Which door for what

Use a seed for an observation that still needs investigation:

```text
/seed-issue CSV downloads are missing from widgets
```

Use chart-issues to work through decisions and produce leaf contracts:

```text
/chart-issues Add CSV export to widgets
```

Charting is an operator-led conversation. Execution seats follow the resulting contracts without asking the operator questions.

## Or just write the files

If the work is already clear, write the issue and leaf directly:

```text
~/Work/widgets/issues/open/export-csv/
  ISSUE.md
  export-csv/
    brief.md
    state.yaml
```

The issue explains the overall goal. The leaf brief defines its owned files, constraints and completion criteria.

For CSV export, include concrete cases:

- Ordinary rows produce a header and matching values.
- Commas and quotes stay inside their fields.
- Empty data still produces a header.
- Existing JSON export keeps working.

Start the leaf with:

```yaml
slug: export-csv
created: '2026-09-19'
repo: widgets
phase: plan.synthesis
debate: 'no'
blocked-by: []
sources: []
```

Then dispatch it:

```sh
cd ~/Work/widgets
akrogon next export-csv
```

Akrogon validates the state and checks capacity and dependencies. A new folder alone does not start an agent.

## Ordering with blocked-by

Use dependencies when one leaf needs another leaf's merged code.

For example, the download button can depend on CSV export:

```yaml
slug: download-button
created: '2026-09-19'
repo: widgets
phase: plan.synthesis
debate: 'no'
blocked-by:
  - export-csv
sources: []
```

Dependencies refer to leaf slugs, not issue folder names. Keep those slugs unique within the repository. Avoid cycles.

Do not use dependencies as a priority list. Independent leaves can run in either order.

## seed-issue: capture an observation without inventing a fix

The seed skill files one GitHub issue with the observation, location, reproduction, expected behavior and impact. It marks the report as unverified.

You can capture a problem while its details are still incomplete. The skill records missing details instead of guessing the cause.

For example:

```text
/seed-issue CSV export drops the last row when the list has 500 rows
```

The result is a report URL, not an implementation plan. Pull imports reports into the seed store:

```sh
cd ~/Work/widgets
akrogon pull
```

Use [Chart](chart.md) to investigate the report and decide what work belongs in a leaf.

Previous: [Setup](setup.md) · Next: [Chart](chart.md) · [Home](../../README.md)
