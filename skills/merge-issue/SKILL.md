---
name: merge-issue
description: Check the rebased merge leaf or rebase a solo leaf in its worktree, run checks, let the command push and move the leaf, gather the completion owner's briefs, and run one broadcast per `issue complete` or `epic complete` line.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Merge issue

The prompt is `merge-issue <slug> slot=B phase=merge leaf=<folder> attempt=<id> top=<sha>` for a leaf the command already rebased, or `... attempt=<id> solo` when B rebases its own leaf; B works in the existing leaf worktree and never runs `git push`.

## Shared context

Read `akrogon config` once, locate the unique leaf under the registered repo's authoritative `issues/open/`, and read its plan, `implementation/report.md` and reviews, using configured `remote` and `default_branch` (defaults `origin` and `main`).

Pass artifacts are written under the `leaf=` folder while code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`.

Temp files and logs go under `$TMPDIR`, never a fixed `/tmp/<name>`; the full check set runs only through `akrogon verify`; anything needed later goes in the leaf folder.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

The command owns state, repair counts, dispatch and the push; a resumed merge inspects the existing rebase, diff and remote ancestry to complete remaining work.

The merge seat completes the pass from its own reads and commands, requesting nothing and stalling for nothing. When a step physically requires the operator (a permission B cannot grant, an env value B cannot obtain), B writes the blocker into `review-B.md` with its name or ID, the attempted operation, the identity it used, the observed error, the owner and the exact operator action, never a value, under the `leaf=` folder, runs `akrogon phase <slug> failed --reason "<blocker; see review-B.md>" --slot B`, and ends the pass. A review finding whose fix needs operator access follows the operator-only rule in check-issue Shared context. This stop covers only blockers only the operator can clear; rebase conflicts, red checks, and push handling below are unchanged.

The merge seat never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, except that configured merge checks may read the committed non-secret template `.env.example`, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence with the `Missing:` lines of `akrogon status <slug>`, where an absent or empty value counts as missing, ending the pass with the stop above when a required value is absent.

The merge seat reuses `grants[]` for probes, implementation, repairs, reruns, merge checks and cleanup without asking again; before mutating it compares operation, target and identity with the grant, records the grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under the stop rule. Proof fixtures are cleaned up on success and failure with the cleanup identities in `grants[].fixtures[].cleanup`; absence is proven by `absence_check`, an authenticated read-back, never by a delete reply; leftovers are a blocker recorded with IDs, error, owner and next step; resources in `retained[]` are labelled apart from still-to-delete ones.

## merge

Each registered repo holds one merge turn and merges one leaf at a time: the command records a batch on the holder, rebases its branch onto `<remote>/<default_branch>` in disposable state, moves the live branch to the rebased top, and prompts only the holder's B. A `merged`, `merged --check` or `check.fix` call on a leaf whose turn is not held is refused (naming the current holder when one holds it), ending that pass; `failed` is never refused.

The prompt ends `attempt=<id> top=<sha>` for a rebased branch, or `attempt=<id> solo` when the branch cannot be rebased mechanically (a conflict or a dirty worktree) and B rebases it by hand. Every `merged`, `merged --check` and `check.fix` call carries `--attempt <id>`; a stale or missing id is refused and changes nothing, ending the pass.

### attempt top: the worktree is already rebased

B does not fetch or rebase, and commits nothing except the repair below. B runs `akrogon verify --attempt <id>` in the worktree, which checks `HEAD` out fresh, runs every `checks` command not named in `merge_covers`, then every `merge_checks` command, and writes the receipt `merged --check` requires, then records its output in `review-B.md` under the `leaf=` folder with advisory failures as Nits.

On a green verify run `akrogon phase <slug> merged --slot B --check --attempt <id>`, which requires a green merge receipt for HEAD under the current config and HEAD to descend from the recorded top, checks the `Test-Change:` trailers over the pushed range, and records the tested top. A refusal names each uncited file and is fixed as the solo form fixes it; red runs take the endings under Shared endings.

B may fix a mechanical red in place before `merged --check`: generator output, lint, a schema or version bump, or re-recording. The check-issue repair exceptions apply: no test expectation correction, no locked brief or design change, no new or widened live action. B commits the repair in the worktree under the solo trailer rule, so a re-record or any repair touching a test file carries its `Test-Change:` trailers, and a trailer refusal on this top is fixed as the solo form fixes it, then `--check` reruns. B then reruns `akrogon verify --attempt <id>` green on the repaired head and records it in `review-B.md`. A second red on the same command or unit ends with `akrogon phase <slug> check.fix --slot B --attempt <id>`.

Gather the completion owner's briefs (the issue's, or every leaf brief under the epic when the leaf has one), then run `akrogon phase <slug> merged --slot B --attempt <id>`. The command pushes the tested head fast-forward, moves the leaf to `merged`, and prints `issue complete <issue>` or `epic complete <epic>` when it finishes the owner.

A non-fast-forward refusal rebases the leaf onto the new remote tip and prints exactly one line. `rerun tested=<T1-sha|none> pushed=<T2-sha>` means the worktree already sits at `<T2-sha>`, and the push needs a green receipt for that tree (`none` when no `--check` ran before the refusal): rerun `akrogon verify --attempt <id>`, which reuses a receipt only for an identical tree, `--check`, briefs and `merged` under the same `--attempt <id>`. `rerun rebase <slug> onto <sha>` means the branch no longer fits the new base or its worktree is dirty: fetch, rebase onto `<remote>/<default_branch>` resolving conflicts as in the solo form, then rerun `akrogon verify --attempt <id>`, `--check` and `merged`. Any other push error fails the call with its cause; report it rather than retrying.

### attempt solo: B rebases its own leaf

Commit scoped outstanding changes (each scoped commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, and a commit adding a case to an existing test file names what was added and that no existing expectation changed, citing no source, and a path recorded at the `plan.synthesis` to `implement` move that changed or vanished since, or an added `src/test-files.ts`-matched path outside that record, needs the same trailer in the last commit touching it or a later commit, and when no branch commit touches the path, a later trailer-only commit must carry it on a commit new since the record, a replayed planning-era trailer does not count), fetch the configured remote, rebase onto `<remote>/<default_branch>`, and run `akrogon verify --attempt <id>` in the worktree, recording its output in `review-B.md` under the `leaf=` folder and advisory failures as Nits.

On a rebase conflict, resolve it in the worktree keeping both true sides, complete the rebase, and record in `review-B.md` under the `leaf=` folder the rebase target, the prior reviewed head, the resolved head and `git range-diff <old-base>..<prior-head> <target>..<resolved-head>` before running the checks, where old-base is the `AKROGON_BASE` value before the post-rebase refresh.

Same-line index conflicts retain both true entries and recheck pointers. An existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source (a real build, user action or content, integration or attacker-reachable input) that the old expectation contradicts. A test added after planning cites its source in a `Test-Change` trailer. B corrects no test expectation at merge. A wrong expectation exposed by the rebase goes to A through `check.fix` under Shared endings.

After the rebase resolves, B runs the re-removal one-liner, resolving the helper beside the installed akrogon entry point while operating in the target worktree, and commits the removal as its own scoped commit when the output lists removed histories; `merged --check` refuses a pushed range still holding a retired line.

```
bun -e "const {mergeBase, removeRetiredLessons}=await import(process.argv[1]); const b=await mergeBase(process.cwd(),'<remote>/<default_branch>','HEAD'); const ob=await mergeBase(process.cwd(),'<remote>/<default_branch>','ORIG_HEAD'); const r=await removeRetiredLessons(process.cwd(),b,'HEAD',[{base:ob,head:'ORIG_HEAD'}]); console.log(r.length?r.join('\n'):'none')" "$(dirname "$(readlink -f "$(command -v akrogon)")")/lessons.ts"
```

When the output lists removed histories (`none` means no removal): `git add learnings/LESSONS.md && git commit -m "lessons: retire applied lines"`.

On green checks run `akrogon phase <slug> merged --slot B --check --attempt <id>`; on a trailer refusal B adds a commit carrying the missing trailer when the change has a real source, a trailer-only empty commit when the change sits inside a rebased commit, or reverts the change, then reruns `akrogon verify --attempt <id>` and `--check`.

Then gather the completion owner's briefs (the issue's, or every leaf brief under the epic when the leaf has one) and run `akrogon phase <slug> merged --slot B --attempt <id>`; the command pushes the tested head fast-forward and moves the leaf. `rerun` and `rerun rebase` lines mean the same as in the applied form.

### Shared endings

Every run and rerun is `akrogon verify --attempt <id>`, whose receipt lists each command with its exit and log.

On a red verify, judge the cause. A red run with no cause in the leaf's diff gets one rerun of `akrogon verify --attempt <id>` on the unchanged head: a green rerun is `inconsistent`, recorded in `review-B.md` with both logs, and goes on to `merged --check`; a red rerun takes the ending below, with `review-B.md` recording the runs and the judged cause first. A red run appends each failing command exactly as invoked (command and arguments), its failing output, the rebase target commit and the tested head to `review-B.md` under the `leaf=` folder, calls `akrogon phase <slug> check.fix --slot B --attempt <id>`, which moves the leaf to `check.fix` so A corrects it, including any wrong expectation in its own done-criteria under test-proof-rules, and finishes with the actual result and repair footer.

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
