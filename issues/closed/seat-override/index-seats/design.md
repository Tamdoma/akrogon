# Design: index-seats

## Binding decisions, verbatim

### Where the seat setting lives (forks/setting-home.md Q1)

Taken: 1a without the leaf level. The seat setting lives only in YAML front matter at the top of `EPIC.md` and `ISSUE.md`; `state.yaml` gains no field. Resolution per seat, nearest index wins: parent `ISSUE.md`, then grandparent `EPIC.md` at depth 3, then repo `issues/config.yaml`, then machine `config.yaml`. An issue inside an epic may carry its own block for its leaves. Reason: one place per owner. Foreclosed: leaf `state.yaml` override, copy at handoff, slug-keyed repo map, new file.

### Shape of the block (forks/setting-home.md Q2)

Taken: whole seat `{harness, model, effort}`, identical shape in every file, nonblank, keys `a`/`b` only, strict. The machine `harnesses:` launch templates differ per CLI and never appear in an issue file. Foreclosed: field patch.

Binding: malformed front matter or schema failure throws with the file path; an index without front matter means no override; `seats()` takes the leaf path and remains the only resolver; harness template presence validated in the resolver before tab or worktree allocation.

### Visibility (forks/visibility.md Q1)

Taken: 1a. `akrogon status <slug>` prints the effective A and B seats with the file each came from; `akrogon config` inside a managed leaf worktree prints the leaf-effective `slots`; the status table marks a leaf whose seat comes from an index. All read the one resolver and are labelled as the next-start seat, never the running model. A detached worker worktree is not a managed leaf worktree and prints repo seats as today. Foreclosed: config-only visibility.

### Strictness (forks/visibility.md Q3)

Taken: 3a. One seat schema at machine, repo and index level: `harness`, `model`, `effort` nonblank after trim, no quote characters. Foreclosed: a second schema for index blocks only.

### Timing (shared recommendation, forks/visibility.md Carries)

A setting applies at the next agent start per pane (`src/next.ts:527`); an edit while a session runs does nothing until that session ends; no per-phase switch and no automatic session replacement. Batch merge: one holder's B runs the shared merge pass; a per-leaf B choice does not govern a merge carried by another holder; batching preserved.

### Excluded here

The claude template change (forks/worker-model.md) belongs to `subagent-seat-model`. The door's capture rule (forks/visibility.md Q2) belongs to `door-seat-capture`.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md. Interpretation: tests sit at the CLI boundary through the existing fixture in `tests/helpers.ts` with the `fake` harness, as `tests/config.test.ts` and `tests/next.test.ts` already do; each criterion gets the cheapest test that turns red without the change (criterion 1 by asserting the recorded start argv, criterion 2 by each malformed input, criterion 3 and 4 by command output); no mocking of herdr beyond the fixture's existing stub; no live model call is needed because no behavior under test depends on one; prose assertions are avoided, outputs are matched on values and paths.

## Leaf architecture

Owned surfaces: `src/config.ts` (seat schema, front matter reader, `seats()`), `src/next.ts` (`launch()`, pre-allocation validation call), `src/status.ts` (detail block, table marker), `src/config.ts` `effectiveConfig()` (leaf-effective slots in a managed worktree), `tests/config.test.ts`, `tests/next.test.ts`, `tests/status.test.ts` or the existing status test file, `docs/guide/cheat.md`, `docs/guide/files.md`.

Interfaces:

- Front matter: the file starts with a line `---`; the block ends at the next line `---`; the text between is parsed with `Bun.YAML.parse` and validated by `z.strictObject({ slots: z.strictObject({ a: seat.optional(), b: seat.optional() }) })`. Any failure throws an error naming the file path and the parse or schema reason, including the seat key when the reason sits under `a` or `b`. A file not starting with `---` has no front matter. (A,B)
- Seat schema: `z.strictObject({ harness, model, effort })` where each is `z.string().trim().min(1).regex(/^[^'"]*$/)`, applied to the decoded YAML string, so `model: 'opus'` decodes to `opus` and passes while `model: "o'pus"` fails; the same object is used by `globalSchema`, `repoSchema` and the front matter schema. (A,B)
- Resolver: `seats(global, repo, leafPath?: string): { a: SlotConfig; b: SlotConfig; source: { a: string; b: string } }` where `source` is the absolute index path, the repo config path or the machine config path. Index lookup: the leaf path relative to `issues/open` or `issues/closed` has depth 2 (`<owner>/<leaf>`, read `<owner>/ISSUE.md`) or 3 (`<epic>/<issue>/<leaf>`, read `<epic>/<issue>/ISSUE.md` then `<epic>/EPIC.md`), nearest present seat wins per seat; a missing index file contributes nothing. Harness template presence is checked on the resolved seats and throws naming the source and seat.
- `launch(global, repo, slot, leafPath)` resolves through `seats(global, repo, leafPath)`; the validation call before `checkBase` (`src/next.ts:655`) passes the leaf path.
- `effectiveConfig(cwd)`: when the toplevel equals a leaf's recorded `worktree` (realpath compare over `allLeaves(repo)`), `slots` is `seats(global, repo, leaf.path)` minus `source`; otherwise unchanged.
- `akrogon status <slug>`: after the state YAML, prints a `seats:` YAML block `{a: {harness, model, effort, source}, b: {...}}` under a line stating these are the next-start seats. Table `note()` appends `seats <basename of source>` when either source is an index file.

Exclusions: no change to `stateSchema`, `readState()` or its legacy filter; no new file in any issue folder; no harness template change; no skill text change.

Dependencies: none.
