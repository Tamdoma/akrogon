---
name: merge-issue
description: Check the applied merge stack or rebase a solo leaf in its worktree, run checks, let the command push and move the batch, gather the completion owners' briefs, and run one broadcast per `issue complete` or `epic complete` line.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Merge issue

The prompt is `merge-issue <slug> slot=B phase=merge leaf=<folder> attempt=<id> top=<sha>` for an applied stack with the holder on top, or `... attempt=<id> solo` when B rebases its own leaf; B works in the existing leaf worktree and never runs `git push`.

## Shared context

Read `akrogon config` once, locate the unique leaf under the registered repo's authoritative `issues/open/`, and read its plan, `implementation/report.md` and reviews, using configured `remote` and `default_branch` (defaults `origin` and `main`).

Pass artifacts are written under the `leaf=` folder while code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`.

Temp files, logs, and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

The command owns state, repair counts, dispatch and the push; a resumed merge inspects the existing rebase, diff and remote ancestry to complete remaining work.

The merge seat completes the pass from its own reads and commands, requesting nothing and stalling for nothing. When a step physically requires the operator (a permission B cannot grant, an env value B cannot obtain), B writes the blocker into `review-B.md` with its name or ID, the attempted operation, the identity it used, the observed error, the owner and the exact operator action, never a value, under the `leaf=` folder, runs `akrogon phase <slug> failed --reason "<blocker; see review-B.md>" --slot B`, and ends the pass. A review finding whose fix needs operator access follows the operator-only rule in check-issue Shared context. This stop covers only blockers only the operator can clear; rebase conflicts, red checks, and push handling below are unchanged.

The merge seat never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, except that configured merge checks may read the committed non-secret template `.env.example`, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence with the `Missing:` lines of `akrogon status <slug>`, where an absent or empty value counts as missing, ending the pass with the stop above when a required value is absent.

The merge seat reuses `grants[]` for probes, implementation, repairs, reruns, merge checks and cleanup without asking again; before mutating it compares operation, target and identity with the grant, records the grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under the stop rule. Proof fixtures are cleaned up on success and failure with the cleanup identities in `grants[].fixtures[].cleanup`; absence is proven by `absence_check`, an authenticated read-back, never by a delete reply; leftovers are a blocker recorded with IDs, error, owner and next step; resources in `retained[]` are labelled apart from still-to-delete ones.

## merge

Each registered repo holds one merge turn, and the command batches the leaves waiting behind the holder: it records a batch, builds one stack of the members' branches then the holder's on `<remote>/<default_branch>` in disposable state, moves the live branches to the built tips, and prompts only the holder's B. A `merged`, `merged --check` or `check.fix` call on a leaf whose turn is not held is refused (naming the current holder when one holds it), ending that pass; `failed` is never refused. While a repo hold stands, the hold's named fix leaf takes the turn and is accepted by phase authorization in its place.

The prompt ends `attempt=<id> top=<sha>` for an applied stack with the holder on top, or `attempt=<id> solo` when the holder's own branch cannot be rebased mechanically (it conflicted while the stack was built or restacked) and B rebases it by hand. Every `merged`, `merged --check` and `check.fix` call carries `--attempt <id>`; a stale or missing id is refused and changes nothing, ending the pass.

### attempt top: the worktree is already the stack top

B commits nothing and does not fetch or rebase. The command removed the worktree's empty untracked folders before this prompt; ignored files remain. Refresh `AKROGON_BASE` from `akrogon config`, run every `checks` command not named in `merge_covers`, then every `merge_checks` command, on `HEAD` in the worktree, and record evidence in `review-B.md` under the `leaf=` folder with advisory failures as Nits.

On green checks run `akrogon phase <slug> merged --slot B --check --attempt <id>`, which requires HEAD to equal the recorded top, checks the `Test-Change:` trailers over each carried member's range and over the whole stack, and records the tested top. A refusal names each uncited file; nothing may commit on the recorded top, so the pass ends by routing the gap through `akrogon phase <slug> check.fix --slot B --attempt <id>`; red runs take the base-red hold or leaf-red endings below.

Gather the briefs of every completion owner the batch can close — every issue or epic whose last open leaf the batch lands, not only the holder's own — then run `akrogon phase <slug> merged --slot B --attempt <id>`. The command pushes the tested top fast-forward, moves every carried member to `merged` before the holder, and prints `issue complete <issue>` or `epic complete <epic>` once per owner the batch finishes.

A non-fast-forward refusal restacks the stack onto the new remote tip and prints exactly one line. `reuse tested=<T1-sha> pushed=<T2-sha>` means old and new main are equal outside `issues/` and `learnings/`, the restacked top is equal to the tested top outside them, `issues/config.yaml` is unchanged and the restack had no conflict, so the earlier green run stays valid: copy the printed line into `review-B.md` under the `leaf=` folder, then run `--check`, briefs and `merged` under the same `--attempt <id>` without rerunning the checks. `rerun tested=<T1-sha|none> pushed=<T2-sha>` means the worktree already sits at `<T2-sha>` and fresh checks are required (`none` when no `--check` ran before the refusal): rerun the checks, `--check`, briefs and `merged` under the same `--attempt <id>`; a member that conflicted during the restack was restored to its saved head and excluded from that attempt only, its slug kept on the record. `rerun rebase <slug> onto <sha>` means the holder's own branch no longer fits the new base: fetch, rebase onto `<remote>/<default_branch>` resolving conflicts as in the solo form, then rerun checks, `--check` and `merged`. Any other push error fails the call with its cause; report it rather than retrying.

### attempt solo: B rebases its own leaf

Commit scoped outstanding changes (each scoped commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, and a commit adding a case to an existing test file names what was added and that no existing expectation changed, citing no source, and a path recorded at the `plan.synthesis` to `implement` move that changed or vanished since, or an added `src/test-files.ts`-matched path outside that record, needs the same trailer in the last commit touching it or a later commit, and when no branch commit touches the path, a later trailer-only commit must carry it in trailer text not already on the branch at the implement move), fetch the configured remote, rebase onto `<remote>/<default_branch>`, refresh `AKROGON_BASE` from `akrogon config` after rebase, and run every `checks` command not named in `merge_covers`, then every `merge_checks` command, in the worktree, recording evidence in `review-B.md` under the `leaf=` folder and advisory failures as Nits. The command removed the worktree's empty untracked folders before this prompt; ignored files remain.

On a rebase conflict, resolve it in the worktree keeping both true sides, complete the rebase, and record in `review-B.md` under the `leaf=` folder the rebase target, the prior reviewed head, the resolved head and `git range-diff <old-base>..<prior-head> <target>..<resolved-head>` before running the checks, where old-base is the `AKROGON_BASE` value before the post-rebase refresh.

Same-line index conflicts retain both true entries and recheck pointers. An existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source (a real build, user action or content, integration or attacker-reachable input) that the old expectation contradicts. A test added after planning cites its source in a `Test-Change` trailer. A wrong test exposed by the rebase, its expectation contradicting a brief outcome or a real source, is fixed in its own commit with the reason and the merge continues; a broken default branch discovered by this leaf is fixed forward with failing tests as criteria.

After the rebase resolves, B runs the re-removal one-liner, resolving the helper beside the installed akrogon entry point while operating in the target worktree, and commits the removal as its own scoped commit when the output lists removed histories; `merged --check` refuses a pushed range still holding a retired line.

```
bun -e "const {mergeBase, removeRetiredLessons}=await import(process.argv[1]); const b=await mergeBase(process.cwd(),'<remote>/<default_branch>','HEAD'); const ob=await mergeBase(process.cwd(),'<remote>/<default_branch>','ORIG_HEAD'); const r=await removeRetiredLessons(process.cwd(),b,'HEAD',[{base:ob,head:'ORIG_HEAD'}]); console.log(r.length?r.join('\n'):'none')" "$(dirname "$(readlink -f "$(command -v akrogon)")")/lessons.ts"
```

When the output lists removed histories (`none` means no removal): `git add learnings/LESSONS.md && git commit -m "lessons: retire applied lines"`.

On green checks run `akrogon phase <slug> merged --slot B --check --attempt <id>`; on a trailer refusal B adds a commit carrying the missing trailer when the change has a real source, a trailer-only empty commit when the change sits inside a rebased commit, or reverts the change, then reruns the checks and `--check`.

Then gather the completion owner's briefs (the issue's, or every leaf brief under the epic when the leaf has one) and run `akrogon phase <slug> merged --slot B --attempt <id>`; the command pushes the tested head fast-forward and moves the leaf. `reuse`, `rerun` and `rerun rebase` lines mean the same as in the applied form.

### Shared endings

Red runs and reruns reuse the same filtered set: every `checks` command not named in `merge_covers`, then every `merge_checks` command.

On red checks, judge the base first: a red run with no cause in the stack's diff reruns that same command once, same args and scope, in a detached worktree at `AKROGON_BASE` under the base-run rule from check-issue, and `review-B.md` records both runs and the judged cause before any ending. A base-red run ends with `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <fetched-main-sha> --command <exact command>`: the leaf stays in `merge`, the batch record is cleared without halving and the repo is held against further merge runs until fetched main moves. A `--red-on-base` refusal means fetched main moved: refetch, rerun on the new base and re-judge. A leaf-red run whose cause the evidence attributes to the holder or one carried member writes the finding into that culprit's own `review-B.md` — exact command and arguments, tested base and top, logs, attributed diff and the restored head (the culprit's saved member or holder head) — then calls `akrogon phase <slug> check.fix --slot B --attempt <id> --culprit <slug>`. An unattributed leaf-red run appends each failing command exactly as invoked (command and arguments), its failing output, the rebase target commit and the tested head to `review-B.md` under the `leaf=` folder, calls `akrogon phase <slug> check.fix --slot B --attempt <id>`, and finishes with the actual result and repair footer. With carried members this prints `batch split, holder keeps <n> of <m> members`: the members are restored to their saved heads while the holder keeps the turn under a fresh prompt carrying at most the first half of them, and the pass ends there. With none, the leaf moves to `check.fix` as before.

A local default branch is unnecessary; the command's fast-forward push serializes competing merges. An unchanged successful check run is reused only when neither code nor integration changed.

Each `issue complete` or `epic complete` line the `merged` call prints gets one broadcast-issue run by the merge seat itself in this session with that context and repo worktree — one run per completed standalone issue or whole epic — sent by the merge slot, never by a subagent or another agent, because the tab closes as soon as this pane goes idle after `merged`.

A failed broadcast is visible but leaves the merge complete, while GitHub closure and completed-folder moves belong to the command.

Finish by printing the footer as the last act; the command closes this tab once this pane goes idle or exits after `merged`, a manual sweep or startup cleanup closes any tab a merge left open, and only those sweeps remove the worktree and branch once the issue folder has moved.

## Printed footer

```text
Last operation: <push/check evidence and observed phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>
```

A repair move names `implement-issue <slug> slot=A phase=check.fix leaf=<folder>`; completion uses `Next: none merged`, failure uses `Next: none failed`, and another unresolved error names its actual reason without inventing a state move.
