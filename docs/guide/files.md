# Files

The main checkout holds the issue record. The leaf worktree holds the code changes.

For our example, start with these records:

```text
~/Work/widgets/issues/open/export-csv/
  ISSUE.md
  export-csv/
    brief.md
    state.yaml
```

Later passes add planning and review artifacts inside the leaf folder. Keep those records out of the leaf's code commits.

## What each artifact is

- **ISSUE.md** explains the overall goal and related leaves. It and **EPIC.md** may open with a `slots` front matter block that replaces a machine seat for that issue or epic:

  ```markdown
  ---
  slots:
    b:
      harness: codex
      model: gpt-5
      effort: high
  ---
  # Issue: my-issue
  ```

  Seats are `a` or `b` with a full {harness, model, effort}. The nearest set seat wins: issue `ISSUE.md`, then epic `EPIC.md`, then repo `issues/config.yaml`, then machine `config.yaml`. It applies at the next agent start.
- **brief.md** is the leaf contract: scope, ownership, constraints and completion criteria.
- **design.md**, when present, records decisions needed to implement the brief.
- **state.yaml** records lifecycle progress.
- **Planning artifacts** hold the seats' proposals, disagreements and final plan.
- **Implementation artifacts** record what was built and how it was checked.
- **Review artifacts** record concrete defects and verdicts.

The skills define which pass artifacts to write. Read the brief first, then the artifacts required for your phase.

For CSV export, keep a product decision such as column order in the contract. Put the chosen implementation steps in the plan. Put a failing quote-escaping case in the review findings.

Commit issue records from the main checkout:

```sh
cd ~/Work/widgets
akrogon sync
```

That command commits eligible issue data. It excludes imported seeds, lock files and the configured worktree directory. It does not commit the leaf's code for you.

When the containing issue is complete, Akrogon moves its records into the closed store. If it belongs to an epic, the whole epic must be complete before that top-level folder moves.

## merge-attempts.jsonl: record each merge attempt

Every merge attempt end appends one JSON line to `issues/merge-attempts.jsonl` in the registered repo, written by the command beside `issues/log.jsonl`. The two are separate files: `log.jsonl` records lifecycle moves, `merge-attempts.jsonl` records merge attempts. Like other issue records, the lines are committed through `akrogon sync`.

Each line carries:

- `attempt` is the batch attempt id.
- `repo` is the registered repo name.
- `holder` is the holder leaf slug.
- `members` lists the carried member slugs in batch order.
- `built_on` is the remote tip the batch stacked on.
- `tested_top` is the stack top the checks ran against; it is absent when the attempt ended with no checked top.
- `outcome` is `merged`, `red`, `split`, `held`, `reuse` or `ejected`.
- `culprit` is the leaf slug named as the cause; it is present only on `ejected` lines.
- `start` is the batch creation time; it is absent on batches created before this field existed.
- `end` is the attempt end time.
- `pressure` holds cpu, memory and io stall in integer microseconds (the `some` `total=` increase over the attempt); it is absent when the batch predates this field, the host has no `/proc/pressure`, or the host rebooted mid-attempt.
- `tools` lists the repo's declared `tools:` as `{name, path, version}` resolved once when the merge batch is dispatched; it is absent on lines predating this field and when the repo declares no tools.

The command writes `merged`, `red`, `split`, `held`, `reuse` and `ejected` now.

## sync: save lifecycle records separately from code

You can edit briefs and inspect reviews in the main checkout while agents change code in worktrees. Sync publishes the eligible lifecycle records without treating every local edit as issue data.

For example, after clarifying the CSV acceptance cases:

```sh
cd ~/Work/widgets
git status --short
akrogon sync
```

Sync takes coordination locks, commits eligible issue changes, fetches, rebases and pushes through the configured remote. It preserves unrelated local edits on success. Restoration conflicts stop the push.

Lesson files are outside the issue store. The skills leave them for the operator to commit.

This separation keeps plans and reviews available at their authoritative location while the code follows its own review and merge path.

```text
Registered checkout on default branch
                 |
                 v
       validate branch and staged paths
                 |
                 v
       fetch + check integration hazards
                 |
                 v
       stage eligible issue records
       (no seeds, locks or worktrees)
                 |
                 v
          commit if changed
                 |
                 v
         rebase + restore edits
                 |
                 v
        push to configured remote
```

For export-csv, sync publishes the brief and review records from the main checkout. A refusal or conflict stops the flow before push.

Previous: [Phases](phases.md) · Next: [gacp](gacp.md) · [Home](../../README.md)
