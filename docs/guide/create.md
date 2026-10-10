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

The seed skill files one GitHub issue with six sections: the observation, location, reproduction, expected behavior and impact, plus a last `## Suspected cause`. That section carries a hypothesis labeled unverified, or "no supported hypothesis" and the evidence needed next. The report marks itself as unverified intake.

To form that hypothesis, the agent reads the files the failure names and follows them one hop, reading only. It stops at a hypothesis or a named evidence gap.

The destination is the repository's configured `issues_repo` or its GitHub origin. When a path the failure names is absent from the current repository but lives under the installed Akrogon checkout, the report routes to that checkout's issue repository instead; if the `akrogon` command cannot be resolved then, the run stops naming the path and reason.

It also runs two read-only `gh` searches on the routed repo: the account's reports from the last two days, and a 2-3 word keyword search. Linked reports are listed with a reason each; "none found" or "search failed" is recorded instead. A found report covering the same failure ends the run with its URL and files nothing.

You can capture a problem while its details are still incomplete. The skill records missing details and unsupported causes instead of guessing.

For example:

```text
/seed-issue CSV export drops the last row when the list has 500 rows
```

The result is a report URL, newly filed or already covering the failure, not an implementation plan. After filing, when several reports share one suspected condition, the skill may print one `/seed-issue` line you can run to file a root report. The report itself stays one issue per run.

Pull imports reports into the seed store:

```sh
cd ~/Work/widgets
akrogon pull
```

Use [Chart](chart.md) to investigate the report and decide what work belongs in a leaf.

Previous: [Setup](setup.md) · Next: [Chart](chart.md) · [Home](../../README.md)
