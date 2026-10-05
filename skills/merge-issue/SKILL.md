---
name: merge-issue
description: Rebase a reviewed leaf onto its configured remote branch, run checks, push fast-forward, gather the completion owner's briefs, and run one broadcast only when `issue complete` or `epic complete` prints.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Merge issue

The prompt is `merge-issue <slug> slot=B phase=merge leaf=<folder>`; B merges in the existing leaf worktree.

## Shared context

Read `akrogon config` once, locate the unique leaf under the registered repo's authoritative `issues/open/`, and read its plan, `implementation/report.md` and reviews, using configured `remote` and `default_branch` (defaults `origin` and `main`).

Pass artifacts are written under the `leaf=` folder while code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`.

Temp files, logs, and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

The command owns state, repair counts and dispatch; a resumed merge inspects the existing rebase, diff and remote ancestry to complete remaining work.

The merge seat completes the pass from its own reads and commands, requesting nothing and stalling for nothing. When a step physically requires the operator (a permission B cannot grant, an env value B cannot obtain), B writes the blocker into `review-B.md` with its name or ID, the attempted operation, the identity it used, the observed error, the owner and the exact operator action, never a value, under the `leaf=` folder, runs `akrogon phase <slug> failed --reason "<blocker; see review-B.md>" --slot B`, and ends the pass. A review finding whose fix needs operator access follows the operator-only rule in check-issue Shared context. This stop covers only blockers only the operator can clear; rebase conflicts, red checks, and push handling below are unchanged.

The merge seat never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, except that configured merge checks may read the committed non-secret template `.env.example`, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence with the `Missing:` lines of `akrogon status <slug>`, where an absent or empty value counts as missing, ending the pass with the stop above when a required value is absent.

The merge seat reuses `grants[]` for probes, implementation, repairs, reruns, merge checks and cleanup without asking again; before mutating it compares operation, target and identity with the grant, records the grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under the stop rule. Proof fixtures are cleaned up on success and failure with the cleanup identities in `grants[].fixtures[].cleanup`; absence is proven by `absence_check`, an authenticated read-back, never by a delete reply; leftovers are a blocker recorded with IDs, error, owner and next step; resources in `retained[]` are labelled apart from still-to-delete ones.

## merge

Before pushing, commit scoped outstanding changes (each scoped commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, and a commit adding a case to an existing test file names what was added and that no existing expectation changed, citing no source), fetch the configured remote, rebase onto `<remote>/<default_branch>`, refresh `AKROGON_BASE` from `akrogon config` after rebase, and run every `checks` command, then every `merge_checks` command, in the worktree, recording evidence in `review-B.md` under the `leaf=` folder and advisory failures as Nits.

A local default branch is unnecessary; ordinary git non-fast-forward refusal serializes competing pushes.

On a rebase conflict, resolve it in the worktree keeping both true sides, complete the rebase, and record in `review-B.md` under the `leaf=` folder the rebase target, the prior reviewed head, the resolved head and `git range-diff <old-base>..<prior-head> <target>..<resolved-head>` before running the checks, where old-base is the `AKROGON_BASE` value before the post-rebase refresh.

On red checks, append the failing output, the rebase target commit and the rebased head to `review-B.md` under the `leaf=` folder, call `akrogon phase <slug> check.fix --slot B`, and finish with the actual result and repair footer.

Same-line index conflicts retain both true entries and recheck pointers. An existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source (a real build, user action or content, integration or attacker-reachable input) that the old expectation contradicts. A new test needs no cited source. A wrong test exposed by the rebase, its expectation contradicting a brief outcome or a real source, is fixed in its own commit with the reason and the merge continues; a broken default branch discovered by this leaf is fixed forward with failing tests as criteria.

After green checks and before the push, B runs `akrogon phase <slug> merged --slot B --check`, which verifies the `Test-Change:` trailers on the changed files matched by the path rule in `src/test-files.ts`; on a refusal B adds a commit carrying the missing trailer when the change has a real source, a trailer-only empty commit when the change sits inside a rebased commit, or reverts the change, then reruns the checks and `--check` before pushing.

After green checks, push `HEAD:<default_branch>` to the configured remote fast-forward only, repeating fetch/rebase/checks after a non-fast-forward rejection; for a lost reply, fetch and use `git merge-base --is-ancestor <pushed-head> <remote>/<default_branch>` to establish whether the intended commit landed before trying again.

Other push errors are reported with their cause rather than retried as competing merges, and an unchanged successful check run is reused only when neither code nor integration changed.

Gather the completion owner's briefs (the issue's, or every leaf brief under the epic when the leaf has one) before its folder may move, then after confirmed push success run `akrogon phase <slug> merged --slot B`, and only when this invocation prints `issue complete` or `epic complete`, run the broadcast-issue skill yourself in this session with that context and repo worktree; the broadcast is always sent by the merge slot, never by a subagent or another agent, because the tab closes as soon as this pane goes idle after `merged`.

A failed broadcast is visible but leaves the merge complete, while GitHub closure and completed-folder moves belong to the command.

Finish by printing the footer as the last act; the command closes this tab once this pane goes idle or exits after `merged`, a manual sweep or startup cleanup closes any tab a merge left open, and only those sweeps remove the worktree and branch once the issue folder has moved.

## Printed footer

```text
Last operation: <push/check evidence and observed phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>
```

A repair move names `implement-issue <slug> slot=A phase=check.fix leaf=<folder>`; completion uses `Next: none merged`, failure uses `Next: none failed`, and another unresolved error names its actual reason without inventing a state move.
