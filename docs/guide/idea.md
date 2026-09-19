# The idea

Akrogon runs coding agents through a shared workflow: plan, implement, review, merge. You define the work and decide when to start it.

Suppose your project is here:

```text
~/Work/widgets
```

You want to add CSV export. You describe what it should do, including how to handle empty data and commas inside values. Akrogon gives that work to two agent seats and tracks their progress.

It does not decide what your product needs. It does not deploy the result.

## Why a file and not a program

Each small piece of work has a state file. It records the current phase and which seats have finished their part.

```text
issues/open/export-csv/export-csv/state.yaml
```

You can read it, commit it and inspect its history with Git. The agents use Akrogon's phase command to update it. They do not need to remember the whole workflow in their conversation.

The file records progress. It does not restore an agent's lost conversation or prove that a process is healthy. [State](state.md) explains the fields.

## Why two seats instead of one smart agent

Seats A and B have different jobs. B implements the change. A handles merge. Both review the first implementation.

When paired planning is enabled, both seats first propose a plan without seeing the other's answer. They then resolve disagreements before implementation.

The seats can use the same harness and model. Two seats give you separate passes over the work, not a guarantee that mistakes will be caught.

## The concrete use

For CSV export, the brief might say:

- Export the same rows as the existing JSON export.
- Keep commas and quotes inside a value intact.
- Write a header even when there are no rows.
- Keep JSON export working.

After the leaf is ready, start it from the project root:

```sh
cd ~/Work/widgets
akrogon next export-csv
```

Akrogon creates the worktree and agent seats when capacity is available. Herdr events trigger later dispatch passes as the agents finish.

You can inspect progress at any time:

```sh
akrogon status export-csv
```

## From request to merged code

The whole workflow has two parts. You settle what the change should do. The execution seats then work through that contract.

For CSV export, the path looks like this:

```text
Observation: users need CSV
  -> chart: choose rows, columns and behavior
  -> brief and design: record the agreed requirements
  -> plan: choose files, steps and tests
  -> implement: build and check the change
  -> review: find concrete defects
  -> fix and re-check, when needed
  -> merge: rebase, check and push
  -> broadcast: report the completed issue, when configured
```

State files and pass artifacts connect these steps. Herdr supplies the agent panes and events. Skills tell the agents how to do each job. Akrogon's commands validate and record the transitions.

This gives you a place to inspect both the current state and the work behind it. You do not have to reconstruct the plan from terminal scrollback.

Previous: [README](../../README.md) · Next: [Parts](parts.md) · [Home](../../README.md)
