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

- `attempt` is the merge attempt id.
- `repo` is the registered repo name.
- `holder` is the holder leaf slug.
- `members` lists carried member slugs; it appears only on lines written before batching was removed.
- `built_on` is the remote tip the holder was rebased onto.
- `tested_top` is the head the checks ran against; it is absent when the attempt ended with no checked top.
- `outcome` is `merged` or `red`; `held`, `split`, `reuse` and `ejected` appear only on older lines and still parse.
- `culprit` appears only on older `ejected` lines.
- `start` is the batch creation time; it is absent on batches created before this field existed.
- `end` is the attempt end time.
- `pressure` holds cpu, memory and io stall in integer microseconds (the `some` `total=` increase over the attempt); it is absent when the batch predates this field, the host has no `/proc/pressure`, or the host rebooted mid-attempt.
- `tools` lists the repo's declared `tools:` as `{name, path, version}` resolved once when the merge batch is dispatched; it is absent on lines predating this field and when the repo declares no tools.

The command writes `merged` and `red` now.

## timings.jsonl: record when each stage happens

Timing events append one JSON line each to `issues/timings.jsonl` in the registered repo, beside `issues/log.jsonl`. The two are separate files: `log.jsonl` records lifecycle moves, `timings.jsonl` records when visits, prompts, checks and waits happened. Like other issue records, the lines are committed through `akrogon sync`. A failed append warns on stderr and never changes the outcome of the move, prompt or check.

Each line names its event kind:

- `visit_start` is `akrogon phase` after a move, or `akrogon next` first seeing a leaf.
- `prompt` is `akrogon next` delivering or failing a seat prompt.
- `seat_done` is `akrogon phase` finishing a paired seat without a move.
- `check_start` and `check_end` are `akrogon run-check` starting and ending a check; `check_start` carries optional `wait_ms`, the time spent registering the run before its immediate start.
- `batch` is `akrogon next` creating a merge batch record; `members` appears only on older lines.
- `wait` is `akrogon next` or `akrogon park` opening or closing a wait.
- `repo_pause` is `akrogon pause` or `akrogon unpause` toggling the repo.

## akrogon timing: read where each leaf's time went

`akrogon timing <slug>` reads `timings.jsonl` and `log.jsonl` and prints one line per closed phase visit. Each visit's elapsed time splits into waiting by reason (`repo_pause`, `parked`, `prerequisite`, `merge_turn`), prompted time (first delivered prompt to phase exit), and unattributed `wait none`; the components sum to the elapsed time. Paired `check_start`/`check_end` runs print inside prompted time. A closed visit missing an expected record, such as a delivered prompt, a paired review's `seat_done`, or a check's end, prints an `incomplete` line naming it.

`akrogon timing --cohort --since <iso>` evaluates the leaves-as-chunks gate over the records: the first 20 leaves whose first delivered plan prompt follows the marker, excluding any whose first implement exit exceeds 600 changed lines, and prints `pass`, `fail` or `insufficient` with one line per member. The gate bounds live in `src/timing-report.ts` with the decision they encode. The command is read-only; it never mutates records or takes action on the result.

`akrogon timing --flow --since <YYYY-MM-DD>` reads GitHub instead of the local records: one `state=all` issue listing per repository a leaf's `sources` names, with pull requests dropped. Each leaf-carried issue prints one line: filed time, handoff date (the earliest carrying leaf's `created`), merged time or `open`, whole days waited, total span and leaf count. Open issues no leaf carries print an `uncarried` line with filed time and age. Summary lines split the handed-off issues on whether the handoff date fell before `--since` or on and after it, give the uncarried backlog's median and oldest age, and count closed issues no leaf carries. The command is read-only; it never mutates records or takes action on the result.

## akrogon flaky: list checks that flipped

`akrogon flaky` reads `issues/verify-runs.jsonl`, the receipt `akrogon verify` writes for every run, and prints one line per verify command and failed test that went red and then green on the same tree: the count, the last time, the check name and the test name parsed from the red log's `(fail)` lines. It skips runs that never finished or whose setup failed. A same-tree flip shows an inconsistent result on unchanged code; it does not say whether the test, the code or an outside input caused it, so each line is only a candidate for the next charting pass.

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
