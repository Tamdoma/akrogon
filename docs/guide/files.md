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

- **ISSUE.md** explains the overall goal and related leaves.
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

Previous: [Phases](phases.md) · Next: [gacp](gacp.md) · [Home](../../README.md)
