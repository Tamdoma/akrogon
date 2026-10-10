# Leaf review, slot C (both charts)

Code read at origin/main 0f13951. Paths relative to /home/ivan/Work/infra/akrogon.

## merge-clean-worktree

### F1. A's restatement is a mechanism change, and the right one; record it in the fork, not only in the design

Taken 1a (forks/gate-tree.md:21-22) binds two things: `git clean -fd`, and "clean only after git reports a clean status". A's version (design.md:11) drops the precondition and replaces `-fd` with "remove the folders `git clean -nd` lists that contain no file". Effects differ in one state: a dirty holder worktree. That state is real at prompt time, since a dirty holder is what makes a batch solo (src/phase.ts:573-592 `dirty-holder`, :603-619 `lateDirty`). Under the literal rule a dirty solo holder is never cleaned, which leaves the #63 hole open in exactly the solo mode; under A's rule it is cleaned and no file can be lost. So the restatement serves the rule's purpose better, but it is not the same mechanism. Fix: add a one-line correction under the fork's Taken ("empty untracked folders are removed in every state; the clean-status precondition is replaced by the never-remove-a-file rule"), so the operator sees the change, and keep design.md:11 as the interpretation.

Measured 2026-10-10 in a scratch repo: `git clean -nd` lists `empty-root/`, `tracked/empty-nested/` and also `withfile/` (a folder holding an untracked file), and it does not list a folder holding only ignored files; the listing is the same with a modified tracked file. So the leaf must filter the listing to folders with no file at any depth. Put that filter rule in the brief's What (brief.md:4 says "removes ... folders that contain no files" but not that `git clean -nd` is the source and must be filtered).

### F2. Criterion 1 asks the command test to prove something only B's gate can show

brief.md:10: "a test depending on that folder fails at the gate as it does on a clean checkout". The command never runs `checks`; B does (skills/merge-issue/SKILL.md:41,51). A command-level test cannot show a gate failure. Fix: criterion 1 proves the folders are absent after the prompt in both forms (for example `git clean -nd` prints nothing for them), shown failing before the change. Drop the gate-failure clause.

### F3. Criterion 5 names a guide page that does not exist, and the design forbids the page that does

No `docs/` page describes what the gate runs on (grep for "in the worktree" and "HEAD in the worktree" over docs: none; docs/guide/setup.md:54 says only "on the rebased leaf before push"). The sentence that does describe it is skills/merge-issue/SKILL.md:41,51, and design.md:23 excludes "no skill text change for B". Fix: either own one clause in merge-issue SKILL.md:41 and :51 ("on `HEAD` in the worktree, after the command removed empty untracked folders") and drop the exclusion, or point criterion 5 at docs/guide/setup.md:54 by path. Pick one.

### F4. Missing worktree must not count as a failed removal

Criterion 4 (brief.md:13) stops the prompt on a failed removal. A leaf can hold the merge turn with `state.worktree` undefined or the path absent (src/batch.ts:81 already guards `existsSync(leaf.state.worktree)`; ensureWorktree runs inside dispatchLeaf at src/next.ts:367, after the point the brief puts the clean). Fix: state in What that no worktree means nothing to remove, and place the call where the worktree is known to exist (after ensureWorktree inside dispatchLeaf for merge context, or guard the same way move() does).

## merge-attempt-pressure

### F5. Criterion 1 measures "from batch creation", but held, ejected and split lines are written for batches that may be restacked

src/phase.ts:580-590, :605-618 and :668-680 rebuild the batch with `...batch`, so `started` and any start counters carry across restacks; appendAttempt reads `batch.started` (src/attempts.ts:33). That makes criterion 1 satisfiable as written, but only if the start counters live on the batch record and every rebuild spreads the old record. Fix: add to What that the counters are a field of the batch record (src/state.ts batchSchema:42-58) carried by every `...batch` rebuild, and make criterion 1 include one restacked attempt (decision `rerun` then `reuse`) so a rebuild that drops the field is caught.

### F6. Injectable counter path conflicts with "no new config, flag"

design.md:17 wants tests to point the reader at a directory standing in for `/proc/pressure`; design.md:23-24 lists no interface for that. Fix: name it in the interface: a module-level default of `/proc/pressure` overridden through the function parameter used by tests (appendAttempt and the batch creation call take a reader), no environment variable and no config key.

### F7. Criterion 4 names "the guide page that documents merge-attempts.jsonl" without a path

The planner must find it; a grep over docs for `merge-attempts.jsonl` gives one file-level hit (docs/guide/problems.md) with no matching line on a line grep, so the page is unclear. Fix: name the page path in the brief, or state that no page exists and the leaf adds the field description beside the schema in src/attempts.ts only.

## No finding

- Both charts: merge-throughput leaves are closed (issues/closed/merge-throughput holds all eight), so empty blocked-by and "no coordination left" are correct.
- PSI: this host's `/proc/pressure/{cpu,memory,io}` carry `some ... total=` counters; cpu `full` is zero, and the brief's `some`-only choice is right.
- appendAttempt is called for every outcome criterion 1 lists (src/phase.ts:481,737,829,886,901,905; src/next.ts:914,932,951).
