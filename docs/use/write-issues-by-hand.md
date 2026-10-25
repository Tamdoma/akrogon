# Write issues by hand

When the work is already clear, you can skip charting and write the leaf files yourself. Then use `blocked-by` to say which leaves must merge before others start.

## Make the folders

A leaf is a folder under `issues/open/` in your registered checkout. It sits two or three folders deep:

```text
issues/open/<issue>/<slug>/
issues/open/<epic>/<issue>/<slug>/
```

Put these files in place:

```text
issues/open/<issue>/
  ISSUE.md
  <slug>/
    brief.md
    design.md
    state.yaml
```

- `ISSUE.md` states the issue's overall goal. An epic folder holds `EPIC.md` for the epic's goal.
- `brief.md` is the leaf contract: the files it owns, its limits and how to tell it is done. Write concrete cases, for example "empty data still produces a header".
- `design.md` holds decisions the seats need. Leave it out if you have none.
- `state.yaml` holds the leaf's lifecycle state.

The seats read `brief.md` and `design.md` at every phase. See [plan-issue](../../skills/plan-issue/SKILL.md). The full file list is in [files.md](../reference/files.md).

## Write state.yaml

Start with these fields only:

```yaml
slug: <slug>
phase: plan.synthesis
created: <date>
repo: <repo>
blocked-by: []
sources: []
```

- `slug` must match the leaf folder name. Use lowercase words joined by `-`. Each slug must be unique in the repository. Two leaves with the same slug are both reported as unreadable.
- `repo` is the repository's name from the `repos` list in your machine config. A leaf with a different name is skipped.
- A leaf starts at `plan.synthesis`, where seat A writes the plan.
- Optional: list GitHub reports this leaf delivers in `sources`, as `owner/repo#n`. They are closed when the leaf's issue or epic completes.

Leave every other field to the commands. Field details are in [state-and-phases.md](../reference/state-and-phases.md).

## Start the leaf

A new folder does not start anything. Run:

```sh
akrogon next <slug>
```

Akrogon reads the state, checks dependencies and capacity, then prompts the seats. See [Run work](run-work.md).

## Order leaves with blocked-by

Add a leaf's slug to `blocked-by` when this leaf needs that leaf's merged code:

```yaml
slug: <slug>
phase: plan.synthesis
created: <date>
repo: <repo>
blocked-by:
  - <other-slug>
sources: []
```

- Entries are leaf slugs, not issue folder names.
- The leaf starts only when every listed leaf is merged. Until then `akrogon next` prints `waiting: <slug> on <other-slug> (<phase>)`.
- A listed leaf that is failed, parked, missing or unreadable is an error, and the leaf does not start.
- When a leaf merges, akrogon starts the leaves in the same repository that list it.
- Akrogon does not check for cycles. Two leaves that list each other never start.

`blocked-by` is not a priority list. Leave it empty when leaves do not depend on each other, and they can run in any order.

`akrogon status` shows each leaf's `blocked-by` list on the board. The full command list is in [commands.md](../reference/commands.md).

Next: [Report an observation](report-an-observation.md)
